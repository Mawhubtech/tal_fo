import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stageMovementService } from '../services/stageMovementService';
import { StageChangeReason } from '../types/stageMovement.types';
import type { 
  MoveStageRequest, 
  BulkMoveStageRequest, 
  StageMovementHistory,
  StageMovementStats 
} from '../services/stageMovementService';

// Hook for moving a single candidate to a different stage
export const useMoveStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, ...request }: MoveStageRequest & { applicationId: string }) =>
      stageMovementService.moveApplicationToStage(applicationId, request),
    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries - using correct query keys
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] }); // This will invalidate all job application queries
      queryClient.invalidateQueries({ queryKey: ['stage-history', variables.applicationId] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-stats'] });
      queryClient.invalidateQueries({ queryKey: ['applications-by-stage'] });
      
      // The backend returns the updated JobApplication object
      // Update any existing cached job application data
      if (data) {
        queryClient.setQueryData(
          ['job-application', variables.applicationId],
          data
        );
        
        // Also update the job application in any job applications list cache
        // This ensures immediate UI updates
        queryClient.setQueriesData(
          { queryKey: ['jobApplications'], exact: false },
          (oldData: any) => {
            if (!oldData?.applications) return oldData;
            
            const updatedApplications = oldData.applications.map((app: any) => 
              app.id === variables.applicationId ? data : app
            );
            
            return {
              ...oldData,
              applications: updatedApplications
            };
          }
        );
      }
    },
    onError: (error) => {
      console.error('Failed to move candidate to stage:', error);
    },
  });
};

// Hook for bulk moving multiple candidates
export const useBulkMoveStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkMoveStageRequest) =>
      stageMovementService.bulkMoveApplicationsToStage(request),
    onSuccess: (data, variables) => {
      // Invalidate broader queries since multiple applications were affected - using correct query keys
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] }); // This will invalidate all job application queries
      queryClient.invalidateQueries({ queryKey: ['pipeline-stats'] });
      queryClient.invalidateQueries({ queryKey: ['applications-by-stage'] });
      
      // Invalidate stage history for all affected applications
      variables.applicationIds.forEach(appId => {
        queryClient.invalidateQueries({ queryKey: ['stage-history', appId] });
      });
    },
    onError: (error) => {
      console.error('Failed to bulk move candidates:', error);
    },
  });
};

// Hook for fetching stage movement history for a candidate
export const useStageHistory = (applicationId: string) => {
  return useQuery({
    queryKey: ['stage-history', applicationId],
    queryFn: () => stageMovementService.getStageHistory(applicationId),
    enabled: !!applicationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching applications grouped by stage
export const useApplicationsByStage = (pipelineId: string) => {
  return useQuery({
    queryKey: ['applications-by-stage', pipelineId],
    queryFn: () => stageMovementService.getApplicationsByPipelineStage(pipelineId),
    enabled: !!pipelineId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook for fetching stage movement statistics
export const useStageStats = (pipelineId: string, timeframe?: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['stage-stats', pipelineId, timeframe],
    queryFn: () => stageMovementService.getStageMovementStats(pipelineId, timeframe),
    enabled: !!pipelineId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Combined hook for stage movement operations with common patterns
export const useStageMovement = () => {
  const moveStage = useMoveStage();
  const bulkMoveStage = useBulkMoveStage();

  // Helper function for moving with common defaults
  const moveWithDefaults = (
    applicationId: string,
    toStageId: string,
    options?: {
      reason?: string;
      notes?: string;
      metadata?: Record<string, any>;
    }
  ) => {
    return moveStage.mutateAsync({
      applicationId,
      toStageId,
      reason: options?.reason || StageChangeReason.MANUAL_MOVE,
      notes: options?.notes,
      metadata: options?.metadata,
    });
  };

  // Helper function for drag-and-drop movements
  const moveCandidateByDragDrop = (
    applicationId: string,
    toStageId: string,
    fromStageName?: string,
    toStageName?: string
  ) => {
    return moveStage.mutateAsync({
      applicationId,
      toStageId,
      reason: StageChangeReason.DRAG_DROP,
      notes: fromStageName && toStageName 
        ? `Moved from "${fromStageName}" to "${toStageName}" via drag and drop`
        : 'Moved via drag and drop',
      metadata: {
        moveType: 'drag_drop',
        fromStage: fromStageName,
        toStage: toStageName,
      },
    });
  };

  // Helper function for automated movements (e.g., after interview completion)
  const moveAfterInterview = (
    applicationId: string,
    toStageId: string,
    interviewScore?: number,
    notes?: string
  ) => {
    return moveStage.mutateAsync({
      applicationId,
      toStageId,
      reason: StageChangeReason.INTERVIEW_COMPLETED,
      notes: notes || 'Moved after interview completion',
      metadata: {
        moveType: 'automated',
        trigger: 'interview_completed',
        interviewScore,
      },
    });
  };

  return {
    // Core mutations
    moveStage: moveStage.mutateAsync,
    bulkMoveStage: bulkMoveStage.mutateAsync,
    
    // Helper functions
    moveWithDefaults,
    moveCandidateByDragDrop,
    moveAfterInterview,
    
    // State
    isMoving: moveStage.isPending,
    isBulkMoving: bulkMoveStage.isPending,
    moveError: moveStage.error,
    bulkMoveError: bulkMoveStage.error,
    
    // Reset functions
    resetMoveError: moveStage.reset,
    resetBulkMoveError: bulkMoveStage.reset,
  };
};

// Hook for optimistic updates when moving stages
export const useOptimisticStageMove = () => {
  const queryClient = useQueryClient();
  const moveStage = useMoveStage();

  const moveWithOptimisticUpdate = async (
    applicationId: string,
    toStageId: string,
    toStageName: string,
    options?: {
      reason?: string;
      notes?: string;
      metadata?: Record<string, any>;
    }
  ) => {
    // Optimistically update the UI
    const previousData = queryClient.getQueryData(['job-application', applicationId]);
    
    queryClient.setQueryData(['job-application', applicationId], (old: any) => {
      if (old) {
        return {
          ...old,
          currentPipelineStageId: toStageId,
          currentPipelineStageName: toStageName,
          stageEnteredAt: new Date().toISOString(),
        };
      }
      return old;
    });

    try {
      // Perform the actual API call
      await moveStage.mutateAsync({
        applicationId,
        toStageId,
        reason: options?.reason || StageChangeReason.MANUAL_MOVE,
        notes: options?.notes,
        metadata: options?.metadata,
      });
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData(['job-application', applicationId], previousData);
      throw error;
    }
  };

  return {
    moveWithOptimisticUpdate,
    isMoving: moveStage.isPending,
    error: moveStage.error,
  };
};
