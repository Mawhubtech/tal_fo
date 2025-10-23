import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  invoiceTitle: string;
  invoiceNumber: string;
  hasPayments?: boolean;
}

const DeleteInvoiceModal: React.FC<DeleteInvoiceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  invoiceTitle,
  invoiceNumber,
  hasPayments = false,
}) => {
  const [loading, setLoading] = useState(false);

  // Body scroll prevention and ESC key handler
  useEffect(() => {
    if (isOpen) {
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
      
      // ESC key handler
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  // Overlay click handler
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delete Invoice</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
              <p className="text-sm text-gray-600">This action cannot be undone.</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700">
              <strong>Invoice:</strong> {invoiceTitle}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Number:</strong> #{invoiceNumber}
            </p>
          </div>

          {hasPayments && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800">Warning</p>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                This invoice has associated payment receipts. Deleting this invoice will also delete all related payment records.
              </p>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-6">
            This will permanently delete the invoice and all associated data. This action cannot be undone.
          </p>

          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              <span>{loading ? 'Deleting...' : 'Delete Invoice'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteInvoiceModal;
