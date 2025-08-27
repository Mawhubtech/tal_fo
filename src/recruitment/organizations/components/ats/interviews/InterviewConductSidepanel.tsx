import React, { useState, useEffect } from 'react';
import { 
  X, Play, Pause, Clock, CheckCircle, Star, RotateCcw, 
  ChevronLeft, ChevronRight, Save, FileText, AlertTriangle,
  User, Calendar, MapPin, Video, Phone, Users, Flag, Plus
} from 'lucide-react';
import { 
  InterviewStatus, 
  InterviewType,
  InterviewProgressStatus,
  Interview 
} from '../../../../../types/interview.types';
import { InterviewTemplate, InterviewQuestion, QuestionFormat } from '../../../../../types/interviewTemplate.types';
import { useUpdateInterview, useSaveInterviewProgress, useCreateInterviewResponse, useInterviewQueryInvalidation } from '../../../../../hooks/useInterviews';
import { toast } from '../../../../../components/ToastContainer';

interface InterviewConductSidepanelProps {
  interview: Interview;
  template: InterviewTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveProgress?: (progress: InterviewProgress) => Promise<void>;
  onSubmitEvaluation?: (evaluation: InterviewEvaluation) => Promise<void>;
}

interface QuestionResponse {
  questionId: string;
  answer: string;
  score?: number;
  notes: string;
  timeSpent: number;
  flagged: boolean;
}

interface InterviewProgress {
  interviewId: string;
  templateId?: string;
  currentQuestionIndex: number;
  responses: QuestionResponse[];
  startTime: Date;
  totalTimeSpent: number;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed';
}

interface InterviewEvaluation {
  interviewId: string;
  templateId?: string;
  responses: QuestionResponse[];
  overallScore: number;
  overallNotes: string;
  recommendation: 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';
  strengths: string[];
  weaknesses: string[];
  nextSteps: string;
  completedAt: Date;
}

