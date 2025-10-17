import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  ArrowLeft,
  Send,
  Download,
  Loader,
  Reply,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useEmailProviders } from '../hooks/useEmailLogs';
import { useSendEmail, useEmailThread } from '../hooks/useEmailManagement';
import { useToast } from '../contexts/ToastContext';

const EmailDetailPage: React.FC = () => {
  const { emailId } = useParams<{ emailId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const sendEmailMutation = useSendEmail();
  const { data: providers } = useEmailProviders();

  const [showReplySection, setShowReplySection] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // 'asc' = oldest first, 'desc' = newest first
  const [replyingToMessageId, setReplyingToMessageId] = useState<string | null>(null); // Track which message is being replied to

  // Get email data from location state (passed from CommunicationPage)
  const location = window.history.state?.usr;
  const selectedEmail = location?.email;
  const selectedProvider = location?.providerId;

  // Find the provider details to get the type
  const provider = providers?.find(p => p.id === selectedProvider);
  const providerType = provider?.type;

  // Fetch thread messages if threadId exists (only for Gmail)
  const { data: threadData, isLoading: threadLoading } = useEmailThread(
    selectedEmail?.threadId,
    selectedProvider,
    providerType
  );

  // Reply form state
  const [replyForm, setReplyForm] = useState({
    providerId: selectedProvider || '',
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    content: '',
  });

  // Helper function to check if HTML content is empty
  const isContentEmpty = (htmlContent: string): boolean => {
    const strippedContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    return !strippedContent;
  };

  // Helper function to reset reply form
  const resetReplyForm = () => {
    setReplyForm({
      providerId: selectedProvider || '',
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      content: '',
    });
  };

  // Helper function to initialize reply form with email data
  const initializeReplyForm = (email: any, messageId?: string) => {
    // For sent messages, reply to the original recipient
    // For received messages, reply to the sender
    const isSentMessage = email.type === 'sent' || email.labelIds?.includes('SENT');
    const recipientEmail = isSentMessage ? (email.to || email.recipient) : (email.from || email.sender);
    
    const subject = email.subject?.startsWith('Re:')
      ? email.subject
      : `Re: ${email.subject || '(No Subject)'}`;

    setReplyForm({
      providerId: selectedProvider || '',
      to: recipientEmail || '',
      cc: email.cc || '',
      bcc: '',
      subject: subject,
      content: '',
    });
    
    // Set the message being replied to
    if (messageId) {
      setReplyingToMessageId(messageId);
    }
  };

  // Initialize reply form when component mounts or reply section opens
  React.useEffect(() => {
    if (showReplySection && selectedEmail) {
      initializeReplyForm(selectedEmail, selectedEmail.id);
    }
  }, [showReplySection, selectedEmail]);

  // Toggle message expansion
  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Expand all messages
  const expandAllMessages = () => {
    if (threadData?.messages) {
      setExpandedMessages(new Set(threadData.messages.map((msg: any) => msg.id)));
    }
  };

  // Collapse all messages
  const collapseAllMessages = () => {
    setExpandedMessages(new Set());
  };

  // Auto-expand the most recent message on load
  React.useEffect(() => {
    if (threadData?.messages && threadData.messages.length > 0) {
      const lastMessage = threadData.messages[threadData.messages.length - 1];
      setExpandedMessages(new Set([lastMessage.id]));
    }
  }, [threadData]);

  // Helper function to get sorted messages based on sortOrder
  const getSortedMessages = () => {
    if (!threadData?.messages) return [];
    
    const messages = [...threadData.messages];
    if (sortOrder === 'desc') {
      // Newest first - reverse the array
      return messages.reverse();
    }
    // Oldest first - keep original order
    return messages;
  };

  // Helper function to handle reply to specific message
  const handleReplyToMessage = (message: any) => {
    initializeReplyForm(message, message.id);
    setShowReplySection(true);
    // Scroll to reply section
    setTimeout(() => {
      const replySection = document.getElementById('reply-section');
      if (replySection) {
        replySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Redirect back if no email data
  if (!selectedEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Not Found</h2>
          <p className="text-gray-600 mb-6">The email you're looking for could not be found.</p>
          <button
            onClick={() => navigate('/communication')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Communication
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => navigate('/communication')}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {selectedEmail.subject || '(No Subject)'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedEmail.type === 'sent' || selectedEmail.type === 'outbound' ? 'Sent' : 'Received'} on{' '}
                  {new Date(selectedEmail.date || selectedEmail.sentAt || selectedEmail.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Reply/Follow-up Button in Header */}
            <button
              onClick={() => {
                if (!showReplySection) {
                  handleReplyToMessage(selectedEmail);
                } else {
                  setShowReplySection(false);
                  setReplyingToMessageId(null);
                  resetReplyForm();
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Reply className="w-4 h-4" />
              <span>
                {showReplySection 
                  ? 'Hide Reply' 
                  : (selectedEmail.type === 'sent' || selectedEmail.type === 'outbound' 
                      ? 'Follow up' 
                      : 'Reply')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Email Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Details</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">From</span>
                  <p className="text-sm text-gray-900 break-all">{selectedEmail.from || selectedEmail.sender}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">To</span>
                  <p className="text-sm text-gray-900 break-all">{selectedEmail.to || selectedEmail.recipient}</p>
                </div>
                {selectedEmail.cc && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">CC</span>
                    <p className="text-sm text-gray-900 break-all">{selectedEmail.cc}</p>
                  </div>
                )}
                {selectedEmail.bcc && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">BCC</span>
                    <p className="text-sm text-gray-900 break-all">{selectedEmail.bcc}</p>
                  </div>
                )}
                {selectedEmail.isRead !== undefined && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Status</span>
                    <p className="text-sm text-gray-900">{selectedEmail.isRead ? 'Read' : 'Unread'}</p>
                  </div>
                )}
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Attachments</span>
                    <div className="mt-2 space-y-2">
                      {selectedEmail.attachments.map((attachment: any, index: number) => (
                        <div key={index} className="text-sm text-gray-900 flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                          <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate">{attachment.filename}</p>
                            {attachment.size && (
                              <span className="text-gray-400 text-xs">
                                {(attachment.size / 1024).toFixed(1)} KB
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEmail.sizeEstimate && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Size</span>
                    <p className="text-sm text-gray-900">
                      {(selectedEmail.sizeEstimate / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
                {selectedEmail.deliveredAt && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Delivered</span>
                    <p className="text-sm text-gray-900">{new Date(selectedEmail.deliveredAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedEmail.failedReason && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Error</span>
                    <p className="text-sm text-red-600">{selectedEmail.failedReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Thread Messages and Reply */}
          <div className="lg:col-span-3 space-y-6">
            {/* Thread Loading State */}
            {threadLoading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 flex justify-center">
                <Loader className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            )}

            {/* Thread Messages */}
            {!threadLoading && threadData?.messages && threadData.messages.length > 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                  <h3 className="text-lg font-bold text-gray-900">
                    Conversation ({threadData.totalMessages} {threadData.totalMessages === 1 ? 'message' : 'messages'})
                  </h3>
                  <div className="flex gap-2 items-center flex-wrap">
                    {/* Sort Dropdown */}
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="asc">Oldest First</option>
                      <option value="desc">Newest First</option>
                    </select>
                    <button
                      onClick={expandAllMessages}
                      className="text-sm text-purple-600 hover:text-purple-700 px-3 py-1 rounded hover:bg-purple-50 transition-colors"
                    >
                      Expand All
                    </button>
                    <button
                      onClick={collapseAllMessages}
                      className="text-sm text-gray-600 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {getSortedMessages().map((message: any, index: number) => {
                    const isExpanded = expandedMessages.has(message.id);
                    const sortedMessages = getSortedMessages();
                    const isLastMessage = index === sortedMessages.length - 1;
                    
                    return (
                      <div
                        key={message.id}
                        className={`border rounded-lg overflow-hidden transition-all ${
                          isLastMessage ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200'
                        }`}
                      >
                        {/* Message Header - Always Visible */}
                        <div
                          onClick={() => toggleMessageExpansion(message.id)}
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-semibold text-gray-900">
                                {message.from}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                message.type === 'sent' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {message.type === 'sent' ? 'Sent' : 'Received'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              To: {message.to}
                            </p>
                            {!isExpanded && (
                              <p className="text-sm text-gray-500 truncate mt-1">
                                {message.snippet}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <span className="text-sm text-gray-500 whitespace-nowrap">
                              {new Date(message.date).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* Message Body - Expandable */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 p-4 bg-white">
                            {message.cc && (
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Cc:</span> {message.cc}
                              </p>
                            )}
                            
                            <div className="mt-4">
                              {(() => {
                                const htmlContent = message.bodyHtml || message.body;
                                const textContent = message.bodyText;

                                if (htmlContent && htmlContent.trim() !== '') {
                                  try {
                                    let cleanHtml = htmlContent.replace(
                                      /<meta[^>]*viewport[^>]*>/gi,
                                      '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
                                    );
                                    
                                    if (cleanHtml.includes('<head>')) {
                                      cleanHtml = cleanHtml.replace(
                                        /<head>/i,
                                        '<head><base target="_blank">'
                                      );
                                    } else if (cleanHtml.includes('<html>')) {
                                      cleanHtml = cleanHtml.replace(
                                        /<html[^>]*>/i,
                                        '$&<head><base target="_blank"></head>'
                                      );
                                    } else {
                                      cleanHtml = '<head><base target="_blank"></head>' + cleanHtml;
                                    }

                                    return (
                                      <iframe
                                        srcDoc={cleanHtml}
                                        className="w-full border-0 rounded-lg"
                                        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
                                        title={`Email Content - Message ${index + 1}`}
                                        style={{ height: '400px', minHeight: '300px', colorScheme: 'light' }}
                                      />
                                    );
                                  } catch (error) {
                                    console.error('Error rendering HTML email:', error);
                                  }
                                }

                                if (textContent && textContent.trim() !== '') {
                                  return (
                                    <div className="text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap border border-gray-200">
                                      {textContent}
                                    </div>
                                  );
                                }

                                return (
                                  <div className="text-gray-500 bg-gray-50 p-4 rounded-lg text-center italic">
                                    No content available
                                  </div>
                                );
                              })()}
                            </div>

                            {message.hasAttachments && message.attachments?.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                  Attachments ({message.attachments.length})
                                </p>
                                <div className="space-y-2">
                                  {message.attachments.map((attachment: any, i: number) => (
                                    <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                                      <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{attachment.filename}</p>
                                        {attachment.size && (
                                          <span className="text-gray-400 text-xs">
                                            {(attachment.size / 1024).toFixed(1)} KB
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Reply Button for each message */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => handleReplyToMessage(message)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                  replyingToMessageId === message.id && showReplySection
                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                <Reply className="w-4 h-4" />
                                <span>
                                  {replyingToMessageId === message.id && showReplySection
                                    ? (message.type === 'sent' 
                                        ? 'Following up on this message' 
                                        : 'Replying to this message')
                                    : (message.type === 'sent' 
                                        ? 'Follow up on this message' 
                                        : 'Reply to this message')}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Single Message View (when no thread or only 1 message) */}
            {!threadLoading && (!threadData?.messages || threadData.messages.length <= 1) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Message</h3>
                <div>
                  {(() => {
                    const htmlContent = selectedEmail.bodyHtml || selectedEmail.body;
                    const textContent = selectedEmail.bodyText;
                    const snippetContent = selectedEmail.snippet;

                    // Try HTML content first
                    if (htmlContent && htmlContent.trim() !== '') {
                      try {
                        // Sanitize HTML to remove problematic meta tags and add base target
                        let cleanHtml = htmlContent.replace(
                          /<meta[^>]*viewport[^>]*>/gi,
                          '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
                        );
                        
                        // Add base tag to head to force all links to open in new window
                        if (cleanHtml.includes('<head>')) {
                          cleanHtml = cleanHtml.replace(
                            /<head>/i,
                            '<head><base target="_blank">'
                          );
                        } else if (cleanHtml.includes('<html>')) {
                          cleanHtml = cleanHtml.replace(
                            /<html[^>]*>/i,
                            '$&<head><base target="_blank"></head>'
                          );
                        } else {
                          cleanHtml = '<head><base target="_blank"></head>' + cleanHtml;
                        }

                        return (
                          <div className="mb-6">
                            <iframe
                              srcDoc={cleanHtml}
                              className="w-full border-0 rounded-lg"
                              sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
                              title="Email Content"
                              style={{ height: 'calc(100vh - 250px)', minHeight: '600px', colorScheme: 'light' }}
                            />
                          </div>
                        );
                      } catch (error) {
                        console.error('Error rendering HTML email:', error);
                      }
                    }

                    // Fallback to plain text
                    if (textContent && textContent.trim() !== '') {
                      return (
                        <div className="mb-6 text-gray-900 bg-gray-50 p-6 rounded-lg whitespace-pre-wrap border border-gray-200">
                          {textContent}
                        </div>
                      );
                    }

                    // Fallback to snippet
                    if (snippetContent && snippetContent.trim() !== '') {
                      return (
                        <div className="mb-6 text-gray-900 bg-gray-50 p-6 rounded-lg whitespace-pre-wrap border border-gray-200">
                          {snippetContent}
                        </div>
                      );
                    }

                    // No content available
                    return (
                      <div className="mb-6 text-gray-500 bg-gray-50 p-6 rounded-lg text-center italic py-20">
                        No content available
                      </div>
                    );
                  })()}

                  {/* Reply Button for Single Message */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleReplyToMessage(selectedEmail)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        replyingToMessageId === selectedEmail.id && showReplySection
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Reply className="w-4 h-4" />
                      <span>
                        {replyingToMessageId === selectedEmail.id && showReplySection
                          ? (selectedEmail.type === 'sent' || selectedEmail.type === 'outbound'
                              ? 'Following up on this message' 
                              : 'Replying to this message')
                          : (selectedEmail.type === 'sent' || selectedEmail.type === 'outbound'
                              ? 'Follow up on this message' 
                              : 'Reply to this message')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reply Section */}
            {showReplySection && (
              <div id="reply-section" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Reply</h3>
                  {replyingToMessageId && (
                    <span className="text-sm text-gray-600 bg-purple-50 px-3 py-1 rounded-full">
                      {threadData?.messages 
                        ? `Replying to message from ${getSortedMessages().find(m => m.id === replyingToMessageId)?.from || 'sender'}`
                        : `Replying to message from ${selectedEmail?.from || selectedEmail?.sender || 'sender'}`
                      }
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  {/* Provider Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Send From <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={replyForm.providerId}
                      onChange={(e) => setReplyForm({ ...replyForm, providerId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">Select email account</option>
                      {providers?.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name} ({provider.fromEmail})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* To Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={replyForm.to}
                      onChange={(e) => setReplyForm({ ...replyForm, to: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="recipient@example.com"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                  </div>

                  {/* CC Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CC (Optional)
                    </label>
                    <input
                      type="text"
                      value={replyForm.cc}
                      onChange={(e) => setReplyForm({ ...replyForm, cc: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="cc@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                  </div>

                  {/* BCC Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BCC (Optional)
                    </label>
                    <input
                      type="text"
                      value={replyForm.bcc}
                      onChange={(e) => setReplyForm({ ...replyForm, bcc: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="bcc@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={replyForm.subject}
                      onChange={(e) => setReplyForm({ ...replyForm, subject: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Subject"
                      required
                    />
                  </div>

                  {/* Message Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Reply <span className="text-red-500">*</span>
                    </label>
                    <ReactQuill
                      value={replyForm.content}
                      onChange={(value) => setReplyForm({ ...replyForm, content: value })}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                          [{ 'color': [] }, { 'background': [] }],
                          ['link'],
                          ['clean']
                        ],
                      }}
                      className="bg-white"
                      theme="snow"
                      placeholder="Type your reply here..."
                      style={{ minHeight: '200px' }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowReplySection(false);
                        setReplyingToMessageId(null);
                        resetReplyForm();
                      }}
                      className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        // Validation
                        if (!replyForm.providerId) {
                          addToast({ type: 'error', title: 'Please select an email account' });
                          return;
                        }
                        if (!replyForm.to.trim()) {
                          addToast({ type: 'error', title: 'Please enter recipient email' });
                          return;
                        }
                        if (!replyForm.subject.trim()) {
                          addToast({ type: 'error', title: 'Please enter a subject' });
                          return;
                        }
                        if (isContentEmpty(replyForm.content)) {
                          addToast({ type: 'error', title: 'Please enter a reply message' });
                          return;
                        }

                        try {
                          // Parse multiple recipients
                          const toEmails = replyForm.to.split(',').map(email => email.trim()).filter(email => email);
                          const ccEmails = replyForm.cc ? replyForm.cc.split(',').map(email => email.trim()).filter(email => email) : undefined;
                          const bccEmails = replyForm.bcc ? replyForm.bcc.split(',').map(email => email.trim()).filter(email => email) : undefined;

                          await sendEmailMutation.mutateAsync({
                            providerId: replyForm.providerId,
                            to: toEmails,
                            cc: ccEmails,
                            bcc: bccEmails,
                            subject: replyForm.subject,
                            content: replyForm.content,
                            threadId: selectedEmail.threadId, // Include Gmail thread ID for replies
                            replyToMessageId: replyingToMessageId || selectedEmail.id, // Use the specific message being replied to
                          });

                          addToast({ type: 'success', title: 'Reply sent successfully!' });
                          setShowReplySection(false);
                          setReplyingToMessageId(null);
                          resetReplyForm();
                        } catch (error) {
                          console.error('Failed to send reply:', error);
                          addToast({ type: 'error', title: 'Failed to send reply' });
                        }
                      }}
                      disabled={sendEmailMutation.isPending || !replyForm.providerId || !replyForm.to.trim() || !replyForm.subject.trim() || isContentEmpty(replyForm.content)}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {sendEmailMutation.isPending ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDetailPage;
