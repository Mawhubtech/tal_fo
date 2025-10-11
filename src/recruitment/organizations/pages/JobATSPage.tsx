import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Briefcase, Users, CheckCircle, BarChart3, Calendar, Plus, AlertCircle, RefreshCw, Eye, MessageSquare, Mail, Settings, Edit, X
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useJobATSPageData } from '../../../hooks/useOrganizations';
import { useJob, useUpdateJob, useSwitchPipeline } from '../../../hooks/useJobs';
import { useExternalJobDetail } from '../../../hooks/useExternalJobs';
import { usePipeline, usePipelines } from '../../../hooks/usePipelines';
import { useDefaultPipeline } from '../../../hooks/useDefaultPipeline';
import { useActivePipelines } from '../../../hooks/useActivePipelines';
import { useJobApplicationsByJob, useUpdateJobApplication, useDeleteJobApplication } from '../../../hooks/useJobApplications';
import { useCandidate } from '../../../hooks/useCandidates';
import { useStageMovement } from '../../../hooks/useStageMovement';
import { useOptimisticStageMovement } from '../../../hooks/useOptimisticStageMovement';
import { useTaskStats } from '../../../hooks/useTasks';
import { useInterviews } from '../../../hooks/useInterviews';
import { useJobReport } from '../../../hooks/useReports';
import { usePipelineModal } from '../../../hooks/usePipelineModal';
import { useAuthContext } from '../../../contexts/AuthContext';
import { isExternalUser } from '../../../utils/userUtils';
import { StageChangeReason } from '../../../types/stageMovement.types';
import { useHiringTeam, useTeamMembers } from '../../../hooks/useHiringTeam';
import type { Job as JobType } from '../../data/types';
import type { JobApplication } from '../../../services/jobApplicationApiService';
import type { Pipeline, CreatePipelineDto } from '../../../services/pipelineService';
import { pipelineService } from '../../../services/pipelineService';
import { PipelineTab, TasksTab, InterviewsTab, ReportsTab } from '../components/ats';
import AddCandidateModal from '../components/AddCandidateModal';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import ToastContainer, { toast } from '../../../components/ToastContainer';
import ProfileSidePanel, { type UserStructuredData, type PanelState } from '../../../components/ProfileSidePanel';
import JobPreviewModal from '../../../components/modals/JobPreviewModal';
import CollaborativeSidePanel, { type CollaborativePanelState, type TeamMember } from '../../../components/CollaborativeSidePanel';
import PipelineModal from '../../../components/PipelineModal';
import PipelineUsageWarningModal from '../../../components/PipelineUsageWarningModal';
import ManageTeamsDialog from '../components/ManageTeamsDialog';
import { useJobComments, useCreateComment, useUpdateComment, useDeleteComment, useAddReaction, useRemoveReaction } from '../../../hooks/useJobComments';

