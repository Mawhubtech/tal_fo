import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Users, Building, Lock, Globe, User, CheckCircle, XCircle } from 'lucide-react';
import { Pipeline } from '../services/pipelineService';

interface PipelineDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipeline: Pipeline;
}

const PipelineDetailsModal: React.FC<PipelineDetailsModalProps> = ({
  isOpen,
  onClose,
  pipeline
}) => {
  // Enhanced modal behavior - ESC key and body scroll prevention
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle overlay click to close modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      case 'organization': return <Building className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'text-green-700 bg-green-50 border-green-200';
      case 'private': return 'text-gray-700 bg-gray-50 border-gray-200';
      case 'organization': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-50 border-green-200';
      case 'inactive': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'archived': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Pipeline Details</h2>
            <p className="text-sm text-gray-500 mt-1">View complete pipeline information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm text-gray-900 font-medium">{pipeline.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(pipeline.status)}`}>
                    {pipeline.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                    {pipeline.status.charAt(0).toUpperCase() + pipeline.status.slice(1)}
                  </span>
                </div>
              </div>

              {pipeline.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-sm text-gray-900">{pipeline.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getVisibilityColor(pipeline.visibility)}`}>
                    {getVisibilityIcon(pipeline.visibility)}
                    <span className="ml-1">{pipeline.visibility.charAt(0).toUpperCase() + pipeline.visibility.slice(1)}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Pipeline</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${pipeline.isDefault ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                    {pipeline.isDefault ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(pipeline.createdAt)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(pipeline.updatedAt)}
                  </div>
                </div>
              </div>

              {/* User and Client Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pipeline.createdBy && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                    <div className="flex items-center text-sm text-gray-900">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {pipeline.createdBy.firstName} {pipeline.createdBy.lastName}
                    </div>
                  </div>
                )}
                {pipeline.client && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <div className="flex items-center text-sm text-gray-900">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      {pipeline.client.name}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stages */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Stages</h3>
            <div className="space-y-3">
              {pipeline.stages
                .sort((a, b) => a.order - b.order)
                .map((stage, index) => (
                  <div key={stage.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3"
                          style={{ backgroundColor: stage.color || '#6B7280' }}
                        >
                          {stage.order}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{stage.name}</h4>
                          <p className="text-xs text-gray-500">
                            Type: {stage.type?.charAt(0).toUpperCase() + stage.type?.slice(1)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {stage.isTerminal && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md">Terminal</span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-md ${stage.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {stage.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {stage.description && (
                      <p className="text-sm text-gray-600 ml-11">{stage.description}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PipelineDetailsModal;
