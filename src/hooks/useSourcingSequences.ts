import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  sourcingProjectApiService,
  SourcingSequence,
  SourcingSequenceStep,
  CreateSourcingSequenceDto,
  UpdateSourcingSequenceDto,
  CreateSourcingSequenceStepDto,
  UpdateSourcingSequenceStepDto
} from '../services/sourcingProjectApiService';
import { projectQueryKeys } from './useSourcingProjects';

// Query Keys
export const sequenceQueryKeys = {
  all: ['sourcing-sequences'] as const,
  byProject: (projectId: string) => [...sequenceQueryKeys.all, 'project', projectId] as const,
  detail: (id: string) => [...sequenceQueryKeys.all, 'detail', id] as const,
  steps: (sequenceId: string) => [...sequenceQueryKeys.detail(sequenceId), 'steps'] as const,
  step: (stepId: string) => [...sequenceQueryKeys.all, 'step', stepId] as const,
  analytics: (projectId: string) => [...sequenceQueryKeys.byProject(projectId), 'analytics'] as const,
  performance: (id: string) => [...sequenceQueryKeys.detail(id), 'performance'] as const,
};

// Sequence Queries
export const useProjectSequences = (projectId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: sequenceQueryKeys.byProject(projectId),
    queryFn: () => sourcingProjectApiService.getProjectSequences(projectId),
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSequence = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: sequenceQueryKeys.detail(id),
    queryFn: () => sourcingProjectApiService.getSequence(id),
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useSequenceSteps = (sequenceId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: sequenceQueryKeys.steps(sequenceId),
    queryFn: () => sourcingProjectApiService.getSequenceSteps(sequenceId),
    enabled: enabled && !!sequenceId,
    staleTime: 1 * 60 * 1000,
  });
};

export const useSequenceStep = (stepId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: sequenceQueryKeys.step(stepId),
    queryFn: () => sourcingProjectApiService.getSequenceStep(stepId),
    enabled: enabled && !!stepId,
    staleTime: 1 * 60 * 1000,
  });
};

export const useSequenceAnalytics = (projectId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: sequenceQueryKeys.analytics(projectId),
    queryFn: () => sourcingProjectApiService.getSequenceAnalytics(projectId),
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useSequencePerformance = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: sequenceQueryKeys.performance(id),
    queryFn: () => sourcingProjectApiService.getSequencePerformance(id),
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000,
  });
};

// Get all steps across all sequences for a project
export const useProjectSequenceSteps = (projectId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...sequenceQueryKeys.byProject(projectId), 'all-steps'],
    queryFn: async () => {
      const sequences = await sourcingProjectApiService.getProjectSequences(projectId);
      // Flatten all steps from all sequences
      const allSteps: SourcingSequenceStep[] = [];
      for (const sequence of sequences) {
        if (sequence.steps) {
          allSteps.push(...sequence.steps);
        }
      }
      // Sort by sequence order and step order
      return allSteps.sort((a, b) => a.stepOrder - b.stepOrder);
    },
    enabled: enabled && !!projectId,
    staleTime: 1 * 60 * 1000,
  });
};

// Sequence Enrollment Queries
export const useSequenceEnrollments = (sequenceId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...sequenceQueryKeys.detail(sequenceId), 'enrollments'],
    queryFn: () => sourcingProjectApiService.getSequenceEnrollments(sequenceId),
    enabled: enabled && !!sequenceId,
    staleTime: 30 * 1000, // 30 seconds - more frequent updates for enrollment status
  });
};

// Sequence Mutations
export const useCreateSequence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSourcingSequenceDto) => sourcingProjectApiService.createSequence(data),
    onSuccess: (newSequence) => {
      // Invalidate project sequences
      queryClient.invalidateQueries({ 
        queryKey: sequenceQueryKeys.byProject(newSequence.projectId) 
      });
      // Update project stats
      queryClient.invalidateQueries({ 
        queryKey: projectQueryKeys.stats(newSequence.projectId) 
      });
    },
  });
};

export const useUpdateSequence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSourcingSequenceDto }) =>
      sourcingProjectApiService.updateSequence(id, data),
    onSuccess: (updatedSequence) => {
      // Update the specific sequence in cache
      queryClient.setQueryData(
        sequenceQueryKeys.detail(updatedSequence.id),
        updatedSequence
      );
      // Invalidate project sequences list
      queryClient.invalidateQueries({ 
        queryKey: sequenceQueryKeys.byProject(updatedSequence.projectId) 
      });
    },
  });
};

