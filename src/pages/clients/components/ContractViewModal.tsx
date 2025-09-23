import React, { useEffect } from 'react';
import { X, Calendar, DollarSign, FileText, User, Mail, Phone, Building, CheckCircle, Clock, Download } from 'lucide-react';
import type { Contract } from '../../../types/contract.types';

interface ContractViewModalProps {
  contract: Contract;
  onClose: () => void;
  onDownload?: () => void;
}

const ContractViewModal: React.FC<ContractViewModalProps> = ({
  contract,
  onClose,
  onDownload,
}) => {
  // Body scroll prevention and ESC key handler
  useEffect(() => {
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
  }, [onClose]);

  // Overlay click handler
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContractType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'draft':
        return <Clock className="w-5 h-5 text-gray-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'expired':
        return <Clock className="w-5 h-5 text-red-600" />;
      case 'terminated':
        return <Clock className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Contract Details</h2>
              <p className="text-sm text-gray-500">{contract.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Contract Type</p>
                <p className="text-lg font-semibold text-gray-900">{formatContractType(contract.contractType)}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(contract.status)}
                  <span className={`px-2 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadgeColor(contract.status)}`}>
                    {contract.status}
                  </span>
                </div>
              </div>

              {contract.contractValue && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Contract Value</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {contract.paymentTerms?.currency || 'USD'} {contract.contractValue.toLocaleString()}
                  </p>
                </div>
              )}

              {contract.commissionRate && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Commission Rate</p>
                  <p className="text-lg font-semibold text-gray-900">{contract.commissionRate}%</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900">{formatDate(contract.startDate)}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900">{formatDate(contract.endDate)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {contract.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{contract.description}</p>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            {contract.terms && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Terms & Conditions</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{contract.terms}</p>
                </div>
              </div>
            )}

            {/* Payment Terms */}
            {contract.paymentTerms && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Payment Terms</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contract.paymentTerms.paymentMethod && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Payment Method</p>
                        <p className="text-gray-900">{contract.paymentTerms.paymentMethod}</p>
                      </div>
                    )}
                    {contract.paymentTerms.paymentSchedule && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Payment Schedule</p>
                        <p className="text-gray-900">{contract.paymentTerms.paymentSchedule}</p>
                      </div>
                    )}
                    {contract.paymentTerms.invoicingFrequency && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Invoicing Frequency</p>
                        <p className="text-gray-900">{contract.paymentTerms.invoicingFrequency}</p>
                      </div>
                    )}
                    {contract.paymentTerms.currency && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Currency</p>
                        <p className="text-gray-900">{contract.paymentTerms.currency}</p>
                      </div>
                    )}
                  </div>
                  {contract.paymentTerms.additionalTerms && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Additional Terms</p>
                      <p className="text-gray-700">{contract.paymentTerms.additionalTerms}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Deliverables */}
            {contract.deliverables && contract.deliverables.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Deliverables</h3>
                <div className="space-y-3">
                  {contract.deliverables.map((deliverable, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{deliverable.description}</h4>
                        <span className="text-sm text-gray-500">Qty: {deliverable.quantity}</span>
                      </div>
                      {deliverable.timeline && (
                        <p className="text-sm text-gray-600 mb-2">Timeline: {deliverable.timeline}</p>
                      )}
                      {deliverable.metrics && deliverable.metrics.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Success Metrics:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {deliverable.metrics.map((metric, metricIndex) => (
                              <li key={metricIndex}>{metric}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Person */}
            {contract.contactPerson && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="space-y-1">
                      {contract.contactPerson.name && (
                        <p className="font-medium text-gray-900">
                          {contract.contactPerson.name}
                          {contract.contactPerson.title && (
                            <span className="text-gray-500 ml-1">({contract.contactPerson.title})</span>
                          )}
                        </p>
                      )}
                      {contract.contactPerson.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${contract.contactPerson.email}`} className="text-purple-600 hover:underline">
                            {contract.contactPerson.email}
                          </a>
                        </div>
                      )}
                      {contract.contactPerson.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${contract.contactPerson.phone}`} className="text-purple-600 hover:underline">
                            {contract.contactPerson.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Auto Renewal */}
            {contract.isAutoRenewal && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Auto Renewal</h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800">
                      This contract will automatically renew
                      {contract.renewalPeriodMonths && ` for ${contract.renewalPeriodMonths} months`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Created/Updated Information */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <p>Created: {formatDate(contract.createdAt)}</p>
                  {contract.creator && (
                    <p>By: {contract.creator.firstName} {contract.creator.lastName}</p>
                  )}
                </div>
                <div>
                  <p>Last Updated: {formatDate(contract.updatedAt)}</p>
                  {contract.updater && (
                    <p>By: {contract.updater.firstName} {contract.updater.lastName}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractViewModal;
