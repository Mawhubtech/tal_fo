import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicJobApiService, type PublicJobFilters } from '../services/publicJobApiService';

// Query keys
export const publicJobKeys = {
  all: ['publicJobs'] as const,
  lists: () => [...publicJobKeys.all, 'list'] as const,
  list: (filters: PublicJobFilters) => [...publicJobKeys.lists(), filters] as const,
  details: () => [...publicJobKeys.all, 'detail'] as const,
  detail: (id: string) => [...publicJobKeys.details(), id] as const,
  featured: () => [...publicJobKeys.all, 'featured'] as const,
  related: (jobId: string) => [...publicJobKeys.all, 'related', jobId] as const,
  stats: () => [...publicJobKeys.all, 'stats'] as const,
};

/**
 * Hook to fetch published jobs with filters
 */
export const usePublishedJobs = (filters: PublicJobFilters = {}) => {
  return useQuery({
    queryKey: publicJobKeys.list(filters),
    queryFn: () => publicJobApiService.getPublishedJobs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch a single published job by ID
 */
export const usePublishedJob = (jobId: string) => {
  return useQuery({
    queryKey: publicJobKeys.detail(jobId),
    queryFn: () => publicJobApiService.getPublishedJobById(jobId),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch featured jobs
 */
export const useFeaturedJobs = (limit: number = 6) => {
  return useQuery({
    queryKey: [...publicJobKeys.featured(), limit],
    queryFn: () => publicJobApiService.getFeaturedJobs(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook to fetch related jobs for a specific job
 */
export const useRelatedJobs = (jobId: string, limit: number = 5) => {
  return useQuery({
    queryKey: [...publicJobKeys.related(jobId), limit],
    queryFn: () => publicJobApiService.getRelatedJobs(jobId, limit),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch public job statistics
 */
export const usePublicJobStats = () => {
  return useQuery({
    queryKey: publicJobKeys.stats(),
    queryFn: () => publicJobApiService.getPublicJobStats(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Mutation hook for job applications
 */
export const useApplyToJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      jobId, 
      applicationData 
    }: { 
      jobId: string; 
      applicationData: {
        coverLetter?: string;
        resumeFileId?: string;
        customAnswers?: Array<{
          questionId: string;
          answer: string;
        }>;
      };
    }) => publicJobApiService.applyToJob(jobId, applicationData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch job details to update applicant count
      queryClient.invalidateQueries({
        queryKey: publicJobKeys.detail(variables.jobId),
      });
      
      // Also invalidate the jobs list to update applicant counts there
      queryClient.invalidateQueries({
        queryKey: publicJobKeys.lists(),
      });
    },
    onError: (error) => {
      console.error('Error applying to job:', error);
    },
  });
};

/**
 * Hook to prefetch a job detail page (useful for hover states)
 */
export const usePrefetchJob = () => {
  const queryClient = useQueryClient();

  const prefetchJob = (jobId: string) => {
    queryClient.prefetchQuery({
      queryKey: publicJobKeys.detail(jobId),
      queryFn: () => publicJobApiService.getPublishedJobById(jobId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return { prefetchJob };
};
