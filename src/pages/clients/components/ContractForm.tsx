import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, DollarSign, FileText, User, Clock, Building, Sparkles } from 'lucide-react';
import type { 
  Contract, 
  CreateContractDto, 
  UpdateContractDto, 
  ContractType, 
  ContractStatus,
  PaymentTerms,
  Deliverable,
  ContactPerson
} from '../../../types/contract.types';
import AIContractGeneratorDialog from './AIContractGeneratorDialog';

interface ContractFormProps {
  contract?: Contract;
  onSave: (data: CreateContractDto | UpdateContractDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  clientData?: {
    name?: string;
    industry?: string;
    size?: string;
  };
  organizationName?: string;
}

const contractTypeOptions = [
  { value: 'recruitment_services', label: 'Recruitment Services' },
  { value: 'contingency', label: 'Contingency' },
  { value: 'retained_search', label: 'Retained Search' },
  { value: 'temporary_staffing', label: 'Temporary Staffing' },
  { value: 'permanent_placement', label: 'Permanent Placement' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'terminated', label: 'Terminated' },
];

const paymentMethodOptions = [
  'Bank Transfer',
  'Check',
  'ACH',
  'Wire Transfer',
  'Credit Card',
  'Other'
];

const paymentScheduleOptions = [
  'Upon Placement',
  'Monthly',
  'Quarterly',
  'Milestone-based',
  'Custom'
];

const invoicingFrequencyOptions = [
  'Upon Placement',
  'Monthly',
  'Bi-weekly',
  'Weekly',
  'Quarterly'
];

const currencyOptions = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'SAR', // Saudi Riyal
  'AED', // UAE Dirham
  'QAR', // Qatari Riyal
  'KWD', // Kuwaiti Dinar
  'BHD', // Bahraini Dinar
  'OMR', // Omani Rial
  'JOD', // Jordanian Dinar
  'LBP', // Lebanese Pound
  'EGP', // Egyptian Pound
  'ILS', // Israeli Shekel
  'IRR', // Iranian Rial
  'IQD', // Iraqi Dinar
  'TRY', // Turkish Lira
];

