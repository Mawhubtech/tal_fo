import React, { useState } from 'react';
import { X, AlertTriangle, Mail, RefreshCw } from 'lucide-react';
import { emailApiService } from '../../services/emailApiService';

interface GmailReconnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  message?: string;
}

export const GmailReconnectionModal: React.FC<GmailReconnectionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Gmail Reconnection Required",
  message = "Your Gmail account needs additional permissions to send emails. Please reconnect to grant the required permissions."
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReconnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const { authUrl } = await emailApiService.reconnectGmail();
      
      // Open popup window for OAuth
      const popup = window.open(
        authUrl,
        'gmail-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for OAuth completion
      const messageListener = (event: MessageEvent) => {
        if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
          window.removeEventListener('message', messageListener);
          popup.close();
          setIsConnecting(false);
          if (onSuccess) {
            onSuccess();
          }
          onClose();
        } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
          window.removeEventListener('message', messageListener);
          popup.close();
          setIsConnecting(false);
          setError(event.data.error || 'Failed to connect Gmail account');
        }
      };

      window.addEventListener('message', messageListener);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          setIsConnecting(false);
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to initiate Gmail reconnection:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect Gmail account');
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  What permissions are needed?
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Send emails on your behalf</li>
                  <li>• Access your email address</li>
                  <li>• Read basic profile information</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReconnect}
              disabled={isConnecting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Reconnect Gmail</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
