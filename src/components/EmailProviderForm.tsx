import React, { useState, useEffect } from 'react';
import { X, Save, TestTube, Eye, EyeOff } from 'lucide-react';
import { useCreateEmailProvider, useUpdateEmailProvider, useGmailAuthUrl, type EmailProvider, type CreateProviderData } from '../hooks/useEmailManagement';
import { useToast } from '../contexts/ToastContext';

interface EmailProviderFormProps {
  provider?: EmailProvider | null;
  type?: 'gmail' | 'outlook' | 'smtp';
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EmailProviderForm: React.FC<EmailProviderFormProps> = ({
  provider,
  type = 'smtp',
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateProviderData>({
    name: '',
    type: type,
    email: '',
    isDefault: false,
    settings: {}
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const { addToast } = useToast();
  const createMutation = useCreateEmailProvider();
  const updateMutation = useUpdateEmailProvider();
  const gmailAuthMutation = useGmailAuthUrl();

  useEffect(() => {
    if (provider) {
      // If editing an existing provider, we need to handle both settings and config
      let settings = provider.settings || {};
      
      // If it's an SMTP provider and has config but no settings, convert config to settings
      if (provider.type === 'smtp' && provider.config && Object.keys(settings).length === 0) {
        settings = {
          smtpHost: provider.config.host || '',
          smtpPort: provider.config.port || 587,
          smtpSecure: provider.config.secure !== false, // Default to true
          username: provider.config.user || '',
          password: provider.config.pass || ''
        };
      }
      
      // If it's an SMTP provider and has settings, use them directly
      if (provider.type === 'smtp' && provider.settings && Object.keys(provider.settings).length > 0) {
        settings = { ...provider.settings };
      }
      
      setFormData({
        name: provider.name,
        type: provider.type,
        email: provider.fromEmail || provider.email || '', // Use fromEmail if available
        isDefault: provider.isDefault,
        settings: settings
      });
    } else {
      const defaultName = type === 'gmail' ? 'Gmail Account' : 
                         type === 'outlook' ? 'Outlook Account' : 
                         'SMTP Server';
      
      setFormData({
        name: defaultName,
        type: type,
        email: '',
        isDefault: false,
        settings: type === 'smtp' ? {
          smtpHost: '',
          smtpPort: 587,
          smtpSecure: true,
          username: '',
          password: ''
        } : {}
      });
    }
  }, [provider, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'gmail' || type === 'outlook') {
      // For OAuth providers, redirect to OAuth flow
      handleOAuthConnection();
      return;
    }
    
    try {
      setIsConnecting(true);
      
      // Transform formData for SMTP providers to match backend expectations
      let submitData = { ...formData };
      
      if (type === 'smtp' && formData.settings) {
        // Transform settings to config for SMTP providers
        submitData = {
          ...formData,
          config: {
            host: formData.settings.smtpHost,
            port: formData.settings.smtpPort,
            user: formData.settings.username,
            pass: formData.settings.password,
            secure: formData.settings.smtpSecure
          },
          fromEmail: formData.email, // Ensure fromEmail is set
          // Remove settings as we're using config now
          settings: undefined
        };
      }
      
      if (provider) {
        await updateMutation.mutateAsync({ 
          id: provider.id, 
          data: submitData 
        });
        addToast({ type: 'success', title: 'Provider updated successfully' });
      } else {
        await createMutation.mutateAsync(submitData);
        addToast({ type: 'success', title: 'Provider connected successfully' });
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      addToast({ 
        type: 'error', 
        title: provider ? 'Failed to update provider' : 'Failed to connect provider'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOAuthConnection = async () => {
    try {
      setIsConnecting(true);
      
      if (type === 'gmail') {
        // Use the Gmail auth URL hook
        const response = await gmailAuthMutation.mutateAsync();
        
        if (response.authUrl) {
          // Open OAuth flow in new window
          const oauthWindow = window.open(response.authUrl, 'gmail-oauth', 'width=500,height=600');
          
          // Listen for messages from the OAuth window
          const handleMessage = async (event: MessageEvent) => {
            // Only accept messages from the same origin for security
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
              // OAuth successful, update email and create the email provider
              const email = event.data.email;
              if (email) {
                setFormData(prev => ({ ...prev, email }));
              }
              
              // Clean up
              oauthWindow?.close();
              window.removeEventListener('message', handleMessage);
              
              // Create the provider
              await handleCreateProviderFromOAuth(email);
            } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
              addToast({ type: 'error', title: 'Connection Failed', message: 'Failed to connect Gmail. Please try again.' });
              oauthWindow?.close();
              window.removeEventListener('message', handleMessage);
              setIsConnecting(false);
            }
          };
          
          window.addEventListener('message', handleMessage);
          
          // Fallback: Check if window is closed manually
          const checkWindowClosed = setInterval(() => {
            if (!oauthWindow || oauthWindow.closed) {
              clearInterval(checkWindowClosed);
              window.removeEventListener('message', handleMessage);
              // Only try to create provider if we haven't already processed a message
              setTimeout(() => {
                // This fallback will attempt to create provider if OAuth was completed
                // but message wasn't received (which can happen with provider creation flow)
                if (formData.email) {
                  handleCreateProviderFromOAuth(formData.email).catch(() => {
                    // Silently ignore errors as this is just a fallback
                    setIsConnecting(false);
                  });
                } else {
                  setIsConnecting(false);
                }
              }, 1000);
            }
          }, 1000);
          
          // Cleanup after 5 minutes
          setTimeout(() => {
            clearInterval(checkWindowClosed);
            window.removeEventListener('message', handleMessage);
            if (oauthWindow && !oauthWindow.closed) {
              oauthWindow.close();
              addToast({ type: 'error', title: 'Timeout', message: 'Gmail connection timed out. Please try again.' });
            }
            setIsConnecting(false);
          }, 300000);
        }
      } else if (type === 'outlook') {
        // Outlook OAuth not implemented yet
        addToast({ type: 'info', title: 'Coming Soon', message: 'Outlook integration is coming soon!' });
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('OAuth connection error:', error);
      addToast({ type: 'error', title: 'Connection Failed', message: 'Failed to connect email provider. Please try again.' });
      setIsConnecting(false);
    }
  };

  const handleCreateProviderFromOAuth = async (email?: string) => {
    try {
      // After successful OAuth, create the provider with the connected email
      const providerData = {
        name: formData.name || `${type.charAt(0).toUpperCase() + type.slice(1)} Account`,
        type: type,
        email: email || formData.email, // Use email from OAuth response if available
        isDefault: formData.isDefault,
        config: {} // Empty config for Gmail - backend will populate from user's OAuth tokens
      };
      
      await createMutation.mutateAsync(providerData);
      addToast({ type: 'success', title: 'Provider connected successfully' });
      onSuccess?.();
      onClose();
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to create provider after OAuth' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestConnection = async () => {
    // For now, just validate the form
    if (type === 'smtp') {
      if (!formData.settings?.smtpHost || !formData.settings?.username) {
        addToast({ type: 'error', title: 'Please fill in all required SMTP fields' });
        return;
      }
    }
    
    addToast({ type: 'info', title: 'Connection test will be implemented after creation' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {provider ? 'Edit Email Provider' : `Connect ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Provider Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder={`e.g., ${type.charAt(0).toUpperCase() + type.slice(1)} Account`}
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="your-email@example.com"
                required
              />
            </div>

            {/* OAuth Provider Info */}
            {(type === 'gmail' || type === 'outlook') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      OAuth Authentication Required
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        You'll be redirected to {type === 'gmail' ? 'Google' : 'Microsoft'} to authorize access to your email account.
                        This is secure and allows us to send emails on your behalf.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SMTP Settings */}
            {type === 'smtp' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">SMTP Settings</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host *
                    </label>
                    <input
                      type="text"
                      value={formData.settings?.smtpHost || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        settings: { ...formData.settings, smtpHost: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="smtp.gmail.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Port *
                    </label>
                    <input
                      type="number"
                      value={formData.settings?.smtpPort || 587}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        settings: { ...formData.settings, smtpPort: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      min={1}
                      max={65535}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.settings?.username || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      settings: { ...formData.settings, username: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Usually your email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.settings?.password || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        settings: { ...formData.settings, password: e.target.value }
                      })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="App password or regular password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    For Gmail, use an App Password instead of your regular password.
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="smtpSecure"
                    checked={formData.settings?.smtpSecure !== false}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      settings: { ...formData.settings, smtpSecure: e.target.checked }
                    })}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                  <label htmlFor="smtpSecure" className="ml-2 block text-sm text-gray-700">
                    Use TLS/SSL encryption (recommended)
                  </label>
                </div>

                {/* Common SMTP Presets */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Common SMTP Settings</h5>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div><strong>Gmail:</strong> smtp.gmail.com:587 (TLS) or smtp.gmail.com:465 (SSL)</div>
                    <div><strong>Outlook:</strong> smtp-mail.outlook.com:587</div>
                    <div><strong>Yahoo:</strong> smtp.mail.yahoo.com:587</div>
                    <div><strong>SendGrid:</strong> smtp.sendgrid.net:587</div>
                  </div>
                </div>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                  Set as default email provider
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <div>
                {type === 'smtp' && (
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Connection
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConnecting || createMutation.isPending || updateMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {(isConnecting || createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {provider ? 'Update Provider' : 
                       type === 'gmail' || type === 'outlook' ? 'Connect with OAuth' : 'Connect Provider'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailProviderForm;
