import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Send, Calendar, Users, Target, Settings } from 'lucide-react';
import { usePipeline } from '../../../hooks/usePipelines';
import { useCreateSequence, useProjectSequenceSteps } from '../../../hooks/useSourcingSequences';
import { CreateSourcingSequenceDto } from '../../../services/sourcingProjectApiService';

interface CreateEmailCampaignModalProps {
  projectId: string;
  project: any; // Add project data
  onClose: () => void;
  onSuccess: (sequenceId: string) => void; // Return the created sequence ID
}

export const CreateEmailCampaignModal: React.FC<CreateEmailCampaignModalProps> = ({
  projectId,
  project,
  onClose,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedSteps: [] as string[], // Changed from templateId to selectedSteps
    targetStages: [] as string[],
    sendImmediately: true,
    scheduledDate: '',
    scheduledTime: '',
    delayBetweenEmails: 0, // minutes
    maxEmailsPerDay: 50,
    respectBusinessHours: true,
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
    workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    variables: {} as Record<string, string>,
  });

  // Get pipeline data for the project
  const { data: pipeline } = usePipeline(project?.pipelineId);
  const { data: availableSteps, isLoading: stepsLoading } = useProjectSequenceSteps(projectId);
  const createSequenceMutation = useCreateSequence();

  // Dynamic stage options based on project pipeline
  const stageOptions = useMemo(() => {
    if (pipeline?.stages?.length > 0) {
      // Deduplicate stages by ID
      const stageMap = new Map();
      pipeline.stages.forEach(stage => {
        if (stage.id) {
          stageMap.set(stage.id, {
            value: stage.id,
            label: stage.name,
            description: stage.description,
            color: stage.color,
          });
        }
      });
      return Array.from(stageMap.values());
    }
    
    // Fallback stages if no pipeline is found
    return [
      { value: 'sourced', label: 'Sourced', description: 'Initial sourced candidates' },
      { value: 'contacted', label: 'Contacted', description: 'Candidates that have been contacted' },
      { value: 'screening', label: 'Screening', description: 'Candidates in screening process' },
      { value: 'interviewing', label: 'Interviewing', description: 'Candidates in interview process' },
      { value: 'offer', label: 'Offer', description: 'Candidates with offers' },
      { value: 'hired', label: 'Hired', description: 'Successfully hired candidates' },
      { value: 'rejected', label: 'Rejected', description: 'Rejected candidates' },
    ];
  }, [pipeline]);

  // Candidate variable options for email templates
  const candidateVariables = [
    'candidate_name', 'candidate_first_name', 'candidate_last_name', 'candidate_email',
    'candidate_phone', 'candidate_location', 'candidate_linkedin', 'candidate_github',
    'current_company', 'current_position', 'years_experience', 'skills', 'education',
    'salary_expectation', 'notice_period', 'availability', 'preferred_location',
    'recruiter_name', 'recruiter_email', 'recruiter_phone', 'company_name',
    'position_title', 'job_location', 'salary_range', 'benefits',
    'project_name', 'project_description', 'team_name', 'hiring_manager'
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLaunchCampaign = async () => {
    console.log('Launch campaign clicked');
    setIsSubmitting(true);
    
    try {
      if (!availableSteps || formData.selectedSteps.length === 0) {
        throw new Error('Please select at least one step for the campaign');
      }

      const selectedSteps = availableSteps.filter(step => 
        formData.selectedSteps.includes(step.id)
      );

      // Transform form data into CreateSourcingSequenceDto format
      const sequenceData: CreateSourcingSequenceDto = {
        name: formData.name,
        description: formData.description,
        type: 'email',
        trigger: formData.sendImmediately ? 'manual' : 'time_based',
        projectId: projectId,
        config: {
          selectedSteps: selectedSteps.map(step => ({
            id: step.id,
            name: step.name,
            type: step.type,
            stepOrder: step.stepOrder,
            subject: step.subject,
            content: step.content,
            config: step.config,
          })),
          targetStages: formData.targetStages,
          schedulingSettings: {
            sendImmediately: formData.sendImmediately,
            scheduledDate: formData.scheduledDate,
            scheduledTime: formData.scheduledTime,
            delayBetweenEmails: formData.delayBetweenEmails,
            maxEmailsPerDay: formData.maxEmailsPerDay,
            respectBusinessHours: formData.respectBusinessHours,
            businessHoursStart: formData.businessHoursStart,
            businessHoursEnd: formData.businessHoursEnd,
            workDays: formData.workDays,
          },
          variables: formData.variables,
        },
        targetCriteria: {
          pipelineStages: formData.targetStages,
        },
      };

      console.log('Creating campaign with data:', sequenceData);
      
      // Create the email sequence
      await createSequenceMutation.mutateAsync(sequenceData);
      
      console.log('Campaign created successfully');
      onSuccess();
    } catch (error) {
      console.error('Error creating campaign:', error);
      // You might want to show an error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent form submission - we handle campaign creation manually
    console.log('Form submission prevented');
  };

  const steps = [
    { id: 1, title: 'Campaign Details', icon: Settings },
    { id: 2, title: 'Template & Audience', icon: Target },
    { id: 3, title: 'Schedule & Settings', icon: Calendar },
    { id: 4, title: 'Review & Launch', icon: Send },
  ];

  const canProceed = () => {
    switch (activeStep) {
      case 1:
        return formData.name && formData.description;
      case 2:
        return formData.selectedSteps.length > 0 && formData.targetStages.length > 0;
      case 3:
        return formData.sendImmediately || (formData.scheduledDate && formData.scheduledTime);
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create Email Campaign</h2>
              <p className="text-gray-600 mt-1">Set up an automated email campaign for your project</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    activeStep >= step.id
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {activeStep > step.id ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    activeStep >= step.id ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    activeStep > step.id ? 'bg-purple-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Step 1: Campaign Details */}
            {activeStep === 1 && (
              <div className="space-y-6">
                {/* Project Context */}
                {project && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">Project Context</h4>
                    <div className="text-sm text-purple-700 space-y-1">
                      <p><span className="font-medium">Project:</span> {project.name}</p>
                      {project.description && (
                        <p><span className="font-medium">Description:</span> {project.description}</p>
                      )}
                      {pipeline && (
                        <p><span className="font-medium">Pipeline:</span> {pipeline.name} ({pipeline.stages?.length || 0} stages)</p>
                      )}
                      {project.assignedToTeam && (
                        <p><span className="font-medium">Team:</span> {project.assignedToTeam.name}</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="e.g., Senior Developer Outreach - January 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="Describe the purpose and goals of this campaign..."
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Campaign Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use descriptive names that include the role and time period</li>
                    <li>• Include campaign goals in the description for team clarity</li>
                    <li>• Consider your target audience when naming campaigns</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 2: Steps & Audience */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Sequence Steps *
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose the steps that will be executed in this campaign. Steps will run in their defined order.
                  </p>
                  
                  {stepsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {availableSteps && availableSteps.length > 0 ? (
                        availableSteps.map(step => (
                          <div
                            key={step.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              formData.selectedSteps.includes(step.id)
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              const isSelected = formData.selectedSteps.includes(step.id);
                              const newSelectedSteps = isSelected
                                ? formData.selectedSteps.filter(id => id !== step.id)
                                : [...formData.selectedSteps, step.id];
                              setFormData({ ...formData, selectedSteps: newSelectedSteps });
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-semibold">
                                  {step.stepOrder}
                                </div>
                                <h4 className="font-medium text-gray-900">{step.name}</h4>
                              </div>
                              <input
                                type="checkbox"
                                checked={formData.selectedSteps.includes(step.id)}
                                onChange={() => {}}
                                className="text-purple-600 rounded"
                              />
                            </div>
                            {step.subject && (
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Subject:</span> {step.subject}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded capitalize">
                                {step.type.replace('_', ' ')}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                step.status === 'active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {step.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No sequence steps available.</p>
                          <p className="text-sm mt-1">Create steps in the Steps tab first.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Candidate Stages *
                  </label>
                  <div className="text-sm text-gray-600 mb-3">
                    {pipeline ? 
                      `Select stages from the "${pipeline.name}" pipeline` : 
                      'Select candidate stages that should receive this email campaign'
                    }
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stageOptions.map(stage => (
                      <label key={stage.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.targetStages.includes(stage.value)}
                          onChange={(e) => {
                            const stages = e.target.checked
                              ? [...formData.targetStages, stage.value]
                              : formData.targetStages.filter(s => s !== stage.value);
                            setFormData({ ...formData, targetStages: stages });
                          }}
                          className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{stage.label}</span>
                            {stage.color && (
                              <div 
                                className="w-3 h-3 rounded-full border border-gray-300"
                                style={{ backgroundColor: stage.color }}
                              />
                            )}
                          </div>
                          {stage.description && (
                            <p className="text-xs text-gray-600 mt-1">{stage.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  {stageOptions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No pipeline stages found for this project.</p>
                    </div>
                  )}
                </div>

                {/* Selected Steps Summary */}
                {formData.selectedSteps.length > 0 && availableSteps && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Steps Preview
                    </label>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 mb-2">Campaign will execute these steps:</h4>
                      <div className="space-y-2">
                        {formData.selectedSteps
                          .map(stepId => availableSteps.find(s => s.id === stepId))
                          .filter(Boolean)
                          .sort((a, b) => a!.stepOrder - b!.stepOrder)
                          .map((step, index) => (
                            <div key={step!.id} className="flex items-center gap-3 text-sm">
                              <span className="w-6 h-6 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </span>
                              <span className="font-medium text-gray-900">{step!.name}</span>
                              <span className="text-gray-600">({step!.type.replace('_', ' ')})</span>
                              {step!.subject && (
                                <span className="text-gray-500 truncate">- {step!.subject}</span>
                              )}
                            </div>
                          ))}
                      </div>
                      <p className="text-xs text-purple-600 mt-2">
                        Steps will execute in the order shown above
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Schedule & Settings */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    When to Send
                  </label>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.sendImmediately}
                        onChange={() => setFormData({ ...formData, sendImmediately: true })}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Send Immediately</p>
                        <p className="text-sm text-gray-600">Start sending emails right after campaign creation</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={!formData.sendImmediately}
                        onChange={() => setFormData({ ...formData, sendImmediately: false })}
                        className="text-purple-600 focus:ring-purple-500 mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Schedule for Later</p>
                        <p className="text-sm text-gray-600 mb-3">Choose a specific date and time</p>
                        {!formData.sendImmediately && (
                          <div className="flex gap-3">
                            <input
                              type="date"
                              value={formData.scheduledDate}
                              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                            />
                            <input
                              type="time"
                              value={formData.scheduledTime}
                              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delay Between Emails (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1440"
                      value={formData.delayBetweenEmails}
                      onChange={(e) => setFormData({ ...formData, delayBetweenEmails: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    />
                    <p className="text-sm text-gray-600 mt-1">Minimum delay between individual emails</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Emails Per Day
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.maxEmailsPerDay}
                      onChange={(e) => setFormData({ ...formData, maxEmailsPerDay: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    />
                    <p className="text-sm text-gray-600 mt-1">Daily email sending limit</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.respectBusinessHours}
                    onChange={(e) => setFormData({ ...formData, respectBusinessHours: e.target.checked })}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Respect Business Hours</p>
                    <p className="text-sm text-gray-600">Only send emails during specified business hours</p>
                  </div>
                </div>

                {formData.respectBusinessHours && (
                  <div className="ml-7 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Hours Start
                        </label>
                        <input
                          type="time"
                          value={formData.businessHoursStart}
                          onChange={(e) => setFormData({ ...formData, businessHoursStart: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Hours End
                        </label>
                        <input
                          type="time"
                          value={formData.businessHoursEnd}
                          onChange={(e) => setFormData({ ...formData, businessHoursEnd: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Work Days
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                          <label key={day} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.workDays.includes(day)}
                              onChange={(e) => {
                                const workDays = e.target.checked
                                  ? [...formData.workDays, day]
                                  : formData.workDays.filter(d => d !== day);
                                setFormData({ ...formData, workDays });
                              }}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700 capitalize">{day.slice(0, 3)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Launch */}
            {activeStep === 4 && (
              <div className="space-y-6">
                {/* Project Context Review */}
                {project && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-3">Project Context</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-medium text-purple-700">Project:</p>
                        <p className="text-purple-900">{project.name}</p>
                      </div>
                      {pipeline && (
                        <div>
                          <p className="font-medium text-purple-700">Pipeline:</p>
                          <p className="text-purple-900">{pipeline.name} ({pipeline.stages?.length || 0} stages)</p>
                        </div>
                      )}
                      {project.assignedToTeam && (
                        <div>
                          <p className="font-medium text-purple-700">Team:</p>
                          <p className="text-purple-900">{project.assignedToTeam.name}</p>
                        </div>
                      )}
                      {project.description && (
                        <div className="md:col-span-2">
                          <p className="font-medium text-purple-700">Description:</p>
                          <p className="text-purple-900">{project.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Campaign Name:</p>
                      <p className="text-gray-900">{formData.name}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Steps:</p>
                      <p className="text-gray-900">
                        {formData.selectedSteps.length > 0 
                          ? `${formData.selectedSteps.length} step${formData.selectedSteps.length > 1 ? 's' : ''} selected`
                          : 'None selected'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Target Stages:</p>
                      <p className="text-gray-900">
                        {formData.targetStages.length > 0 
                          ? formData.targetStages.map(stageId => {
                              const stage = stageOptions.find(s => s.value === stageId);
                              return stage?.label || stageId;
                            }).join(', ')
                          : 'None selected'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Selected Steps Detail:</p>
                      <div className="mt-2 space-y-2">
                        {formData.selectedSteps.length > 0 && availableSteps 
                          ? formData.selectedSteps
                              .map(stepId => availableSteps.find(s => s.id === stepId))
                              .filter(Boolean)
                              .sort((a, b) => a!.stepOrder - b!.stepOrder)
                              .map((step, index) => (
                                <div key={step!.id} className="flex items-center gap-2 text-sm">
                                  <span className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-semibold">
                                    {index + 1}
                                  </span>
                                  <span className="font-medium">{step!.name}</span>
                                  <span className="text-gray-500">({step!.type.replace('_', ' ')})</span>
                                </div>
                              ))
                          : <span className="text-gray-500 text-sm">No steps selected</span>
                        }
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Sending:</p>
                      <p className="text-gray-900">
                        {formData.sendImmediately ? 'Immediately' : `${formData.scheduledDate} at ${formData.scheduledTime}`}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Max Emails/Day:</p>
                      <p className="text-gray-900">{formData.maxEmailsPerDay}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Business Hours:</p>
                      <p className="text-gray-900">
                        {formData.respectBusinessHours ? `${formData.businessHoursStart} - ${formData.businessHoursEnd}` : 'No restrictions'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Ready to Launch</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Review all settings carefully before launching. Once started, the campaign will begin sending emails 
                        according to your configuration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-between flex-shrink-0">
            <div>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep - 1)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              {activeStep < steps.length ? (
                <button
                  type="button"
                  onClick={() => {
                    console.log('Next clicked. Current step:', activeStep, 'Steps length:', steps.length);
                    const newStep = activeStep + 1;
                    console.log('Setting new step to:', newStep);
                    setActiveStep(newStep);
                  }}
                  disabled={!canProceed()}
                  className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLaunchCampaign}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Creating Campaign...' : 'Launch Campaign'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
