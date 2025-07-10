import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApplicationApiService, type JobApplication, type CreateJobApplicationData } from '../services/jobApplicationApiService';
import { jobApiService } from '../services/jobApiService';

// Interface for creating job application with pipeline handling
export interface CreateJobApplicationWithPipelineData {
  jobId: string;
  candidateId: string;
  status?: 'Applied' | 'Screening' | 'Phone Interview' | 'Technical Interview' | 'Final Interview' | 'Offer Extended' | 'Hired' | 'Rejected' | 'Withdrawn';
  appliedDate?: string;
  notes?: string;
  coverLetter?: string;
  score?: number;
  resumeUrl?: string;
  portfolioUrl?: string;
  customFields?: Record<string, any>;
}

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

// Create job application with automatic pipeline stage assignment
export const useCreateJobApplicationWithPipeline = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateJobApplicationWithPipelineData): Promise<JobApplication> => {
      try {
        // Fetch job with pipeline information
        const job = await jobApiService.getJobWithPipeline(data.jobId);
        
        // Prepare application data with pipeline information
        const applicationData: CreateJobApplicationData = {
          ...data,
          stage: 'Application', // Default stage
        };

        // Set pipeline information if available
        if (job.pipeline && job.pipeline.stages && job.pipeline.stages.length > 0) {
          // Sort stages by order and get the first one
          const sortedStages = job.pipeline.stages.sort((a: any, b: any) => a.order - b.order);
          const firstStage = sortedStages[0];

          applicationData.pipelineId = job.pipeline.id;
          applicationData.currentPipelineStageId = firstStage.id;
          applicationData.currentPipelineStageName = firstStage.name;
          applicationData.stageEnteredAt = new Date().toISOString();
          
          // Use the pipeline stage name instead of generic 'Application'
          applicationData.stage = firstStage.name as any;

          console.log('[useCreateJobApplicationWithPipeline] Setting pipeline stage:', {
            pipelineId: job.pipeline.id,
            stageId: firstStage.id,
            stageName: firstStage.name,
            stageOrder: firstStage.order,
            totalStages: sortedStages.length
          });
        } else if (job.pipelineId) {
          // If job has pipelineId but no pipeline data, set the ID
          applicationData.pipelineId = job.pipelineId;
          console.log('[useCreateJobApplicationWithPipeline] Job has pipelineId but no pipeline data:', job.pipelineId);
        } else {
          console.warn('[useCreateJobApplicationWithPipeline] No pipeline information available for job:', data.jobId);
        }

        // Log the final application data
        console.log('[useCreateJobApplicationWithPipeline] Final application data:', applicationData);

        // Create the job application
        return await jobApplicationApiService.createJobApplication(applicationData);
      } catch (error) {
        console.error('[useCreateJobApplicationWithPipeline] Error:', error);
        throw error;
      }
    },
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

      // Also invalidate job-related queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
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
