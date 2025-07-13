import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  sourcingProjectApiService,
  SourcingProject,
  CreateSourcingProjectDto,
  UpdateSourcingProjectDto,
  SourcingProjectQueryParams
} from '../services/sourcingProjectApiService';

// Query Keys
export const projectQueryKeys = {
  all: ['sourcing-projects'] as const,
  lists: () => [...projectQueryKeys.all, 'list'] as const,
  list: (params: SourcingProjectQueryParams) => [...projectQueryKeys.lists(), params] as const,
  details: () => [...projectQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectQueryKeys.details(), id] as const,
  analytics: (id: string) => [...projectQueryKeys.detail(id), 'analytics'] as const,
  prospects: (id: string) => [...projectQueryKeys.detail(id), 'prospects'] as const,
  stats: (id: string) => [...projectQueryKeys.detail(id), 'stats'] as const,
};

// Project Queries
export const useProjects = (params: SourcingProjectQueryParams = {}) => {
  return useQuery({
    queryKey: projectQueryKeys.list(params),
    queryFn: () => sourcingProjectApiService.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProject = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: projectQueryKeys.detail(id),
    queryFn: () => sourcingProjectApiService.getProject(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProjectAnalytics = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: projectQueryKeys.analytics(id),
    queryFn: () => sourcingProjectApiService.getProjectAnalytics(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes for analytics
  });
};

export const useProjectProspects = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: projectQueryKeys.prospects(id),
    queryFn: () => sourcingProjectApiService.getProjectProspects(id),
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useProjectStats = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: projectQueryKeys.stats(id),
    queryFn: () => sourcingProjectApiService.getProjectStats(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Project Mutations
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSourcingProjectDto) => sourcingProjectApiService.createProject(data),
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSourcingProjectDto }) =>
      sourcingProjectApiService.updateProject(id, data),
    onSuccess: (updatedProject) => {
      // Update the specific project in cache
      queryClient.setQueryData(
        projectQueryKeys.detail(updatedProject.id),
        updatedProject
      );
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => sourcingProjectApiService.deleteProject(id),
    onSuccess: (_, id) => {
      // Remove the project from cache
      queryClient.removeQueries({ queryKey: projectQueryKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
    },
  });
};

export const useAddCollaborators = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userIds }: { id: string; userIds: string[] }) =>
      sourcingProjectApiService.addCollaborators(id, userIds),
    onSuccess: (updatedProject) => {
      // Update the specific project in cache
      queryClient.setQueryData(
        projectQueryKeys.detail(updatedProject.id),
        updatedProject
      );
    },
  });
};

export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      sourcingProjectApiService.removeCollaborator(id, userId),
    onSuccess: (updatedProject) => {
      // Update the specific project in cache
      queryClient.setQueryData(
        projectQueryKeys.detail(updatedProject.id),
        updatedProject
      );
    },
  });
};

export const useAddProspectsToProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      projectId, 
      candidateIds, 
      searchId 
    }: { 
      projectId: string; 
      candidateIds: string[]; 
      searchId?: string;
    }) =>
      sourcingProjectApiService.addProspectsToProject(projectId, candidateIds, searchId),
    onSuccess: (_, { projectId }) => {
      // Invalidate project prospects and stats
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.prospects(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.stats(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.analytics(projectId) });
      // Update project detail to reflect new progress
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
    },
  });
};
