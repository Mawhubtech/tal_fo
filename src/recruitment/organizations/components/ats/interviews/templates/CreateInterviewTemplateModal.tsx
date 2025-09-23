import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Plus, Trash2, Edit2, Copy, Sparkles, Clock, FileText, 
  Users, Save, ArrowUp, ChevronUp, ChevronDown 
} from 'lucide-react';
import { InterviewTemplate, InterviewQuestion, CreateInterviewTemplateRequest, QuestionFormat } from '../../../../../../types/interviewTemplate.types';
import { useCreateInterviewTemplate, useGenerateAIInterviewTemplate, useUpdateInterviewTemplate } from '../../../../../../hooks/useInterviewTemplates';
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
  // Edit mode props
  editTemplate?: InterviewTemplate;
  isEditMode?: boolean;
  onTemplateUpdated?: (template: InterviewTemplate) => void;
  // AI generation mode
  startWithAI?: boolean;
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
  onTemplateCreated,
  editTemplate,
  isEditMode = false,
  onTemplateUpdated,
  startWithAI = false,
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

  const [showAIGenerator, setShowAIGenerator] = useState(startWithAI);
  const [aiGenerationStep, setAiGenerationStep] = useState<AIGenerationStep>({ step: 'input' });
  const [aiRetryCount, setAiRetryCount] = useState(0);
  const maxRetries = 2;
  const [aiInput, setAiInput] = useState({
    difficulty: 'mid' as 'entry' | 'mid' | 'senior' | 'lead',
    questionCount: Math.floor((30) / 5), // Default based on 30 min interview
    focusAreas: '',
    additionalInstructions: '',
    formatStrategy: 'balanced' as 'balanced' | 'rating_focused' | 'description_focused' | 'quick_assessment' | 'custom',
    customFormatDistribution: {
      yes_no_with_justification: 15,
      rating_with_justification: 35,
      short_description: 30,
      long_description: 20
    }
  });

  const createTemplateMutation = useCreateInterviewTemplate();
  const updateTemplateMutation = useUpdateInterviewTemplate();
  const generateAIMutation = useGenerateAIInterviewTemplate();

  // Initialize template state with edit data when in edit mode
  useEffect(() => {
    if (isEditMode && editTemplate) {
      setTemplate({
        name: editTemplate.name,
        description: editTemplate.description,
        interviewType: editTemplate.interviewType,
        duration: editTemplate.duration,
        questions: editTemplate.questions,
        instructions: editTemplate.instructions,
        preparationNotes: editTemplate.preparationNotes,
        evaluationCriteria: editTemplate.evaluationCriteria,
        isPublic: editTemplate.isPublic,
        jobId: editTemplate.jobId || jobId,
        organizationId: editTemplate.organizationId || organizationId
      });
    } else {
      // Reset to default state when not in edit mode or when modal closes
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
    }
  }, [isEditMode, editTemplate, jobId, organizationId, isOpen]);

  // Handle body scroll and ESC key
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add ESC key handler
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleClose();
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        // Restore body scroll when modal closes
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleAddQuestion = () => {
    const newQuestion: Omit<InterviewQuestion, 'id' | 'order'> = {
      question: '',
      type: 'general',
      format: QuestionFormat.SHORT_DESCRIPTION, // Default to short description
      category: 'General',
      section: '',
      difficulty: 'medium',
      timeLimit: 5,
      requiresJustification: false,
      maxCharacters: 500
    };

    setTemplate(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion]
    }));
  };

  const handleUpdateQuestion = (index: number, updates: Partial<InterviewQuestion>) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) => {
        if (i === index) {
          const updatedQuestion = { ...q, ...updates };
          
          // Auto-set requiresJustification based on format when format is being updated
          if (updates.format) {
            const autoRequiresJustification = 
              updates.format === QuestionFormat.YES_NO_WITH_JUSTIFICATION ||
              updates.format === QuestionFormat.RATING_WITH_JUSTIFICATION;
            
            updatedQuestion.requiresJustification = autoRequiresJustification;
            
            // Also set appropriate defaults for rating scale if it's a rating question
            if (updates.format === QuestionFormat.RATING_WITH_JUSTIFICATION && !updatedQuestion.ratingScale) {
              updatedQuestion.ratingScale = {
                min: 1,
                max: 5,
                labels: {
                  1: 'Poor',
                  2: 'Fair',
                  3: 'Good',
                  4: 'Very Good',
                  5: 'Excellent'
                }
              };
            }
            
            // Set appropriate character limits for different question formats
            if (updates.format === QuestionFormat.SHORT_DESCRIPTION && !updatedQuestion.maxCharacters) {
              updatedQuestion.maxCharacters = 500;
            } else if (updates.format === QuestionFormat.LONG_DESCRIPTION && !updatedQuestion.maxCharacters) {
              updatedQuestion.maxCharacters = 1500;
            } else if (autoRequiresJustification && !updatedQuestion.maxCharacters) {
              // For questions that require justification, set a reasonable default
              updatedQuestion.maxCharacters = 300;
            }
          }
          
          return updatedQuestion;
        }
        return q;
      }) || []
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

  const retryAIGeneration = () => {
    if (aiRetryCount < maxRetries) {
      setAiRetryCount(prev => prev + 1);
      setAiGenerationStep({ step: 'input' });
      generateAITemplate();
    }
  };

  const generateAITemplate = async () => {
    setAiGenerationStep({ step: 'generating', progress: 0, message: 'Analyzing job requirements...' });
    
    // Reset retry count if this is a fresh start (not a retry)
    if (aiGenerationStep.step === 'input') {
      setAiRetryCount(0);
    }

    try {
      // Prepare the AI prompt
      const focusAreas = (aiInput.focusAreas || '').split(',').map(area => area.trim()).filter(Boolean);
      
      // Calculate time distribution based on duration and requested questions
      const totalDuration = template.duration || 30;
      const requestedQuestions = aiInput.questionCount || Math.floor(totalDuration / 5);
      const timePerQuestion = Math.floor((totalDuration - 5) / requestedQuestions); // Reserve 5 mins for intro/outro
      const minTimePerQuestion = Math.max(timePerQuestion, 2); // Minimum 2 minutes per question
      
      // Parse additional instructions for specific requirements
      const hasQuestionsPerFocusArea = aiInput.additionalInstructions?.toLowerCase().includes('questions per focus area');
      const questionsPerFocusAreaMatch = aiInput.additionalInstructions?.match(/(\d+)\s+questions?\s+per\s+focus\s+area/i);
      const questionsPerFocusArea = questionsPerFocusAreaMatch ? parseInt(questionsPerFocusAreaMatch[1]) : null;
      
      let calculatedQuestionCount = requestedQuestions;
      if (hasQuestionsPerFocusArea && questionsPerFocusArea && focusAreas.length > 0) {
        calculatedQuestionCount = focusAreas.length * questionsPerFocusArea;
      }

      const systemPrompt = `You are an expert HR professional and interview designer. Create a comprehensive screening interview template that helps evaluate candidates effectively. Focus on practical, insightful questions that reveal candidate fit and capabilities. 

CRITICAL REQUIREMENTS:
1. MUST generate EXACTLY ${calculatedQuestionCount} questions - this is mandatory
2. Time allocation: Each question should take approximately ${minTimePerQuestion} minutes
3. Total interview time must not exceed ${totalDuration} minutes
4. Questions MUST be directly relevant to the specified focus areas
5. Follow all additional instructions precisely`;

      const prompt = `Create a ${template.interviewType} interview template for the following position:

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Job Requirements: ${Array.isArray(jobRequirements) ? jobRequirements.join(', ') : (jobRequirements || 'Not specified')}
Experience Level: ${aiInput.difficulty}
Interview Duration: ${totalDuration} minutes
Target Number of Questions: ${calculatedQuestionCount}
Time per Question: Approximately ${minTimePerQuestion} minutes each
${focusAreas.length > 0 ? `Focus Areas (MUST address ALL): ${focusAreas.join(', ')}` : ''}
${aiInput.additionalInstructions ? `IMPORTANT Additional Instructions: ${aiInput.additionalInstructions}` : ''}

REQUIREMENTS:
1. Generate EXACTLY ${calculatedQuestionCount} questions (no more, no less)
2. Each question must take approximately ${minTimePerQuestion} minutes to answer
3. ${focusAreas.length > 0 ? `Distribute questions across ALL focus areas: ${focusAreas.join(', ')}` : 'Cover key competencies for the role'}
4. ${hasQuestionsPerFocusArea && questionsPerFocusArea ? `Generate ${questionsPerFocusArea} questions for EACH focus area` : ''}
5. Ensure total time allocation does not exceed ${totalDuration} minutes
6. Questions must be relevant to the ${template.interviewType} interview type
7. Mix question types appropriately: technical, behavioral, situational, cultural

8. **QUESTION FORMAT STRATEGY**: ${aiInput.formatStrategy === 'custom' ? 
  `Use this CUSTOM format distribution:
   - yes_no_with_justification: ${aiInput.customFormatDistribution.yes_no_with_justification}%
   - rating_with_justification: ${aiInput.customFormatDistribution.rating_with_justification}%
   - short_description: ${aiInput.customFormatDistribution.short_description}%
   - long_description: ${aiInput.customFormatDistribution.long_description}%` :
  aiInput.formatStrategy === 'rating_focused' ? 
  `Use RATING-FOCUSED distribution for skill assessments:
   - rating_with_justification: 60% (comprehensive skill evaluations)
   - short_description: 25% (quick explanations and examples)
   - yes_no_with_justification: 10% (experience confirmations)
   - long_description: 5% (detailed scenarios when needed)` :
  aiInput.formatStrategy === 'description_focused' ?
  `Use DESCRIPTION-FOCUSED distribution for comprehensive evaluation:
   - long_description: 50% (detailed scenarios and experiences)
   - short_description: 30% (concise explanations and summaries)
   - rating_with_justification: 15% (key skill assessments)
   - yes_no_with_justification: 5% (clear confirmations)` :
  aiInput.formatStrategy === 'quick_assessment' ?
  `Use QUICK ASSESSMENT distribution for efficient evaluation:
   - short_description: 45% (concise answers and examples)
   - yes_no_with_justification: 30% (rapid capability checks)
   - rating_with_justification: 20% (key skill ratings)
   - long_description: 5% (critical detailed responses only)` :
  `Use BALANCED format distribution for optimal evaluation:
   ${template.interviewType === 'Technical' ? `
   - rating_with_justification: 40% (technical skill assessments with 1-5 scales)
   - long_description: 30% (complex problem-solving explanations)  
   - short_description: 20% (quick technical concept explanations)
   - yes_no_with_justification: 10% (binary technical knowledge checks)` : 
   template.interviewType === 'Behavioral' ? `
   - long_description: 50% (detailed behavioral scenarios and experiences)
   - rating_with_justification: 30% (soft skill self-assessments with 1-5 scales)
   - short_description: 15% (quick value and preference explanations)
   - yes_no_with_justification: 5% (clear preference confirmations)` :
   template.interviewType === 'Culture Fit' ? `
   - short_description: 40% (values, preferences, and cultural alignment)
   - rating_with_justification: 35% (cultural value assessments with 1-5 scales)
   - yes_no_with_justification: 20% (clear cultural fit indicators)
   - long_description: 5% (deep cultural scenario responses)` :
   `
   - rating_with_justification: 35% (skill and experience assessments)
   - short_description: 30% (concise explanations and examples)
   - long_description: 25% (detailed scenarios and experiences)
   - yes_no_with_justification: 10% (clear capability confirmations)`}}`}

   **Format Application Guidelines:**

9. **SECTION ORGANIZATION**: Group questions into 3-4 logical sections based on:
   ${template.interviewType === 'Technical' ? '["Core Technical Skills", "Problem Solving & Architecture", "Tools & Technologies", "Team & Communication"]' :
   template.interviewType === 'Behavioral' ? '["Leadership & Initiative", "Problem Solving & Decision Making", "Team Collaboration", "Adaptability & Growth"]' :
   template.interviewType === 'Culture Fit' ? '["Values & Motivation", "Work Style & Preferences", "Team Dynamics", "Growth & Development"]' :
   '["Experience & Background", "Skills & Competencies", "Problem Solving", "Team & Communication"]'}

10. **FORMAT-SPECIFIC REQUIREMENTS**:
    - **rating_with_justification**: Use 1-5 scales with meaningful labels (e.g., 1: Beginner, 3: Competent, 5: Expert). ALWAYS set requiresJustification=true.
    - **yes_no_with_justification**: Binary questions requiring explanation of reasoning. ALWAYS set requiresJustification=true.
    - **short_description**: 300-600 characters for concise but complete answers. Set requiresJustification=false.
    - **long_description**: 1200-2000 characters for comprehensive explanations. Set requiresJustification=false.
    - **CRITICAL**: Questions with "_with_justification" formats MUST have requiresJustification=true
    - **All formats**: Include detailed scoring criteria specific to the format

11. Each question must have clear, format-appropriate scoring criteria

Template Structure Required:
- Descriptive name reflecting the role and interview type
- Comprehensive overview explaining the interview approach
- Clear interviewer instructions with timing and format guidance
- EXACTLY ${calculatedQuestionCount} strategically formatted questions across ${template.interviewType === 'Technical' ? '3-4' : '3-4'} sections
- Each question with: type, format, category, section, time limit, difficulty, expected answer guidance, scoring criteria
- Format-specific configurations (rating scales, character limits, justification requirements)
- Detailed preparation notes for effective interview conduct
- Overall evaluation criteria aligned with question formats
- Time management strategy to optimize the ${totalDuration}-minute interview

Create a professional, comprehensive template that leverages the mixed question formats to provide deep candidate insights while maintaining interview flow and efficiency.`;

      setAiGenerationStep({ step: 'generating', progress: 30, message: 'Generating interview questions...' });

      const response = await aiService.structuredQuery({
        prompt,
        systemPrompt,
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Template name' },
            description: { type: 'string', description: 'Template description' },
            instructions: { 
              type: 'string', 
              description: 'Instructions for interviewer including time management guidance' 
            },
            questions: {
              type: 'array',
              minItems: calculatedQuestionCount,
              maxItems: calculatedQuestionCount,
              description: `MUST contain exactly ${calculatedQuestionCount} questions`,
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string', description: 'The interview question' },
                  type: { 
                    type: 'string', 
                    enum: ['technical', 'behavioral', 'cultural', 'situational', 'general'],
                    description: 'Type of question'
                  },
                  format: {
                    type: 'string',
                    enum: ['yes_no_with_justification', 'rating_with_justification', 'short_description', 'long_description'],
                    description: 'Question format - mix different formats for variety'
                  },
                  category: { 
                    type: 'string', 
                    description: 'Category/focus area this question addresses'
                  },
                  section: {
                    type: 'string',
                    description: 'Optional section grouping for the question'
                  },
                  difficulty: { 
                    type: 'string', 
                    enum: ['easy', 'medium', 'hard'],
                    description: 'Question difficulty level'
                  },
                  timeLimit: { 
                    type: 'number', 
                    minimum: 2,
                    maximum: Math.max(minTimePerQuestion + 2, 8),
                    description: `Time allocated for this question in minutes (recommended: ${minTimePerQuestion})` 
                  },
                  expectedAnswer: { 
                    type: 'string', 
                    description: 'Guidance on what constitutes a good answer' 
                  },
                  scoringCriteria: { 
                    type: 'array', 
                    items: { type: 'string' },
                    minItems: 3,
                    maxItems: 5,
                    description: '3-5 specific criteria for evaluating this question'
                  },
                  ratingScale: {
                    type: 'object',
                    description: 'For rating questions only - define min/max and optional labels',
                    properties: {
                      min: { type: 'number', minimum: 1, maximum: 1 },
                      max: { type: 'number', minimum: 3, maximum: 10 },
                      labels: {
                        type: 'object',
                        description: 'Optional labels for specific rating values'
                      }
                    }
                  },
                  requiresJustification: {
                    type: 'boolean',
                    description: 'REQUIRED: true for yes_no_with_justification and rating_with_justification formats, false for description formats'
                  },
                  maxCharacters: {
                    type: 'number',
                    minimum: 50,
                    maximum: 5000,
                    description: 'For description questions - character limit'
                  }
                },
                required: ['question', 'type', 'format', 'category', 'difficulty', 'timeLimit', 'expectedAnswer', 'scoringCriteria']
              }
            },
            preparationNotes: { 
              type: 'string', 
              description: 'Detailed preparation notes for the interviewer including time management tips' 
            },
            evaluationCriteria: {
              type: 'array',
              items: { type: 'string' },
              minItems: 4,
              maxItems: 8,
              description: 'Overall criteria for evaluating the candidate'
            }
          },
          required: ['name', 'description', 'questions', 'instructions', 'preparationNotes', 'evaluationCriteria']
        },
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        max_tokens: 4000, // Increased token limit for more questions
        temperature: 0.6 // Slightly reduced for more consistent output
      });

      setAiGenerationStep({ step: 'generating', progress: 80, message: 'Finalizing template...' });

      if (response.data) {
        const aiData = response.data;
        
        // Validate that we got the right number of questions
        const receivedQuestions = aiData.questions || [];
        if (receivedQuestions.length !== calculatedQuestionCount) {
          console.warn(`AI generated ${receivedQuestions.length} questions but ${calculatedQuestionCount} were requested`);
          
          // Pad with placeholder questions if too few, or trim if too many
          while (receivedQuestions.length < calculatedQuestionCount) {
            receivedQuestions.push({
              question: `Additional question ${receivedQuestions.length + 1} - Please edit this question`,
              type: 'general',
              format: 'short_description',
              category: 'General',
              difficulty: 'medium',
              timeLimit: minTimePerQuestion,
              expectedAnswer: 'Please provide expected answer guidance',
              scoringCriteria: ['Clear response', 'Relevant content', 'Professional communication'],
              maxCharacters: 500
            });
          }
          
          if (receivedQuestions.length > calculatedQuestionCount) {
            receivedQuestions.splice(calculatedQuestionCount);
          }
        }
        
        // Validate time allocation
        const totalQuestionTime = receivedQuestions.reduce((sum: number, q: any) => sum + (q.timeLimit || 0), 0);
        if (totalQuestionTime > totalDuration - 5) { // Reserve 5 mins for intro/outro
          console.warn(`Total question time (${totalQuestionTime}min) exceeds available time (${totalDuration - 5}min)`);
          // Adjust time limits proportionally
          const adjustment = (totalDuration - 5) / totalQuestionTime;
          receivedQuestions.forEach((q: any) => {
            q.timeLimit = Math.max(2, Math.floor(q.timeLimit * adjustment));
          });
        }
        
        setTemplate(prev => ({
          ...prev,
          name: aiData.name || `${jobTitle} - ${template.interviewType}`,
          description: aiData.description || '',
          instructions: aiData.instructions || '',
          questions: receivedQuestions.map((q: any, index: number) => {
            const questionFormat = q.format || QuestionFormat.SHORT_DESCRIPTION;
            
            // Automatically set requiresJustification based on format
            const autoRequiresJustification = 
              questionFormat === QuestionFormat.YES_NO_WITH_JUSTIFICATION ||
              questionFormat === QuestionFormat.RATING_WITH_JUSTIFICATION;
            
            return {
              question: q.question,
              type: q.type,
              format: questionFormat,
              category: q.category,
              section: q.section,
              difficulty: q.difficulty,
              timeLimit: q.timeLimit,
              expectedAnswer: q.expectedAnswer || '',
              scoringCriteria: q.scoringCriteria || [],
              ratingScale: q.ratingScale,
              requiresJustification: autoRequiresJustification || q.requiresJustification || false,
              maxCharacters: (() => {
                // For questions that require justification, ensure maxCharacters is at least 100
                if (autoRequiresJustification) {
                  return Math.max(q.maxCharacters || 300, 100);
                }
                // For description formats, use the provided value or defaults
                if (questionFormat === QuestionFormat.SHORT_DESCRIPTION) {
                  return q.maxCharacters || 500;
                }
                if (questionFormat === QuestionFormat.LONG_DESCRIPTION) {
                  return q.maxCharacters || 1500;
                }
                // For other formats, don't set maxCharacters
                return undefined;
              })(),
              order: index + 1
            };
          }),
          preparationNotes: aiData.preparationNotes || '',
          evaluationCriteria: aiData.evaluationCriteria || []
        }));

        setAiGenerationStep({ step: 'review', progress: 100, message: 'Template generated successfully!' });
        setShowAIGenerator(false);
        
        toast.success('AI Template Generated', 
          `Generated ${receivedQuestions.length} questions for ${totalDuration}-minute interview. Review and customize as needed.`);
      } else {
        throw new Error('No data received from AI service');
      }

    } catch (error) {
      console.error('AI generation error:', error);
      setAiGenerationStep({ 
        step: 'error', 
        message: 'Failed to generate template. Please check your requirements and try again.' 
      });
      
      // Provide specific error messages based on common issues
      let errorMessage = 'Failed to generate template. ';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage += 'The AI service timed out. Try reducing the number of questions or complexity.';
        } else if (error.message.includes('rate limit')) {
          errorMessage += 'Too many requests. Please wait a moment and try again.';
        } else if (error.message.includes('validation')) {
          errorMessage += 'Please check your focus areas and additional instructions.';
        } else {
          errorMessage += 'Please try again with simpler requirements.';
        }
      }
      
      toast.error('AI Generation Error', errorMessage);
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
      const questionsWithOrder = template.questions.map((q, index) => {
        const { id, ...questionWithoutId } = q as any;
        
        // Ensure questions with justification have valid maxCharacters
        const requiresJustification = q.format === QuestionFormat.YES_NO_WITH_JUSTIFICATION || 
                                    q.format === QuestionFormat.RATING_WITH_JUSTIFICATION;
        
        let maxCharacters = q.maxCharacters;
        
        // Validate and fix maxCharacters for different question formats
        if (requiresJustification && (!maxCharacters || maxCharacters < 1)) {
          maxCharacters = 300; // Default for justification questions
        } else if (q.format === QuestionFormat.SHORT_DESCRIPTION && (!maxCharacters || maxCharacters < 1)) {
          maxCharacters = 500;
        } else if (q.format === QuestionFormat.LONG_DESCRIPTION && (!maxCharacters || maxCharacters < 1)) {
          maxCharacters = 1500;
        }
        
        return {
          ...questionWithoutId,
          maxCharacters,
          order: index + 1
        };
      });

      if (isEditMode && editTemplate) {
        // Update existing template
        const updateData = {
          id: editTemplate.id,
          name: template.name,
          description: template.description || '',
          interviewType: template.interviewType!,
          duration: template.duration!,
          questions: questionsWithOrder,
          instructions: template.instructions,
          preparationNotes: template.preparationNotes,
          evaluationCriteria: template.evaluationCriteria?.filter(Boolean),
          isPublic: template.isPublic,
        };

        const updatedTemplate = await updateTemplateMutation.mutateAsync(updateData);
        
        toast.success('Template Updated', 'Interview template has been updated successfully.');
        onTemplateUpdated?.(updatedTemplate);
      } else {
        // Create new template
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
      }
      
      onClose();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} template:`, error);
      toast.error(`${isEditMode ? 'Update' : 'Creation'} Failed`, `Failed to ${isEditMode ? 'update' : 'create'} template. Please try again.`);
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

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

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
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Interview Template' : 'Create Interview Template'}
              </h2>
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
          <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 max-h-80 overflow-y-auto">
            <div className="p-4">
              <div className="max-w-2xl">
                <h3 className="text-lg font-medium text-gray-900 mb-3">AI Template Generator</h3>
              
              {aiGenerationStep.step === 'input' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interview Duration</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="15"
                          max="180"
                          step="15"
                          value={template.duration || 30}
                          onChange={(e) => {
                            const duration = parseInt(e.target.value) || 30;
                            setTemplate(prev => ({ ...prev, duration }));
                            // Auto-adjust question count based on duration
                            const suggestedQuestions = Math.floor(duration / 5);
                            setAiInput(prev => ({ ...prev, questionCount: suggestedQuestions }));
                          }}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                        />
                        <span className="text-sm text-gray-500">min</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                      <select
                        value={aiInput.difficulty}
                        onChange={(e) => setAiInput(prev => ({ ...prev, difficulty: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      >
                        <option value="entry">Entry Level</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior Level</option>
                        <option value="lead">Lead/Principal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                      <input
                        type="number"
                        min="3"
                        max="20"
                        value={aiInput.questionCount}
                        onChange={(e) => setAiInput(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 5 }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ~{Math.floor((template.duration || 30) / (aiInput.questionCount || 5))} min per question
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Focus Areas (optional)</label>
                    <input
                      type="text"
                      value={aiInput.focusAreas}
                      onChange={(e) => setAiInput(prev => ({ ...prev, focusAreas: e.target.value }))}
                      placeholder="e.g., React, Leadership, Problem Solving (comma-separated)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Instructions (optional)</label>
                    <textarea
                      value={aiInput.additionalInstructions}
                      onChange={(e) => setAiInput(prev => ({ ...prev, additionalInstructions: e.target.value }))}
                      placeholder="Any specific requirements or focus areas for the interview..."
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    />
                  </div>

                  {/* Format Strategy Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Format Strategy</label>
                    <select
                      value={aiInput.formatStrategy}
                      onChange={(e) => setAiInput(prev => ({ 
                        ...prev, 
                        formatStrategy: e.target.value as any 
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    >
                      <option value="balanced">Balanced Mix (Recommended)</option>
                      <option value="rating_focused">Rating Focused - Skill Assessments</option>
                      <option value="description_focused">Description Focused - Comprehensive</option>
                      <option value="quick_assessment">Quick Assessment - Efficient</option>
                      <option value="custom">Custom Distribution</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {aiInput.formatStrategy === 'balanced' && 'Optimal mix of all question formats for comprehensive evaluation (35% rating, 30% short, 25% long, 10% yes/no)'}
                      {aiInput.formatStrategy === 'rating_focused' && 'Emphasizes rating questions for quantitative skill assessment (60% rating, 25% short, 10% yes/no, 5% long)'}
                      {aiInput.formatStrategy === 'description_focused' && 'Focuses on detailed explanations and scenarios (50% long, 30% short, 15% rating, 5% yes/no)'}
                      {aiInput.formatStrategy === 'quick_assessment' && 'Optimized for shorter, efficient evaluations (45% short, 30% yes/no, 20% rating, 5% long)'}
                      {aiInput.formatStrategy === 'custom' && 'Define your own format distribution percentages using the sliders below'}
                    </p>
                  </div>

                  {/* Custom Format Distribution */}
                  {aiInput.formatStrategy === 'custom' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-3">Custom Format Distribution</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">Yes/No + Justification</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={aiInput.customFormatDistribution.yes_no_with_justification}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                const total = Object.values(aiInput.customFormatDistribution).reduce((sum, v) => sum + v, 0) - aiInput.customFormatDistribution.yes_no_with_justification + value;
                                if (total <= 100) {
                                  setAiInput(prev => ({
                                    ...prev,
                                    customFormatDistribution: {
                                      ...prev.customFormatDistribution,
                                      yes_no_with_justification: value
                                    }
                                  }));
                                }
                              }}
                              className="flex-1"
                            />
                            <span className="text-xs font-medium text-blue-800 w-8">{aiInput.customFormatDistribution.yes_no_with_justification}%</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">Rating + Justification</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={aiInput.customFormatDistribution.rating_with_justification}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                const total = Object.values(aiInput.customFormatDistribution).reduce((sum, v) => sum + v, 0) - aiInput.customFormatDistribution.rating_with_justification + value;
                                if (total <= 100) {
                                  setAiInput(prev => ({
                                    ...prev,
                                    customFormatDistribution: {
                                      ...prev.customFormatDistribution,
                                      rating_with_justification: value
                                    }
                                  }));
                                }
                              }}
                              className="flex-1"
                            />
                            <span className="text-xs font-medium text-blue-800 w-8">{aiInput.customFormatDistribution.rating_with_justification}%</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">Short Description</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={aiInput.customFormatDistribution.short_description}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                const total = Object.values(aiInput.customFormatDistribution).reduce((sum, v) => sum + v, 0) - aiInput.customFormatDistribution.short_description + value;
                                if (total <= 100) {
                                  setAiInput(prev => ({
                                    ...prev,
                                    customFormatDistribution: {
                                      ...prev.customFormatDistribution,
                                      short_description: value
                                    }
                                  }));
                                }
                              }}
                              className="flex-1"
                            />
                            <span className="text-xs font-medium text-blue-800 w-8">{aiInput.customFormatDistribution.short_description}%</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">Long Description</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={aiInput.customFormatDistribution.long_description}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                const total = Object.values(aiInput.customFormatDistribution).reduce((sum, v) => sum + v, 0) - aiInput.customFormatDistribution.long_description + value;
                                if (total <= 100) {
                                  setAiInput(prev => ({
                                    ...prev,
                                    customFormatDistribution: {
                                      ...prev.customFormatDistribution,
                                      long_description: value
                                    }
                                  }));
                                }
                              }}
                              className="flex-1"
                            />
                            <span className="text-xs font-medium text-blue-800 w-8">{aiInput.customFormatDistribution.long_description}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-white rounded border">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-blue-700">Total:</span>
                          <span className={`font-medium ${
                            Object.values(aiInput.customFormatDistribution).reduce((sum, v) => sum + v, 0) === 100 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {Object.values(aiInput.customFormatDistribution).reduce((sum, v) => sum + v, 0)}%
                          </span>
                        </div>
                        {Object.values(aiInput.customFormatDistribution).reduce((sum, v) => sum + v, 0) !== 100 && (
                          <p className="text-xs text-red-600 mt-1">Total must equal 100%</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Generation Preview */}
                  {aiInput.questionCount && template.duration && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-purple-800 mb-2">Generation Preview</h4>
                      <div className="text-sm text-purple-700 space-y-1">
                        <div className="flex justify-between">
                          <span>Interview Duration:</span>
                          <span className="font-medium">{template.duration} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Questions to Generate:</span>
                          <span className="font-medium">{aiInput.questionCount} questions</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time per Question:</span>
                          <span className="font-medium">~{Math.floor((template.duration - 5) / aiInput.questionCount)} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Experience Level:</span>
                          <span className="font-medium capitalize">{aiInput.difficulty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Format Strategy:</span>
                          <span className="font-medium">
                            {aiInput.formatStrategy === 'balanced' && 'Balanced Mix'}
                            {aiInput.formatStrategy === 'rating_focused' && 'Rating Focused'}
                            {aiInput.formatStrategy === 'description_focused' && 'Description Focused'}
                            {aiInput.formatStrategy === 'quick_assessment' && 'Quick Assessment'}
                            {aiInput.formatStrategy === 'custom' && 'Custom Distribution'}
                          </span>
                        </div>
                        {aiInput.focusAreas && (
                          <div className="flex justify-between">
                            <span>Focus Areas:</span>
                            <span className="font-medium">{aiInput.focusAreas.split(',').length} areas</span>
                          </div>
                        )}
                        
                        {/* Format Distribution Preview */}
                        {aiInput.formatStrategy === 'custom' && Object.values(aiInput.customFormatDistribution).reduce((sum, v) => sum + v, 0) === 100 && (
                          <div className="mt-3 pt-2 border-t border-purple-200">
                            <div className="text-xs text-purple-600 mb-2">Expected Format Distribution:</div>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              {aiInput.customFormatDistribution.yes_no_with_justification > 0 && (
                                <div>Yes/No: {aiInput.customFormatDistribution.yes_no_with_justification}%</div>
                              )}
                              {aiInput.customFormatDistribution.rating_with_justification > 0 && (
                                <div>Rating: {aiInput.customFormatDistribution.rating_with_justification}%</div>
                              )}
                              {aiInput.customFormatDistribution.short_description > 0 && (
                                <div>Short: {aiInput.customFormatDistribution.short_description}%</div>
                              )}
                              {aiInput.customFormatDistribution.long_description > 0 && (
                                <div>Long: {aiInput.customFormatDistribution.long_description}%</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="text-xs text-purple-600 mt-2 pt-2 border-t border-purple-200">
                          ⏱️ 5 minutes reserved for introduction and wrap-up
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={generateAITemplate}
                      disabled={
                        generateAIMutation.isPending || 
                        (aiInput.formatStrategy === 'custom' && 
                         Object.values(aiInput.customFormatDistribution).reduce((sum, v) => sum + v, 0) !== 100)
                      }
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
                    {aiRetryCount > 0 && (
                      <p className="text-sm mt-2">Attempt {aiRetryCount + 1} of {maxRetries + 1}</p>
                    )}
                  </div>
                  <div className="space-x-3">
                    <button
                      onClick={() => setAiGenerationStep({ step: 'input' })}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Modify Requirements
                    </button>
                    {aiRetryCount < maxRetries && (
                      <button
                        onClick={retryAIGeneration}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Retry Generation
                      </button>
                    )}
                  </div>
                </div>
              )}
              </div>
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
                <select
                  value={template.interviewType}
                  onChange={(e) => setTemplate(prev => ({ ...prev, interviewType: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                              value={question.type}
                              onChange={(e) => handleUpdateQuestion(index, { type: e.target.value as any })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                            >
                              <option value="general">General</option>
                              <option value="technical">Technical</option>
                              <option value="behavioral">Behavioral</option>
                              <option value="cultural">Cultural</option>
                              <option value="situational">Situational</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                            <select
                              value={question.format}
                              onChange={(e) => handleUpdateQuestion(index, { format: e.target.value as QuestionFormat })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                            >
                              <option value={QuestionFormat.YES_NO_WITH_JUSTIFICATION}>Yes/No + Justification</option>
                              <option value={QuestionFormat.RATING_WITH_JUSTIFICATION}>Rating + Justification</option>
                              <option value={QuestionFormat.SHORT_DESCRIPTION}>Short Description</option>
                              <option value={QuestionFormat.LONG_DESCRIPTION}>Long Description</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input
                              type="text"
                              value={question.category}
                              onChange={(e) => handleUpdateQuestion(index, { category: e.target.value })}
                              placeholder="e.g., Communication"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                            <select
                              value={question.difficulty}
                              onChange={(e) => handleUpdateQuestion(index, { difficulty: e.target.value as any })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Section Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Section (Optional)</label>
                          <input
                            type="text"
                            value={question.section || ''}
                            onChange={(e) => handleUpdateQuestion(index, { section: e.target.value })}
                            placeholder="e.g., Technical Skills, Leadership Experience"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                          />
                        </div>

                        {/* Format-specific fields */}
                        {question.format === QuestionFormat.RATING_WITH_JUSTIFICATION && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-3">Rating Scale Configuration</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-blue-700 mb-1">Min Rating</label>
                                <input
                                  type="number"
                                  value={question.ratingScale?.min || 1}
                                  onChange={(e) => handleUpdateQuestion(index, {
                                    ratingScale: {
                                      ...question.ratingScale,
                                      min: parseInt(e.target.value) || 1,
                                      max: question.ratingScale?.max || 5,
                                      labels: question.ratingScale?.labels
                                    }
                                  })}
                                  min="1"
                                  max="10"
                                  className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-blue-700 mb-1">Max Rating</label>
                                <input
                                  type="number"
                                  value={question.ratingScale?.max || 5}
                                  onChange={(e) => handleUpdateQuestion(index, {
                                    ratingScale: {
                                      ...question.ratingScale,
                                      min: question.ratingScale?.min || 1,
                                      max: parseInt(e.target.value) || 5,
                                      labels: question.ratingScale?.labels
                                    }
                                  })}
                                  min="2"
                                  max="10"
                                  className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-blue-700 mb-1">
                                Scale Labels (Optional) - e.g., "1: Poor, 3: Average, 5: Excellent"
                              </label>
                              <input
                                type="text"
                                placeholder="1: Poor, 3: Average, 5: Excellent"
                                onChange={(e) => {
                                  // Parse labels from string format "1: Poor, 3: Average, 5: Excellent"
                                  const labelsString = e.target.value;
                                  const labels: { [key: number]: string } = {};
                                  if (labelsString) {
                                    labelsString.split(',').forEach(pair => {
                                      const [key, value] = pair.split(':').map(s => s.trim());
                                      if (key && value && !isNaN(parseInt(key))) {
                                        labels[parseInt(key)] = value;
                                      }
                                    });
                                  }
                                  handleUpdateQuestion(index, {
                                    ratingScale: {
                                      ...question.ratingScale,
                                      min: question.ratingScale?.min || 1,
                                      max: question.ratingScale?.max || 5,
                                      labels: Object.keys(labels).length > 0 ? labels : undefined
                                    }
                                  });
                                }}
                                className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        )}

                        {(question.format === QuestionFormat.SHORT_DESCRIPTION || question.format === QuestionFormat.LONG_DESCRIPTION) && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-green-900 mb-3">Character Limit</h4>
                            <div>
                              <label className="block text-sm font-medium text-green-700 mb-1">Maximum Characters</label>
                              <input
                                type="number"
                                value={question.maxCharacters || (question.format === QuestionFormat.SHORT_DESCRIPTION ? 500 : 2000)}
                                onChange={(e) => handleUpdateQuestion(index, { maxCharacters: parseInt(e.target.value) || 500 })}
                                min="50"
                                max="5000"
                                className="w-full border border-green-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                              <p className="text-xs text-green-600 mt-1">
                                Recommended: {question.format === QuestionFormat.SHORT_DESCRIPTION ? '200-500' : '1000-2000'} characters
                              </p>
                            </div>
                          </div>
                        )}

                        {(question.format === QuestionFormat.YES_NO_WITH_JUSTIFICATION || question.format === QuestionFormat.RATING_WITH_JUSTIFICATION) && (
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`justification-${index}`}
                                checked={true} // Always checked for these formats
                                disabled={true} // Disable since it's required for these formats
                                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded opacity-75 cursor-not-allowed"
                              />
                              <label htmlFor={`justification-${index}`} className="text-sm font-medium text-yellow-900">
                                Require justification for answer (required for this format)
                              </label>
                            </div>
                            <p className="text-xs text-yellow-700 mt-1">
                              Justification is mandatory for {question.format === QuestionFormat.YES_NO_WITH_JUSTIFICATION ? 'yes/no' : 'rating'} questions to understand reasoning.
                            </p>
                          </div>
                        )}

                        {question.expectedAnswer !== undefined && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Answer / Guidance</label>
                            <textarea
                              value={question.expectedAnswer}
                              onChange={(e) => handleUpdateQuestion(index, { expectedAnswer: e.target.value })}
                              placeholder="What constitutes a good answer to this question..."
                              rows={2}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
      </div>
    </div>
  );
};
