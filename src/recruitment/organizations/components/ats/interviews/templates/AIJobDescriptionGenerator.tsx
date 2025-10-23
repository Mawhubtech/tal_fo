import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Loader2, CheckCircle, AlertCircle, FileText, Edit3 } from 'lucide-react';
import { useAIStructuredQuery } from '../../../../../../hooks/useAIStructuredQuery';
import { IntakeMeetingSession } from '../../../../../../types/intakeMeetingTemplate.types';

interface AIJobDescriptionGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: GeneratedJobDescription) => void;
  intakeMeetingSession: IntakeMeetingSession;
}

export interface GeneratedJobDescription {
  jobTitle: string;
  jobDescription: string;
  experienceLevel: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  benefits: string[];
  department?: string;
  salaryRange?: string;
  workType?: string;
  companyInfo?: string;
}

const AIJobDescriptionGenerator: React.FC<AIJobDescriptionGeneratorProps> = ({
  isOpen,
  onClose,
  onGenerate,
  intakeMeetingSession
}) => {
  const [generationStep, setGenerationStep] = useState<'input' | 'generating' | 'success' | 'error'>('input');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const { data, loading, error, structuredQuery, reset } = useAIStructuredQuery();

  // Enhanced modal behavior
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setGenerationStep('input');
      setAdditionalInstructions('');
      setRetryCount(0);
      reset();
    }
  }, [isOpen, reset]);

  // Handle successful AI response
  useEffect(() => {
    if (data && !loading && !error) {
      setGenerationStep('success');
      // Auto-apply the generated data after a brief success display
      setTimeout(() => {
        onGenerate(data.data as GeneratedJobDescription);
        handleClose();
      }, 1500);
    }
  }, [data, loading, error, onGenerate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setGenerationStep('error');
    }
  }, [error]);

  const handleClose = () => {
    setAdditionalInstructions('');
    setGenerationStep('input');
    setRetryCount(0);
    reset();
    onClose();
  };

  const extractIntakeMeetingData = () => {
    const responses = intakeMeetingSession.responses || {};
    const template = intakeMeetingSession.template;
    
    // Build context from intake meeting responses
    const contextData: Record<string, any> = {};
    
    // Extract answers by question categories
    template.questions.forEach(question => {
      const response = responses[question.id || question.question];
      if (response && response !== '') {
        const category = question.category || 'General';
        if (!contextData[category]) {
          contextData[category] = [];
        }
        contextData[category].push({
          question: question.question,
          answer: response,
          type: question.type
        });
      }
    });

    return contextData;
  };

  const generateJobDescription = async () => {
    setGenerationStep('generating');
    setRetryCount(prev => prev + 1);

    const intakeData = extractIntakeMeetingData();
    
    // Build comprehensive prompt from intake meeting data
    let prompt = `Generate a comprehensive job description based on the following intake meeting information collected from ${intakeMeetingSession.clientId}:\n\n`;
    
    // Add intake meeting context
    Object.entries(intakeData).forEach(([category, questions]) => {
      prompt += `**${category}:**\n`;
      (questions as any[]).forEach(({ question, answer }) => {
        prompt += `- ${question}: ${answer}\n`;
      });
      prompt += '\n';
    });

    // Add session metadata
    if (intakeMeetingSession.notes) {
      prompt += `**Additional Notes from Meeting:**\n${intakeMeetingSession.notes}\n\n`;
    }

    if (intakeMeetingSession.followUpActions && intakeMeetingSession.followUpActions.length > 0) {
      prompt += `**Follow-up Actions:**\n${intakeMeetingSession.followUpActions.join('\n')}\n\n`;
    }

    // Add user's additional instructions
    if (additionalInstructions.trim()) {
      prompt += `**Additional Instructions:**\n${additionalInstructions}\n\n`;
    }

    prompt += `Based on this comprehensive intake information, create a professional, compelling job description that accurately reflects the client's needs and attracts the right candidates. Ensure the content is:

1. Professional and engaging
2. Specific to the client's requirements
3. Attractive to qualified candidates
4. Clear about expectations and benefits
5. Aligned with the discussed company culture and values

Please create detailed, comprehensive content for all required fields.`;

    // Define the schema for structured output
    const schema = {
      type: 'object',
      properties: {
        jobTitle: {
          type: 'string',
          description: 'A clear, professional job title that reflects the role discussed in the intake meeting'
        },
        experienceLevel: {
          type: 'string',
          enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead/Principal', 'Executive'],
          description: 'The experience level based on the requirements discussed'
        },
        jobDescription: {
          type: 'string',
          description: 'A comprehensive, engaging job description (3-5 paragraphs) that incorporates company culture, role purpose, and what makes this position attractive'
        },
        responsibilities: {
          type: 'array',
          items: { type: 'string' },
          minItems: 5,
          maxItems: 10,
          description: 'Key responsibilities and daily tasks derived from the intake discussion'
        },
        requirements: {
          type: 'array',
          items: { type: 'string' },
          minItems: 5,
          maxItems: 12,
          description: 'Specific requirements, qualifications, and experience needed as discussed'
        },
        skills: {
          type: 'array',
          items: { type: 'string' },
          minItems: 8,
          maxItems: 15,
          description: 'Technical and soft skills required, based on intake requirements'
        },
        benefits: {
          type: 'array',
          items: { type: 'string' },
          minItems: 6,
          maxItems: 12,
          description: 'Benefits, perks, and compensation details mentioned during the intake'
        },
        department: {
          type: 'string',
          description: 'Department or team this role belongs to, if specified'
        },
        salaryRange: {
          type: 'string',
          description: 'Salary or compensation range if discussed during intake'
        },
        workType: {
          type: 'string',
          description: 'Work arrangement (Remote, On-site, Hybrid) based on intake discussion'
        },
        companyInfo: {
          type: 'string',
          description: 'Brief company description and culture summary from intake information'
        }
      },
      required: ['jobTitle', 'experienceLevel', 'jobDescription', 'responsibilities', 'requirements', 'skills', 'benefits']
    };

    const systemPrompt = `You are an expert HR professional and job description specialist with extensive experience in translating client intake information into compelling job descriptions. Your task is to create professional, detailed job content that accurately reflects the client's specific needs gathered during their intake meeting.

Focus on creating content that is:
1. Directly aligned with the intake meeting findings
2. Professional yet engaging and attractive to candidates
3. Specific and actionable based on client requirements
4. Clear about expectations, company culture, and benefits
5. Competitive and appealing for the target market

Always respond with valid JSON that matches the provided schema exactly. Use the intake meeting data as the primary source of truth for all job details.`;

    try {
      await structuredQuery({
        prompt,
        schema,
        systemPrompt,
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        max_tokens: 3500,
        temperature: 0.7
      });
    } catch (err) {
      console.error('AI generation error:', err);
      setGenerationStep('error');
    }
  };

  const retryGeneration = () => {
    setGenerationStep('input');
    reset();
  };

  if (!isOpen) return null;

  const intakeData = extractIntakeMeetingData();
  const hasIntakeData = Object.keys(intakeData).length > 0;

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed top-0 right-0 bottom-0 left-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Job Description Generator</h2>
              <p className="text-sm text-gray-500">Generate job descriptions from intake meeting data</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {generationStep === 'input' && (
            <div className="space-y-6">
              {/* Intake Meeting Data Preview */}
              {hasIntakeData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Intake Meeting Data Preview
                  </h4>
                  <div className="text-sm text-blue-700 space-y-3 max-h-60 overflow-y-auto">
                    {Object.entries(intakeData).map(([category, questions]) => (
                      <div key={category} className="border-l-2 border-blue-300 pl-3">
                        <h5 className="font-medium text-blue-900">{category}</h5>
                        <div className="space-y-1 mt-1">
                          {(questions as any[]).slice(0, 3).map((q, idx) => (
                            <p key={idx} className="text-xs">
                              <span className="font-medium">{q.question}:</span> {q.answer.length > 100 ? `${q.answer.substring(0, 100)}...` : q.answer}
                            </p>
                          ))}
                          {(questions as any[]).length > 3 && (
                            <p className="text-xs text-blue-600 font-medium">+ {(questions as any[]).length - 3} more responses</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 mt-3">
                    This data will be used to generate a comprehensive job description.
                  </p>
                </div>
              )}

              {!hasIntakeData && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    <h4 className="text-sm font-medium text-yellow-800">Limited Intake Data</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    This intake meeting session has limited response data. The AI will do its best to generate a job description, but you may need to provide additional instructions below.
                  </p>
                </div>
              )}

              {/* Additional Instructions */}
              <div>
                <label htmlFor="additionalInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  id="additionalInstructions"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Add any specific requirements, preferences, or modifications you'd like to include in the job description..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Provide additional context, specific requirements, or preferences not covered in the intake meeting.
                </p>
              </div>

              {/* Session Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Intake Meeting Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Template:</span> {intakeMeetingSession.template.name}</p>
                  <p><span className="font-medium">Status:</span> {intakeMeetingSession.status}</p>
                  {intakeMeetingSession.completedAt && (
                    <p><span className="font-medium">Completed:</span> {new Date(intakeMeetingSession.completedAt).toLocaleDateString()}</p>
                  )}
                  {intakeMeetingSession.notes && (
                    <p><span className="font-medium">Notes:</span> {intakeMeetingSession.notes.substring(0, 100)}{intakeMeetingSession.notes.length > 100 ? '...' : ''}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateJobDescription}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Job Description</span>
                </button>
              </div>
            </div>
          )}

          {generationStep === 'generating' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Job Description</h3>
              <p className="text-gray-500 mb-4">
                AI is analyzing your intake meeting data and creating a comprehensive job description...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-4">Attempt {retryCount} of 3</p>
            </div>
          )}

          {generationStep === 'success' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Job Description Generated!</h3>
              <p className="text-gray-500">
                Your job description has been created based on the intake meeting data.
              </p>
            </div>
          )}

          {generationStep === 'error' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generation Failed</h3>
              <p className="text-gray-500 mb-6">
                {error || 'There was an error generating the job description. Please try again.'}
              </p>
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                {retryCount < 3 && (
                  <button
                    onClick={retryGeneration}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Retry Generation</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render modal content in a portal to bypass any parent z-index issues
  return createPortal(modalContent, document.body);
};

export default AIJobDescriptionGenerator;
