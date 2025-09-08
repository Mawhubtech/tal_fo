import React, { useState } from 'react';
import { X, CreditCard, Download } from 'lucide-react';
import { invoiceApiService } from '../../../services/invoiceApiService';
import type { PaymentMethod, CreateReceiptRequest } from '../../../types/invoice.types';

interface ReceivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  invoiceId: string;
  outstandingAmount: number;
  currency: string;
  invoiceNumber: string;
}

const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  invoiceId,
  outstandingAmount,
  currency,
  invoiceNumber,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: outstandingAmount,
    paymentMethod: 'bank_transfer' as PaymentMethod,
    paymentDate: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
    transactionId: '',
    bankReference: '',
    checkNumber: '',
    cardLastFour: '',
    processingFee: 0,
  });

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'check', label: 'Check' },
    { value: 'online_payment', label: 'Online Payment' },
    { value: 'cryptocurrency', label: 'Cryptocurrency' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount <= 0) {
      alert('Payment amount must be greater than 0');
      return;
    }

    if (formData.amount > outstandingAmount) {
      alert('Payment amount cannot exceed outstanding amount');
      return;
    }

    setLoading(true);

    try {
      const paymentDetails: any = {};
      
      if (formData.transactionId) paymentDetails.transactionId = formData.transactionId;
      if (formData.bankReference) paymentDetails.bankReference = formData.bankReference;
      if (formData.checkNumber) paymentDetails.checkNumber = formData.checkNumber;
      if (formData.cardLastFour) paymentDetails.cardLastFour = formData.cardLastFour;
      if (formData.processingFee > 0) paymentDetails.processingFee = formData.processingFee;

      const payload: CreateReceiptRequest = {
        amount: formData.amount,
        currency: currency,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        description: formData.description || `Payment for Invoice #${invoiceNumber}`,
        notes: formData.notes,
        invoiceId: invoiceId,
        paymentDetails: Object.keys(paymentDetails).length > 0 ? paymentDetails : undefined,
      };

      await invoiceApiService.receivePayment(clientId, invoiceId, payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentDetails = () => {
    switch (formData.paymentMethod) {
      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                value={formData.transactionId}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Bank transaction reference"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Reference
              </label>
              <input
                type="text"
                value={formData.bankReference}
                onChange={(e) => setFormData({ ...formData, bankReference: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Bank reference number"
              />
            </div>
          </div>
        );

      case 'credit_card':
      case 'debit_card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                value={formData.transactionId}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Card transaction ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Last 4 Digits
              </label>
              <input
                type="text"
                maxLength={4}
                value={formData.cardLastFour}
                onChange={(e) => setFormData({ ...formData, cardLastFour: e.target.value.replace(/\D/g, '') })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Last 4 digits"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Processing Fee
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.processingFee}
                onChange={(e) => setFormData({ ...formData, processingFee: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
        );

      case 'check':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check Number
            </label>
            <input
              type="text"
              value={formData.checkNumber}
              onChange={(e) => setFormData({ ...formData, checkNumber: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Check number"
            />
          </div>
        );

      case 'online_payment':
      case 'cryptocurrency':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction ID
            </label>
            <input
              type="text"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Transaction reference"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Receive Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Invoice Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Invoice: #{invoiceNumber}</p>
            <p className="text-lg font-semibold text-gray-900">
              Outstanding: {invoiceApiService.formatCurrency(outstandingAmount, currency)}
            </p>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount ({currency}) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={outstandingAmount}
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              required
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Payment Details */}
          {renderPaymentDetails()}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={`Payment for Invoice #${invoiceNumber}`}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Additional notes"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-4 h-4" />
              <span>{loading ? 'Processing...' : 'Receive Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceivePaymentModal;
