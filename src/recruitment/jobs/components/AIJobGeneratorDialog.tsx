import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAIStructuredQuery } from '../../../hooks/useAIStructuredQuery';

interface AIJobGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: AIGeneratedJobData) => void;
  currentData?: {
    jobTitle?: string;
    location?: string;
    employmentType?: string;
    experienceLevel?: string;
    departmentName?: string;
  };
}

interface AIGeneratedJobData {
  jobTitle: string;
  jobDescription: string;
  experienceLevel: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  benefits: string[];
}

const AIJobGeneratorDialog: React.FC<AIJobGeneratorDialogProps> = ({
  isOpen,
  onClose,
  onGenerate,
  currentData
}) => {
  const [userInput, setUserInput] = useState('');
  const [generationStep, setGenerationStep] = useState<'input' | 'generating' | 'success' | 'error'>('input');
  const { data, loading, error, structuredQuery, reset } = useAIStructuredQuery();

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setGenerationStep('input');
      reset();
    }
  }, [isOpen, reset]);

  // Handle successful AI response
  useEffect(() => {
    if (data && !loading && !error) {
      setGenerationStep('success');
      // Auto-apply the generated data after a brief success display
      setTimeout(() => {
        onGenerate(data.data as AIGeneratedJobData);
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
    setUserInput('');
    setGenerationStep('input');
    reset();
    onClose();
  };

  const generateJobContent = async () => {
    if (!userInput.trim()) return;

    setGenerationStep('generating');

    // Build the prompt with context
    const contextualInfo = [];
    if (currentData?.jobTitle) contextualInfo.push(`Job Title: ${currentData.jobTitle}`);
    if (currentData?.departmentName) contextualInfo.push(`Department: ${currentData.departmentName}`);
    if (currentData?.location) contextualInfo.push(`Location: ${currentData.location}`);
    if (currentData?.employmentType) contextualInfo.push(`Employment Type: ${currentData.employmentType}`);
    if (currentData?.experienceLevel) contextualInfo.push(`Experience Level: ${currentData.experienceLevel}`);

    const contextSection = contextualInfo.length > 0 
      ? `\n\nCurrent Job Details:\n${contextualInfo.join('\n')}`
      : '';

    const prompt = `Generate comprehensive job content based on this description: "${userInput}"${contextSection}

Please create detailed, professional content that includes:
- A clear, compelling job title that accurately reflects the role
- An appropriate experience level (Entry Level, Mid Level, Senior Level, Lead/Principal, Executive)
- A compelling job description that attracts candidates
- Key responsibilities that clearly outline daily tasks
- Specific requirements and qualifications needed
- Technical and soft skills required
- Attractive benefits and perks

Make the content engaging, specific, and tailored to the role.`;

    // Define the schema for structured output
    const schema = {
      type: 'object',
      properties: {
        jobTitle: {
          type: 'string',
          description: 'A clear, professional job title that accurately reflects the role and seniority level. Should be concise and industry-standard.'
        },
        experienceLevel: {
          type: 'string',
          enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead/Principal', 'Executive'],
          description: 'The experience level required for this position based on the responsibilities and requirements.'
        },
        jobDescription: {
          type: 'string',
          description: 'A comprehensive, engaging job description that explains the role, company culture, and what makes this position exciting. Should be 3-5 paragraphs.'
        },
        responsibilities: {
          type: 'array',
          items: { type: 'string' },
          description: 'A list of 5-8 key responsibilities and daily tasks for this role. Each should be specific and actionable.'
        },
        requirements: {
          type: 'array',
          items: { type: 'string' },
          description: 'A list of 5-10 specific requirements, qualifications, and experience needed. Include education, experience, and other must-haves.'
        },
        skills: {
          type: 'array',
          items: { type: 'string' },
          description: 'A list of 8-15 technical and soft skills required for this role. Include programming languages, tools, frameworks, and soft skills.'
        },
        benefits: {
          type: 'array',
          items: { type: 'string' },
          description: 'A list of 6-12 attractive benefits and perks that would appeal to candidates. Include compensation, work-life balance, growth opportunities, etc.'
        }
      },
      required: ['jobTitle', 'experienceLevel', 'jobDescription', 'responsibilities', 'requirements', 'skills', 'benefits']
    };

    const systemPrompt = `You are an expert HR professional and job description writer with extensive experience in recruitment. Your task is to create compelling, detailed job content that attracts top talent while being specific about requirements. Focus on creating content that is:

1. Professional yet engaging
2. Specific and actionable
3. Attractive to qualified candidates
4. Clear about expectations and benefits
5. Industry-appropriate and competitive

Always respond with valid JSON that matches the provided schema exactly.`;

    try {
      await structuredQuery({
        prompt,
        schema,
        systemPrompt,
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        max_tokens: 3000,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Job Content Generator</h2>
              <p className="text-sm text-gray-500">Generate comprehensive job descriptions with AI</p>
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
              <div>
                <label htmlFor="jobInput" className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the job you want to create
                </label>
                <textarea
                  id="jobInput"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none resize-none"
                  placeholder="E.g., 'Senior React Developer for fintech startup, remote-first company, working on trading platform, needs 5+ years experience with React, TypeScript, and API integration. Team of 10 engineers, fast-paced environment, competitive salary with equity.'"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Provide as much detail as possible about the role, company, requirements, and work environment.
                </p>
              </div>

              {currentData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Current Job Information</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    {currentData.jobTitle && <p><span className="font-medium">Title:</span> {currentData.jobTitle}</p>}
                    {currentData.departmentName && <p><span className="font-medium">Department:</span> {currentData.departmentName}</p>}
                    {currentData.location && <p><span className="font-medium">Location:</span> {currentData.location}</p>}
                    {currentData.employmentType && <p><span className="font-medium">Type:</span> {currentData.employmentType}</p>}
                    {currentData.experienceLevel && <p><span className="font-medium">Experience:</span> {currentData.experienceLevel}</p>}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">This information will be used to enhance the generated content.</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateJobContent}
                  disabled={!userInput.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Content</span>
                </button>
              </div>
            </div>
          )}

          {generationStep === 'generating' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Job Content</h3>
              <p className="text-gray-500 mb-4">AI is creating job title, experience level, comprehensive job descriptions, responsibilities, requirements, skills, and benefits...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          )}

          {generationStep === 'success' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Content Generated Successfully!</h3>
              <p className="text-gray-500">Applying the generated content to your job posting...</p>
            </div>
          )}

          {generationStep === 'error' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generation Failed</h3>
              <p className="text-gray-500 mb-6">{error || 'Failed to generate job content. Please try again.'}</p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={retryGeneration}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIJobGeneratorDialog;
