import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobCollaboratorApiService, type JobCollaborator } from '../services/jobCollaboratorApiService';
import type { JobCollaboratorInvite } from '../recruitment/jobs/components/JobCollaboratorInviteForm';
import { toast } from '../components/ToastContainer';

/**
 * Hook to fetch all collaborators for a specific job
 */
export const useJobCollaborators = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['jobCollaborators', jobId],
    queryFn: () => jobCollaboratorApiService.getJobCollaborators(jobId!),
    enabled: !!jobId,
  });
};

/**
 * Hook to invite a single collaborator to a job
 */
export const useInviteCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: JobCollaboratorInvite }) =>
      jobCollaboratorApiService.inviteCollaborator(jobId, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch collaborators list
      queryClient.invalidateQueries({ queryKey: ['jobCollaborators', variables.jobId] });
      toast.success(`Invitation sent to ${data.email}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    },
  });
};

/**
 * Hook to invite multiple collaborators to a job
 */
export const useInviteCollaboratorsBulk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, collaborators }: { jobId: string; collaborators: JobCollaboratorInvite[] }) =>
      jobCollaboratorApiService.inviteBulk(jobId, collaborators),
    onSuccess: (data, variables) => {
      // Invalidate and refetch collaborators list
      queryClient.invalidateQueries({ queryKey: ['jobCollaborators', variables.jobId] });
      toast.success(`Successfully sent ${data.invited} invitation(s)`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send invitations');
    },
  });
};

/**
 * Hook to get jobs where current user is a collaborator
 */
export const useMyCollaboratorJobs = () => {
  return useQuery({
    queryKey: ['myCollaboratorJobs'],
    queryFn: () => jobCollaboratorApiService.getMyCollaboratorJobs(),
  });
};

/**
 * Hook to get my pending job collaborator invitations
 */
export const useMyPendingJobInvitations = () => {
  return useQuery({
    queryKey: ['myPendingJobInvitations'],
    queryFn: () => jobCollaboratorApiService.getMyPendingInvitations(),
  });
};

/**
 * Hook to accept a collaborator invitation
 */
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => jobCollaboratorApiService.acceptInvitation(token),
    onSuccess: () => {
      // Invalidate both pending invitations and my jobs lists
      queryClient.invalidateQueries({ queryKey: ['myPendingJobInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['myCollaboratorJobs'] });
      toast.success('Job invitation accepted!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
    },
  });
};

/**
 * Hook to resend an invitation to a collaborator
 */
export const useResendInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, collaboratorId }: { jobId: string; collaboratorId: string }) =>
      jobCollaboratorApiService.resendInvitation(jobId, collaboratorId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobCollaborators', variables.jobId] });
      toast.success('Invitation resent successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resend invitation');
    },
  });
};

/**
 * Hook to update a collaborator's permissions and role
 */
export const useUpdateCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      jobId, 
      collaboratorId, 
      data 
    }: { 
      jobId: string; 
      collaboratorId: string; 
      data: Partial<JobCollaboratorInvite> 
    }) => jobCollaboratorApiService.updateCollaborator(jobId, collaboratorId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobCollaborators', variables.jobId] });
      toast.success('Collaborator updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update collaborator');
    },
  });
};

/**
 * Hook to remove a collaborator from a job
 */
export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, collaboratorId }: { jobId: string; collaboratorId: string }) =>
      jobCollaboratorApiService.removeCollaborator(jobId, collaboratorId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobCollaborators', variables.jobId] });
      toast.success('Collaborator removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove collaborator');
    },
  });
};
