import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApplicationApiService, type JobApplication } from '../services/jobApplicationApiService';

// Query Keys
export const jobApplicationKeys = {
  all: ['jobApplications'] as const,
  byJob: (jobId: string) => [...jobApplicationKeys.all, 'byJob', jobId] as const,
  byCandidate: (candidateId: string) => [...jobApplicationKeys.all, 'byCandidate', candidateId] as const,
  detail: (id: string) => [...jobApplicationKeys.all, 'detail', id] as const,
};

// Get job applications by job ID
export const useJobApplicationsByJob = (jobId: string) => {
  return useQuery({
    queryKey: jobApplicationKeys.byJob(jobId),
    queryFn: () => jobApplicationApiService.getJobApplicationsByJobId(jobId),
    enabled: !!jobId,
  });
};

// Get job applications by candidate ID
export const useJobApplicationsByCandidate = (candidateId: string) => {
  return useQuery({
    queryKey: jobApplicationKeys.byCandidate(candidateId),
    queryFn: () => jobApplicationApiService.getJobApplicationsByCandidateId(candidateId),
    enabled: !!candidateId,
  });
};

// Get single job application
export const useJobApplication = (id: string) => {
  return useQuery({
    queryKey: jobApplicationKeys.detail(id),
    queryFn: () => jobApplicationApiService.getJobApplicationById(id),
    enabled: !!id,
  });
};

// Create job application mutation
export const useCreateJobApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: jobApplicationApiService.createJobApplication,
    onSuccess: (newApplication) => {
      // Invalidate job applications queries
      queryClient.invalidateQueries({ queryKey: jobApplicationKeys.all });
      
      // If we have the jobId, update the specific job applications cache
      if (newApplication.jobId) {
        queryClient.invalidateQueries({ 
          queryKey: jobApplicationKeys.byJob(newApplication.jobId) 
        });
      }
      
      // If we have the candidateId, update the specific candidate applications cache
      if (newApplication.candidateId) {
        queryClient.invalidateQueries({ 
          queryKey: jobApplicationKeys.byCandidate(newApplication.candidateId) 
        });
      }
    },
  });
};

// Update job application mutation
export const useUpdateJobApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JobApplication> }) =>
      jobApplicationApiService.updateJobApplication(id, data),
    onSuccess: (updatedApplication, variables) => {
      // Update the specific job application in cache
      queryClient.setQueryData(
        jobApplicationKeys.detail(variables.id),
        updatedApplication
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: jobApplicationKeys.all });
      
      if (updatedApplication.jobId) {
        queryClient.invalidateQueries({ 
          queryKey: jobApplicationKeys.byJob(updatedApplication.jobId) 
        });
      }
      
      if (updatedApplication.candidateId) {
        queryClient.invalidateQueries({ 
          queryKey: jobApplicationKeys.byCandidate(updatedApplication.candidateId) 
        });
      }
    },
  });
};

// Delete job application mutation
export const useDeleteJobApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: jobApplicationApiService.deleteJobApplication,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: jobApplicationKeys.detail(deletedId) });
      
      // Invalidate all job applications queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: jobApplicationKeys.all });
    },
  });
};
