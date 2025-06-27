import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, MapPin, Video, Phone, Users, User, ExternalLink, 
  Mail, MessageSquare, FileText, Star, Edit, Save, XCircle, CheckCircle,
  AlertCircle, Send, Plus, Minus, Settings
} from 'lucide-react';
import type { Interview, InterviewFeedback } from '../../../../../types/interview.types';
import { useUpdateInterview } from '../../../../../hooks/useInterviews';
import { useEmailService } from '../../../../../hooks/useEmailService';
import { toast } from '../../../../../components/ToastContainer';
import { EditInterviewForm } from './EditInterviewForm';

interface InterviewDetailModalProps {
  interview: Interview | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateInterview?: (interview: Interview, updates: Partial<Interview>) => Promise<void>;
  onSendEmail?: (interview: Interview, emailType: string, recipients: string[], subject: string, body: string) => Promise<void>;
  onAddFeedback?: (interview: Interview, feedback: Omit<InterviewFeedback, 'id' | 'submittedBy' | 'submitter' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const emailTemplates = {
  interview_invitation: {
    subject: 'Interview Invitation - {{jobTitle}} Position',
    body: `Dear {{candidateName}},

We are pleased to invite you for an interview for the {{jobTitle}} position at our company.

Interview Details:
- Date & Time: {{dateTime}}
- Duration: {{duration}} minutes
- Format: {{mode}}
{{#if meetingLink}}- Meeting Link: {{meetingLink}}{{/if}}
{{#if location}}- Location: {{location}}{{/if}}

{{#if agenda}}Agenda: {{agenda}}{{/if}}

Please confirm your attendance by replying to this email.

Best regards,
{{schedulerName}}`
  },
  interview_reminder: {
    subject: 'Interview Reminder - {{jobTitle}} Position Tomorrow',
    body: `Dear {{candidateName}},

This is a friendly reminder about your upcoming interview for the {{jobTitle}} position.

Interview Details:
- Date & Time: {{dateTime}}
- Duration: {{duration}} minutes
- Format: {{mode}}
{{#if meetingLink}}- Meeting Link: {{meetingLink}}{{/if}}
{{#if location}}- Location: {{location}}{{/if}}

Please be prepared and on time. If you have any questions, feel free to reach out.

Best regards,
{{schedulerName}}`
  },
  interview_reschedule: {
    subject: 'Interview Rescheduled - {{jobTitle}} Position',
    body: `Dear {{candidateName}},

We need to reschedule your interview for the {{jobTitle}} position.

New Interview Details:
- Date & Time: {{dateTime}}
- Duration: {{duration}} minutes
- Format: {{mode}}
{{#if meetingLink}}- Meeting Link: {{meetingLink}}{{/if}}
{{#if location}}- Location: {{location}}{{/if}}

We apologize for any inconvenience caused.

Best regards,
{{schedulerName}}`
  },
  feedback_request: {
    subject: 'Interview Feedback Request - {{candidateName}}',
    body: `Dear {{interviewerName}},

Thank you for conducting the interview with {{candidateName}} for the {{jobTitle}} position.

Please provide your feedback using the interview feedback form at your earliest convenience.

Interview Details:
- Date & Time: {{dateTime}}
- Candidate: {{candidateName}}
- Position: {{jobTitle}}

Your input is valuable for our hiring decision.

Best regards,
{{schedulerName}}`
  }
};

export const InterviewDetailModal: React.FC<InterviewDetailModalProps> = ({
  interview,
  isOpen,
  onClose,
  onUpdateInterview,
  onSendEmail,
  onAddFeedback
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'feedback' | 'email'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Interview>>({});
  const [showEditForm, setShowEditForm] = useState(false);
  const [notes, setNotes] = useState('');
  const [emailForm, setEmailForm] = useState({
    type: 'interview_invitation',
    recipients: [] as string[],
    subject: '',
    body: '',
    customRecipient: ''
  });

  // Use the mutation hook for automatic query invalidation
  const updateInterviewMutation = useUpdateInterview();
  
  // Use email service for Gmail integration - only when email tab is active
  const { 
    emailSettings, 
    isLoadingSettings, 
    sendEmail, 
    isSendingEmail 
  } = useEmailService(activeTab === 'email');

  useEffect(() => {
    if (interview) {
      setEditForm({
        status: interview.status,
        result: interview.result,
        overallRating: interview.overallRating,
        notes: interview.notes,
        nextSteps: interview.nextSteps,
        recommendation: interview.recommendation
      });
      setNotes(interview.notes || '');
      
      // Set default email recipients
      const recipients = [interview.jobApplication?.candidate?.email || ''];
      interview.participants?.forEach(p => {
        if (p.email && !recipients.includes(p.email)) {
          recipients.push(p.email);
        }
      });
      setEmailForm(prev => ({ 
        ...prev, 
        recipients: recipients.filter(Boolean)
      }));
      
      // Populate default email template
      populateEmailTemplate(emailTemplates.interview_invitation);
    }
  }, [interview, interview?.updatedAt]); // Add updatedAt to dependency to respond to updates

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Rescheduled': return 'bg-orange-100 text-orange-800';
      case 'No Show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = async () => {
    if (!interview) return;
    
    try {
      await updateInterviewMutation.mutateAsync({
        id: interview.id,
        data: editForm as any
      });
      setIsEditing(false);
      toast.success('Interview Updated', 'Interview evaluation has been saved successfully.');
    } catch (error) {
      console.error('Failed to update interview:', error);
      toast.error('Update Failed', 'Failed to save interview evaluation. Please try again.');
    }
  };

  const handleSendEmail = async () => {
    if (!interview) return;
    
    try {
      // Use the new email service instead of the prop
      await sendEmail({
        interviewId: interview.id,
        emailType: emailForm.type,
        recipients: emailForm.recipients,
        subject: emailForm.subject,
        body: emailForm.body
      });
      
      toast.success('Email Sent', 'Interview email has been sent successfully.');
      
      // Reset form and switch back to details tab
      setEmailForm(prev => ({
        ...prev,
        subject: '',
        body: '',
        customRecipient: ''
      }));
      
      // Switch back to details tab to show confirmation
      setActiveTab('details');
      
      // Repopulate default template for next use
      populateEmailTemplate(emailTemplates.interview_invitation);
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Email Failed', 'Failed to send email. Please check your email configuration.');
    }
  };

  const populateEmailTemplate = (template: any) => {
    if (!interview) return;
    
    const candidate = interview.jobApplication?.candidate;
    const job = interview.jobApplication?.job;
    const scheduler = interview.scheduler;
    
    console.log('Populating email template with data:', {
      candidate,
      job,
      scheduler,
      interview: {
        scheduledAt: interview.scheduledAt,
        durationMinutes: interview.durationMinutes,
        mode: interview.mode,
        meetingLink: interview.meetingLink,
        location: interview.location,
        agenda: interview.agenda
      }
    });
    
    // Create replacement data
    const replacements = {
      '{{jobTitle}}': job?.title || 'Unknown Position',
      '{{candidateName}}': candidate?.fullName || `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim() || 'Candidate',
      '{{interviewerName}}': 'Team Member', // This will be replaced for feedback requests
      '{{dateTime}}': formatDateTime(interview.scheduledAt),
      '{{duration}}': interview.durationMinutes?.toString() || '60',
      '{{mode}}': interview.mode || 'In-person',
      '{{meetingLink}}': interview.meetingLink || '',
      '{{location}}': interview.location || '',
      '{{agenda}}': interview.agenda || '',
      '{{schedulerName}}': `${scheduler?.firstName || ''} ${scheduler?.lastName || ''}`.trim() || 'HR Team'
    };
    
    console.log('Template replacements:', replacements);
    
    // Replace variables in subject
    let subject = template.subject;
    Object.entries(replacements).forEach(([key, value]) => {
      subject = subject.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    
    // Replace variables in body
    let body = template.body;
    Object.entries(replacements).forEach(([key, value]) => {
      body = body.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    
    console.log('Before conditional processing:', { subject, body });
    
    // Handle conditional blocks (simple implementation)
    body = body.replace(/{{#if meetingLink}}(.*?){{\/if}}/g, (match, content) => {
      return interview.meetingLink ? content : '';
    });
    
    body = body.replace(/{{#if location}}(.*?){{\/if}}/g, (match, content) => {
      return interview.location ? content : '';
    });
    
    body = body.replace(/{{#if agenda}}(.*?){{\/if}}/g, (match, content) => {
      return interview.agenda ? content : '';
    });
    
    // Clean up any remaining template syntax
    body = body.replace(/{{#if.*?}}|{{\/if}}/g, '');
    
    console.log('Final template result:', { subject, body });
    
    setEmailForm(prev => ({ ...prev, subject, body }));
  };

  const addRecipient = () => {
    if (emailForm.customRecipient && !emailForm.recipients.includes(emailForm.customRecipient)) {
      setEmailForm(prev => ({
        ...prev,
        recipients: [...prev.recipients, prev.customRecipient],
        customRecipient: ''
      }));
    }
  };

  const removeRecipient = (email: string) => {
    setEmailForm(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  if (!isOpen || !interview) return null;

  const candidate = interview.jobApplication?.candidate;
  const job = interview.jobApplication?.job;
  const scheduler = interview.scheduler;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="bg-purple-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Interview with {candidate?.fullName}
              </h2>
              <p className="text-purple-100 mt-1">
                {job?.title} • {formatDateTime(interview.scheduledAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-purple-200 hover:text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)} bg-opacity-20 text-white`}>
                {interview.status}
              </span>
              {interview.result && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  interview.result === 'Pass' ? 'bg-green-500 text-white' :
                  interview.result === 'Fail' ? 'bg-red-500 text-white' :
                  'bg-yellow-500 text-white'
                }`}>
                  {interview.result}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEditForm(true)}
                className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Interview
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-white sticky top-24 z-10">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'details', label: 'Details', icon: Calendar },
              { id: 'notes', label: 'Notes', icon: FileText },
              { id: 'feedback', label: 'Feedback', icon: MessageSquare },
              { id: 'email', label: 'Email', icon: Mail }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Interview Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <p className="text-gray-900">{interview.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                    <p className="text-gray-900">{interview.stage}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                    <p className="text-gray-900">{interview.mode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <p className="text-gray-900">{interview.durationMinutes} minutes</p>
                  </div>
                  {interview.meetingLink && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        {interview.meetingLink}
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  )}
                  {interview.location && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <p className="text-gray-900">{interview.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Participants */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Participants</h3>
                <div className="space-y-3">
                  {interview.participants?.map((participant, index) => {
                    const participantName = participant.user ? 
                      `${participant.user.firstName} ${participant.user.lastName}`.trim() :
                      participant.name || 'Unknown';
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{participantName}</p>
                            <p className="text-sm text-gray-500">
                              {participant.role} • {participant.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            participant.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                            participant.status === 'Declined' ? 'bg-red-100 text-red-800' :
                            participant.status === 'Tentative' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {participant.status}
                          </span>
                          {participant.status === 'Accepted' && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {participant.status === 'Declined' && <AlertCircle className="w-4 h-4 text-red-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Interview Notes</h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={editForm.notes || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        rows={6}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Add your notes about this interview..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Next Steps</label>
                      <textarea
                        value={editForm.nextSteps || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, nextSteps: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="What are the next steps for this candidate?"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Interview Notes</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {interview.notes || 'No notes added yet.'}
                      </p>
                    </div>
                    {interview.nextSteps && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{interview.nextSteps}</p>
                      </div>
                    )}
                    {interview.agenda && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Agenda</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{interview.agenda}</p>
                      </div>
                    )}
                    {interview.preparationNotes && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Preparation Notes</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{interview.preparationNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {/* Recruiter Interview Evaluation */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Interview Evaluation</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Evaluation
                    </button>
                  )}
                </div>

                {/* Status and Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interview Status</label>
                    {isEditing ? (
                      <select
                        value={editForm.status || interview.status}
                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Rescheduled">Rescheduled</option>
                        <option value="No Show">No Show</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
                        {interview.status}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interview Result</label>
                    {isEditing ? (
                      <select
                        value={editForm.result || interview.result || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, result: e.target.value || null }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Not Set</option>
                        <option value="Pass">✅ Pass</option>
                        <option value="Fail">❌ Fail</option>
                        <option value="On Hold">⏳ On Hold</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        interview.result === 'Pass' ? 'bg-green-100 text-green-800' :
                        interview.result === 'Fail' ? 'bg-red-100 text-red-800' :
                        interview.result === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {interview.result || 'Not Set'}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
                    {isEditing ? (
                      <select
                        value={editForm.overallRating || interview.overallRating || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, overallRating: e.target.value ? Number(e.target.value) : null }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Not Rated</option>
                        <option value="1">⭐ (1/5) - Poor</option>
                        <option value="2">⭐⭐ (2/5) - Below Average</option>
                        <option value="3">⭐⭐⭐ (3/5) - Average</option>
                        <option value="4">⭐⭐⭐⭐ (4/5) - Good</option>
                        <option value="5">⭐⭐⭐⭐⭐ (5/5) - Excellent</option>
                      </select>
                    ) : (
                      <div className="flex items-center">
                        {interview.overallRating ? (
                          <>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(interview.overallRating!) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-500 ml-2">
                              ({interview.overallRating}/5)
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500">Not rated</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Final Recommendation</label>
                    {isEditing ? (
                      <select
                        value={editForm.recommendation || interview.recommendation || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, recommendation: e.target.value || null }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Not Set</option>
                        <option value="Hire">✅ Hire</option>
                        <option value="No Hire">❌ No Hire</option>
                        <option value="Maybe">🤔 Maybe</option>
                        <option value="Need More Info">❓ Need More Info</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        interview.recommendation === 'Hire' ? 'bg-green-100 text-green-800' :
                        interview.recommendation === 'No Hire' ? 'bg-red-100 text-red-800' :
                        interview.recommendation === 'Maybe' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {interview.recommendation || 'Not Set'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Interview Notes and Next Steps */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interview Notes & Feedback</label>
                    {isEditing ? (
                      <textarea
                        value={editForm.notes || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        rows={6}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Add your detailed notes and feedback about this interview:&#10;• How did the candidate perform?&#10;• What were their strengths and weaknesses?&#10;• Key observations and impressions&#10;• Any concerns or highlights"
                      />
                    ) : (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-[150px]">
                        <p className="text-gray-600 whitespace-pre-wrap">
                          {interview.notes || 'No interview notes added yet.'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Next Steps & Action Items</label>
                    {isEditing ? (
                      <textarea
                        value={editForm.nextSteps || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, nextSteps: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="What are the next steps for this candidate?&#10;• Move to next interview round&#10;• Schedule technical assessment&#10;• Prepare job offer&#10;• Send rejection email&#10;• Request additional references"
                      />
                    ) : (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 min-h-[80px]">
                        <p className="text-gray-600 whitespace-pre-wrap">
                          {interview.nextSteps || 'No next steps defined yet.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date(interview.updatedAt || interview.createdAt).toLocaleDateString()}
                  </div>
                  
                  {isEditing && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          // Reset form to original values
                          setEditForm({
                            status: interview.status,
                            result: interview.result,
                            overallRating: interview.overallRating,
                            notes: interview.notes,
                            nextSteps: interview.nextSteps,
                            recommendation: interview.recommendation
                          });
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={updateInterviewMutation.isPending}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updateInterviewMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Evaluation
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Send Email</h3>
                  {/* Email configuration status indicator */}
                  <div className="flex items-center space-x-2 text-sm">
                    {isLoadingSettings ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-500">Loading...</span>
                      </div>
                    ) : emailSettings?.isGmailConnected ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Gmail connected</span>
                        {emailSettings.gmailEmail && (
                          <span className="text-gray-500">({emailSettings.gmailEmail})</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-600">Gmail not connected</span>
                        <button
                          onClick={() => toast.info('Settings Required', 'Please configure Gmail in Account Settings to send emails')}
                          className="text-purple-600 hover:text-purple-700 flex items-center text-xs"
                        >
                          Configure
                          <Settings className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Template</label>
                      <select
                        value={emailForm.type}
                        onChange={(e) => {
                          setEmailForm(prev => ({ ...prev, type: e.target.value }));
                          populateEmailTemplate(emailTemplates[e.target.value as keyof typeof emailTemplates]);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="interview_invitation">Interview Invitation</option>
                        <option value="interview_reminder">Interview Reminder</option>
                        <option value="interview_reschedule">Interview Reschedule</option>
                        <option value="feedback_request">Feedback Request</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
                      <button
                        onClick={() => populateEmailTemplate(emailTemplates[emailForm.type as keyof typeof emailTemplates])}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Reset Template
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {emailForm.recipients.map((email, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                        >
                          {email}
                          <button
                            onClick={() => removeRecipient(email)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        value={emailForm.customRecipient}
                        onChange={(e) => setEmailForm(prev => ({ ...prev, customRecipient: e.target.value }))}
                        placeholder="Add recipient email..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={addRecipient}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Email subject..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Edit the subject line as needed before sending
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={emailForm.body}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, body: e.target.value }))}
                      rows={12}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                      placeholder="Email message..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Review and edit the email content. Template variables have been automatically populated with interview details.
                    </p>
                  </div>

                  <button
                    onClick={handleSendEmail}
                    disabled={!emailForm.subject || !emailForm.body || emailForm.recipients.length === 0 || !emailSettings?.isGmailConnected || isSendingEmail}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingEmail ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </button>
                  
                  {(!emailForm.subject || !emailForm.body || emailForm.recipients.length === 0) && (
                    <p className="text-sm text-red-600 mt-2">
                      Please ensure you have recipients, subject, and message content before sending.
                    </p>
                  )}
                  
                  {!emailSettings?.isGmailConnected && (
                    <p className="text-sm text-red-600 mt-2">
                      Gmail not connected. Please configure Gmail in Account Settings to send emails.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Interview Form */}
      {showEditForm && (
        <EditInterviewForm
          interview={interview}
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            toast.success('Interview Updated', 'Interview details have been updated successfully.');
            // No need for manual refetch - query invalidation handles this automatically
          }}
        />
      )}
    </div>
  );
};