const JobATSPage: React.FC = () => {
  const { jobId } = useParams<{ 
	jobId: string; 
  }>();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // First, fetch the job to get organizationId and departmentId
  const { data: jobBasicData, isLoading: jobBasicLoading } = useJob(jobId || '');
  const organizationId = jobBasicData?.organizationId;
  const departmentId = jobBasicData?.departmentId;

  const [activeTab, setActiveTab] = useState<'pipeline' | 'tasks' | 'interviews' | 'reports'>('pipeline');
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showJobPreviewModal, setShowJobPreviewModal] = useState(false);
  const [showManageTeamsDialog, setShowManageTeamsDialog] = useState(false);
  
  // State for the profile side panel
  const [selectedUserDataForPanel, setSelectedUserDataForPanel] = useState<UserStructuredData | null>(null);
  const [panelState, setPanelState] = useState<PanelState>('closed');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  
  // State for the collaborative side panel
  const [collaborativePanelState, setCollaborativePanelState] = useState<CollaborativePanelState>('closed');
  
  // Pipeline management state
  const [showPipelineSelector, setShowPipelineSelector] = useState(false);
  const [showUsageWarning, setShowUsageWarning] = useState(false);
  const [pendingEditPipeline, setPendingEditPipeline] = useState<Pipeline | null>(null);
  const [pipelineUsage, setPipelineUsage] = useState<any>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  
  // Pipeline hooks
  const { createPipeline, updatePipeline } = usePipelines();
  const { 
    data: activePipelines = [], 
    refetch: refetchActivePipelines 
  } = useActivePipelines('recruitment');
  const {
    showCreateModal: showPipelineModal,
    openCreateModal: openPipelineModal,
    openEditModal: openPipelineEditModal,
    closeModal: closePipelineModal,
    modalLoading: pipelineModalLoading,
    setModalLoading,
    selectedPipeline: editingPipeline,
  } = usePipelineModal();
  
  // Determine if current user is external and use appropriate hook
  const isExternal = isExternalUser(user);
  
  // OPTIMIZED: Single API call for all job ATS page data (reduces 12+ calls to 1)
  // Only fetch when we have organizationId from the basic job data
  const { 
    data: jobATSData, 
    isLoading: jobATSLoading, 
    error: jobATSError 
  } = useJobATSPageData(organizationId || '', jobId || '');
  
  // Fallback: Fetch applications separately when there's no organizationId
  const {
    data: standaloneApplicationsData,
    isLoading: standaloneApplicationsLoading
  } = useJobApplicationsByJob(!organizationId && jobId ? jobId : '');
  
  // Fallback for external users (they still use the external job hook)
  const { 
    data: externalJob, 
    isLoading: externalJobLoading, 
    error: externalJobError 
  } = useExternalJobDetail(isExternal ? (jobId || '') : '');

  // Use the optimized data or fallback for jobs without organization
  const job = isExternal 
    ? externalJob 
    : (organizationId ? jobATSData?.job : jobBasicData);
    
  const jobLoading = isExternal 
    ? externalJobLoading 
    : (jobBasicLoading || (organizationId ? jobATSLoading : false));
    
  const jobError = isExternal ? externalJobError : jobATSError;
  
  // Get pipeline data from optimized response or from basic job data
  const effectivePipeline = isExternal 
    ? externalJob?.pipeline 
    : (organizationId ? jobATSData?.pipeline : jobBasicData?.pipeline);
    
  const pipelineLoading = false; // Already loaded in the optimized call
  
  // Extract other data from optimized response or standalone fetch
  const jobApplicationsData = { 
    applications: organizationId 
      ? (jobATSData?.applications || [])
      : (standaloneApplicationsData?.applications || [])
  };
  
  const applicationsLoading = isExternal 
    ? true 
    : (organizationId ? jobATSLoading : standaloneApplicationsLoading);
    
  const applicationsError = isExternal ? null : jobATSError;
  
  const taskStats = organizationId ? jobATSData?.taskStats : undefined;
  const interviewsData = organizationId ? jobATSData?.interviews : undefined;
  const reportData = null; // Will implement in future optimization
  const reportLoading = false;
  const reportError = null;

  // Debug logging
//   console.log('JobATSPage Debug:', {
//     isExternal,
//     jobId,
//     job: job ? { 
//       id: job.id, 
//       title: job.title, 
//       pipelineId: job.pipelineId,
//       hiringTeamId: job.hiringTeamId, // Check if hiringTeamId is available
//       pipeline: job.pipeline ? { id: job.pipeline.id, name: job.pipeline.name, stagesCount: job.pipeline.stages?.length } : null 
//     } : null,
//     jobLoading,
//     jobError,
//     effectivePipeline: effectivePipeline ? { 
//       id: effectivePipeline.id, 
//       name: effectivePipeline.name, 
//       stagesCount: effectivePipeline.stages?.length 
//     } : null,
//     pipelineLoading
//   });
  
  const updateJobApplicationMutation = useUpdateJobApplication();
  const deleteJobApplicationMutation = useDeleteJobApplication();
  
  // Stage movement hook for tracking candidate movements
  const stageMovement = useStageMovement();
  const optimisticStageMovement = useOptimisticStageMovement(jobId || '', organizationId);
  
  // Fetch detailed candidate data when a candidate is selected for the profile panel
  const { 
    data: selectedCandidateDetails, 
    isLoading: candidateDetailsLoading,
    error: candidateDetailsError 
  } = useCandidate(selectedCandidateId || '');
  
  // Collaborative panel hooks
  const { 
    data: comments = [], 
    isLoading: commentsLoading, 
    refetch: refetchComments 
  } = useJobComments(jobId || '');
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const addReactionMutation = useAddReaction();
  const removeReactionMutation = useRemoveReaction();
  
  // Team member hooks
  const { data: hiringTeam } = useHiringTeam(job?.hiringTeamId || '');
  const { data: teamMembersData = [] } = useTeamMembers(job?.hiringTeamId || '');
  
  // Debug hiring team data
