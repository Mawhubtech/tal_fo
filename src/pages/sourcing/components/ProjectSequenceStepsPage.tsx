import React, { useState } from 'react';
import { Plus, Edit, Trash2, Mail, Clock, Target, ArrowRight, Settings, ArrowLeft } from 'lucide-react';
import { 
  useSequenceSteps, 
  useCreateSequenceStep, 
  useDeleteSequenceStep,
  useUpdateSequenceStep
} from '../../../hooks/useSourcingSequences';
import { SourcingSequenceStep } from '../../../services/sourcingProjectApiService';
import { CreateStepModal } from './CreateStepModal';

interface ProjectSequenceStepsPageProps {
  projectId: string;
  sequenceId: string; // Make this required - steps must belong to a sequence
  onCreateStep?: () => void;
  onEditStep?: (step: SourcingSequenceStep) => void;
  onBack?: () => void; // Optional back navigation
}

export const ProjectSequenceStepsPage: React.FC<ProjectSequenceStepsPageProps> = ({
  projectId,
  sequenceId,
  onCreateStep,
  onEditStep,
  onBack,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<SourcingSequenceStep | null>(null);
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);

  // Function to handle creating new step
  const handleCreateStep = () => {
    if (onCreateStep) {
      onCreateStep();
    } else {
      setIsCreateModalOpen(true);
    }
  };

  // Function to handle editing step
  const handleEditStep = (step: SourcingSequenceStep) => {
    if (onEditStep) {
      onEditStep(step);
    } else {
      setEditingStep(step);
      setIsCreateModalOpen(true);
    }
  };

  // Fetch steps for the specific sequence
  const { data: stepsData, isLoading: stepsLoading, error: stepsError } = useSequenceSteps(sequenceId);
  const createStepMutation = useCreateSequenceStep();
  const updateStepMutation = useUpdateSequenceStep();
  const deleteStepMutation = useDeleteSequenceStep();

  const steps = stepsData || [];

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'linkedin_message':
      case 'linkedin_connection':
        return <Target className="w-5 h-5 text-blue-800" />;
      case 'phone_call':
        return <Target className="w-5 h-5 text-green-600" />;
      case 'wait':
        return <Clock className="w-5 h-5 text-gray-600" />;
      default:
        return <Settings className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (confirm('Are you sure you want to delete this step?')) {
      try {
        await deleteStepMutation.mutateAsync(stepId);
      } catch (error) {
        console.error('Error deleting step:', error);
      }
    }
  };

  const handleReorderSteps = (draggedStepId: string, targetOrder: number) => {
    // Implement reorder logic
    console.log('Reordering step:', draggedStepId, 'to order:', targetOrder);
  };

  // Loading state
  if (stepsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Error state
  if (stepsError) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Steps</h2>
          <p className="text-gray-600 mb-4">There was an error loading the sequence steps.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sequence Steps</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create and manage the steps in your outreach sequences. Steps use templates and execute in order.
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateStep}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Step
        </button>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {/* Step Order */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-semibold text-sm">
                    {step.stepOrder}
                  </div>
                </div>

                {/* Step Icon and Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStepIcon(step.type)}
                    <h3 className="text-lg font-semibold text-gray-900">{step.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(step.status)}`}>
                      {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                    </span>
                  </div>

                  {/* Step Details */}
                  <div className="space-y-2">
                    {step.subject && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Subject: </span>
                        <span className="text-sm text-gray-600">{step.subject}</span>
                      </div>
                    )}
                    {step.config?.templateName && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Template: </span>
                        <span className="text-sm text-purple-600">{step.config.templateName}</span>
                      </div>
                    )}
                    {step.config && (step.config.delayDays > 0 || step.config.delayHours > 0 || step.config.delayMinutes > 0) && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Delay: {step.config.delayDays > 0 && `${step.config.delayDays}d `}
                          {step.config.delayHours > 0 && `${step.config.delayHours}h `}
                          {step.config.delayMinutes > 0 && `${step.config.delayMinutes}m`}
                          {(!step.config.delayDays && !step.config.delayHours && !step.config.delayMinutes) && 'Immediate'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metrics */}
                  {step.metrics && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">{step.metrics.totalExecuted || 0}</div>
                        <div className="text-xs text-gray-600">Executed</div>
                      </div>
                      {step.type === 'email' && (
                        <>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-semibold text-blue-600">
                              {step.metrics.opened && step.metrics.totalExecuted ? Math.round((step.metrics.opened / step.metrics.totalExecuted) * 100) : 0}%
                            </div>
                            <div className="text-xs text-gray-600">Open Rate</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-semibold text-green-600">
                              {step.metrics.replied && step.metrics.totalExecuted ? Math.round((step.metrics.replied / step.metrics.totalExecuted) * 100) : 0}%
                            </div>
                            <div className="text-xs text-gray-600">Reply Rate</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditStep(step)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="Edit Step"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteStep(step.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  title="Delete Step"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Connection Arrow to Next Step */}
            {index < steps.length - 1 && (
              <div className="flex justify-center mt-4">
                <ArrowRight className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {steps.length === 0 && (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sequence steps</h3>
            <p className="text-gray-600 mb-4">
              Create your first sequence step to define your outreach workflow.
            </p>
            <button
              onClick={handleCreateStep}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Step
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Step Modal */}
      {isCreateModalOpen && (
        <CreateStepModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingStep(null);
          }}
          onSave={async (stepData) => {
            try {
              if (editingStep) {
                // Update existing step
                await updateStepMutation.mutateAsync({
                  stepId: editingStep.id,
                  data: stepData  // Don't include sequenceId for updates - step already belongs to sequence
                });
              } else {
                // Create new step
                await createStepMutation.mutateAsync({
                  sequenceId: sequenceId,
                  data: {
                    ...stepData,
                    stepOrder: steps.length + 1, // Set order as next in sequence
                  }
                });
              }
              setIsCreateModalOpen(false);
              setEditingStep(null);
            } catch (error) {
              console.error('Error saving step:', error);
              // Handle error - maybe show a toast or error message
            }
          }}
          templates={[]} // TODO: Pass actual templates when available
          editingStep={editingStep}
        />
      )}
    </div>
  );
};
