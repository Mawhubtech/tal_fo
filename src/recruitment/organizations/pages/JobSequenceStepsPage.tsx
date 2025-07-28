import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Settings, Edit, Trash2, Mail, Clock, MessageSquare, Phone, CheckSquare, Timer } from 'lucide-react';
import { useJob } from '../../../hooks/useJobs';
import { useExternalJobDetail } from '../../../hooks/useExternalJobs';
import { useEmailSequence, useUpdateEmailSequence } from '../../../hooks/useEmailSequences';
import { EmailSequence, EmailSequenceStep } from '../../../services/emailSequencesApiService';
import { useAuthContext } from '../../../contexts/AuthContext';
import { isExternalUser } from '../../../utils/userUtils';

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

  // Helper function to remove id from step
  const removeIdFromStep = (step: any) => {
    const { id, ...stepWithoutId } = step;
    return stepWithoutId;
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
          <Link to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${jobId}/ats`} className="hover:text-gray-700">
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
  // Helper function to remove id from step
  const removeIdFromStep = (step: any) => {
    const { id, ...stepWithoutId } = step;
    return stepWithoutId;
  };

  const [formData, setFormData] = useState({
    name: step?.name || '',
    description: step?.description || '',
    type: step?.type || 'email',
    status: step?.status || 'active',
    stepOrder: step?.stepOrder || nextStepOrder,
    subject: step?.subject || '',
    content: step?.content || '',
    triggerType: step?.triggerType || 'immediate',
    delayHours: step?.delayHours || 0,
    delayMinutes: step?.delayMinutes || 0,
    isActive: step?.isActive ?? true
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="Brief description of this step..."
              />
            </div>

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Email subject line..."
                    required={formData.type === 'email'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Email content..."
                    required={formData.type === 'email'}
                  />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="immediate">Immediate</option>
                  <option value="delay">After Delay</option>
                  <option value="condition">Based on Condition</option>
                  <option value="manual">Manual Trigger</option>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </>
              )}
            </div>
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
