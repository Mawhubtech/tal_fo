import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  X, Calendar, Clock, MapPin, Video, Phone, Users, User, ExternalLink, 
  Mail, MessageSquare, FileText, Star, Edit, Save, XCircle, CheckCircle,
  AlertCircle, Send, Plus, Minus, Settings, Play, Trash2
} from 'lucide-react';
import type { Interview, InterviewFeedback } from '../../../../../types/interview.types';
import type { InterviewTemplate } from '../../../../../types/interviewTemplate.types';
import { useUpdateInterview, useDeleteInterview } from '../../../../../hooks/useInterviews';
import { useEmailService } from '../../../../../hooks/useEmailService';
import { useEmailTemplates, type EmailTemplate } from '../../../../../hooks/useEmailManagement';
import { useInterviewTemplates } from '../../../../../hooks/useInterviewTemplates';
import { toast } from '../../../../../components/ToastContainer';
import { EditInterviewForm } from './EditInterviewForm';
import { InterviewConductSidepanel } from './InterviewConductSidepanel';

interface InterviewDetailModalProps {
  interview: Interview | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateInterview?: (interview: Interview, updates: Partial<Interview>) => Promise<void>;
  onSendEmail?: (interview: Interview, emailType: string, recipients: string[], subject: string, body: string) => Promise<void>;
  onAddFeedback?: (interview: Interview, feedback: Omit<InterviewFeedback, 'id' | 'submittedBy' | 'submitter' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

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
  const [showConductPanel, setShowConductPanel] = useState(false);
  const [interviewTemplate, setInterviewTemplate] = useState<InterviewTemplate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notes, setNotes] = useState('');
  const [emailForm, setEmailForm] = useState({
    type: '', // Will be set when templates load
    recipients: [] as string[],
    subject: '',
    body: '',
    customRecipient: ''
  });

  // Use the mutation hook for automatic query invalidation
  const updateInterviewMutation = useUpdateInterview();
  const deleteInterviewMutation = useDeleteInterview();
  
  // Fetch interview templates to check if this interview has an associated template
  const { data: templates } = useInterviewTemplates();
  
  // Use email service for Gmail integration - only when email tab is active
  const { 
    emailSettings, 
    isLoadingSettings, 
    sendEmail, 
    isSendingEmail 
  } = useEmailService(activeTab === 'email');

  // Fetch email templates for interviews category
  const { 
    data: emailTemplatesData, 
    isLoading: isLoadingTemplates, 
    error: templatesError 
  } = useEmailTemplates({ 
    category: 'interviews' 
  });

  // Transform templates data for easier use
  const emailTemplates = React.useMemo(() => {
    let templatesArray;
    
    // Handle both array and object responses
    if (Array.isArray(emailTemplatesData)) {
      templatesArray = emailTemplatesData;
    } else if (emailTemplatesData && emailTemplatesData.templates && Array.isArray(emailTemplatesData.templates)) {
      templatesArray = emailTemplatesData.templates;
    } else if (!emailTemplatesData || isLoadingTemplates) {
    //   console.log('Email templates not loaded yet:', { emailTemplatesData, isLoadingTemplates, templatesError });
      return {};
    } else {
      console.log('Unexpected template data structure:', emailTemplatesData);
      return {};
    }
    
    console.log('Loading email templates array:', templatesArray);
    
    const templates = templatesArray.reduce((acc: Record<string, EmailTemplate>, template: EmailTemplate) => {
      acc[template.type] = template;
      return acc;
    }, {});
    
    console.log('Transformed templates:', templates);
    return templates;
  }, [emailTemplatesData, isLoadingTemplates, templatesError]);

  // Get available template types for dropdown
  const availableTemplateTypes = React.useMemo(() => {
    return Object.keys(emailTemplates);
  }, [emailTemplates]);

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
      
