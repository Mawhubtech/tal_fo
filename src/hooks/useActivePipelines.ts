import { useQuery } from '@tanstack/react-query';
import { pipelineService, Pipeline } from '../services/pipelineService';

export const useActivePipelines = () => {
  return useQuery<Pipeline[]>({
    queryKey: ['pipelines', 'active'],
    queryFn: async () => {
      const pipelines = await pipelineService.getAllPipelines();
      // Filter to only return active pipelines for job creation
      return pipelines.filter(pipeline => pipeline.status === 'active');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
