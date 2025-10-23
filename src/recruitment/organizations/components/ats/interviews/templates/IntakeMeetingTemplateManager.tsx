import React, { useState } from 'react';
import { 
  FileText, Plus, Edit2, Trash2, Copy, Clock, Users, Star, 
  Search, Filter, ChevronDown, Eye, Play, MessageSquare
} from 'lucide-react';
import { IntakeMeetingTemplate } from '../../../../../../types/intakeMeetingTemplate.types';
import { 
  useIntakeMeetingTemplates,
  useDeleteIntakeMeetingTemplate,
  useCloneIntakeMeetingTemplate
} from '../../../../../../hooks/useIntakeMeetingTemplates';
import { CreateIntakeMeetingTemplateModal } from './CreateIntakeMeetingTemplateModal';
import { IntakeMeetingTemplatePreviewModal } from './IntakeMeetingTemplatePreviewModal';
import { toast } from '../../../../../../components/ToastContainer';

interface IntakeMeetingTemplateManagerProps {
  organizationId?: string;
  onTemplateSelect?: (template: IntakeMeetingTemplate) => void;
  onClose?: () => void;
}

export const IntakeMeetingTemplateManager: React.FC<IntakeMeetingTemplateManagerProps> = ({
  organizationId,
  onTemplateSelect,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<IntakeMeetingTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<IntakeMeetingTemplate | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch templates
  const { data: templates, isLoading } = useIntakeMeetingTemplates({
    organizationId,
  });

  const deleteTemplateMutation = useDeleteIntakeMeetingTemplate();
  const cloneTemplateMutation = useCloneIntakeMeetingTemplate();

  // Filter templates based on search
  const filteredTemplates = (templates || []).filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handlePreviewTemplate = (template: IntakeMeetingTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleEditTemplate = (template: IntakeMeetingTemplate) => {
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  const handleUseTemplate = (template: IntakeMeetingTemplate) => {
    onTemplateSelect?.(template);
    toast.success('Template Selected', `Using "${template.name}" for the intake meeting.`);
  };

  const handleCloneTemplate = async (template: IntakeMeetingTemplate) => {
    try {
      const clonedTemplate = await cloneTemplateMutation.mutateAsync({
        id: template.id,
        newName: `${template.name} (Copy)`
      });
      toast.success('Template Cloned', 'Template has been cloned successfully.');
    } catch (error) {
      console.error('Error cloning template:', error);
      toast.error('Clone Failed', 'Failed to clone template. Please try again.');
    }
  };

  const handleDeleteTemplate = async (template: IntakeMeetingTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteTemplateMutation.mutateAsync(template.id);
      toast.success('Template Deleted', 'Template has been deleted successfully.');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Delete Failed', 'Failed to delete template. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Intake Meeting Templates</h3>
            <p className="text-sm text-gray-500">Choose or create a template for your client intake meeting</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
            <p className="text-gray-500">Loading templates...</p>
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      {template.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>Default</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{template.questions.length} questions</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>Used {template.usageCount} times</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handlePreviewTemplate(template)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCloneTemplate(template)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Clone"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {!template.isDefault && (
                      <button
                        onClick={() => handleDeleteTemplate(template)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    By {template.createdBy.firstName} {template.createdBy.lastName}
                  </span>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Use Template</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-3 bg-gray-100 rounded-lg inline-block mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'No templates match your search.' : 'Create your first intake meeting template.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Template Modal */}
      <CreateIntakeMeetingTemplateModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTemplate(null);
        }}
        organizationId={organizationId}
        editTemplate={editingTemplate}
        isEditMode={!!editingTemplate}
        onTemplateCreated={() => {
          setShowCreateModal(false);
          setEditingTemplate(null);
          toast.success('Template Created', 'Your intake meeting template has been created successfully.');
        }}
        onTemplateUpdated={() => {
          setShowCreateModal(false);
          setEditingTemplate(null);
          toast.success('Template Updated', 'Your intake meeting template has been updated successfully.');
        }}
      />

      {/* Preview Modal */}
      {selectedTemplate && (
        <IntakeMeetingTemplatePreviewModal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
          onUseTemplate={() => {
            handleUseTemplate(selectedTemplate);
            setShowPreviewModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};
