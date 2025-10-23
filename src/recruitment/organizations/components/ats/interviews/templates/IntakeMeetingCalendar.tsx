import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Play, 
  Edit3, 
  Trash2, 
  Plus,
  Eye,
  CheckCircle,
  AlertCircle,
  FileText,
  Mail,
  X,
  ExternalLink,
  Sparkles,
  Briefcase,
  Users
} from 'lucide-react';
import { IntakeMeetingSession } from '../../../../../../types/intakeMeetingTemplate.types';
import { 
  useIntakeMeetingSessions, 
  useDeleteIntakeMeetingSession,
  useSendIntakeMeetingInvitations,
  useJobDescription,
  useSaveJobDescription
} from '../../../../../../hooks/useIntakeMeetingTemplates';
import { CreateIntakeMeetingSessionModal } from './CreateIntakeMeetingSessionModal';
import { IntakeMeetingConductor } from './IntakeMeetingConductor';
import { GmailReauthorizationModal } from '../../../../../../components/email/GmailReauthorizationModal';
import AIJobDescriptionGenerator, { GeneratedJobDescription } from './AIJobDescriptionGenerator';
import JobDescriptionViewer from './JobDescriptionViewer';
import { CreateInterviewTemplateModal } from './CreateInterviewTemplateModal';

interface IntakeMeetingCalendarProps {
  clientId: string;
  clientName: string;
  templates: any[];
}

