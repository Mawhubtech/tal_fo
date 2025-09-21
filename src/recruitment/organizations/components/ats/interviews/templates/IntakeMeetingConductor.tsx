import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Save, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  FileText,
  MessageSquare,
  AlertCircle,
  X
} from 'lucide-react';
import { 
  IntakeMeetingSession, 
  IntakeMeetingQuestion,
  UpdateIntakeMeetingSessionRequest 
} from '../../../../../../types/intakeMeetingTemplate.types';
import { 
  useIntakeMeetingSession, 
  useUpdateIntakeMeetingSession,
  useGenerateJobDescription,
  useGenerateInterviewTemplate
} from '../../../../../../hooks/useIntakeMeetingTemplates';

interface IntakeMeetingConductorProps {
  sessionId: string;
  onClose: () => void;
  onSessionCompleted?: (sessionId: string) => void;
}

export const IntakeMeetingConductor: React.FC<IntakeMeetingConductorProps> = ({
  sessionId,
  onClose,
  onSessionCompleted
}) => {
  const { data: session, isLoading } = useIntakeMeetingSession(sessionId);
  const updateSessionMutation = useUpdateIntakeMeetingSession();
  const generateJobDescMutation = useGenerateJobDescription();
  const generateTemplatesMutation = useGenerateInterviewTemplate();

  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [followUpActions, setFollowUpActions] = useState<string[]>([]);
  const [newFollowUpAction, setNewFollowUpAction] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Group questions by section
  const sections = session ? Array.from(new Set(session.template.questions.map(q => q.section))) : [];
  const currentSection = sections[currentSectionIndex];
  const currentSectionQuestions = session?.template.questions.filter(q => q.section === currentSection) || [];

  // Initialize responses from session data
  useEffect(() => {
    if (session?.responses) {
      setResponses(session.responses);
    }
    if (session?.notes) {
      setNotes(session.notes);
    }
    if (session?.followUpActions) {
      setFollowUpActions(session.followUpActions);
    }
  }, [session]);

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async (markAsCompleted = false) => {
    if (!session) return;

    try {
      const updateData: UpdateIntakeMeetingSessionRequest = {
        responses,
        notes: notes || undefined,
        followUpActions: followUpActions.length > 0 ? followUpActions : undefined,
        status: markAsCompleted ? 'completed' : 'draft',
        completedAt: markAsCompleted ? new Date().toISOString() : undefined,
      };

      await updateSessionMutation.mutateAsync({
        id: sessionId,
        data: updateData
      });

      setHasUnsavedChanges(false);

      if (markAsCompleted && onSessionCompleted) {
        onSessionCompleted(sessionId);
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const handleAddFollowUpAction = () => {
    if (newFollowUpAction.trim()) {
      setFollowUpActions(prev => [...prev, newFollowUpAction.trim()]);
      setNewFollowUpAction('');
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveFollowUpAction = (index: number) => {
    setFollowUpActions(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const renderQuestionInput = (question: IntakeMeetingQuestion) => {
    const value = responses[question.id || ''] || '';

    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id || '', e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            required={question.required}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleResponseChange(question.id || '', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            required={question.required}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(value as string[])?.includes(option) || false}
                  onChange={(e) => {
                    const currentValues = (value as string[]) || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    handleResponseChange(question.id || '', newValues);
                  }}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleResponseChange(question.id || '', e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            required={question.required}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleResponseChange(question.id || '', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            required={question.required}
          />
        );

      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleResponseChange(question.id || '', e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            required={question.required}
          />
        );
    }
  };

  const handleGenerateJobDescription = async () => {
    try {
      const result = await generateJobDescMutation.mutateAsync(sessionId);
      // You can handle the result here - maybe open a modal to show the generated job description
      console.log('Generated job description:', result);
    } catch (error) {
      console.error('Failed to generate job description:', error);
    }
  };

  const handleGenerateInterviewTemplates = async () => {
    try {
      const phoneResult = await generateTemplatesMutation.mutateAsync({
        sessionId,
        interviewType: 'Phone Screen'
      });
      const technicalResult = await generateTemplatesMutation.mutateAsync({
        sessionId,
        interviewType: 'Technical'
      });
      // Handle the results
      console.log('Generated templates:', { phoneResult, technicalResult });
    } catch (error) {
      console.error('Failed to generate interview templates:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-red-600">Session not found</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Intake Meeting Session</h2>
            <p className="text-sm text-gray-500 mt-1">
              {session.clientName} • {session.template.name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <span className="text-xs text-orange-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Unsaved changes
              </span>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Section {currentSectionIndex + 1} of {sections.length}: {currentSection}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
                disabled={currentSectionIndex === 0}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-500">
                {currentSectionIndex + 1} / {sections.length}
              </span>
              <button
                onClick={() => setCurrentSectionIndex(Math.min(sections.length - 1, currentSectionIndex + 1))}
                disabled={currentSectionIndex === sections.length - 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Questions */}
          <div className="space-y-6">
            {currentSectionQuestions.map((question, index) => (
              <div key={question.id || index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-900">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    {question.category}
                  </span>
                </div>
                
                {question.helpText && (
                  <p className="text-xs text-gray-500 mb-3">{question.helpText}</p>
                )}
                
                {renderQuestionInput(question)}
              </div>
            ))}
          </div>

          {/* Notes Section */}
          <div className="mt-8 bg-blue-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Meeting Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="Add any additional notes, observations, or insights from the meeting..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Follow-up Actions */}
          <div className="mt-6 bg-yellow-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Follow-up Actions
            </label>
            
            <div className="space-y-2 mb-3">
              {followUpActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                  <span className="text-sm text-gray-700">{action}</span>
                  <button
                    onClick={() => handleRemoveFollowUpAction(index)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newFollowUpAction}
                onChange={(e) => setNewFollowUpAction(e.target.value)}
                placeholder="Add a follow-up action..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAddFollowUpAction()}
              />
              <button
                onClick={handleAddFollowUpAction}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleGenerateJobDescription}
                disabled={generateJobDescMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Job Description</span>
              </button>
              
              <button
                onClick={handleGenerateInterviewTemplates}
                disabled={generateTemplatesMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Generate Templates</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSave(false)}
                disabled={updateSessionMutation.isPending}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>
              
              <button
                onClick={() => handleSave(true)}
                disabled={updateSessionMutation.isPending}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Complete Meeting</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
