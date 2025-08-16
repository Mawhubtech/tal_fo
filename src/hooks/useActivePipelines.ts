import { useQuery } from '@tanstack/react-query';
import { pipelineService, Pipeline } from '../services/pipelineService';

export const useActivePipelines = (type?: 'recruitment' | 'sourcing' | 'client' | 'custom') => {
  return useQuery<Pipeline[]>({
    queryKey: ['pipelines', 'active', type],
    queryFn: async () => {
      const pipelines = await pipelineService.getAllPipelines();
      console.log('All pipelines fetched:', pipelines);
      
      // Filter to only return active pipelines
      let activePipelines = pipelines.filter(pipeline => pipeline.status === 'active');
      console.log('Active pipelines:', activePipelines);
      
      // If type is specified, filter by type
      if (type) {
        activePipelines = activePipelines.filter(pipeline => pipeline.type === type);
        console.log(`Pipelines filtered by type '${type}':`, activePipelines);
      }
      
      // Sort pipelines to show default ones first, then by name
      activePipelines.sort((a, b) => {
        // Default pipelines come first
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        
        // Then sort by name
        return a.name.localeCompare(b.name);
      });
      
      console.log('Final sorted pipelines:', activePipelines);
      return activePipelines;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
