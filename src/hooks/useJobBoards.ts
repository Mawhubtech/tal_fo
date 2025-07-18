import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  jobBoardApiService,
  type JobBoardConfig,
  type OrganizationJobBoard,
  type RecruiterJobBoardAccess,
  type JobBoardPosting,
  type JobBoardResponse
} from '../services/jobBoardApiService';

// Query Keys
export const jobBoardKeys = {
  all: ['jobBoards'] as const,
  available: () => [...jobBoardKeys.all, 'available'] as const,
  config: (jobBoardId: string) => [...jobBoardKeys.all, 'config', jobBoardId] as const,
  organizationBoards: (organizationId: string, departmentId?: string) => [
    ...jobBoardKeys.all, 'organization', organizationId, 'departments', departmentId || 'all'
  ] as const,
  recruiterAccess: (recruiterId: string, organizationId: string) => [
    ...jobBoardKeys.all, 'recruiter', recruiterId, 'organization', organizationId
  ] as const,
  postings: (filters?: any) => [...jobBoardKeys.all, 'postings', filters] as const,
  responses: (filters?: any) => [...jobBoardKeys.all, 'responses', filters] as const,
  analytics: (filters?: any) => [...jobBoardKeys.all, 'analytics', filters] as const,
  templates: (organizationId: string) => [...jobBoardKeys.all, 'templates', organizationId] as const,
};

// Available Job Boards
export function useAvailableJobBoards() {
  return useQuery({
    queryKey: jobBoardKeys.available(),
    queryFn: () => jobBoardApiService.getAvailableJobBoards(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useJobBoardConfig(jobBoardId: string) {
  return useQuery({
    queryKey: jobBoardKeys.config(jobBoardId),
    queryFn: () => jobBoardApiService.getJobBoardConfig(jobBoardId),
    enabled: !!jobBoardId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Organization Job Board Management
export function useOrganizationJobBoards(organizationId: string, departmentId?: string) {
  return useQuery({
    queryKey: jobBoardKeys.organizationBoards(organizationId, departmentId),
    queryFn: () => jobBoardApiService.getOrganizationJobBoards(organizationId, departmentId),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAddJobBoardToOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ organizationId, ...data }: {
      organizationId: string;
      jobBoardId: string;
      departmentId?: string;
      credentials: { [key: string]: string };
      settings: OrganizationJobBoard['settings'];
    }) => jobBoardApiService.addJobBoardToOrganization(organizationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.organizationBoards(variables.organizationId)
      });
    },
  });
}

export function useUpdateOrganizationJobBoard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ organizationId, jobBoardId, data }: {
      organizationId: string;
      jobBoardId: string;
      data: Partial<OrganizationJobBoard>;
    }) => jobBoardApiService.updateOrganizationJobBoard(organizationId, jobBoardId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.organizationBoards(variables.organizationId)
      });
    },
  });
}

export function useRemoveJobBoardFromOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ organizationId, jobBoardId }: {
      organizationId: string;
      jobBoardId: string;
    }) => jobBoardApiService.removeJobBoardFromOrganization(organizationId, jobBoardId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.organizationBoards(variables.organizationId)
      });
    },
  });
}

export function useTestJobBoardConnection() {
  return useMutation({
    mutationFn: ({ organizationId, jobBoardId }: {
      organizationId: string;
      jobBoardId: string;
    }) => jobBoardApiService.testJobBoardConnection(organizationId, jobBoardId),
  });
}

// Recruiter Access Management
export function useRecruiterJobBoardAccess(recruiterId: string, organizationId: string) {
  return useQuery({
    queryKey: jobBoardKeys.recruiterAccess(recruiterId, organizationId),
    queryFn: () => jobBoardApiService.getRecruiterJobBoardAccess(recruiterId, organizationId),
    enabled: !!recruiterId && !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAssignRecruiterToJobBoard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ organizationId, ...data }: {
      organizationId: string;
      recruiterId: string;
      organizationJobBoardId: string;
      permissions: RecruiterJobBoardAccess['permissions'];
    }) => jobBoardApiService.assignRecruiterToJobBoard(organizationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.recruiterAccess(variables.recruiterId, variables.organizationId)
      });
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.organizationBoards(variables.organizationId)
      });
    },
  });
}

export function useUpdateRecruiterJobBoardAccess() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ accessId, data }: {
      accessId: string;
      data: Partial<RecruiterJobBoardAccess>;
    }) => jobBoardApiService.updateRecruiterJobBoardAccess(accessId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.all
      });
    },
  });
}

export function useRemoveRecruiterJobBoardAccess() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (accessId: string) => jobBoardApiService.removeRecruiterJobBoardAccess(accessId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.all
      });
    },
  });
}

