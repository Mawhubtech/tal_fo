import React from 'react';
import { Mail, AlertTriangle, X, ExternalLink } from 'lucide-react';

interface GmailReauthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReauthorize: () => void;
  isReauthorizing?: boolean;
}

export const GmailReauthorizationModal: React.FC<GmailReauthorizationModalProps> = ({
  isOpen,
  onClose,
  onReauthorize,
  isReauthorizing = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Gmail Authorization Required</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Mail className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Gmail Permission Update Needed
              </h3>
              <p className="text-sm text-gray-600">
                Your Gmail connection doesn't have the required permissions to send meeting invitations. 
                You need to reauthorize with updated permissions.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">What permissions are needed?</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Send emails on your behalf</li>
              <li>• Read your Gmail profile information</li>
              <li>• Access calendar for meeting scheduling</li>
            </ul>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onReauthorize}
              disabled={isReauthorizing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isReauthorizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>Reauthorize Gmail</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
