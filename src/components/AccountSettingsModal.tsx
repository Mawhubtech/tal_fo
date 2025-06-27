import React, { useState } from 'react';
import { 
  X, Mail, Check, AlertCircle, Settings, User, Bell, 
  Shield, ExternalLink, RefreshCw 
} from 'lucide-react';
import { useEmailService } from '../hooks/useEmailService';
import { toast } from './ToastContainer';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'profile' | 'email' | 'notifications' | 'security';

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('email');
  const {
    emailSettings,
    isLoadingSettings,
    connectGmail,
    isConnectingGmail,
    disconnectGmail,
    isDisconnectingGmail,
    refetchSettings
  } = useEmailService();

  const handleConnectGmail = async () => {
    try {
      const result = await connectGmail();
      if (result.authUrl) {
        // Open OAuth flow in new window
        const oauthWindow = window.open(result.authUrl, 'gmail-oauth', 'width=500,height=600');
        
        // Listen for messages from the OAuth window
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
            // OAuth successful, refetch settings
            refetchSettings().then(() => {
              toast.success('Gmail Connected', 'Your Gmail account has been connected successfully.');
            });
            oauthWindow?.close();
            window.removeEventListener('message', handleMessage);
          } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
            toast.error('Connection Failed', 'Failed to connect Gmail. Please try again.');
            oauthWindow?.close();
            window.removeEventListener('message', handleMessage);
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Fallback: Check if window is closed manually
        const checkWindowClosed = setInterval(() => {
          if (!oauthWindow || oauthWindow.closed) {
            clearInterval(checkWindowClosed);
            window.removeEventListener('message', handleMessage);
            // Only refetch if we haven't received a message yet
            setTimeout(() => {
              refetchSettings().catch(() => {
                // Silently ignore refetch errors
              });
            }, 1000);
          }
        }, 1000);
        
        // Cleanup after 5 minutes
        setTimeout(() => {
          clearInterval(checkWindowClosed);
          window.removeEventListener('message', handleMessage);
          if (oauthWindow && !oauthWindow.closed) {
            oauthWindow.close();
            toast.error('Timeout', 'Gmail connection timed out. Please try again.');
          }
        }, 300000);
      }
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
      toast.error('Connection Failed', 'Failed to connect Gmail. Please try again.');
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      await disconnectGmail();
      toast.success('Gmail Disconnected', 'Your Gmail account has been disconnected.');
    } catch (error) {
      console.error('Failed to disconnect Gmail:', error);
      toast.error('Disconnection Failed', 'Failed to disconnect Gmail. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="bg-purple-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Account Settings</h2>
              <p className="text-purple-100 mt-1">Manage your account preferences and integrations</p>
            </div>
            <button
              onClick={onClose}
              className="text-purple-200 hover:text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 min-h-full">
            <nav className="p-4">
              <div className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'email', label: 'Email Integration', icon: Mail },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'security', label: 'Security', icon: Shield }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as SettingsTab)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === id
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {label}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Integration</h3>
                  <p className="text-gray-600 mb-6">
                    Connect your Gmail account to send interview emails directly from the platform.
                  </p>
                </div>

                {/* Gmail Integration Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Gmail</h4>
                        <p className="text-gray-600 text-sm">
                          Send emails using your Gmail account
                        </p>
                        {emailSettings?.gmailEmail && (
                          <p className="text-sm text-gray-500 mt-1">
                            Connected as: {emailSettings.gmailEmail}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {isLoadingSettings ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                      ) : emailSettings?.isGmailConnected ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600 font-medium">Connected</span>
                          </div>
                          <button
                            onClick={handleDisconnectGmail}
                            disabled={isDisconnectingGmail}
                            className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {isDisconnectingGmail ? 'Disconnecting...' : 'Disconnect'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleConnectGmail}
                          disabled={isConnectingGmail}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                        >
                          {isConnectingGmail ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Connect Gmail
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Permission Status */}
                  {emailSettings?.isGmailConnected && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Permissions</h5>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {emailSettings.hasRequiredScopes ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm text-gray-700">
                            Send emails via Gmail
                          </span>
                        </div>
                      </div>
                      
                      {!emailSettings.hasRequiredScopes && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm text-yellow-800">
                            Additional permissions required. Please reconnect your Gmail account.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Features List */}
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Features</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Send interview invitations and reminders</li>
                      <li>• Professional emails from your domain</li>
                      <li>• High deliverability rates</li>
                      <li>• Email tracking in your Gmail sent folder</li>
                    </ul>
                  </div>
                </div>

                {/* Email Templates Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Email Templates</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Customize email templates for interview invitations, reminders, and feedback requests in the interview workflow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Settings</h3>
                  <p className="text-gray-600">Manage your profile information and preferences.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Profile settings coming soon</p>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Settings</h3>
                  <p className="text-gray-600">Control how and when you receive notifications.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Notification settings coming soon</p>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Settings</h3>
                  <p className="text-gray-600">Manage your account security and authentication.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Security settings coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
