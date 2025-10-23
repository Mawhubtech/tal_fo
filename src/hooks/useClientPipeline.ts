import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelineService, Pipeline } from '../services/pipelineService';

export const useClientDefaultPipeline = () => {
  return useQuery({
    queryKey: ['pipeline', 'client', 'default'],
    queryFn: async (): Promise<Pipeline> => {
      // First try to get existing default client pipeline
      let pipeline = await pipelineService.getUserDefaultPipelineByType('client');
      
      // If no default client pipeline exists, create one
      if (!pipeline) {
        pipeline = await pipelineService.createDefaultPipeline('client');
      }
      
      return pipeline;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useClientPipelines = () => {
  return useQuery({
    queryKey: ['pipelines', 'client'],
    queryFn: async (): Promise<Pipeline[]> => {
      const allPipelines = await pipelineService.getAllPipelines();
      return allPipelines.filter(p => p.type === 'client' && p.status === 'active');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateClientPipeline = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: pipelineService.createPipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines', 'client'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline', 'client', 'default'] });
    },
  });
};
