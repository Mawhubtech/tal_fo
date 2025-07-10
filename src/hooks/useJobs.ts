import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApiService, type JobFilters, type JobStats, type CreateJobData } from '../services/jobApiService';
import type { Job, PaginatedResponse } from '../recruitment/data/types';

// Query keys
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: JobFilters) => [...jobKeys.lists(), { filters }] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  stats: (organizationId?: string) => [...jobKeys.all, 'stats', organizationId || 'all'] as const,
  byOrganization: (organizationId: string) => [...jobKeys.all, 'organization', organizationId] as const,
  byDepartment: (departmentId: string) => [...jobKeys.all, 'department', departmentId] as const,
};

// Get all jobs with filters
export function useJobs(filters: JobFilters = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => jobApiService.getAllJobs(filters),
    staleTime: 1000 * 60 * 3, // 3 minutes
    enabled: options.enabled ?? true, // Default to true if not specified
  });
}

// Get job by ID
export function useJob(jobId: string) {
  return useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => jobApiService.getJobById(jobId),
    enabled: !!jobId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get job statistics
export function useJobStats(organizationId?: string) {
  return useQuery({
    queryKey: jobKeys.stats(organizationId),
    queryFn: () => jobApiService.getJobStats(organizationId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get jobs by organization
export function useJobsByOrganization(organizationId: string, filters: JobFilters = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [...jobKeys.byOrganization(organizationId), filters],
    queryFn: () => jobApiService.getJobsByOrganization(organizationId, filters),
    enabled: (options.enabled ?? true) && !!organizationId, // Must have both: enabled option and valid org ID
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// Get jobs by department
export function useJobsByDepartment(departmentId: string, filters: JobFilters = {}) {
  return useQuery({
    queryKey: [...jobKeys.byDepartment(departmentId), filters],
    queryFn: () => jobApiService.getJobsByDepartment(departmentId, filters),
    enabled: !!departmentId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// Mutations
export function useCreateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: jobApiService.createJob,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
      if (data.organizationId) {
        queryClient.invalidateQueries({ queryKey: jobKeys.byOrganization(data.organizationId) });
      }
      if (data.departmentId) {
        queryClient.invalidateQueries({ queryKey: jobKeys.byDepartment(data.departmentId) });
      }
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobData> }) => 
      jobApiService.updateJob(id, data),
    onSuccess: (data, variables) => {
      // Update the specific job in cache
      queryClient.setQueryData(jobKeys.detail(variables.id), data);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
      if (data.organizationId) {
        queryClient.invalidateQueries({ queryKey: jobKeys.byOrganization(data.organizationId) });
      }
      if (data.departmentId) {
        queryClient.invalidateQueries({ queryKey: jobKeys.byDepartment(data.departmentId) });
      }
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: jobApiService.deleteJob,
    onSuccess: (_, jobId) => {
      // Remove the job from cache
      queryClient.removeQueries({ queryKey: jobKeys.detail(jobId) });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
}

// Increment applicant count
export function useIncrementApplicantCount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: jobApiService.incrementApplicantCount,
    onSuccess: (data) => {
      // Update the specific job in cache
      queryClient.setQueryData(jobKeys.detail(data.id), data);
      // Invalidate lists to update applicant counts
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      if (data.organizationId) {
        queryClient.invalidateQueries({ queryKey: jobKeys.byOrganization(data.organizationId) });
      }
      if (data.departmentId) {
        queryClient.invalidateQueries({ queryKey: jobKeys.byDepartment(data.departmentId) });
      }
    },
  });
}

// Get job suggestions for a candidate
export function useJobSuggestions(
  candidateId: string,
  organizationId?: string,
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: [...jobKeys.all, 'suggestions', candidateId, organizationId],
    queryFn: () => jobApiService.getJobSuggestions(candidateId, organizationId),
    enabled: (options.enabled ?? true) && !!candidateId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// Invalidation helpers
export function useInvalidateJobs() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: jobKeys.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: jobKeys.lists() }),
    invalidateDetail: (jobId: string) => 
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) }),
    invalidateStats: (organizationId?: string) => 
      queryClient.invalidateQueries({ queryKey: jobKeys.stats(organizationId) }),
    invalidateByOrganization: (organizationId: string) => 
      queryClient.invalidateQueries({ queryKey: jobKeys.byOrganization(organizationId) }),
    invalidateByDepartment: (departmentId: string) => 
      queryClient.invalidateQueries({ queryKey: jobKeys.byDepartment(departmentId) }),
  };
}

// Prefetch helpers
export function usePrefetchJob() {
  const queryClient = useQueryClient();
  
  return (jobId: string) => {
    queryClient.prefetchQuery({
      queryKey: jobKeys.detail(jobId),
      queryFn: () => jobApiService.getJobById(jobId),
      staleTime: 1000 * 60 * 5,
    });
  };
}