//   console.log('Hiring Team Debug:', {
//     jobHiringTeamId: job?.hiringTeamId,
//     hiringTeam: hiringTeam ? { 
//       id: hiringTeam.id, 
//       name: hiringTeam.name, 
//       organizationId: hiringTeam.organizationId,
//       membersCount: hiringTeam.members?.length 
//     } : null,
//     teamMembersData: teamMembersData ? { 
//       count: teamMembersData.length, 
//       members: teamMembersData.map(m => ({ 
//         id: m.id, 
//         memberType: m.memberType, 
//         teamRole: m.teamRole,
//         userId: m.userId,
//         userInfo: m.user ? { id: m.user.id, name: `${m.user.firstName} ${m.user.lastName}` } : null
//       })) 
//     } : null
//   });
  
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
  
  // Loading state (simplified without deprecated default pipeline loading)
  const loading = jobLoading || applicationsLoading || pipelineLoading;

  // Handler for creating default pipeline (simplified)
  const handleCreateDefaultPipeline = async () => {
    try {
      // Will implement when needed
      toast.info('Default pipeline creation not yet implemented in optimized version');
    } catch (error) {
      toast.error('Failed to create default pipeline');
    }
  };

  // Add refetch function for applications (placeholder)
  const refetchApplications = async () => {
    // Will refetch the entire job ATS data
    // For now, this is a placeholder
    console.log('Refetch applications called - will refetch all job ATS data');
  };

  // Add missing variables for backward compatibility
  const defaultPipelineLoading = false;
  const isCreatingDefault = false;
  
  // Import the useSwitchPipeline hook
  const { mutateAsync: switchPipeline, isPending: switchPipelineLoading } = useSwitchPipeline();

  // Handle pipeline assignment to job
  const handleAssignPipeline = async (pipeline: Pipeline) => {
    if (!job?.id) return;

    try {
      // Check if the job already has applications in different stages
      if (effectivePipeline && effectivePipeline.id !== pipeline.id) {
        // Check if there are applications in any stage
        const applications = jobApplicationsData?.applications || [];
        const hasActiveApplications = applications.length > 0;
        
        if (hasActiveApplications) {
          // Show warning about moving applications
          toast.error('Cannot change pipeline: Job has active applications in various stages');
          return;
        }
      }

      // Update the job with the new pipeline using the new endpoint
      await switchPipeline({
        id: job.id,
        pipelineId: pipeline.id
      });

      // Explicitly invalidate all queries to ensure UI updates immediately
      await invalidateAllQueries();

      setShowPipelineSelector(false);
      toast.success(`Pipeline changed to "${pipeline.name}"`);
    } catch (error) {
      console.error('Error assigning pipeline:', error);
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to change pipeline';
      toast.error(errorMessage);
    }
  };

  // Helper function to get job applications count for a stage
  const getStageApplicationsCount = (stageName: string): number => {
    if (!effectivePipeline?.stages) return 0;
    
    const stage = effectivePipeline.stages.find(s => s.name === stageName);
    return stage?.applications?.length || 0;
  };

  // Check if pipeline can be changed (no applications in various stages)
  const canChangePipeline = (): boolean => {
    if (!effectivePipeline?.stages) return true;
    
    const totalApplications = effectivePipeline.stages.reduce((total, stage) => {
      return total + (stage.applications?.length || 0);
    }, 0);
    
    return totalApplications === 0;
  };
  const canEditPipeline = (pipeline: Pipeline): boolean => {
    if (!user || !pipeline || !pipeline.createdBy) return false;
    // User can edit pipelines they created (private and organization)
    // Public pipelines created by others (system templates) are not editable
    return pipeline.createdBy.id === user.id;
  };

  // Handle pipeline editing with usage validation
  const handleEditPipeline = async (pipeline: Pipeline) => {
    if (!canEditPipeline(pipeline)) {
      return;
    }

    try {
      // Check if pipeline is being used
      const usage = await pipelineService.getPipelineUsage(pipeline.id);
      
      if (usage.activeJobs > 0 || usage.activeApplications > 0) {
        // Show warning modal
        setPendingEditPipeline(pipeline);
        setPipelineUsage(usage);
        setShowUsageWarning(true);
      } else {
        // Safe to edit directly
        openPipelineEditModal(pipeline);
      }
    } catch (error) {
      console.error('Error checking pipeline usage:', error);
      // If check fails, allow editing but user should be aware
      openPipelineEditModal(pipeline);
    }
  };

  // Handle creating a copy of the pipeline
  const handleCreatePipelineCopy = async () => {
    if (!pendingEditPipeline) return;

    try {
      const copyName = `${pendingEditPipeline.name} (Copy)`;
      const copiedPipeline = await pipelineService.createPipelineCopy(pendingEditPipeline.id, copyName);
      
      // Refresh pipelines list
      await refetchActivePipelines();
      
      // Close warning modal and open edit modal for the copy
      setShowUsageWarning(false);
      setPendingEditPipeline(null);
      setPipelineUsage(null);
      
      // Open edit modal for the new copy
      openPipelineEditModal(copiedPipeline);
    } catch (error) {
      console.error('Error creating pipeline copy:', error);
      toast.error('Failed to create pipeline copy');
    }
  };

  // Handle proceeding with editing the original pipeline
  const handleProceedWithOriginalEdit = () => {
    if (!pendingEditPipeline) return;

    setShowUsageWarning(false);
    openPipelineEditModal(pendingEditPipeline);
    setPendingEditPipeline(null);
    setPipelineUsage(null);
  };

  // Handle closing usage warning modal
  const handleCloseUsageWarning = () => {
    setShowUsageWarning(false);
    setPendingEditPipeline(null);
    setPipelineUsage(null);
  };

  // Handle clearing pipeline error
  const handleClearPipelineError = () => {
    setPipelineError(null);
  };

  // Handle closing pipeline modal with error cleanup
  const handleClosePipelineModal = () => {
    setPipelineError(null);
    closePipelineModal();
  };

  // Handle overlay click for Pipeline Selector Modal
  const handlePipelineSelectorOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowPipelineSelector(false);
    }
  };

  // Pipeline creation/update handler
  const handlePipelineSubmit = async (data: CreatePipelineDto) => {
    try {
      setModalLoading(true);
      setPipelineError(null);
      
      // Ensure we're working with a recruitment pipeline
      const recruitmentPipelineData = {
        ...data,
        type: 'recruitment' as const
      };
      
      if (editingPipeline) {
        // Update existing pipeline
        await updatePipeline(editingPipeline.id, recruitmentPipelineData);
      } else {
        // Create new pipeline
        await createPipeline(recruitmentPipelineData);
      }
      
      // Refetch active pipelines to include the changes
      await refetchActivePipelines();
      
      // Close modal on success
      handleClosePipelineModal();
      
      toast.success(editingPipeline ? 'Pipeline updated successfully' : 'Pipeline created successfully');
      
    } catch (err: any) {
      console.error('Error with pipeline operation:', err);
      
      // Extract meaningful error message
      let errorMessage = 'An unexpected error occurred while updating the pipeline.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
        // If it's a stage validation error, add the suggestion
        if (err.response.data.code === 'STAGE_HAS_APPLICATIONS' && err.response.data.suggestion) {
          errorMessage += ' ' + err.response.data.suggestion;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setPipelineError(errorMessage);
      // Don't close the modal on error - let user see the error and try again
    } finally {
      setModalLoading(false);
    }
  };

  // Helper function to map backend stage to frontend stage
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

  // Transform hiring team members AND collaborators to TeamMember format for CollaborativeSidePanel
  const teamMembers: TeamMember[] = (() => {
    const members: TeamMember[] = [];
    const seenIds = new Set<string>();

    // 1. Add hiring team members
    teamMembersData.forEach(member => {
      const fullName = member.memberType === 'internal' && member.user
        ? `${member.user.firstName} ${member.user.lastName}`
        : `${member.externalFirstName || ''} ${member.externalLastName || ''}`.trim();

      // For presence matching, use the actual user ID for both internal and external users
      // Internal users: member.user.id
      // External users: member.userId (if linked to a user account) or fallback to member.id
      const memberId = member.memberType === 'internal' && member.user 
        ? member.user.id 
        : member.userId || member.id;

      seenIds.add(memberId);
      members.push({
        id: memberId,
        name: fullName || 'Unknown Member',
        avatar: member.user?.avatar,
        role: member.teamRole as string,
        isOnline: false, // This would need to be implemented with real-time status if needed
      });
    });

    // 2. Add collaborators (if not already in hiring team)
    if (job?.collaborators) {
      job.collaborators.forEach(collaborator => {
        // Only add accepted collaborators
        if (collaborator.status === 'accepted' && collaborator.user) {
          const collaboratorId = collaborator.user.id;
          
          // Skip if already added from hiring team
          if (seenIds.has(collaboratorId)) {
            return;
          }

          seenIds.add(collaboratorId);
          members.push({
            id: collaboratorId,
            name: `${collaborator.user.firstName || ''} ${collaborator.user.lastName || ''}`.trim() || collaborator.email,
            avatar: collaborator.user.avatar,
            role: `Collaborator (${collaborator.role})`,
            isOnline: false,
          });
        }
      });
    }

    // 3. Add job creator if they're not already in the team
    if (job?.createdBy) {
      const creatorId = job.createdBy.id;
      const isCreatorInTeam = seenIds.has(creatorId);
      
      if (!isCreatorInTeam) {
        const creatorName = `${job.createdBy.firstName} ${job.createdBy.lastName}`;
        members.unshift({
          id: creatorId,
          name: creatorName,
          avatar: undefined, // Job creator info from backend might not include avatar
          role: 'Job Creator',
          isOnline: false,
        });
      }
    }

    return members;
  })();

  // Convert job applications to candidates format for the ATS components
  const candidates = jobApplications.map(application => {
    
    const candidateName = application.candidate?.fullName || 'Unknown Candidate';
    
    // Use pipeline stage name if available, otherwise fall back to mapped stage
    const candidateStage = application.currentPipelineStageName 
      ? application.currentPipelineStageName 
      : mapStageToFrontend(application.stage || 'Application');
    
    
    // Get skills from skillMappings or from notesData.skillMappings
    const skills = application.candidate?.skillMappings?.map(sm => sm.skill?.name).filter(Boolean) 
      || application.candidate?.notesData?.skillMappings?.map((sm: any) => sm.skill?.name).filter(Boolean)
      || [];
    
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
      tags: skills, // Use skills from either source
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
      skills: skills, // Use same skills array
      projects: application.candidate?.projects,
      certifications: application.candidate?.certifications,
      awards: application.candidate?.awards,
      interests: application.candidate?.interests,
      languages: application.candidate?.languages,
      notesData: application.candidate?.notesData, // CoreSignal enrichment data
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
      setPanelState('collapsed');
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

  const handleRefreshComments = async () => {
    try {
      // Invalidate the query cache first to force a fresh fetch
      await queryClient.invalidateQueries({ 
        queryKey: ['jobComments', jobId],
        exact: true 
      });
      
      // Then refetch
      await refetchComments();
    } catch (error) {
      console.error('Error refreshing comments:', error);
      // Don't show toast error for refresh failures as it's a background operation
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
              technologies: exp.technologies || [],
              metadata: exp.metadata || undefined, // Include CoreSignal metadata
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
              date: cert.dateIssued || '',
              credentialUrl: cert.credentialUrl || '',
              description: cert.description || '',
            }))
          : [],
        awards: Array.isArray(selectedCandidateDetails.awards)
          ? selectedCandidateDetails.awards.map((award: any) => ({
              name: award.name || '',
              issuer: award.issuer || '',
              date: award.date || '',
              description: award.description || '',
              category: award.category || '',
              recognitionLevel: award.recognitionLevel || '',
            }))
          : [],
        interests: selectedCandidateDetails.interests?.map((interest: any) => ({
          name: interest.name || '',
          category: interest.category || '',
          level: interest.level || '',
          description: interest.description || '',
          yearsOfExperience: interest.yearsOfExperience || 0,
          isActive: interest.isActive || false,
        })) || [],
        languages: selectedCandidateDetails.languages?.map((lang: any) => ({
          language: lang.language || '',
          proficiency: lang.proficiency || '',
          isNative: lang.isNative || false,
          certificationName: lang.certificationName || '',
          certificationScore: lang.certificationScore || '',
          certificationDate: lang.certificationDate || '',
        })) || [],
        references: selectedCandidateDetails.references?.map((ref: any) => ({
          name: ref.name || '',
          position: ref.position || '',
          company: ref.company || '',
          email: ref.email || '',
          phone: ref.phone || '',
          relationship: ref.relationship || '',
          yearsKnown: ref.yearsKnown || '',
          status: ref.status || '',
        })) || [],
        customFields: selectedCandidateDetails.customFields?.map((field: any) => ({
          fieldName: field.fieldName || '',
          fieldType: field.fieldType || '',
          fieldValue: field.fieldValue || '',
          fieldDescription: field.fieldDescription || '',
          isRequired: field.isRequired || false,
        })) || [],
        notesData: selectedCandidateDetails.notesData, // CoreSignal enrichment data
      } as UserStructuredData;

      console.log('Transformed user data for panel:', userDataForPanel);
      setSelectedUserDataForPanel(userDataForPanel);
    }
  }, [selectedCandidateDetails, selectedCandidateId]);

  // Handle Pipeline Selector Modal body scroll and ESC key
  useEffect(() => {
    if (showPipelineSelector) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add ESC key handler
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setShowPipelineSelector(false);
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        // Restore body scroll when modal closes
        document.body.style.overflow = 'unset';
      };
    }
  }, [showPipelineSelector]);

  // Comprehensive function to invalidate all relevant queries
  const invalidateAllQueries = async () => {
    await Promise.all([
      // CRITICAL: Invalidate the optimized job ATS page data
      queryClient.invalidateQueries({ queryKey: ['jobATSPageData', organizationId, jobId] }),
      
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

  // State for tracking candidates being moved
  const [movingCandidates, setMovingCandidates] = useState<Set<string>>(new Set());

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

    // Add candidate to moving state
    setMovingCandidates(prev => new Set([...prev, candidateId]));

    try {
      await optimisticStageMovement.mutateAsync({
        candidateId: candidateId,
        applicationId: currentApplication.id,
        newStageId: newStageData.id,
        currentStage: currentStage,
        newStage: newStage,
        organizationId: organizationId
      });
      
      // Invalidate all related queries to ensure consistency
      await invalidateAllQueries();
      
      // Note: optimistic hook handles all cache updates automatically
      // Show success message
      toast.success('Stage Updated', `Candidate moved to ${newStage}`);
      
    } catch (error) {
      console.error('Error moving candidate via drag and drop:', error);
      toast.error('Move Failed', 'Failed to move candidate. Please try again.');
    } finally {
      // Remove candidate from moving state after a small delay to show completion
      setTimeout(() => {
        setMovingCandidates(prev => {
          const newSet = new Set(prev);
          newSet.delete(candidateId);
          return newSet;
        });
      }, 300);
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
			to="/dashboard/my-jobs" 
			className="text-purple-600 hover:text-purple-700 font-medium"
		  >
			← Back to My Jobs
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
		  <Link to="/dashboard/my-jobs" className="hover:text-gray-700">Jobs</Link>
		  <span className="mx-2">/</span>
		  <span className="text-gray-900 font-medium">ATS - {job.title}</span>
		</div>
	  )}

  {/* Header */}
  <div className="mb-6">
	<div className="flex items-center mb-4">
	  {/* Back button - Only show for internal users */}
	  {!isExternal && (
		<Link 
		  to="/dashboard/my-jobs"
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
	
	{/* Action buttons - moved below title */}
	<div className="flex items-center justify-between">
	  <div className="flex items-center space-x-2">
		{/* View Job button */}
		<button 
		  onClick={() => setShowJobPreviewModal(true)}
		  className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md flex items-center transition-colors text-sm"
		  title="View job details"
		>
		  <Eye className="w-3.5 h-3.5 mr-1.5" />
		  View Job
		</button>
		
		{/* Manage Pipeline button */}
		{!isExternal && effectivePipeline && (
		  <button 
			onClick={() => setShowPipelineSelector(true)}
			className={`bg-white text-purple-600 border border-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-md flex items-center transition-colors text-sm ${
			  !canChangePipeline() ? 'opacity-75' : ''
			}`}
			title={!canChangePipeline() 
			  ? "Pipeline management limited - job has active applications" 
			  : "Manage pipeline for this job"
			}
		  >
			<Settings className="w-3.5 h-3.5 mr-1.5" />
			{!canChangePipeline() ? 'Pipeline (In Use)' : 'Manage Pipeline'}
		  </button>
		)}
		
		{/* Manage Teams button */}
		{!isExternal && (
		  <button 
			onClick={() => setShowManageTeamsDialog(true)}
			className="bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md flex items-center transition-colors text-sm"
			title="Manage team members for this job"
		  >
			<Users className="w-3.5 h-3.5 mr-1.5" />
			Manage Teams
		  </button>
		)}
		
		{/* Email Sequences button */}
		<Link
		  to={isExternal 
			? `/external/jobs/${jobId}/email-sequences`
			: `/dashboard/jobs/${jobId}/email-sequences`
		  }
		  className="bg-white text-orange-600 border border-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-md flex items-center transition-colors text-sm"
		  title="Manage email sequences for this job"
		>
		  <Mail className="w-3.5 h-3.5 mr-1.5" />
		  Email Sequences
		</Link>
		
		{/* Team Chat button */}
		<button 
		  onClick={() => handleCollaborativePanelStateChange('expanded')}
		  className="bg-white text-green-600 border border-green-600 hover:bg-green-50 px-3 py-1.5 rounded-md flex items-center transition-colors text-sm"
		  title="Team collaboration and chat"
		>
		  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
		  Team Chat
		</button>
	  </div>

	  {/* Right side buttons */}
	  <div className="flex items-center space-x-2">
		{/* Refresh button */}
		<button 
		  onClick={handleRefreshData}
		  disabled={isRefreshing}
		  className={`bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md flex items-center transition-colors text-sm ${
			isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
		  }`}
		  title="Refresh all data"
		>
		  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
		</button>
		
		{/* Add Candidate button - Available for all users */}
		{effectivePipeline && (
		  <button 
			onClick={() => setShowAddCandidateModal(true)}
			className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md flex items-center transition-colors text-sm font-medium"
		  >
			<Plus className="w-3.5 h-3.5 mr-1.5" />
			Add Candidate
		  </button>
		)}
	  </div>
	</div>
  </div>	  {/* Job Info Card */}
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
			
			{/* Pipeline Management Button - Only show for internal users */}
			{!isExternal && effectivePipeline && (
			  <button
				onClick={() => setShowPipelineSelector(true)}
				className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-2 rounded-lg transition-colors"
				title="Manage pipeline"
			  >
				<Settings className="w-5 h-5" />
			  </button>
			)}
			
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
			Interviews ({interviewsData?.length || 0})
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
			  movingCandidates={movingCandidates}
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
			  jobTitle={job.title}
			  jobDescription={job.description}
			  jobRequirements={job.requirements || []}
			  onInterviewClick={(interview) => {
				// Handle interview click if needed
			  }}
			  pipelineId={effectivePipeline?.id}
			  hiringTeamMembers={teamMembersData.map(member => ({
			    id: member.id,
			    name: member.memberType === 'internal' && member.user
			      ? `${member.user.firstName} ${member.user.lastName}`
			      : `${member.externalFirstName || ''} ${member.externalLastName || ''}`.trim(),
			    email: member.memberType === 'internal' && member.user
			      ? member.user.email
			      : member.externalEmail || '',
			    role: member.teamRole as string,
			    memberType: member.memberType
			  }))}
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
			  candidateId={selectedCandidateId}
			  hideAddToJob={true}
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
			onRefreshComments={handleRefreshComments}
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

	  {/* Pipeline Selector Modal */}
	  {showPipelineSelector && (
		<div 
		  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
		  onClick={handlePipelineSelectorOverlayClick}
		>
		  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
			<div className="p-6">
			  {/* Header */}
			  <div className="flex items-center justify-between mb-6">
				<div>
				  <h3 className="text-lg font-semibold text-gray-900">Manage Pipeline</h3>
				  <p className="text-sm text-gray-600">Select, edit, or create a new recruitment pipeline</p>
				</div>
				<button
				  onClick={() => setShowPipelineSelector(false)}
				  className="text-gray-400 hover:text-gray-600 transition-colors"
				>
				  <X className="w-6 h-6" />
				</button>
			  </div>

			  {/* Current Pipeline */}
			  {effectivePipeline && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
				  <h4 className="font-medium text-blue-900 mb-2">Current Pipeline</h4>
				  <div className="flex items-center justify-between">
					<div>
					  <p className="font-medium text-blue-800">{effectivePipeline.name}</p>
					  <p className="text-sm text-blue-600">{effectivePipeline.stages?.length || 0} stages</p>
					</div>
					{effectivePipeline && effectivePipeline.createdBy && canEditPipeline(effectivePipeline as Pipeline) && (
					  <button
						onClick={() => {
						  setShowPipelineSelector(false);
						  handleEditPipeline(effectivePipeline as Pipeline);
						}}
						className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
					  >
						<Edit className="h-3 w-3" />
						<span>Edit</span>
					  </button>
					)}
				  </div>
				</div>
			  )}

			  {/* Available Pipelines */}
			  <div className="mb-6">
				<div className="flex items-center justify-between mb-3">
				  <h4 className="font-medium text-gray-900">Available Pipelines</h4>
				  <button
					onClick={() => {
					  setShowPipelineSelector(false);
					  openPipelineModal();
					}}
					className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
				  >
					<Plus className="h-4 w-4" />
					<span>Create New</span>
				  </button>
				</div>
				
				<div className="space-y-2 max-h-60 overflow-y-auto">
				  {activePipelines.map((pipeline) => {
					// Calculate candidates for this specific pipeline (only if it's the current one)
					const candidates = effectivePipeline?.id === pipeline.id 
					  ? (jobApplicationsData?.applications || [])
					  : [];
					
					return (
					  <div
						key={pipeline.id}
						className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
						  effectivePipeline?.id === pipeline.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
						}`}
					  >
						<div className="flex-1">
						  <div className="flex items-center space-x-2">
							<span className="font-medium text-gray-900">{pipeline.name}</span>
							{pipeline.isDefault && (
							  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Default</span>
							)}
							{effectivePipeline?.id === pipeline.id && (
							  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Current</span>
							)}
						  </div>
						  <p className="text-sm text-gray-500">{pipeline.stages?.length || 0} stages</p>
						</div>
					  
					  <div className="flex items-center space-x-2">
						{effectivePipeline?.id !== pipeline.id && (
						  <button
							onClick={async () => {
							  await handleAssignPipeline(pipeline);
							}}
							className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
							disabled={candidates.length > 0 || switchPipelineLoading}
							title={candidates.length > 0 ? "Cannot change pipeline when candidates are in various stages" : "Switch to this pipeline"}
						  >
							{switchPipelineLoading ? 'Switching...' : candidates.length > 0 ? 'In Use' : 'Select'}
						  </button>
						)}
						{canEditPipeline(pipeline) && (
						  <button
							onClick={() => {
							  setShowPipelineSelector(false);
							  handleEditPipeline(pipeline);
							}}
							className="p-1 text-gray-400 hover:text-purple-600 transition-colors rounded hover:bg-purple-50"
							title="Edit pipeline"
						  >
							<Edit className="h-4 w-4" />
						  </button>
						)}
					  </div>
					</div>
				  );
				})}
				</div>
			  </div>

			  {/* Warning for candidates in stages */}
			  {candidates.length > 0 && (
				<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
				  <div className="flex items-center">
					<AlertCircle className="h-5 w-5 text-amber-600 mr-3" />
					<div>
					  <h5 className="font-medium text-amber-800">Pipeline Change Restricted</h5>
					  <p className="text-sm text-amber-700">
						Cannot change pipeline while {candidates.length} candidate{candidates.length !== 1 ? 's are' : ' is'} in various stages. 
						To change pipelines, you would need to move all candidates out of the current pipeline first.
					  </p>
					</div>
				  </div>
				</div>
			  )}

			  {/* Action Buttons */}
			  <div className="flex justify-end gap-3 mt-6">
				<button
				  onClick={() => setShowPipelineSelector(false)}
				  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
				>
				  Close
				</button>
			  </div>
			</div>
		  </div>
		</div>
	  )}

	  {/* Pipeline Creation/Edit Modal */}
	  <PipelineModal
		isOpen={showPipelineModal}
		onClose={handleClosePipelineModal}
		onSubmit={handlePipelineSubmit}
		pipeline={editingPipeline}
		isLoading={pipelineModalLoading}
		error={pipelineError}
		onClearError={handleClearPipelineError}
	  />

	  {/* Pipeline Usage Warning Modal */}
	  {showUsageWarning && pendingEditPipeline && pipelineUsage && (
		<PipelineUsageWarningModal
		  isOpen={showUsageWarning}
		  onClose={handleCloseUsageWarning}
		  onCreateCopy={handleCreatePipelineCopy}
		  onProceedAnyway={handleProceedWithOriginalEdit}
		  pipelineName={pendingEditPipeline.name}
		  usage={pipelineUsage}
		/>
	  )}

	  {/* Manage Teams Dialog */}
	  {showManageTeamsDialog && job && (
		<ManageTeamsDialog
		  isOpen={showManageTeamsDialog}
		  onClose={() => setShowManageTeamsDialog(false)}
		  jobId={job.id}
		  jobTitle={job.title}
		/>
	  )}

	  {/* Toast Container */}
	  <ToastContainer position="top-right" />
	</div>
  );
};

export default JobATSPage;