      // Try to find associated interview template
      if (interview.template) {
        setInterviewTemplate(interview.template);
      } else if (templates?.templates && interview.jobApplication?.jobId) {
        // Fallback: try to find templates for this job if not directly associated
        const jobTemplates = templates.templates.filter(t => t.jobId === interview.jobApplication.jobId);
        if (jobTemplates.length > 0) {
          // Find template that matches interview type, or use the first one
          const matchingTemplate = jobTemplates.find(t => 
            t.interviewType.toLowerCase() === interview.type?.toLowerCase()
          ) || jobTemplates[0];
          setInterviewTemplate(matchingTemplate);
        }
      }
      
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
      
      // Populate default email template when templates are loaded
      if (emailTemplates && Object.keys(emailTemplates).length > 0) {
        const defaultTemplate = emailTemplates['interview_invitation'] || 
                               emailTemplates['interview_invite'] || 
                               Object.values(emailTemplates)[0];
        if (defaultTemplate) {
          // Set the form type if not already set
          setEmailForm(prev => ({
            ...prev,
            type: prev.type || defaultTemplate.type
          }));
          populateEmailTemplate(defaultTemplate);
        }
      }
    }
  }, [interview, interview?.updatedAt, emailTemplates, templates]); // Add emailTemplates and templates to dependency

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
      const defaultTemplate = emailTemplates['interview_invitation'] || 
                             emailTemplates['interview_invite'] || 
                             Object.values(emailTemplates)[0];
      if (defaultTemplate) {
        populateEmailTemplate(defaultTemplate);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Email Failed', 'Failed to send email. Please check your email configuration.');
    }
  };

  const handleDeleteInterview = async () => {
    if (!interview) return;
    
    try {
      await deleteInterviewMutation.mutateAsync(interview.id);
      setShowDeleteConfirm(false);
      onClose(); // Close the modal after successful deletion
      toast.success('Interview Deleted', 'Interview has been deleted successfully.');
    } catch (error) {
      console.error('Failed to delete interview:', error);
      toast.error('Delete Failed', 'Failed to delete interview. Please try again.');
    }
  };

  const populateEmailTemplate = (template: EmailTemplate | undefined) => {
    if (!interview || !template) return;
    
    const candidate = interview.jobApplication?.candidate;
    const job = interview.jobApplication?.job;
    const scheduler = interview.scheduler;
    
    console.log('Populating email template with data:', {
      template: {
        id: template.id,
        name: template.name,
        type: template.type,
        variables: template.variables
      },
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
    
    // Create replacement data based on template variables
    const replacements: Record<string, string> = {
      // Standard variables
      '{{candidateName}}': candidate?.fullName || `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim() || 'Candidate',
      '{{position}}': job?.title || 'Unknown Position',
      '{{jobTitle}}': job?.title || 'Unknown Position',
      '{{company}}': 'Our Company', // Could be enhanced to fetch organization name
      '{{interviewDate}}': new Date(interview.scheduledAt).toLocaleDateString(),
      '{{interviewTime}}': new Date(interview.scheduledAt).toLocaleTimeString(),
      '{{dateTime}}': formatDateTime(interview.scheduledAt),
      '{{duration}}': interview.durationMinutes?.toString() || '60',
      '{{mode}}': interview.mode || 'In-person',
      '{{meetingLink}}': interview.meetingLink || '',
      '{{location}}': interview.location || '',
      '{{interviewLocation}}': interview.location || '',
      '{{agenda}}': interview.agenda || '',
      '{{schedulerName}}': `${scheduler?.firstName || ''} ${scheduler?.lastName || ''}`.trim() || 'HR Team',
      '{{recruiterName}}': `${scheduler?.firstName || ''} ${scheduler?.lastName || ''}`.trim() || 'HR Team',
      '{{senderName}}': `${scheduler?.firstName || ''} ${scheduler?.lastName || ''}`.trim() || 'HR Team',
      '{{yourName}}': `${scheduler?.firstName || ''} ${scheduler?.lastName || ''}`.trim() || 'HR Team',
      '{{contactEmail}}': scheduler?.email || 'hr@company.com',
      '{{contactPhone}}': '(555) 123-4567', // Could be made configurable
      '{{contactName}}': `${scheduler?.firstName || ''} ${scheduler?.lastName || ''}`.trim() || 'HR Team',
      '{{interviewerName}}': 'Team Member', // This will be replaced for feedback requests
      '{{candidateFirstName}}': candidate?.firstName || 'Candidate',
      '{{candidateLastName}}': candidate?.lastName || '',
      '{{senderTitle}}': 'Talent Acquisition Specialist',
      // Additional common variables
      '{{interviewType}}': interview.type || 'Interview',
      '{{preparationNotes}}': interview.preparationNotes || '',
      '{{reason}}': '', // For cancellation/reschedule reasons
      '{{newInterviewDate}}': new Date(interview.scheduledAt).toLocaleDateString(),
      '{{newInterviewTime}}': new Date(interview.scheduledAt).toLocaleTimeString(),
      '{{newInterviewLocation}}': interview.location || '',
      '{{originalDate}}': new Date(interview.scheduledAt).toLocaleDateString(),
      '{{originalTime}}': new Date(interview.scheduledAt).toLocaleTimeString(),
    };
    
    // Add any additional variables from template if they exist
    template.variables?.forEach(variable => {
      const varKey = `{{${variable}}}`;
      if (!replacements[varKey]) {
        // Set to empty string for any variables not yet handled
        replacements[varKey] = '';
      }
    });
    
    console.log('Template replacements:', replacements);
    
    // Replace variables in subject - use template.subject instead of subject
    let subject = template.subject || '';
    Object.entries(replacements).forEach(([key, value]) => {
      subject = subject.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    
    // Replace variables in body - use template.content instead of body
    let body = template.content || template.body || '';
    Object.entries(replacements).forEach(([key, value]) => {
      body = body.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    
    console.log('Before conditional processing:', { subject, body });
    
    // Handle conditional blocks (simple implementation)
    body = body.replace(/{{#if meetingLink}}(.*?){{\/if}}/gs, (match, content) => {
      return interview.meetingLink ? content : '';
    });
    
    body = body.replace(/{{#if location}}(.*?){{\/if}}/gs, (match, content) => {
      return interview.location ? content : '';
    });
    
    body = body.replace(/{{#if agenda}}(.*?){{\/if}}/gs, (match, content) => {
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
      
      <div className="absolute inset-0 bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
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
              {(interview.status === 'Scheduled' || interview.status === 'In Progress') && (
                <button
                  onClick={() => setShowConductPanel(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Conduct Interview
                </button>
              )}
              
              <button
                onClick={() => setShowEditForm(true)}
                className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Interview
              </button>
              
              {/* Only show delete button for scheduled interviews */}
              {interview.status === 'Scheduled' && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              )}
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
        <div className="p-8">
          {activeTab === 'details' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Interview Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="bg-gray-50 rounded-lg p-6">
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

              {/* Interview Content in Two Columns */}
              {(interview.agenda || interview.preparationNotes) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {interview.agenda && (
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Interview Agenda</h3>
                      <div className="text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto bg-white rounded-lg p-4 border">
                        {interview.agenda}
                      </div>
                    </div>
                  )}
                  {interview.preparationNotes && (
                    <div className="bg-yellow-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Preparation Notes</h3>
                      <div className="text-gray-700 whitespace-pre-wrap bg-white rounded-lg p-4 border">
                        {interview.preparationNotes}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                
                {/* Show loading state or error if templates aren't available */}
                {isLoadingTemplates ? (
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading email templates...</p>
                  </div>
                ) : templatesError ? (
                  <div className="bg-red-50 rounded-lg p-6 text-center">
                    <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <p className="text-red-600 mb-2">Failed to load email templates</p>
                    <p className="text-sm text-gray-600">Please check your connection and try again.</p>
                  </div>
                ) : availableTemplateTypes.length === 0 ? (
                  <div className="bg-yellow-50 rounded-lg p-6 text-center">
                    <Mail className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <p className="text-yellow-600 mb-2">No interview email templates found</p>
                    <p className="text-sm text-gray-600">Please create interview email templates in Email Management to send emails.</p>
                  </div>
                ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Template</label>
                      {isLoadingTemplates ? (
                        <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                            <span className="text-gray-500">Loading templates...</span>
                          </div>
                        </div>
                      ) : templatesError ? (
                        <div className="w-full border border-red-300 rounded-lg px-3 py-2 bg-red-50">
                          <span className="text-red-600 text-sm">Failed to load templates</span>
                        </div>
                      ) : availableTemplateTypes.length === 0 ? (
                        <div className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-yellow-50">
                          <span className="text-yellow-600 text-sm">No interview templates found</span>
                        </div>
                      ) : (
                        <select
                          value={emailForm.type}
                          onChange={(e) => {
                            setEmailForm(prev => ({ ...prev, type: e.target.value }));
                            const selectedTemplate = emailTemplates[e.target.value];
                            if (selectedTemplate) {
                              populateEmailTemplate(selectedTemplate);
                            }
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {availableTemplateTypes.map(templateType => {
                            const template = emailTemplates[templateType];
                            return (
                              <option key={templateType} value={templateType}>
                                {template.name || templateType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
                      <button
                        onClick={() => {
                          const selectedTemplate = emailTemplates[emailForm.type];
                          if (selectedTemplate) {
                            populateEmailTemplate(selectedTemplate);
                          }
                        }}
                        disabled={!emailTemplates[emailForm.type]}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                      <style dangerouslySetInnerHTML={{
                        __html: `
                          .quill-editor .ql-editor {
                            min-height: 250px;
                            font-size: 14px;
                            line-height: 1.5;
                            padding: 12px;
                          }
                          .quill-editor .ql-toolbar {
                            border-bottom: 1px solid #e5e7eb;
                            background-color: #f9fafb;
                          }
                          .quill-editor .ql-container {
                            border-top: none;
                            font-family: inherit;
                          }
                        `
                      }} />
                      <ReactQuill
                        value={emailForm.body}
                        onChange={(value) => setEmailForm(prev => ({ ...prev, body: value }))}
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['link'],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'align': [] }],
                            ['clean']
                          ]
                        }}
                        formats={[
                          'header', 'bold', 'italic', 'underline', 'strike',
                          'list', 'bullet', 'link', 'color', 'background', 'align'
                        ]}
                        theme="snow"
                        className="quill-editor"
                        placeholder="Email message..."
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <p>Review and edit the email content. Template variables have been automatically populated with interview details.</p>
                      {emailTemplates[emailForm.type]?.variables && emailTemplates[emailForm.type].variables!.length > 0 && (
                        <p className="mt-1">
                          <strong>Available variables:</strong> {emailTemplates[emailForm.type].variables!.map(v => `{{${v}}}`).join(', ')}
                        </p>
                      )}
                    </div>
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
                )}
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

      {/* Interview Conduct Sidepanel */}
      {showConductPanel && interview && (
        <InterviewConductSidepanel
          interview={interview}
          template={interviewTemplate}
          isOpen={showConductPanel}
          onClose={() => setShowConductPanel(false)}
          onSaveProgress={async (progress) => {
            // Save interview progress to backend
            console.log('Saving interview progress:', progress);
            // You can implement this API call later
          }}
          onSubmitEvaluation={async (evaluation) => {
            // Submit interview evaluation to backend
            console.log('Submitting interview evaluation:', evaluation);
            // You can implement this API call later
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Interview</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete this interview with{' '}
                <span className="font-medium">{interview?.jobApplication?.candidate?.fullName}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                All interview data, participants, and related information will be permanently deleted.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={deleteInterviewMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteInterview}
                disabled={deleteInterviewMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
              >
                {deleteInterviewMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Interview
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