const ContractForm: React.FC<ContractFormProps> = ({
  contract,
  onSave,
  onCancel,
  isLoading = false,
  clientData,
  organizationName,
}) => {
  const [formData, setFormData] = useState<CreateContractDto | UpdateContractDto>({
    title: '',
    contractType: 'recruitment_services' as ContractType,
    status: 'draft' as ContractStatus,
    startDate: '',
    endDate: '',
    contractValue: undefined,
    commissionRate: undefined,
    description: '',
    terms: '',
    paymentTerms: {
      paymentMethod: '',
      paymentSchedule: '',
      invoicingFrequency: '',
      currency: 'USD',
      additionalTerms: '',
    },
    deliverables: [],
    contactPerson: {
      name: '',
      email: '',
      phone: '',
      title: '',
    },
    isAutoRenewal: false,
    renewalPeriodMonths: undefined,
    documentUrl: '',
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'payment' | 'deliverables' | 'contact'>('basic');
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  useEffect(() => {
    if (contract) {
      setFormData({
        title: contract.title,
        contractType: contract.contractType,
        status: contract.status,
        startDate: contract.startDate.split('T')[0], // Convert to YYYY-MM-DD format
        endDate: contract.endDate.split('T')[0],
        contractValue: contract.contractValue,
        commissionRate: contract.commissionRate,
        description: contract.description || '',
        terms: contract.terms || '',
        paymentTerms: contract.paymentTerms || {
          paymentMethod: '',
          paymentSchedule: '',
          invoicingFrequency: '',
          currency: 'USD',
          additionalTerms: '',
        },
        deliverables: contract.deliverables || [],
        contactPerson: contract.contactPerson || {
          name: '',
          email: '',
          phone: '',
          title: '',
        },
        isAutoRenewal: contract.isAutoRenewal,
        renewalPeriodMonths: contract.renewalPeriodMonths,
        documentUrl: contract.documentUrl || '',
      });
    }
  }, [contract]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving contract:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePaymentTermsChange = (field: keyof PaymentTerms, value: string) => {
    setFormData(prev => ({
      ...prev,
      paymentTerms: {
        ...prev.paymentTerms,
        [field]: value,
      },
    }));
  };

  const handleContactPersonChange = (field: keyof ContactPerson, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactPerson: {
        ...prev.contactPerson,
        [field]: value,
      },
    }));
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [
        ...(prev.deliverables || []),
        { description: '', quantity: 1, timeline: '', metrics: [] },
      ],
    }));
  };

  const updateDeliverable = (index: number, field: keyof Deliverable, value: any) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables?.map((deliverable, i) =>
        i === index ? { ...deliverable, [field]: value } : deliverable
      ),
    }));
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables?.filter((_, i) => i !== index),
    }));
  };

  const handleAIGeneration = (aiData: any) => {
    // Auto-generate start date as today and end date as 1 year from now if not provided
    const today = new Date();
    const oneYearFromNow = new Date(today);
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    setFormData(prev => ({
      ...prev,
      title: aiData.title,
      contractType: aiData.contractType,
      description: aiData.description,
      terms: aiData.terms,
      contractValue: aiData.contractValue,
      commissionRate: aiData.commissionRate,
      startDate: today.toISOString().split('T')[0],
      endDate: oneYearFromNow.toISOString().split('T')[0],
      paymentTerms: aiData.paymentTerms,
      deliverables: aiData.deliverables,
      isAutoRenewal: aiData.isAutoRenewal,
      renewalPeriodMonths: aiData.renewalPeriodMonths,
    }));
    setShowAIGenerator(false);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'payment', label: 'Payment Terms', icon: DollarSign },
    { id: 'deliverables', label: 'Deliverables', icon: Building },
    { id: 'contact', label: 'Contact Info', icon: User },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {contract ? 'Edit Contract' : 'Create New Contract'}
            </h2>
            {!contract && (
              <button
                type="button"
                onClick={() => setShowAIGenerator(true)}
                className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                title="Generate contract content with AI"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span className="text-sm font-medium">AI Generate</span>
              </button>
            )}
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      placeholder="Enter contract title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Type *
                    </label>
                    <select
                      value={formData.contractType}
                      onChange={(e) => handleInputChange('contractType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      required
                    >
                      {contractTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Value ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.contractValue || ''}
                      onChange={(e) => handleInputChange('contractValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.commissionRate || ''}
                      onChange={(e) => handleInputChange('commissionRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document URL
                    </label>
                    <input
                      type="url"
                      value={formData.documentUrl || ''}
                      onChange={(e) => handleInputChange('documentUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="Describe the contract..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => handleInputChange('terms', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="Enter contract terms and conditions..."
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isAutoRenewal}
                      onChange={(e) => handleInputChange('isAutoRenewal', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
                    />
                    <span className="ml-2 text-sm text-gray-700">Auto-renewal</span>
                  </label>

                  {formData.isAutoRenewal && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">Every</span>
                      <input
                        type="number"
                        min="1"
                        value={formData.renewalPeriodMonths || ''}
                        onChange={(e) => handleInputChange('renewalPeriodMonths', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        placeholder="12"
                      />
                      <span className="text-sm text-gray-700">months</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={formData.paymentTerms?.paymentMethod || ''}
                      onChange={(e) => handlePaymentTermsChange('paymentMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    >
                      <option value="">Select payment method</option>
                      {paymentMethodOptions.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Schedule
                    </label>
                    <select
                      value={formData.paymentTerms?.paymentSchedule || ''}
                      onChange={(e) => handlePaymentTermsChange('paymentSchedule', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    >
                      <option value="">Select payment schedule</option>
                      {paymentScheduleOptions.map((schedule) => (
                        <option key={schedule} value={schedule}>
                          {schedule}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoicing Frequency
                    </label>
                    <select
                      value={formData.paymentTerms?.invoicingFrequency || ''}
                      onChange={(e) => handlePaymentTermsChange('invoicingFrequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    >
                      <option value="">Select invoicing frequency</option>
                      {invoicingFrequencyOptions.map((frequency) => (
                        <option key={frequency} value={frequency}>
                          {frequency}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.paymentTerms?.currency || 'USD'}
                      onChange={(e) => handlePaymentTermsChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    >
                      {currencyOptions.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Payment Terms
                  </label>
                  <textarea
                    value={formData.paymentTerms?.additionalTerms || ''}
                    onChange={(e) => handlePaymentTermsChange('additionalTerms', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="Enter additional payment terms..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'deliverables' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Contract Deliverables</h3>
                  <button
                    type="button"
                    onClick={addDeliverable}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Add Deliverable
                  </button>
                </div>

                {formData.deliverables?.map((deliverable, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-medium text-gray-800">Deliverable {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeDeliverable(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={deliverable.description || ''}
                          onChange={(e) => updateDeliverable(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                          placeholder="Describe this deliverable..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={deliverable.quantity || ''}
                          onChange={(e) => updateDeliverable(index, 'quantity', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timeline
                        </label>
                        <input
                          type="text"
                          value={deliverable.timeline || ''}
                          onChange={(e) => updateDeliverable(index, 'timeline', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                          placeholder="e.g., 30 days, End of Q1"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {!formData.deliverables?.length && (
                  <div className="text-center py-8">
                    <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No deliverables added yet</p>
                    <p className="text-gray-400 text-sm">Click "Add Deliverable" to get started</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson?.name || ''}
                      onChange={(e) => handleContactPersonChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson?.title || ''}
                      onChange={(e) => handleContactPersonChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      placeholder="HR Director"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.contactPerson?.email || ''}
                      onChange={(e) => handleContactPersonChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      placeholder="john.doe@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPerson?.phone || ''}
                      onChange={(e) => handleContactPersonChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {contract ? 'Update Contract' : 'Create Contract'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* AI Contract Generator Dialog */}
      <AIContractGeneratorDialog
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onGenerate={handleAIGeneration}
        currentData={{
          clientName: clientData?.name,
          clientIndustry: clientData?.industry,
          clientSize: clientData?.size,
          organizationName: organizationName,
        }}
      />
    </div>
  );
};

export default ContractForm;
