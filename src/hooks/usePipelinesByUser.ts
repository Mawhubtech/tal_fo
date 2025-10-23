import { useQuery } from '@tanstack/react-query';
import { pipelineService, Pipeline } from '../services/pipelineService';

/**
 * Hook to get pipelines created by a specific user
 */
export const usePipelinesByUser = (userId: string) => {
  return useQuery<Pipeline[]>({
    queryKey: ['pipelines', 'user', userId],
    queryFn: () => pipelineService.getPipelinesByUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
