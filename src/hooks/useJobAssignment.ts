import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  jobAssignmentApiService,
  type BulkAssignmentResult
} from '../services/jobAssignmentApiService';
import type { Job } from '../recruitment/data/types';

// Query keys
export const jobAssignmentKeys = {
  all: ['jobAssignment'] as const,
  teamAvailable: (teamId: string) => [...jobAssignmentKeys.all, 'teamAvailable', teamId] as const,
  teamAssigned: (teamId: string) => [...jobAssignmentKeys.all, 'teamAssigned', teamId] as const,
};

// Get jobs available for assignment to a hiring team
export function useJobsForTeamAssignment(teamId: string) {
  return useQuery({
    queryKey: jobAssignmentKeys.teamAvailable(teamId),
    queryFn: () => jobAssignmentApiService.getJobsForTeamAssignment(teamId),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get jobs already assigned to a hiring team
export function useJobsAssignedToTeam(teamId: string) {
  return useQuery({
    queryKey: jobAssignmentKeys.teamAssigned(teamId),
    queryFn: () => jobAssignmentApiService.getJobsAssignedToTeam(teamId),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Assign a job to a hiring team
export function useAssignJobToTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, teamId }: { jobId: string; teamId: string }) =>
      jobAssignmentApiService.assignJobToTeam(jobId, teamId),
    onSuccess: (_, { teamId }) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: jobAssignmentKeys.teamAvailable(teamId) });
      queryClient.invalidateQueries({ queryKey: jobAssignmentKeys.teamAssigned(teamId) });
      // Also invalidate job queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Unassign a job from its hiring team
export function useUnassignJobFromTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, teamId }: { jobId: string; teamId?: string }) =>
      jobAssignmentApiService.unassignJobFromTeam(jobId),
    onSuccess: (_, { teamId }) => {
      // Invalidate and refetch relevant queries
      if (teamId) {
        queryClient.invalidateQueries({ queryKey: jobAssignmentKeys.teamAvailable(teamId) });
        queryClient.invalidateQueries({ queryKey: jobAssignmentKeys.teamAssigned(teamId) });
      }
      // Also invalidate job queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Bulk assign jobs to a hiring team
export function useBulkAssignJobsToTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobIds, teamId }: { jobIds: string[]; teamId: string }) =>
      jobAssignmentApiService.bulkAssignJobsToTeam(jobIds, teamId),
    onSuccess: (_, { teamId }) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: jobAssignmentKeys.teamAvailable(teamId) });
      queryClient.invalidateQueries({ queryKey: jobAssignmentKeys.teamAssigned(teamId) });
      // Also invalidate job queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Bulk unassign jobs from their hiring teams
export function useBulkUnassignJobsFromTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobIds, teamId }: { jobIds: string[]; teamId?: string }) =>
      jobAssignmentApiService.bulkUnassignJobsFromTeam(jobIds),
    onSuccess: (_, { teamId }) => {
      // Invalidate and refetch relevant queries
      if (teamId) {
        queryClient.invalidateQueries({ queryKey: jobAssignmentKeys.teamAvailable(teamId) });
        queryClient.invalidateQueries({ queryKey: jobAssignmentKeys.teamAssigned(teamId) });
      }
      // Also invalidate job queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
