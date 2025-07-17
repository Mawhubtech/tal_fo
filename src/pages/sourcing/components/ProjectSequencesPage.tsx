import React, { useState } from 'react';
import { Plus, ArrowLeft, Settings, Play, Pause, Trash2, Mail, Users, UserCheck, UserPlus, Edit } from 'lucide-react';
import { useProjectSequences, useSendSequenceEmails, useUpdateSequence, useSequenceEnrollments } from '../../../hooks/useSourcingSequences';
import { CreateSequenceModal } from './CreateSequenceModal';
import { ProjectSequenceStepsPage } from './ProjectSequenceStepsPage';
import { EnrollCandidatesModal } from './EnrollCandidatesModal';
import { SourcingSequence } from '../../../services/sourcingProjectApiService';

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

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-gray-700">
        <span className="flex items-center">
          <UserCheck className="w-3 h-3 mr-1" />
          Enrolled Candidates ({enrollments.length})
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
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
  const [enrollModalState, setEnrollModalState] = useState<{
    isOpen: boolean;
    sequenceId: string | null;
    sequenceName: string | null;
  }>({
    isOpen: false,
    sequenceId: null,
    sequenceName: null
  });

  const { data: sequences, isLoading, error } = useProjectSequences(projectId);
  const sendSequenceEmailsMutation = useSendSequenceEmails();
  const updateSequenceMutation = useUpdateSequence();

  const handleCreateSequence = () => {
    setIsCreateModalOpen(true);
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
        alert(`Email sending started! Job ID: ${result.jobId}\n\n${result.message}`);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send emails. Please try again.');
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
    } catch (error) {
      console.error('Error pausing sequence:', error);
      alert('Failed to pause sequence. Please try again.');
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
    } catch (error) {
      console.error('Error resuming sequence:', error);
      alert('Failed to resume sequence. Please try again.');
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
    } catch (error) {
      console.error('Error activating sequence:', error);
      alert('Failed to activate sequence. Please try again.');
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
        <button
          onClick={handleCreateSequence}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Sequence
        </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};
