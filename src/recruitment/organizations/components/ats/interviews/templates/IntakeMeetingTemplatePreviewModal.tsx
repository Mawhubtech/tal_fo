import React from 'react';
import { X, MessageSquare, Clock, Users, Play, FileText } from 'lucide-react';
import { IntakeMeetingTemplate } from '../../../../../../types/intakeMeetingTemplate.types';

interface IntakeMeetingTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: IntakeMeetingTemplate;
  onUseTemplate?: () => void;
}

export const IntakeMeetingTemplatePreviewModal: React.FC<IntakeMeetingTemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template,
  onUseTemplate
}) => {
  if (!isOpen) return null;

  // Group questions by section
  const questionsBySection = template.questions.reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = [];
    }
    acc[question.section].push(question);
    return acc;
  }, {} as Record<string, typeof template.questions>);

  const sections = Object.keys(questionsBySection);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{template.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Template Info */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{template.questions.length}</p>
                <p className="text-xs text-gray-500">Questions</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{sections.length}</p>
                <p className="text-xs text-gray-500">Sections</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{template.usageCount}</p>
                <p className="text-xs text-gray-500">Times Used</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(template.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">Created</p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  {section}
                </h3>
                <div className="space-y-3">
                  {questionsBySection[section]
                    .sort((a, b) => a.order - b.order)
                    .map((question, index) => (
                      <div key={question.id || index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {question.question}
                            </h4>
                            {question.helpText && (
                              <p className="text-sm text-gray-600 italic mb-2">
                                {question.helpText}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="capitalize">
                                Type: {question.type.replace('_', ' ')}
                              </span>
                              <span>Category: {question.category}</span>
                              {question.required && (
                                <span className="text-red-600 font-medium">Required</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {question.placeholder && (
                          <div className="mt-2 p-2 bg-white border border-gray-200 rounded text-sm text-gray-500">
                            Placeholder: "{question.placeholder}"
                          </div>
                        )}
                        
                        {question.options && question.options.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Options:</p>
                            <div className="flex flex-wrap gap-1">
                              {question.options.map((option, optIndex) => (
                                <span
                                  key={optIndex}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                >
                                  {option}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Created by {template.createdBy.firstName} {template.createdBy.lastName}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
