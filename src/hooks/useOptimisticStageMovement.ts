import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stageMovementService } from '../services/stageMovementService';
import { StageChangeReason } from '../types/stageMovement.types';

interface OptimisticMoveRequest {
  candidateId: string;
  applicationId: string;
  newStageId: string;
  currentStage: string;
  newStage: string;
}

export const useOptimisticStageMovement = (jobId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, newStageId, currentStage, newStage }: OptimisticMoveRequest) => {
      return stageMovementService.moveApplicationToStage(applicationId, {
        toStageId: newStageId,
        reason: StageChangeReason.DRAG_DROP,
        notes: `Moved from ${currentStage} to ${newStage} via drag and drop`
      });
    },
    
    // Optimistic update - runs immediately when mutation is called
    onMutate: async ({ candidateId, newStage }: OptimisticMoveRequest) => {
      // Cancel any outgoing refetches for job applications (using correct query key)
      const queryKey = ['jobApplications', 'byJob', jobId];
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousApplications = queryClient.getQueryData(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.applications) return old;

        return {
          ...old,
          applications: old.applications.map((app: any) => {
            if (app.candidateId === candidateId || app.candidate?.id === candidateId) {
              return {
                ...app,
                stage: newStage,
                currentPipelineStageName: newStage
              };
            }
            return app;
          })
        };
      });

      // Return a context object with the snapshotted value
      return { previousApplications, queryKey };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context?.previousApplications && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousApplications);
      }
    },

    // Always refetch after error or success to ensure we have the latest data
    onSettled: () => {
      const queryKey = ['jobApplications', 'byJob', jobId];
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['pipeline-stats'] });
    },
  });
};
