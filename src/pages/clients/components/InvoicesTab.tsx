import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  Send,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { invoiceApiService } from '../../../services/invoiceApiService';
import type { Invoice, InvoiceStats, PaginatedInvoices, InvoiceStatus, InvoiceType } from '../../../types/invoice.types';
import InvoiceFormModal from './InvoiceFormModal';
import InvoiceViewModal from './InvoiceViewModal';
import ReceivePaymentModal from './ReceivePaymentModal';
import DeleteInvoiceModal from './DeleteInvoiceModal';

interface InvoicesTabProps {
  clientId: string;
}

const InvoicesTab: React.FC<InvoicesTabProps> = ({ clientId }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
    loadStats();
  }, [clientId, page]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceApiService.getInvoices(clientId, page, 10);
      setInvoices(response.data);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Failed to load invoices');
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await invoiceApiService.getInvoiceStats(clientId);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading invoice stats:', err);
    }
  };

  // Modal handlers
  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setIsFormModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsFormModalOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleReceivePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteInvoice = async () => {
    if (!selectedInvoice) return;
    
    try {
      await invoiceApiService.deleteInvoice(clientId, selectedInvoice.id);
      loadInvoices();
      loadStats();
    } catch (err) {
      console.error('Error deleting invoice:', err);
      throw err; // Re-throw to let the modal handle the error
    }
  };

  const handleFormSuccess = () => {
    loadInvoices();
    loadStats();
  };

  const handlePaymentSuccess = () => {
    loadInvoices();
    loadStats();
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const blob = await invoiceApiService.downloadInvoicePDF(clientId, invoice.id);
      invoiceApiService.downloadFile(blob, `invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const handleDeleteInvoiceOld = async (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoiceApiService.deleteInvoice(clientId, invoiceId);
        loadInvoices();
        loadStats();
      } catch (err) {
        console.error('Error deleting invoice:', err);
        alert('Failed to delete invoice');
      }
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await invoiceApiService.markInvoiceAsSent(clientId, invoiceId);
      loadInvoices();
      loadStats();
    } catch (err) {
      console.error('Error sending invoice:', err);
      alert('Failed to send invoice');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-gray-600" />;
      case 'sent':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'viewed':
        return <Eye className="w-4 h-4 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'partially_paid':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'partially_paid':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading && invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Total Invoices</p>
                <p className="text-xl font-semibold text-gray-900">{stats.totalInvoices}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-xl font-semibold text-gray-900">
                  {invoiceApiService.formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-500">Paid Amount</p>
                <p className="text-xl font-semibold text-gray-900">
                  {invoiceApiService.formatCurrency(stats.totalPaid)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-500">Outstanding</p>
                <p className="text-xl font-semibold text-gray-900">
                  {invoiceApiService.formatCurrency(stats.totalOutstanding)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <button 
          onClick={handleCreateInvoice}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg border">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'No invoices match your search criteria.'
                : 'Get started by creating your first invoice.'
              }
            </p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Create First Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {invoice.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(invoice.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(invoice.status)}`}>
                          {invoice.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {invoiceApiService.formatCurrency(invoice.totalAmount, invoice.currency)}
                      </div>
                      {invoice.outstandingAmount > 0 && (
                        <div className="text-xs text-orange-600">
                          Outstanding: {invoiceApiService.formatCurrency(invoice.outstandingAmount, invoice.currency)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {invoiceApiService.formatDate(invoice.dueDate)}
                      </div>
                      {invoiceApiService.isOverdue(invoice.dueDate, invoice.status) && (
                        <div className="text-xs text-red-600">Overdue</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-gray-400 hover:text-gray-600"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {invoice.status === 'draft' && (
                          <button
                            onClick={() => handleSendInvoice(invoice.id)}
                            className="text-blue-400 hover:text-blue-600"
                            title="Send Invoice"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Download Invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleEditInvoice(invoice)}
                          className="text-purple-400 hover:text-purple-600"
                          title="Edit Invoice"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                          <button
                            onClick={() => handleReceivePayment(invoice)}
                            className="text-green-400 hover:text-green-600"
                            title="Receive Payment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteInvoice(invoice)}
                          className="text-red-400 hover:text-red-600"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
        <InvoiceFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSuccess={handleFormSuccess}
          clientId={clientId}
          invoice={selectedInvoice || undefined}
        />      <InvoiceViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        invoice={selectedInvoice!}
        clientId={clientId}
        onReceivePayment={() => {
          setIsViewModalOpen(false);
          if (selectedInvoice) {
            handleReceivePayment(selectedInvoice);
          }
        }}
      />

      <ReceivePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        clientId={clientId}
        invoiceId={selectedInvoice?.id || ''}
        outstandingAmount={selectedInvoice?.outstandingAmount || (selectedInvoice?.totalAmount - (selectedInvoice?.paidAmount || 0)) || 0}
        currency={selectedInvoice?.currency || 'USD'}
        invoiceNumber={selectedInvoice?.invoiceNumber || ''}
      />

      <DeleteInvoiceModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteInvoice}
        invoiceTitle={selectedInvoice?.title || ''}
        invoiceNumber={selectedInvoice?.invoiceNumber || ''}
        hasPayments={(selectedInvoice?.receipts?.length || 0) > 0}
      />
    </div>
  );
};

export default InvoicesTab;
