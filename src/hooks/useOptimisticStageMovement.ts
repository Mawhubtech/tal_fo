import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stageMovementService } from '../services/stageMovementService';
import { StageChangeReason } from '../types/stageMovement.types';

interface OptimisticMoveRequest {
  candidateId: string;
  applicationId: string;
  newStageId: string;
  currentStage: string;
  newStage: string;
  organizationId?: string;
}

export const useOptimisticStageMovement = (jobId: string, organizationId?: string) => {
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
    onMutate: async ({ candidateId, newStage, organizationId: requestOrgId }: OptimisticMoveRequest) => {
      // Use the organizationId from the request or the one passed to the hook
      const orgId = requestOrgId || organizationId;
      
      // Cancel any outgoing refetches for both optimized and legacy query keys
      const optimizedQueryKey = ['jobATSPageData', orgId, jobId];
      const legacyQueryKey = ['jobApplications', 'byJob', jobId];
      
      await Promise.all([
        queryClient.cancelQueries({ queryKey: optimizedQueryKey }),
        queryClient.cancelQueries({ queryKey: legacyQueryKey })
      ]);

      // Get current data for rollback
      const previousOptimizedData = queryClient.getQueryData(optimizedQueryKey);
      const previousLegacyData = queryClient.getQueryData(legacyQueryKey);

      // Optimistically update the optimized query cache
      queryClient.setQueryData(optimizedQueryKey, (old: any) => {
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

      // Also update legacy query cache for backward compatibility
      queryClient.setQueryData(legacyQueryKey, (old: any) => {
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

      // Return context for rollback
      return { 
        previousOptimizedData, 
        previousLegacyData, 
        optimizedQueryKey, 
        legacyQueryKey 
      };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context?.previousOptimizedData && context?.optimizedQueryKey) {
        queryClient.setQueryData(context.optimizedQueryKey, context.previousOptimizedData);
      }
      if (context?.previousLegacyData && context?.legacyQueryKey) {
        queryClient.setQueryData(context.legacyQueryKey, context.previousLegacyData);
      }
    },

    // Always refetch after error or success to ensure we have the latest data
    onSettled: (data, error, variables) => {
      const orgId = variables.organizationId || organizationId;
      
      // Invalidate both optimized and legacy queries
      queryClient.invalidateQueries({ queryKey: ['jobATSPageData', orgId, jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobApplications', 'byJob', jobId] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-stats'] });
    },
  });
};
