import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  SequenceEnrollmentsApiService, 
  SequenceEnrollment, 
  CreateEnrollmentRequest, 
  BulkEnrollmentRequest, 
  AutoEnrollmentConfig, 
  GetEnrollmentsParams 
} from '../services/sequenceEnrollmentsApiService';

// Query Keys
export const enrollmentQueryKeys = {
  all: ['enrollments'] as const,
  lists: () => [...enrollmentQueryKeys.all, 'list'] as const,
  list: (params?: GetEnrollmentsParams) => [...enrollmentQueryKeys.lists(), params] as const,
  sequence: (sequenceId: string) => [...enrollmentQueryKeys.all, 'sequence', sequenceId] as const,
  autoConfig: (sequenceId: string) => [...enrollmentQueryKeys.all, 'auto-config', sequenceId] as const,
};

// Queries
export const useSequenceEnrollments = (params?: GetEnrollmentsParams) => {
  return useQuery({
    queryKey: enrollmentQueryKeys.list(params),
    queryFn: () => SequenceEnrollmentsApiService.getEnrollments(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSequenceEnrollmentsList = (sequenceId: string) => {
  return useQuery({
    queryKey: enrollmentQueryKeys.sequence(sequenceId),
    queryFn: () => SequenceEnrollmentsApiService.getSequenceEnrollments(sequenceId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAutoEnrollmentConfig = (sequenceId: string) => {
  return useQuery({
    queryKey: enrollmentQueryKeys.autoConfig(sequenceId),
    queryFn: () => SequenceEnrollmentsApiService.getAutoEnrollmentConfig(sequenceId),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Mutations
export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEnrollmentRequest) => SequenceEnrollmentsApiService.createEnrollment(data),
    onSuccess: (_, { sequenceId }) => {
      // Invalidate enrollment queries
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.sequence(sequenceId) });
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.lists() });
    },
  });
};

export const useBulkEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkEnrollmentRequest) => SequenceEnrollmentsApiService.bulkEnrollment(data),
    onSuccess: (_, { sequenceId }) => {
      // Invalidate enrollment queries
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.sequence(sequenceId) });
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.lists() });
    },
  });
};

export const usePauseEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) => SequenceEnrollmentsApiService.pauseEnrollment(enrollmentId),
    onSuccess: () => {
      // Invalidate all enrollment queries
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.all });
    },
  });
};

export const useResumeEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) => SequenceEnrollmentsApiService.resumeEnrollment(enrollmentId),
    onSuccess: () => {
      // Invalidate all enrollment queries
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.all });
    },
  });
};

export const useRemoveEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) => SequenceEnrollmentsApiService.removeEnrollment(enrollmentId),
    onSuccess: () => {
      // Invalidate all enrollment queries
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.all });
    },
  });
};

export const useUpdateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, data }: { 
      enrollmentId: string; 
      data: {
        status?: 'active' | 'paused' | 'completed' | 'failed' | 'unsubscribed';
        currentStepId?: string;
        currentStepOrder?: number;
        nextExecutionAt?: string;
        metadata?: Record<string, any>;
      }
    }) => SequenceEnrollmentsApiService.updateEnrollment(enrollmentId, data),
    onSuccess: () => {
      // Invalidate all enrollment queries
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.all });
    },
  });
};

export const useConfigureAutoEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: AutoEnrollmentConfig) => SequenceEnrollmentsApiService.configureAutoEnrollment(config),
    onSuccess: (_, { sequenceId }) => {
      // Invalidate auto enrollment config
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.autoConfig(sequenceId) });
    },
  });
};