export const useDeleteSequence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => sourcingProjectApiService.deleteSequence(id),
    onMutate: async (id) => {
      // Get the sequence to know which project to update
      const sequence = queryClient.getQueryData<SourcingSequence>(sequenceQueryKeys.detail(id));
      return { projectId: sequence?.projectId };
    },
    onSuccess: (_, id, context) => {
      // Remove the sequence from cache
      queryClient.removeQueries({ queryKey: sequenceQueryKeys.detail(id) });
      queryClient.removeQueries({ queryKey: sequenceQueryKeys.steps(id) });
      // Invalidate project sequences list
      if (context?.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: sequenceQueryKeys.byProject(context.projectId) 
        });
      }
    },
  });
};

export const useDuplicateSequence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => sourcingProjectApiService.duplicateSequence(id),
    onSuccess: (duplicatedSequence) => {
      // Invalidate project sequences
      queryClient.invalidateQueries({ 
        queryKey: sequenceQueryKeys.byProject(duplicatedSequence.projectId) 
      });
    },
  });
};

export const useActivateSequence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => sourcingProjectApiService.activateSequence(id),
    onSuccess: (updatedSequence) => {
      // Update the specific sequence in cache
      queryClient.setQueryData(
        sequenceQueryKeys.detail(updatedSequence.id),
        updatedSequence
      );
      // Invalidate project sequences list
      queryClient.invalidateQueries({ 
        queryKey: sequenceQueryKeys.byProject(updatedSequence.projectId) 
      });
    },
  });
};

export const usePauseSequence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => sourcingProjectApiService.pauseSequence(id),
    onSuccess: (updatedSequence) => {
      // Update the specific sequence in cache
      queryClient.setQueryData(
        sequenceQueryKeys.detail(updatedSequence.id),
        updatedSequence
      );
      // Invalidate project sequences list
      queryClient.invalidateQueries({ 
        queryKey: sequenceQueryKeys.byProject(updatedSequence.projectId) 
      });
    },
  });
};

export const useCompleteSequence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => sourcingProjectApiService.completeSequence(id),
    onSuccess: (updatedSequence) => {
      // Update the specific sequence in cache
      queryClient.setQueryData(
        sequenceQueryKeys.detail(updatedSequence.id),
        updatedSequence
      );
      // Invalidate project sequences list
      queryClient.invalidateQueries({ 
        queryKey: sequenceQueryKeys.byProject(updatedSequence.projectId) 
      });
    },
  });
};

// Sequence Step Mutations
export const useCreateSequenceStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      sequenceId, 
      data 
    }: { 
      sequenceId: string; 
      data: CreateSourcingSequenceStepDto;
    }) =>
      sourcingProjectApiService.createSequenceStep(sequenceId, data),
    onSuccess: (newStep) => {
      // Invalidate sequence steps
      queryClient.invalidateQueries({ 
        queryKey: sequenceQueryKeys.steps(newStep.sequenceId) 
      });
      // Update sequence detail to include the new step
      queryClient.invalidateQueries({ 
        queryKey: sequenceQueryKeys.detail(newStep.sequenceId) 
      });
      // Invalidate project sequences to refresh the project-level steps view
      if (newStep.sequence?.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: [...sequenceQueryKeys.byProject(newStep.sequence.projectId), 'all-steps'] 
        });
      }
    },
  });
};

export const useUpdateSequenceStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ stepId, data }: { stepId: string; data: UpdateSourcingSequenceStepDto }) =>
      sourcingProjectApiService.updateSequenceStep(stepId, data),
    onSuccess: (updatedStep) => {
      // Update the specific step in cache
      queryClient.setQueryData(
        sequenceQueryKeys.step(updatedStep.id),
        updatedStep
      );
      // Invalidate sequence steps list
      queryClient.invalidateQueries({ 
        queryKey: sequenceQueryKeys.steps(updatedStep.sequenceId) 
      });
      // Invalidate project sequences to refresh the project-level steps view
      if (updatedStep.sequence?.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: [...sequenceQueryKeys.byProject(updatedStep.sequence.projectId), 'all-steps'] 
        });
      }
    },
  });
};

