import React, { useState, useEffect } from 'react';
import { Plus, Filter, Users, Calendar, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useInterviews, useInterviewStats, useInterviewFilters, useUpdateInterview, useAddInterviewFeedback, useInterviewQueryInvalidation } from '../../../../../hooks/useInterviews';
import { useInterviewCalendarSync } from '../../../../../hooks/useInterviewCalendarSync';
import { useStageMovement } from '../../../../../hooks/useStageMovement';
import { useJobApplicationsByJob } from '../../../../../hooks/useJobApplications';
import { usePipeline } from '../../../../../hooks/usePipelines';
import type { Interview, InterviewFilters, InterviewStatus } from '../../../../../types/interview.types';
import type { InterviewTemplate } from '../../../../../types/interviewTemplate.types';
import { InterviewsListView } from './InterviewsListView';
import { InterviewsCalendarView } from './InterviewsCalendarView';
import { ScheduleInterviewForm } from './ScheduleInterviewForm';
import { InterviewFiltersPanel } from './InterviewFiltersPanel';
import { InterviewDetailModal } from './InterviewDetailModal';
import { InterviewTemplatesPanel } from './templates/InterviewTemplatesPanel';
import { toast } from '../../../../../components/ToastContainer';

interface InterviewsTabProps {
  jobId?: string;
  jobTitle?: string;
  jobDescription?: string; 
  jobRequirements?: string[];
  onInterviewClick?: (interview: Interview) => void;
  onNewInterview?: () => void;
  selectedCandidateId?: string;
  pipelineId?: string; // Add pipeline ID for stage movement
  onDataChange?: () => Promise<void>;
  hiringTeamMembers?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    memberType: 'internal' | 'external';
  }>;
}

