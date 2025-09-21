import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Video, Phone, Plus, Trash2, Users, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  InterviewType,
  InterviewMode,
  InterviewStage,
  ParticipantRole,
  CreateInterviewRequest,
} from '../../../../../types/interview.types';
import { InterviewTemplate } from '../../../../../types/interviewTemplate.types';
import { useCreateInterview } from '../../../../../hooks/useInterviews';
import { useInterviewTemplates } from '../../../../../hooks/useInterviewTemplates';
import { jobApplicationApiService } from '../../../../../services/jobApplicationApiService';

interface ScheduleInterviewFormProps {
  jobId: string;
  onClose: () => void;
  onSuccess: (interview: any) => void;
  selectedCandidateId?: string;
  selectedTemplate?: InterviewTemplate | null;
  hiringTeamMembers?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    memberType: 'internal' | 'external';
  }>;
}

const INTERVIEW_TYPES = [
  InterviewType.PHONE_SCREEN,
  InterviewType.TECHNICAL,
  InterviewType.BEHAVIORAL,
  InterviewType.FINAL,
  InterviewType.PANEL,
  InterviewType.CULTURE_FIT,
  InterviewType.CASE_STUDY,
  InterviewType.PRESENTATION,
];

const INTERVIEW_MODES = [
  InterviewMode.IN_PERSON,
  InterviewMode.VIDEO_CALL,
  InterviewMode.PHONE_CALL,
  InterviewMode.HYBRID,
];

const INTERVIEW_STAGES = [
  InterviewStage.INITIAL_SCREENING,
  InterviewStage.FIRST_ROUND,
  InterviewStage.SECOND_ROUND,
  InterviewStage.THIRD_ROUND,
  InterviewStage.FINAL_ROUND,
  InterviewStage.FOLLOW_UP,
];

const PARTICIPANT_ROLES = [
  ParticipantRole.INTERVIEWER,
  ParticipantRole.PANEL_MEMBER,
  ParticipantRole.OBSERVER,
  ParticipantRole.FACILITATOR,
  ParticipantRole.HIRING_MANAGER,
  ParticipantRole.TECHNICAL_LEAD,
  ParticipantRole.HR_REPRESENTATIVE,
];

// Define the participant structure for manual entry
interface ManualParticipant {
  name: string;
  email: string;
  role: ParticipantRole;
  isRequired: boolean;
}

