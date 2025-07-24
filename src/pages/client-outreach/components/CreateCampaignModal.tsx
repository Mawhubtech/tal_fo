import React, { useState, useMemo, useEffect } from 'react';
import { X, Save, Calendar, Users, Target, AlertCircle, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { useProjects } from '../../../hooks/useClientOutreach';
import { 
  useCreateClientSequence, 
  useUpdateClientSequence,
  CreateClientSequenceDto,
  UpdateClientSequenceDto
} from '../../../hooks/useClientOutreachSequences';

interface CreateCampaignModalProps {
  projectId: string;
  sequence?: any | null; // For editing existing campaigns/sequences
  onClose: () => void;
  onSuccess: (sequenceId: string) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  projectId,
  sequence, // Existing sequence for editing
  onClose,
  onSuccess,
}) => {
  const isEditing = !!sequence;
  
  // Fetch project data
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const project = projects.find(p => p.id.toString() === projectId);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email' as 'email' | 'linkedin' | 'phone' | 'mixed',
    category: 'initial_outreach' as 'initial_outreach' | 'follow_up' | 'nurture' | 'promotional' | 'client_communication',
    trigger: 'manual' as 'manual' | 'stage_change' | 'scheduled' | 'event_based',
    targetStages: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Use pipeline data from project instead of separate API call
  const pipeline = project?.pipeline;
  const pipelineLoading = projectsLoading; // Pipeline loads with project data
  
  const createSequenceMutation = useCreateClientSequence();
  const updateSequenceMutation = useUpdateClientSequence();

  // Initialize form data when editing
  useEffect(() => {
    if (sequence) {
      setFormData({
        name: sequence.name || '',
        description: sequence.description || '',
        type: sequence.type || 'email',
        category: sequence.category || 'initial_outreach',
        trigger: sequence.trigger || 'manual',
        targetStages: sequence.targetCriteria?.stages || [],
      });
    }
  }, [sequence]);

  // Dynamic stage options based on project pipeline
  const stageOptions = useMemo(() => {
    if (pipeline?.stages?.length > 0) {
      const stageMap = new Map();
      pipeline.stages.forEach(stage => {
        if (stage.id) {
          stageMap.set(stage.id, {
            value: stage.id,
            label: stage.name || `Stage ${stage.order || ''}`,
          });
        }
      });
      return Array.from(stageMap.values());
    }
    return [];
  }, [pipeline]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (!project?.pipeline) {
      newErrors.pipeline = 'This project needs a pipeline assigned before creating campaigns';
    }

    if (formData.targetStages.length === 0) {
      newErrors.targetStages = 'Please select at least one target stage to proceed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && sequence) {
        // Update existing campaign/sequence
        const updateData = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          type: formData.type,
          category: formData.category,
          trigger: formData.trigger,
          targetCriteria: {
            stages: formData.targetStages,
          },
        };

        await updateSequenceMutation.mutateAsync({
          id: sequence.id,
          data: updateData
        });
        onSuccess(sequence.id);
      } else {
        // Create new campaign/sequence
        const sequenceData: CreateClientSequenceDto = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          type: formData.type,
          category: formData.category,
          trigger: formData.trigger,
          targetCriteria: {
            stages: formData.targetStages,
          },
        };

        const response = await createSequenceMutation.mutateAsync({
          projectId,
          data: sequenceData
        });
        onSuccess(response.id);
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} campaign:`, error);
      setErrors({ submit: `Failed to ${isEditing ? 'update' : 'create'} campaign. Please try again.` });
    }
  };

  const handleStageToggle = (stageId: string) => {
    setFormData(prev => ({
      ...prev,
      targetStages: prev.targetStages.includes(stageId)
        ? prev.targetStages.filter(id => id !== stageId)
        : [...prev.targetStages, stageId]
    }));
  };

  const categoryOptions = [
    { value: 'initial_outreach', label: 'Initial Outreach', description: 'First contact with potential clients' },
    { value: 'follow_up', label: 'Follow Up', description: 'Follow-up communications with prospects' },
    { value: 'nurture', label: 'Nurture', description: 'Long-term relationship building' },
    { value: 'promotional', label: 'Promotional', description: 'Product or service promotions' },
    { value: 'client_communication', label: 'Client Communication', description: 'General client communications' },
  ];

  const typeOptions = [
    { value: 'email', label: 'Email Campaign', icon: Mail, description: 'Automated email sequence' },
    { value: 'linkedin', label: 'LinkedIn Campaign', icon: MessageSquare, description: 'LinkedIn outreach sequence' },
    { value: 'phone', label: 'Phone Campaign', icon: Users, description: 'Phone call sequence' },
    { value: 'mixed', label: 'Multi-Channel', icon: Target, description: 'Combined email, LinkedIn, and phone' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {isEditing 
              ? 'Update your campaign configuration and target criteria.'
              : 'Create a campaign container first, then add steps to define the outreach flow.'
            }
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Project Context */}
              {projectsLoading ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    <span className="text-gray-600">Loading project information...</span>
                  </div>
                </div>
              ) : project ? (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Project Context</h4>
                  <div className="text-sm text-purple-700 space-y-1">
                    <p><span className="font-medium">Project:</span> {project.name}</p>
                    {project.pipeline ? (
                      <p><span className="font-medium">Pipeline:</span> {project.pipeline.name} ({project.pipeline.stages?.length || 0} stages)</p>
                    ) : (
                      <p className="text-orange-600"><span className="font-medium">Pipeline:</span> No pipeline assigned</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Project Not Found</h4>
                  <p className="text-sm text-red-700">Unable to load project information.</p>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., New Client Outreach Campaign"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Optional description of this campaign..."
                  />
                </div>
              </div>

              {/* Campaign Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Campaign Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {typeOptions.map((type) => (
                    <label key={type.value} className={`flex items-start p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                      formData.type === type.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={formData.type === type.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="mt-1 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <type.icon className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-gray-900">{type.label}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Campaign Category */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Campaign Category</h3>
                <div className="space-y-3">
                  {categoryOptions.map((category) => (
                    <label key={category.value} className={`flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                      formData.category === category.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="category"
                        value={category.value}
                        checked={formData.category === category.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                        className="mt-1 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                      <div className="ml-3">
                        <span className="font-medium text-gray-900">{category.label}</span>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Target Stages */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Target Stages *</h3>
                <p className="text-sm text-gray-600">
                  Select which pipeline stages this campaign should target. This determines which prospects will be eligible for this campaign.
                </p>

                {!project?.pipeline ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900">Pipeline Required</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          This project needs a pipeline assigned before you can create campaigns. 
                          Please assign a pipeline to this project first.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : pipelineLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 text-gray-400 animate-spin" />
                    <p className="text-gray-600">Loading pipeline stages...</p>
                  </div>
                ) : stageOptions.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-xs text-gray-500 mb-3">
                      Pipeline: <span className="font-medium">{pipeline?.name}</span> • {stageOptions.length} stages available
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {stageOptions.map((stage, index) => (
                        <label key={stage.value} className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                          formData.targetStages.includes(stage.value) ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                        }`}>
                          <input
                            type="checkbox"
                            checked={formData.targetStages.includes(stage.value)}
                            onChange={() => handleStageToggle(stage.value)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{stage.label}</span>
                              <span className="text-xs text-gray-500">Stage {index + 1}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Selected: {formData.targetStages.length} of {stageOptions.length} stages
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No pipeline stages available</p>
                    <p className="text-sm">The assigned pipeline doesn't have any stages configured.</p>
                  </div>
                )}

                {errors.targetStages && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.targetStages}
                    </p>
                  </div>
                )}

                {errors.pipeline && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.pipeline}
                    </p>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">Error</h4>
                      <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {!project?.pipeline ? (
                  'Please assign a pipeline to this project before creating campaigns.'
                ) : formData.targetStages.length === 0 ? (
                  'Select at least one target stage to continue creating your campaign.'
                ) : isEditing ? (
                  'Update your campaign configuration to modify target criteria and settings.'
                ) : (
                  'After creating the campaign, you\'ll be able to add steps to define the outreach flow.'
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createSequenceMutation.isPending || 
                    updateSequenceMutation.isPending ||
                    !project?.pipeline ||
                    formData.targetStages.length === 0 ||
                    projectsLoading
                  }
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {(createSequenceMutation.isPending || updateSequenceMutation.isPending) 
                    ? (isEditing ? 'Updating...' : 'Creating...')
                    : (isEditing ? 'Update Campaign' : 'Create Campaign')
                  }
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignModal;
