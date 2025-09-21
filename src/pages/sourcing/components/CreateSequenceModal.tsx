import React, { useState, useMemo, useEffect } from 'react';
import { X, Save, Calendar, Users, Target, AlertCircle } from 'lucide-react';
import { usePipeline } from '../../../hooks/usePipelines';
import { useCreateSequence, useUpdateSequence } from '../../../hooks/useSourcingSequences';
import { CreateSourcingSequenceDto, SourcingSequence } from '../../../services/sourcingProjectApiService';

interface CreateSequenceModalProps {
  projectId: string;
  project: any;
  sequence?: SourcingSequence | null; // For editing existing sequences
  onClose: () => void;
  onSuccess: (sequenceId: string) => void;
}

export const CreateSequenceModal: React.FC<CreateSequenceModalProps> = ({
  projectId,
  project,
  sequence, // Existing sequence for editing
  onClose,
  onSuccess,
}) => {
  const isEditing = !!sequence;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email' as 'email' | 'linkedin' | 'phone' | 'multi_channel',
    trigger: 'manual' as 'manual' | 'automatic' | 'prospect_added' | 'stage_change' | 'time_based',
    targetStages: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: pipeline } = usePipeline(project?.pipelineId);
  const createSequenceMutation = useCreateSequence();
  const updateSequenceMutation = useUpdateSequence();

  // Initialize form data when editing
  useEffect(() => {
    if (sequence) {
      setFormData({
        name: sequence.name || '',
        description: sequence.description || '',
        type: sequence.type || 'email',
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
      newErrors.name = 'Sequence name is required';
    }

    if (formData.targetStages.length === 0) {
      newErrors.targetStages = 'Please select at least one target stage';
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
        // Update existing sequence
        const updateData = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          type: formData.type,
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
        // Create new sequence
        const sequenceData: CreateSourcingSequenceDto = {
          projectId,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          type: formData.type,
          trigger: formData.trigger,
          targetCriteria: {
            stages: formData.targetStages,
          },
        };

        const response = await createSequenceMutation.mutateAsync(sequenceData);
        onSuccess(response.id);
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} sequence:`, error);
      setErrors({ submit: `Failed to ${isEditing ? 'update' : 'create'} sequence. Please try again.` });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Sequence' : 'Create New Sequence'}
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
              ? 'Update your sequence configuration and target criteria.'
              : 'Create a sequence container first, then add steps to define the outreach flow.'
            }
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Project Context */}
              {project && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Project Context</h4>
                  <div className="text-sm text-purple-700">
                    <p><span className="font-medium">Project:</span> {project.name}</p>
                    {pipeline && (
                      <p><span className="font-medium">Pipeline:</span> {pipeline.name} ({pipeline.stages?.length || 0} stages)</p>
                    )}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sequence Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Initial Outreach Sequence"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    placeholder="Optional description of this sequence..."
                  />
                </div>
              </div>

              {/* Target Stages */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Target Stages</h3>
                <p className="text-sm text-gray-600">
                  Select which pipeline stages this sequence should target.
                </p>

                {stageOptions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stageOptions.map((stage) => (
                      <label key={stage.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.targetStages.includes(stage.value)}
                          onChange={() => handleStageToggle(stage.value)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-900">{stage.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No pipeline stages available</p>
                    <p className="text-sm">Please set up a pipeline for this project first.</p>
                  </div>
                )}

                {errors.targetStages && (
                  <p className="text-sm text-red-600">{errors.targetStages}</p>
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
                {isEditing 
                  ? 'Update your sequence configuration to modify target criteria and settings.'
                  : 'After creating the sequence, you\'ll be able to add steps to define the outreach flow.'
                }
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
                  disabled={createSequenceMutation.isPending || updateSequenceMutation.isPending}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {(createSequenceMutation.isPending || updateSequenceMutation.isPending) 
                    ? (isEditing ? 'Updating...' : 'Creating...')
                    : (isEditing ? 'Update Sequence' : 'Create Sequence')
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
