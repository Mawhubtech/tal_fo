import React, { useState } from 'react';
import { Plus, ArrowLeft, Settings, Play, Pause, Trash2, Mail, Users, UserCheck, UserPlus, Edit, Zap, ZapOff } from 'lucide-react';
import { useProjectSequences, useSendSequenceEmails, useUpdateSequence, useDeleteSequence, useSequenceEnrollments, sequenceQueryKeys } from '../../../hooks/useSourcingSequences';
import { useSetupDefaultSequences } from '../../../hooks/useSourcingProjects';
import { CreateSequenceModal } from './CreateSequenceModal';
import { ProjectSequenceStepsPage } from './ProjectSequenceStepsPage';
import { EnrollCandidatesModal } from './EnrollCandidatesModal';
import { SourcingSequence } from '../../../services/sourcingProjectApiService';
import { toast } from '../../../components/ToastContainer';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { useQueryClient } from '@tanstack/react-query';

interface ProjectSequencesPageProps {
  projectId: string;
  project: any;
}

type ViewMode = 'list' | 'steps';

// Component to display enrolled candidates for a sequence
const SequenceEnrollments: React.FC<{ sequenceId: string }> = ({ sequenceId }) => {
  const { data: enrollments, isLoading } = useSequenceEnrollments(sequenceId);

  if (isLoading) {
    return (
      <div className="flex items-center text-xs text-gray-500 mt-2">
        <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
        Loading enrollments...
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700 flex items-center">
        <Users className="w-3 h-3 mr-1" />
        No candidates enrolled yet
      </div>
    );
  }

  const activeEnrollments = enrollments.filter(e => e.status === 'active');
  const pausedEnrollments = enrollments.filter(e => e.status === 'paused');
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');
  const failedEnrollments = enrollments.filter(e => e.status === 'failed');

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-gray-700">
        <span className="flex items-center">
          <UserCheck className="w-3 h-3 mr-1" />
          Enrolled Candidates ({enrollments.length})
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-1 text-xs">
        <div className="bg-green-50 border border-green-200 rounded px-2 py-1 text-center">
          <div className="font-medium text-green-700">{activeEnrollments.length}</div>
          <div className="text-green-600">Active</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1 text-center">
          <div className="font-medium text-yellow-700">{pausedEnrollments.length}</div>
          <div className="text-yellow-600">Paused</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-center">
          <div className="font-medium text-blue-700">{completedEnrollments.length}</div>
          <div className="text-blue-600">Completed</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded px-2 py-1 text-center">
          <div className="font-medium text-red-700">{failedEnrollments.length}</div>
          <div className="text-red-600">Failed</div>
        </div>
      </div>

      {/* Show list of active candidates */}
      {activeEnrollments.length > 0 && (
        <div className="text-xs">
          <div className="text-gray-600 font-medium mb-1">Active Candidates:</div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {activeEnrollments.slice(0, 3).map((enrollment, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                <span className="text-gray-700">
                  {enrollment.candidate?.fullName || enrollment.candidate?.email || 'Unknown'}
                </span>
                <span className="text-gray-500">Step {enrollment.currentStepOrder}</span>
              </div>
            ))}
            {activeEnrollments.length > 3 && (
              <div className="text-gray-500 text-center">
                +{activeEnrollments.length - 3} more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const ProjectSequencesPage: React.FC<ProjectSequencesPageProps> = ({
  projectId,
  project,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSequence, setEditingSequence] = useState<SourcingSequence | null>(null);
  const [sendingEmailsFor, setSendingEmailsFor] = useState<string | null>(null);
  const [updatingStatusFor, setUpdatingStatusFor] = useState<string | null>(null);
  const [deletingSequenceId, setDeletingSequenceId] = useState<string | null>(null);
  const [enrollModalState, setEnrollModalState] = useState<{
    isOpen: boolean;
    sequenceId: string | null;
    sequenceName: string | null;
  }>({
    isOpen: false,
    sequenceId: null,
    sequenceName: null
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    sequenceId: string | null;
    sequenceName: string | null;
  }>({
    isOpen: false,
    sequenceId: null,
    sequenceName: null
  });
  const [setupDefaultConfirmation, setSetupDefaultConfirmation] = useState(false);

  const { data: sequences, isLoading, error } = useProjectSequences(projectId);
  const sendSequenceEmailsMutation = useSendSequenceEmails();
  const updateSequenceMutation = useUpdateSequence();
  const deleteSequenceMutation = useDeleteSequence();
  const setupDefaultSequencesMutation = useSetupDefaultSequences();
  const queryClient = useQueryClient();

  // Check if default sequences exist
  const defaultSequenceNames = [
    'Initial Outreach Sequence',
    'Response Follow-up Sequence', 
    'Interest Nurturing Sequence'
  ];
  
  const hasDefaultSequences = sequences && sequences.some(sequence => 
    defaultSequenceNames.includes(sequence.name)
  );

  const handleCreateSequence = () => {
    setIsCreateModalOpen(true);
  };

  const handleSetupDefaultSequences = async () => {
    setSetupDefaultConfirmation(true);
  };

  const confirmSetupDefaultSequences = async () => {
    try {
      await setupDefaultSequencesMutation.mutateAsync(projectId);
      
      // Invalidate sequences queries to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: sequenceQueryKeys.byProject(projectId) 
      });
      
      toast.success(
        'Default sequences created!', 
        'Three default email sequences have been set up for your sourcing pipeline.'
      );
    } catch (error) {
      console.error('Failed to setup default sequences:', error);
      toast.error(
        'Failed to setup default sequences', 
        'Please try again or check your pipeline configuration.'
      );
    } finally {
      setSetupDefaultConfirmation(false);
    }
  };

  const cancelSetupDefaultSequences = () => {
    setSetupDefaultConfirmation(false);
  };

  const handleSequenceCreated = (sequenceId: string) => {
    setIsCreateModalOpen(false);
    setEditingSequence(null);
    // Navigate to step management for the new sequence
    setSelectedSequenceId(sequenceId);
    setViewMode('steps');
  };

  const handleEditSequence = (sequence: SourcingSequence) => {
    setEditingSequence(sequence);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingSequence(null);
  };

  const handleManageSteps = (sequenceId: string) => {
    setSelectedSequenceId(sequenceId);
    setViewMode('steps');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSequenceId(null);
  };

  const handleSendEmails = async (sequenceId: string) => {
    try {
      setSendingEmailsFor(sequenceId);
      const result = await sendSequenceEmailsMutation.mutateAsync(sequenceId);
      
      // Show success message
      if (result.jobId) {
        toast.success(
          'Email sending started!',
          `Job ID: ${result.jobId}\n\n${result.message}`
        );
      } else {
        toast.success('Email sequence initiated', result.message);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error('Failed to send emails', 'Please try again.');
    } finally {
      setSendingEmailsFor(null);
    }
  };

  const handlePauseSequence = async (sequenceId: string) => {
    try {
      setUpdatingStatusFor(sequenceId);
      await updateSequenceMutation.mutateAsync({
        id: sequenceId,
        data: { status: 'paused' }
      });
      toast.success('Sequence paused', 'The sequence has been paused successfully.');
    } catch (error) {
      console.error('Error pausing sequence:', error);
      toast.error('Failed to pause sequence', 'Please try again.');
    } finally {
      setUpdatingStatusFor(null);
    }
  };

  const handleResumeSequence = async (sequenceId: string) => {
    try {
      setUpdatingStatusFor(sequenceId);
      await updateSequenceMutation.mutateAsync({
        id: sequenceId,
        data: { status: 'active' }
      });
      toast.success('Sequence resumed', 'The sequence has been resumed successfully.');
    } catch (error) {
      console.error('Error resuming sequence:', error);
      toast.error('Failed to resume sequence', 'Please try again.');
    } finally {
      setUpdatingStatusFor(null);
    }
  };

  const handleActivateSequence = async (sequenceId: string) => {
    try {
      setUpdatingStatusFor(sequenceId);
      await updateSequenceMutation.mutateAsync({
        id: sequenceId,
        data: { status: 'active' }
      });
      toast.success('Sequence activated', 'The sequence has been activated successfully.');
    } catch (error) {
      console.error('Error activating sequence:', error);
      toast.error('Failed to activate sequence', 'Please try again.');
    } finally {
      setUpdatingStatusFor(null);
    }
  };

  const handleToggleAutoEnrollment = async (sequenceId: string, currentTrigger: string) => {
    try {
      setUpdatingStatusFor(sequenceId);
      const newTrigger = currentTrigger === 'stage_change' ? 'manual' : 'stage_change';
      
      await updateSequenceMutation.mutateAsync({
        id: sequenceId,
        data: { trigger: newTrigger }
      });
      
      const message = newTrigger === 'stage_change' 
        ? 'Auto-enrollment has been enabled. New prospects will be automatically enrolled when they reach the target stage.'
        : 'Auto-enrollment has been disabled. Only manual enrollment is allowed.';
      
      toast.success('Auto-enrollment updated', message);
    } catch (error) {
      console.error('Error toggling auto-enrollment:', error);
      toast.error('Failed to toggle auto-enrollment', 'Please try again.');
    } finally {
      setUpdatingStatusFor(null);
    }
  };

  const handleOpenEnrollModal = (sequenceId: string, sequenceName: string) => {
    setEnrollModalState({
      isOpen: true,
      sequenceId,
      sequenceName
    });
  };

  const handleCloseEnrollModal = () => {
    setEnrollModalState({
      isOpen: false,
      sequenceId: null,
      sequenceName: null
    });
  };

  const handleDeleteSequence = async (sequenceId: string, sequenceName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      sequenceId,
      sequenceName
    });
  };

  const confirmDeleteSequence = async () => {
    if (!deleteConfirmation.sequenceId || !deleteConfirmation.sequenceName) return;

    try {
      setDeletingSequenceId(deleteConfirmation.sequenceId);
      await deleteSequenceMutation.mutateAsync({
        id: deleteConfirmation.sequenceId,
        projectId: projectId
      });
      toast.success('Sequence deleted', `"${deleteConfirmation.sequenceName}" has been deleted successfully.`);
    } catch (error) {
      console.error('Error deleting sequence:', error);
      toast.error('Failed to delete sequence', 'Please try again.');
    } finally {
      setDeletingSequenceId(null);
      setDeleteConfirmation({
        isOpen: false,
        sequenceId: null,
        sequenceName: null
      });
    }
  };

  const cancelDeleteSequence = () => {
    setDeleteConfirmation({
      isOpen: false,
      sequenceId: null,
      sequenceName: null
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (viewMode === 'steps' && selectedSequenceId) {
    return (
      <ProjectSequenceStepsPage
        projectId={projectId}
        sequenceId={selectedSequenceId}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sequences</h2>
          <p className="text-gray-600 mt-1">
            Create and manage outreach sequences for this project
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCreateSequence}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Sequence
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load sequences</p>
        </div>
      ) : sequences && sequences.length > 0 ? (
        <div className="space-y-4">
          {sequences.map((sequence: SourcingSequence) => (
            <div key={sequence.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Sequence Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{sequence.name}</h3>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(sequence.status)}`}>
                    {sequence.status.charAt(0).toUpperCase() + sequence.status.slice(1)}
                  </div>
                </div>
              </div>

              {/* Description */}
              {sequence.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{sequence.description}</p>
              )}

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Steps:</span>
                  <span className="font-medium">{sequence.steps?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{sequence.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trigger:</span>
                  <span className="font-medium capitalize">{sequence.trigger}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium capitalize px-2 py-0.5 rounded-full text-xs ${getStatusColor(sequence.status)}`}>
                    {sequence.status}
                  </span>
                </div>
                {/* Target Stages */}
                {sequence.targetCriteria?.stages && sequence.targetCriteria.stages.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Target Stages:</span>
                    <div className="flex flex-wrap gap-1 max-w-32">
                      {sequence.targetCriteria.stages.slice(0, 2).map((stageId, index) => {
                        // Find the stage name from the project's pipeline stages
                        const stage = project?.pipeline?.stages?.find((s: any) => s.id === stageId);
                        const stageName = stage?.name || 'Unknown';
                        return (
                          <span
                            key={stageId}
                            className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded truncate"
                            title={`${stageName} - Candidates moving to this stage will be auto-enrolled`}
                          >
                            {stageName.length > 8 ? stageName.substring(0, 8) + '...' : stageName}
                          </span>
                        );
                      })}
                      {sequence.targetCriteria.stages.length > 2 && (
                        <span className="text-xs text-gray-500" title={`${sequence.targetCriteria.stages.length - 2} more target stages`}>
                          +{sequence.targetCriteria.stages.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleManageSteps(sequence.id)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Steps
                </button>

                {/* Edit Sequence Button */}
                <button
                  onClick={() => handleEditSequence(sequence)}
                  className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                  title="Edit sequence"
                >
                  <Edit className="w-4 h-4" />
                </button>

                {/* Enroll Candidates Button - only for active sequences */}
                {sequence.status === 'active' && (
                  <button
                    onClick={() => handleOpenEnrollModal(sequence.id, sequence.name)}
                    className="inline-flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition-colors"
                    title="Enroll candidates in this sequence"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                )}

                {/* Send Emails Button - only for active sequences with steps */}
                {sequence.status === 'active' && (sequence.steps?.length || 0) > 0 && (
                  <button
                    onClick={() => handleSendEmails(sequence.id)}
                    disabled={sendingEmailsFor === sequence.id}
                    className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send emails to enrolled candidates"
                  >
                    {sendingEmailsFor === sequence.id ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </button>
                )}
                
                {/* Auto-enrollment Toggle - only for active sequences */}
                {sequence.status === 'active' && (
                  <button
                    onClick={() => handleToggleAutoEnrollment(sequence.id, sequence.trigger)}
                    disabled={updatingStatusFor === sequence.id}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      sequence.trigger === 'stage_change'
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={`Auto-enrollment: ${sequence.trigger === 'stage_change' ? 'ON - Automatically enrolls candidates when they move to target stages. Pending emails from non-target stages will be cancelled.' : 'OFF - Manual enrollment only'} - Click to toggle`}
                  >
                    {updatingStatusFor === sequence.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : sequence.trigger === 'stage_change' ? (
                      <Zap className="w-4 h-4" />
                    ) : (
                      <ZapOff className="w-4 h-4" />
                    )}
                  </button>
                )}
                
                {/* Status Control Buttons */}
                {sequence.status === 'active' ? (
                  <button
                    onClick={() => handlePauseSequence(sequence.id)}
                    disabled={updatingStatusFor === sequence.id}
                    className="inline-flex items-center px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Pause sequence"
                  >
                    {updatingStatusFor === sequence.id ? (
                      <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                  </button>
                ) : sequence.status === 'paused' ? (
                  <button
                    onClick={() => handleResumeSequence(sequence.id)}
                    disabled={updatingStatusFor === sequence.id}
                    className="inline-flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Resume sequence"
                  >
                    {updatingStatusFor === sequence.id ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                ) : sequence.status === 'draft' ? (
                  <button
                    onClick={() => handleActivateSequence(sequence.id)}
                    disabled={(sequence.steps?.length || 0) === 0 || updatingStatusFor === sequence.id}
                    className="inline-flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={(sequence.steps?.length || 0) === 0 ? 'Add steps before activating' : 'Activate sequence'}
                  >
                    {updatingStatusFor === sequence.id ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                ) : null}

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteSequence(sequence.id, sequence.name)}
                  disabled={deletingSequenceId === sequence.id}
                  className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete sequence"
                >
                  {deletingSequenceId === sequence.id ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Warning for empty sequences */}
              {(sequence.steps?.length || 0) === 0 && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                  Add steps to activate this sequence
                </div>
              )}

              {/* Enrollment Information */}
              <SequenceEnrollments sequenceId={sequence.id} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Settings className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sequences yet</h3>
          
          {project?.pipelineId ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Get started quickly with pre-built sequences for your sourcing pipeline.
                Sequences will automatically manage candidate enrollments as they move through pipeline stages.
              </p>
              
              {!hasDefaultSequences && (
                <button
                  onClick={handleSetupDefaultSequences}
                  disabled={setupDefaultSequencesMutation.isPending}
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {setupDefaultSequencesMutation.isPending ? (
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Setup Default Sequences
                </button>
              )}
              
              <div className="text-gray-500 text-sm">
                Or create your own custom sequence:
              </div>
              
              <button
                onClick={handleCreateSequence}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Sequence
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Create your first outreach sequence to get started
              </p>
              <button
                onClick={handleCreateSequence}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Sequence
              </button>
              
              <div className="text-xs text-gray-500 mt-2">
                Tip: Assign a pipeline to this project to enable quick setup with default sequences
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <CreateSequenceModal
          projectId={projectId}
          project={project}
          sequence={editingSequence}
          onClose={handleCloseCreateModal}
          onSuccess={handleSequenceCreated}
        />
      )}

      {/* Enroll Candidates Modal */}
      {enrollModalState.isOpen && enrollModalState.sequenceId && (
        <EnrollCandidatesModal
          isOpen={enrollModalState.isOpen}
          onClose={handleCloseEnrollModal}
          sequenceId={enrollModalState.sequenceId}
          sequenceName={enrollModalState.sequenceName || ''}
          projectId={projectId}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={cancelDeleteSequence}
        onConfirm={confirmDeleteSequence}
        title="Delete Sequence"
        message={`Are you sure you want to delete "${deleteConfirmation.sequenceName}"? This action cannot be undone and will remove all enrolled candidates from this sequence.`}
        confirmText="Delete Sequence"
        cancelText="Cancel"
        type="danger"
      />

      {/* Setup Default Sequences Confirmation Modal */}
      <ConfirmationModal
        isOpen={setupDefaultConfirmation}
        onClose={cancelSetupDefaultSequences}
        onConfirm={confirmSetupDefaultSequences}
        title="Setup Default Sequences"
        message="This will create three default email sequences for your sourcing pipeline: Initial Outreach, Response Follow-up, and Interest Nurturing. Each sequence will include professional email templates and be configured for your pipeline stages."
        confirmText="Create Default Sequences"
        cancelText="Cancel"
        type="primary"
      />
    </div>
  );
};
