import apiClient from '../lib/api';
import type { SearchFilters } from './searchService';

export interface SearchParams {
  filters: SearchFilters;
  searchText?: string;
  pagination?: {
    page: number;
    limit: number;
  };
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
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CandidateSummaryRequest {
  candidateId: string;
}

export interface CandidateSummaryResponse {
  summary: string;
  keyStrengths: string[];
  relevantExperience: string[];
  matchHighlights: string[];
}

class SearchApiService {
  /**
   * Search candidates with filters and text search (local database)
   */
  async searchCandidates(params: SearchParams): Promise<SearchResponse> {
    try {
      // Extract pagination from params and send as query parameters
      const { pagination, ...bodyParams } = params;
      
      const queryParams = new URLSearchParams();
      if (pagination?.page) {
        queryParams.append('page', pagination.page.toString());
      }
      if (pagination?.limit) {
        queryParams.append('limit', pagination.limit.toString());
      }
      
      const url = `/search/candidates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.post(url, bodyParams);
      return response.data;
    } catch (error) {
      console.error('Error searching candidates:', error);
      throw error;
    }
  }

  /**
   * Search candidates using CoreSignal API for external candidate data
   */
  async searchCandidatesWithCoreSignal(params: SearchParams): Promise<SearchResponse> {
    try {
      // Extract pagination from params and send as query parameters
      const { pagination, ...bodyParams } = params;
      
      const queryParams = new URLSearchParams();
      if (pagination?.page) {
        queryParams.append('page', pagination.page.toString());
      }
      if (pagination?.limit) {
        queryParams.append('limit', pagination.limit.toString());
      }
      
      const url = `/search/candidates/coresignal${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.post(url, bodyParams);
      return response.data;
    } catch (error) {
      console.error('Error searching candidates with CoreSignal:', error);
      throw error;
    }
  }

  /**
   * Search candidates from both local database and CoreSignal API
   */
  async searchCandidatesCombined(params: SearchParams, includeExternal: boolean = true): Promise<SearchResponse> {
    try {
      // Extract pagination from params and send as query parameters
      const { pagination, ...bodyParams } = params;
      
      const queryParams = new URLSearchParams();
      if (pagination?.page) {
        queryParams.append('page', pagination.page.toString());
      }
      if (pagination?.limit) {
        queryParams.append('limit', pagination.limit.toString());
      }
      if (includeExternal !== undefined) {
        queryParams.append('includeExternal', includeExternal.toString());
      }
      
      const url = `/search/candidates/combined${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.post(url, bodyParams);
      return response.data;
    } catch (error) {
      console.error('Error searching candidates with combined search:', error);
      throw error;
    }
  }

  /**
   * Extract keywords from job description
   */
  async extractKeywords(jobDescription: string): Promise<{ keywords: string[]; requirements: string[] }> {
    try {
      const response = await apiClient.post('/search/extract-keywords', { 
        jobDescription 
      });
      return response.data;
    } catch (error) {
      console.error('Error extracting keywords:', error);
      throw error;
    }
  }

  /**
   * Convert filters to search format
   */
  async convertFilters(filters: any): Promise<SearchFilters> {
    try {
      const response = await apiClient.post('/search/convert-filters', { 
        filters 
      });
      return response.data;
    } catch (error) {
      console.error('Error converting filters:', error);
      throw error;
    }
  }

  /**
   * Generate AI summary for a candidate
   */
  async generateCandidateSummary(candidateId: string): Promise<CandidateSummaryResponse> {
    try {
      const response = await apiClient.post('/search/candidate-summary', { 
        candidateId 
      });
      return response.data;
    } catch (error) {
      console.error('Error generating candidate summary:', error);
      throw error;
    }
  }
}

export const searchApiService = new SearchApiService();