export const InterviewConductSidepanel: React.FC<InterviewConductSidepanelProps> = ({
  interview,
  template,
  isOpen,
  onClose,
  onSaveProgress,
  onSubmitEvaluation
}) => {
  const [interviewStatus, setInterviewStatus] = useState<'not_started' | 'in_progress' | 'paused' | 'completed'>('not_started');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [currentResponse, setCurrentResponse] = useState<QuestionResponse>({
    questionId: '',
    answer: '',
    score: undefined,
    notes: '',
    timeSpent: 0,
    flagged: false
  });

  const [evaluation, setEvaluation] = useState({
    overallScore: 0,
    overallNotes: '',
    recommendation: 'no_hire' as 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire',
    strengths: [''],
    weaknesses: [''],
    nextSteps: ''
  });

  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'evaluation'>('questions');

  const updateInterviewMutation = useUpdateInterview();
  const saveProgressMutation = useSaveInterviewProgress();
  const createResponseMutation = useCreateInterviewResponse();
  const { invalidateInterviewData } = useInterviewQueryInvalidation();

  const candidate = interview?.jobApplication?.candidate;
  const job = interview?.jobApplication?.job;
  const questions = template?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Helper function to generate consistent question IDs
  const getQuestionId = (question: any, index: number) => {
    // Use order if available, otherwise use index
    const order = question.order || (index + 1);
    return `question-${order}`;
  };

  // Helper function to find question by ID
  const findQuestionById = (questionId: string) => {
    return questions.find((q, index) => getQuestionId(q, index) === questionId);
  };

  // Helper function to find question index by ID
  const findQuestionIndexById = (questionId: string) => {
    return questions.findIndex((q, index) => getQuestionId(q, index) === questionId);
  };
  console.log('Template:', template);
  console.log('Questions:', questions);
  console.log('Current question index:', currentQuestionIndex);
  console.log('Current question:', currentQuestion);

  // Initialize current response when question changes (but not when responses change)
  useEffect(() => {
    if (currentQuestion) {
      // Use consistent question ID generation
      const questionIdentifier = getQuestionId(currentQuestion, currentQuestionIndex);
      const existingResponse = responses.find(r => r.questionId === questionIdentifier);
      console.log('Question changed to:', questionIdentifier, 'Found existing response:', existingResponse);
      
      if (existingResponse) {
        // Create a fresh copy to avoid reference issues
        setCurrentResponse({
          questionId: existingResponse.questionId,
          answer: existingResponse.answer,
          score: existingResponse.score,
          notes: existingResponse.notes,
          timeSpent: existingResponse.timeSpent,
          flagged: existingResponse.flagged
        });
      } else {
        setCurrentResponse({
          questionId: questionIdentifier,
          answer: '',
          score: undefined,
          notes: '',
          timeSpent: 0,
          flagged: false
        });
      }
    }
  }, [currentQuestionIndex, currentQuestion?.id]); // Removed responses dependency

  // Timer management
  useEffect(() => {
    if (interviewStatus === 'in_progress' && timer) {
      return () => clearInterval(timer);
    }
  }, [interviewStatus, timer]);

  const startInterview = () => {
    const now = new Date();
    setStartTime(now);
    setQuestionStartTime(now);
    setInterviewStatus('in_progress');
    
    const interval = setInterval(() => {
      setTotalTimeSpent(prev => prev + 1);
    }, 1000);
    setTimer(interval);

    // Update interview status in backend
    updateInterviewMutation.mutate({
      id: interview.id,
      data: { status: InterviewStatus.IN_PROGRESS }
    });
  };

  const pauseInterview = () => {
    setInterviewStatus('paused');
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    saveCurrentResponse();
  };

  const resumeInterview = () => {
    setInterviewStatus('in_progress');
    setQuestionStartTime(new Date());
    
    const interval = setInterval(() => {
      setTotalTimeSpent(prev => prev + 1);
    }, 1000);
    setTimer(interval);
  };

  const saveCurrentResponse = () => {
    if (!currentQuestion) return;

    const questionIdentifier = getQuestionId(currentQuestion, currentQuestionIndex);
    const timeSpentOnQuestion = questionStartTime 
      ? Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000)
      : 0;

    const updatedResponse = {
      ...currentResponse,
      questionId: questionIdentifier,
      timeSpent: currentResponse.timeSpent + timeSpentOnQuestion
    };

    // Update both current response and responses array with time spent
    setCurrentResponse(updatedResponse);
    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== questionIdentifier);
      return [...filtered, updatedResponse];
    });

    return updatedResponse;
  };

  const goToNextQuestion = () => {
    saveCurrentResponse();
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(new Date());
    } else {
      // All questions completed
      setInterviewStatus('completed');
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      setShowEvaluationForm(true);
      setActiveTab('evaluation');
    }
  };

  const goToPreviousQuestion = () => {
    saveCurrentResponse();
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(new Date());
    }
  };

  const goToQuestion = (index: number) => {
    saveCurrentResponse();
    setCurrentQuestionIndex(index);
    setQuestionStartTime(new Date());
  };

  const handleScoreChange = (score: number) => {
    if (!currentQuestion) return;
    
    // Use consistent question ID generation
    const questionIdentifier = getQuestionId(currentQuestion, currentQuestionIndex);
    
    console.log('Score change:', { 
      questionIdentifier, 
      score, 
      currentResponse: currentResponse 
    });
    
    const updatedResponse = { 
      ...currentResponse, 
      score,
      questionId: questionIdentifier // Use the proper identifier
    };
    
    console.log('Updated response:', updatedResponse);
    
    setCurrentResponse(updatedResponse);
    
    // Update the responses array immediately
    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== questionIdentifier);
      const newResponses = [...filtered, updatedResponse];
      console.log('New responses array:', newResponses);
      return newResponses;
    });
  };

  const handleAnswerChange = (answer: string) => {
    if (!currentQuestion) return;
    
    const questionIdentifier = getQuestionId(currentQuestion, currentQuestionIndex);
    
    const updatedResponse = { 
      ...currentResponse, 
      answer,
      questionId: questionIdentifier
    };
    
    setCurrentResponse(updatedResponse);
    
    // Update the responses array immediately
    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== questionIdentifier);
      return [...filtered, updatedResponse];
    });
  };

  const handleNotesChange = (notes: string) => {
    if (!currentQuestion) return;
    
    const questionIdentifier = getQuestionId(currentQuestion, currentQuestionIndex);
    
    const updatedResponse = { 
      ...currentResponse, 
      notes,
      questionId: questionIdentifier
    };
    
    setCurrentResponse(updatedResponse);
    
    // Update the responses array immediately
    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== questionIdentifier);
      return [...filtered, updatedResponse];
    });
  };

  const toggleFlag = () => {
    if (!currentQuestion) return;
    
    const questionIdentifier = getQuestionId(currentQuestion, currentQuestionIndex);
    
    const updatedResponse = { 
      ...currentResponse, 
      flagged: !currentResponse.flagged,
      questionId: questionIdentifier
    };
    
    setCurrentResponse(updatedResponse);
    
    // Update the responses array immediately
    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== questionIdentifier);
      return [...filtered, updatedResponse];
    });
  };

  const saveProgress = async () => {
    const allResponses = [...responses, currentResponse];
    
    // Create responses for ALL questions, not just those with answers
    const completeResponses = questions.map((question, index) => {
      const questionId = getQuestionId(question, index);
      const existingResponse = allResponses.find(r => r.questionId === questionId);
      
      return {
        questionId,
        answer: existingResponse?.answer || '',
        score: existingResponse?.score || null,
        notes: existingResponse?.notes || '',
        timeSpent: existingResponse?.timeSpent || 0,
        flagged: existingResponse?.flagged || false
      };
    });
    
    // Filter out responses that are completely empty (no answer, no score, no notes)
    const finalResponses = completeResponses.filter(r => 
      r.answer.trim() !== '' || r.score !== null || r.notes.trim() !== ''
    );
    
    const progressData = {
      interviewId: interview.id, // Add the required interviewId field
      templateId: template?.id,
      currentQuestionIndex,
      responses: finalResponses.map(r => {
        const question = findQuestionById(r.questionId);
        const questionIndex = findQuestionIndexById(r.questionId);
        return {
          interviewId: interview.id, // Required for each response in progress
          questionId: r.questionId,
          questionText: question?.question || '',
          questionFormat: question?.format || QuestionFormat.SHORT_DESCRIPTION,
          questionOrder: Math.max(1, question?.order || (questionIndex + 1)), // Ensure minimum 1
          answer: r.answer,
          justification: '', // QuestionResponse doesn't have justification
          score: r.score || null,
          notes: r.notes || '',
          timeSpentSeconds: r.timeSpent || 0,
          flagged: r.flagged || false,
          isCompleted: false // This is just progress, not completed
        };
      }),
      totalTimeSpentSeconds: totalTimeSpent,
      status: InterviewProgressStatus.IN_PROGRESS
    };

    try {
      await saveProgressMutation.mutateAsync({
        interviewId: interview.id,
        progressData
      });
      toast.success('Progress Saved', 'Interview progress has been saved successfully.');
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Save Failed', 'Failed to save interview progress.');
    }
  };

  const submitEvaluation = async () => {
    console.log('🔥 Submit Evaluation clicked!');
    console.log('startTime:', startTime);
    console.log('evaluation:', evaluation);
    console.log('responses:', responses);
    console.log('currentResponse:', currentResponse);
    
    if (!startTime) {
      console.error('No start time found');
      toast.error('Error', 'Interview must be started before submitting evaluation.');
      return;
    }

    // Combine all responses including the current one
    const allResponses = [...responses, currentResponse];
    
    // Create responses for ALL questions, not just those with answers
    const completeResponses = questions.map((question, index) => {
      const questionId = getQuestionId(question, index);
      const existingResponse = allResponses.find(r => r.questionId === questionId);
      
      return {
        questionId,
        answer: existingResponse?.answer || '',
        score: existingResponse?.score || null,
        notes: existingResponse?.notes || '',
        timeSpent: existingResponse?.timeSpent || 0,
        flagged: existingResponse?.flagged || false
      };
    });
    
    // Filter out responses that are completely empty (no answer, no score, no notes)
    const finalResponses = completeResponses.filter(r => 
      r.answer.trim() !== '' || r.score !== null || r.notes.trim() !== ''
    );
    
    console.log('All questions count:', questions.length);
    console.log('Complete responses count:', completeResponses.length);
    console.log('Final responses (non-empty) count:', finalResponses.length);
    console.log('finalResponses:', finalResponses);

    try {
      // Step 1: Save all individual question responses
      console.log('Saving individual question responses...');
      for (const response of finalResponses) {
        try {
          // Find the question using our helper function
          const question = findQuestionById(response.questionId);
          const questionIndex = findQuestionIndexById(response.questionId);
          if (!question) {
            console.warn(`Question not found for response: ${response.questionId}`);
            continue;
          }

          await createResponseMutation.mutateAsync({
            interviewId: interview.id,
            responseData: {
              interviewId: interview.id, // Required for validation
              questionId: response.questionId,
              questionText: question.question,
              questionFormat: question.format,
              questionOrder: Math.max(1, question.order || (questionIndex + 1)), // Ensure minimum 1
              answer: response.answer,
              justification: '', // QuestionResponse doesn't have justification
              score: response.score || null,
              notes: response.notes || '',
              timeSpentSeconds: response.timeSpent || 0,
              flagged: response.flagged || false,
              isCompleted: true
            }
          });
          console.log(`Response saved for question ${response.questionId}`);
        } catch (responseError) {
          console.error(`Failed to save response for question ${response.questionId}:`, responseError);
          // Continue with other responses even if one fails
        }
      }

      // Step 2: Save interview progress
      console.log('Saving interview progress...');
      const progressData = {
        interviewId: interview.id, // Add the required interviewId field
        templateId: template?.id,
        currentQuestionIndex: questions.length - 1, // Mark as completed
        responses: finalResponses.map(r => {
          const question = findQuestionById(r.questionId);
          const questionIndex = findQuestionIndexById(r.questionId);
          return {
            interviewId: interview.id, // Required for each response in progress
            questionId: r.questionId,
            questionText: question?.question || '',
            questionFormat: question?.format || QuestionFormat.SHORT_DESCRIPTION,
            questionOrder: Math.max(1, question?.order || (questionIndex + 1)), // Ensure minimum 1
            answer: r.answer,
            justification: '', // QuestionResponse doesn't have justification
            score: r.score || null,
            notes: r.notes || '',
            timeSpentSeconds: r.timeSpent || 0,
            flagged: r.flagged || false,
            isCompleted: true
          };
        }),
        totalTimeSpentSeconds: totalTimeSpent,
        status: InterviewProgressStatus.COMPLETED
      };

      await saveProgressMutation.mutateAsync({
        interviewId: interview.id,
        progressData
      });
      console.log('Interview progress saved successfully');

      // Step 3: Update interview with overall evaluation results
      console.log('Updating interview with evaluation results...');
      const averageScore = finalResponses.length > 0 
        ? finalResponses.reduce((sum, r) => sum + (r.score || 0), 0) / finalResponses.length 
        : 0;

      // Map recommendation to result
      const resultMapping = {
        'strong_hire': 'Pass',
        'hire': 'Pass', 
        'no_hire': 'Fail',
        'strong_no_hire': 'Fail'
      };

      const interviewUpdateData = {
        status: InterviewStatus.COMPLETED,
        result: resultMapping[evaluation.recommendation] || 'Fail',
        overallRating: evaluation.overallScore || Math.round(averageScore),
        notes: [
          evaluation.overallNotes,
          evaluation.strengths.filter(Boolean).length > 0 ? `Strengths: ${evaluation.strengths.filter(Boolean).join(', ')}` : '',
          evaluation.weaknesses.filter(Boolean).length > 0 ? `Areas for Improvement: ${evaluation.weaknesses.filter(Boolean).join(', ')}` : '',
          evaluation.nextSteps ? `Next Steps: ${evaluation.nextSteps}` : ''
        ].filter(Boolean).join('\n\n'),
        recommendation: evaluation.recommendation,
        nextSteps: evaluation.nextSteps
      };

      await updateInterviewMutation.mutateAsync({
        id: interview.id,
        data: interviewUpdateData
      });

      console.log('Interview evaluation updated successfully');

      // Step 4: Call the optional onSubmitEvaluation callback if provided
      if (onSubmitEvaluation) {
        const interviewEvaluation: InterviewEvaluation = {
          interviewId: interview.id,
          templateId: template?.id,
          responses: finalResponses,
          overallScore: evaluation.overallScore || averageScore,
          overallNotes: evaluation.overallNotes,
          recommendation: evaluation.recommendation,
          strengths: evaluation.strengths.filter(Boolean),
          weaknesses: evaluation.weaknesses.filter(Boolean),
          nextSteps: evaluation.nextSteps,
          completedAt: new Date()
        };

        try {
          await onSubmitEvaluation(interviewEvaluation);
          console.log('External onSubmitEvaluation completed successfully');
        } catch (callbackError) {
          console.warn('External onSubmitEvaluation failed, but interview data was saved:', callbackError);
        }
      }

      // Ensure all components refresh with the latest data
      invalidateInterviewData(interview.id);

      toast.success('Evaluation Submitted', 'Interview evaluation has been submitted and saved successfully.');
      onClose();
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      console.error('Error details:', error?.response?.data);
      toast.error('Submission Failed', 'Failed to submit interview evaluation. Please check console for details.');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionStatusIcon = (index: number) => {
    const response = responses.find(r => r.questionId === questions[index]?.id);
    if (response?.answer) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (index === currentQuestionIndex && interviewStatus === 'in_progress') {
      return <Play className="w-4 h-4 text-blue-500" />;
    }
    return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Full Screen Interview Panel */}
      <div className="absolute inset-0 bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    Interview with {candidate?.fullName}
                  </h2>
                  <p className="text-purple-100 mt-1">
                    {job?.title} • {template?.name || 'No Template'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-purple-200 hover:text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Interview Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-3 py-2">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-sm">{formatTime(totalTimeSpent)}</span>
              </div>
              
              {template && (
                <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-3 py-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {interviewStatus === 'not_started' && (
                <button
                  onClick={startInterview}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Interview</span>
                </button>
              )}
              
              {interviewStatus === 'in_progress' && (
                <button
                  onClick={pauseInterview}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              )}
              
              {interviewStatus === 'paused' && (
                <button
                  onClick={resumeInterview}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Resume</span>
                </button>
              )}

              <button
                onClick={saveProgress}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'questions'
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'text-purple-200 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              Questions
            </button>
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'evaluation'
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'text-purple-200 hover:text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              Evaluation
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-w-7xl mx-auto">
          {!template ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interview Template</h3>
              <p className="text-gray-600 mb-4">
                This interview doesn't have an associated template. You can still conduct the interview manually.
              </p>
              <button
                onClick={() => setActiveTab('evaluation')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go to Evaluation
              </button>
            </div>
          ) : activeTab === 'questions' ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Question List Sidebar */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
                <div className="space-y-2">
                  {questions.map((question, index) => {
                    const questionIdentifier = getQuestionId(question, index);
                    const response = responses.find(r => r.questionId === questionIdentifier);
                    return (
                      <button
                        key={questionIdentifier}
                        onClick={() => goToQuestion(index)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          index === currentQuestionIndex
                            ? 'border-purple-500 bg-purple-50'
                            : response?.answer
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {getQuestionStatusIcon(index)}
                          <span className="text-sm font-medium">Q{index + 1}</span>
                          {response?.flagged && <Flag className="w-3 h-3 text-red-500" />}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {question.question}
                        </p>
                        {response?.score && (
                          <div className="flex items-center mt-1">
                            <Star className="w-3 h-3 text-yellow-500 mr-1" />
                            <span className="text-xs text-gray-600">{response.score}/5</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Question Area */}
              <div className="lg:col-span-4">
                {currentQuestion && (
                  <div className="space-y-6">
                    {/* Navigation Controls */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <button
                        onClick={goToPreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Previous</span>
                      </button>

                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {Math.round((currentQuestionIndex / questions.length) * 100)}% Complete
                        </div>
                      </div>

                      <button
                        onClick={goToNextQuestion}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                      >
                        <span>{currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}</span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Question Header */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                              {currentQuestion.type}
                            </span>
                            {currentQuestion.format && (
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded">
                                {currentQuestion.format === QuestionFormat.YES_NO_WITH_JUSTIFICATION ? 'Yes/No + Justification' :
                                 currentQuestion.format === QuestionFormat.RATING_WITH_JUSTIFICATION ? 'Rating + Justification' :
                                 currentQuestion.format === QuestionFormat.SHORT_DESCRIPTION ? 'Short Description' :
                                 currentQuestion.format === QuestionFormat.LONG_DESCRIPTION ? 'Long Description' :
                                 'Unknown Format'}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                              {currentQuestion.category}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              {currentQuestion.difficulty}
                            </span>
                            {currentQuestion.timeLimit && (
                              <span className="text-xs text-gray-500">
                                {currentQuestion.timeLimit} min suggested
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            {currentQuestion.question}
                          </h3>

                          {/* Format-specific guidance */}
                          {currentQuestion.format === QuestionFormat.YES_NO_WITH_JUSTIFICATION && (
                            <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 mb-3">
                              <h4 className="text-sm font-medium text-pink-900 mb-1">Response Format</h4>
                              <p className="text-sm text-pink-800">
                                Expecting a Yes/No answer{currentQuestion.requiresJustification && ' followed by justification'}
                              </p>
                            </div>
                          )}

                          {currentQuestion.format === QuestionFormat.RATING_WITH_JUSTIFICATION && currentQuestion.ratingScale && (
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-3">
                              <h4 className="text-sm font-medium text-indigo-900 mb-1">Response Format</h4>
                              <p className="text-sm text-indigo-800">
                                Rating scale: {currentQuestion.ratingScale.min} - {currentQuestion.ratingScale.max}
                                {currentQuestion.ratingScale.labels && Object.keys(currentQuestion.ratingScale.labels).length > 0 && (
                                  <span className="block mt-1">
                                    ({Object.entries(currentQuestion.ratingScale.labels).map(([key, value]) => `${key}: ${value}`).join(', ')})
                                  </span>
                                )}
                                {currentQuestion.requiresJustification && (
                                  <span className="block mt-1 font-medium">Justification required</span>
                                )}
                              </p>
                            </div>
                          )}

                          {(currentQuestion.format === QuestionFormat.SHORT_DESCRIPTION || currentQuestion.format === QuestionFormat.LONG_DESCRIPTION) && currentQuestion.maxCharacters && (
                            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mb-3">
                              <h4 className="text-sm font-medium text-cyan-900 mb-1">Response Format</h4>
                              <p className="text-sm text-cyan-800">
                                {currentQuestion.format === QuestionFormat.SHORT_DESCRIPTION ? 'Brief' : 'Detailed'} description 
                                (max {currentQuestion.maxCharacters} characters)
                              </p>
                            </div>
                          )}

                          {currentQuestion.section && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-1">Section</h4>
                              <p className="text-sm text-gray-700">{currentQuestion.section}</p>
                            </div>
                          )}
                          
                          {currentQuestion.expectedAnswer && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                              <h4 className="text-sm font-medium text-blue-900 mb-1">Expected Answer</h4>
                              <p className="text-sm text-blue-800">{currentQuestion.expectedAnswer}</p>
                            </div>
                          )}

                          {currentQuestion.scoringCriteria && currentQuestion.scoringCriteria.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-yellow-900 mb-1">Scoring Criteria</h4>
                              <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
                                {currentQuestion.scoringCriteria.map((criteria, index) => (
                                  <li key={index}>{criteria}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={toggleFlag}
                          className={`p-2 rounded-lg transition-colors ${
                            currentResponse.flagged
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-400 hover:text-red-500'
                          }`}
                          title="Flag this question"
                        >
                          <Flag className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Response Collection */}
                    <div className="space-y-4">
                      {/* Candidate's Answer */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Candidate's Answer
                        </label>
                        <textarea
                          value={currentResponse.answer}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          placeholder="Record the candidate's response here..."
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          rows={6}
                        />
                      </div>

                      {/* Score */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Score (1-5)
                        </label>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              onClick={() => handleScoreChange(score)}
                              className={`w-10 h-10 rounded-full border-2 transition-colors ${
                                currentResponse.score === score
                                  ? 'border-purple-500 bg-purple-500 text-white'
                                  : 'border-gray-300 text-gray-600 hover:border-purple-300'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                          {currentResponse.score && (
                            <button
                              onClick={() => handleScoreChange(undefined!)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes & Observations
                        </label>
                        <textarea
                          value={currentResponse.notes}
                          onChange={(e) => handleNotesChange(e.target.value)}
                          placeholder="Add any notes, observations, or follow-up questions..."
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Evaluation Tab */
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Interview Evaluation</h3>
                <p className="text-gray-600">
                  Provide your overall assessment of the candidate
                </p>
              </div>

              {/* Summary Stats */}
              {responses.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Interview Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{responses.length}</p>
                      <p className="text-sm text-gray-600">Questions Answered</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {responses.filter(r => r.score).length > 0 
                          ? (responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.filter(r => r.score).length).toFixed(1)
                          : 'N/A'
                        }
                      </p>
                      <p className="text-sm text-gray-600">Average Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{formatTime(totalTimeSpent)}</p>
                      <p className="text-sm text-gray-600">Total Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {responses.filter(r => r.flagged).length}
                      </p>
                      <p className="text-sm text-gray-600">Flagged Questions</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Evaluation Form */}
              <div className="space-y-6">
                {/* Overall Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Score (1-5)
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        onClick={() => setEvaluation(prev => ({ ...prev, overallScore: score }))}
                        className={`w-12 h-12 rounded-full border-2 transition-colors ${
                          evaluation.overallScore === score
                            ? 'border-purple-500 bg-purple-500 text-white'
                            : 'border-gray-300 text-gray-600 hover:border-purple-300'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommendation
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'strong_hire', label: 'Strong Hire', color: 'bg-green-500' },
                      { value: 'hire', label: 'Hire', color: 'bg-green-400' },
                      { value: 'no_hire', label: 'No Hire', color: 'bg-red-400' },
                      { value: 'strong_no_hire', label: 'Strong No Hire', color: 'bg-red-500' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setEvaluation(prev => ({ ...prev, recommendation: option.value as any }))}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          evaluation.recommendation === option.value
                            ? `${option.color} text-white border-transparent`
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Overall Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Notes
                  </label>
                  <textarea
                    value={evaluation.overallNotes}
                    onChange={(e) => setEvaluation(prev => ({ ...prev, overallNotes: e.target.value }))}
                    placeholder="Provide your overall assessment of the candidate..."
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                {/* Strengths */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Strengths
                  </label>
                  <div className="space-y-2">
                    {evaluation.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={strength}
                          onChange={(e) => {
                            const newStrengths = [...evaluation.strengths];
                            newStrengths[index] = e.target.value;
                            setEvaluation(prev => ({ ...prev, strengths: newStrengths }));
                          }}
                          placeholder={`Strength ${index + 1}...`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {evaluation.strengths.length > 1 && (
                          <button
                            onClick={() => {
                              const newStrengths = evaluation.strengths.filter((_, i) => i !== index);
                              setEvaluation(prev => ({ ...prev, strengths: newStrengths }));
                            }}
                            className="p-2 text-red-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setEvaluation(prev => ({ ...prev, strengths: [...prev.strengths, ''] }))}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Strength</span>
                    </button>
                  </div>
                </div>

                {/* Weaknesses */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Areas for Improvement
                  </label>
                  <div className="space-y-2">
                    {evaluation.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={weakness}
                          onChange={(e) => {
                            const newWeaknesses = [...evaluation.weaknesses];
                            newWeaknesses[index] = e.target.value;
                            setEvaluation(prev => ({ ...prev, weaknesses: newWeaknesses }));
                          }}
                          placeholder={`Area for improvement ${index + 1}...`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {evaluation.weaknesses.length > 1 && (
                          <button
                            onClick={() => {
                              const newWeaknesses = evaluation.weaknesses.filter((_, i) => i !== index);
                              setEvaluation(prev => ({ ...prev, weaknesses: newWeaknesses }));
                            }}
                            className="p-2 text-red-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setEvaluation(prev => ({ ...prev, weaknesses: [...prev.weaknesses, ''] }))}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Area for Improvement</span>
                    </button>
                  </div>
                </div>

                {/* Next Steps */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Steps
                  </label>
                  <textarea
                    value={evaluation.nextSteps}
                    onChange={(e) => setEvaluation(prev => ({ ...prev, nextSteps: e.target.value }))}
                    placeholder="What are the recommended next steps for this candidate?"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setActiveTab('questions')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back to Questions
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🚀 Submit Evaluation button clicked!');
                        console.log('Button event:', e);
                        console.log('evaluation.overallScore:', evaluation.overallScore);
                        console.log('evaluation.recommendation:', evaluation.recommendation);
                        console.log('Button disabled?', !evaluation.overallScore || !evaluation.recommendation);
                        
                        if (!evaluation.overallScore || !evaluation.recommendation) {
                          toast.warning('Missing Information', 'Please provide both an overall score and recommendation before submitting.');
                          return;
                        }
                        
                        submitEvaluation();
                      }}
                      disabled={!evaluation.overallScore || !evaluation.recommendation}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Submit Evaluation</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
