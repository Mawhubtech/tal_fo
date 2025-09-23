import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface DeletePositionDialogProps {
  isOpen: boolean;
  positionTitle: string;
  employeeName?: string;
  hasSubordinates?: boolean;
  subordinatesCount?: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeletePositionDialog: React.FC<DeletePositionDialogProps> = ({
  isOpen,
  positionTitle,
  employeeName,
  hasSubordinates = false,
  subordinatesCount = 0,
  onConfirm,
  onCancel,
  loading = false
}) => {
  // Modal behavior: Prevent body scroll and handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Handle ESC key to close modal
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  // Handle overlay click to close modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Delete Position</h2>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-900 mb-2">
              Are you sure you want to delete the position:
            </p>
            <div className="bg-gray-50 rounded-lg p-3 border">
              <p className="font-semibold text-gray-900">{positionTitle}</p>
              {employeeName && (
                <p className="text-sm text-gray-600">Held by: {employeeName}</p>
              )}
            </div>
          </div>

          {hasSubordinates && subordinatesCount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800 mb-1">
                    Warning: Position has subordinates
                  </h4>
                  <p className="text-sm text-orange-700">
                    This position currently has {subordinatesCount} direct subordinate{subordinatesCount !== 1 ? 's' : ''}. 
                    Deleting this position will orphan {subordinatesCount === 1 ? 'this position' : 'these positions'}, 
                    and {subordinatesCount === 1 ? 'it' : 'they'} will become top-level position{subordinatesCount !== 1 ? 's' : ''}.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600">
            {hasSubordinates 
              ? "This will permanently remove the position from the organization chart and restructure the reporting hierarchy."
              : "This will permanently remove the position from the organization chart."
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </div>
            ) : (
              'Delete Position'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePositionDialog;
