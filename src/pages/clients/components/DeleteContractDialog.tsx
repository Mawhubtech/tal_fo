import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Contract } from '../../../types/contract.types';

interface DeleteContractDialogProps {
  contract: Contract;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const DeleteContractDialog: React.FC<DeleteContractDialogProps> = ({
  contract,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const handleConfirm = async () => {
    if (isLoading) return;
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Delete Contract</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Are you sure you want to delete this contract?
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  This action cannot be undone. The contract "{contract.title}" will be permanently deleted.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-gray-700">Contract:</span>
                <span className="text-gray-900">{contract.title}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-gray-700">Type:</span>
                <span className="text-gray-900 capitalize">
                  {contract.contractType.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
                  contract.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : contract.status === 'draft'
                    ? 'bg-gray-100 text-gray-800'
                    : contract.status === 'expired'
                    ? 'bg-red-100 text-red-800'
                    : contract.status === 'terminated'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {contract.status}
                </span>
              </div>
              {contract.contractValue && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Value:</span>
                  <span className="text-gray-900">
                    ${contract.contractValue.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              'Delete Contract'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteContractDialog;
