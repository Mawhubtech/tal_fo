import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Settings, Edit, Trash2, Mail, Clock, MessageSquare, Phone, CheckSquare, Timer, Users, Eye, GitBranch, TestTube, Brain, FileText, Wand2 } from 'lucide-react';
import { useJob } from '../../../hooks/useJobs';
import { useExternalJobDetail } from '../../../hooks/useExternalJobs';
import { useEmailSequence, useUpdateEmailSequence } from '../../../hooks/useEmailSequences';
import { EmailSequence, EmailSequenceStep, EmailSequencesApiService } from '../../../services/emailSequencesApiService';
import { useAuthContext } from '../../../contexts/AuthContext';
import { isExternalUser } from '../../../utils/userUtils';
import { useRecruitmentTemplates } from '../../../hooks/useEmailTemplates';
import { EmailTemplate } from '../../../services/emailTemplatesApiService';

const JobSequenceStepsPage: React.FC = () => {
  const { organizationId, departmentId, jobId, sequenceId } = useParams<{ 
    organizationId: string; 
    departmentId: string; 
    jobId: string; 
    sequenceId: string; 
  }>();
  const { user } = useAuthContext();

  // State for modals and forms
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<any>(null);
  const [deletingStepId, setDeletingStepId] = useState<string | null>(null);

  // Determine if current user is external
  const isExternal = isExternalUser(user);
  
  // Get job and sequence data
  const { data: job, isLoading: jobLoading } = useJob(jobId || '');
  const { data: externalJob, isLoading: externalJobLoading } = useExternalJobDetail(isExternal ? (jobId || '') : '');
  const { data: sequence, isLoading: sequenceLoading } = useEmailSequence(sequenceId || '');

  // Mutations
  const updateSequenceMutation = useUpdateEmailSequence();

  // Use appropriate data
  const effectiveJob = isExternal ? externalJob : job;
  const effectiveJobLoading = isExternal ? externalJobLoading : jobLoading;

  // Get steps from the sequence
  const steps = sequence?.steps || [];

  // Construct URLs
  const backUrl = isExternal 
    ? `/external/jobs/${jobId}/email-sequences`
    : `/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${jobId}/email-sequences`;

  const sequenceDetailUrl = isExternal 
    ? `/external/jobs/${jobId}/email-sequences/${sequenceId}`
    : `/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${jobId}/email-sequences/${sequenceId}`;

  const getStepTypeIcon = (type: string) => {
    const icons = {
      email: <Mail className="w-5 h-5" />,
      sms: <MessageSquare className="w-5 h-5" />,
      call: <Phone className="w-5 h-5" />,
      task: <CheckSquare className="w-5 h-5" />,
      wait: <Clock className="w-5 h-5" />,
      linkedin_message: <MessageSquare className="w-5 h-5" />
    };
    return icons[type as keyof typeof icons] || <Mail className="w-5 h-5" />;
  };

  const getStepTypeColor = (type: string) => {
    const colors = {
      email: 'bg-blue-100 text-blue-600',
      sms: 'bg-green-100 text-green-600',
      call: 'bg-yellow-100 text-yellow-600',
      task: 'bg-purple-100 text-purple-600',
      wait: 'bg-gray-100 text-gray-600',
      linkedin_message: 'bg-indigo-100 text-indigo-600'
    };
    return colors[type as keyof typeof colors] || 'bg-blue-100 text-blue-600';
  };

  // Helper function to remove id from step and filter allowed properties only
  const removeIdFromStep = (step: any) => {
    // Only include properties that are allowed by the backend DTO
    const allowedStepProps = {
      name: step.name,
      description: step.description,
      type: step.type,
      status: step.status,
      stepOrder: step.stepOrder,
      subject: step.subject,
      content: step.content,
      htmlContent: step.htmlContent,
      variables: step.variables,
      triggerType: step.triggerType,
      delayHours: step.delayHours,
      delayMinutes: step.delayMinutes,
      // Convert triggerConditions array to the expected object format
      triggerConditions: Array.isArray(step.triggerConditions) && step.triggerConditions.length > 0 
        ? {
            // Convert array to object format expected by backend
            responseReceived: step.triggerConditions.some((c: any) => c.field === 'response.received'),
            emailOpened: step.triggerConditions.some((c: any) => c.field === 'email.opened'),
            linkClicked: step.triggerConditions.some((c: any) => c.field === 'link.clicked'),
            customCondition: step.triggerConditions.find((c: any) => c.field === 'custom')?.value || undefined
          }
        : step.triggerConditions,
      sendingSettings: step.sendingSettings,
      isActive: step.isActive,
      metadata: step.metadata
    };

    // Remove undefined values to keep the payload clean
    Object.keys(allowedStepProps).forEach(key => {
      if (allowedStepProps[key as keyof typeof allowedStepProps] === undefined) {
        delete allowedStepProps[key as keyof typeof allowedStepProps];
      }
    });

    return allowedStepProps;
  };

  const handleCreateStep = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditStep = (step: any) => {
    setEditingStep(step);
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!sequenceId || !sequence) return;
    
    setDeletingStepId(stepId);
    try {
      // Remove step from sequence steps array and strip IDs
      const updatedSteps = steps
        .filter(step => step.id !== stepId)
        .map(removeIdFromStep);
      await updateSequenceMutation.mutateAsync({
        id: sequenceId,
        data: { steps: updatedSteps }
      });
    } catch (error) {
      console.error('Failed to delete step:', error);
    } finally {
      setDeletingStepId(null);
    }
  };

  if (effectiveJobLoading || sequenceLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!effectiveJob || !sequence) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {!effectiveJob ? 'Job Not Found' : 'Sequence Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {!effectiveJob 
              ? 'The job you\'re looking for doesn\'t exist.' 
              : 'The email sequence you\'re looking for doesn\'t exist.'
            }
          </p>
          <Link
            to={backUrl}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Email Sequences
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumbs - Only show for internal users */}
      {!isExternal && (
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link to="/dashboard/organizations" className="hover:text-gray-700">Organizations</Link>
          <span className="mx-2">/</span>
          <Link to={`/dashboard/organizations/${organizationId}`} className="hover:text-gray-700">
            Organization
          </Link>
          <span className="mx-2">/</span>
          <Link to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs`} className="hover:text-gray-700">
            {effectiveJob.department}
          </Link>
          <span className="mx-2">/</span>
          <Link to={`/dashboard/jobs/${jobId}/ats`} className="hover:text-gray-700">
            ATS - {effectiveJob.title}
          </Link>
          <span className="mx-2">/</span>
          <Link to={backUrl} className="hover:text-gray-700">
            Email Sequences
          </Link>
          <span className="mx-2">/</span>
          <Link to={sequenceDetailUrl} className="hover:text-gray-700">
            {sequence.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Steps</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={sequenceDetailUrl}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sequence
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sequence.name} - Steps</h1>
            <p className="text-gray-600 mt-1">
              Manage the steps in this email sequence for {effectiveJob.title}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateStep}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </button>
          </div>
        </div>
      </div>

      {/* Sequence Info */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">{sequence.name}</h3>
              <p className="text-gray-600 text-sm">
                {sequence.type} • {sequence.category} • {steps?.length || 0} steps
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              sequence.status === 'active' ? 'bg-green-100 text-green-800' :
              sequence.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {sequence.status}
            </span>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sequence Steps</h2>
          <p className="text-gray-600 text-sm mt-1">
            Configure the automated steps in your sequence
          </p>
        </div>
        
        <div className="p-6">
          {steps && steps.length > 0 ? (
            <div className="space-y-4">
              {steps
                .sort((a, b) => a.stepOrder - b.stepOrder)
                .map((step, index) => (
                <div key={step.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-medium ${getStepTypeColor(step.type)}`}>
                            {getStepTypeIcon(step.type)}
                            <span className="ml-1 capitalize">{step.type}</span>
                          </div>
                          
                          {step.triggerType === 'delay' && (
                            <div className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-600 rounded-lg text-sm">
                              <Timer className="w-4 h-4 mr-1" />
                              {step.delayHours}h {step.delayMinutes}m delay
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{step.name}</h3>
                        
                        {step.description && (
                          <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                        )}
                        
                        {step.subject && (
                          <p className="text-gray-800 text-sm mb-2">
                            <span className="font-medium">Subject:</span> {step.subject}
                          </p>
                        )}
                        
                        {step.content && (
                          <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 mb-2">
                            {step.content.length > 200 
                              ? `${step.content.substring(0, 200)}...` 
                              : step.content
                            }
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Order: {step.stepOrder}</span>
                          <span>Status: {step.status}</span>
                          <span>Trigger: {step.triggerType}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditStep(step)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Edit step"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        disabled={deletingStepId === step.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="Delete step"
                      >
                        {deletingStepId === step.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No steps configured</h3>
              <p className="text-gray-600 mb-6">
                Add steps to define the automated workflow for this sequence.
              </p>
              <button
                onClick={handleCreateStep}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Step
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Step Modal would go here */}
      {(isCreateModalOpen || editingStep) && (
        <CreateEditStepModal
          isOpen={isCreateModalOpen || !!editingStep}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingStep(null);
          }}
          step={editingStep}
          sequenceId={sequenceId!}
          nextStepOrder={(steps?.length || 0) + 1}
          sequence={sequence}
          steps={steps}
        />
      )}
    </div>
  );
};

// Simple modal component for creating/editing steps
const CreateEditStepModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  step?: any;
  sequenceId: string;
  nextStepOrder: number;
  sequence: EmailSequence;
  steps: EmailSequenceStep[];
}> = ({ isOpen, onClose, step, sequenceId, nextStepOrder, sequence, steps }) => {
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [previewData, setPreviewData] = useState<{
    subject: string;
    content: string;
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [activeSection, setActiveSection] = useState<'basic' | 'conditional' | 'abtesting' | 'timing'>('basic');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  
  // Template hooks
  const { data: recruitmentTemplates, isLoading: recruitmentLoading } = useRecruitmentTemplates();
  
  // Helper function to remove id from step and filter allowed properties only
  const removeIdFromStep = (step: any) => {
    // Only include properties that are allowed by the backend DTO
    const allowedStepProps = {
      name: step.name,
      description: step.description,
      type: step.type,
      status: step.status,
      stepOrder: step.stepOrder,
      subject: step.subject,
      content: step.content,
      htmlContent: step.htmlContent,
      variables: step.variables,
      triggerType: step.triggerType,
      delayHours: step.delayHours,
      delayMinutes: step.delayMinutes,
      // Convert triggerConditions array to the expected object format
      triggerConditions: Array.isArray(step.triggerConditions) && step.triggerConditions.length > 0 
        ? {
            // Convert array to object format expected by backend
            responseReceived: step.triggerConditions.some((c: any) => c.field === 'response.received'),
            emailOpened: step.triggerConditions.some((c: any) => c.field === 'email.opened'),
            linkClicked: step.triggerConditions.some((c: any) => c.field === 'link.clicked'),
            customCondition: step.triggerConditions.find((c: any) => c.field === 'custom')?.value || undefined
          }
        : step.triggerConditions,
      sendingSettings: step.sendingSettings,
      isActive: step.isActive,
      metadata: step.metadata
    };

    // Remove undefined values to keep the payload clean
    Object.keys(allowedStepProps).forEach(key => {
      if (allowedStepProps[key as keyof typeof allowedStepProps] === undefined) {
        delete allowedStepProps[key as keyof typeof allowedStepProps];
      }
    });

    return allowedStepProps;
  };

  // Function to apply template to form
  const applyTemplate = (template: EmailTemplate) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description || prev.description,
      subject: template.subject,
      content: template.body || '',
    }));
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
  };

  // Function to insert variable at cursor position
  const insertVariable = (variable: string) => {
    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = formData.content;
      const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);
      
      setFormData(prev => ({ ...prev, content: newValue }));
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  // Function to generate preview
  const handlePreview = async () => {
    if (formData.type !== 'email') return;
    
    setIsLoadingPreview(true);
    try {
      const preview = await EmailSequencesApiService.previewTemplate({
        subject: formData.subject,
        content: formData.content,
      });
      setPreviewData(preview);
      setActiveTab('preview');
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const [formData, setFormData] = useState({
    name: step?.name || '',
    description: step?.description || '',
    type: step?.type || 'email',
    status: step?.status || 'active',
    stepOrder: step?.stepOrder || nextStepOrder,
    subject: step?.subject || '',
    content: step?.content || '',
    htmlContent: step?.htmlContent || null,
    variables: step?.variables || null,
    triggerType: step?.triggerType || 'immediate',
    delayHours: step?.delayHours || 0,
    delayMinutes: step?.delayMinutes || 0,
    triggerConditions: step?.triggerConditions || null,
    sendingSettings: step?.sendingSettings || null,
    isActive: step?.isActive ?? true,
    metadata: step?.metadata || null
  });

  const updateSequenceMutation = useUpdateEmailSequence();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sequenceId || !sequence) return;
    
    try {
      if (step) {
        // Update existing step in sequence - strip IDs from all steps
        const updatedSteps = steps
          .map(s => s.id === step.id ? { ...s, ...formData } : s)
          .map(removeIdFromStep);
        await updateSequenceMutation.mutateAsync({
          id: sequenceId,
          data: { steps: updatedSteps }
        });
      } else {
        // Add new step to sequence - strip IDs from all steps
        const newStep = {
          ...formData
        };
        const allSteps = [...steps, newStep];
        const updatedSteps = allSteps.map(removeIdFromStep);
        await updateSequenceMutation.mutateAsync({
          id: sequenceId,
          data: { steps: updatedSteps }
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save step:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {step ? 'Edit Step' : 'Create New Step'}
            </h2>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Section Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveSection('basic')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'basic'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Basic Settings
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('conditional')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'conditional'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Conditional Logic
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('abtesting')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'abtesting'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TestTube className="w-4 h-4" />
                    A/B Testing
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('timing')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'timing'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Smart Timing
                  </div>
                </button>
              </nav>
            </div>

            {/* Basic Settings Section */}
            {activeSection === 'basic' && (
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Step Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                      placeholder="e.g., Initial outreach email"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Step Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="call">Phone Call</option>
                      <option value="task">Task</option>
                      <option value="wait">Wait/Delay</option>
                      <option value="linkedin_message">LinkedIn Message</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    placeholder="Brief description of this step..."
                  />
                </div>

                {/* Template Selection for Email Steps */}
                {formData.type === 'email' && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h3 className="text-sm font-medium text-gray-900">Use Email Template</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                      >
                        <Wand2 className="w-4 h-4" />
                        {showTemplateSelector ? 'Hide Templates' : 'Browse Templates'}
                      </button>
                    </div>
                    
                    {selectedTemplate && (
                      <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-900">{selectedTemplate.name}</p>
                            <p className="text-xs text-green-700">{selectedTemplate.category} • {selectedTemplate.type}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedTemplate(null)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}

                    {showTemplateSelector && (
                      <div className="space-y-4">
                        {/* Template Categories */}
                        <div className="grid grid-cols-1 gap-4">
                          {/* Recruitment Templates */}
                          {recruitmentTemplates && recruitmentTemplates.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                Recruitment Templates
                              </h4>
                              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                                {recruitmentTemplates.map((template) => (
                                  <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => applyTemplate(template)}
                                    className="text-left p-3 border border-gray-200 rounded-lg hover:bg-white hover:border-purple-300 transition-colors"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{template.name}</p>
                                        <p className="text-xs text-gray-500">{template.description}</p>
                                        <p className="text-xs text-blue-600 mt-1">{template.subject}</p>
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {template.usageCount} uses
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Loading State */}
                          {recruitmentLoading && (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                              <p className="text-xs text-gray-500 mt-2">Loading templates...</p>
                            </div>
                          )}

                          {/* No Templates Message */}
                          {!recruitmentLoading && !recruitmentTemplates?.length && (
                            <div className="text-center py-6 text-gray-500">
                              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm">No recruitment templates available</p>
                              <p className="text-xs">Contact your admin to add templates</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Email-specific fields */}
                {formData.type === 'email' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Subject *
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                        placeholder="Email subject line..."
                        required={formData.type === 'email'}
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Email Content *
                          <span className="text-xs text-gray-500 ml-2">
                            Use variables like {"{{candidate.name}}"}, {"{{job.title}}"}, {"{{company.name}}"}
                          </span>
                        </label>
                        <div className="flex">
                          <button
                            type="button"
                            onClick={() => setActiveTab('edit')}
                            className={`px-3 py-1 text-sm rounded-l-md border ${
                              activeTab === 'edit'
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={handlePreview}
                            disabled={isLoadingPreview}
                            className={`px-3 py-1 text-sm rounded-r-md border-t border-r border-b flex items-center gap-1 ${
                              activeTab === 'preview'
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <Eye className="w-3 h-3" />
                            {isLoadingPreview ? 'Loading...' : 'Preview'}
                          </button>
                        </div>
                      </div>
                      
                      {activeTab === 'edit' ? (
                        <>
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => insertVariable('{{candidate.name}}')}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              >
                                Candidate Name
                              </button>
                              <button
                                type="button"
                                onClick={() => insertVariable('{{candidate.firstName}}')}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              >
                                First Name
                              </button>
                              <button
                                type="button"
                                onClick={() => insertVariable('{{job.title}}')}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                Job Title
                              </button>
                              <button
                                type="button"
                                onClick={() => insertVariable('{{company.name}}')}
                                className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                              >
                                Company Name
                              </button>
                              <button
                                type="button"
                                onClick={() => insertVariable('{{recruiter.name}}')}
                                className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                              >
                                Recruiter Name
                              </button>
                            </div>
                          </div>
                          <textarea
                            ref={contentTextareaRef}
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            rows={8}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                            placeholder={`Hi {{candidate.firstName}},

I hope this email finds you well. I came across your profile and was impressed by your background in {{candidate.skills}}.

We have an exciting opportunity for a {{job.title}} position at {{company.name}} that I think would be a great fit for your experience.

Would you be interested in learning more about this role?

Best regards,
{{recruiter.name}}`}
                            required={formData.type === 'email'}
                          />
                          <div className="mt-2 text-xs text-gray-500">
                            <p><strong>Available Variables:</strong></p>
                            <p>• <code>{"{{candidate.name}}"}</code>, <code>{"{{candidate.firstName}}"}</code>, <code>{"{{candidate.lastName}}"}</code></p>
                            <p>• <code>{"{{candidate.email}}"}</code>, <code>{"{{candidate.phone}}"}</code>, <code>{"{{candidate.skills}}"}</code></p>
                            <p>• <code>{"{{job.title}}"}</code>, <code>{"{{job.department}}"}</code>, <code>{"{{job.location}}"}</code></p>
                            <p>• <code>{"{{company.name}}"}</code>, <code>{"{{recruiter.name}}"}</code>, <code>{"{{recruiter.email}}"}</code></p>
                          </div>
                        </>
                      ) : (
                        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                          {previewData ? (
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Subject:</h4>
                                <div className="bg-white p-3 rounded border text-sm">
                                  {previewData.subject || 'No subject'}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Content:</h4>
                                <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                                  {previewData.content || 'No content'}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-8">
                              Click the Preview button to see how your email will look with sample data
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Timing Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trigger Type
                    </label>
                    <select
                      value={formData.triggerType}
                      onChange={(e) => setFormData(prev => ({ ...prev, triggerType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="delay">After Delay</option>
                      <option value="condition">Based on Condition</option>
                      <option value="manual">Manual Trigger</option>
                      <option value="branch">Branch to Multiple Paths</option>
                      <option value="ab_test">A/B Test Variant</option>
                    </select>
                  </div>
                  
                  {formData.triggerType === 'delay' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delay Hours
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.delayHours}
                          onChange={(e) => setFormData(prev => ({ ...prev, delayHours: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delay Minutes
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.delayMinutes}
                          onChange={(e) => setFormData(prev => ({ ...prev, delayMinutes: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Other sections temporarily disabled */}
            {(activeSection === 'conditional' || activeSection === 'abtesting' || activeSection === 'timing') && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {activeSection === 'conditional' && <GitBranch className="w-5 h-5 text-yellow-600" />}
                    {activeSection === 'abtesting' && <TestTube className="w-5 h-5 text-yellow-600" />}
                    {activeSection === 'timing' && <Brain className="w-5 h-5 text-yellow-600" />}
                    <h3 className="text-lg font-medium text-yellow-900">
                      {activeSection === 'conditional' && 'Conditional Logic'}
                      {activeSection === 'abtesting' && 'A/B Testing'}
                      {activeSection === 'timing' && 'Smart Timing'}
                    </h3>
                  </div>
                  <p className="text-sm text-yellow-700">
                    This feature is coming soon. Focus on basic email step configuration for now.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {step ? 'Update Step' : 'Create Step'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobSequenceStepsPage;

                {/* Trigger Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Trigger Conditions
                  </label>
                  <div className="space-y-3">
                    {formData.triggerConditions.map((condition, index) => (
                      <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Field</label>
                            <select
                              value={condition.field || ''}
                              onChange={(e) => {
                                const newConditions = [...formData.triggerConditions];
                                newConditions[index] = { ...newConditions[index], field: e.target.value };
                                setFormData(prev => ({ ...prev, triggerConditions: newConditions }));
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            >
                              <option value="">Select field...</option>
                              <option value="candidate.status">Candidate Status</option>
                              <option value="candidate.rating">Candidate Rating</option>
                              <option value="candidate.source">Candidate Source</option>
                              <option value="candidate.location">Candidate Location</option>
                              <option value="candidate.experience">Experience Level</option>
                              <option value="email.opened">Email Opened</option>
                              <option value="email.clicked">Email Clicked</option>
                              <option value="email.replied">Email Replied</option>
                              <option value="previous_step.completed">Previous Step Completed</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Operator</label>
                            <select
                              value={condition.operator || ''}
                              onChange={(e) => {
                                const newConditions = [...formData.triggerConditions];
                                newConditions[index] = { ...newConditions[index], operator: e.target.value };
                                setFormData(prev => ({ ...prev, triggerConditions: newConditions }));
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            >
                              <option value="">Select operator...</option>
                              <option value="equals">Equals</option>
                              <option value="not_equals">Not Equals</option>
                              <option value="contains">Contains</option>
                              <option value="not_contains">Does Not Contain</option>
                              <option value="greater_than">Greater Than</option>
                              <option value="less_than">Less Than</option>
                              <option value="is_empty">Is Empty</option>
                              <option value="is_not_empty">Is Not Empty</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
                            <input
                              type="text"
                              value={condition.value || ''}
                              onChange={(e) => {
                                const newConditions = [...formData.triggerConditions];
                                newConditions[index] = { ...newConditions[index], value: e.target.value };
                                setFormData(prev => ({ ...prev, triggerConditions: newConditions }));
                              }}
                              placeholder="Condition value..."
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                const newConditions = formData.triggerConditions.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, triggerConditions: newConditions }));
                              }}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newConditions = [...formData.triggerConditions, { field: '', operator: '', value: '' }];
                        setFormData(prev => ({ ...prev, triggerConditions: newConditions }));
                      }}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-purple-300 hover:text-purple-600 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Condition
                    </button>
                  </div>
                </div>

                {/* Branching Rules */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Branching Rules
                  </label>
                  <div className="space-y-3">
                    {formData.branchingRules.map((rule, index) => (
                      <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Branch Name</label>
                            <input
                              type="text"
                              value={rule.branchName || ''}
                              onChange={(e) => {
                                const newRules = [...formData.branchingRules];
                                newRules[index] = { ...newRules[index], branchName: e.target.value };
                                setFormData(prev => ({ ...prev, branchingRules: newRules }));
                              }}
                              placeholder="e.g., High Interest"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Percentage (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={rule.percentage || ''}
                              onChange={(e) => {
                                const newRules = [...formData.branchingRules];
                                newRules[index] = { ...newRules[index], percentage: parseInt(e.target.value) || 0 };
                                setFormData(prev => ({ ...prev, branchingRules: newRules }));
                              }}
                              placeholder="50"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                const newRules = formData.branchingRules.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, branchingRules: newRules }));
                              }}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newRules = [...formData.branchingRules, { branchName: '', percentage: 0 }];
                        setFormData(prev => ({ ...prev, branchingRules: newRules }));
                      }}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-purple-300 hover:text-purple-600 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Branch
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* A/B Testing Section */}
            {activeSection === 'abtesting' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TestTube className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-medium text-green-900">A/B Testing Configuration</h3>
                  </div>
                  <p className="text-sm text-green-700">
                    Set up A/B tests to optimize your email performance by testing different variations.
                  </p>
                </div>

                {/* Enable A/B Testing */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="enableABTest"
                    checked={!!formData.abTestConfig}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          abTestConfig: {
                            enabled: true,
                            testName: '',
                            variants: [
                              { variantId: 'A', config: { name: 'Variant A', subject: '', content: '', delayHours: 0, delayMinutes: 0 } },
                              { variantId: 'B', config: { name: 'Variant B', subject: '', content: '', delayHours: 0, delayMinutes: 0 } }
                            ],
                            trafficSplit: { A: 50, B: 50 },
                            winnerCriteria: {
                              metric: 'open_rate',
                              minSampleSize: 100,
                              confidenceLevel: 95,
                              testDuration: 7
                            }
                          }
                        }));
                      } else {
                        setFormData(prev => ({ ...prev, abTestConfig: null }));
                      }
                    }}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="enableABTest" className="text-sm font-medium text-gray-700">
                    Enable A/B Testing for this step
                  </label>
                </div>

                {formData.abTestConfig && (
                  <div className="space-y-6">
                    {/* Test Configuration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Name
                      </label>
                      <input
                        type="text"
                        value={formData.abTestConfig.testName || ''}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            abTestConfig: { ...prev.abTestConfig!, testName: e.target.value }
                          }));
                        }}
                        placeholder="e.g., Subject Line Test - Formal vs Casual"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    {/* Variants */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Test Variants
                      </label>
                      <div className="space-y-4">
                        {formData.abTestConfig.variants?.map((variant, index) => (
                          <div key={variant.variantId} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-900">
                                Variant {variant.variantId}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Traffic:</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={formData.abTestConfig.trafficSplit?.[variant.variantId] || 0}
                                  onChange={(e) => {
                                    const newSplit = { ...formData.abTestConfig!.trafficSplit };
                                    newSplit[variant.variantId] = parseInt(e.target.value) || 0;
                                    setFormData(prev => ({
                                      ...prev,
                                      abTestConfig: { ...prev.abTestConfig!, trafficSplit: newSplit }
                                    }));
                                  }}
                                  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                                />
                                <span className="text-xs text-gray-500">%</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Variant Name
                                </label>
                                <input
                                  type="text"
                                  value={variant.config.name || ''}
                                  onChange={(e) => {
                                    const newVariants = [...formData.abTestConfig!.variants!];
                                    newVariants[index] = {
                                      ...newVariants[index],
                                      config: { ...newVariants[index].config, name: e.target.value }
                                    };
                                    setFormData(prev => ({
                                      ...prev,
                                      abTestConfig: { ...prev.abTestConfig!, variants: newVariants }
                                    }));
                                  }}
                                  placeholder="e.g., Formal Tone"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                                />
                              </div>
                              {formData.type === 'email' && (
                                <>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Subject Line
                                    </label>
                                    <input
                                      type="text"
                                      value={variant.config.subject || ''}
                                      onChange={(e) => {
                                        const newVariants = [...formData.abTestConfig!.variants!];
                                        newVariants[index] = {
                                          ...newVariants[index],
                                          config: { ...newVariants[index].config, subject: e.target.value }
                                        };
                                        setFormData(prev => ({
                                          ...prev,
                                          abTestConfig: { ...prev.abTestConfig!, variants: newVariants }
                                        }));
                                      }}
                                      placeholder="Subject line for this variant..."
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Email Content
                                    </label>
                                    <textarea
                                      value={variant.config.content || ''}
                                      onChange={(e) => {
                                        const newVariants = [...formData.abTestConfig!.variants!];
                                        newVariants[index] = {
                                          ...newVariants[index],
                                          config: { ...newVariants[index].config, content: e.target.value }
                                        };
                                        setFormData(prev => ({
                                          ...prev,
                                          abTestConfig: { ...prev.abTestConfig!, variants: newVariants }
                                        }));
                                      }}
                                      rows={4}
                                      placeholder="Email content for this variant..."
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 font-mono"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Winner Criteria */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Winner Criteria
                      </label>
                      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Success Metric
                            </label>
                            <select
                              value={formData.abTestConfig.winnerCriteria?.metric || 'open_rate'}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  abTestConfig: {
                                    ...prev.abTestConfig!,
                                    winnerCriteria: { ...prev.abTestConfig!.winnerCriteria!, metric: e.target.value }
                                  }
                                }));
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            >
                              <option value="open_rate">Open Rate</option>
                              <option value="click_rate">Click Rate</option>
                              <option value="response_rate">Response Rate</option>
                              <option value="conversion_rate">Conversion Rate</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Minimum Sample Size
                            </label>
                            <input
                              type="number"
                              min="10"
                              value={formData.abTestConfig.winnerCriteria?.minSampleSize || 100}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  abTestConfig: {
                                    ...prev.abTestConfig!,
                                    winnerCriteria: { ...prev.abTestConfig!.winnerCriteria!, minSampleSize: parseInt(e.target.value) || 100 }
                                  }
                                }));
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Confidence Level (%)
                            </label>
                            <select
                              value={formData.abTestConfig.winnerCriteria?.confidenceLevel || 95}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  abTestConfig: {
                                    ...prev.abTestConfig!,
                                    winnerCriteria: { ...prev.abTestConfig!.winnerCriteria!, confidenceLevel: parseInt(e.target.value) }
                                  }
                                }));
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            >
                              <option value="90">90%</option>
                              <option value="95">95%</option>
                              <option value="99">99%</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Test Duration (days)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={formData.abTestConfig.winnerCriteria?.testDuration || 7}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  abTestConfig: {
                                    ...prev.abTestConfig!,
                                    winnerCriteria: { ...prev.abTestConfig!.winnerCriteria!, testDuration: parseInt(e.target.value) || 7 }
                                  }
                                }));
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Smart Timing Section */}
            {activeSection === 'timing' && (
              <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-medium text-orange-900">Smart Timing Configuration</h3>
                  </div>
                  <p className="text-sm text-orange-700">
                    Optimize send times for better engagement using AI-powered timing and candidate preferences.
                  </p>
                </div>

                {/* Enable Smart Timing */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="enableSmartTiming"
                    checked={formData.smartTiming.enabled}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        smartTiming: { ...prev.smartTiming, enabled: e.target.checked }
                      }));
                    }}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="enableSmartTiming" className="text-sm font-medium text-gray-700">
                    Enable Smart Timing for this step
                  </label>
                </div>

                {formData.smartTiming.enabled && (
                  <div className="space-y-6">
                    {/* Timezone & Business Hours */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Timezone & Business Hours</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="candidateTimezone"
                            checked={formData.smartTiming.candidateTimezone}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                smartTiming: { ...prev.smartTiming, candidateTimezone: e.target.checked }
                              }));
                            }}
                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <label htmlFor="candidateTimezone" className="text-sm text-gray-700">
                            Adjust for candidate's timezone
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Business Hours Start
                            </label>
                            <input
                              type="time"
                              value={formData.smartTiming.businessHoursStart}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  smartTiming: { ...prev.smartTiming, businessHoursStart: e.target.value }
                                }));
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Business Hours End
                            </label>
                            <input
                              type="time"
                              value={formData.smartTiming.businessHoursEnd}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  smartTiming: { ...prev.smartTiming, businessHoursEnd: e.target.value }
                                }));
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sending Windows */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Preferred Sending Windows</h4>
                      <div className="space-y-3">
                        {formData.smartTiming.sendingWindows.map((window, index) => (
                          <div key={index} className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
                                <select
                                  value={window.day || ''}
                                  onChange={(e) => {
                                    const newWindows = [...formData.smartTiming.sendingWindows];
                                    newWindows[index] = { ...newWindows[index], day: e.target.value };
                                    setFormData(prev => ({
                                      ...prev,
                                      smartTiming: { ...prev.smartTiming, sendingWindows: newWindows }
                                    }));
                                  }}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                                >
                                  <option value="">Select day...</option>
                                  <option value="monday">Monday</option>
                                  <option value="tuesday">Tuesday</option>
                                  <option value="wednesday">Wednesday</option>
                                  <option value="thursday">Thursday</option>
                                  <option value="friday">Friday</option>
                                  <option value="saturday">Saturday</option>
                                  <option value="sunday">Sunday</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                                <input
                                  type="time"
                                  value={window.startTime || ''}
                                  onChange={(e) => {
                                    const newWindows = [...formData.smartTiming.sendingWindows];
                                    newWindows[index] = { ...newWindows[index], startTime: e.target.value };
                                    setFormData(prev => ({
                                      ...prev,
                                      smartTiming: { ...prev.smartTiming, sendingWindows: newWindows }
                                    }));
                                  }}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                                <input
                                  type="time"
                                  value={window.endTime || ''}
                                  onChange={(e) => {
                                    const newWindows = [...formData.smartTiming.sendingWindows];
                                    newWindows[index] = { ...newWindows[index], endTime: e.target.value };
                                    setFormData(prev => ({
                                      ...prev,
                                      smartTiming: { ...prev.smartTiming, sendingWindows: newWindows }
                                    }));
                                  }}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newWindows = formData.smartTiming.sendingWindows.filter((_, i) => i !== index);
                                    setFormData(prev => ({
                                      ...prev,
                                      smartTiming: { ...prev.smartTiming, sendingWindows: newWindows }
                                    }));
                                  }}
                                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newWindows = [...formData.smartTiming.sendingWindows, { day: '', startTime: '', endTime: '' }];
                            setFormData(prev => ({
                              ...prev,
                              smartTiming: { ...prev.smartTiming, sendingWindows: newWindows }
                            }));
                          }}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-purple-300 hover:text-purple-600 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Sending Window
                        </button>
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Options</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="avoidHolidays"
                            checked={formData.smartTiming.avoidHolidays}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                smartTiming: { ...prev.smartTiming, avoidHolidays: e.target.checked }
                              }));
                            }}
                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <label htmlFor="avoidHolidays" className="text-sm text-gray-700">
                            Avoid major holidays
                          </label>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="personalizedTiming"
                            checked={formData.smartTiming.personalizedTiming}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                smartTiming: { ...prev.smartTiming, personalizedTiming: e.target.checked }
                              }));
                            }}
                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <label htmlFor="personalizedTiming" className="text-sm text-gray-700">
                            Use AI-powered personalized timing
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateSequenceMutation.isPending}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {updateSequenceMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                step ? 'Update Step' : 'Create Step'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobSequenceStepsPage;
