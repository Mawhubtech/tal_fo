import React from 'react';
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause,
  Eye,
  Download
} from 'lucide-react';
import type { Contract } from '../../../types/contract.types';

interface ContractCardProps {
  contract: Contract;
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
  onView?: (contract: Contract) => void;
  onDownload?: (contract: Contract) => void;
}

const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  onEdit,
  onDelete,
  onView,
  onDownload,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-gray-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'terminated':
        return <Pause className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatContractType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDaysUntilExpiry = () => {
    const endDate = new Date(contract.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry < 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 group overflow-hidden">
      <div className="flex items-start justify-between mb-4 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 break-words line-clamp-2 leading-tight">
                {contract.title}
              </h3>
            </div>
            {contract.documentUrl && (
              <a
                href={contract.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 transition-colors flex-shrink-0"
                title="View contract document"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2 break-words">
            {formatContractType(contract.contractType)}
          </p>
          {contract.description && (
            <p className="text-sm text-gray-500 break-words line-clamp-3 leading-relaxed">
              {contract.description}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Start Date</p>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(contract.startDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">End Date</p>
            <p className={`text-sm font-medium ${
              isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-gray-900'
            }`}>
              {formatDate(contract.endDate)}
            </p>
          </div>
        </div>

        {contract.contractValue && (
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Contract Value</p>
              <p className="text-sm font-medium text-gray-900">
                {contract.paymentTerms?.currency || 'USD'} {contract.contractValue.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {contract.commissionRate && (
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Commission Rate</p>
              <p className="text-sm font-medium text-gray-900">
                {contract.commissionRate}%
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon(contract.status)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(contract.status)}`}>
            {contract.status}
          </span>
        </div>

        {(isExpiringSoon || isExpired) && (
          <div className={`text-xs font-medium ${
            isExpired ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {isExpired 
              ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
              : `Expires in ${daysUntilExpiry} days`
            }
          </div>
        )}

        {contract.isAutoRenewal && (
          <div className="text-xs text-green-600 font-medium">
            Auto-renewal
          </div>
        )}
      </div>

      {contract.contactPerson?.name && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">Contact Person</p>
          <p className="text-sm font-medium text-gray-900 break-words">
            {contract.contactPerson.name}
            {contract.contactPerson.title && (
              <span className="text-gray-500 ml-1 break-words">
                ({contract.contactPerson.title})
              </span>
            )}
          </p>
          {contract.contactPerson.email && (
            <p className="text-xs text-gray-500 break-all">
              {contract.contactPerson.email}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onView && (
          <button
            onClick={() => onView(contract)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Contract"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        
        {onDownload && (
          <button
            onClick={() => onDownload(contract)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={() => onEdit(contract)}
          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="Edit Contract"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onDelete(contract)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Contract"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ContractCard;
