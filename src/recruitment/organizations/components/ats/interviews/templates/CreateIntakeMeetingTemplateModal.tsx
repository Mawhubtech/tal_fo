import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Save, ArrowUp, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { 
  IntakeMeetingTemplate, 
  IntakeMeetingQuestion, 
  CreateIntakeMeetingTemplateRequest,
  AIIntakeMeetingTemplateRequest
} from '../../../../../../types/intakeMeetingTemplate.types';
import { 
  useCreateIntakeMeetingTemplate, 
  useUpdateIntakeMeetingTemplate,
  useGenerateAIIntakeMeetingTemplate
} from '../../../../../../hooks/useIntakeMeetingTemplates';
import { createDefaultIntakeMeetingTemplate } from '../../../../../../Data/defaultIntakeMeetingTemplate';
import { toast } from '../../../../../../components/ToastContainer';

interface CreateIntakeMeetingTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId?: string;
  onTemplateCreated?: (template: IntakeMeetingTemplate) => void;
  editTemplate?: IntakeMeetingTemplate;
  isEditMode?: boolean;
  onTemplateUpdated?: (template: IntakeMeetingTemplate) => void;
}

export const CreateIntakeMeetingTemplateModal: React.FC<CreateIntakeMeetingTemplateModalProps> = ({
  isOpen,
  onClose,
  organizationId,
  onTemplateCreated,
  editTemplate,
  isEditMode = false,
  onTemplateUpdated,
}) => {
  const [template, setTemplate] = useState<Partial<CreateIntakeMeetingTemplateRequest>>({
    name: '',
    description: '',
    questions: [],
    isDefault: false,
    organizationId
  });

  const createTemplateMutation = useCreateIntakeMeetingTemplate();
  const updateTemplateMutation = useUpdateIntakeMeetingTemplate();
  const generateAIMutation = useGenerateAIIntakeMeetingTemplate();

  // AI Generation states
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiInput, setAiInput] = useState({
    industry: '',
    companySize: '',
    hiringVolume: '',
    focusAreas: [] as string[],
    questionCount: 20,
    additionalInstructions: '',
    targetSeniority: 'mixed',
    commonRoles: [] as string[]
  });
  const [aiGenerating, setAiGenerating] = useState(false);

  // Initialize template state
  useEffect(() => {
    if (isEditMode && editTemplate) {
      setTemplate({
        name: editTemplate.name,
        description: editTemplate.description,
        questions: editTemplate.questions.map(q => ({
          question: q.question,
          type: q.type,
          category: q.category,
          section: q.section,
          required: q.required,
          placeholder: q.placeholder,
          options: q.options,
          order: q.order,
          helpText: q.helpText
        })),
        isDefault: editTemplate.isDefault,
        organizationId: editTemplate.organizationId || organizationId
      });
    } else {
      // Reset to default state
      setTemplate({
        name: '',
        description: '',
        questions: [],
        isDefault: false,
        organizationId
      });
    }
  }, [isEditMode, editTemplate, organizationId, isOpen]);

  const handleLoadDefaultTemplate = () => {
    const defaultTemplate = createDefaultIntakeMeetingTemplate();
    setTemplate(prev => ({
      ...prev,
      name: defaultTemplate.name,
      description: defaultTemplate.description,
      questions: defaultTemplate.questions
    }));
  };

  const handleAddQuestion = () => {
    const newQuestion: Omit<IntakeMeetingQuestion, 'id'> = {
      question: '',
      type: 'text',
      category: 'General',
      section: 'General',
      required: false,
      placeholder: '',
      order: (template.questions?.length || 0) + 1
    };

    setTemplate(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion]
    }));
  };

  const handleUpdateQuestion = (index: number, updates: Partial<IntakeMeetingQuestion>) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) => {
        if (i === index) {
          return { ...q, ...updates };
        }
        return q;
      }) || []
    }));
  };

  const handleDeleteQuestion = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions?.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i + 1 })) || []
    }));
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const questions = [...(template.questions || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < questions.length) {
      [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
      // Update order numbers
      questions.forEach((q, i) => q.order = i + 1);
      
      setTemplate(prev => ({ ...prev, questions }));
    }
  };

  const handleSave = async () => {
    if (!template.name?.trim()) {
      toast.error('Validation Error', 'Template name is required.');
      return;
    }

    if (!template.questions?.length) {
      toast.error('Validation Error', 'At least one question is required.');
      return;
    }

    try {
      const questionsWithOrder = template.questions.map((q, index) => ({
        ...q,
        order: index + 1
      }));

      if (isEditMode && editTemplate) {
        // Update existing template
        const updateData = {
          id: editTemplate.id,
          name: template.name,
          description: template.description || '',
          questions: questionsWithOrder,
          isDefault: template.isDefault,
          organizationId: template.organizationId
        };

        const updatedTemplate = await updateTemplateMutation.mutateAsync(updateData);
        onTemplateUpdated?.(updatedTemplate);
      } else {
        // Create new template
        const templateData: CreateIntakeMeetingTemplateRequest = {
          name: template.name,
          description: template.description || '',
          questions: questionsWithOrder,
          isDefault: template.isDefault,
          organizationId: template.organizationId
        };

        const newTemplate = await createTemplateMutation.mutateAsync(templateData);
        onTemplateCreated?.(newTemplate);
      }
      
      onClose();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} template:`, error);
      toast.error(`${isEditMode ? 'Update' : 'Creation'} Failed`, `Failed to ${isEditMode ? 'update' : 'create'} template. Please try again.`);
    }
  };

  const generateAITemplate = async () => {
    setAiGenerating(true);

    try {
      const aiRequest: AIIntakeMeetingTemplateRequest = {
        industry: aiInput.industry,
        companySize: aiInput.companySize,
        hiringVolume: aiInput.hiringVolume,
        focusAreas: aiInput.focusAreas,
        questionCount: aiInput.questionCount,
        additionalInstructions: aiInput.additionalInstructions,
        targetSeniority: aiInput.targetSeniority,
        commonRoles: aiInput.commonRoles
      };

      const response = await generateAIMutation.mutateAsync(aiRequest);

      // Apply AI generated template
      setTemplate(prev => ({
        ...prev,
        name: response.name,
        description: response.description,
        questions: response.questions
      }));

      // Close AI panel
      setShowAIPanel(false);
      
      toast.success('AI Generation Success', 'Intake meeting template generated successfully!');
    } catch (error) {
      console.error('Error generating AI template:', error);
      toast.error('AI Generation Failed', 'Failed to generate template. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleClose = () => {
    setTemplate({
      name: '',
      description: '',
      questions: [],
      isDefault: false,
      organizationId
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Edit Intake Meeting Template' : 'Create Intake Meeting Template'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode ? 'Update your intake meeting template' : 'Create a new template for client intake meetings'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Template Details */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <input
                type="text"
                value={template.name}
                onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="e.g., Role Discussion | Intake Meeting"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={template.description}
                onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                placeholder="Describe the purpose and scope of this intake meeting template..."
              />
            </div>

            {!isEditMode && (
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <button
                    onClick={handleLoadDefaultTemplate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Load Default Template
                  </button>
                  <button
                    onClick={() => setShowAIPanel(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate with AI</span>
                  </button>
                </div>
                <span className="text-sm text-gray-500">Or start from scratch</span>
              </div>
            )}
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Questions ({template.questions?.length || 0})</h3>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

            {template.questions?.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No questions added yet. Click "Add Question" or "Load Default Template" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {template.questions?.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleMoveQuestion(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveQuestion(index, 'down')}
                            disabled={index === (template.questions?.length || 0) - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(index)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                        <textarea
                          value={question.question}
                          onChange={(e) => handleUpdateQuestion(index, { question: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                          placeholder="Enter your question..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={question.type}
                          onChange={(e) => handleUpdateQuestion(index, { type: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="select">Select</option>
                          <option value="multiselect">Multi-select</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                          type="text"
                          value={question.category}
                          onChange={(e) => handleUpdateQuestion(index, { category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                          placeholder="e.g., Role Requirements"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                        <input
                          type="text"
                          value={question.section}
                          onChange={(e) => handleUpdateQuestion(index, { section: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                          placeholder="e.g., Role Discussion"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`required-${index}`}
                          checked={question.required}
                          onChange={(e) => handleUpdateQuestion(index, { required: e.target.checked })}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`required-${index}`} className="ml-2 block text-sm text-gray-900">
                          Required
                        </label>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                        <input
                          type="text"
                          value={question.placeholder || ''}
                          onChange={(e) => handleUpdateQuestion(index, { placeholder: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                          placeholder="Placeholder text for the input..."
                        />
                      </div>

                      {(question.type === 'select' || question.type === 'multiselect') && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Options (one per line)</label>
                          <textarea
                            value={(question.options || []).join('\n')}
                            onChange={(e) => handleUpdateQuestion(index, { 
                              options: e.target.value.split('\n').filter(opt => opt.trim()) 
                            })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Help Text</label>
                        <input
                          type="text"
                          value={question.helpText || ''}
                          onChange={(e) => handleUpdateQuestion(index, { helpText: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                          placeholder="Additional guidance for this question..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={
              (isEditMode ? updateTemplateMutation.isPending : createTemplateMutation.isPending) || 
              !template.name?.trim() || 
              !template.questions?.length
            }
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>
              {isEditMode 
                ? (updateTemplateMutation.isPending ? 'Updating...' : 'Update Template')
                : (createTemplateMutation.isPending ? 'Creating...' : 'Create Template')
              }
            </span>
          </button>
        </div>
      </div>

      {/* AI Generation Panel */}
      {showAIPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Generate Intake Meeting Template with AI</h2>
                <p className="text-sm text-gray-500 mt-1">Provide details about your organization and hiring needs</p>
              </div>
              <button
                onClick={() => setShowAIPanel(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <select
                    value={aiInput.industry}
                    onChange={(e) => setAiInput(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="">Select industry...</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Education">Education</option>
                    <option value="Non-profit">Non-profit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                  <select
                    value={aiInput.companySize}
                    onChange={(e) => setAiInput(prev => ({ ...prev, companySize: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="">Select company size...</option>
                    <option value="Startup (1-10)">Startup (1-10)</option>
                    <option value="Small (11-50)">Small (11-50)</option>
                    <option value="Medium (51-200)">Medium (51-200)</option>
                    <option value="Large (201-1000)">Large (201-1000)</option>
                    <option value="Enterprise (1000+)">Enterprise (1000+)</option>
                  </select>
                </div>

                {/* Hiring Volume */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Typical Hiring Volume</label>
                  <select
                    value={aiInput.hiringVolume}
                    onChange={(e) => setAiInput(prev => ({ ...prev, hiringVolume: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="">Select hiring volume...</option>
                    <option value="Low (1-5 per month)">Low (1-5 per month)</option>
                    <option value="Medium (6-15 per month)">Medium (6-15 per month)</option>
                    <option value="High (16-50 per month)">High (16-50 per month)</option>
                    <option value="Very High (50+ per month)">Very High (50+ per month)</option>
                  </select>
                </div>

                {/* Focus Areas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Focus Areas (Select multiple)</label>
                  <div className="space-y-2">
                    {[
                      'Role Requirements & Responsibilities',
                      'Team Structure & Dynamics',
                      'Company Culture & Values',
                      'Compensation & Benefits',
                      'Timeline & Urgency',
                      'Candidate Experience Level',
                      'Technical Skills & Qualifications',
                      'Interview Process Design',
                      'Hiring Challenges & Pain Points',
                      'Success Metrics & KPIs'
                    ].map((area) => (
                      <label key={area} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={aiInput.focusAreas.includes(area)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAiInput(prev => ({
                                ...prev,
                                focusAreas: [...prev.focusAreas, area]
                              }));
                            } else {
                              setAiInput(prev => ({
                                ...prev,
                                focusAreas: prev.focusAreas.filter(fa => fa !== area)
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                  <input
                    type="number"
                    value={aiInput.questionCount}
                    onChange={(e) => setAiInput(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 20 }))}
                    min="5"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 15-25 questions</p>
                </div>

                {/* Additional Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Instructions (Optional)</label>
                  <textarea
                    value={aiInput.additionalInstructions}
                    onChange={(e) => setAiInput(prev => ({ ...prev, additionalInstructions: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="Any specific requirements or focus areas for your intake meeting template..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAIPanel(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateAITemplate}
                disabled={aiGenerating || !aiInput.industry || !aiInput.companySize || !aiInput.hiringVolume || aiInput.focusAreas.length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Template</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
