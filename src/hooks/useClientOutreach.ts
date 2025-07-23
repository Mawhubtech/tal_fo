import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientOutreachApiService, {
  ClientOutreachProject,
  ClientOutreachSearch,
  ClientProspect,
  CreateProjectData,
  UpdateProjectData,
  CreateSearchData,
  SearchCompaniesData,
  UpdateProspectData,
  PaginationParams,
  SearchCompaniesResult,
  ExtractKeywordsResult
} from '../services/clientOutreachApiService';

// ===============================================
// PROJECT HOOKS
// ===============================================

export const useProjects = () => {
  return useQuery({
    queryKey: ['client-outreach', 'projects'],
    queryFn: () => clientOutreachApiService.getProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ['client-outreach', 'projects', projectId],
    queryFn: () => clientOutreachApiService.getProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProjectData) => clientOutreachApiService.createProject(data),
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: ['client-outreach', 'projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProjectData> }) =>
      clientOutreachApiService.updateProject(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific project and projects list
      queryClient.invalidateQueries({ queryKey: ['client-outreach', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['client-outreach', 'projects', id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clientOutreachApiService.deleteProject(id),
    onSuccess: () => {
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: ['client-outreach', 'projects'] });
    },
  });
};

// ===============================================
// SEARCH HOOKS
// ===============================================

export const useProjectSearches = (projectId: string) => {
  return useQuery({
    queryKey: ['client-outreach', 'projects', projectId, 'searches'],
    queryFn: () => clientOutreachApiService.getProjectSearches(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAllSearches = () => {
  return useQuery({
    queryKey: ['client-outreach', 'searches'],
    queryFn: () => clientOutreachApiService.getAllSearches(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchCompanies = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data, pagination }: { data: SearchCompaniesData; pagination?: PaginationParams }) =>
      clientOutreachApiService.searchCompanies(data, pagination),
    onSuccess: (result, { data }) => {
      // Invalidate searches for the project if projectId is provided
      if (data.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: ['client-outreach', 'projects', data.projectId, 'searches'] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['client-outreach', 'projects', data.projectId, 'prospects'] 
        });
      }
      queryClient.invalidateQueries({ queryKey: ['client-outreach', 'searches'] });
    },
  });
};

export const useExtractKeywords = () => {
  return useMutation({
    mutationFn: (searchText: string) => clientOutreachApiService.extractKeywords(searchText),
  });
};

export const useGenerateCoreSignalQuery = () => {
  return useMutation({
    mutationFn: (filters: any) => clientOutreachApiService.generateCoreSignalQuery(filters),
  });
};

// ===============================================
// PROSPECT HOOKS
// ===============================================

export const useProjectProspects = (projectId: string) => {
  return useQuery({
    queryKey: ['client-outreach', 'projects', projectId, 'prospects'],
    queryFn: () => clientOutreachApiService.getProjectProspects(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchProspects = (searchId: string) => {
  return useQuery({
    queryKey: ['client-outreach', 'searches', searchId, 'prospects'],
    queryFn: () => clientOutreachApiService.getSearchProspects(searchId),
    enabled: !!searchId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateProspect = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProspectData }) =>
      clientOutreachApiService.updateProspect(id, data),
    onSuccess: (prospect) => {
      // Invalidate related queries
      if (prospect.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: ['client-outreach', 'projects', prospect.projectId, 'prospects'] 
        });
      }
      if (prospect.searchId) {
        queryClient.invalidateQueries({ 
          queryKey: ['client-outreach', 'searches', prospect.searchId, 'prospects'] 
        });
      }
    },
  });
};

export const useDeleteProspect = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clientOutreachApiService.deleteProspect(id),
    onSuccess: () => {
      // Invalidate all prospects queries
      queryClient.invalidateQueries({ queryKey: ['client-outreach', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['client-outreach', 'searches'] });
    },
  });
};

// ===============================================
// ANALYTICS HOOKS
// ===============================================

export const useProjectAnalytics = (projectId: string) => {
  return useQuery({
    queryKey: ['client-outreach', 'projects', projectId, 'analytics'],
    queryFn: () => clientOutreachApiService.getProjectAnalytics(projectId),
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000, // 10 minutes for analytics
  });
};

// ===============================================
// COMBINED HOOKS FOR COMPLEX SCENARIOS
// ===============================================

export const useProjectWithDetails = (projectId: string) => {
  const projectQuery = useProject(projectId);
  const searchesQuery = useProjectSearches(projectId);
  const prospectsQuery = useProjectProspects(projectId);
  const analyticsQuery = useProjectAnalytics(projectId);

  return {
    project: projectQuery.data,
    searches: searchesQuery.data || [],
    prospects: prospectsQuery.data || [],
    analytics: analyticsQuery.data,
    isLoading: projectQuery.isLoading || searchesQuery.isLoading || prospectsQuery.isLoading,
    error: projectQuery.error || searchesQuery.error || prospectsQuery.error,
    refetch: () => {
      projectQuery.refetch();
      searchesQuery.refetch();
      prospectsQuery.refetch();
      analyticsQuery.refetch();
    },
  };
};

// ===============================================
// SEARCH FLOW HOOK
// ===============================================

export const useCompanySearchFlow = () => {
  const [currentStep, setCurrentStep] = useState<'input' | 'extracting' | 'searching' | 'results'>('input');
  const [searchText, setSearchText] = useState('');
  const [extractedFilters, setExtractedFilters] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<SearchCompaniesResult | null>(null);

  const extractKeywordsMutation = useExtractKeywords();
  const searchCompaniesMutation = useSearchCompanies();

  const startSearch = async (text: string, projectId?: string, searchName?: string) => {
    setSearchText(text);
    setCurrentStep('extracting');

    try {
      // Step 1: Extract keywords
      const keywordsResult = await extractKeywordsMutation.mutateAsync(text);
      setExtractedFilters(keywordsResult.extractedFilters);
      setCurrentStep('searching');

      // Step 2: Search companies
      const searchData: SearchCompaniesData = {
        filters: keywordsResult.extractedFilters,
        searchText: text,
        searchName: searchName || `Search: ${text.substring(0, 50)}...`,
        projectId,
        searchType: 'ai',
      };

      const results = await searchCompaniesMutation.mutateAsync({ data: searchData });
      setSearchResults(results);
      setCurrentStep('results');

      return results;
    } catch (error) {
      setCurrentStep('input');
      throw error;
    }
  };

  const reset = () => {
    setCurrentStep('input');
    setSearchText('');
    setExtractedFilters(null);
    setSearchResults(null);
  };

  return {
    currentStep,
    searchText,
    extractedFilters,
    searchResults,
    isLoading: extractKeywordsMutation.isPending || searchCompaniesMutation.isPending,
    error: extractKeywordsMutation.error || searchCompaniesMutation.error,
    startSearch,
    reset,
  };
};