export const useDeleteSequenceStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (stepId: string) => sourcingProjectApiService.deleteSequenceStep(stepId),
    onMutate: async (stepId) => {
      // Get the step to know which sequence to update
      const step = queryClient.getQueryData<SourcingSequenceStep>(sequenceQueryKeys.step(stepId));
      return { sequenceId: step?.sequenceId };
    },
    onSuccess: (_, stepId, context) => {
      // Remove the step from cache
      queryClient.removeQueries({ queryKey: sequenceQueryKeys.step(stepId) });
      // Invalidate sequence steps list
      if (context?.sequenceId) {
        queryClient.invalidateQueries({ 
          queryKey: sequenceQueryKeys.steps(context.sequenceId) 
        });
        // Also invalidate project-level cache - we need to get the project ID
        // For now, we'll invalidate all project sequences to be safe
        queryClient.invalidateQueries({ 
          queryKey: sequenceQueryKeys.all
        });
      }
    },
  });
};

export const useReorderSequenceSteps = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      sequenceId, 
      stepOrders 
    }: { 
      sequenceId: string; 
      stepOrders: { stepId: string; order: number }[];
    }) =>
      sourcingProjectApiService.reorderSequenceSteps(sequenceId, stepOrders),
    onSuccess: (updatedSteps, { sequenceId }) => {
      // Update the sequence steps in cache
      queryClient.setQueryData(
        sequenceQueryKeys.steps(sequenceId),
        updatedSteps
      );
    },
  });
};

// Sequence Enrollment Mutations
export const useEnrollCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      candidateId: string;
      sequenceId: string;
      enrollmentTrigger?: 'manual' | 'automatic' | 'pipeline_stage';
      metadata?: Record<string, any>;
    }) => sourcingProjectApiService.enrollCandidate(data),
    onSuccess: (_, { sequenceId }) => {
      // Invalidate enrollments for this sequence
      queryClient.invalidateQueries({ 
        queryKey: [...sequenceQueryKeys.detail(sequenceId), 'enrollments'] 
      });
    },
  });
};

export const useBulkEnrollCandidates = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      candidateIds: string[];
      sequenceId: string;
      enrollmentTrigger?: 'manual' | 'automatic' | 'pipeline_stage';
      metadata?: Record<string, any>;
    }) => sourcingProjectApiService.bulkEnrollCandidates(data),
    onSuccess: (_, { sequenceId }) => {
      // Invalidate enrollments for this sequence
      queryClient.invalidateQueries({ 
        queryKey: [...sequenceQueryKeys.detail(sequenceId), 'enrollments'] 
      });
    },
  });
};

export const useUnenrollCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (enrollmentId: string) => sourcingProjectApiService.unenrollCandidate(enrollmentId),
    onSuccess: () => {
      // Invalidate all enrollment queries - we don't know which sequence this belongs to
      queryClient.invalidateQueries({ 
        queryKey: [...sequenceQueryKeys.all, 'enrollments'] 
      });
    },
  });
};

export const usePauseEnrollment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (enrollmentId: string) => sourcingProjectApiService.pauseEnrollment(enrollmentId),
    onSuccess: () => {
      // Invalidate all enrollment queries
      queryClient.invalidateQueries({ 
        queryKey: [...sequenceQueryKeys.all, 'enrollments'] 
      });
    },
  });
};

export const useResumeEnrollment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (enrollmentId: string) => sourcingProjectApiService.resumeEnrollment(enrollmentId),
    onSuccess: () => {
      // Invalidate all enrollment queries
      queryClient.invalidateQueries({ 
        queryKey: [...sequenceQueryKeys.all, 'enrollments'] 
      });
    },
  });
};

export const useSendSequenceEmails = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sequenceId: string) => sourcingProjectApiService.sendSequenceEmails(sequenceId),
    onSuccess: (_, sequenceId) => {
      // Invalidate enrollments and sequence data to reflect updated execution status
      queryClient.invalidateQueries({ 
        queryKey: [...sequenceQueryKeys.detail(sequenceId), 'enrollments'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: sequenceQueryKeys.detail(sequenceId) 
      });
    },
  });
};
