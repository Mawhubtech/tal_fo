import React, { useEffect } from 'react';
import { AlertTriangle, Copy, Users, Briefcase } from 'lucide-react';

interface PipelineUsage {
  activeJobs: number;
  totalJobs: number;
  activeApplications: number;
  totalApplications: number;
  stageUsage: { stageName: string; stageId: string; applicationCount: number }[];
}

interface PipelineUsageWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCopy: () => void;
  onProceedAnyway: () => void;
  pipelineName: string;
  usage: PipelineUsage;
}

const PipelineUsageWarningModal: React.FC<PipelineUsageWarningModalProps> = ({
  isOpen,
  onClose,
  onCreateCopy,
  onProceedAnyway,
  pipelineName,
  usage,
}) => {
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

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Pipeline is Currently in Use
              </h3>
              <p className="text-sm text-gray-600">
                "{pipelineName}" is being used by active jobs and applications
              </p>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Current Usage</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {usage.activeJobs} Active Jobs
                  </p>
                  <p className="text-xs text-gray-500">
                    {usage.totalJobs} total jobs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {usage.activeApplications} Applications
                  </p>
                  <p className="text-xs text-gray-500">
                    across all stages
                  </p>
                </div>
              </div>
            </div>

            {/* Stage Usage Breakdown */}
            {usage.stageUsage.some(stage => stage.applicationCount > 0) && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Applications by Stage</h5>
                <div className="space-y-2">
                  {usage.stageUsage
                    .filter(stage => stage.applicationCount > 0)
                    .map((stage, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-700">{stage.stageName}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {stage.applicationCount} applications
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Warning Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-amber-800 mb-2">Important Notice</h4>
            <p className="text-sm text-amber-700 mb-3">
              Editing this pipeline will affect all jobs and applications currently using it. 
              Changes to stages may impact candidate tracking and workflow.
            </p>
            <p className="text-sm text-amber-700">
              <strong>Recommended:</strong> Create a copy of this pipeline for your changes 
              to avoid disrupting existing workflows.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCreateCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Create Copy & Edit
            </button>
            <button
              onClick={onProceedAnyway}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Edit Original (Risky)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineUsageWarningModal;
