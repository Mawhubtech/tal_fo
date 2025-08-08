import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { searchApiService } from '../services/searchApiService';
import type { SearchFilters } from '../services/searchService';

export interface SearchParams {
  filters: SearchFilters;
  searchText?: string;
  pagination?: {
    page: number;
    limit: number;
  };
  after?: string; // For external source pagination
}

export interface SearchResult {
  candidate: any;
  matchScore: number;
  matchCriteria: {
    titleMatch: boolean;
    skillMatch: string[];
    locationMatch: boolean;
    companyMatch: boolean;
    keywordMatches: string[];
  };
}

export interface SearchResponse {
  candidates: SearchResult[];
  totalCount: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
  externalPagination?: {
    nextCursor?: string;
    hasNextPage: boolean;
    totalPages?: number;
    totalResults?: number;
  };
}

export const useSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const searchMutation = useMutation({
    mutationFn: (params: SearchParams) => searchApiService.searchCandidates(params),
    onSuccess: (data) => {
      console.log('Search completed successfully:', data);
    },
    onError: (error) => {
      console.error('Search failed:', error);
    },
  });

  const executeSearch = (params: SearchParams) => {
    setSearchParams(params);
    return searchMutation.mutateAsync(params);
  };

  return {
    executeSearch,
    isLoading: searchMutation.isPending,
    error: searchMutation.error,
    data: searchMutation.data,
    reset: () => {
      searchMutation.reset();
      setSearchParams(null);
    },
  };
};

// Hook for CoreSignal search
export const useCoreSignalSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const searchMutation = useMutation({
    mutationFn: (params: SearchParams) => searchApiService.searchCandidatesWithCoreSignal(params),
    onSuccess: (data) => {
      console.log('CoreSignal search completed successfully:', data);
    },
    onError: (error) => {
      console.error('CoreSignal search failed:', error);
    },
  });

  const executeSearch = (params: SearchParams) => {
    setSearchParams(params);
    return searchMutation.mutateAsync(params);
  };

  return {
    executeSearch,
    isLoading: searchMutation.isPending,
    error: searchMutation.error,
    data: searchMutation.data,
    reset: () => {
      searchMutation.reset();
      setSearchParams(null);
    },
  };
};

// Hook for combined search
export const useCombinedSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const searchMutation = useMutation({
    mutationFn: ({ params, includeExternal }: { params: SearchParams; includeExternal?: boolean }) => 
      searchApiService.searchCandidatesCombined(params, includeExternal),
    onSuccess: (data) => {
      console.log('Combined search completed successfully:', data);
    },
    onError: (error) => {
      console.error('Combined search failed:', error);
    },
  });

  const executeSearch = (params: SearchParams, includeExternal: boolean = true) => {
    setSearchParams(params);
    return searchMutation.mutateAsync({ params, includeExternal });
  };

  return {
    executeSearch,
    isLoading: searchMutation.isPending,
    error: searchMutation.error,
    data: searchMutation.data,
    reset: () => {
      searchMutation.reset();
      setSearchParams(null);
    },
  };
};

// Hook for extracting keywords
export const useExtractKeywords = () => {
  return useMutation({
    mutationFn: (jobDescription: string) => searchApiService.extractKeywords(jobDescription),
  });
};

// Hook for converting filters
export const useConvertFilters = () => {
  return useMutation({
    mutationFn: (filters: any) => searchApiService.convertFilters(filters),
  });
};
