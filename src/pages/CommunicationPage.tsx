import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Download,
  Reply,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useEmailProviders, useProviderMessages } from '../hooks/useEmailLogs';
import { useAuthContext } from '../contexts/AuthContext';
import { EmailLogFilters, EmailProvider } from '../services/emailLogApiService';
import { useSendEmail } from '../hooks/useEmailManagement';
import { useToast } from '../contexts/ToastContext';
import { useEmailWebSocket } from '../hooks/useEmailWebSocket';

const CommunicationPage: React.FC = () => {
  const { user } = useAuthContext();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const sendEmailMutation = useSendEmail();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(() => {
    // Initialize from sessionStorage to persist across navigation
    return sessionStorage.getItem('selectedEmailProvider') || null;
  });
  const [showComposeModal, setShowComposeModal] = useState(false);

  // Prevent body scroll when compose modal is open
  React.useEffect(() => {
    if (showComposeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showComposeModal]);
  
  // Platform filter state - Active by default
  const [isPlatformFilterActive, setIsPlatformFilterActive] = useState(true);
  
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
    search: 'label:"TAL Platform" OR (TAL OR Tal OR tal)', // Platform filter with Gmail label + keyword fallback
  });

  // Fetch connected email providers
  const { data: providers, isLoading: providersLoading } = useEmailProviders();

  // Set default provider when providers load and validate cached provider still exists
  React.useEffect(() => {
    if (providers && providers.length > 0) {
      // Check if cached provider ID is still valid
      const cachedProviderId = sessionStorage.getItem('selectedEmailProvider');
      const cachedProviderExists = cachedProviderId && providers.some(p => p.id === cachedProviderId);
      
      if (!selectedProvider || !cachedProviderExists) {
        // Either no provider selected, or the cached provider no longer exists
        const defaultProvider = providers.find(p => p.isDefault) || providers[0];
        setSelectedProvider(defaultProvider.id);
        sessionStorage.setItem('selectedEmailProvider', defaultProvider.id);
      }
    }
  }, [providers, selectedProvider]);

  // Reset filters when provider changes, but preserve platform filter if active
  React.useEffect(() => {
    if (selectedProvider) {
      // Build platform filter query that works across all provider types
      // Gmail: Use label search
      // Outlook/Others: Use keyword search for "TAL" in subject/body
      const selectedProviderData = providers?.find(p => p.id === selectedProvider);
      const providerType = selectedProviderData?.type;
      
      let platformQuery = '';
      if (isPlatformFilterActive) {
        if (providerType === 'gmail') {
          // Gmail: Use label-based filtering (AND keyword search as fallback)
          platformQuery = 'label:"TAL Platform" OR (TAL OR Tal OR tal)';
        } else {
          // Outlook/SMTP/Others: Use keyword search for TAL in subject or body
          platformQuery = '(TAL OR Tal OR tal)';
        }
      }
      
      setFilters({
        page: 1,
        limit: 20,
        type: 'all',
        sortBy: 'sentAt',
        search: platformQuery,
      });
    }
  }, [selectedProvider, isPlatformFilterActive, providers]);

  // WebSocket connection for real-time email updates
  const { isConnected: isEmailSocketConnected } = useEmailWebSocket({
    providerId: selectedProvider || undefined,
    enabled: !!selectedProvider,
    onNewEmail: (data) => {
      console.log('📧 New email notification:', data.email);
      // Show toast notification for new email
      addToast({
        type: 'info',
        title: 'New Email Received',
        message: data.email.subject || 'No subject',
      });
      // Query will auto-refetch due to invalidation in the hook
    },
    onEmailSent: (data) => {
      console.log('✉️ Email sent confirmation:', data.email);
      // Query will auto-refetch to show sent email
    },
    onProviderExpired: (data) => {
      console.warn('⚠️ Provider expired:', data);
      // Show error toast with reconnection prompt
      addToast({
        type: 'error',
        title: 'Email Connection Expired',
        message: `${data.message} Please reconnect your account.`,
        duration: 10000, // Show for 10 seconds
      });
      
      // If the expired provider is currently selected, show additional error
      if (data.providerId === selectedProvider) {
        addToast({
          type: 'error',
          title: 'Current Provider Disconnected',
          message: `${data.providerName} has been disconnected. Please reconnect to continue using this account.`,
          duration: 0, // Persistent until dismissed
        });
      }
    },
  });

  // Fetch emails from selected provider
  // Polling disabled when WebSocket is connected (hybrid approach)
  const { 
    data: emailLogsData, 
    isLoading, 
    error,
    refetch 
  } = useProviderMessages(selectedProvider || '', filters, {
    // Only poll if WebSocket is disconnected (fallback mechanism)
    refetchInterval: selectedProvider && !isEmailSocketConnected ? 30000 : false
  });

  const emails = emailLogsData?.data || [];
  const totalEmails = emailLogsData?.total || 0;
  const totalPages = emailLogsData?.totalPages || 1;

  // Group Gmail emails by threadId
  const groupedEmails = React.useMemo(() => {
    const threadsMap = new Map<string, any[]>();
    const standaloneEmails: any[] = [];

    emails.forEach((email) => {
      // Only group emails with threadId (Gmail threads)
      if (email.threadId) {
        if (!threadsMap.has(email.threadId)) {
          threadsMap.set(email.threadId, []);
        }
        threadsMap.get(email.threadId)!.push(email);
      } else {
        // Emails without threadId display as standalone
        standaloneEmails.push(email);
      }
    });

    // Convert threads map to array and sort each thread by date
    const threads = Array.from(threadsMap.entries()).map(([threadId, threadEmails]) => {
      // Sort emails in thread by date (newest first)
      const sortedThreadEmails = [...threadEmails].sort((a, b) => 
        new Date(b.date || b.sentAt || 0).getTime() - new Date(a.date || a.sentAt || 0).getTime()
      );
      
      return {
        threadId,
        emails: sortedThreadEmails,
        latestEmail: sortedThreadEmails[0],
        count: sortedThreadEmails.length,
      };
    });

    // Sort threads by latest email date
    threads.sort((a, b) => 
      new Date(b.latestEmail.date || b.latestEmail.sentAt || 0).getTime() - 
      new Date(a.latestEmail.date || a.latestEmail.sentAt || 0).getTime()
    );

    return { threads, standaloneEmails };
  }, [emails]);

  const handleSearch = () => {
    // Clear platform filter when manually searching
    setIsPlatformFilterActive(false);
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

  // Handle platform filter toggle
  const handlePlatformFilterToggle = () => {
    const newFilterState = !isPlatformFilterActive;
    setIsPlatformFilterActive(newFilterState);
    
    if (newFilterState) {
      // Apply platform filter with provider-specific query
      const selectedProviderData = providers?.find(p => p.id === selectedProvider);
      const providerType = selectedProviderData?.type;
      
      let platformQuery = '';
      if (providerType === 'gmail') {
        // Gmail: Use label-based filtering (AND keyword search as fallback)
        platformQuery = 'label:"TAL Platform" OR (TAL OR Tal OR tal)';
      } else {
        // Outlook/SMTP/Others: Use keyword search for TAL in subject or body
        platformQuery = '(TAL OR Tal OR tal)';
      }
      
      // Don't show the query in search bar, keep it clean
      setSearchTerm('');
      setFilters(prev => ({
        ...prev,
        search: platformQuery,
        page: 1,
      }));
    } else {
      // Clear filter
      setSearchTerm('');
      setFilters(prev => ({
        ...prev,
        search: '',
        page: 1,
      }));
    }
  };

  const handleViewEmail = (email: any) => {
    // Navigate to email detail page with email data
    navigate(`/communication/email/${email.id}`, {
      state: {
        email,
        providerId: selectedProvider,
      },
    });
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

  // Check if no providers are connected after loading
  if (!providersLoading && (!providers || providers.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto px-4">
          <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Email Accounts Connected</h2>
          <p className="text-gray-600 mb-6">
            Connect your Gmail or Outlook account to start managing your email communications from the TAL platform.
          </p>
          <button
            onClick={() => navigate('/settings/email')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Connect Email Account
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    // Check if error is due to expired provider
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isExpiredProvider = errorMessage.includes('expired') || errorMessage.includes('reconnect');
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isExpiredProvider ? 'Email Connection Expired' : 'Error Loading Communications'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isExpiredProvider 
              ? 'Your email provider connection has expired. Please reconnect your email account to continue.'
              : 'Failed to load email communications. Please try again.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isExpiredProvider ? (
              <button
                onClick={() => navigate('/settings/email')}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Reconnect Email
              </button>
            ) : (
              <>
                <button
                  onClick={() => refetch()}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/settings/email')}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Email Settings
                </button>
              </>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 space-y-4 max-w-screen mx-auto">
      {/* Header */}
      <div className="bg-white border-2 border-purple-500 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Email Communications</h1>
            <p className="text-sm text-gray-600">          
                View emails from your connected email accounts
            </p>
          </div>
        </div>
      </div>

      {/* Actions and Provider Selector - All in one row */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Email Provider Selector */}
          <div className="flex-1 min-w-0">
            {providersLoading ? (
              <div className="flex items-center justify-center gap-2 py-2">
                <Loader className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-xs text-gray-500">Loading providers...</span>
              </div>
            ) : providers && providers.length > 0 ? (
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <select
                  value={selectedProvider || ''}
                  onChange={(e) => {
                    const newProviderId = e.target.value;
                    setSelectedProvider(newProviderId);
                    // Persist to sessionStorage
                    sessionStorage.setItem('selectedEmailProvider', newProviderId);
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-sm font-medium bg-white min-w-0"
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
              <div className="text-xs text-gray-500 text-center py-2">
                No email providers connected
              </div>
            )}
          </div>

          {/* WebSocket Connection Status */}
          {selectedProvider && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
              {isEmailSocketConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Live</span>
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-medium text-orange-600">Polling</span>
                </>
              )}
            </div>
          )}

          {/* Platform Filter Button */}
          <button
            onClick={handlePlatformFilterToggle}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${
              isPlatformFilterActive
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Platform Emails</span>
            {isPlatformFilterActive && (
              <span className="ml-1 text-xs opacity-90">(Active)</span>
            )}
          </button>

          {/* Send Email Button */}
          <button
            onClick={() => {
              // Set default provider when opening compose modal
              const defaultProvider = selectedProvider || (providers && providers.length > 0 ? providers[0].id : '');
              setEmailForm({ providerId: defaultProvider, to: '', cc: '', subject: '', content: '' });
              setShowComposeModal(true);
            }}
            disabled={!providers || providers.length === 0}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            <span>Send Email</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Search Bar */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by subject, recipient, or sender... (use Gmail query syntax for advanced search)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Clear platform filter when user types in search
                  if (isPlatformFilterActive) {
                    setIsPlatformFilterActive(false);
                  }
                }}
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

          {/* Email Type Filter */}
          <select
            value={filters.type || 'all'}
            onChange={(e) => handleFilterChange({ type: e.target.value as any })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 text-sm whitespace-nowrap"
          >
            <option value="all">All Emails</option>
            <option value="sent">Sent</option>
            <option value="inbox">Inbox</option>
          </select>

          {/* Apply Filters Button */}
          <button
            onClick={handleSearch}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <Filter className="h-4 w-4" />
            <span>Apply Filters</span>
          </button>
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
            {/* Email List with Thread Support */}
            <div className="divide-y divide-gray-200">
              {/* Render Gmail Threads */}
              {groupedEmails.threads.map((thread) => {
                const latestEmail = thread.latestEmail;
                const hasUnread = thread.emails.some(e => !e.isRead);
                
                return (
                  <div 
                    key={thread.threadId} 
                    className="px-3 sm:px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewEmail(latestEmail)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                      {/* Email Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {latestEmail.type === 'sent' ? (
                            <Send className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          ) : (
                            <Inbox className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          )}
                          <h3 className="text-sm font-semibold text-gray-900 truncate flex-1 min-w-0">
                            {latestEmail.subject || '(No Subject)'}
                          </h3>
                          {thread.count > 1 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                              {thread.count} emails
                            </span>
                          )}
                          {hasUnread && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                              Unread
                            </span>
                          )}
                          {latestEmail.type === 'received' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex-shrink-0">
                              Received
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {latestEmail.type === 'sent' ? 'To:' : 'From:'}
                            </span>
                            <span className="truncate">
                              {latestEmail.type === 'sent' ? latestEmail.to : latestEmail.from}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(latestEmail.date)}</span>
                          </div>
                        </div>
                        {latestEmail.snippet && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2 sm:truncate">
                            {latestEmail.snippet}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewEmail(latestEmail);
                        }}
                        className="self-end sm:self-auto p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View Thread"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {/* Render Standalone Emails (Non-Gmail or no threadId) */}
              {groupedEmails.standaloneEmails.map((email) => (
                <div 
                  key={email.id} 
                  className="px-3 sm:px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewEmail(email)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    {/* Email Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {email.type === 'sent' ? (
                          <Send className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        ) : (
                          <Inbox className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        )}
                        <h3 className="text-sm font-semibold text-gray-900 truncate flex-1 min-w-0">
                          {email.subject || '(No Subject)'}
                        </h3>
                        {!email.isRead && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                            Unread
                          </span>
                        )}
                        {email.type === 'received' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex-shrink-0">
                            Received
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-600">
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
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 sm:truncate">
                          {email.snippet}
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewEmail(email);
                      }}
                      className="self-end sm:self-auto p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
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
              <div className="px-3 sm:px-4 py-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    Showing {((filters.page || 1) - 1) * (filters.limit || 20) + 1} to {Math.min((filters.page || 1) * (filters.limit || 20), totalEmails)} of {totalEmails}
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange((filters.page || 1) - 1)}
                      disabled={filters.page === 1}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>

                    <div className="hidden sm:flex items-center gap-1">
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

                    {/* Mobile page indicator */}
                    <div className="sm:hidden px-3 py-1.5 border border-gray-300 rounded-lg text-xs">
                      {filters.page} / {totalPages}
                    </div>

                    <button
                      onClick={() => handlePageChange((filters.page || 1) + 1)}
                      disabled={filters.page === totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Compose Email Modal */}
      {showComposeModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Compose Email</h3>
                </div>
                <button
                  onClick={() => {
                    setShowComposeModal(false);
                    setEmailForm({ providerId: '', to: '', cc: '', subject: '', content: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 140px)' }}>
              <div className="space-y-3 sm:space-y-4">
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
