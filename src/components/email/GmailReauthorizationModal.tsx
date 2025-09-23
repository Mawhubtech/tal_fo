import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X, Mail } from 'lucide-react';
import { useGmailReauthorization } from '../../hooks/useGmailReauthorization';

interface GmailReauthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  message?: string;
}

export const GmailReauthorizationModal: React.FC<GmailReauthorizationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Gmail Reauthorization Required",
  message = "We need additional Gmail permissions to send emails. Please reauthorize to continue."
}) => {
  const { isReauthorizing, error, handleReauthorization, clearError } = useGmailReauthorization();

  const handleReauth = async () => {
    await handleReauthorization();
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleClose = () => {
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed top-0 right-0 bottom-0 left-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 mb-4">{message}</p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800 mb-1">Required Permissions:</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Send emails on your behalf</li>
                    <li>• Read your Gmail profile</li>
                    <li>• Access your calendar (for meeting invitations)</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={isReauthorizing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReauth}
              disabled={isReauthorizing}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isReauthorizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Reauthorizing...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Reauthorize Gmail</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal content in a portal to bypass any parent z-index issues
  return createPortal(modalContent, document.body);
};
