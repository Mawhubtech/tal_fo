import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelineService, Pipeline } from '../services/pipelineService';
import { useAuth } from './useAuth';

/**
 * Hook to get the user's default pipeline, creating one if it doesn't exist
 */
export const useDefaultPipeline = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query to get the user's default pipeline
  const {
    data: defaultPipeline,
    isLoading,
    error,
    refetch
  } = useQuery<Pipeline | null>({
    queryKey: ['pipeline', 'default', user?.id],
    queryFn: () => pipelineService.getUserDefaultPipeline(),
    enabled: !!user?.id, // Only run the query if we have a user ID
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Mutation to create a default pipeline
  const createDefaultMutation = useMutation({
    mutationFn: () => pipelineService.createDefaultPipeline(),
    onSuccess: (newPipeline) => {
      // Update the query cache with the new default pipeline
      queryClient.setQueryData(['pipeline', 'default', user?.id], newPipeline);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      queryClient.invalidateQueries({ queryKey: ['pipelines', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline', 'default'] });
    },
    onError: (error) => {
      console.error('Error creating default pipeline:', error);
    },
  });

  // Function to manually create a default pipeline
  const createDefaultPipeline = async (): Promise<Pipeline | null> => {
    try {
      const result = await createDefaultMutation.mutateAsync();
      return result;
    } catch (error) {
      console.error('Failed to create default pipeline:', error);
      return null;
    }
  };

  return {
    defaultPipeline,
    isLoading: isLoading || createDefaultMutation.isPending,
    error: error || createDefaultMutation.error,
    createDefaultPipeline,
    refetch,
    isCreating: createDefaultMutation.isPending,
  };
};
