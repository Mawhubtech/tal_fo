import React, { useState, useRef } from 'react';
import { 
  X, Plus, Trash2, Edit2, Copy, Sparkles, Clock, FileText, 
  Users, Save, ArrowUp, ChevronUp, ChevronDown 
} from 'lucide-react';
import { InterviewTemplate, InterviewQuestion, CreateInterviewTemplateRequest } from '../../../../../../types/interviewTemplate.types';
import { useCreateInterviewTemplate, useGenerateAIInterviewTemplate } from '../../../../../../hooks/useInterviewTemplates';
import { aiService } from '../../../../../../services/aiService';
import { toast } from '../../../../../../components/ToastContainer';

interface CreateInterviewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId?: string;
  jobTitle?: string;
  jobDescription?: string;
  jobRequirements?: string[];
  organizationId?: string;
  onTemplateCreated?: (template: InterviewTemplate) => void;
}

interface AIGenerationStep {
  step: 'input' | 'generating' | 'review' | 'saving' | 'complete' | 'error';
  progress?: number;
  message?: string;
}

export const CreateInterviewTemplateModal: React.FC<CreateInterviewTemplateModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle = '',
  jobDescription = '',
  jobRequirements = [],
  organizationId,
  onTemplateCreated
}) => {
  const [template, setTemplate] = useState<Partial<CreateInterviewTemplateRequest>>({
    name: '',
    description: '',
    interviewType: 'Phone Screen',
    duration: 30,
    questions: [],
    instructions: '',
    preparationNotes: '',
    evaluationCriteria: [],
    isPublic: false,
    jobId,
    organizationId
  });

  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiGenerationStep, setAiGenerationStep] = useState<AIGenerationStep>({ step: 'input' });
  const [aiInput, setAiInput] = useState({
    difficulty: 'mid' as 'entry' | 'mid' | 'senior' | 'lead',
    focusAreas: '',
    additionalInstructions: ''
  });

  const createTemplateMutation = useCreateInterviewTemplate();
  const generateAIMutation = useGenerateAIInterviewTemplate();

  const handleAddQuestion = () => {
    const newQuestion: Omit<InterviewQuestion, 'id' | 'order'> = {
      question: '',
      type: 'general',
      category: 'General',
      difficulty: 'medium',
      timeLimit: 5
    };

    setTemplate(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion]
    }));
  };

  const handleUpdateQuestion = (index: number, updates: Partial<InterviewQuestion>) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) => 
        i === index ? { ...q, ...updates } : q
      ) || []
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions?.filter((_, i) => i !== index) || []
    }));
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const questions = template.questions || [];
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];

    setTemplate(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleAddEvaluationCriterion = () => {
    setTemplate(prev => ({
      ...prev,
      evaluationCriteria: [...(prev.evaluationCriteria || []), '']
    }));
  };

  const handleUpdateEvaluationCriterion = (index: number, value: string) => {
    setTemplate(prev => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria?.map((c, i) => 
        i === index ? value : c
      ) || []
    }));
  };

  const handleRemoveEvaluationCriterion = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria?.filter((_, i) => i !== index) || []
    }));
  };

  const generateAITemplate = async () => {
    setAiGenerationStep({ step: 'generating', progress: 0, message: 'Analyzing job requirements...' });

    try {
      // Prepare the AI prompt
      const focusAreas = (aiInput.focusAreas || '').split(',').map(area => area.trim()).filter(Boolean);

      const systemPrompt = `You are an expert HR professional and interview designer. Create a comprehensive screening interview template that helps evaluate candidates effectively. Focus on practical, insightful questions that reveal candidate fit and capabilities.`;

      const prompt = `Create a ${template.interviewType} interview template for the following position:

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Job Requirements: ${Array.isArray(jobRequirements) ? jobRequirements.join(', ') : (jobRequirements || 'Not specified')}
Experience Level: ${aiInput.difficulty}
Interview Duration: ${template.duration} minutes
${focusAreas.length > 0 ? `Focus Areas: ${focusAreas.join(', ')}` : ''}
${aiInput.additionalInstructions ? `Additional Instructions: ${aiInput.additionalInstructions}` : ''}Create a structured interview template with:
1. A descriptive name and overview
2. Clear interview instructions for the interviewer
3. ${Math.floor((template.duration || 30) / 5)} thoughtful questions that assess key competencies
4. Each question should include type, category, expected time, and difficulty
5. Preparation notes for the interviewer
6. Evaluation criteria for consistent assessment
7. Mix different question types: technical, behavioral, situational as appropriate

Make it professional, practical, and tailored to this specific role.`;

      setAiGenerationStep({ step: 'generating', progress: 30, message: 'Generating interview questions...' });

      const response = await aiService.structuredQuery({
        prompt,
        systemPrompt,
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Template name' },
            description: { type: 'string', description: 'Template description' },
            instructions: { type: 'string', description: 'Instructions for interviewer' },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  type: { 
                    type: 'string', 
                    enum: ['technical', 'behavioral', 'cultural', 'situational', 'general'] 
                  },
                  category: { type: 'string' },
                  difficulty: { 
                    type: 'string', 
                    enum: ['easy', 'medium', 'hard'] 
                  },
                  timeLimit: { type: 'number', description: 'Time in minutes' },
                  expectedAnswer: { type: 'string', description: 'Optional guidance on good answers' },
                  scoringCriteria: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'Criteria for scoring this question'
                  }
                },
                required: ['question', 'type', 'category', 'difficulty', 'timeLimit']
              }
            },
            preparationNotes: { type: 'string', description: 'Notes to help interviewer prepare' },
            evaluationCriteria: {
              type: 'array',
              items: { type: 'string' },
              description: 'Overall criteria for evaluating candidate'
            }
          },
          required: ['name', 'description', 'questions', 'instructions', 'preparationNotes', 'evaluationCriteria']
        },
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        max_tokens: 3000,
        temperature: 0.7
      });

      setAiGenerationStep({ step: 'generating', progress: 80, message: 'Finalizing template...' });

      if (response.data) {
        const aiData = response.data;
        setTemplate(prev => ({
          ...prev,
          name: aiData.name || `${jobTitle} - ${template.interviewType}`,
          description: aiData.description || '',
          instructions: aiData.instructions || '',
          questions: (aiData.questions || []).map((q: any) => ({
            question: q.question,
            type: q.type,
            category: q.category,
            difficulty: q.difficulty,
            timeLimit: q.timeLimit,
            expectedAnswer: q.expectedAnswer,
            scoringCriteria: q.scoringCriteria
          })),
          preparationNotes: aiData.preparationNotes || '',
          evaluationCriteria: aiData.evaluationCriteria || []
        }));

        setAiGenerationStep({ step: 'review', progress: 100, message: 'Template generated successfully!' });
        setShowAIGenerator(false);
        
        toast.success('AI Template Generated', 'Review and customize the generated template before saving.');
      } else {
        throw new Error('No data received from AI service');
      }

    } catch (error) {
      console.error('AI generation error:', error);
      setAiGenerationStep({ 
        step: 'error', 
        message: 'Failed to generate template. Please try again or create manually.' 
      });
      toast.error('Generation Failed', 'Failed to generate AI template. Please try again.');
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

      const templateData: CreateInterviewTemplateRequest = {
        name: template.name,
        description: template.description || '',
        interviewType: template.interviewType!,
        duration: template.duration!,
        questions: questionsWithOrder,
        instructions: template.instructions,
        preparationNotes: template.preparationNotes,
        evaluationCriteria: template.evaluationCriteria?.filter(Boolean),
        isPublic: template.isPublic,
        jobId: template.jobId,
        organizationId: template.organizationId
      };

      const newTemplate = await createTemplateMutation.mutateAsync(templateData);
      
      toast.success('Template Created', 'Interview template has been created successfully.');
      onTemplateCreated?.(newTemplate);
      onClose();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Creation Failed', 'Failed to create template. Please try again.');
    }
  };

  const handleClose = () => {
    setTemplate({
      name: '',
      description: '',
      interviewType: 'Phone Screen',
      duration: 30,
      questions: [],
      instructions: '',
      preparationNotes: '',
      evaluationCriteria: [],
      isPublic: false,
      jobId,
      organizationId
    });
    setShowAIGenerator(false);
    setAiGenerationStep({ step: 'input' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create Interview Template</h2>
              <p className="text-sm text-gray-500">Design a structured interview template</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {jobTitle && (
              <button
                onClick={() => setShowAIGenerator(!showAIGenerator)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate with AI</span>
              </button>
            )}
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* AI Generator Panel */}
        {showAIGenerator && (
          <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4">
            <div className="max-w-2xl">
              <h3 className="text-lg font-medium text-gray-900 mb-3">AI Template Generator</h3>
              
              {aiGenerationStep.step === 'input' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                      <select
                        value={aiInput.difficulty}
                        onChange={(e) => setAiInput(prev => ({ ...prev, difficulty: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="entry">Entry Level</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior Level</option>
                        <option value="lead">Lead/Principal</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Focus Areas (optional)</label>
                    <input
                      type="text"
                      value={aiInput.focusAreas}
                      onChange={(e) => setAiInput(prev => ({ ...prev, focusAreas: e.target.value }))}
                      placeholder="e.g., React, Leadership, Problem Solving (comma-separated)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Instructions (optional)</label>
                    <textarea
                      value={aiInput.additionalInstructions}
                      onChange={(e) => setAiInput(prev => ({ ...prev, additionalInstructions: e.target.value }))}
                      placeholder="Any specific requirements or focus areas for the interview..."
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={generateAITemplate}
                      disabled={generateAIMutation.isPending}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Template</span>
                    </button>
                    <button
                      onClick={() => setShowAIGenerator(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {aiGenerationStep.step === 'generating' && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 mb-2">{aiGenerationStep.message}</p>
                  {aiGenerationStep.progress && (
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${aiGenerationStep.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}

              {aiGenerationStep.step === 'error' && (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-4">
                    <p>{aiGenerationStep.message}</p>
                  </div>
                  <button
                    onClick={() => setAiGenerationStep({ step: 'input' })}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Software Engineer Phone Screen"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
                <select
                  value={template.interviewType}
                  onChange={(e) => setTemplate(prev => ({ ...prev, interviewType: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Phone Screen">Phone Screen</option>
                  <option value="Technical">Technical</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Final">Final</option>
                  <option value="Panel">Panel</option>
                  <option value="Culture Fit">Culture Fit</option>
                  <option value="Case Study">Case Study</option>
                  <option value="Presentation">Presentation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={template.duration}
                  onChange={(e) => setTemplate(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  min="15"
                  max="240"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={template.isPublic}
                    onChange={(e) => setTemplate(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Make template public</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={template.description}
                onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this interview template and its purpose..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interviewer Instructions</label>
              <textarea
                value={template.instructions}
                onChange={(e) => setTemplate(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Instructions for the interviewer on how to conduct this interview..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Questions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Interview Questions</h3>
                <button
                  onClick={handleAddQuestion}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>

              {template.questions?.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No questions added yet</p>
                  <button
                    onClick={handleAddQuestion}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {template.questions?.map((question, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                        <div className="flex items-center space-x-1">
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
                          <button
                            onClick={() => handleRemoveQuestion(index)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                          <textarea
                            value={question.question}
                            onChange={(e) => handleUpdateQuestion(index, { question: e.target.value })}
                            placeholder="Enter your interview question..."
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                              value={question.type}
                              onChange={(e) => handleUpdateQuestion(index, { type: e.target.value as any })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="general">General</option>
                              <option value="technical">Technical</option>
                              <option value="behavioral">Behavioral</option>
                              <option value="cultural">Cultural</option>
                              <option value="situational">Situational</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input
                              type="text"
                              value={question.category}
                              onChange={(e) => handleUpdateQuestion(index, { category: e.target.value })}
                              placeholder="e.g., Communication"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                            <select
                              value={question.difficulty}
                              onChange={(e) => handleUpdateQuestion(index, { difficulty: e.target.value as any })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time (min)</label>
                            <input
                              type="number"
                              value={question.timeLimit}
                              onChange={(e) => handleUpdateQuestion(index, { timeLimit: parseInt(e.target.value) || 0 })}
                              min="1"
                              max="60"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {question.expectedAnswer !== undefined && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Answer / Guidance</label>
                            <textarea
                              value={question.expectedAnswer}
                              onChange={(e) => handleUpdateQuestion(index, { expectedAnswer: e.target.value })}
                              placeholder="What constitutes a good answer to this question..."
                              rows={2}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preparation Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preparation Notes</label>
              <textarea
                value={template.preparationNotes}
                onChange={(e) => setTemplate(prev => ({ ...prev, preparationNotes: e.target.value }))}
                placeholder="Notes to help the interviewer prepare for this interview..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Evaluation Criteria */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Evaluation Criteria</label>
                <button
                  onClick={handleAddEvaluationCriterion}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2 text-sm"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Criterion</span>
                </button>
              </div>

              {template.evaluationCriteria?.length === 0 ? (
                <p className="text-gray-500 text-sm">No evaluation criteria added yet.</p>
              ) : (
                <div className="space-y-2">
                  {template.evaluationCriteria?.map((criterion, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={criterion}
                        onChange={(e) => handleUpdateEvaluationCriterion(index, e.target.value)}
                        placeholder="e.g., Technical competency, Communication skills"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleRemoveEvaluationCriterion(index)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {template.questions?.length || 0} questions • {template.duration} minutes
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createTemplateMutation.isPending || !template.name?.trim() || !template.questions?.length}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>
                {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