// Job Posting Management
export function useJobBoardPostings(filters?: {
  recruiterId?: string;
  organizationId?: string;
  jobId?: string;
  status?: string;
  jobBoardId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: jobBoardKeys.postings(filters),
    queryFn: () => jobBoardApiService.getJobBoardPostings(filters || {}),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreateJobBoardPosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      jobId: string;
      organizationJobBoardId: string;
      autoPost?: boolean;
      scheduledPostDate?: string;
      budget?: {
        allocated: number;
        duration: number;
      };
    }) => jobBoardApiService.createJobBoardPosting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.postings()
      });
    },
  });
}

export function useUpdateJobBoardPosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postingId, data }: {
      postingId: string;
      data: Partial<JobBoardPosting>;
    }) => jobBoardApiService.updateJobBoardPosting(postingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.postings()
      });
    },
  });
}

export function usePauseJobBoardPosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postingId: string) => jobBoardApiService.pauseJobBoardPosting(postingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.postings()
      });
    },
  });
}

export function useResumeJobBoardPosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postingId: string) => jobBoardApiService.resumeJobBoardPosting(postingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.postings()
      });
    },
  });
}

export function useDeleteJobBoardPosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postingId: string) => jobBoardApiService.deleteJobBoardPosting(postingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.postings()
      });
    },
  });
}

export function useApproveJobBoardPosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postingId, notes }: {
      postingId: string;
      notes?: string;
    }) => jobBoardApiService.approveJobBoardPosting(postingId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.postings()
      });
    },
  });
}

export function useRejectJobBoardPosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postingId, reason }: {
      postingId: string;
      reason: string;
    }) => jobBoardApiService.rejectJobBoardPosting(postingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.postings()
      });
    },
  });
}

// Response Management
export function useJobBoardResponses(filters?: {
  recruiterId?: string;
  organizationId?: string;
  jobId?: string;
  postingId?: string;
  status?: string;
  responseType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: jobBoardKeys.responses(filters),
    queryFn: () => jobBoardApiService.getJobBoardResponses(filters || {}),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

export function useUpdateJobBoardResponse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ responseId, ...data }: {
      responseId: string;
      status?: JobBoardResponse['status'];
      responseQuality?: number;
      recruiterNotes?: string;
    }) => jobBoardApiService.updateJobBoardResponse(responseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.responses()
      });
    },
  });
}

export function useBulkUpdateJobBoardResponses() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ responseIds, ...data }: {
      responseIds: string[];
      status?: JobBoardResponse['status'];
      recruiterNotes?: string;
    }) => jobBoardApiService.bulkUpdateJobBoardResponses(responseIds, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.responses()
      });
    },
  });
}

export function useConvertResponseToCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (responseId: string) => jobBoardApiService.convertResponseToCandidate(responseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.responses()
      });
      // Also invalidate candidates and applications queries
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
  });
}

// Analytics and Reporting
export function useJobBoardAnalytics(filters: {
  organizationId: string;
  recruiterId?: string;
  jobBoardId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}) {
  return useQuery({
    queryKey: jobBoardKeys.analytics(filters),
    queryFn: () => jobBoardApiService.getJobBoardAnalytics(filters),
    enabled: !!filters.organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRecruiterPerformance(organizationId: string, recruiterId?: string) {
  return useQuery({
    queryKey: [...jobBoardKeys.all, 'performance', organizationId, recruiterId],
    queryFn: () => jobBoardApiService.getRecruiterPerformance(organizationId, recruiterId),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Sync Operations
export function useSyncJobBoardData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ organizationId, jobBoardId }: {
      organizationId: string;
      jobBoardId: string;
    }) => jobBoardApiService.syncJobBoardData(organizationId, jobBoardId),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries after sync
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.postings()
      });
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.responses()
      });
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.analytics({ organizationId: variables.organizationId })
      });
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.organizationBoards(variables.organizationId)
      });
    },
  });
}

export function useScheduleSync() {
  return useMutation({
    mutationFn: ({ organizationId, jobBoardId, schedule }: {
      organizationId: string;
      jobBoardId: string;
      schedule: {
        frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
        time?: string;
        isActive: boolean;
      };
    }) => jobBoardApiService.scheduleSync(organizationId, jobBoardId, schedule),
  });
}

// Templates
export function useJobPostingTemplates(organizationId: string) {
  return useQuery({
    queryKey: jobBoardKeys.templates(organizationId),
    queryFn: () => jobBoardApiService.getJobPostingTemplates(organizationId),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useCreateJobPostingTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ organizationId, template }: {
      organizationId: string;
      template: {
        name: string;
        title: string;
        description: string;
        requirements: string[];
        benefits: string[];
        isDefault?: boolean;
        jobBoardSpecific?: {
          [jobBoardId: string]: {
            customFields: { [key: string]: string };
            formatting: string;
          };
        };
      };
    }) => jobBoardApiService.createJobPostingTemplate(organizationId, template),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: jobBoardKeys.templates(variables.organizationId)
      });
    },
  });
}
