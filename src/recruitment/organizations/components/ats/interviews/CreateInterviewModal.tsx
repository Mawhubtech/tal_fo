import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, MapPin, Video, Phone, User, FileText } from 'lucide-react';
import { useCreateInterview } from '../../../../../hooks/useInterviews';
import { useInterviewTemplates } from '../../../../../hooks/useInterviewTemplates';
import type { 
  CreateInterviewRequest, 
  InterviewType, 
  InterviewMode, 
  InterviewStage, 
  ParticipantRole,
  CreateInterviewParticipant 
} from '../../../../../types/interview.types';
import type { InterviewTemplate } from '../../../../../types/interviewTemplate.types';

interface CreateInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobApplicationId?: string;
  jobId?: string;
  onSuccess: () => void;
}

const interviewTypes = [
  { value: 'Phone Screen', label: 'Phone Screen' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Behavioral', label: 'Behavioral' },
  { value: 'Final', label: 'Final' },
  { value: 'Panel', label: 'Panel' },
  { value: 'Culture Fit', label: 'Culture Fit' },
  { value: 'Case Study', label: 'Case Study' },
  { value: 'Presentation', label: 'Presentation' },
];

const interviewModes = [
  { value: 'Video Call', label: 'Video Call', icon: Video },
  { value: 'Phone Call', label: 'Phone Call', icon: Phone },
  { value: 'In-person', label: 'In-person', icon: MapPin },
  { value: 'Hybrid', label: 'Hybrid', icon: Users },
];

const interviewStages = [
  { value: 'Initial Screening', label: 'Initial Screening' },
  { value: 'First Round', label: 'First Round' },
  { value: 'Second Round', label: 'Second Round' },
  { value: 'Third Round', label: 'Third Round' },
  { value: 'Final Round', label: 'Final Round' },
  { value: 'Follow-up', label: 'Follow-up' },
];

const participantRoles = [
  { value: 'Interviewer', label: 'Interviewer' },
  { value: 'Panel Member', label: 'Panel Member' },
  { value: 'Hiring Manager', label: 'Hiring Manager' },
  { value: 'Technical Lead', label: 'Technical Lead' },
  { value: 'HR Representative', label: 'HR Representative' },
  { value: 'Observer', label: 'Observer' },
  { value: 'Facilitator', label: 'Facilitator' },
];

export const CreateInterviewModal: React.FC<CreateInterviewModalProps> = ({
  isOpen,
  onClose,
  jobApplicationId,
  jobId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Partial<CreateInterviewRequest>>({
    jobApplicationId: jobApplicationId || '',
    templateId: '',
    type: 'Phone Screen' as InterviewType,
    mode: 'Video Call' as InterviewMode,
    stage: 'Initial Screening' as InterviewStage,
    scheduledAt: '',
    durationMinutes: 60,
    participants: [],
  });

  const [participants, setParticipants] = useState<CreateInterviewParticipant[]>([]);
  const [newParticipant, setNewParticipant] = useState({
    userId: '',
    role: 'Interviewer' as ParticipantRole,
    isRequired: true,
  });

  const createInterviewMutation = useCreateInterview();
  
  // Fetch templates for this job
  const { data: templatesResponse } = useInterviewTemplates({ 
    jobId: jobId || undefined
  });
  
  const availableTemplates = Array.isArray(templatesResponse) ? templatesResponse : templatesResponse?.templates || [];

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        jobApplicationId: jobApplicationId || '',
        templateId: '',
        type: 'Phone Screen' as InterviewType,
        mode: 'Video Call' as InterviewMode,
        stage: 'Initial Screening' as InterviewStage,
        scheduledAt: '',
        durationMinutes: 60,
        participants: [],
      });
      setParticipants([]);
    }
  }, [isOpen, jobApplicationId]);

  const handleInputChange = (field: keyof CreateInterviewRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addParticipant = () => {
    if (newParticipant.userId) {
      setParticipants(prev => [...prev, { ...newParticipant }]);
      setNewParticipant({
        userId: '',
        role: 'Interviewer' as ParticipantRole,
        isRequired: true,
      });
    }
  };

  const removeParticipant = (index: number) => {
    setParticipants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobApplicationId || !formData.scheduledAt || participants.length === 0) {
      return;
    }

    try {
      await createInterviewMutation.mutateAsync({
        ...formData,
        participants,
      } as CreateInterviewRequest);
      
      onSuccess();
    } catch (error) {
      console.error('Failed to create interview:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Schedule New Interview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={createInterviewMutation.isPending}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Application ID */}
          {!jobApplicationId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Application ID
              </label>
              <input
                type="text"
                value={formData.jobApplicationId || ''}
                onChange={(e) => handleInputChange('jobApplicationId', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          )}

          {/* Interview Template Selection */}
          {availableTemplates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Template (Optional)
              </label>
              <select
                value={formData.templateId || ''}
                onChange={(e) => {
                  const templateId = e.target.value;
                  const selectedTemplate = availableTemplates.find(t => t.id === templateId);
                  
                  handleInputChange('templateId', templateId || undefined);
                  
                  // Auto-populate fields based on template
                  if (selectedTemplate) {
                    handleInputChange('type', selectedTemplate.interviewType);
                    handleInputChange('durationMinutes', selectedTemplate.duration);
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">No template - Create custom interview</option>
                {availableTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.interviewType} • {template.duration}min • {template.questions.length} questions)
                  </option>
                ))}
              </select>
              {formData.templateId && (
                <p className="text-sm text-gray-600 mt-1">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Using template will pre-populate interview type and duration
                </p>
              )}
            </div>
          )}

          {/* Interview Type and Stage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Type
              </label>
              <select
                value={formData.type || ''}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                {interviewTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Stage
              </label>
              <select
                value={formData.stage || ''}
                onChange={(e) => handleInputChange('stage', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                {interviewStages.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interview Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Mode
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {interviewModes.map(mode => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => handleInputChange('mode', mode.value)}
                    className={`p-3 rounded-lg border text-center ${
                      formData.mode === mode.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt || ''}
                onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="480"
                step="15"
                value={formData.durationMinutes || 60}
                onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Location/Meeting Details */}
          {formData.mode === 'In-person' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Meeting room, office address, etc."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Video className="w-4 h-4 inline mr-1" />
                Meeting Link
              </label>
              <input
                type="url"
                value={formData.meetingLink || ''}
                onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                placeholder="Zoom, Teams, or other meeting link"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Participants
            </label>
            
            {/* Add Participant */}
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                placeholder="User ID or email"
                value={newParticipant.userId}
                onChange={(e) => setNewParticipant(prev => ({ ...prev, userId: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={newParticipant.role}
                onChange={(e) => setNewParticipant(prev => ({ ...prev, role: e.target.value as ParticipantRole }))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {participantRoles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addParticipant}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add
              </button>
            </div>

            {/* Participants List */}
            {participants.length > 0 && (
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium">{participant.userId}</span>
                      <span className="text-sm text-gray-500 ml-2">({participant.role})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agenda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agenda (Optional)
            </label>
            <textarea
              value={formData.agenda || ''}
              onChange={(e) => handleInputChange('agenda', e.target.value)}
              rows={3}
              placeholder="Interview agenda and topics to cover..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              placeholder="Additional notes or instructions..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={createInterviewMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createInterviewMutation.isPending || participants.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {createInterviewMutation.isPending ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
