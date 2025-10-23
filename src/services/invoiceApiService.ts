import apiClient from '../lib/api';
import {
  Invoice,
  Receipt,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  CreateReceiptRequest,
  UpdateReceiptRequest,
  InvoiceStats,
  PaginatedInvoices,
  PaginatedReceipts,
} from '../types/invoice.types';

// Invoice API methods
export const invoiceApiService = {
  // Invoice operations
  createInvoice: async (clientId: string, data: CreateInvoiceRequest): Promise<Invoice> => {
    const response = await apiClient.post(`/clients/${clientId}/invoices`, data);
    return response.data;
  },

  getInvoices: async (
    clientId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedInvoices> => {
    const response = await apiClient.get(`/clients/${clientId}/invoices`, {
      params: { page, limit },
    });
    return response.data;
  },

  getInvoiceById: async (clientId: string, invoiceId: string): Promise<Invoice> => {
    const response = await apiClient.get(`/clients/${clientId}/invoices/${invoiceId}`);
    return response.data;
  },

  updateInvoice: async (
    clientId: string,
    invoiceId: string,
    data: UpdateInvoiceRequest
  ): Promise<Invoice> => {
    const response = await apiClient.put(`/clients/${clientId}/invoices/${invoiceId}`, data);
    return response.data;
  },

  deleteInvoice: async (clientId: string, invoiceId: string): Promise<void> => {
    await apiClient.delete(`/clients/${clientId}/invoices/${invoiceId}`);
  },

  markInvoiceAsSent: async (clientId: string, invoiceId: string): Promise<Invoice> => {
    const response = await apiClient.put(`/clients/${clientId}/invoices/${invoiceId}/send`);
    return response.data;
  },

  markInvoiceAsViewed: async (clientId: string, invoiceId: string): Promise<Invoice> => {
    const response = await apiClient.put(`/clients/${clientId}/invoices/${invoiceId}/viewed`);
    return response.data;
  },

  getInvoiceStats: async (clientId: string): Promise<InvoiceStats> => {
    const response = await apiClient.get(`/clients/${clientId}/invoices/stats`);
    return response.data;
  },

  // Receipt operations
  createReceipt: async (
    clientId: string,
    invoiceId: string,
    data: CreateReceiptRequest
  ): Promise<Receipt> => {
    const response = await apiClient.post(
      `/clients/${clientId}/invoices/${invoiceId}/receipts`,
      data
    );
    return response.data;
  },

  getReceipts: async (
    clientId: string,
    invoiceId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedReceipts> => {
    const response = await apiClient.get(
      `/clients/${clientId}/invoices/${invoiceId}/receipts`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  getReceiptById: async (clientId: string, receiptId: string): Promise<Receipt> => {
    const response = await apiClient.get(`/clients/${clientId}/invoices/receipts/${receiptId}`);
    return response.data;
  },

  updateReceipt: async (
    clientId: string,
    receiptId: string,
    data: UpdateReceiptRequest
  ): Promise<Receipt> => {
    const response = await apiClient.put(`/clients/${clientId}/invoices/receipts/${receiptId}`, data);
    return response.data;
  },

  deleteReceipt: async (clientId: string, receiptId: string): Promise<void> => {
    await apiClient.delete(`/clients/${clientId}/invoices/receipts/${receiptId}`);
  },

  // Payment operations
  receivePayment: async (
    clientId: string,
    invoiceId: string,
    data: CreateReceiptRequest
  ): Promise<Receipt> => {
    const response = await apiClient.post(`/clients/${clientId}/invoices/${invoiceId}/payments`, data);
    return response.data;
  },

  // PDF and export operations
  downloadInvoicePDF: async (clientId: string, invoiceId: string): Promise<Blob> => {
    const response = await apiClient.get(`/clients/${clientId}/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadReceiptPDF: async (clientId: string, receiptId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/clients/${clientId}/invoices/receipts/${receiptId}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Receipt PDF download error:', error);
      throw error;
    }
  },

  // Utility methods
  downloadFile: (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  getInvoiceStatusBadgeColor: (status: string): string => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-purple-100 text-purple-800',
      overdue: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      partially_paid: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  },

  getReceiptStatusBadgeColor: (status: string): string => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  },

  getInvoiceStatusIcon: (status: string): string => {
    const icons = {
      draft: '📝',
      sent: '📤',
      viewed: '👁️',
      overdue: '⚠️',
      paid: '✅',
      partially_paid: '🔄',
      cancelled: '❌',
    };
    return icons[status as keyof typeof icons] || '📄';
  },

  calculateInvoiceAmounts: (subtotal: number, taxRate: number = 0, discountRate: number = 0) => {
    const taxAmount = (subtotal * taxRate) / 100;
    const discountAmount = (subtotal * discountRate) / 100;
    const totalAmount = subtotal + taxAmount - discountAmount;

    return {
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };
  },

  isOverdue: (dueDate: string, status: string): boolean => {
    if (status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  },

  getDaysUntilDue: (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
};

export default invoiceApiService;
