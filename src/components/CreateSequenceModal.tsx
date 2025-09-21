import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { CreateSequenceRequest, EmailSequence, UpdateSequenceRequest } from '../services/emailSequencesApiService';

interface CreateSequenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSequenceRequest | UpdateSequenceRequest) => void;
  isLoading?: boolean;
  editSequence?: EmailSequence | null;
  mode?: 'create' | 'edit';
}

const CreateSequenceModal: React.FC<CreateSequenceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  editSequence = null,
  mode = 'create'
}) => {
  const defaultFormData: Partial<CreateSequenceRequest> = {
    name: '',
    description: '',
    type: 'candidate_outreach',
    category: 'candidate_sourcing',
    scope: 'global',
    status: 'draft',
    isActive: false,
    isPreset: true,
    tags: [],
    steps: [
      {
        name: 'Initial Outreach',
        description: 'First contact with the candidate',
        type: 'email',
        status: 'active',
        stepOrder: 1,
        subject: 'Exciting Opportunity at {{companyName}}',
        content: `Hi {{firstName}},

I hope this message finds you well. I came across your profile and was impressed by your experience in {{skillArea}}.

We have an exciting {{jobTitle}} opportunity at {{companyName}} that I think would be a perfect fit for your background. The role offers:

• Competitive salary and benefits
• Flexible work arrangements
• Growth opportunities
• Collaborative team environment

Would you be interested in learning more about this opportunity? I'd love to schedule a brief call to discuss the details.

Best regards,
{{recruiterName}}`,
        variables: ['firstName', 'lastName', 'companyName', 'skillArea', 'jobTitle', 'recruiterName'],
        triggerType: 'immediate',
        delayHours: 0,
        delayMinutes: 0,
        isActive: true
      }
    ],
    timing: {
      autoAdvance: true,
      defaultDelay: 24,
      businessHoursOnly: true,
      timezone: 'America/New_York'
    }
  };

  const [formData, setFormData] = useState<Partial<CreateSequenceRequest>>(defaultFormData);
  const [newTag, setNewTag] = useState('');

  // Reset form when modal opens/closes or when switching between create/edit modes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editSequence) {
        // Populate form with existing sequence data
        setFormData({
          name: editSequence.name,
          description: editSequence.description,
          type: editSequence.type,
          category: editSequence.category,
          scope: editSequence.scope,
          status: editSequence.status,
          isActive: editSequence.isActive,
          isPreset: editSequence.isPreset,
          tags: editSequence.tags || [],
          steps: editSequence.steps || [],
          timing: editSequence.timing || defaultFormData.timing
        });
      } else {
        // Reset to default form data for create mode
        setFormData(defaultFormData);
      }
      setNewTag('');
    }
  }, [isOpen, mode, editSequence]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimingChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      timing: {
        ...prev.timing,
        [field]: value
      }
    }));
  };

  const handleStepChange = (stepIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps?.map((step, index) =>
        index === stepIndex ? { ...step, [field]: value } : step
      ) || []
    }));
  };

  const addStep = () => {
    const stepNumber = (formData.steps?.length || 0) + 1;
    const isFollowUp = stepNumber > 1;
    
    const newStep = {
      name: isFollowUp ? `Follow-up ${stepNumber - 1}` : `Step ${stepNumber}`,
      description: isFollowUp ? `Follow-up message ${stepNumber - 1}` : '',
      type: 'email' as const,
      status: 'active' as const,
      stepOrder: stepNumber,
      subject: isFollowUp ? 'Following up on our previous conversation' : '',
      content: isFollowUp ? `Hi {{firstName}},

I wanted to follow up on my previous message regarding the {{jobTitle}} opportunity at {{companyName}}.

I understand you're likely busy, but I believe this role could be a great fit for your experience in {{skillArea}}.

If you're interested, I'd be happy to provide more details about:
• The specific responsibilities and requirements
• Compensation and benefits package
• Team structure and company culture
• Next steps in the process

Would you have 15 minutes for a quick call this week?

Best regards,
{{recruiterName}}` : '',
      variables: ['firstName', 'lastName', 'companyName', 'skillArea', 'jobTitle', 'recruiterName'],
      triggerType: isFollowUp ? 'delay' as const : 'immediate' as const,
      delayHours: isFollowUp ? 72 : 0, // 3 days for follow-ups
      delayMinutes: 0,
      isActive: true
    };

    setFormData(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }));
  };

  const removeStep = (stepIndex: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps?.filter((_, index) => index !== stepIndex)
        .map((step, index) => ({ ...step, stepOrder: index + 1 })) || []
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagIndex: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter((_, index) => index !== tagIndex) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      alert('Please enter a sequence name');
      return;
    }

    if (!formData.steps?.length) {
      alert('Please add at least one step');
      return;
    }

    // Validate that all steps have content
    for (let i = 0; i < formData.steps.length; i++) {
      const step = formData.steps[i];
      if (!step.name?.trim()) {
        alert(`Please enter a name for step ${i + 1}`);
        return;
      }
      if (!step.content?.trim()) {
        alert(`Please enter content for step ${i + 1}: "${step.name}"`);
        return;
      }
      if (step.type === 'email' && !step.subject?.trim()) {
        alert(`Please enter a subject line for email step ${i + 1}: "${step.name}"`);
        return;
      }
    }

    onSave(formData as CreateSequenceRequest);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      type: 'candidate_outreach',
      category: 'candidate_sourcing',
      scope: 'global',
      status: 'draft',
      isActive: false,
      isPreset: true,
      tags: [],        steps: [
          {
            name: 'Initial Outreach',
            description: 'First contact with the candidate',
            type: 'email',
            status: 'active',
            stepOrder: 1,
            subject: 'Exciting Opportunity at {{companyName}}',
            content: `Hi {{firstName}},

I hope this message finds you well. I came across your profile and was impressed by your experience in {{skillArea}}.

We have an exciting {{jobTitle}} opportunity at {{companyName}} that I think would be a perfect fit for your background. The role offers:

• Competitive salary and benefits
• Flexible work arrangements
• Growth opportunities
• Collaborative team environment

Would you be interested in learning more about this opportunity? I'd love to schedule a brief call to discuss the details.

Best regards,
{{recruiterName}}`,
            variables: ['firstName', 'lastName', 'companyName', 'skillArea', 'jobTitle', 'recruiterName'],
            triggerType: 'immediate',
            delayHours: 0,
            delayMinutes: 0,
            isActive: true
          }
        ],
      timing: {
        autoAdvance: true,
        defaultDelay: 24,
        businessHoursOnly: true,
        timezone: 'America/New_York'
      }
    });
    setNewTag('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit System Preset' : 'Create System Preset'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">System Preset Notice</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {mode === 'edit' 
                      ? 'Changes to this system preset will affect all users who haven\'t customized this sequence.'
                      : 'This sequence will be available as a template to all users and organizations. Make sure the content is appropriate and professional.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sequence Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="e.g., Software Engineer Outreach"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type || ''}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="candidate_outreach">Candidate Outreach</option>
                    <option value="client_outreach">Client Outreach</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="candidate_sourcing">Candidate Sourcing</option>
                    <option value="client_outreach">Client Outreach</option>
                    <option value="recruitment">Recruitment</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  rows={3}
                  placeholder="Describe the purpose and use case for this sequence..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Timing Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Timing Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Delay (hours)
                  </label>
                  <input
                    type="number"
                    value={formData.timing?.defaultDelay || 24}
                    onChange={(e) => handleTimingChange('defaultDelay', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.timing?.timezone || 'America/New_York'}
                    onChange={(e) => handleTimingChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.timing?.autoAdvance || false}
                    onChange={(e) => handleTimingChange('autoAdvance', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-advance sequences</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.timing?.businessHoursOnly || false}
                    onChange={(e) => handleTimingChange('businessHoursOnly', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
                  />
                  <span className="ml-2 text-sm text-gray-700">Business hours only</span>
                </label>
              </div>
            </div>

            {/* Sequence Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Sequence Steps</h3>
                <button
                  type="button"
                  onClick={addStep}
                  className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Step
                </button>
              </div>

              <div className="space-y-4">
                {formData.steps?.map((step, stepIndex) => (
                  <div key={stepIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Step {stepIndex + 1}</h4>
                      {formData.steps!.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(stepIndex)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Step Name
                        </label>
                        <input
                          type="text"
                          value={step.name}
                          onChange={(e) => handleStepChange(stepIndex, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={step.type}
                          onChange={(e) => handleStepChange(stepIndex, 'type', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="email">Email</option>
                          <option value="linkedin_message">LinkedIn Message</option>
                          <option value="call">Call</option>
                          <option value="task">Task</option>
                          <option value="wait">Wait</option>
                        </select>
                      </div>

                      {step.type === 'email' && (
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Subject Line
                          </label>
                          <input
                            type="text"
                            value={step.subject || ''}
                            onChange={(e) => handleStepChange(stepIndex, 'subject', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                            placeholder="Email subject line..."
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Content
                        </label>
                        <textarea
                          value={step.content}
                          onChange={(e) => handleStepChange(stepIndex, 'content', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                          rows={4}
                          placeholder="Step content... Use {{firstName}}, {{lastName}}, {{companyName}} for variables"
                        />
                      </div>

                      {stepIndex > 0 && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Delay Hours
                            </label>
                            <input
                              type="number"
                              value={step.delayHours}
                              onChange={(e) => handleStepChange(stepIndex, 'delayHours', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                              min="0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Delay Minutes
                            </label>
                            <input
                              type="number"
                              value={step.delayMinutes}
                              onChange={(e) => handleStepChange(stepIndex, 'delayMinutes', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                              min="0"
                              max="59"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0 bg-white">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name?.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (mode === 'edit' ? 'Updating...' : 'Creating...') 
                : (mode === 'edit' ? 'Update Preset' : 'Create Preset')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSequenceModal;
