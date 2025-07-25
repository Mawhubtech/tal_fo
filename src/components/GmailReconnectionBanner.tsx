import React from 'react';
import { AlertTriangle, Mail, RefreshCw } from 'lucide-react';
import { useEmailService } from '../hooks/useEmailService';
import { useToast } from '../contexts/ToastContext';
import { useApiError } from '../hooks/useApiError';

interface GmailReconnectionBannerProps {
  show: boolean;
  onDismiss?: () => void;
}

const GmailReconnectionBanner: React.FC<GmailReconnectionBannerProps> = ({ 
  show, 
  onDismiss 
}) => {
  const { connectGmail, isConnectingGmail, refetchSettings } = useEmailService();
  const { addToast } = useToast();
  const { handleApiError } = useApiError();

  const handleReconnect = async () => {
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
              addToast({ 
                type: 'success', 
                title: 'Gmail Reconnected', 
                message: 'Your Gmail account has been reconnected successfully.' 
              });
              onDismiss?.();
            });
            oauthWindow?.close();
            window.removeEventListener('message', handleMessage);
          } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
            addToast({ 
              type: 'error', 
              title: 'Reconnection Failed', 
              message: 'Failed to reconnect Gmail. Please try again.' 
            });
            oauthWindow?.close();
            window.removeEventListener('message', handleMessage);
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Cleanup after 5 minutes
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          if (oauthWindow && !oauthWindow.closed) {
            oauthWindow.close();
            addToast({ 
              type: 'error', 
              title: 'Timeout', 
              message: 'Gmail reconnection timed out. Please try again.' 
            });
          }
        }, 300000);
      }
    } catch (error) {
      console.error('Failed to reconnect Gmail:', error);
      handleApiError(error, 'Reconnection Failed');
    }
  };

  if (!show) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            <strong>Gmail Connection Expired:</strong> Your Gmail authentication has expired. 
            Please reconnect your Gmail account to continue sending emails.
          </p>
          <div className="mt-3 flex space-x-3">
            <button
              onClick={handleReconnect}
              disabled={isConnectingGmail}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnectingGmail ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reconnecting...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Reconnect Gmail
                </>
              )}
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm text-yellow-700 hover:text-yellow-800 underline"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GmailReconnectionBanner;
