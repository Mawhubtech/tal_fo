import React, { useState } from 'react';
import { 
  Plus, Search, Filter, MoreHorizontal, Edit, Copy, Trash2, 
  Eye, Users, Lock, Globe, Briefcase, Settings, ChevronRight,
  CheckCircle, Clock, User, Building, Palette, AlertCircle, X
} from 'lucide-react';
import { CreatePipelineDto, Pipeline } from '../../services/pipelineService';
import PipelineModal from '../../components/PipelineModal';
import PipelineDetailsModal from '../../components/PipelineDetailsModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastContainer, { toast } from '../../components/ToastContainer';
import { usePipelines } from '../../hooks/usePipelines';
import { usePipelineModal } from '../../hooks/usePipelineModal';
import { usePipelineFilters } from '../../hooks/usePipelineFilters';
import { useActionMenu } from '../../hooks/useActionMenu';

const PipelinesPage: React.FC = () => {
  const [isCreatingDefault, setIsCreatingDefault] = useState(false);
  const [defaultCreationType, setDefaultCreationType] = useState<'recruitment' | 'sourcing' | 'client' | 'custom'>('recruitment');
  const [viewDetailsPipeline, setViewDetailsPipeline] = useState<Pipeline | null>(null);
  const [deleteConfirmPipeline, setDeleteConfirmPipeline] = useState<Pipeline | null>(null);

  // Custom hooks
  const {
    pipelines,
    loading,
    error,
    createPipeline,
    updatePipeline,
    deletePipeline,
    duplicatePipeline,
    createDefaultPipeline,
    clearError,
  } = usePipelines();

  const {
    showCreateModal,
    selectedPipeline,
    modalLoading,
    openCreateModal,
    openEditModal,
    closeModal,
    setModalLoading,
    isEditing,
  } = usePipelineModal();

  const {
    searchTerm,
    setSearchTerm,
    visibilityFilter,
    setVisibilityFilter,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    filteredPipelines,
    hasActiveFilters,
  } = usePipelineFilters(pipelines);

  const {
    actionMenuOpen,
    toggleActionMenu,
    closeActionMenu,
    isMenuOpen,
  } = useActionMenu();

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recruitment': return <Briefcase className="w-4 h-4" />;
      case 'sourcing': return <Search className="w-4 h-4" />;
      case 'client': return <Building className="w-4 h-4" />;
      case 'custom': return <Settings className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recruitment': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'sourcing': return 'text-green-700 bg-green-50 border-green-200';
      case 'client': return 'text-red-700 bg-red-50 border-red-200';
      case 'custom': return 'text-gray-700 bg-gray-50 border-gray-200';
      default: return 'text-purple-700 bg-purple-50 border-purple-200';
    }
  };

  const handleCreateDefault = async () => {
    try {
      setIsCreatingDefault(true);
      await createDefaultPipeline(defaultCreationType);
      toast.success('Default Pipeline Created', `The default ${defaultCreationType} pipeline has been created successfully.`);
    } catch (err) {
      console.error('Error creating default pipeline:', err);
      toast.error('Creation Failed', 'Failed to create default pipeline. Please try again.');
    } finally {
      setIsCreatingDefault(false);
    }
  };

  const handleEditPipeline = (pipeline: Pipeline) => {
    openEditModal(pipeline);
    closeActionMenu();
  };

  const handleViewDetails = (pipeline: Pipeline) => {
    setViewDetailsPipeline(pipeline);
    closeActionMenu();
  };

  const handleDuplicatePipeline = async (pipeline: Pipeline) => {
    try {
      await duplicatePipeline(pipeline.id);
      toast.success('Pipeline Duplicated', `"${pipeline.name}" has been duplicated successfully.`);
      closeActionMenu();
    } catch (err) {
      console.error('Error duplicating pipeline:', err);
      toast.error('Duplication Failed', 'Failed to duplicate pipeline. Please try again.');
      closeActionMenu();
    }
  };

  const handleDeletePipeline = async (pipeline: Pipeline) => {
    if (pipeline.isDefault) {
      toast.error('Cannot Delete', 'The default pipeline cannot be deleted.');
      return;
    }

    setDeleteConfirmPipeline(pipeline);
    closeActionMenu();
  };

  const confirmDeletePipeline = async () => {
    if (!deleteConfirmPipeline) return;

    try {
      await deletePipeline(deleteConfirmPipeline.id);
      toast.success('Pipeline Deleted', `"${deleteConfirmPipeline.name}" has been deleted successfully.`);
    } catch (err) {
      console.error('Error deleting pipeline:', err);
      toast.error('Deletion Failed', 'Failed to delete pipeline. Please try again.');
    }
  };

  const handleSubmitPipeline = async (data: CreatePipelineDto) => {
    try {
      setModalLoading(true);
      
      if (selectedPipeline) {
        await updatePipeline(selectedPipeline.id, data);
        toast.success('Pipeline Updated', `"${data.name}" has been updated successfully.`);
      } else {
        await createPipeline(data);
        toast.success('Pipeline Created', `"${data.name}" has been created successfully.`);
      }
      
      closeModal();
    } catch (err) {
      console.error(`Error ${selectedPipeline ? 'updating' : 'creating'} pipeline:`, err);
      toast.error(
        selectedPipeline ? 'Update Failed' : 'Creation Failed', 
        `Failed to ${selectedPipeline ? 'update' : 'create'} pipeline. Please try again.`
      );
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => clearError()}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline Management</h1>
          <p className="text-gray-600">Create and manage custom workflows for recruitment, sourcing, clients, and more</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <select
              value={defaultCreationType}
              onChange={(e) => setDefaultCreationType(e.target.value as 'recruitment' | 'sourcing' | 'client' | 'custom')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isCreatingDefault}
            >
              <option value="recruitment">Recruitment</option>
              <option value="sourcing">Sourcing</option>
              <option value="client">Client</option>
              <option value="custom">Custom</option>
            </select>
            <button 
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              onClick={handleCreateDefault}
              disabled={isCreatingDefault || pipelines.some(p => p.isDefault && p.type === defaultCreationType)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {isCreatingDefault ? 'Creating...' : 'Create Default'}
            </button>
          </div>
          <button 
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            onClick={openCreateModal}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Pipeline
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search pipelines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="organization">Organization</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="recruitment">Recruitment</option>
          <option value="sourcing">Sourcing</option>
          <option value="client">Client</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* Pipeline Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPipelines.map((pipeline) => (
          <div key={pipeline.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            {/* Card Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: pipeline.color || '#6B7280' }}
                    >
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{pipeline.name}</h3>
                      {pipeline.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  {pipeline.description && (
                    <p className="text-sm text-gray-600 mb-3">{pipeline.description}</p>
                  )}
                  
                  {/* Meta Information */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {pipeline.createdBy.firstName} {pipeline.createdBy.lastName}
                    </div>
                    {pipeline.client && (
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {pipeline.client.name}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => toggleActionMenu(pipeline.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    data-action-menu
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  
                  {isMenuOpen(pipeline.id) && (
                    <div 
                      className="absolute right-0 top-6 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
                      data-action-menu
                    >
                      <div className="py-1">
                        <button 
                          onClick={() => handleEditPipeline(pipeline)}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Pipeline
                        </button>
                        <button 
                          onClick={() => handleDuplicatePipeline(pipeline)}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </button>
                        <button 
                          onClick={() => handleViewDetails(pipeline)}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                        <hr className="my-1" />
                        <button 
                          onClick={() => handleDeletePipeline(pipeline)}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card Body - Stages */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Pipeline Stages</span>
                <span className="text-xs text-gray-500">{pipeline.stages.length} stages</span>
              </div>
              
              <div className="flex items-center gap-1 mb-4">
                {pipeline.stages
                  .sort((a, b) => a.order - b.order)
                  .slice(0, 5)
                  .map((stage, index) => (
                  <div key={stage.id} className="flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: stage.color || '#6B7280' }}
                    >
                      {stage.order}
                    </div>
                    {index < Math.min(pipeline.stages.length - 1, 4) && (
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                ))}
                {pipeline.stages.length > 5 && (
                  <span className="text-xs text-gray-500 ml-1">+{pipeline.stages.length - 5} more</span>
                )}
              </div>

              {/* Status, Visibility, and Type */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pipeline.status)}`}>
                    {pipeline.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getVisibilityColor(pipeline.visibility)}`}>
                    {getVisibilityIcon(pipeline.visibility)}
                    <span className="ml-1">{pipeline.visibility}</span>
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(pipeline.type)}`}>
                    {getTypeIcon(pipeline.type)}
                    <span className="ml-1">{pipeline.type}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPipelines.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pipelines found</h3>
          <p className="text-gray-600 mb-4">
            {hasActiveFilters 
              ? 'Try adjusting your search filters'
              : 'Create your first recruitment pipeline to get started'
            }
          </p>
          {!hasActiveFilters && (
            <button 
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Pipeline
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <PipelineModal
        isOpen={showCreateModal}
        onClose={() => {
          closeModal();
        }}
        onSubmit={handleSubmitPipeline}
        pipeline={selectedPipeline}
        isLoading={modalLoading}
      />

      {/* View Details Modal */}
      {viewDetailsPipeline && (
        <PipelineDetailsModal
          isOpen={!!viewDetailsPipeline}
          onClose={() => setViewDetailsPipeline(null)}
          pipeline={viewDetailsPipeline}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmPipeline}
        onClose={() => setDeleteConfirmPipeline(null)}
        onConfirm={confirmDeletePipeline}
        title="Delete Pipeline"
        message={deleteConfirmPipeline ? `Are you sure you want to delete "${deleteConfirmPipeline.name}"? This action cannot be undone and will remove all associated data.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />

      {/* Toast Container */}
      <ToastContainer position="top-right" />
    </div>
  );
};

export default PipelinesPage;
