import React, { useState, useEffect } from 'react';
import { X, Download, CreditCard, FileText, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { invoiceApiService } from '../../../services/invoiceApiService';
import type { Invoice } from '../../../types/invoice.types';

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  clientId: string;
  onReceivePayment: () => void;
}

const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  clientId,
  onReceivePayment,
}) => {
  const [downloading, setDownloading] = useState(false);

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

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const blob = await invoiceApiService.downloadInvoicePDF(clientId, invoice.id);
      invoiceApiService.downloadFile(blob, `invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-600',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      general: 'General Invoice',
      contract_based: 'Contract Based',
      recruitment_fee: 'Recruitment Fee',
      retainer: 'Retainer',
      consultation: 'Consultation',
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Invoice Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{invoice.title}</h1>
                <p className="text-gray-600">Invoice #{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                  {invoice.status.toUpperCase()}
                </span>
                <p className="text-sm text-gray-500 mt-2">{getTypeLabel(invoice.type)}</p>
              </div>
            </div>

            {invoice.description && (
              <p className="text-gray-700 mt-4">{invoice.description}</p>
            )}
          </div>

          {/* Invoice Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Issue Date</p>
                  <p className="font-medium">{invoiceApiService.formatDate(invoice.issueDate)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">{invoiceApiService.formatDate(invoice.dueDate)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Currency</p>
                  <p className="font-medium">{invoice.currency}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {invoiceApiService.formatCurrency(invoice.totalAmount, invoice.currency)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Amount Paid</p>
                  <p className="font-medium text-green-600">
                    {invoiceApiService.formatCurrency(invoice.paidAmount || 0, invoice.currency)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Outstanding</p>
                  <p className="font-medium text-red-600">
                    {invoiceApiService.formatCurrency(invoice.outstandingAmount || (invoice.totalAmount - (invoice.paidAmount || 0)), invoice.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          {invoice.billingAddress && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{invoice.billingAddress.name}</p>
                {invoice.billingAddress.company && (
                  <p className="text-gray-600">{invoice.billingAddress.company}</p>
                )}
                <p className="text-gray-600">{invoice.billingAddress.addressLine1}</p>
                {invoice.billingAddress.addressLine2 && (
                  <p className="text-gray-600">{invoice.billingAddress.addressLine2}</p>
                )}
                <p className="text-gray-600">
                  {invoice.billingAddress.city}, {invoice.billingAddress.state} {invoice.billingAddress.postalCode}
                </p>
                <p className="text-gray-600">{invoice.billingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Line Items */}
          {invoice.lineItems && invoice.lineItems.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Line Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Unit Price</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.lineItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {invoiceApiService.formatCurrency(item.unitPrice, invoice.currency)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {invoiceApiService.formatCurrency(item.amount, invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div className="mb-8">
            <div className="bg-gray-50 p-6 rounded-lg max-w-md ml-auto">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{invoiceApiService.formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount ({invoice.discountRate}%):</span>
                    <span>-{invoiceApiService.formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                  </div>
                )}
                
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>{invoiceApiService.formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{invoiceApiService.formatCurrency(invoice.totalAmount, invoice.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          {invoice.paymentTerms && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Terms</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Payment Method: <span className="font-medium text-gray-900">
                    {invoice.paymentTerms.paymentMethod?.replace('_', ' ').toUpperCase()}
                  </span>
                </p>
                {invoice.paymentTerms.bankDetails && (
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <p>Bank Name: {invoice.paymentTerms.bankDetails.bankName}</p>
                    <p>Account Number: {invoice.paymentTerms.bankDetails.accountNumber}</p>
                    <p>Routing Number: {invoice.paymentTerms.bankDetails.routingNumber}</p>
                    {invoice.paymentTerms.bankDetails.swiftCode && (
                      <p>SWIFT Code: {invoice.paymentTerms.bankDetails.swiftCode}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {invoice.notes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              </div>
            )}

            {invoice.termsAndConditions && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Conditions</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.termsAndConditions}</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment History */}
          {invoice.receipts && invoice.receipts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
              <div className="space-y-3">
                {invoice.receipts.map((receipt) => (
                  <div key={receipt.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">
                        Payment Received: {invoiceApiService.formatCurrency(receipt.amount, receipt.currency)}
                      </p>
                      <p className="text-sm text-green-700">
                        {invoiceApiService.formatDate(receipt.paymentDate)} • {receipt.paymentMethod}
                      </p>
                      {receipt.notes && (
                        <p className="text-sm text-green-600 mt-1">{receipt.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={async () => {
                          try {
                            const blob = await invoiceApiService.downloadReceiptPDF(clientId, receipt.id);
                            const filename = `receipt-${receipt.id.substring(0, 8)}-${Date.now()}.pdf`;
                            invoiceApiService.downloadFile(blob, filename);
                          } catch (error) {
                            console.error('Error downloading receipt:', error);
                            alert('Failed to download receipt. Please try again.');
                          }
                        }}
                        className="text-green-600 hover:text-green-700"
                        title="Download Receipt"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
                            try {
                              await invoiceApiService.deleteReceipt(clientId, receipt.id);
                              onReceivePayment(); // Refresh the invoice data
                            } catch (error) {
                              console.error('Error deleting receipt:', error);
                              alert('Failed to delete receipt. Please try again.');
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                        title="Delete Payment"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="flex items-center space-x-2 px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4" />
                <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
              </button>

              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <button
                  onClick={onReceivePayment}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Receive Payment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewModal;
