import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Briefcase, Users, CheckCircle, BarChart3, Calendar, Plus, AlertCircle, RefreshCw, Eye, MessageSquare
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useJob } from '../../../hooks/useJobs';
import { useExternalJobDetail } from '../../../hooks/useExternalJobs';
import { usePipeline } from '../../../hooks/usePipelines';
import { useDefaultPipeline } from '../../../hooks/useDefaultPipeline';
import { useJobApplicationsByJob, useUpdateJobApplication, useDeleteJobApplication } from '../../../hooks/useJobApplications';
import { useCandidate } from '../../../hooks/useCandidates';
import { useStageMovement } from '../../../hooks/useStageMovement';
import { useOptimisticStageMovement } from '../../../hooks/useOptimisticStageMovement';
import { useTaskStats } from '../../../hooks/useTasks';
import { useInterviews } from '../../../hooks/useInterviews';
import { useJobReport } from '../../../hooks/useReports';
import { useAuthContext } from '../../../contexts/AuthContext';
import { isExternalUser } from '../../../utils/userUtils';
import { StageChangeReason } from '../../../types/stageMovement.types';
import { useHiringTeam, useTeamMembers } from '../../../hooks/useHiringTeam';
import type { Job as JobType } from '../../data/types';
import type { JobApplication } from '../../../services/jobApplicationApiService';
import { PipelineTab, TasksTab, InterviewsTab, ReportsTab } from '../components/ats';
import AddCandidateModal from '../components/AddCandidateModal';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import ToastContainer, { toast } from '../../../components/ToastContainer';
import ProfileSidePanel, { type UserStructuredData, type PanelState } from '../../../components/ProfileSidePanel';
import JobPreviewModal from '../../../components/modals/JobPreviewModal';
import CollaborativeSidePanel, { type CollaborativePanelState, type TeamMember } from '../../../components/CollaborativeSidePanel';
import { useJobComments, useCreateComment, useUpdateComment, useDeleteComment, useAddReaction, useRemoveReaction } from '../../../hooks/useJobComments';

