import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Video, Phone, Users, Plus, Minus, Save, Loader2 } from 'lucide-react';
import type { Interview, CreateInterviewParticipant } from '../../../../../types/interview.types';
import { InterviewType, InterviewMode, InterviewStage, ParticipantRole } from '../../../../../types/interview.types';
import { useUpdateInterview } from '../../../../../hooks/useInterviews';
import { toast } from '../../../../../components/ToastContainer';

interface EditInterviewFormProps {
  interview: Interview;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const interviewTypes = Object.values(InterviewType);
const interviewModes = Object.values(InterviewMode);
const interviewStages = Object.values(InterviewStage);
const participantRoles = Object.values(ParticipantRole);

export const EditInterviewForm: React.FC<EditInterviewFormProps> = ({
  interview,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    type: interview.type,
    mode: interview.mode,
    stage: interview.stage,
    scheduledAt: new Date(interview.scheduledAt).toISOString().slice(0, 16),
    durationMinutes: interview.durationMinutes,
    location: interview.location || '',
    meetingLink: interview.meetingLink || '',
    meetingId: interview.meetingId || '',
    meetingPassword: interview.meetingPassword || '',
    agenda: interview.agenda || '',
    notes: interview.notes || '',
    preparationNotes: interview.preparationNotes || '',
  });

  const [participants, setParticipants] = useState<CreateInterviewParticipant[]>(
    interview.participants?.map(p => ({
      userId: p.userId,
      name: p.name,
      email: p.email,
      role: p.role,
      isRequired: p.isRequired,
      notes: p.notes || ''
    })) || []
  );

  const updateInterviewMutation = useUpdateInterview();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: interview.type,
        mode: interview.mode,
        stage: interview.stage,
        scheduledAt: new Date(interview.scheduledAt).toISOString().slice(0, 16),
        durationMinutes: interview.durationMinutes,
        location: interview.location || '',
        meetingLink: interview.meetingLink || '',
        meetingId: interview.meetingId || '',
        meetingPassword: interview.meetingPassword || '',
        agenda: interview.agenda || '',
        notes: interview.notes || '',
        preparationNotes: interview.preparationNotes || '',
      });

      setParticipants(
        interview.participants?.map(p => ({
          userId: p.userId,
          name: p.name,
          email: p.email,
          role: p.role,
          isRequired: p.isRequired,
          notes: p.notes || ''
        })) || []
      );
    }
  }, [interview, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleParticipantChange = (index: number, field: string, value: any) => {
    setParticipants(prev => prev.map((participant, i) => 
      i === index ? { ...participant, [field]: value } : participant
    ));
  };

  const addParticipant = () => {
    setParticipants(prev => [...prev, {
      userId: undefined,
      name: '',
      email: '',
      role: ParticipantRole.INTERVIEWER,
      isRequired: true,
      notes: ''
    }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (participants.length === 0) {
      toast.error('Validation Error', 'At least one participant is required');
      return;
    }

    // Validate participants
    for (const participant of participants) {
      if (!participant.userId && (!participant.name || !participant.email)) {
        toast.error('Validation Error', 'Manual participants must have both name and email');
        return;
      }
    }

    try {
      const updateData = {
        ...formData,
        participants: participants.filter(p => p.userId || (p.name && p.email)),
        durationMinutes: parseInt(formData.durationMinutes.toString()),
      };

      await updateInterviewMutation.mutateAsync({
        id: interview.id,
        data: updateData
      });

      toast.success('Interview Updated', 'Interview has been updated successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to update interview:', error);
      toast.error('Update Failed', 'Failed to update interview. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Edit Interview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Interview Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                required
              >
                {interviewTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Mode *
              </label>
              <select
                value={formData.mode}
                onChange={(e) => handleInputChange('mode', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                required
              >
                {interviewModes.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Stage *
              </label>
              <select
                value={formData.stage}
                onChange={(e) => handleInputChange('stage', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                required
              >
                {interviewStages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                min="15"
                max="480"
                value={formData.durationMinutes}
                onChange={(e) => handleInputChange('durationMinutes', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              required
            />
          </div>

          {/* Location and Meeting Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.mode === 'In-person' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter interview location"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                />
              </div>
            )}

            {(formData.mode === 'Video Call' || formData.mode === 'Hybrid') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting ID
                  </label>
                  <input
                    type="text"
                    value={formData.meetingId}
                    onChange={(e) => handleInputChange('meetingId', e.target.value)}
                    placeholder="Meeting ID"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Password
                  </label>
                  <input
                    type="text"
                    value={formData.meetingPassword}
                    onChange={(e) => handleInputChange('meetingPassword', e.target.value)}
                    placeholder="Meeting password (optional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>

          {/* Participants */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Participants *
              </label>
              <button
                type="button"
                onClick={addParticipant}
                className="flex items-center text-sm text-purple-600 hover:text-purple-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Participant
              </button>
            </div>

            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Participant {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      className="text-red-600 hover:text-red-700 p-1"
                      disabled={participants.length === 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Role *
                      </label>
                      <select
                        value={participant.role}
                        onChange={(e) => handleParticipantChange(index, 'role', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        {participantRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={participant.name || ''}
                        onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                        placeholder="Full name"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={participant.email || ''}
                        onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                        placeholder="email@example.com"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={participant.isRequired}
                        onChange={(e) => handleParticipantChange(index, 'isRequired', e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mr-2"
                      />
                      Required participant
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agenda
              </label>
              <textarea
                value={formData.agenda}
                onChange={(e) => handleInputChange('agenda', e.target.value)}
                placeholder="Interview agenda and topics to cover..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes or instructions..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preparation Notes
              </label>
              <textarea
                value={formData.preparationNotes}
                onChange={(e) => handleInputChange('preparationNotes', e.target.value)}
                placeholder="Preparation instructions for participants..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={updateInterviewMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center disabled:opacity-50"
              disabled={updateInterviewMutation.isPending}
            >
              {updateInterviewMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Interview
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
