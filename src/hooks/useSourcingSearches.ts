import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  sourcingProjectApiService,
  SourcingSearch,
  CreateSourcingSearchDto,
  UpdateSourcingSearchDto
} from '../services/sourcingProjectApiService';
import { projectQueryKeys } from './useSourcingProjects';

// Query Keys
export const searchQueryKeys = {
  all: ['sourcing-searches'] as const,
  byProject: (projectId: string) => [...searchQueryKeys.all, 'project', projectId] as const,
  detail: (id: string) => [...searchQueryKeys.all, 'detail', id] as const,
  analytics: (projectId: string) => [...searchQueryKeys.byProject(projectId), 'analytics'] as const,
};

// Search Queries
export const useProjectSearches = (projectId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: searchQueryKeys.byProject(projectId),
    queryFn: () => sourcingProjectApiService.getProjectSearches(projectId),
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSearch = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: searchQueryKeys.detail(id),
    queryFn: () => sourcingProjectApiService.getSearch(id),
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useSearchAnalytics = (projectId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: searchQueryKeys.analytics(projectId),
    queryFn: () => sourcingProjectApiService.getSearchAnalytics(projectId),
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000,
  });
};

// Search Mutations
export const useCreateSearch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSourcingSearchDto) => sourcingProjectApiService.createSearch(data),
    onSuccess: (newSearch) => {
      // Invalidate project searches
      queryClient.invalidateQueries({ 
        queryKey: searchQueryKeys.byProject(newSearch.projectId) 
      });
      // Update project stats
      queryClient.invalidateQueries({ 
        queryKey: projectQueryKeys.stats(newSearch.projectId) 
      });
    },
  });
};

export const useUpdateSearch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSourcingSearchDto }) =>
      sourcingProjectApiService.updateSearch(id, data),
    onSuccess: (updatedSearch) => {
      // Update the specific search in cache
      queryClient.setQueryData(
        searchQueryKeys.detail(updatedSearch.id),
        updatedSearch
      );
      // Invalidate project searches list
      queryClient.invalidateQueries({ 
        queryKey: searchQueryKeys.byProject(updatedSearch.projectId) 
      });
    },
  });
};

export const useExecuteSearch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => sourcingProjectApiService.executeSearch(id),
    onSuccess: (updatedSearch) => {
      // Update the specific search in cache
      queryClient.setQueryData(
        searchQueryKeys.detail(updatedSearch.id),
        updatedSearch
      );
      // Invalidate project searches list
      queryClient.invalidateQueries({ 
        queryKey: searchQueryKeys.byProject(updatedSearch.projectId) 
      });
    },
  });
};

export const useCompleteSearch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      results 
    }: { 
      id: string; 
      results: { resultsCount: number; prospectsAdded: number; resultsMetadata?: any };
    }) =>
      sourcingProjectApiService.completeSearch(id, results),
    onSuccess: (updatedSearch) => {
      // Update the specific search in cache
      queryClient.setQueryData(
        searchQueryKeys.detail(updatedSearch.id),
        updatedSearch
      );
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: searchQueryKeys.byProject(updatedSearch.projectId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: projectQueryKeys.stats(updatedSearch.projectId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: projectQueryKeys.prospects(updatedSearch.projectId) 
      });
    },
  });
};

export const useCancelSearch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => sourcingProjectApiService.cancelSearch(id),
    onSuccess: (updatedSearch) => {
      // Update the specific search in cache
      queryClient.setQueryData(
        searchQueryKeys.detail(updatedSearch.id),
        updatedSearch
      );
      // Invalidate project searches list
      queryClient.invalidateQueries({ 
        queryKey: searchQueryKeys.byProject(updatedSearch.projectId) 
      });
    },
  });
};

export const useDeleteSearch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => sourcingProjectApiService.deleteSearch(id),
    onMutate: async (id) => {
      // Get the search to know which project to update
      const search = queryClient.getQueryData<SourcingSearch>(searchQueryKeys.detail(id));
      return { projectId: search?.projectId };
    },
    onSuccess: (_, id, context) => {
      // Remove the search from cache
      queryClient.removeQueries({ queryKey: searchQueryKeys.detail(id) });
      // Invalidate project searches list
      if (context?.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: searchQueryKeys.byProject(context.projectId) 
        });
      }
    },
  });
};
