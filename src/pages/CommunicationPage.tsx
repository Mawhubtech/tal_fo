import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Mail, 
  Send,
  Inbox,
  Search, 
  Filter, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader,
  Eye,
  Download
} from 'lucide-react';
import { useEmailProviders, useProviderMessages } from '../hooks/useEmailLogs';
import { useAuthContext } from '../contexts/AuthContext';
import { EmailLogFilters, EmailProvider } from '../services/emailLogApiService';
import { useSendEmail } from '../hooks/useEmailManagement';
import { useToast } from '../contexts/ToastContext';

const CommunicationPage: React.FC = () => {
  const { user } = useAuthContext();
  const { addToast } = useToast();
  const sendEmailMutation = useSendEmail();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  
  // Compose email form state
  const [emailForm, setEmailForm] = useState({
    providerId: '',
    to: '',
    cc: '',
    subject: '',
    content: '', // HTML content from Quill
  });

  // Helper function to check if HTML content is empty
  const isContentEmpty = (htmlContent: string): boolean => {
    const strippedContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    return !strippedContent;
  };
  
  const [filters, setFilters] = useState<EmailLogFilters>({
    page: 1,
    limit: 20,
    type: 'all',
    sortBy: 'sentAt',
  });

  // Fetch connected email providers
  const { data: providers, isLoading: providersLoading } = useEmailProviders();

  // Set default provider when providers load
  React.useEffect(() => {
    if (providers && providers.length > 0 && !selectedProvider) {
      const defaultProvider = providers.find(p => p.isDefault) || providers[0];
      setSelectedProvider(defaultProvider.id);
    }
  }, [providers, selectedProvider]);

  // Reset filters when provider changes
  React.useEffect(() => {
    if (selectedProvider) {
      setFilters({
        page: 1,
        limit: 20,
        type: 'all',
        sortBy: 'sentAt',
      });
    }
  }, [selectedProvider]);

  // Fetch emails from selected provider with auto-refresh every 30 seconds
  const { 
    data: emailLogsData, 
    isLoading, 
    error,
    refetch 
  } = useProviderMessages(selectedProvider || '', filters, {
    refetchInterval: selectedProvider ? 30000 : false // Only refresh if provider selected
  });

  const emails = emailLogsData?.data || [];
  const totalEmails = emailLogsData?.total || 0;
  const totalPages = emailLogsData?.totalPages || 1;

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const handleFilterChange = (newFilters: Partial<EmailLogFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleViewEmail = (email: any) => {
    setSelectedEmail(email);
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    const providerToUse = emailForm.providerId || selectedProvider;
    
    if (!providerToUse) {
      addToast({ type: 'error', title: 'No provider selected' });
      return;
    }

    // Check if content is empty (Quill returns '<p><br></p>' for empty editor)
    const strippedContent = emailForm.content.replace(/<[^>]*>/g, '').trim();
    
    if (!emailForm.to || !emailForm.subject || !strippedContent) {
      addToast({ type: 'error', title: 'Please fill in all required fields' });
      return;
    }

    try {
      const toEmails = emailForm.to.split(',').map(email => email.trim()).filter(email => email);
      const ccEmails = emailForm.cc ? emailForm.cc.split(',').map(email => email.trim()).filter(email => email) : [];

      // Send HTML email - the content from Quill is already HTML
      await sendEmailMutation.mutateAsync({
        providerId: providerToUse,
        to: toEmails,
        cc: ccEmails.length > 0 ? ccEmails : undefined,
        subject: emailForm.subject,
        content: emailForm.content, // HTML content from Quill editor
      });

      addToast({ type: 'success', title: 'Email sent successfully!' });
      setShowComposeModal(false);
      setEmailForm({ providerId: '', to: '', cc: '', subject: '', content: '' });
      refetch(); // Refresh the email list
    } catch (error: any) {
      addToast({ 
        type: 'error', 
        title: 'Failed to send email',
        message: error.response?.data?.message || 'Please try again'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading && !emails.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader className="h-6 w-6 animate-spin text-purple-600" />
          <span className="text-gray-600">Loading communications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Communications</h2>
          <p className="text-gray-600 mb-4">Failed to load email communications. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-white border-2 border-purple-500 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Email Communications</h1>
            <p className="text-sm text-gray-600">View emails from your connected email accounts</p>
          </div>
          
          {/* Actions and Provider Selector */}
          <div className="flex items-center gap-3">
            {/* Send Email Button */}
            <button
              onClick={() => {
                // Set default provider when opening compose modal
                const defaultProvider = selectedProvider || (providers && providers.length > 0 ? providers[0].id : '');
                setEmailForm({ providerId: defaultProvider, to: '', cc: '', subject: '', content: '' });
                setShowComposeModal(true);
              }}
              disabled={!providers || providers.length === 0}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              <span className="font-medium">Send Email</span>
            </button>

            {/* Email Provider Selector */}
            {providersLoading ? (
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-xs text-gray-500">Loading providers...</span>
              </div>
            ) : providers && providers.length > 0 ? (
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                <select
                  value={selectedProvider || ''}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-sm font-medium"
                >
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} ({provider.type.toUpperCase()})
                      {provider.isDefault && ' - Default'}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                No email providers connected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by subject, recipient, or sender..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 w-full text-sm"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader className="h-4 w-4 text-purple-500 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filters.type || 'all'}
              onChange={(e) => handleFilterChange({ type: e.target.value as any })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-sm"
            >
              <option value="all">All Emails</option>
              <option value="sent">Sent</option>
              <option value="inbox">Inbox</option>
            </select>

            <button
              onClick={handleSearch}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2 text-sm"
            >
              <Filter className="h-4 w-4" />
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {totalEmails} {totalEmails === 1 ? 'Email' : 'Emails'} Found
          </h2>
          {totalPages > 1 && (
            <div className="text-sm text-gray-600">
              Page {filters.page} of {totalPages}
            </div>
          )}
        </div>

        {emails.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <>
            {/* Email List */}
            <div className="divide-y divide-gray-200">
              {emails.map((email) => (
                <div 
                  key={email.id} 
                  className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewEmail(email)}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Email Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {email.type === 'sent' ? (
                          <Send className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Inbox className="w-4 h-4 text-purple-500" />
                        )}
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {email.subject || '(No Subject)'}
                        </h3>
                        {!email.isRead && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Unread
                          </span>
                        )}
                        {email.type === 'received' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Received
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {email.type === 'sent' ? 'To:' : 'From:'}
                          </span>
                          <span className="truncate">
                            {email.type === 'sent' ? email.to : email.from}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(email.date)}</span>
                        </div>
                      </div>
                      {email.snippet && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {email.snippet}
                        </p>
                      )}
                    </div>

                    {/* Right: Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewEmail(email);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View Email"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((filters.page || 1) - 1) * (filters.limit || 20) + 1} to {Math.min((filters.page || 1) * (filters.limit || 20), totalEmails)} of {totalEmails}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange((filters.page || 1) - 1)}
                    disabled={filters.page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1.5 rounded-lg text-sm ${
                            filters.page === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange((filters.page || 1) + 1)}
                    disabled={filters.page === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Email Detail Modal */}
      {showEmailModal && selectedEmail && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full h-[80vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Email Details</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {selectedEmail.type === 'sent' || selectedEmail.type === 'outbound' ? 'Sent' : 'Received'} on {new Date(selectedEmail.date || selectedEmail.sentAt || selectedEmail.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col lg:flex-row overflow-hidden" style={{ height: 'calc(80vh - 100px)' }}>
              {/* Email Meta Information - Left Sidebar */}
              <div className="lg:w-80 border-r border-gray-200 p-6 overflow-y-auto bg-gray-50">
                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Details</h4>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedEmail.subject || '(No Subject)'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedEmail.from || selectedEmail.sender}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedEmail.to || selectedEmail.recipient}</p>
                  </div>
                  {selectedEmail.cc && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CC</span>
                      <p className="text-sm text-gray-900 mt-1">{selectedEmail.cc}</p>
                    </div>
                  )}
                  {selectedEmail.bcc && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">BCC</span>
                      <p className="text-sm text-gray-900 mt-1">{selectedEmail.bcc}</p>
                    </div>
                  )}
                  {selectedEmail.isRead !== undefined && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Read</span>
                      <p className="text-sm text-gray-900 mt-1">{selectedEmail.isRead ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attachments</span>
                      <div className="mt-2 space-y-2">
                        {selectedEmail.attachments.map((attachment: any, index: number) => (
                          <div key={index} className="text-sm text-gray-900 flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                            <Download className="w-4 h-4 text-gray-400" />
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
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Size</span>
                      <p className="text-sm text-gray-900 mt-1">
                        {(selectedEmail.sizeEstimate / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  )}
                  {selectedEmail.deliveredAt && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivered</span>
                      <p className="text-sm text-gray-900 mt-1">{new Date(selectedEmail.deliveredAt).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedEmail.failedReason && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Error</span>
                      <p className="text-sm text-red-600 mt-1">{selectedEmail.failedReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Body - Right Content Area */}
              <div className="flex-1 p-6 bg-white flex flex-col">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Message</h4>
                {(() => {
                  const htmlContent = selectedEmail.bodyHtml || selectedEmail.body;
                  const textContent = selectedEmail.bodyText;
                  const snippetContent = selectedEmail.snippet;

                  // Try HTML content first
                  if (htmlContent && htmlContent.trim() !== '') {
                    try {
                      // Sanitize HTML to remove problematic meta tags that cause console warnings
                      const cleanHtml = htmlContent.replace(
                        /<meta[^>]*viewport[^>]*>/gi,
                        '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
                      );
                      
                      return (
                        <div className="flex-1 h-full">
                          <iframe
                            srcDoc={cleanHtml}
                            className="w-full h-full border-0 rounded-lg"
                            sandbox="allow-same-origin"
                            title="Email Content"
                            style={{ colorScheme: 'light' }}
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
                      <div className="flex-1 text-gray-900 bg-white p-6 rounded-lg whitespace-pre-wrap border border-gray-200 overflow-y-auto">
                        {textContent}
                      </div>
                    );
                  }
                  
                  // Fallback to snippet
                  if (snippetContent && snippetContent.trim() !== '') {
                    return (
                      <div className="flex-1 text-gray-900 bg-white p-6 rounded-lg whitespace-pre-wrap border border-gray-200 overflow-y-auto">
                        {snippetContent}
                      </div>
                    );
                  }
                  
                  // No content available
                  return (
                    <div className="text-gray-500 bg-gray-50 p-6 rounded-lg text-center italic">
                      No content available
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Compose Email Modal */}
      {showComposeModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Compose Email</h3>
                </div>
                <button
                  onClick={() => {
                    setShowComposeModal(false);
                    setEmailForm({ providerId: '', to: '', cc: '', subject: '', content: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                {/* Provider Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Send From: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={emailForm.providerId}
                    onChange={(e) => setEmailForm({ ...emailForm, providerId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 bg-white"
                  >
                    <option value="">Select email account...</option>
                    {providers?.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}{provider.fromEmail ? ` (${provider.fromEmail})` : ''}
                      </option>
                    ))}
                  </select>
                  {emailForm.providerId && providers?.find(p => p.id === emailForm.providerId)?.fromEmail && (
                    <p className="mt-2 text-xs text-gray-500">
                      Your email will be sent from {providers.find(p => p.id === emailForm.providerId)?.fromEmail}
                    </p>
                  )}
                </div>

                {/* To Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailForm.to}
                    onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                    placeholder="recipient@example.com (separate multiple emails with commas)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* CC Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CC: <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={emailForm.cc}
                    onChange={(e) => setEmailForm({ ...emailForm, cc: e.target.value })}
                    placeholder="cc@example.com (separate multiple emails with commas)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    placeholder="Email subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Content Field with React Quill */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message: <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-purple-500">
                    <ReactQuill
                      theme="snow"
                      value={emailForm.content}
                      onChange={(value) => setEmailForm({ ...emailForm, content: value })}
                      placeholder="Type your message here..."
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          [{ 'color': [] }, { 'background': [] }],
                          [{ 'align': [] }],
                          ['link'],
                          ['clean']
                        ],
                      }}
                      formats={[
                        'header',
                        'bold', 'italic', 'underline', 'strike',
                        'list', 'bullet',
                        'color', 'background',
                        'align',
                        'link'
                      ]}
                      style={{ minHeight: '250px' }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    You can format your email using the toolbar above. HTML formatting will be preserved.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowComposeModal(false);
                  setEmailForm({ providerId: '', to: '', cc: '', subject: '', content: '' });
                }}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                disabled={sendEmailMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={
                  sendEmailMutation.isPending || 
                  !emailForm.providerId || 
                  !emailForm.to || 
                  !emailForm.subject || 
                  isContentEmpty(emailForm.content)
                }
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
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CommunicationPage;
