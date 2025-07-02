import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Briefcase, Users, CheckCircle, BarChart3, Calendar, Plus, AlertCircle
} from 'lucide-react';
import { useJob } from '../../../hooks/useJobs';
import { usePipeline } from '../../../hooks/usePipelines';
import { useDefaultPipeline } from '../../../hooks/useDefaultPipeline';
import { useJobApplicationsByJob, useUpdateJobApplication, useDeleteJobApplication } from '../../../hooks/useJobApplications';
import { useStageMovement } from '../../../hooks/useStageMovement';
import { useOptimisticStageMovement } from '../../../hooks/useOptimisticStageMovement';
import { useTaskStats } from '../../../hooks/useTasks';
import { useInterviews } from '../../../hooks/useInterviews';
import { useJobReport } from '../../../hooks/useReports';
import { StageChangeReason } from '../../../types/stageMovement.types';
import type { Job as JobType } from '../../data/types';
import type { JobApplication } from '../../../services/jobApplicationApiService';
import { PipelineTab, TasksTab, InterviewsTab, ReportsTab } from '../components/ats';
import AddCandidateModal from '../components/AddCandidateModal';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import ToastContainer, { toast } from '../../../components/ToastContainer';

const JobATSPage: React.FC = () => {
  const { organizationId, departmentId, jobId } = useParams<{ 
	organizationId: string; 
	departmentId: string; 
	jobId: string; 
  }>();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'tasks' | 'interviews' | 'reports'>('pipeline');
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  
  // Use React Query hooks
  const { 
    data: job, 
    isLoading: jobLoading, 
    error: jobError 
  } = useJob(jobId || '');
  
  // Get the pipeline for this job, or use default if none specified
  const {
    data: jobPipeline,
    isLoading: pipelineLoading,
    error: pipelineError
  } = usePipeline(job?.pipelineId || '');

  // Get or create default pipeline if no pipeline is assigned to job
  const {
    defaultPipeline,
    isLoading: defaultPipelineLoading,
    createDefaultPipeline,
    isCreating: isCreatingDefault
  } = useDefaultPipeline();

  // Determine which pipeline to use
  const effectivePipeline = job?.pipelineId ? jobPipeline : defaultPipeline;
  
  const { 
    data: jobApplicationsData, 
    isLoading: applicationsLoading, 
    error: applicationsError,
    refetch: refetchApplications
  } = useJobApplicationsByJob(jobId || '');
  
  const updateJobApplicationMutation = useUpdateJobApplication();
  const deleteJobApplicationMutation = useDeleteJobApplication();
  
  // Stage movement hook for tracking candidate movements
  const stageMovement = useStageMovement();
  const optimisticStageMovement = useOptimisticStageMovement(jobId || '');
  
  const { data: taskStats } = useTaskStats(jobId || '');
  const { data: interviewsData } = useInterviews(jobId ? { jobId } : undefined);
  const { data: reportData, isLoading: reportLoading, error: reportError } = useJobReport(jobId || '');
  
  // Confirmation dialog state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [candidateToRemove, setCandidateToRemove] = useState<any>(null);

  // Pipeline states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  
  // Calendar view states (for tasks only)
  const [tasksView, setTasksView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get job applications from React Query data
  const jobApplications = jobApplicationsData?.applications || [];
  
  // Loading state
  const loading = jobLoading || applicationsLoading || pipelineLoading || defaultPipelineLoading;

  // Handler for creating default pipeline
  const handleCreateDefaultPipeline = async () => {
    try {
      await createDefaultPipeline();
      toast.success('Pipeline Created', 'Default recruitment pipeline has been created successfully.');
    } catch (error) {
      toast.error('Creation Failed', 'Failed to create default pipeline. Please try again.');
    }
  };  // Helper function to map backend stage to frontend stage
  const mapStageToFrontend = (backendStage: string) => {
    const stageMap: Record<string, string> = {
      'Application': 'Applied',
      'Screening': 'Phone Screen',
      'Interview': 'Technical Interview',
      'Decision': 'Final Interview',
      'Offer': 'Offer',
      'Hired': 'Hired',
    };
    return stageMap[backendStage] || 'Applied';
  };
  // Helper function to generate initials from name
  const getInitials = (fullName: string) => {
    if (!fullName || fullName.trim() === '') return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Convert job applications to candidates format for the ATS components
  const candidates = jobApplications.map(application => {
    
    const candidateName = application.candidate?.fullName || 'Unknown Candidate';
    
    // Use pipeline stage name if available, otherwise fall back to mapped stage
    const candidateStage = application.currentPipelineStageName 
      ? application.currentPipelineStageName 
      : mapStageToFrontend(application.stage || 'Application');
    
    
    return {
      id: application.candidate?.id || application.candidateId,
      name: candidateName,
      avatar: application.candidate?.avatar || '', // Keep empty string if no avatar
      initials: getInitials(candidateName), // Add initials for fallback
      email: application.candidate?.email || '',
      phone: application.candidate?.phone || '',
      location: application.candidate?.location || '',
      stage: candidateStage,
      score: application.score || 0,
      lastUpdated: application.lastActivityDate || application.updatedAt,
      tags: [], // Empty array for now since skills aren't being loaded
      source: application.candidate?.source || 'unknown',
      appliedDate: application.appliedDate,
      // Additional properties for compatibility
      position: application.candidate?.currentPosition || '',
      status: application.status,
      notes: application.notes || '',
      resumeUrl: application.resumeUrl || '',
      portfolioUrl: application.portfolioUrl || '',
      applicationId: application.id,
      // Pipeline tracking information
      currentPipelineStageId: application.currentPipelineStageId,
      pipelineId: application.pipelineId,
    };
  });

  
  // Helper function to map frontend stage back to backend stage
  const mapStageToBackend = (frontendStage: string) => {
    const stageMap: Record<string, string> = {
      'Applied': 'Application',
      'Phone Screen': 'Screening',
      'Technical Interview': 'Interview',
      'Final Interview': 'Decision',
      'Offer': 'Offer',
      'Hired': 'Hired',
    };
    return stageMap[frontendStage] || 'Application';
  };  const handleCandidateUpdate = async (updatedCandidate: any) => {
    // Find the current candidate in our local data
    const currentApplication = jobApplications.find(app => 
      app.candidate?.id === updatedCandidate.id || app.candidateId === updatedCandidate.id
    );
    
    if (!currentApplication) {
      console.error('Could not find application for candidate:', updatedCandidate.id);
      return;
    }

    // Check if this is a stage change - use pipeline stage name if available
    const currentStage = currentApplication.currentPipelineStageName 
      ? currentApplication.currentPipelineStageName 
      : mapStageToFrontend(currentApplication.stage || 'Application');
    const isStageChange = currentStage !== updatedCandidate.stage;

    if (isStageChange && effectivePipeline) {
      // Handle stage change with proper tracking
      const newStageBackend = mapStageToBackend(updatedCandidate.stage);
      const newStage = effectivePipeline.stages?.find(s => s.name === updatedCandidate.stage);
      
      if (newStage) {
        try {
          await stageMovement.moveWithDefaults(
            currentApplication.id,
            newStage.id,
            {
              reason: StageChangeReason.MANUAL_MOVE,
              notes: `Moved from "${currentStage}" to "${updatedCandidate.stage}" manually`,
              metadata: {
                moveType: 'manual',
                fromStage: currentStage,
                toStage: updatedCandidate.stage,
              }
            }
          );
          
          // Explicitly refetch job applications to ensure UI updates
          await refetchApplications();
          
          // Show success message
          toast.success('Stage Updated', `${updatedCandidate.name} moved to ${updatedCandidate.stage}`);
          
        } catch (error) {
          console.error('Error moving candidate stage:', error);
          toast.error('Move Failed', 'Failed to move candidate. Please try again.');
          return;
        }
      }
    }

    // Handle other property updates (score, notes, status) that aren't stage changes
    const hasOtherUpdates = 
      updatedCandidate.score !== (currentApplication.score || 0) ||
      updatedCandidate.notes !== (currentApplication.notes || '') ||
      updatedCandidate.status !== currentApplication.status;

    if (hasOtherUpdates) {
      try {
        await updateJobApplicationMutation.mutateAsync({
          id: currentApplication.id,
          data: {
            status: updatedCandidate.status,
            stage: isStageChange ? mapStageToBackend(updatedCandidate.stage) as 'Application' | 'Screening' | 'Interview' | 'Decision' | 'Offer' | 'Hired' : currentApplication.stage,
            score: updatedCandidate.score,
            notes: updatedCandidate.notes,
          }
        });
        
        // Show success message for non-stage updates
        if (!isStageChange) {
          toast.success('Candidate Updated', 'Candidate information has been updated successfully.');
        }
        
      } catch (error) {
        console.error('Error updating candidate:', error);
        toast.error('Update Failed', 'Failed to update candidate. Please try again.');
      }
    }
  };

  const handleCandidateAdded = async () => {
    // Refetch job applications when a new candidate is added
    refetchApplications();
  };

  const handleCandidateRemove = async (candidate: any) => {
    // Find the application for this candidate
    const application = jobApplications.find(app => 
      app.candidate?.id === candidate.id || app.candidateId === candidate.id
    );
    
    if (!application) {
      console.error('Could not find application for candidate:', candidate.id);
      toast.error('Error', 'Failed to find candidate application. Please try again.');
      return;
    }

    // Set candidate for removal and show confirmation dialog
    setCandidateToRemove({ candidate, application });
    setShowDeleteConfirmation(true);
  };

  const handleConfirmRemove = async () => {
    if (!candidateToRemove) return;

    const { candidate, application } = candidateToRemove;

    try {
      // Delete using React Query mutation
      await deleteJobApplicationMutation.mutateAsync(application.id);
      
      // Close dialog and reset state
      setShowDeleteConfirmation(false);
      setCandidateToRemove(null);
      
      // Show success message
      toast.success('Candidate Removed', `${candidate.name} has been removed from this job.`);
      
    } catch (error) {
      console.error('Error removing candidate:', error);
      toast.error('Error', 'Failed to remove candidate. Please try again.');
    }
  };

  const handleCancelRemove = () => {
    setShowDeleteConfirmation(false);
    setCandidateToRemove(null);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
	setCurrentDate(prev => {
	  const newDate = new Date(prev);
	  if (direction === 'prev') {
		newDate.setMonth(prev.getMonth() - 1);
	  } else {
		newDate.setMonth(prev.getMonth() + 1);
	  }
	  return newDate;
	});
  };

  const handleToday = () => {
	setCurrentDate(new Date());
  };

  // Handle drag-and-drop stage changes specifically
  const handleCandidateStageChange = async (candidateId: string, newStage: string) => {
    // Find the current candidate in our local data
    const currentApplication = jobApplications.find(app => 
      app.candidate?.id === candidateId || app.candidateId === candidateId
    );
    
    if (!currentApplication || !effectivePipeline) {
      console.error('Could not find application or pipeline for candidate:', candidateId);
      toast.error('Move Failed', 'Could not find candidate or pipeline information.');
      return;
    }

    // Get current and new stages - use pipeline stage name if available
    const currentStage = currentApplication.currentPipelineStageName 
      ? currentApplication.currentPipelineStageName 
      : mapStageToFrontend(currentApplication.stage || 'Application');
    const newStageData = effectivePipeline.stages?.find(s => s.name === newStage);
    
    if (!newStageData) {
      console.error('Could not find stage in pipeline:', newStage);
      toast.error('Move Failed', 'Could not find the target stage.');
      return;
    }

    if (currentStage === newStage) {
      // No change needed
      return;
    }

    try {
      await optimisticStageMovement.mutateAsync({
        candidateId: candidateId,
        applicationId: currentApplication.id,
        newStageId: newStageData.id,
        currentStage: currentStage,
        newStage: newStage
      });
      
      // Note: optimistic hook handles all cache updates automatically
      // Show success message
      toast.success('Stage Updated', `Candidate moved to ${newStage}`);
      
    } catch (error) {
      console.error('Error moving candidate via drag and drop:', error);
      toast.error('Move Failed', 'Failed to move candidate. Please try again.');
    }
  };

  if (loading) {
	return (
	  <div className="p-6 bg-gray-50 min-h-screen">
		<div className="text-center py-12">
		  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
		  <p className="text-gray-500">Loading job details...</p>
		</div>
	  </div>
	);
  }

  if (!job) {
	return (
	  <div className="p-6 bg-gray-50 min-h-screen">
		<div className="text-center py-12">
		  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
		  <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
		  <p className="text-gray-500 mb-4">The job you're looking for doesn't exist.</p>
		  <Link 
			to="/dashboard/organizations" 
			className="text-purple-600 hover:text-purple-700 font-medium"
		  >
			← Back to Organizations
		  </Link>
		</div>
	  </div>
	);
  }

  return (
	<div className="p-6 bg-gray-50 min-h-screen">
	  {/* Breadcrumbs */}
	  <div className="flex items-center text-sm text-gray-500 mb-4">
		<Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
		<span className="mx-2">/</span>
		<Link to="/dashboard/organizations" className="hover:text-gray-700">Organizations</Link>
		<span className="mx-2">/</span>
		<Link to={`/dashboard/organizations/${organizationId}`} className="hover:text-gray-700">
		  Organization
		</Link>
		<span className="mx-2">/</span>
		<Link to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs`} className="hover:text-gray-700">
		  {job.department}
		</Link>
		<span className="mx-2">/</span>
		<span className="text-gray-900 font-medium">ATS - {job.title}</span>
	  </div>

	  {/* Header */}
	  <div className="flex items-center justify-between mb-6">
		<div className="flex items-center">
		  <Link 
			to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs`}
			className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
		  >
			<ArrowLeft className="w-5 h-5" />
		  </Link>
		  <div>
			<h1 className="text-2xl font-bold text-gray-900">ATS Pipeline</h1>
			<p className="text-gray-600 mt-1">Managing candidates for this specific job</p>
		  </div>
		</div>
				{effectivePipeline && (
				  <button 
					onClick={() => setShowAddCandidateModal(true)}
					className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center transition-colors mr-3"
				  >
					<Plus className="w-4 h-4 mr-2" />
					Add Candidate
				  </button>
				)}
		
	  </div>

	  {/* Job Info Card */}
	  <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
		<div className="flex items-center justify-between">
		  <div className="flex items-center">
			<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
			  <Briefcase className="w-6 h-6 text-purple-600" />
			</div>
			<div className="ml-4">
			  <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
			  <p className="text-gray-600">{job.department} • {job.location} • {job.type}</p>		  <p className="text-gray-500 text-sm">
		    Status: {job.status} • Experience Level: {job.experienceLevel || 'Not specified'}
		    {effectivePipeline && <span> • Pipeline: {effectivePipeline.name}</span>}
		  </p>
			</div>
		  </div>		  <div className="text-right">
			<p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
			<p className="text-sm text-gray-500">Total Candidates</p>
		  </div>
		</div>
	  </div>

	  {/* No Pipeline Warning */}
	  {job && !job.pipelineId && !effectivePipeline && !defaultPipelineLoading && (
		<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
		  <div className="flex items-center justify-between">
			<div className="flex items-center">
			  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
				<AlertCircle className="w-6 h-6 text-yellow-600" />
			  </div>
			  <div className="ml-4">
				<h3 className="text-lg font-medium text-yellow-800">No Pipeline Assigned</h3>
				<p className="text-yellow-700">
				  This job doesn't have a recruitment pipeline assigned. Create a default pipeline to start managing candidates.
				</p>
			  </div>
			</div>
			<button
			  onClick={handleCreateDefaultPipeline}
			  disabled={isCreatingDefault}
			  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center transition-colors disabled:opacity-50"
			>
			  {isCreatingDefault ? (
				<>
				  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
				  Creating...
				</>
			  ) : (
				<>
				  <Plus className="w-4 h-4 mr-2" />
				  Create Default Pipeline
				</>
			  )}
			</button>
		  </div>
		</div>
	  )}

	  {/* Tab Navigation */}
	  <div className="bg-white rounded-lg shadow-sm border mb-6">
		<div className="flex space-x-0 border-b border-gray-200">
		  <button
			onClick={() => setActiveTab('pipeline')}
			className={`px-6 py-3 text-sm font-medium flex items-center ${
			  activeTab === 'pipeline'
				? 'border-b-2 border-purple-500 text-purple-600'
				: 'text-gray-500 hover:text-gray-700'
			}`}		  >
			<Users className="w-4 h-4 mr-2" />
			Pipeline ({candidates.length})
		  </button>
		  <button
			onClick={() => setActiveTab('tasks')}
			className={`px-6 py-3 text-sm font-medium flex items-center ${
			  activeTab === 'tasks'
				? 'border-b-2 border-purple-500 text-purple-600'
				: 'text-gray-500 hover:text-gray-700'
			}`}
		  >
			<CheckCircle className="w-4 h-4 mr-2" />
			Tasks ({taskStats?.total || 0})
		  </button>
		  <button
			onClick={() => setActiveTab('interviews')}
			className={`px-6 py-3 text-sm font-medium flex items-center ${
			  activeTab === 'interviews'
				? 'border-b-2 border-purple-500 text-purple-600'
				: 'text-gray-500 hover:text-gray-700'
			}`}
		  >
			<Calendar className="w-4 h-4 mr-2" />
			Interviews ({interviewsData?.interviews?.length || 0})
		  </button>
		  <button
			onClick={() => setActiveTab('reports')}
			className={`px-6 py-3 text-sm font-medium flex items-center ${
			  activeTab === 'reports'
				? 'border-b-2 border-purple-500 text-purple-600'
				: 'text-gray-500 hover:text-gray-700'
			}`}
		  >
			<BarChart3 className="w-4 h-4 mr-2" />
			Reports
		  </button>
		</div>
	  </div>	 
	   {/* Tab Content */}
	  {effectivePipeline ? (
		<>
		  <div style={{ display: activeTab === 'pipeline' ? 'block' : 'none' }}>
			<PipelineTab 
			  candidates={candidates}
			  pipeline={effectivePipeline}
			  searchQuery={searchQuery}
			  onSearchChange={setSearchQuery}
			  selectedStage={selectedStage}
			  onStageChange={setSelectedStage}
			  sortBy={sortBy}
			  onSortChange={setSortBy}
			  onCandidateUpdate={handleCandidateUpdate}
			  onCandidateRemove={handleCandidateRemove}
			  onCandidateStageChange={handleCandidateStageChange}
			/>
		  </div>

		  <div style={{ display: activeTab === 'tasks' ? 'block' : 'none' }}>
			<TasksTab 
			  jobId={jobId!}
			  tasksView={tasksView}
			  onTasksViewChange={setTasksView}
			  currentDate={currentDate}
			  onNavigateMonth={navigateMonth}
			  onToday={handleToday}
			  pipelineId={effectivePipeline?.id}
			/>
		  </div>

		  <div style={{ display: activeTab === 'interviews' ? 'block' : 'none' }}>
			<InterviewsTab 
			  jobId={jobId!}
			  onInterviewClick={(interview) => {
				// Handle interview click if needed
			  }}
			  pipelineId={effectivePipeline?.id}
			/>
		  </div>

		  <div style={{ display: activeTab === 'reports' ? 'block' : 'none' }}>
			<ReportsTab 
			  reportData={reportData || null}
			  loading={reportLoading}
			  error={reportError}
			/>
		  </div>
		</>
	  ) : (
		<div className="text-center py-12">
		  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
		  <h3 className="text-lg font-medium text-gray-900 mb-2">Pipeline Required</h3>
		  <p className="text-gray-500 mb-4">
			Please create a default pipeline to start managing candidates for this job.
		  </p>
		</div>
	  )}

	  {/* Add Candidate Modal */}
	  {effectivePipeline && (
		<AddCandidateModal
		  isOpen={showAddCandidateModal}
		  onClose={() => setShowAddCandidateModal(false)}
		  jobId={jobId!}
		  onCandidateAdded={handleCandidateAdded}
		  pipeline={effectivePipeline}
		/>
	  )}

	  {/* Remove Candidate Confirmation Dialog */}
	  <ConfirmationDialog
		isOpen={showDeleteConfirmation}
		onClose={handleCancelRemove}
		onConfirm={handleConfirmRemove}
		title="Remove Candidate"
		message={
		  candidateToRemove 
			? `Are you sure you want to remove ${candidateToRemove.candidate.name} from this job? This action cannot be undone.`
			: "Are you sure you want to remove this candidate?"
		}
		confirmText="Remove"
		cancelText="Cancel"
		loading={deleteJobApplicationMutation.isPending}
		variant="danger"
	  />

	  {/* Toast Container */}
	  <ToastContainer position="top-right" />
	</div>
  );
};

export default JobATSPage;
