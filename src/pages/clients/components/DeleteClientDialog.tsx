import React from 'react';
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';

interface DeleteClientDialogProps {
  isOpen: boolean;
  clientName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteClientDialog: React.FC<DeleteClientDialogProps> = ({
  isOpen,
  clientName,
  onConfirm,
  onCancel,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Delete Client</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900">"{clientName}"</span>?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone. All client data, including associated jobs, 
            hires, and activity history will be permanently removed.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Client
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteClientDialog;