export const IntakeMeetingCalendar: React.FC<IntakeMeetingCalendarProps> = ({
  clientId,
  clientName,
  templates
}) => {
  const { data: sessions = [], isLoading, refetch } = useIntakeMeetingSessions(clientId);
  const deleteSessionMutation = useDeleteIntakeMeetingSession();
  const sendInvitationsMutation = useSendIntakeMeetingInvitations();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConductor, setShowConductor] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<IntakeMeetingSession | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [sessionToInvite, setSessionToInvite] = useState<IntakeMeetingSession | null>(null);
  const [showGmailReauthorizationModal, setShowGmailReauthorizationModal] = useState(false);
  const [showJobGenerator, setShowJobGenerator] = useState(false);
  const [showJobViewer, setShowJobViewer] = useState(false);
  const [selectedSessionForJob, setSelectedSessionForJob] = useState<IntakeMeetingSession | null>(null);
  const [generatedJobDescription, setGeneratedJobDescription] = useState<GeneratedJobDescription | null>(null);
  const [showInterviewTemplateGenerator, setShowInterviewTemplateGenerator] = useState(false);
  const [selectedSessionForTemplate, setSelectedSessionForTemplate] = useState<IntakeMeetingSession | null>(null);

  // Backend hooks for job description management
  const saveJobDescriptionMutation = useSaveJobDescription();

  // Helper function to check if a session has a job description
  const hasJobDescription = (session: IntakeMeetingSession) => {
    return session.jobDescription && Object.keys(session.jobDescription).length > 0;
  };

  // Handle errors for job description operations
  const handleJobDescriptionError = (error: any, operation: string) => {
    console.error(`Failed to ${operation} job description:`, error);
    // You could add toast notifications here
    alert(`Failed to ${operation} job description. Please try again.`);
  };

  const handleDeleteSession = async (session: IntakeMeetingSession) => {
    if (window.confirm(`Are you sure you want to delete this intake meeting session for ${session.template.name}?`)) {
      try {
        await deleteSessionMutation.mutateAsync(session.id);
        refetch();
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const handleConductSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowConductor(true);
  };

  const handleSessionCreated = (sessionId: string) => {
    refetch();
    // Optionally start conducting the session immediately
    handleConductSession(sessionId);
  };

  const handleSendInvitations = (session: IntakeMeetingSession) => {
    if (!session.scheduledAt) {
      alert('Cannot send invitations for unscheduled meetings. Please schedule the meeting first.');
      return;
    }
    setSessionToInvite(session);
    setShowInviteModal(true);
  };

  const handleGenerateJobDescription = (session: IntakeMeetingSession) => {
    if (session.status !== 'completed') {
      alert('Job descriptions can only be generated from completed intake meetings.');
      return;
    }
    
    if (!session.responses || Object.keys(session.responses).length === 0) {
      alert('This intake meeting has no responses to generate a job description from.');
      return;
    }
    
    setSelectedSessionForJob(session);
    setShowJobGenerator(true);
  };

  const handleJobDescriptionGenerated = async (jobDescription: GeneratedJobDescription) => {
    setGeneratedJobDescription(jobDescription);
    
    // Save to backend
    if (selectedSessionForJob) {
      try {
        await saveJobDescriptionMutation.mutateAsync({
          sessionId: selectedSessionForJob.id,
          jobDescription
        });
        // Refresh sessions to get updated data
        refetch();
      } catch (error) {
        handleJobDescriptionError(error, 'save');
        return; // Don't proceed to viewer if save failed
      }
    }
    
    setShowJobGenerator(false);
    setShowJobViewer(true);
  };

  const handleViewJobDescription = (session: IntakeMeetingSession) => {
    if (hasJobDescription(session)) {
      setSelectedSessionForJob(session);
      setGeneratedJobDescription(session.jobDescription as GeneratedJobDescription);
      setShowJobViewer(true);
    }
  };

  const handleSaveJobDescription = async (updatedJobDescription: GeneratedJobDescription) => {
    setGeneratedJobDescription(updatedJobDescription);
    
    // Save to backend
    if (selectedSessionForJob) {
      try {
        await saveJobDescriptionMutation.mutateAsync({
          sessionId: selectedSessionForJob.id,
          jobDescription: updatedJobDescription
        });
        // Refresh sessions to get updated data
        refetch();
      } catch (error) {
        handleJobDescriptionError(error, 'update');
      }
    }
  };

  const handleCreateJobFromDescription = (jobDescription: GeneratedJobDescription) => {
    // Navigate to job creation page with pre-filled data
    // This would need to be implemented based on your routing setup
    console.log('Creating job from description:', jobDescription);
    // Example: navigate('/jobs/create', { state: { jobDescription } });
  };

  const handleGenerateInterviewTemplate = (session: IntakeMeetingSession) => {
    if (session.status !== 'completed') {
      alert('Interview templates can only be generated from completed intake meetings.');
      return;
    }
    
    if (!session.responses || Object.keys(session.responses).length === 0) {
      alert('This intake meeting has no responses to generate an interview template from.');
      return;
    }

    setSelectedSessionForTemplate(session);
    setShowInterviewTemplateGenerator(true);
  };

  const handleInterviewTemplateCreated = () => {
    setShowInterviewTemplateGenerator(false);
    setSelectedSessionForTemplate(null);
    // Could add a toast notification here
  };

  // Helper function to extract job-related data from intake meeting responses
  const extractJobDataFromIntakeMeeting = (session: IntakeMeetingSession) => {
    const responses = session.responses || {};
    
    // Extract job title from common question patterns
    const jobTitle = responses.jobTitle || 
                    responses.positionTitle || 
                    responses.position || 
                    responses.role || 
                    'Position from Intake Meeting';

    // Extract job description from responses
    let jobDescription = '';
    const descriptionFields = [
      'jobDescription', 'description', 'roleDescription', 
      'responsibilities', 'duties', 'overview'
    ];
    
    for (const field of descriptionFields) {
      if (responses[field]) {
        jobDescription += responses[field] + '\n';
      }
    }

    // Extract requirements
    const requirements = [];
    const requirementFields = [
      'requirements', 'qualifications', 'skills', 'experience',
      'technicalSkills', 'softSkills', 'education', 'certifications'
    ];
    
    for (const field of requirementFields) {
      if (responses[field]) {
        if (Array.isArray(responses[field])) {
          requirements.push(...responses[field]);
        } else if (typeof responses[field] === 'string') {
          // Split by common delimiters
          const items = responses[field].split(/[,;|\n]/).map((item: string) => item.trim()).filter(Boolean);
          requirements.push(...items);
        }
      }
    }

    return {
      jobTitle: jobTitle.toString(),
      jobDescription: jobDescription.trim() || 'Job description from intake meeting responses',
      jobRequirements: requirements
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'follow_up_needed':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'follow_up_needed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  // Group sessions by date
  const groupedSessions = (sessions || []).reduce((groups, session) => {
    if (session.scheduledAt) {
      const date = new Date(session.scheduledAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(session);
    } else {
      if (!groups['Unscheduled']) {
        groups['Unscheduled'] = [];
      }
      groups['Unscheduled'].push(session);
    }
    return groups;
  }, {} as Record<string, IntakeMeetingSession[]>);

  const sortedDates = Object.keys(groupedSessions)
    .filter(date => date !== 'Unscheduled')
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  if (groupedSessions['Unscheduled']) {
    sortedDates.unshift('Unscheduled');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Scheduled Intake Meetings</h3>
          <p className="text-sm text-gray-500">
            {isLoading ? 'Loading...' : `${(sessions || []).length} meeting${(sessions || []).length !== 1 ? 's' : ''} scheduled`}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Calendar View */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
          <p className="text-gray-500">Loading sessions...</p>
        </div>
      ) : (sessions || []).length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => (
            <div key={dateKey} className="bg-white rounded-lg border shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h4 className="font-medium text-gray-900">
                  {dateKey === 'Unscheduled' ? 'Unscheduled Meetings' : 
                   new Date(dateKey).toLocaleDateString('en-US', { 
                     weekday: 'long', 
                     year: 'numeric', 
                     month: 'long', 
                     day: 'numeric' 
                   })
                  }
                </h4>
                <p className="text-sm text-gray-500">
                  {groupedSessions[dateKey].length} meeting{groupedSessions[dateKey].length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="p-4 space-y-3">
                {groupedSessions[dateKey].map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="font-medium text-gray-900">{session.template.name}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                            {getStatusIcon(session.status)}
                            <span className="ml-1 capitalize">{session.status.replace('_', ' ')}</span>
                          </span>
                          {hasJobDescription(session) && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium flex items-center">
                              <Briefcase className="w-3 h-3 mr-1" />
                              Job Description
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          {session.scheduledAt && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDateTime(session.scheduledAt).time}
                            </span>
                          )}
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {session.conductedBy.firstName} {session.conductedBy.lastName}
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            {session.template.questions?.length || 0} questions
                          </span>
                        </div>

                        {session.notes && (
                          <p className="text-sm text-gray-600 line-clamp-2">{session.notes}</p>
                        )}

                        {session.followUpActions && session.followUpActions.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                              {session.followUpActions.length} follow-up action{session.followUpActions.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {session.scheduledAt && (
                          <button
                            onClick={() => handleSendInvitations(session)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Send invitations"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        
                        {session.status === 'completed' && (
                          <>
                            <button
                              onClick={() => handleGenerateJobDescription(session)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Generate job description"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleGenerateInterviewTemplate(session)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Generate interview template"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                            
                            {hasJobDescription(session) && (
                              <button
                                onClick={() => handleViewJobDescription(session)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="View job description"
                              >
                                <Briefcase className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                        
                        {session.status === 'draft' ? (
                          <button
                            onClick={() => handleConductSession(session.id)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Conduct meeting"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConductSession(session.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View/edit meeting"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteSession(session)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        {/* Show view job description button for any session that has a generated job description */}
                        {hasJobDescription(session) && session.status !== 'completed' && (
                          <button
                            onClick={() => handleViewJobDescription(session)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View job description"
                          >
                            <Briefcase className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress indicator for completed sessions */}
                    {session.status === 'completed' && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Completed {session.completedAt && formatDateTime(session.completedAt).date}</span>
                          <span>
                            {Object.keys(session.responses || {}).length} / {session.template.questions?.length || 0} responses
                          </span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-green-600 h-1 rounded-full transition-all"
                            style={{ 
                              width: `${(Object.keys(session.responses || {}).length / (session.template.questions?.length || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="p-3 bg-gray-100 rounded-lg inline-block mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Intake Meetings Scheduled</h3>
          <p className="text-gray-500 mb-4">
            Schedule your first intake meeting to start gathering client requirements.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <CreateIntakeMeetingSessionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          templates={templates}
          clientId={clientId}
          clientName={clientName}
          onSessionCreated={handleSessionCreated}
        />
      )}

      {/* Meeting Conductor */}
      {showConductor && selectedSessionId && (
        <IntakeMeetingConductor
          sessionId={selectedSessionId}
          onClose={() => {
            setShowConductor(false);
            setSelectedSessionId(null);
            refetch(); // Refresh the list when conductor closes
          }}
          onSessionCompleted={() => {
            refetch(); // Refresh the list when session is completed
          }}
        />
      )}

      {/* Send Invitations Modal */}
      {showInviteModal && sessionToInvite && (
        <SendInvitationsModal
          session={sessionToInvite}
          onClose={() => {
            setShowInviteModal(false);
            setSessionToInvite(null);
          }}
          onInvitationsSent={() => {
            refetch();
            setShowInviteModal(false);
            setSessionToInvite(null);
          }}
        />
      )}

      {/* Gmail Reauthorization Modal */}
      <GmailReauthorizationModal
        isOpen={showGmailReauthorizationModal}
        onClose={() => setShowGmailReauthorizationModal(false)}
        onSuccess={() => {
          setShowGmailReauthorizationModal(false);
          // Optionally retry operations
        }}
        title="Gmail Permissions Required"
        message="To send meeting invitations, we need additional Gmail permissions. Please reauthorize to continue."
      />

      {/* AI Job Description Generator */}
      {selectedSessionForJob && (
        <AIJobDescriptionGenerator
          isOpen={showJobGenerator}
          onClose={() => {
            setShowJobGenerator(false);
            setSelectedSessionForJob(null);
          }}
          onGenerate={handleJobDescriptionGenerated}
          intakeMeetingSession={selectedSessionForJob}
        />
      )}
      
      {/* Job Description Viewer */}
      {generatedJobDescription && (
        <JobDescriptionViewer
          isOpen={showJobViewer}
          onClose={() => {
            setShowJobViewer(false);
            setGeneratedJobDescription(null);
          }}
          jobDescription={generatedJobDescription}
          onSave={handleSaveJobDescription}
          onCreateJob={handleCreateJobFromDescription}
          clientName={clientName}
          isEditable={true}
          isSaving={saveJobDescriptionMutation.isPending}
        />
      )}

      {/* Interview Template Generator */}
      {selectedSessionForTemplate && (
        <CreateInterviewTemplateModal
          isOpen={showInterviewTemplateGenerator}
          onClose={() => {
            setShowInterviewTemplateGenerator(false);
            setSelectedSessionForTemplate(null);
          }}
          onTemplateCreated={handleInterviewTemplateCreated}
          organizationId={clientId}
          startWithAI={true}
          {...extractJobDataFromIntakeMeeting(selectedSessionForTemplate)}
        />
      )}
    </div>
  );
};

// Send Invitations Modal Component
interface SendInvitationsModalProps {
  session: IntakeMeetingSession;
  onClose: () => void;
  onInvitationsSent: () => void;
}

const SendInvitationsModal: React.FC<SendInvitationsModalProps> = ({
  session,
  onClose,
  onInvitationsSent
}) => {
  const [attendeeEmails, setAttendeeEmails] = useState<string[]>(session.attendees || []);
  const [newEmail, setNewEmail] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [includeMeetingLink, setIncludeMeetingLink] = useState(false);
  const [showGmailReauthorizationModal, setShowGmailReauthorizationModal] = useState(false);
  const sendInvitationsMutation = useSendIntakeMeetingInvitations();

  // Enhanced modal behavior
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    const email = newEmail.trim();
    if (email && isValidEmail(email) && !attendeeEmails.includes(email)) {
      setAttendeeEmails([...attendeeEmails, email]);
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setAttendeeEmails(attendeeEmails.filter(email => email !== emailToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSendInvitations = async () => {
    if (attendeeEmails.length === 0) {
      alert('Please add at least one email address.');
      return;
    }

    try {
      await sendInvitationsMutation.mutateAsync({
        sessionId: session.id,
        data: { 
          emails: attendeeEmails,
          meetingLink: includeMeetingLink ? meetingLink : undefined
        }
      });
      onInvitationsSent();
    } catch (error) {
      console.error('Failed to send invitations:', error);
      
      // Check if this is a Gmail scope error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorResponse = (error as any)?.response?.data?.message || '';
      
      if (errorMessage.includes('insufficient authentication scopes') || 
          errorMessage.includes('Insufficient Permission') ||
          errorMessage.includes('Request had insufficient authentication scopes') ||
          errorMessage.includes('Gmail account needs additional permissions') ||
          errorResponse.includes('Gmail account needs additional permissions') ||
          errorResponse.includes('reconnect your Gmail account')) {
        setShowGmailReauthorizationModal(true);
      } else {
        alert('Failed to send invitations. Please try again.');
      }
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const modalContent = (
    <div 
      className="fixed top-0 right-0 bottom-0 left-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Send Meeting Invitations</h3>
            <p className="text-sm text-gray-500 mt-1">{session.template.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Meeting Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Meeting Details</h4>
            <p className="text-sm text-gray-600">
              <strong>Date & Time:</strong> {session.scheduledAt ? formatDateTime(session.scheduledAt) : 'Not scheduled'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Template:</strong> {session.template.name}
            </p>
          </div>

          {/* Add Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Attendees
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter email address..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddEmail}
                disabled={!newEmail.trim() || !isValidEmail(newEmail.trim()) || attendeeEmails.includes(newEmail.trim())}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Attendees List */}
          {attendeeEmails.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attendees ({attendeeEmails.length})
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {attendeeEmails.map((email, index) => (
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
                      onClick={() => handleRemoveEmail(email)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meeting Link Section */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                id="includeMeetingLink"
                checked={includeMeetingLink}
                onChange={(e) => setIncludeMeetingLink(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label htmlFor="includeMeetingLink" className="text-sm font-medium text-gray-700">
                Include meeting link in invitation
              </label>
            </div>
            
            {includeMeetingLink && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Link
                </label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/abc-defg-hij or https://zoom.us/j/123456789"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add your Zoom, Google Meet, Teams, or other meeting platform link
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendInvitations}
            disabled={attendeeEmails.length === 0 || sendInvitationsMutation.isPending || (includeMeetingLink && !meetingLink.trim())}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {sendInvitationsMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Send Invitations</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Gmail Reauthorization Modal */}
      <GmailReauthorizationModal
        isOpen={showGmailReauthorizationModal}
        onClose={() => setShowGmailReauthorizationModal(false)}
        onSuccess={() => {
          setShowGmailReauthorizationModal(false);
          // Optionally retry sending invitations
        }}
        title="Gmail Permissions Required"
        message="To send meeting invitations, we need additional Gmail permissions. Please reauthorize to continue."
      />
    </div>
  );

  // Render modal content in a portal to bypass any parent z-index issues
  return createPortal(modalContent, document.body);
};
