import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sourcingApiService, SourcingProspectQueryParams, CreateSourcingProspectDto, AddProspectsToProjectDto, MoveSourcingProspectStageDto } from '../services/sourcingApiService';

// Query keys for React Query
const SOURCING_QUERY_KEYS = {
  prospects: 'sourcing_prospects',
  prospect: 'sourcing_prospect',
  prospectStats: 'sourcing_prospect_stats',
  pipelineStats: 'sourcing_pipeline_stats',
  conversionRates: 'sourcing_conversion_rates',
  defaultPipeline: 'sourcing_default_pipeline',
  prospectsByPipeline: 'sourcing_prospects_by_pipeline',
  prospectsByStage: 'sourcing_prospects_by_stage',
  projectProspects: 'project_prospects',
  projectStats: 'project_stats',
};

// Hook to fetch sourcing prospects with filters and pagination
export const useSourcingProspects = (params: SourcingProspectQueryParams = {}) => {
  return useQuery({
    queryKey: [SOURCING_QUERY_KEYS.prospects, params],
    queryFn: () => sourcingApiService.getProspects(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch prospects for a specific project
export const useProjectProspects = (projectId: string) => {
  return useQuery({
    queryKey: [SOURCING_QUERY_KEYS.projectProspects, projectId],
    queryFn: () => sourcingApiService.getProjectProspects(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch stats for a specific project
export const useProjectStats = (projectId: string) => {
  return useQuery({
    queryKey: [SOURCING_QUERY_KEYS.projectStats, projectId],
    queryFn: () => sourcingApiService.getProjectStats(projectId),
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch a single sourcing prospect
export const useSourcingProspect = (id: string) => {
  return useQuery({
    queryKey: [SOURCING_QUERY_KEYS.prospect, id],
    queryFn: () => sourcingApiService.getProspect(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to fetch sourcing prospect statistics
export const useSourcingProspectStats = () => {
  return useQuery({
    queryKey: [SOURCING_QUERY_KEYS.prospectStats],
    queryFn: () => sourcingApiService.getProspectStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch pipeline statistics
export const useSourcingPipelineStats = (pipelineId: string) => {
  return useQuery({
    queryKey: [SOURCING_QUERY_KEYS.pipelineStats, pipelineId],
    queryFn: () => sourcingApiService.getPipelineStats(pipelineId),
    enabled: !!pipelineId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to fetch conversion rates
export const useSourcingConversionRates = (pipelineId: string) => {
  return useQuery({
    queryKey: [SOURCING_QUERY_KEYS.conversionRates, pipelineId],
    queryFn: () => sourcingApiService.getConversionRates(pipelineId),
    enabled: !!pipelineId,
    staleTime: 10 * 60 * 1000,
  });
};

// Hook to get or create default sourcing pipeline
export const useSourcingDefaultPipeline = () => {
  return useQuery({
    queryKey: [SOURCING_QUERY_KEYS.defaultPipeline],
    queryFn: () => sourcingApiService.getDefaultPipeline(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook to fetch prospects by pipeline
export const useSourcingProspectsByPipeline = (pipelineId: string) => {
  return useQuery({
    queryKey: [SOURCING_QUERY_KEYS.prospectsByPipeline, pipelineId],
    queryFn: () => sourcingApiService.getProspectsByPipeline(pipelineId),
    enabled: !!pipelineId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to fetch prospects by stage
export const useSourcingProspectsByStage = (stageId: string) => {
  return useQuery({
    queryKey: [SOURCING_QUERY_KEYS.prospectsByStage, stageId],
    queryFn: () => sourcingApiService.getProspectsByStage(stageId),
    enabled: !!stageId,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation hook to create a new prospect
export const useCreateSourcingProspect = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSourcingProspectDto) => sourcingApiService.createProspect(data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch prospects
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospects] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospectStats] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.pipelineStats] });
      
      // If projectId is provided, also invalidate project-specific queries
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.projectProspects, variables.projectId] });
        queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.projectStats, variables.projectId] });
      }
    },
  });
};

// Mutation hook to add prospects to a project (bulk operation)
export const useAddProspectsToProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: AddProspectsToProjectDto }) => 
      sourcingApiService.addProspectsToProject(projectId, data),
    onSuccess: (_, variables) => {
      // Invalidate project-specific queries
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.projectProspects, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.projectStats, variables.projectId] });
      
      // Also invalidate general prospect queries
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospects] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospectStats] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.pipelineStats] });
    },
  });
};

// Mutation hook to update a prospect
export const useUpdateSourcingProspect = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSourcingProspectDto> }) =>
      sourcingApiService.updateProspect(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch prospects
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospects] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospect, variables.id] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospectStats] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.pipelineStats] });
    },
  });
};

// Mutation hook to move prospect to a different stage
export const useMoveSourcingProspectStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveSourcingProspectStageDto }) =>
      sourcingApiService.moveProspectToStage(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospects] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospect, variables.id] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.pipelineStats] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.conversionRates] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospectsByStage] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospectsByPipeline] });
    },
  });
};

// Mutation hook to delete a prospect
export const useDeleteSourcingProspect = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sourcingApiService.deleteProspect(id),
    onSuccess: (_, deletedProspectId) => {
      // Invalidate and refetch prospects data
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospects] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospectStats] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.pipelineStats] });
      
      // Invalidate project prospects data (used by EnrollCandidatesModal)
      queryClient.invalidateQueries({ queryKey: ['sourcing-projects'] });
      
      // Invalidate sequence enrollments data since a prospect (candidate) was deleted
      // This will refresh enrollment counts and candidate lists in all sequence components
      queryClient.invalidateQueries({ queryKey: ['sourcing-sequences'] });
      
      console.log(`Cache invalidated for deleted prospect: ${deletedProspectId}`);
    },
  });
};

// Mutation hook for bulk moving prospects
export const useBulkMoveSourcingProspects = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ prospectIds, targetStageId, notes }: { prospectIds: string[]; targetStageId: string; notes?: string }) =>
      sourcingApiService.bulkMoveProspects(prospectIds, targetStageId, notes),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospects] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.pipelineStats] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.conversionRates] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospectsByStage] });
      queryClient.invalidateQueries({ queryKey: [SOURCING_QUERY_KEYS.prospectsByPipeline] });
    },
  });
};
