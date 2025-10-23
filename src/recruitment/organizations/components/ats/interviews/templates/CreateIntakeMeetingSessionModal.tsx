import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, User, X, Plus, Mail, UserPlus, Trash2 } from 'lucide-react';
import { IntakeMeetingTemplate } from '../../../../../../types/intakeMeetingTemplate.types';
import { useCreateIntakeMeetingSession, useSendIntakeMeetingInvitations } from '../../../../../../hooks/useIntakeMeetingTemplates';
import { GmailReauthorizationModal } from '../../../../../../components/email/GmailReauthorizationModal';

interface CreateIntakeMeetingSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: IntakeMeetingTemplate[];
  clientId: string;
  clientName: string;
  onSessionCreated?: (sessionId: string) => void;
}

export const CreateIntakeMeetingSessionModal: React.FC<CreateIntakeMeetingSessionModalProps> = ({
  isOpen,
  onClose,
  templates,
  clientId,
  clientName,
  onSessionCreated
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [newAttendeeEmail, setNewAttendeeEmail] = useState<string>('');
  const [showGmailReconnectionModal, setShowGmailReconnectionModal] = useState(false);

  const createSessionMutation = useCreateIntakeMeetingSession();
  const sendInvitationsMutation = useSendIntakeMeetingInvitations();

  // Handle body scroll and ESC key
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add ESC key handler
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        // Restore body scroll when modal closes
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  const handleAddAttendee = () => {
    const email = newAttendeeEmail.trim();
    if (email && isValidEmail(email) && !attendees.includes(email)) {
      setAttendees([...attendees, email]);
      setNewAttendeeEmail('');
    }
  };

  const handleRemoveAttendee = (emailToRemove: string) => {
    setAttendees(attendees.filter(email => email !== emailToRemove));
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAttendee();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplateId) {
      return;
    }

    try {
      const sessionData = {
        templateId: selectedTemplateId,
        clientId,
        scheduledAt: scheduledAt || undefined,
        notes: notes || undefined,
        attendees: attendees.length > 0 ? attendees : undefined,
      };

      const session = await createSessionMutation.mutateAsync(sessionData);
      
      if (onSessionCreated) {
        onSessionCreated(session.id);
      }
      
      // Reset form
      setSelectedTemplateId('');
      setScheduledAt('');
      setNotes('');
      setAttendees([]);
      setNewAttendeeEmail('');
      onClose();
    } catch (error) {
      console.error('Failed to create intake meeting session:', error);
      
      // Check if this is a Gmail scope error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorResponse = (error as any)?.response?.data?.message || '';
      
      if (errorMessage.includes('insufficient authentication scopes') || 
          errorMessage.includes('Insufficient Permission') ||
          errorMessage.includes('Request had insufficient authentication scopes') ||
          errorMessage.includes('Gmail account needs additional permissions') ||
          errorResponse.includes('Gmail account needs additional permissions') ||
          errorResponse.includes('reconnect your Gmail account')) {
        setShowGmailReconnectionModal(true);
      }
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  
  // Get current date/time for min attribute
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed top-0 right-0 bottom-0 left-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Schedule Intake Meeting</h2>
            <p className="text-sm text-gray-500 mt-1">Create a new intake meeting session for {clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Template <span className="text-red-500">*</span>
            </label>
            {templates.length > 0 ? (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTemplateId === template.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplateId(template.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          {template.isDefault && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {template.questions?.length || 0} questions
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            ~60 min
                          </span>
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            Used {template.usageCount} times
                          </span>
                        </div>
                      </div>
                      
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedTemplateId === template.id
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedTemplateId === template.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No intake meeting templates available</p>
                <p className="text-sm text-gray-400">Create a template first to schedule meetings</p>
              </div>
            )}
          </div>

          {/* Schedule Date/Time */}
          <div>
            <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Date & Time (Optional)
            </label>
            <input
              type="datetime-local"
              id="scheduledAt"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={minDateTime}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to create a draft session that can be scheduled later
            </p>
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Template Preview</h4>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <strong>Questions:</strong> {selectedTemplate.questions?.length || 0}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Categories:</strong> {
                    Array.from(new Set(selectedTemplate.questions?.map(q => q.category) || [])).join(', ')
                  }
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Sections:</strong> {
                    Array.from(new Set(selectedTemplate.questions?.map(q => q.section) || [])).join(', ')
                  }
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes or special instructions for this intake meeting..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Meeting Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Attendees
            </label>
            
            {/* Add attendee input */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={newAttendeeEmail}
                  onChange={(e) => setNewAttendeeEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter email address..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddAttendee}
                disabled={!newAttendeeEmail.trim() || !isValidEmail(newAttendeeEmail.trim()) || attendees.includes(newAttendeeEmail.trim())}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
            
            {/* Attendees list */}
            {attendees.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">Attendees ({attendees.length}):</p>
                <div className="space-y-1">
                  {attendees.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(email)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              {scheduledAt ? (
                'Invitations will be sent automatically when the session is created.'
              ) : (
                'Add attendees who will receive meeting invitations once the session is scheduled.'
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedTemplateId || createSessionMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {createSessionMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Session</span>
                </>
              )}
            </button>
          </div>
          </form>
        </div>
      </div>

      {/* Gmail Reauthorization Modal */}
      <GmailReauthorizationModal
        isOpen={showGmailReconnectionModal}
        onClose={() => setShowGmailReconnectionModal(false)}
        onSuccess={() => {
          setShowGmailReconnectionModal(false);
          // Optionally retry the session creation
        }}
        title="Gmail Connection Required"
        message="To send meeting invitations, we need additional Gmail permissions. Please reconnect your Gmail account to continue."
      />
    </div>
  );

  // Render modal content in a portal to bypass any parent z-index issues
  return createPortal(modalContent, document.body);
};
