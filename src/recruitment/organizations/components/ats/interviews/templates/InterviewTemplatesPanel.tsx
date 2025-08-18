import React, { useState } from 'react';
import { FileText, Plus, Sparkles, Clock, Users } from 'lucide-react';
import { InterviewTemplate } from '../../../../../../types/interviewTemplate.types';
import { InterviewTemplateManager } from './InterviewTemplateManager';
import { CreateInterviewTemplateModal } from './CreateInterviewTemplateModal';
import { useJobInterviewTemplates } from '../../../../../../hooks/useInterviewTemplates';

interface InterviewTemplatesPanelProps {
  jobId?: string;
  jobTitle?: string;
  jobDescription?: string;
  jobRequirements?: string[];
  organizationId?: string;
  onTemplateSelect?: (template: InterviewTemplate) => void;
}

export const InterviewTemplatesPanel: React.FC<InterviewTemplatesPanelProps> = ({
  jobId,
  jobTitle = '',
  jobDescription = '',
  jobRequirements = [],
  organizationId,
  onTemplateSelect
}) => {
  const [showManager, setShowManager] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: jobTemplates, isLoading } = useJobInterviewTemplates(jobId || '');

  const handleTemplateSelect = (template: InterviewTemplate) => {
    onTemplateSelect?.(template);
    setShowManager(false);
  };

  if (showManager) {
    return (
      <InterviewTemplateManager
        jobId={jobId}
        jobTitle={jobTitle}
        jobDescription={jobDescription}
        jobRequirements={jobRequirements}
        organizationId={organizationId}
        onTemplateSelect={handleTemplateSelect}
        onClose={() => setShowManager(false)}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Interview Templates</h3>
          <p className="text-sm text-gray-500">Use structured templates for consistent interviews</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create with AI</span>
          </button>
          <button
            onClick={() => setShowManager(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Browse Templates</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading templates...</p>
        </div>
      ) : jobTemplates && jobTemplates.length > 0 ? (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Job-Specific Templates ({jobTemplates.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {jobTemplates.slice(0, 4).map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">
                    {template.name}
                  </h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.interviewType === 'Phone Screen' ? 'bg-blue-100 text-blue-800' :
                    template.interviewType === 'Technical' ? 'bg-green-100 text-green-800' :
                    template.interviewType === 'Behavioral' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {template.interviewType}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{template.duration}m</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>{template.questions.length} questions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{template.usageCount} uses</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {jobTemplates.length > 4 && (
            <button
              onClick={() => setShowManager(true)}
              className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View all {jobTemplates.length} templates →
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Templates Yet</h4>
          <p className="text-gray-500 mb-4">Create your first interview template for this job</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate with AI</span>
            </button>
            <button
              onClick={() => setShowManager(true)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Browse Existing
            </button>
          </div>
        </div>
      )}

      <CreateInterviewTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        jobId={jobId}
        jobTitle={jobTitle}
        jobDescription={jobDescription}
        jobRequirements={jobRequirements}
        organizationId={organizationId}
        onTemplateCreated={(template) => {
          setShowCreateModal(false);
          handleTemplateSelect(template);
        }}
      />
    </div>
  );
};
