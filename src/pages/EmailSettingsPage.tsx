import React, { useEffect, useState } from 'react';
import { Mail, RefreshCw, ArrowLeft, Settings, Power, Star, Eye, TestTube, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmailService } from '../hooks/useEmailService';
import { useGmailStatus } from '../contexts/GmailStatusContext';
import { useToast } from '../contexts/ToastContext';
import { 
  useEmailProviders, 
  useDeleteEmailProvider,
  useSetDefaultEmailProvider,
  useToggleActiveEmailProvider,
  useSendEmail,
  type EmailProvider 
} from '../hooks/useEmailManagement';
import ConfirmationModal from '../components/ConfirmationModal';
import EmailProviderForm from '../components/EmailProviderForm';
import { EmailErrorDisplay, EmailDataEmptyState } from '../components/EmailErrorBoundary';

const EmailSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { 
    emailSettings, 
    refetchSettings, 
    connectGmail, 
    isConnectingGmail,
    connectOutlook,
    isConnectingOutlook
  } = useEmailService(true);
  const { checkGmailStatus } = useGmailStatus();
  const { data: providersData, isLoading: isLoadingProviders, error: providersError, refetch: refetchProviders } = useEmailProviders();
  
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);
  const [selectedProviderType, setSelectedProviderType] = useState<'gmail' | 'outlook' | 'smtp'>('smtp');
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
  const [testEmailProvider, setTestEmailProvider] = useState<EmailProvider | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);
  const [isDeleteProviderModalOpen, setIsDeleteProviderModalOpen] = useState(false);
  
  const providers = Array.isArray(providersData) ? providersData : 
                   providersData?.providers && Array.isArray(providersData.providers) ? providersData.providers : [];
  
  const deleteProviderMutation = useDeleteEmailProvider();
  const setDefaultProviderMutation = useSetDefaultEmailProvider();
  const toggleActiveProviderMutation = useToggleActiveEmailProvider();
  const sendEmailMutation = useSendEmail();

  useEffect(() => {
    checkGmailStatus();
  }, [checkGmailStatus]);

  const handleRefreshStatus = () => {
    refetchSettings();
    refetchProviders();
    checkGmailStatus();
  };

  const handleConnectProvider = (type: 'gmail' | 'outlook' | 'smtp') => {
    if (type === 'gmail') {
      handleConnectGmail();
    } else if (type === 'outlook') {
      handleConnectOutlook();
    } else {
      setSelectedProvider(null);
      setSelectedProviderType(type);
      setIsProviderModalOpen(true);
    }
  };

  const handleConnectGmail = async () => {
    try {
      const response = await connectGmail();
      if (response?.authUrl) {
        // Open OAuth in popup window instead of redirecting
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          response.authUrl,
          'Gmail OAuth',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        // Listen for OAuth callback completion
        const checkPopupClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopupClosed);
            
            // Refresh email settings and provider list after OAuth completion
            refetchSettings();
            checkGmailStatus();
            
            // Refetch provider list with a slight delay
            setTimeout(async () => {
              await refetchProviders();
            }, 500);
            
            addToast({ type: 'success', title: 'Gmail connection successful' });
          }
        }, 500);
      }
    } catch (error) {
      console.error('Failed to initiate Gmail connection:', error);
      addToast({ type: 'error', title: 'Failed to connect Gmail' });
    }
  };

  const handleConnectOutlook = async () => {
    try {
      const response = await connectOutlook();
      if (response?.authUrl) {
        // Open OAuth in popup window
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          response.authUrl,
          'Outlook OAuth',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        if (!popup) {
          addToast({ type: 'error', title: 'Popup blocked', message: 'Please allow popups for this site' });
          return;
        }

        let checkPopupInterval: NodeJS.Timeout | null = null;
        let timeoutId: NodeJS.Timeout | null = null;

        // Listen for OAuth callback message
        const handleMessage = (event: MessageEvent) => {
          // Ignore messages that don't have the expected type
          if (!event.data || !event.data.type) {
            return;
          }
          
          // Ignore MetaMask and other extension messages
          if (event.data.target === 'metamask-inpage' || event.data.type.includes('metamask')) {
            return;
          }
          
          if (event.origin !== window.location.origin) {
            return;
          }
          
          if (event.data.type === 'outlook-oauth-success' && event.data.email) {
            cleanup();
            refetchSettings();
            
            // Refetch provider list with a slight delay to ensure backend has committed the transaction
            setTimeout(async () => {
              await refetchProviders();
            }, 500);
            
            addToast({ 
              type: 'success', 
              title: 'Outlook Connected', 
              message: `Successfully connected ${event.data.email}. Provider list updated.` 
            });
          } else if (event.data.type === 'outlook-oauth-error') {
            cleanup();
            addToast({ 
              type: 'error', 
              title: 'Outlook Connection Failed', 
              message: event.data.message || 'Failed to connect Outlook account' 
            });
          }
        };

        // Cleanup function
        const cleanup = () => {
          window.removeEventListener('message', handleMessage);
          if (checkPopupInterval) clearInterval(checkPopupInterval);
          if (timeoutId) clearTimeout(timeoutId);
        };

        window.addEventListener('message', handleMessage);

        // Poll to detect when popup closes (with error handling for COOP)
        checkPopupInterval = setInterval(() => {
          try {
            // Try to check if popup is closed
            // This might throw COOP error, but we'll catch it
            if (popup.closed) {
              cleanup();
              
              // Refetch providers after popup closes (regardless of success/error)
              setTimeout(async () => {
                await refetchProviders();
              }, 1000); // 1 second delay to ensure backend has saved
            }
          } catch (error) {
            // Silently ignore COOP errors - postMessage will still work
          }
        }, 500);

        // Cleanup after 5 minutes
        timeoutId = setTimeout(() => {
          cleanup();
          if (popup && !popup.closed) {
            popup.close();
            addToast({ type: 'error', title: 'Timeout', message: 'Outlook connection timed out' });
          }
        }, 300000);
      }
    } catch (error) {
      console.error('Failed to initiate Outlook connection:', error);
      addToast({ type: 'error', title: 'Failed to connect Outlook' });
    }
  };

  const handleEditProvider = (provider: EmailProvider) => {
    setSelectedProvider(provider);
    setSelectedProviderType(provider.type as 'gmail' | 'outlook' | 'smtp');
    setIsProviderModalOpen(true);
  };

  const handleSetDefaultProvider = async (providerId: string) => {
    try {
      await setDefaultProviderMutation.mutateAsync(providerId);
      addToast({ type: 'success', title: 'Default provider updated' });
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to update default provider' });
    }
  };

  const handleToggleActiveProvider = async (providerId: string) => {
    try {
      await toggleActiveProviderMutation.mutateAsync(providerId);
      addToast({ type: 'success', title: 'Provider status updated' });
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to update provider status' });
    }
  };

  const handleDeleteProvider = (providerId: string) => {
    setProviderToDelete(providerId);
    setIsDeleteProviderModalOpen(true);
  };

  const confirmDeleteProvider = async () => {
    if (!providerToDelete) return;
    
    try {
      await deleteProviderMutation.mutateAsync(providerToDelete);
      addToast({ type: 'success', title: 'Provider deleted successfully' });
      setIsDeleteProviderModalOpen(false);
      setProviderToDelete(null);
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to delete provider' });
    }
  };

  const handleTestProvider = (provider: EmailProvider) => {
    setTestEmailProvider(provider);
    setIsTestEmailModalOpen(true);
  };

  const handleSendTestEmail = async () => {
    if (!testEmailProvider || !testEmailAddress) {
      addToast({ type: 'error', title: 'Please enter an email address' });
      return;
    }

    try {
      await sendEmailMutation.mutateAsync({
        providerId: testEmailProvider.id,
        to: [testEmailAddress],
        subject: 'Test Email from TAL',
        content: '<p>This is a test email sent from TAL Email Settings.</p><p>If you received this, your email provider is configured correctly!</p>',
      });
      addToast({ type: 'success', title: 'Test email sent successfully!' });
      setIsTestEmailModalOpen(false);
      setTestEmailAddress('');
    } catch (error: any) {
      addToast({ 
        type: 'error', 
        title: 'Failed to send test email',
        message: error.response?.data?.message || 'Please check your provider settings'
      });
    }
  };

  const getProviderIcon = (type: string) => {
    const iconClass = "w-10 h-10 flex-shrink-0";
    switch (type) {
      case 'gmail':
        return (
          <div className="rounded-lg p-2 bg-red-100">
            <Mail className={`${iconClass} text-red-600`} />
          </div>
        );
      case 'outlook':
        return (
          <div className="rounded-lg p-2 bg-blue-100">
            <Mail className={`${iconClass} text-blue-600`} />
          </div>
        );
      case 'smtp':
        return (
          <div className="rounded-lg p-2 bg-gray-100">
            <Settings className={`${iconClass} text-gray-600`} />
          </div>
        );
      default:
        return (
          <div className="rounded-lg p-2 bg-purple-100">
            <Mail className={`${iconClass} text-purple-600`} />
          </div>
        );
    }
  };

  if (isLoadingProviders) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Loading email settings...</p>
        </div>
      </div>
    );
  }

  if (providersError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
                <p className="text-sm text-gray-600">Manage your email providers</p>
              </div>
            </div>
          </div>
        </div>
        <EmailErrorDisplay
          error={providersError}
          context="email providers"
          onRetry={() => refetchProviders()}
          showDetails={import.meta.env.DEV}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
                <p className="text-sm text-gray-600">Manage your email providers for sending emails</p>
              </div>
            </div>
            <button
              onClick={handleRefreshStatus}
              className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Provider Connection Buttons */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Email Providers</h2>
            <p className="text-sm text-gray-600">Connect and manage email services for sending emails</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleConnectProvider('gmail')}
              disabled={isConnectingGmail}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white border border-purple-600 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnectingGmail ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Connect Gmail</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleConnectProvider('outlook')}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white border border-purple-600 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              <Mail className="w-4 h-4" />
              Connect Outlook
            </button>
            <button
              onClick={() => handleConnectProvider('smtp')}
              className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              <Settings className="w-4 h-4" />
              Configure SMTP
            </button>
          </div>
        </div>

        {/* Providers List */}
        {providers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No email providers</h3>
            <p className="text-gray-600 mb-6">Connect an email service to start sending emails</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => handleConnectProvider('gmail')}
                className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Connect Gmail
              </button>
              <button
                onClick={() => handleConnectProvider('outlook')}
                className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Connect Outlook
              </button>
              <button
                onClick={() => handleConnectProvider('smtp')}
                className="flex items-center border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure SMTP
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 divide-y divide-gray-200">
            {providers.map((provider) => (
              <div key={provider.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {getProviderIcon(provider.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {provider.name}
                        </p>
                        {provider.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          provider.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {provider.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        {provider.type === 'gmail' && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            emailSettings?.isGmailConnected ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            OAuth: {emailSettings?.isGmailConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {provider.fromEmail && (
                          <span className="font-medium">{provider.fromEmail}</span>
                        )}
                        {provider.fromName && (
                          <span className="ml-2">({provider.fromName})</span>
                        )}
                      </p>
                      <div className="mt-2 grid grid-cols-4 gap-x-4 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Sent:</span>
                          <span className="font-medium">{provider.emailsSentCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Daily:</span>
                          <span className="font-medium">{provider.dailyUsage || 0} / {provider.dailyLimit || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Failed:</span>
                          <span className="font-medium text-red-600">{provider.emailsFailedCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>{new Date(provider.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2 flex-shrink-0">
                    {/* Toggle Active/Inactive */}
                    <button
                      onClick={() => handleToggleActiveProvider(provider.id)}
                      disabled={toggleActiveProviderMutation.isPending}
                      className={`p-2 ${
                        provider.status === 'active' 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-gray-400 hover:text-green-500'
                      }`}
                      title={provider.status === 'active' ? 'Deactivate Provider' : 'Activate Provider'}
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    {/* Toggle Default */}
                    <button
                      onClick={() => handleSetDefaultProvider(provider.id)}
                      disabled={setDefaultProviderMutation.isPending || provider.isDefault}
                      className={`p-2 ${
                        provider.isDefault 
                          ? 'text-yellow-500 cursor-not-allowed' 
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                      title={provider.isDefault ? 'Already Default' : 'Set as Default'}
                    >
                      <Star className={provider.isDefault ? 'w-4 h-4 fill-current' : 'w-4 h-4'} />
                    </button>

                    {/* Gmail Reconnect Button */}
                    {provider.type === 'gmail' && !emailSettings?.isGmailConnected && (
                      <button 
                        onClick={handleConnectGmail} 
                        className="text-xs inline-flex items-center px-2.5 py-1.5 border border-transparent font-medium rounded shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                        disabled={isConnectingGmail}
                      >
                        {isConnectingGmail ? 'Connecting...' : 'Reconnect'}
                      </button>
                    )}
                    
                    {/* View/Edit Provider */}
                    <button
                      onClick={() => handleEditProvider(provider)}
                      className="p-2 text-gray-400 hover:text-blue-500"
                      title="View/Edit Provider"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {/* Test Email */}
                    <button
                      onClick={() => handleTestProvider(provider)}
                      className="p-2 text-gray-400 hover:text-green-500"
                      title="Test Email Sending"
                    >
                      <TestTube className="w-4 h-4" />
                    </button>
                    
                    {/* Delete Provider */}
                    <button
                      onClick={() => handleDeleteProvider(provider.id)}
                      disabled={deleteProviderMutation.isPending}
                      className="p-2 text-gray-400 hover:text-red-500"
                      title="Delete Provider"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Provider Form Modal */}
      {isProviderModalOpen && (
        <EmailProviderForm
          isOpen={isProviderModalOpen}
          provider={selectedProvider}
          onClose={() => {
            setIsProviderModalOpen(false);
            setSelectedProvider(null);
          }}
        />
      )}

      {/* Test Email Modal */}
      {isTestEmailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Test Email</h3>
            <p className="text-sm text-gray-600 mb-4">
              Provider: <span className="font-medium">{testEmailProvider?.name}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsTestEmailModalOpen(false);
                  setTestEmailAddress('');
                }}
                className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={sendEmailMutation.isPending || !testEmailAddress}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendEmailMutation.isPending ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Provider Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteProviderModalOpen}
        onClose={() => {
          setIsDeleteProviderModalOpen(false);
          setProviderToDelete(null);
        }}
        onConfirm={confirmDeleteProvider}
        title="Delete Email Provider?"
        message="Are you sure you want to delete this email provider? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default EmailSettingsPage;
