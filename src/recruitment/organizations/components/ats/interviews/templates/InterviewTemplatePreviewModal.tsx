import React, { useEffect } from 'react';
import { X, Clock, FileText, Users, Play, Copy, Star } from 'lucide-react';
import { InterviewTemplate, QuestionFormat } from '../../../../../../types/interviewTemplate.types';

interface InterviewTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: InterviewTemplate;
  onUseTemplate?: () => void;
}

export const InterviewTemplatePreviewModal: React.FC<InterviewTemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template,
  onUseTemplate
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

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-green-100 text-green-800';
      case 'behavioral': return 'bg-purple-100 text-purple-800';
      case 'cultural': return 'bg-blue-100 text-blue-800';
      case 'situational': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionFormatColor = (format: string) => {
    switch (format) {
      case QuestionFormat.YES_NO_WITH_JUSTIFICATION: return 'bg-pink-100 text-pink-800';
      case QuestionFormat.RATING_WITH_JUSTIFICATION: return 'bg-indigo-100 text-indigo-800';
      case QuestionFormat.SHORT_DESCRIPTION: return 'bg-cyan-100 text-cyan-800';
      case QuestionFormat.LONG_DESCRIPTION: return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionFormatLabel = (format: string) => {
    switch (format) {
      case QuestionFormat.YES_NO_WITH_JUSTIFICATION: return 'Yes/No + Justification';
      case QuestionFormat.RATING_WITH_JUSTIFICATION: return 'Rating + Justification';
      case QuestionFormat.SHORT_DESCRIPTION: return 'Short Description';
      case QuestionFormat.LONG_DESCRIPTION: return 'Long Description';
      default: return 'Unknown Format';
    }
  };

  const totalTime = template.questions.reduce((sum, q) => sum + (q.timeLimit || 0), 0);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
                {template.isDefault && <Star className="w-5 h-5 text-yellow-500" />}
              </div>
              <p className="text-sm text-gray-500">{template.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onUseTemplate && (
              <button
                onClick={onUseTemplate}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Use Template</span>
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Template Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{template.duration}</div>
                <div className="text-sm text-gray-500">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{template.questions.length}</div>
                <div className="text-sm text-gray-500">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalTime}</div>
                <div className="text-sm text-gray-500">Total Question Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{template.usageCount}</div>
                <div className="text-sm text-gray-500">Times Used</div>
              </div>
            </div>

            {/* Type Badge */}
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                template.interviewType === 'Phone Screen' ? 'bg-blue-100 text-blue-800' :
                template.interviewType === 'Technical' ? 'bg-green-100 text-green-800' :
                template.interviewType === 'Behavioral' ? 'bg-purple-100 text-purple-800' :
                template.interviewType === 'Final' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {template.interviewType} Interview
              </span>
            </div>

            {/* Instructions */}
            {template.instructions && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Interview Instructions</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{template.instructions}</p>
                </div>
              </div>
            )}

            {/* Questions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Questions</h3>
              <div className="space-y-4">
                {template.questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQuestionTypeColor(question.type)}`}>
                          {question.type}
                        </span>
                        {question.format && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQuestionFormatColor(question.format)}`}>
                            {getQuestionFormatLabel(question.format)}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{question.timeLimit} min</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-900 font-medium">{question.question}</p>
                        {question.category && (
                          <p className="text-sm text-gray-500 mt-1">Category: {question.category}</p>
                        )}
                        {question.section && (
                          <p className="text-sm text-gray-500 mt-1">Section: {question.section}</p>
                        )}
                        
                        {/* Format-specific information */}
                        {question.format === QuestionFormat.RATING_WITH_JUSTIFICATION && question.ratingScale && (
                          <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded">
                            <p className="text-xs font-medium text-indigo-800">
                              Rating Scale: {question.ratingScale.min} - {question.ratingScale.max}
                              {question.ratingScale.labels && Object.keys(question.ratingScale.labels).length > 0 && (
                                <span className="ml-2">
                                  ({Object.entries(question.ratingScale.labels).map(([key, value]) => `${key}: ${value}`).join(', ')})
                                </span>
                              )}
                              {question.requiresJustification && <span className="text-indigo-600"> + Justification Required</span>}
                            </p>
                          </div>
                        )}
                        
                        {question.format === QuestionFormat.YES_NO_WITH_JUSTIFICATION && (
                          <div className="mt-2 p-2 bg-pink-50 border border-pink-200 rounded">
                            <p className="text-xs font-medium text-pink-800">
                              Yes/No Response{question.requiresJustification && ' + Justification Required'}
                            </p>
                          </div>
                        )}
                        
                        {(question.format === QuestionFormat.SHORT_DESCRIPTION || question.format === QuestionFormat.LONG_DESCRIPTION) && question.maxCharacters && (
                          <div className="mt-2 p-2 bg-cyan-50 border border-cyan-200 rounded">
                            <p className="text-xs font-medium text-cyan-800">
                              Character Limit: {question.maxCharacters} characters
                            </p>
                          </div>
                        )}
                      </div>

                      {question.expectedAnswer && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-medium text-green-800 mb-1">Expected Answer / Guidance:</p>
                          <p className="text-sm text-green-700">{question.expectedAnswer}</p>
                        </div>
                      )}

                      {question.scoringCriteria && question.scoringCriteria.length > 0 && (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm font-medium text-gray-800 mb-2">Scoring Criteria:</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {question.scoringCriteria.map((criterion, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-gray-400 mr-2">•</span>
                                <span>{criterion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preparation Notes */}
            {template.preparationNotes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Preparation Notes</h3>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{template.preparationNotes}</p>
                </div>
              </div>
            )}

            {/* Evaluation Criteria */}
            {template.evaluationCriteria && template.evaluationCriteria.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Evaluation Criteria</h3>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <ul className="space-y-2">
                    {template.evaluationCriteria.map((criterion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-400 mr-2">•</span>
                        <span className="text-gray-700">{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <p><span className="font-medium">Created:</span> {new Date(template.createdAt).toLocaleDateString()}</p>
                  <p><span className="font-medium">Last Used:</span> {template.lastUsedAt ? new Date(template.lastUsedAt).toLocaleDateString() : 'Never'}</p>
                </div>
                <div>
                  <p><span className="font-medium">Visibility:</span> {template.isPublic ? 'Public' : 'Private'}</p>
                  <p><span className="font-medium">Usage Count:</span> {template.usageCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {template.questions.length} questions • {template.duration} minutes • {template.interviewType}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            {onUseTemplate && (
              <button
                onClick={onUseTemplate}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Use This Template</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
