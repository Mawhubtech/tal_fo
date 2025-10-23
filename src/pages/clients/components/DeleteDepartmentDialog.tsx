import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteDepartmentDialogProps {
  isOpen: boolean;
  departmentName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteDepartmentDialog: React.FC<DeleteDepartmentDialogProps> = ({
  isOpen,
  departmentName,
  onConfirm,
  onCancel,
  loading = false
}) => {
  // Body scroll prevention and ESC key handler
  useEffect(() => {
    if (isOpen) {
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
      
      // ESC key handler
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onCancel();
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onCancel} />
        
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg mr-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete Department</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to delete the department <span className="font-semibold">"{departmentName}"</span>? 
              This will permanently remove the department and all associated data.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Warning:</p>
                  <p>Any jobs or employees assigned to this department may be affected. Please ensure you have reassigned them before proceeding.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete Department'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDepartmentDialog;