export const InterviewsTab: React.FC<InterviewsTabProps> = ({
  jobId,
  jobTitle = '',
  jobDescription = '',
  jobRequirements = [],
  onInterviewClick,
  onNewInterview,
  selectedCandidateId,
  pipelineId,
  onDataChange,
  hiringTeamMembers = []
}) => {
  const [interviewsView, setInterviewsView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTemplatesPanel, setShowTemplatesPanel] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InterviewTemplate | null>(null);

  // Calendar sync integration
  const calendarSync = useInterviewCalendarSync();

  // Debug logging
  // Component props for tracking interviews

  const {
    filters,
    updateFilter,
    clearFilters,
  } = useInterviewFilters({ 
    ...(jobId && { jobId }),
    page: 1,
    limit: 20,
    sortBy: 'scheduledAt',
    sortOrder: 'ASC' as const
  });

  const { data: interviewsData, isLoading, error, refetch } = useInterviews(filters);
  const { data: stats } = useInterviewStats();
  const updateInterviewMutation = useUpdateInterview();
  const addFeedbackMutation = useAddInterviewFeedback();
  const { invalidateAllInterviewQueries } = useInterviewQueryInvalidation();
  
  // Stage movement integration
  const stageMovement = useStageMovement();
  const { data: jobApplicationsData } = useJobApplicationsByJob(jobId || '');
  const { data: pipeline } = usePipeline(pipelineId || '');

  const interviews = interviewsData?.interviews || [];
  const totalInterviews = interviewsData?.total || 0;

  const scheduledInterviews = stats?.scheduled || 0;
  const completedInterviews = stats?.completed || 0;

  // Handle body scroll and ESC key for the Job ID Required modal
  useEffect(() => {
    if (showScheduleForm && !jobId) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add ESC key handler
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setShowScheduleForm(false);
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        // Restore body scroll when modal closes
        document.body.style.overflow = 'unset';
      };
    }
  }, [showScheduleForm, jobId]);

  const handleNavigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleNewInterview = () => {
    if (onNewInterview) {
      onNewInterview();
    } else {
      setShowScheduleForm(true);
    }
  };

  const handleViewChange = (view: 'list' | 'calendar') => {
    setInterviewsView(view);
  };

  const handleUpdateInterviewStatus = async (interview: Interview, status: string) => {
    try {
      await updateInterviewMutation.mutateAsync({
        id: interview.id,
        data: { status: status as any }
      });
      
      // Call onDataChange if provided to invalidate all queries
      if (onDataChange) {
        await onDataChange();
      }
      
      toast.success('Status Updated', `Interview status changed to ${status}`);
    } catch (error) {
      console.error('Failed to update interview status:', error);
      toast.error('Update Failed', 'Failed to update interview status. Please try again.');
    }
  };

  const handleInterviewClick = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsModalOpen(true);
    onInterviewClick?.(interview);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInterview(null);
  };

  // Handle overlay click for Job ID Required modal
  const handleJobIdModalOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowScheduleForm(false);
    }
  };

  const handleUpdateInterview = async (interview: Interview, updates: Partial<Interview>) => {
    try {
      await updateInterviewMutation.mutateAsync({
        id: interview.id,
        data: updates as any
      });
      
      // Check if interview was completed and handle potential stage advancement
      if (updates.status === 'Completed') {
        await handleInterviewCompletion(interview, updates);
      }
      
      toast.success('Interview Updated', 'Interview details have been updated successfully.');
      // No need to call refetch() - query invalidation handles this automatically
    } catch (error) {
      console.error('Failed to update interview:', error);
      toast.error('Update Failed', 'Failed to update interview. Please try again.');
    }
  };

  const handleInterviewCompletion = async (interview: Interview, updates: Partial<Interview>) => {
    if (!pipeline || !jobId) {
      return; // No pipeline or job context
    }

    // Find the job application for this interview
    const jobApplications = jobApplicationsData?.applications || [];
    const application = jobApplications.find(app => 
      app.id === interview.jobApplicationId ||
      app.candidateId === interview.jobApplication?.candidateId ||
      app.candidate?.id === interview.jobApplication?.candidate?.id
    );

    if (!application) {
      return;
    }

    // Check if this interview completion should trigger stage advancement
    const shouldAdvance = await checkIfShouldAdvanceStageAfterInterview(interview, application, updates);
    
    if (shouldAdvance) {
      try {
        // Find the next stage in the pipeline
        const currentPipelineStage = pipeline.stages?.find(s => 
          s.name.toLowerCase().includes(application.stage.toLowerCase()) ||
          application.stage.toLowerCase().includes(s.name.toLowerCase())
        );
        
        const sortedStages = pipeline.stages?.sort((a, b) => a.order - b.order) || [];
        const currentIndex = sortedStages.findIndex(s => s.id === currentPipelineStage?.id);
        
        if (currentIndex !== -1 && currentIndex < sortedStages.length - 1) {
          const nextStage = sortedStages[currentIndex + 1];
          
          await stageMovement.moveAfterInterview(
            application.id,
            nextStage.id,
            updates.overallRating as number || undefined,
            `Automatically moved to ${nextStage.name} after completing ${interview.type} interview`
          );

          toast.success(
            'Stage Advanced', 
            `Candidate automatically moved to ${nextStage.name} after interview completion`
          );
        }
      } catch (error) {
        console.error('Error advancing stage after interview completion:', error);
        // Don't show error toast for stage advancement failures
        // as the interview was still completed successfully
      }
    }
  };

  const checkIfShouldAdvanceStageAfterInterview = async (
    interview: Interview, 
    application: any, 
    updates: Partial<Interview>
  ): Promise<boolean> => {
    // Define logic for when interview completion should trigger stage advancement
    
    // For example, advance stage if:
    // 1. Interview has a positive score/outcome
    // 2. It's a final interview round
    // 3. All required interviews for current stage are completed
    
    // Check for positive rating (if provided)
    if (updates.overallRating !== undefined && updates.overallRating < 3) {
      return false; // Don't advance for low ratings (assuming 1-5 scale)
    }

    // Check interview type - advance for these types
    const advancingInterviewTypes = [
      'Phone Screen',
      'Technical',
      'Final',
      'Panel'
    ];

    return advancingInterviewTypes.includes(interview.type);
  };

  const handleTemplateSelect = (template: InterviewTemplate) => {
    setSelectedTemplate(template);
    setShowTemplatesPanel(false);
    setShowScheduleForm(true);
    toast.success('Template Selected', `Using "${template.name}" template for the interview.`);
  };

  const handleSendEmail = async (interview: Interview, emailType: string, recipients: string[], subject: string, body: string) => {
    try {
      // This would be implemented with actual email service
      toast.success('Email Sent', 'Email has been sent successfully.');
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Email Failed', 'Failed to send email. Please try again.');
    }
  };

  const handleSyncToCalendar = async () => {
    try {
      if (interviews.length === 0) {
        toast.info('No Interviews', 'No interviews to sync to calendar.');
        return;
      }

      const result = await calendarSync.syncAllInterviews.mutateAsync(interviews);
      
      if (result.success > 0) {
        toast.success(
          'Calendar Sync Complete',
          `Successfully synced ${result.success} interview${result.success !== 1 ? 's' : ''} to calendar.${
            result.failed > 0 ? ` ${result.failed} failed to sync.` : ''
          }`
        );
      } else {
        toast.error('Sync Failed', 'Failed to sync interviews to calendar.');
      }
    } catch (error) {
      console.error('Failed to sync interviews to calendar:', error);
      toast.error('Sync Failed', 'Failed to sync interviews to calendar. Please try again.');
    }
  };

  const handleAddFeedback = async (interview: Interview, feedback: any) => {
    try {
      await addFeedbackMutation.mutateAsync({
        id: interview.id,
        data: feedback
      });
      toast.success('Feedback Added', 'Interview feedback has been submitted successfully.');
      // No need to call refetch() - query invalidation handles this automatically
    } catch (error) {
      console.error('Failed to add feedback:', error);
      toast.error('Feedback Failed', 'Failed to submit feedback. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error loading interviews</div>
          <button 
            onClick={() => invalidateAllInterviewQueries()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Interview Templates Panel */}
      {showTemplatesPanel && (
        <InterviewTemplatesPanel
          jobId={jobId}
          jobTitle={jobTitle}
          jobDescription={jobDescription}
          jobRequirements={jobRequirements}
          onTemplateSelect={handleTemplateSelect}
        />
      )}

      {/* Interview Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
        <div className="flex space-x-3">
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            onClick={handleNewInterview}
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Interview
          </button>
          <button 
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center"
            onClick={() => setShowTemplatesPanel(!showTemplatesPanel)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {showTemplatesPanel ? 'Hide Templates' : 'Interview Templates'}
          </button>
          <button 
            className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center ${
              showFilters ? 'bg-gray-50' : ''
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button 
            className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSyncToCalendar}
            disabled={calendarSync.isSyncingAll || interviews.length === 0}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${calendarSync.isSyncingAll ? 'animate-spin' : ''}`} />
            {calendarSync.isSyncingAll ? 'Syncing...' : 'Sync to Calendar'}
          </button>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => handleViewChange('list')}
              className={`px-3 py-2 text-sm flex items-center ${
                interviewsView === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 mr-1" />
              List
            </button>
            <button
              onClick={() => handleViewChange('calendar')}
              className={`px-3 py-2 text-sm flex items-center ${
                interviewsView === 'calendar' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Calendar
            </button>
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1 text-blue-500" />
            <span>{scheduledInterviews} scheduled</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
            <span>{completedInterviews} completed</span>
          </div>
          <div className="text-gray-400">
            Total: {totalInterviews}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <InterviewFiltersPanel
          filters={filters}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Interviews Content */}
      {!isLoading && (
        <>
          {interviewsView === 'list' ? (
            <InterviewsListView
              interviews={interviews}
              isLoading={isLoading}
              onInterviewClick={handleInterviewClick}
              onRefresh={invalidateAllInterviewQueries}
              totalCount={totalInterviews}
              showJobInfo={!jobId} // Show job info when not in job-specific context
              onUpdateInterviewStatus={handleUpdateInterviewStatus}
            />
          ) : (
            <InterviewsCalendarView
              interviews={interviews}
              currentDate={currentDate}
              onNavigateMonth={handleNavigateMonth}
              onToday={handleToday}
              onInterviewClick={handleInterviewClick}
              isLoading={isLoading}
            />
          )}
        </>
      )}

      {/* Schedule Interview Form */}
      {showScheduleForm && (
        <>
          {jobId ? (
            <ScheduleInterviewForm
              jobId={jobId}
              onClose={() => {
                setShowScheduleForm(false);
                setSelectedTemplate(null);
              }}
              selectedCandidateId={selectedCandidateId}
              selectedTemplate={selectedTemplate}
              hiringTeamMembers={hiringTeamMembers}
              onSuccess={() => {
                setShowScheduleForm(false);
                setSelectedTemplate(null);
                // No need to call refetch() - query invalidation handles this automatically
              }}
            />
          ) : (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={handleJobIdModalOverlayClick}
            >
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job ID Required</h3>
                <p className="text-gray-600 mb-4">
                  A job ID is required to schedule an interview. Please navigate to a specific job to schedule interviews for that position.
                </p>
                <button
                  onClick={() => setShowScheduleForm(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Interview Detail Modal */}
      <InterviewDetailModal
        interview={selectedInterview}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdateInterview={handleUpdateInterview}
        onSendEmail={handleSendEmail}
        onAddFeedback={handleAddFeedback}
      />
    </div>
  );
};
