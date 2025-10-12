import React, { useState } from 'react';
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
import { useEmailProviders, useProviderMessages, useUnifiedStats } from '../hooks/useEmailLogs';
import { useAuthContext } from '../contexts/AuthContext';
import { EmailLogFilters, EmailProvider } from '../services/emailLogApiService';

const CommunicationPage: React.FC = () => {
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  
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

  // Fetch unified statistics
  const { data: unifiedStats } = useUnifiedStats();

  // Get stats for selected provider
  const stats = unifiedStats?.byProvider.find(p => p.providerId === selectedProvider)?.stats || unifiedStats?.overall;

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
          
          {/* Email Provider Selector */}
          <div className="flex items-center gap-3">
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

      {/* Statistics Cards */}
      {stats && (
        <div className="space-y-3">
          {/* Selected Provider Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
                </div>
                <Send className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Received</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.received}</p>
                </div>
                <Inbox className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unread || 0}</p>
                </div>
                <Mail className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Overall Stats Across All Providers */}
          {unifiedStats && unifiedStats.byProvider.length > 1 && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-purple-700">ALL PROVIDERS COMBINED</p>
                  <div className="flex gap-6 mt-2">
                    <div>
                      <p className="text-xs text-gray-600">Total Sent</p>
                      <p className="text-lg font-bold text-gray-900">{unifiedStats.overall.sent}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Received</p>
                      <p className="text-lg font-bold text-gray-900">{unifiedStats.overall.received}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Unread</p>
                      <p className="text-lg font-bold text-gray-900">{unifiedStats.overall.unread}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Grand Total</p>
                      <p className="text-lg font-bold text-gray-900">{unifiedStats.overall.total}</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-purple-600">
                  {unifiedStats.byProvider.length} providers
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
      {showEmailModal && selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Email Details</h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-white hover:bg-purple-500 p-2 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="text-purple-100 text-sm">
                {selectedEmail.type === 'sent' || selectedEmail.type === 'outbound' ? 'Sent' : 'Received'} on {new Date(selectedEmail.date || selectedEmail.sentAt || selectedEmail.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Email Meta Information */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-gray-700 min-w-[80px]">Subject:</span>
                  <span className="text-sm text-gray-900">{selectedEmail.subject || '(No Subject)'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-gray-700 min-w-[80px]">From:</span>
                  <span className="text-sm text-gray-900">{selectedEmail.from || selectedEmail.sender}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-gray-700 min-w-[80px]">To:</span>
                  <span className="text-sm text-gray-900">{selectedEmail.to || selectedEmail.recipient}</span>
                </div>
                {selectedEmail.cc && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[80px]">CC:</span>
                    <span className="text-sm text-gray-900">{selectedEmail.cc}</span>
                  </div>
                )}
                {selectedEmail.status && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[80px]">Status:</span>
                    {getStatusBadge(selectedEmail.status)}
                  </div>
                )}
                {selectedEmail.isRead !== undefined && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[80px]">Read:</span>
                    <span className="text-sm text-gray-900">{selectedEmail.isRead ? 'Yes' : 'No'}</span>
                  </div>
                )}
                {selectedEmail.deliveredAt && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[80px]">Delivered:</span>
                    <span className="text-sm text-gray-900">{new Date(selectedEmail.deliveredAt).toLocaleString()}</span>
                  </div>
                )}
                {selectedEmail.failedReason && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-semibold text-gray-700 min-w-[80px]">Error:</span>
                    <span className="text-sm text-red-600">{selectedEmail.failedReason}</span>
                  </div>
                )}
              </div>

              {/* Email Body */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Message:</h4>
                {selectedEmail.body && selectedEmail.body.trim() !== '' ? (
                  // Display HTML body if available
                  <div 
                    className="prose prose-sm max-w-none text-gray-900 bg-gray-50 p-4 rounded-lg overflow-auto"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                  />
                ) : selectedEmail.snippet && selectedEmail.snippet.trim() !== '' ? (
                  // Fallback to snippet if body is empty
                  <div className="text-gray-900 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                    {selectedEmail.snippet}
                  </div>
                ) : (
                  // No content available
                  <div className="text-gray-500 bg-gray-50 p-4 rounded-lg text-center italic">
                    No content available
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowEmailModal(false)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationPage;
