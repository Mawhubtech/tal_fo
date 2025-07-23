import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clientOutreachProjectApiService, {
  ClientOutreachProject,
  CreateClientOutreachProjectData,
  UpdateClientOutreachProjectData,
  ProjectFilters,
  ProjectSortOptions,
} from '../services/clientOutreachProjectApiService';
import { toast } from '../components/ToastContainer';

// Query keys
export const clientOutreachProjectKeys = {
  all: ['clientOutreachProjects'] as const,
  lists: () => [...clientOutreachProjectKeys.all, 'list'] as const,
  list: (filters?: ProjectFilters, sort?: ProjectSortOptions, page?: number, limit?: number) =>
    [...clientOutreachProjectKeys.lists(), { filters, sort, page, limit }] as const,
  details: () => [...clientOutreachProjectKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientOutreachProjectKeys.details(), id] as const,
  analytics: (id: string) => [...clientOutreachProjectKeys.all, 'analytics', id] as const,
};

// Custom hooks
export const useClientOutreachProjects = (
  page: number = 1,
  limit: number = 10,
  filters?: ProjectFilters,
  sort?: ProjectSortOptions
) => {
  return useQuery({
    queryKey: clientOutreachProjectKeys.list(filters, sort, page, limit),
    queryFn: () => clientOutreachProjectApiService.getProjects(page, limit, filters, sort),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClientOutreachProject = (id: string) => {
  return useQuery({
    queryKey: clientOutreachProjectKeys.detail(id),
    queryFn: () => clientOutreachProjectApiService.getProject(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateClientOutreachProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientOutreachProjectData) =>
      clientOutreachProjectApiService.createProject(data),
    onSuccess: (newProject) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: clientOutreachProjectKeys.lists() });
      
      // Add the new project to the cache
      queryClient.setQueryData(
        clientOutreachProjectKeys.detail(newProject.id),
        newProject
      );
      
      toast.success('Client outreach project created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create project';
      toast.error(message);
    },
  });
};

export const useUpdateClientOutreachProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateClientOutreachProjectData) =>
      clientOutreachProjectApiService.updateProject(data),
    onSuccess: (updatedProject) => {
      // Update the project in the cache
      queryClient.setQueryData(
        clientOutreachProjectKeys.detail(updatedProject.id),
        updatedProject
      );
      
      // Invalidate projects list to update any list views
      queryClient.invalidateQueries({ queryKey: clientOutreachProjectKeys.lists() });
      
      toast.success('Project updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update project';
      toast.error(message);
    },
  });
};

export const useDeleteClientOutreachProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientOutreachProjectApiService.deleteProject(id),
    onSuccess: (_, projectId) => {
      // Remove the project from cache
      queryClient.removeQueries({ queryKey: clientOutreachProjectKeys.detail(projectId) });
      
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: clientOutreachProjectKeys.lists() });
      
      toast.success('Project deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete project';
      toast.error(message);
    },
  });
};

export const useDuplicateClientOutreachProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName?: string }) =>
      clientOutreachProjectApiService.duplicateProject(id, newName),
    onSuccess: (duplicatedProject) => {
      // Add the duplicated project to the cache
      queryClient.setQueryData(
        clientOutreachProjectKeys.detail(duplicatedProject.id),
        duplicatedProject
      );
      
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: clientOutreachProjectKeys.lists() });
      
      toast.success('Project duplicated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to duplicate project';
      toast.error(message);
    },
  });
};

export const useArchiveClientOutreachProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientOutreachProjectApiService.archiveProject(id),
    onSuccess: (archivedProject) => {
      // Update the project in the cache
      queryClient.setQueryData(
        clientOutreachProjectKeys.detail(archivedProject.id),
        archivedProject
      );
      
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: clientOutreachProjectKeys.lists() });
      
      toast.success('Project archived successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to archive project';
      toast.error(message);
    },
  });
};

export const useUnarchiveClientOutreachProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientOutreachProjectApiService.unarchiveProject(id),
    onSuccess: (unarchivedProject) => {
      // Update the project in the cache
      queryClient.setQueryData(
        clientOutreachProjectKeys.detail(unarchivedProject.id),
        unarchivedProject
      );
      
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: clientOutreachProjectKeys.lists() });
      
      toast.success('Project unarchived successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to unarchive project';
      toast.error(message);
    },
  });
};

export const useClientOutreachProjectAnalytics = (projectId: string) => {
  return useQuery({
    queryKey: clientOutreachProjectKeys.analytics(projectId),
    queryFn: () => clientOutreachProjectApiService.getProjectAnalytics(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
