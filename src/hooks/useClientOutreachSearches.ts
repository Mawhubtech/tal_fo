import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clientOutreachProjectApiService, {
  ClientOutreachSearch,
  CreateClientOutreachSearchData,
  UpdateClientOutreachSearchData,
} from '../services/clientOutreachProjectApiService';
import { toast } from '../components/ToastContainer';

// Query keys
export const clientOutreachSearchKeys = {
  all: ['clientOutreachSearches'] as const,
  lists: () => [...clientOutreachSearchKeys.all, 'list'] as const,
  list: (projectId: string) => [...clientOutreachSearchKeys.lists(), projectId] as const,
  details: () => [...clientOutreachSearchKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientOutreachSearchKeys.details(), id] as const,
};

// Custom hooks
export const useClientOutreachProjectSearches = (projectId: string) => {
  return useQuery({
    queryKey: clientOutreachSearchKeys.list(projectId),
    queryFn: () => clientOutreachProjectApiService.getProjectSearches(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClientOutreachSearch = (id: string) => {
  return useQuery({
    queryKey: clientOutreachSearchKeys.detail(id),
    queryFn: () => clientOutreachProjectApiService.getSearch(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateClientOutreachSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientOutreachSearchData) =>
      clientOutreachProjectApiService.createSearch(data),
    onSuccess: (newSearch) => {
      // Invalidate and refetch searches list for the project
      queryClient.invalidateQueries({ 
        queryKey: clientOutreachSearchKeys.list(newSearch.projectId) 
      });
      
      // Add the new search to the cache
      queryClient.setQueryData(
        clientOutreachSearchKeys.detail(newSearch.id),
        newSearch
      );
      
      toast.success('Search created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create search';
      toast.error(message);
    },
  });
};

export const useUpdateClientOutreachSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateClientOutreachSearchData) =>
      clientOutreachProjectApiService.updateSearch(data),
    onSuccess: (updatedSearch) => {
      // Update the search in the cache
      queryClient.setQueryData(
        clientOutreachSearchKeys.detail(updatedSearch.id),
        updatedSearch
      );
      
      // Invalidate searches list to update any list views
      queryClient.invalidateQueries({ 
        queryKey: clientOutreachSearchKeys.list(updatedSearch.projectId) 
      });
      
      toast.success('Search updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update search';
      toast.error(message);
    },
  });
};

export const useDeleteClientOutreachSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientOutreachProjectApiService.deleteSearch(id),
    onSuccess: (_, searchId) => {
      // Remove the search from cache
      queryClient.removeQueries({ queryKey: clientOutreachSearchKeys.detail(searchId) });
      
      // Invalidate all searches lists
      queryClient.invalidateQueries({ queryKey: clientOutreachSearchKeys.lists() });
      
      toast.success('Search deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete search';
      toast.error(message);
    },
  });
};

export const useRunClientOutreachSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientOutreachProjectApiService.runSearch(id),
    onSuccess: (result, searchId) => {
      // Invalidate the search to refresh its results
      queryClient.invalidateQueries({ queryKey: clientOutreachSearchKeys.detail(searchId) });
      
      // Invalidate searches list to update status
      queryClient.invalidateQueries({ queryKey: clientOutreachSearchKeys.lists() });
      
      toast.success(`Search completed! Found ${result.resultsCount} new prospects.`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to run search';
      toast.error(message);
    },
  });
};
