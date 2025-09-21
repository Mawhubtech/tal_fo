import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator } from 'lucide-react';
import { invoiceApiService } from '../../../services/invoiceApiService';
import apiClient from '../../../lib/api';
import type { 
  Invoice, 
  CreateInvoiceRequest, 
  UpdateInvoiceRequest, 
  InvoiceType, 
  LineItem,
  BillingAddress,
  PaymentTerms 
} from '../../../types/invoice.types';
import type { Contract } from '../../../types/contract.types';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  invoice?: Invoice;
}

const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  invoice,
}) => {
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clientData, setClientData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general' as InvoiceType,
    contractId: '',
    subtotal: 0,
    taxRate: 0,
    discountRate: 0,
    currency: 'USD',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    termsAndConditions: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, amount: 0 }
  ]);

  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    name: '',
    company: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>({
    paymentMethod: 'bank_transfer',
  });

  const [calculatedAmounts, setCalculatedAmounts] = useState({
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
  });

  const currencies = [
    'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'ILS'
  ];

  const invoiceTypes: { value: InvoiceType; label: string }[] = [
    { value: 'general', label: 'General Invoice' },
    { value: 'contract_based', label: 'Contract Based' },
    { value: 'recruitment_fee', label: 'Recruitment Fee' },
    { value: 'retainer', label: 'Retainer' },
    { value: 'consultation', label: 'Consultation' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchContracts();
      fetchClientData();
    }
  }, [isOpen, clientId]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        title: invoice.title,
        description: invoice.description || '',
        type: invoice.type,
        contractId: invoice.contractId || '',
        subtotal: invoice.subtotal,
        taxRate: invoice.taxRate,
        discountRate: invoice.discountRate,
        currency: invoice.currency,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        notes: invoice.notes || '',
        termsAndConditions: invoice.termsAndConditions || '',
      });

      if (invoice.lineItems) {
        setLineItems(invoice.lineItems);
      }

      if (invoice.billingAddress) {
        setBillingAddress(invoice.billingAddress);
      }

      if (invoice.paymentTerms) {
        setPaymentTerms(invoice.paymentTerms);
      }
    } else {
      // Set due date to 30 days from issue date for new invoices
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0],
      }));

      // Pre-populate billing address from client data
      if (clientData) {
        setBillingAddress({
          name: clientData.email || '',
          company: clientData.name || '',
          addressLine1: '',
          addressLine2: '',
          city: clientData.location ? clientData.location.split(',')[0]?.trim() : '',
          state: clientData.location ? clientData.location.split(',')[1]?.trim() : '',
          postalCode: '',
          country: 'USA',
        });
      }
    }
  }, [invoice, clientData]);

  useEffect(() => {
    calculateAmounts();
  }, [formData.subtotal, formData.taxRate, formData.discountRate]);

  const fetchContracts = async () => {
    try {
      setLoadingData(true);
      const response = await apiClient.get(`/clients/${clientId}/contracts`);
      setContracts(response.data.contracts || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setContracts([]);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchClientData = async () => {
    try {
      const response = await apiClient.get(`/clients/${clientId}`);
      setClientData(response.data);
    } catch (error) {
      console.error('Error fetching client data:', error);
    }
  };

  // Form validation functions
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic field validation
    if (!formData.title.trim()) {
      newErrors.title = 'Invoice title is required';
    }

    if (formData.subtotal <= 0) {
      newErrors.subtotal = 'Subtotal must be greater than 0';
    }

    if (formData.taxRate < 0 || formData.taxRate > 100) {
      newErrors.taxRate = 'Tax rate must be between 0 and 100';
    }

    if (formData.discountRate < 0 || formData.discountRate > 100) {
      newErrors.discountRate = 'Discount rate must be between 0 and 100';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.dueDate && formData.issueDate && new Date(formData.dueDate) <= new Date(formData.issueDate)) {
      newErrors.dueDate = 'Due date must be after issue date';
    }

    // Validate billing address if any field is filled
    const hasAnyBillingField = Object.values(billingAddress).some(value => value && value.toString().trim() !== '');
    
    if (hasAnyBillingField) {
      if (!billingAddress.name.trim()) {
        newErrors['billingAddress.name'] = 'Contact name is required when billing address is provided';
      }
      if (!billingAddress.company.trim()) {
        newErrors['billingAddress.company'] = 'Company name is required when billing address is provided';
      }
      if (!billingAddress.addressLine1.trim()) {
        newErrors['billingAddress.addressLine1'] = 'Address line 1 is required when billing address is provided';
      }
      if (!billingAddress.city.trim()) {
        newErrors['billingAddress.city'] = 'City is required when billing address is provided';
      }
      if (!billingAddress.state.trim()) {
        newErrors['billingAddress.state'] = 'State/Province is required when billing address is provided';
      }
      if (!billingAddress.postalCode.trim()) {
        newErrors['billingAddress.postalCode'] = 'Postal code is required when billing address is provided';
      }
      if (!billingAddress.country.trim()) {
        newErrors['billingAddress.country'] = 'Country is required when billing address is provided';
      }
    }

    // Validate line items
    const validLineItems = lineItems.filter(item => item.description.trim() !== '');
    if (validLineItems.length === 0 && formData.subtotal > 0) {
      newErrors.lineItems = 'At least one line item is required when subtotal is greater than 0';
    }

    validLineItems.forEach((item, index) => {
      if (item.quantity <= 0) {
        newErrors[`lineItem.${index}.quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unitPrice < 0) {
        newErrors[`lineItem.${index}.unitPrice`] = 'Unit price cannot be negative';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
    setSubmitError('');
  };

  const handleFieldChange = (field: string, value: any) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setSubmitError('');
  };

  const calculateAmounts = () => {
    const amounts = invoiceApiService.calculateInvoiceAmounts(
      formData.subtotal,
      formData.taxRate,
      formData.discountRate
    );
    setCalculatedAmounts(amounts);
  };

  const calculateSubtotal = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    setFormData(prev => ({ ...prev, subtotal }));
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].amount = updated[index].quantity * updated[index].unitPrice;
    }
    
    setLineItems(updated);
    
    // Auto-calculate subtotal when line items change
    setTimeout(calculateSubtotal, 0);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      const updated = lineItems.filter((_, i) => i !== index);
      setLineItems(updated);
      setTimeout(calculateSubtotal, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Only include billing address if at least basic fields are filled
      const shouldIncludeBillingAddress = billingAddress.name.trim() !== '' && 
                                          billingAddress.company.trim() !== '' &&
                                          billingAddress.addressLine1.trim() !== '' &&
                                          billingAddress.city.trim() !== '' &&
                                          billingAddress.state.trim() !== '' &&
                                          billingAddress.postalCode.trim() !== '' &&
                                          billingAddress.country.trim() !== '';

      const payload = {
        ...formData,
        contractId: formData.contractId || undefined, // Send undefined instead of empty string
        totalAmount: calculatedAmounts.totalAmount,
        taxAmount: calculatedAmounts.taxAmount,
        discountAmount: calculatedAmounts.discountAmount,
        lineItems: lineItems.filter(item => item.description.trim() !== ''),
        billingAddress: shouldIncludeBillingAddress ? billingAddress : undefined,
        paymentTerms,
      };

      if (invoice) {
        await invoiceApiService.updateInvoice(clientId, invoice.id, payload as UpdateInvoiceRequest);
      } else {
        await invoiceApiService.createInvoice(clientId, payload as CreateInvoiceRequest);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      
      // Handle backend validation errors
      if (error.response?.status === 400 && error.response?.data?.message) {
        const backendErrors: Record<string, string> = {};
        const messages = Array.isArray(error.response.data.message) 
          ? error.response.data.message 
          : [error.response.data.message];
        
        messages.forEach((msg: string) => {
          // Parse backend error messages
          if (msg.includes('billingAddress.name')) {
            backendErrors['billingAddress.name'] = 'Contact name is required';
          } else if (msg.includes('billingAddress.company')) {
            backendErrors['billingAddress.company'] = 'Company name is required';
          } else if (msg.includes('billingAddress.addressLine1')) {
            backendErrors['billingAddress.addressLine1'] = 'Address line 1 is required';
          } else if (msg.includes('billingAddress.city')) {
            backendErrors['billingAddress.city'] = 'City is required';
          } else if (msg.includes('billingAddress.state')) {
            backendErrors['billingAddress.state'] = 'State/Province is required';
          } else if (msg.includes('billingAddress.postalCode')) {
            backendErrors['billingAddress.postalCode'] = 'Postal code is required';
          } else if (msg.includes('billingAddress.country')) {
            backendErrors['billingAddress.country'] = 'Country is required';
          } else if (msg.includes('contractId must be a UUID')) {
            backendErrors['contractId'] = 'Please select a valid contract';
          } else {
            // Generic error
            setSubmitError(msg);
          }
        });
        
        setErrors(backendErrors);
      } else {
        setSubmitError('Failed to save invoice. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Submit Error Display */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {submitError}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  handleFieldChange('title', e.target.value);
                }}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Invoice title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  setFormData({ ...formData, type: e.target.value as InvoiceType });
                  handleFieldChange('type', e.target.value);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              >
                {invoiceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.type === 'contract_based' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract
                </label>
                {loadingData ? (
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500">
                    Loading contracts...
                  </div>
                ) : contracts.length > 0 ? (
                  <select
                    value={formData.contractId}
                    onChange={(e) => {
                      setFormData({ ...formData, contractId: e.target.value });
                      handleFieldChange('contractId', e.target.value);
                    }}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                      errors.contractId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a contract (optional)</option>
                    {contracts.map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        {contract.title} - {contract.contractValue ? `${contract.contractValue} ${contract.paymentTerms?.currency || 'USD'}` : 'No value specified'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-yellow-50 text-yellow-700">
                    No contracts found for this client
                  </div>
                )}
                {errors.contractId && (
                  <p className="mt-1 text-sm text-red-600">{errors.contractId}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency *
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) => {
                  setFormData({ ...formData, issueDate: e.target.value });
                  handleFieldChange('issueDate', e.target.value);
                }}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                  errors.issueDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.issueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.issueDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => {
                  setFormData({ ...formData, dueDate: e.target.value });
                  handleFieldChange('dueDate', e.target.value);
                }}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                  errors.dueDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              placeholder="Invoice description"
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Price"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={item.amount.toFixed(2)}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {errors.lineItems && (
              <p className="mt-1 text-sm text-red-600">{errors.lineItems}</p>
            )}
          </div>

          {/* Financial Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtotal
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.subtotal}
                    onChange={(e) => {
                      setFormData({ ...formData, subtotal: parseFloat(e.target.value) || 0 });
                      handleFieldChange('subtotal', e.target.value);
                    }}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                      errors.subtotal ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={calculateSubtotal}
                    className="text-purple-600 hover:text-purple-700"
                    title="Calculate from line items"
                  >
                    <Calculator className="w-4 h-4" />
                  </button>
                </div>
                {errors.subtotal && (
                  <p className="mt-1 text-sm text-red-600">{errors.subtotal}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={(e) => {
                    setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 });
                    handleFieldChange('taxRate', e.target.value);
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                    errors.taxRate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.taxRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.taxRate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discountRate}
                  onChange={(e) => {
                    setFormData({ ...formData, discountRate: parseFloat(e.target.value) || 0 });
                    handleFieldChange('discountRate', e.target.value);
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                    errors.discountRate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.discountRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.discountRate}</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Tax Amount:</span>
                <span>{calculatedAmounts.taxAmount.toFixed(2)} {formData.currency}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Discount Amount:</span>
                <span>{calculatedAmounts.discountAmount.toFixed(2)} {formData.currency}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-semibold text-gray-900 mt-2 pt-2 border-t border-gray-200">
                <span>Total Amount:</span>
                <span>{calculatedAmounts.totalAmount.toFixed(2)} {formData.currency}</span>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Billing Address (Optional)</h3>
              {clientData && (
                <button
                  type="button"
                  onClick={() => setBillingAddress({
                    name: clientData.email || '',
                    company: clientData.name || '',
                    addressLine1: '',
                    addressLine2: '',
                    city: clientData.location ? clientData.location.split(',')[0]?.trim() : '',
                    state: clientData.location ? clientData.location.split(',')[1]?.trim() : '',
                    postalCode: '',
                    country: 'USA',
                  })}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  Auto-fill from client
                </button>
              )}
            </div>

            <div className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg">
              <p>💡 Billing address is optional. If you provide any billing information, all required fields must be completed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={billingAddress.name}
                  onChange={(e) => {
                    setBillingAddress({ ...billingAddress, name: e.target.value });
                    handleFieldChange('billingAddress.name', e.target.value);
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                    errors['billingAddress.name'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Contact person name"
                />
                {errors['billingAddress.name'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['billingAddress.name']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={billingAddress.company}
                  onChange={(e) => {
                    setBillingAddress({ ...billingAddress, company: e.target.value });
                    handleFieldChange('billingAddress.company', e.target.value);
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                    errors['billingAddress.company'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Company name"
                />
                {errors['billingAddress.company'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['billingAddress.company']}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={billingAddress.addressLine1}
                  onChange={(e) => {
                    setBillingAddress({ ...billingAddress, addressLine1: e.target.value });
                    handleFieldChange('billingAddress.addressLine1', e.target.value);
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                    errors['billingAddress.addressLine1'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Street address"
                />
                {errors['billingAddress.addressLine1'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['billingAddress.addressLine1']}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={billingAddress.addressLine2 || ''}
                  onChange={(e) => setBillingAddress({ ...billingAddress, addressLine2: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={billingAddress.city}
                  onChange={(e) => {
                    setBillingAddress({ ...billingAddress, city: e.target.value });
                    handleFieldChange('billingAddress.city', e.target.value);
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                    errors['billingAddress.city'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="City"
                />
                {errors['billingAddress.city'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['billingAddress.city']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  value={billingAddress.state}
                  onChange={(e) => {
                    setBillingAddress({ ...billingAddress, state: e.target.value });
                    handleFieldChange('billingAddress.state', e.target.value);
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                    errors['billingAddress.state'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="State or Province"
                />
                {errors['billingAddress.state'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['billingAddress.state']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={billingAddress.postalCode}
                  onChange={(e) => {
                    setBillingAddress({ ...billingAddress, postalCode: e.target.value });
                    handleFieldChange('billingAddress.postalCode', e.target.value);
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                    errors['billingAddress.postalCode'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Postal code"
                />
                {errors['billingAddress.postalCode'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['billingAddress.postalCode']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={billingAddress.country}
                  onChange={(e) => {
                    setBillingAddress({ ...billingAddress, country: e.target.value });
                    handleFieldChange('billingAddress.country', e.target.value);
                  }}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none ${
                    errors['billingAddress.country'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Country"
                />
                {errors['billingAddress.country'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['billingAddress.country']}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="Internal notes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                value={formData.termsAndConditions}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="Payment terms and conditions"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
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
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceFormModal;