const JobATSPage: React.FC = () => {
  const { organizationId, departmentId, jobId } = useParams<{ 
	organizationId: string; 
	departmentId: string; 
	jobId: string; 
  }>();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'tasks' | 'interviews' | 'reports'>('pipeline');
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showJobPreviewModal, setShowJobPreviewModal] = useState(false);
  
  // State for the profile side panel
  const [selectedUserDataForPanel, setSelectedUserDataForPanel] = useState<UserStructuredData | null>(null);
  const [panelState, setPanelState] = useState<PanelState>('closed');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  
  // State for the collaborative side panel
  const [collaborativePanelState, setCollaborativePanelState] = useState<CollaborativePanelState>('closed');
  
  // Determine if current user is external and use appropriate hook
  const isExternal = isExternalUser(user);
  
  // Use React Query hooks - choose the right job fetching hook based on user type
  const { 
    data: internalJob, 
    isLoading: internalJobLoading, 
    error: internalJobError 
  } = useJob(isExternal ? '' : (jobId || ''));
  
  const { 
    data: externalJob, 
    isLoading: externalJobLoading, 
    error: externalJobError 
  } = useExternalJobDetail(isExternal ? (jobId || '') : '');

  // Use the appropriate job data
  const job = isExternal ? externalJob : internalJob;
  const jobLoading = isExternal ? externalJobLoading : internalJobLoading;
  const jobError = isExternal ? externalJobError : internalJobError;
  
  // Get the pipeline for this job, or use default if none specified
  // For external users, the pipeline should already be loaded with the job
  const {
    data: jobPipeline,
    isLoading: pipelineLoading,
    error: pipelineError
  } = usePipeline(job?.pipelineId && !job?.pipeline ? (job.pipelineId || '') : '');

  // Get or create default pipeline if no pipeline is assigned to job
  const {
    defaultPipeline,
    isLoading: defaultPipelineLoading,
    createDefaultPipeline,
    isCreating: isCreatingDefault
  } = useDefaultPipeline();

  // Determine which pipeline to use - prefer the one loaded with the job
  const effectivePipeline = job?.pipeline || (job?.pipelineId ? jobPipeline : defaultPipeline);

  // Debug logging
  console.log('JobATSPage Debug:', {
    isExternal,
    jobId,
    job: job ? { 
      id: job.id, 
      title: job.title, 
      pipelineId: job.pipelineId,
      pipeline: job.pipeline ? { id: job.pipeline.id, name: job.pipeline.name, stagesCount: job.pipeline.stages?.length } : null 
    } : null,
    jobLoading,
    jobError,
    effectivePipeline: effectivePipeline ? { 
      id: effectivePipeline.id, 
      name: effectivePipeline.name, 
      stagesCount: effectivePipeline.stages?.length 
    } : null,
    pipelineLoading,
    defaultPipelineLoading
  });
  
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
  
  // Fetch detailed candidate data when a candidate is selected for the profile panel
  const { 
    data: selectedCandidateDetails, 
    isLoading: candidateDetailsLoading,
    error: candidateDetailsError 
  } = useCandidate(selectedCandidateId || '');
  
  // Collaborative panel hooks
  const { data: comments = [], isLoading: commentsLoading } = useJobComments(jobId || '');
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const addReactionMutation = useAddReaction();
  const removeReactionMutation = useRemoveReaction();
  
  // Team member hooks
  const { data: hiringTeam } = useHiringTeam(job?.hiringTeamId || '');
  const { data: teamMembersData = [] } = useTeamMembers(job?.hiringTeamId || '');
  
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
      
      // Invalidate all related queries after pipeline creation
      await invalidateAllQueries();
      
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

  // Transform hiring team members to TeamMember format for CollaborativeSidePanel
  const teamMembers: TeamMember[] = teamMembersData.map(member => {
    const fullName = member.memberType === 'internal' && member.user
      ? `${member.user.firstName} ${member.user.lastName}`
      : `${member.externalFirstName || ''} ${member.externalLastName || ''}`.trim();
    
    const email = member.memberType === 'internal' && member.user
      ? member.user.email
      : member.externalEmail || '';

    return {
      id: member.id,
      name: fullName || 'Unknown Member',
      email: email,
      avatar: member.user?.avatar,
      role: member.teamRole,
      isOnline: false, // This would need to be implemented with real-time status if needed
    };
  });

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
      tags: application.candidate?.skillMappings?.map(sm => sm.skill?.name).filter(Boolean) || [], // Map skills from skill mappings
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
      // Full candidate data for ProfileSidePanel
      fullName: application.candidate?.fullName,
      firstName: application.candidate?.firstName,
      lastName: application.candidate?.lastName,
      linkedIn: application.candidate?.linkedIn,
      github: application.candidate?.github,
      website: application.candidate?.website,
      summary: application.candidate?.summary,
      experience: application.candidate?.experience,
      education: application.candidate?.education,
      skills: application.candidate?.skillMappings?.map(sm => sm.skill?.name).filter(Boolean) || [],
      projects: application.candidate?.projects,
      certifications: application.candidate?.certifications,
      awards: application.candidate?.awards,
      interests: application.candidate?.interests,
      languages: application.candidate?.languages,
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
          
          // Invalidate all related queries to ensure consistency
          await invalidateAllQueries();
          
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
        
        // Invalidate all related queries to ensure consistency
        await invalidateAllQueries();
        
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
    // Invalidate all queries when a new candidate is added
    await invalidateAllQueries();
  };

  // Function to handle opening the profile panel for a candidate
  const handleOpenProfilePanel = (candidateData: any) => {
    console.log('Opening profile panel with candidate data:', candidateData);
    
    // Store the candidate ID to trigger data fetching
    const candidateId = candidateData.id;
    if (candidateId) {
      setSelectedCandidateId(candidateId);
      setPanelState('expanded');
    } else {
      console.error('No candidate ID found in candidate data:', candidateData);
    }
  };

  const handlePanelStateChange = (newState: PanelState) => {
    setPanelState(newState);
    if (newState === 'closed') {
      setSelectedUserDataForPanel(null);
      setSelectedCandidateId(null);
    }
  };

  // Collaborative panel handlers
  const handleCollaborativePanelStateChange = (newState: CollaborativePanelState) => {
    setCollaborativePanelState(newState);
  };

  const handlePostComment = async (content: string, parentId?: string, taggedCandidateIds?: string[]) => {
    if (!jobId) return;
    
    try {
      await createCommentMutation.mutateAsync({
        jobId,
        content,
        parentId,
        taggedCandidateIds,
      });
      toast.success('Comment Posted', 'Your comment has been posted successfully.');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Post Failed', 'Failed to post comment. Please try again.');
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        data: { content },
      });
      toast.success('Comment Updated', 'Your comment has been updated successfully.');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Update Failed', 'Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
      toast.success('Comment Deleted', 'Your comment has been deleted successfully.');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Delete Failed', 'Failed to delete comment. Please try again.');
    }
  };

  const handleAddReaction = async (commentId: string, emoji: string) => {
    try {
      await addReactionMutation.mutateAsync({
        commentId,
        emoji,
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Reaction Failed', 'Failed to add reaction. Please try again.');
    }
  };

  const handleRemoveReaction = async (commentId: string, emoji: string) => {
    try {
      await removeReactionMutation.mutateAsync({
        commentId,
        emoji,
      });
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast.error('Reaction Failed', 'Failed to remove reaction. Please try again.');
    }
  };

  // Effect to transform candidate data when fetched
  useEffect(() => {
    if (selectedCandidateDetails && selectedCandidateId) {
      console.log('Transforming candidate details:', selectedCandidateDetails);
      
      const userDataForPanel = {
        personalInfo: {
          fullName: selectedCandidateDetails.fullName || 'Unknown Candidate',
          email: selectedCandidateDetails.email || '',
          phone: selectedCandidateDetails.phone || '',
          location: selectedCandidateDetails.location || '',
          linkedIn: selectedCandidateDetails.linkedIn || '',
          github: selectedCandidateDetails.github || '',
          website: selectedCandidateDetails.website || '',
          avatar: selectedCandidateDetails.avatar || undefined,
        },
        summary: selectedCandidateDetails.summary || '',
        experience: Array.isArray(selectedCandidateDetails.experience) 
          ? selectedCandidateDetails.experience.map((exp: any) => ({
              position: exp.position || '',
              company: exp.company || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              location: exp.location || '',
              description: exp.description || '',
              responsibilities: exp.responsibilities || [],
              achievements: exp.achievements || [],
            }))
          : [],
        skills: Array.isArray(selectedCandidateDetails.skillMappings) 
          ? selectedCandidateDetails.skillMappings.map((sm: any) => sm.skill?.name).filter(Boolean)
          : (selectedCandidateDetails.skills || []),
        education: Array.isArray(selectedCandidateDetails.education) 
          ? selectedCandidateDetails.education.map((edu: any) => ({
              degree: edu.degree || '',
              institution: edu.institution || '',
              startDate: edu.startDate || '',
              endDate: edu.endDate || '',
              graduationDate: edu.graduationDate || '',
              location: edu.location || '',
              description: edu.description || '',
              major: edu.major || '',
              courses: edu.courses || [],
              honors: edu.honors || [],
            }))
          : [],
        projects: Array.isArray(selectedCandidateDetails.projects)
          ? selectedCandidateDetails.projects.map((proj: any) => ({
              name: proj.name || '',
              date: proj.date || '',
              description: proj.description || '',
              technologies: proj.technologies || [],
              url: proj.url || '',
            }))
          : [],
        certifications: Array.isArray(selectedCandidateDetails.certifications)
          ? selectedCandidateDetails.certifications.map((cert: any) => ({
              name: cert.name || '',
              issuer: cert.issuer || '',
              dateIssued: cert.dateIssued || '',
              expirationDate: cert.expirationDate || '',
            }))
          : [],
        awards: Array.isArray(selectedCandidateDetails.awards)
          ? selectedCandidateDetails.awards.map((award: any) => ({
              name: award.name || '',
              issuer: award.issuer || '',
              date: award.date || '',
              description: award.description || '',
            }))
          : [],
        interests: selectedCandidateDetails.interests || [],
        languages: selectedCandidateDetails.languages || [],
      } as UserStructuredData;

      console.log('Transformed user data for panel:', userDataForPanel);
      setSelectedUserDataForPanel(userDataForPanel);
    }
  }, [selectedCandidateDetails, selectedCandidateId]);

  // Comprehensive function to invalidate all relevant queries
  const invalidateAllQueries = async () => {
    await Promise.all([
      // Job-related queries
      queryClient.invalidateQueries({ queryKey: ['job', jobId] }),
      queryClient.invalidateQueries({ queryKey: ['externalJob', jobId] }),
      
      // Pipeline-related queries
      queryClient.invalidateQueries({ queryKey: ['pipeline'] }),
      queryClient.invalidateQueries({ queryKey: ['defaultPipeline'] }),
      
      // Job applications and candidates
      queryClient.invalidateQueries({ queryKey: ['jobApplications', jobId] }),
      queryClient.invalidateQueries({ queryKey: ['candidates'] }),
      
      // Tasks and task statistics
      queryClient.invalidateQueries({ queryKey: ['tasks', jobId] }),
      queryClient.invalidateQueries({ queryKey: ['taskStats', jobId] }),
      
      // Interviews
      queryClient.invalidateQueries({ queryKey: ['interviews', { jobId }] }),
      queryClient.invalidateQueries({ queryKey: ['interviews'] }),
      
      // Reports
      queryClient.invalidateQueries({ queryKey: ['jobReport', jobId] }),
      queryClient.invalidateQueries({ queryKey: ['reports'] }),
      
      // Stage movements and tracking
      queryClient.invalidateQueries({ queryKey: ['stageMovements'] }),
      
      // Organization and department data that might affect the job view
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId] }),
      queryClient.invalidateQueries({ queryKey: ['department', departmentId] }),
    ]);
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await invalidateAllQueries();
      toast.success('Data Refreshed', 'All job data has been refreshed successfully.');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Refresh Failed', 'Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
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
      
      // Invalidate all related queries to ensure consistency
      await invalidateAllQueries();
      
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
      
      // Invalidate all related queries to ensure consistency
      await invalidateAllQueries();
      
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
	<div className={`p-6 bg-gray-50 min-h-screen transition-all duration-300 ${
      // Calculate margins for both panels
      (() => {
        const profileMargin = panelState === 'expanded' ? 'mr-[33.333333%]' : 
                             panelState === 'collapsed' ? 'mr-[16.666667%]' : '';
        const collabMargin = collaborativePanelState === 'expanded' ? 
                            (profileMargin ? 'mr-[66.666667%]' : 'mr-[33.333333%]') :
                            collaborativePanelState === 'collapsed' ? 
                            (profileMargin ? 'mr-[50%]' : 'mr-[16.666667%]') : 
                            profileMargin;
        return collabMargin;
      })()
    }`}>
	  {/* Breadcrumbs - Only show for internal users */}
	  {!isExternal && (
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
	  )}

	  {/* Header */}
	  <div className="flex items-center justify-between mb-6">
		<div className="flex items-center">
		  {/* Back button - Only show for internal users */}
		  {!isExternal && (
			<Link 
			  to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs`}
			  className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
			>
			  <ArrowLeft className="w-5 h-5" />
			</Link>
		  )}
		  {/* For external users, show a back button to their jobs page */}
		  {isExternal && (
			<Link 
			  to="/external/jobs"
			  className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
			>
			  <ArrowLeft className="w-5 h-5" />
			</Link>
		  )}
		  <div>
			<h1 className="text-2xl font-bold text-gray-900">
			  {isExternal ? 'Job Applications' : 'ATS Pipeline'}
			</h1>
			<p className="text-gray-600 mt-1">
			  {isExternal ? 'View and manage candidates for this job' : 'Managing candidates for this specific job'}
			</p>
		  </div>
		</div>
		{/* Action buttons */}
		<div className="flex items-center space-x-3">
		  {/* View Job button */}
		  <button 
			onClick={() => setShowJobPreviewModal(true)}
			className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md flex items-center transition-colors"
			title="View job details"
		  >
			<Eye className="w-4 h-4 mr-2" />
			View Job
		  </button>
		  
		  {/* Refresh button */}
		  <button 
			onClick={handleRefreshData}
			disabled={isRefreshing}
			className={`bg-white text-purple-600 border border-purple-600 hover:text-purple-800 px-3 py-2 rounded-md flex items-center transition-colors ${
			  isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
			}`}
			title="Refresh all data"
		  >
			<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
		  </button>
		  
		  {/* Team Notes button */}
		  <button 
			onClick={() => handleCollaborativePanelStateChange('expanded')}
			className="bg-white text-green-600 border border-green-600 hover:bg-green-50 px-4 py-2 rounded-md flex items-center transition-colors"
			title="Team collaboration and notes"
		  >
			<MessageSquare className="w-4 h-4 mr-2" />
			Team Notes
		  </button>
		  
		  {/* Add Candidate button - Available for all users */}
		  {effectivePipeline && (
			<button 
			  onClick={() => setShowAddCandidateModal(true)}
			  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
			>
			  <Plus className="w-4 h-4 mr-2" />
			  Add Candidate
			</button>
		  )}
		</div>
		
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
		  </div>		  <div className="flex items-center space-x-4">
			<div className="text-right">
			  <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
			  <p className="text-sm text-gray-500">Total Candidates</p>
			</div>
			<button
			  onClick={() => setShowJobPreviewModal(true)}
			  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
			  title="View job details"
			>
			  <Eye className="w-5 h-5" />
			</button>
		  </div>
		</div>
	  </div>

	  {/* No Pipeline Warning - Only allow internal users to create default pipeline */}
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
				  {isExternal 
					? 'This job doesn\'t have a recruitment pipeline assigned. Please contact your hiring manager.'
					: 'This job doesn\'t have a recruitment pipeline assigned. Create a default pipeline to start managing candidates.'
				  }
				</p>
			  </div>
			</div>
			{/* Only show create button for internal users */}
			{!isExternal && (
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
			)}
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
			  pipeline={effectivePipeline as any}
			  searchQuery={searchQuery}
			  onSearchChange={setSearchQuery}
			  selectedStage={selectedStage}
			  onStageChange={setSelectedStage}
			  sortBy={sortBy}
			  onSortChange={setSortBy}
			  onCandidateClick={handleOpenProfilePanel}
			  onCandidateUpdate={handleCandidateUpdate}
			  onCandidateRemove={handleCandidateRemove}
			  onCandidateStageChange={handleCandidateStageChange}
			  onDataChange={invalidateAllQueries}
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
			  onDataChange={invalidateAllQueries}
			/>
		  </div>

		  <div style={{ display: activeTab === 'interviews' ? 'block' : 'none' }}>
			<InterviewsTab 
			  jobId={jobId!}
			  onInterviewClick={(interview) => {
				// Handle interview click if needed
			  }}
			  pipelineId={effectivePipeline?.id}
			  onDataChange={invalidateAllQueries}
			/>
		  </div>

		  <div style={{ display: activeTab === 'reports' ? 'block' : 'none' }}>
			<ReportsTab 
			  reportData={reportData || null}
			  loading={reportLoading}
			  error={reportError}
			  onDataChange={invalidateAllQueries}
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
		  pipeline={effectivePipeline as any}
		  onDataChange={invalidateAllQueries}
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

	  {/* Profile Side Panel */}
	  {panelState !== 'closed' && (
		<>
		  {/* Overlay - only show for expanded state */}
		  {panelState === 'expanded' && (
			<div
			  className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300 ease-in-out"
			  onClick={() => handlePanelStateChange('closed')}
			  aria-hidden="true"
			></div>
		  )}
		  
		  {/* Show loading state while candidate details are being fetched */}
		  {candidateDetailsLoading ? (
			<div className="fixed inset-y-0 right-0 w-1/3 bg-white shadow-2xl z-50 flex items-center justify-center">
			  <div className="text-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
				<p className="text-gray-500">Loading candidate details...</p>
			  </div>
			</div>
		  ) : candidateDetailsError ? (
			<div className="fixed inset-y-0 right-0 w-1/3 bg-white shadow-2xl z-50 flex items-center justify-center">
			  <div className="text-center text-red-600">
				<p className="mb-2">Failed to load candidate details</p>
				<button 
				  onClick={() => handlePanelStateChange('closed')}
				  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
				>
				  Close
				</button>
			  </div>
			</div>
		  ) : (
			<ProfileSidePanel
			  userData={selectedUserDataForPanel}
			  panelState={panelState}
			  onStateChange={handlePanelStateChange}
			/>
		  )}
		</>
	  )}

	  {/* Collaborative Side Panel */}
	  {collaborativePanelState !== 'closed' && (
		<>
		  {/* Overlay for collaborative panel - only show for expanded state when profile panel is not open */}
		  {collaborativePanelState === 'expanded' && panelState === 'closed' && (
			<div
			  className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300 ease-in-out"
			  onClick={() => handleCollaborativePanelStateChange('closed')}
			  aria-hidden="true"
			></div>
		  )}
		  
		  <CollaborativeSidePanel
			jobId={jobId || ''}
			comments={comments}
			teamMembers={teamMembers}
			candidates={candidates.map(candidate => ({
			  id: candidate.id,
			  name: candidate.name,
			  avatar: candidate.avatar,
			  stage: candidate.stage,
			  email: candidate.email
			}))}
			currentUserId={user?.id || ''}
			currentUserName={user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
			currentUserAvatar={user?.avatar}
			panelState={collaborativePanelState}
			onStateChange={handleCollaborativePanelStateChange}
			onAddComment={handlePostComment}
			onEditComment={handleEditComment}
			onDeleteComment={handleDeleteComment}
			onAddReaction={handleAddReaction}
			onRemoveReaction={handleRemoveReaction}
			isLoading={commentsLoading}
			rightOffset={panelState !== 'closed' ? 
			  (panelState === 'expanded' ? 'right-[33.333333%]' : 'right-[16.666667%]') : 
			  'right-0'
			}
		  />
		</>
	  )}

	  {/* Job Preview Modal */}
	  {showJobPreviewModal && job && (
		<JobPreviewModal
		  isOpen={showJobPreviewModal}
		  onClose={() => setShowJobPreviewModal(false)}
		  job={job}
		/>
	  )}

	  {/* Toast Container */}
	  <ToastContainer position="top-right" />
	</div>
  );
};

export default JobATSPage;