export const ScheduleInterviewForm: React.FC<ScheduleInterviewFormProps> = ({
  jobId,
  onClose,
  onSuccess,
  selectedCandidateId,
  selectedTemplate,
  hiringTeamMembers = [],
}) => {
  const [formData, setFormData] = useState<Omit<CreateInterviewRequest, 'participants'> & { participants: ManualParticipant[] }>({
    jobApplicationId: '',
    type: InterviewType.PHONE_SCREEN,
    mode: InterviewMode.VIDEO_CALL,
    stage: InterviewStage.INITIAL_SCREENING,
    scheduledAt: '',
    durationMinutes: 60,
    participants: [],
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showHiringTeamDropdown, setShowHiringTeamDropdown] = useState(true);
  const [internalSelectedTemplate, setInternalSelectedTemplate] = useState<InterviewTemplate | null>(selectedTemplate || null);

  // Fetch templates for this job
  const { data: templatesData } = useInterviewTemplates({ 
    jobId: jobId 
  });
  
  const availableTemplates = Array.isArray(templatesData) ? templatesData : templatesData?.templates || [];

  // Fetch job applications for this job
  const { data: jobApplicationsData, isLoading: loadingApplications } = useQuery({
    queryKey: ['jobApplications', jobId],
    queryFn: () => jobApplicationApiService.getJobApplicationsByJobId(jobId),
    enabled: !!jobId,
  });

  const jobApplications = jobApplicationsData?.applications || [];

  // Use the interview hook for creating interviews
  const createInterviewMutation = useCreateInterview();

  // Set selected candidate if provided
  useEffect(() => {
    if (selectedCandidateId && jobApplications) {
      const application = jobApplications.find(
        app => app.candidateId === selectedCandidateId
      );
      if (application) {
        setFormData(prev => ({
          ...prev,
          jobApplicationId: application.id,
        }));
      }
    }
  }, [selectedCandidateId, jobApplications]);

  // Initialize form with template data if provided
  useEffect(() => {
    const templateToUse = internalSelectedTemplate || selectedTemplate;
    if (templateToUse) {
      setFormData(prev => ({
        ...prev,
        type: templateToUse.interviewType as InterviewType,
        durationMinutes: templateToUse.duration,
        preparationNotes: templateToUse.preparationNotes || '',
        agenda: createAgendaFromTemplate(templateToUse),
      }));
    }
  }, [internalSelectedTemplate, selectedTemplate]);

  const createAgendaFromTemplate = (template: InterviewTemplate): string => {
    let agenda = '';
    
    if (template.instructions) {
      agenda += `Interview Instructions:\n${template.instructions}\n\n`;
    }
    
    if (template.questions && template.questions.length > 0) {
      agenda += 'Interview Questions:\n';
      template.questions.forEach((question, index) => {
        agenda += `${index + 1}. [${question.timeLimit}min] ${question.question}\n`;
        if (question.expectedAnswer) {
          agenda += `   Expected: ${question.expectedAnswer}\n`;
        }
        agenda += '\n';
      });
    }
    
    if (template.evaluationCriteria && template.evaluationCriteria.length > 0) {
      agenda += 'Evaluation Criteria:\n';
      template.evaluationCriteria.forEach((criterion, index) => {
        agenda += `${index + 1}. ${criterion}\n`;
      });
    }
    
    return agenda.trim();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const addParticipant = () => {
    setFormData(prev => ({
      ...prev,
      participants: [
        ...prev.participants,
        {
          name: '',
          email: '',
          role: ParticipantRole.INTERVIEWER,
          isRequired: true,
        },
      ],
    }));
  };

  const addHiringTeamMember = (member: typeof hiringTeamMembers[0]) => {
    // Check if member is already added
    const isAlreadyAdded = formData.participants.some(p => p.email === member.email);
    if (isAlreadyAdded) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      participants: [
        ...prev.participants,
        {
          name: member.name,
          email: member.email,
          role: member.role.includes('Recruiter') ? ParticipantRole.HR_REPRESENTATIVE : 
                member.role.includes('Manager') ? ParticipantRole.HIRING_MANAGER : 
                ParticipantRole.INTERVIEWER,
          isRequired: true,
        },
      ],
    }));
  };

  const updateParticipant = (index: number, field: keyof ManualParticipant, value: any) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.map((participant, i) =>
        i === index ? { ...participant, [field]: value } : participant
      ),
    }));
  };

  const removeParticipant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.jobApplicationId) {
      newErrors.jobApplicationId = 'Please select a candidate';
    }
    if (!formData.scheduledAt) {
      newErrors.scheduledAt = 'Please select a date and time';
    }
    if (formData.participants.length === 0) {
      newErrors.participants = 'Please add at least one interviewer';
    }
    if (formData.participants.some(p => !p.name || !p.email)) {
      newErrors.participants = 'Please fill in name and email for all interviewers';
    }
    if (formData.mode === InterviewMode.IN_PERSON && !formData.location) {
      newErrors.location = 'Location is required for in-person interviews';
    }
    if (formData.mode === InterviewMode.VIDEO_CALL && !formData.meetingLink) {
      newErrors.meetingLink = 'Meeting link is required for video calls';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Transform manual participants to API format
      const templateToUse = internalSelectedTemplate || selectedTemplate;
      const apiFormData: CreateInterviewRequest = {
        ...formData,
        templateId: templateToUse?.id,
        participants: formData.participants.map(p => ({
          name: p.name,
          email: p.email,
          role: p.role,
          isRequired: p.isRequired,
        })),
      };
      
      createInterviewMutation.mutate(apiFormData, {
        onSuccess: (data) => {
          onSuccess(data);
          onClose();
        },
        onError: (error: any) => {
          console.error('Failed to create interview:', error);
          if (error.response?.data?.message) {
            setErrors({ general: error.response.data.message });
          }
        },
      });
    }
  };

  if (loadingApplications) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Schedule Interview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Template Information */}
          {(internalSelectedTemplate || selectedTemplate) && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-medium text-purple-900">Using Template: {(internalSelectedTemplate || selectedTemplate)?.name}</h3>
              </div>
              <p className="text-sm text-purple-700 mb-3">{(internalSelectedTemplate || selectedTemplate)?.description}</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-purple-800">Type:</span>
                  <span className="text-purple-700 ml-1">{(internalSelectedTemplate || selectedTemplate)?.interviewType}</span>
                </div>
                <div>
                  <span className="font-medium text-purple-800">Duration:</span>
                  <span className="text-purple-700 ml-1">{(internalSelectedTemplate || selectedTemplate)?.duration} minutes</span>
                </div>
                <div>
                  <span className="font-medium text-purple-800">Questions:</span>
                  <span className="text-purple-700 ml-1">{(internalSelectedTemplate || selectedTemplate)?.questions.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Candidate Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Candidate *
              </label>
              <select
                value={formData.jobApplicationId}
                onChange={(e) => handleInputChange('jobApplicationId', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                required
              >
                <option value="">Select candidate...</option>
                {jobApplications?.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.candidate?.fullName || 'Unknown Candidate'} - {application.candidate?.email || 'No email'}
                  </option>
                ))}
              </select>
              {errors.jobApplicationId && (
                <p className="text-sm text-red-600 mt-1">{errors.jobApplicationId}</p>
              )}
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Template (Optional)
              </label>
              <select
                value={internalSelectedTemplate?.id || ''}
                onChange={(e) => {
                  const templateId = e.target.value;
                  const template = availableTemplates.find(t => t.id === templateId);
                  setInternalSelectedTemplate(template || null);
                  
                  // Auto-populate fields based on template
                  if (template) {
                    setFormData(prev => ({
                      ...prev,
                      type: template.interviewType as InterviewType,
                      durationMinutes: template.duration,
                      preparationNotes: template.preparationNotes || '',
                      agenda: createAgendaFromTemplate(template),
                    }));
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
              >
                <option value="">No template - Create custom interview</option>
                {availableTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.interviewType} • {template.duration}min • {template.questions.length} questions)
                  </option>
                ))}
              </select>
              {internalSelectedTemplate && (
                <p className="text-sm text-gray-600 mt-1">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Using template will auto-populate interview details
                </p>
              )}
            </div>
          </div>

          {/* Interview Type and Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Interview Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as InterviewType)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                required
              >
                {INTERVIEW_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Interview Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Mode *
              </label>
              <select
                value={formData.mode}
                onChange={(e) => handleInputChange('mode', e.target.value as InterviewMode)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                required
              >
                {INTERVIEW_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>

            {/* Interview Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Stage *
              </label>
              <select
                value={formData.stage}
                onChange={(e) => handleInputChange('stage', e.target.value as InterviewStage)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                required
              >
                {INTERVIEW_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduled Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date & Time *
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  required
                />
                <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
              </div>
              {errors.scheduledAt && (
                <p className="text-sm text-red-600 mt-1">{errors.scheduledAt}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value))}
                  min="15"
                  max="480"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                />
                <Clock className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* Location/Meeting Details */}
          {formData.mode === InterviewMode.IN_PERSON && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter interview location"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  required
                />
                <MapPin className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
              </div>
              {errors.location && (
                <p className="text-sm text-red-600 mt-1">{errors.location}</p>
              )}
            </div>
          )}

          {formData.mode === InterviewMode.VIDEO_CALL && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Link *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.meetingLink || ''}
                    onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    required
                  />
                  <Video className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
                </div>
                {errors.meetingLink && (
                  <p className="text-sm text-red-600 mt-1">{errors.meetingLink}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.meetingId || ''}
                  onChange={(e) => handleInputChange('meetingId', e.target.value)}
                  placeholder="Meeting ID or Room Number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {formData.mode === InterviewMode.PHONE_CALL && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Phone number for the call"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                />
                <Phone className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
              </div>
            </div>
          )}

          {/* Participants */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Interviewers *
              </label>
              <div className="flex items-center space-x-2">
                {hiringTeamMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowHiringTeamDropdown(!showHiringTeamDropdown)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    {showHiringTeamDropdown ? 'Hide' : 'Show'} Hiring Team
                  </button>
                )}
                <button
                  type="button"
                  onClick={addParticipant}
                  className="flex items-center text-sm text-purple-600 hover:text-purple-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Manually
                </button>
              </div>
            </div>

            {/* Hiring Team Dropdown */}
            {showHiringTeamDropdown && hiringTeamMembers.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Add from Hiring Team</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {hiringTeamMembers.map((member) => {
                    const isAlreadyAdded = formData.participants.some(p => p.email === member.email);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => addHiringTeamMember(member)}
                        disabled={isAlreadyAdded}
                        className={`text-left p-2 border rounded-md transition-colors ${
                          isAlreadyAdded
                            ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white border-blue-300 hover:bg-blue-50 hover:border-blue-400'
                        }`}
                      >
                        <div className="font-medium text-sm">{member.name}</div>
                        <div className="text-xs text-gray-600">{member.role}</div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                        {isAlreadyAdded && (
                          <div className="text-xs text-green-600 mt-1">✓ Added</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {formData.participants.map((participant, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 border border-gray-200 rounded-md">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={participant.name}
                    onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                    placeholder="Interviewer name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={participant.email}
                    onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                    placeholder="interviewer@company.com"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={participant.role}
                    onChange={(e) => updateParticipant(index, 'role', e.target.value as ParticipantRole)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  >
                    {PARTICIPANT_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={participant.isRequired}
                      onChange={(e) => updateParticipant(index, 'isRequired', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-xs text-gray-600">Required</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {errors.participants && (
              <p className="text-sm text-red-600 mt-1">{errors.participants}</p>
            )}
          </div>

          {/* Advanced Options */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-purple-600 hover:text-purple-700 mb-3"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>

            {showAdvanced && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agenda
                  </label>
                  <textarea
                    value={formData.agenda || ''}
                    onChange={(e) => handleInputChange('agenda', e.target.value)}
                    placeholder="Interview agenda and topics to cover..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preparation Notes
                  </label>
                  <textarea
                    value={formData.preparationNotes || ''}
                    onChange={(e) => handleInputChange('preparationNotes', e.target.value)}
                    placeholder="Notes for interviewers to prepare..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interview Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes..."
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {formData.mode === InterviewMode.VIDEO_CALL && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Password
                    </label>
                    <input
                      type="text"
                      value={formData.meetingPassword || ''}
                      onChange={(e) => handleInputChange('meetingPassword', e.target.value)}
                      placeholder="Meeting password (if required)"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createInterviewMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {createInterviewMutation.isPending ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
