import React, { useState } from 'react';
import { 
  FileText, Plus, Edit2, Trash2, Copy, Clock, Users, Star, 
  Search, Filter, ChevronDown, Eye, Play, BarChart3 
} from 'lucide-react';
import { InterviewTemplate } from '../../../../../../types/interviewTemplate.types';
import { 
  useInterviewTemplates, 
  useJobInterviewTemplates,
  useDefaultInterviewTemplates,
  useDeleteInterviewTemplate,
  useCloneInterviewTemplate,
  useMarkTemplateUsed
} from '../../../../../../hooks/useInterviewTemplates';
import { CreateInterviewTemplateModal } from './CreateInterviewTemplateModal';
import { InterviewTemplatePreviewModal } from './InterviewTemplatePreviewModal';
import { toast } from '../../../../../../components/ToastContainer';

interface InterviewTemplateManagerProps {
  jobId?: string;
  jobTitle?: string;
  jobDescription?: string;
  jobRequirements?: string[];
  organizationId?: string;
  onTemplateSelect?: (template: InterviewTemplate) => void;
  onClose?: () => void;
}

export const InterviewTemplateManager: React.FC<InterviewTemplateManagerProps> = ({
  jobId,
  jobTitle = '',
  jobDescription = '',
  jobRequirements = [],
  organizationId,
  onTemplateSelect,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'job' | 'organization' | 'defaults'>('job');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InterviewTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<InterviewTemplate | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch templates based on active tab
  const { data: jobTemplatesData, isLoading: jobLoading } = useJobInterviewTemplates(jobId || '');
  
  const { data: orgTemplatesData, isLoading: orgLoading } = useInterviewTemplates({
    organizationId,
    search: searchQuery,
    interviewType: (selectedType as any) || undefined,
    page: 1,
    limit: 50
  });

  const { data: defaultTemplates, isLoading: defaultLoading } = useDefaultInterviewTemplates(selectedType || undefined);

  const deleteTemplateMutation = useDeleteInterviewTemplate();
  const cloneTemplateMutation = useCloneInterviewTemplate();
  const markUsedMutation = useMarkTemplateUsed();

  // Get templates based on active tab
  const getTemplates = (): InterviewTemplate[] => {
    switch (activeTab) {
      case 'job':
        return jobTemplatesData || [];
      case 'organization':
        return orgTemplatesData?.templates || [];
      case 'defaults':
        return defaultTemplates || [];
      default:
        return [];
    }
  };

  const templates = getTemplates();
  const isLoading = jobLoading || orgLoading || defaultLoading;

  // Filter templates based on search and type
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !selectedType || template.interviewType === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handlePreviewTemplate = (template: InterviewTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleEditTemplate = (template: InterviewTemplate) => {
    setEditingTemplate(template);
    setShowCreateModal(true); // Use the create modal in edit mode
  };

  const handleUseTemplate = async (template: InterviewTemplate) => {
    try {
      await markUsedMutation.mutateAsync(template.id);
      onTemplateSelect?.(template);
      toast.success('Template Selected', `Using "${template.name}" for the interview.`);
    } catch (error) {
      console.error('Error marking template as used:', error);
      onTemplateSelect?.(template);
    }
  };

  const handleCloneTemplate = async (template: InterviewTemplate) => {
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

  const handleDeleteTemplate = async (template: InterviewTemplate) => {
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

  const canEditTemplate = (template: InterviewTemplate) => {
    // Allow all users to edit templates
    return true;
  };

  const canDeleteTemplate = (template: InterviewTemplate) => {
    // Can delete if it's their template and not a default
    return template.createdBy === 'current-user-id' && !template.isDefault && activeTab !== 'defaults';
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'job':
        return jobTemplatesData?.length || 0;
      case 'organization':
        return orgTemplatesData?.total || 0;
      case 'defaults':
        return defaultTemplates?.length || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Interview Templates</h3>
            <p className="text-sm text-gray-500">Choose or create a template for your interview</p>
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

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('job')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 ${
              activeTab === 'job'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Job Templates ({getTabCount('job')})
          </button>
          <button
            onClick={() => setActiveTab('organization')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 ${
              activeTab === 'organization'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Organization ({getTabCount('organization')})
          </button>
          <button
            onClick={() => setActiveTab('defaults')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 ${
              activeTab === 'defaults'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Defaults ({getTabCount('defaults')})
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="Phone Screen">Phone Screen</option>
              <option value="Technical">Technical</option>
              <option value="Behavioral">Behavioral</option>
              <option value="Final">Final</option>
              <option value="Panel">Panel</option>
              <option value="Culture Fit">Culture Fit</option>
              <option value="Case Study">Case Study</option>
              <option value="Presentation">Presentation</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {templates.length === 0 ? 'No templates found' : 'No matching templates'}
            </h4>
            <p className="text-gray-500 mb-4">
              {templates.length === 0 
                ? `No ${activeTab} templates available yet.`
                : 'Try adjusting your search criteria.'
              }
            </p>
            {activeTab === 'job' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create First Template
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-base font-semibold text-gray-900 truncate">
                        {template.name}
                      </h4>
                      {template.isDefault && (
                        <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => handlePreviewTemplate(template)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Preview template"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {canEditTemplate(template) && (
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit template"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleCloneTemplate(template)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Clone template"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    {canDeleteTemplate(template) && (
                      <button
                        onClick={() => handleDeleteTemplate(template)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{template.duration} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{template.questions.length} questions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>{template.usageCount} uses</span>
                  </div>
                </div>

                {/* Type Badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    template.interviewType === 'Phone Screen' ? 'bg-blue-100 text-blue-800' :
                    template.interviewType === 'Technical' ? 'bg-green-100 text-green-800' :
                    template.interviewType === 'Behavioral' ? 'bg-purple-100 text-purple-800' :
                    template.interviewType === 'Final' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {template.interviewType}
                  </span>
                  
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1 text-sm"
                  >
                    <Play className="w-3 h-3" />
                    <span>Use Template</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Template Modal */}
      <CreateInterviewTemplateModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTemplate(null);
        }}
        jobId={jobId}
        jobTitle={jobTitle}
        jobDescription={jobDescription}
        jobRequirements={jobRequirements}
        organizationId={organizationId}
        editTemplate={editingTemplate}
        isEditMode={!!editingTemplate}
        onTemplateCreated={(template) => {
          setShowCreateModal(false);
          setEditingTemplate(null);
          toast.success('Template Created', 'Your interview template has been created successfully.');
        }}
        onTemplateUpdated={(template) => {
          setShowCreateModal(false);
          setEditingTemplate(null);
          toast.success('Template Updated', 'Your interview template has been updated successfully.');
        }}
      />

      {/* Preview Modal */}
      {selectedTemplate && (
        <InterviewTemplatePreviewModal
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
