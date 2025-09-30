import { aiService } from './aiService';
import { candidateApiService, type Candidate } from '../recruitment/candidates/services/candidateApiService';
import apiClient from './api';

// Types
export interface ExtractedKeywords {
  jobTitles: string[];
  skills: string[];
  locations: string[];
  companies: string[];
  experienceLevel: string;
  workType: string;
  industries: string[];
  keywords: string[];
  requirements: string[];
}

export interface SearchFilters {
  general?: {
    minExperience?: string;
    maxExperience?: string;
    requiredContactInfo?: string;
    hideViewedProfiles?: string;
    onlyConnections?: string;
  };
  location?: {
    currentLocations?: string[];
    pastLocations?: string[];
    radius?: string;
    timezone?: boolean;
  };
  job?: {
    titles?: string[];
    skills?: string[];
  };
  company?: {
    names?: string[];
    industries?: string[];
    size?: string;
  };
  funding?: {
    // Add funding specific fields if any
  };
  skillsKeywords?: {
    items?: string[];
    requirements?: string[]; // Added requirements
  };
  power?: {
    isOpenToRemote?: boolean;
    hasEmail?: boolean;
    hasPhone?: boolean;
  };
  likelyToSwitch?: {
    likelihood?: string;
    recentActivity?: string;
  };
  education?: {
    schools?: string[];
    degrees?: string[];
    majors?: string[];
  };
  languages?: {
    items?: string[];
  };
  boolean?: {
    fullName?: string;
    booleanString?: string;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  candidate: Candidate;
  matchedCriteria: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  source?: string;
  metadata?: {
    localTotal?: number;
    externalTotal?: number;
    duplicatesRemoved?: number;
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

class SearchService {
  private readonly baseURL = '/search';

  /**
   * Search candidates using backend API with advanced filtering and scoring
   */
  async searchUsers(filters: SearchFilters, searchText?: string, pagination?: PaginationOptions): Promise<SearchResult[]> {
    try {
      const response = await apiClient.post<SearchResponse>(`${this.baseURL}/candidates`, {
        filters,
        searchText
      }, {
        params: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 20
        }
      });

      return response.data.results;
    } catch (error) {
      console.error('Error searching candidates:', error);
      return [];
    }
  }

  /**
   * Search candidates with full response including pagination info
   */
  async searchCandidates(filters: SearchFilters, searchText?: string, pagination?: PaginationOptions): Promise<SearchResponse> {
    try {
      const response = await apiClient.post<SearchResponse>(`${this.baseURL}/candidates`, {
        filters,
        searchText
      }, {
        params: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 20
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error searching candidates:', error);
      return {
        results: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      };
    }
  }

  /**
   * Search candidates using CoreSignal API for external candidate data
   */
  async searchCandidatesWithExternalSources(filters: SearchFilters, searchText?: string, pagination?: PaginationOptions): Promise<SearchResponse> {
    try {
      const response = await apiClient.post<SearchResponse>(`${this.baseURL}/candidates/coresignal`, {
        filters,
        searchText
      }, {
        params: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 20
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error searching candidates with external source:', error);
      return {
        results: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      };
    }
  }

  /**
   * Search candidates from both local database and CoreSignal API
   */
  async searchCandidatesCombined(
    filters: SearchFilters, 
    searchText?: string, 
    pagination?: PaginationOptions,
    includeExternal: boolean = true
  ): Promise<SearchResponse> {
    try {
      const response = await apiClient.post<SearchResponse>(`${this.baseURL}/candidates/combined`, {
        filters,
        searchText
      }, {
        params: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 20,
          includeExternal
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error searching candidates with combined search:', error);
      return {
        results: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
      };
    }
  }

  /**
   * Extract keywords from search text using backend AI service
   */
  async extractKeywords(searchText: string): Promise<ExtractedKeywords> {
    try {
      const response = await apiClient.post<ExtractedKeywords>(`${this.baseURL}/extract-keywords`, {
        searchText
      });

      return response.data;
    } catch (error) {
      console.error('Error extracting keywords:', error);
      // Return default structure if API fails
      return {
        jobTitles: [],
        skills: [],
        locations: [],
        companies: [],
        experienceLevel: '',
        workType: '',
        industries: [],
        keywords: [],
        requirements: []
      };
    }
  }

  /**
   * Convert extracted keywords to filter format using backend service
   */
  async convertKeywordsToFilters(keywords: ExtractedKeywords): Promise<SearchFilters> {
    try {
      const response = await apiClient.post<SearchFilters>(`${this.baseURL}/convert-keywords`, keywords);
      return response.data;
    } catch (error) {
      console.error('Error converting keywords to filters:', error);
      return {};
    }
  }

  /**
   * Enhanced keyword extraction with priority classification
   */
  async extractEnhancedKeywords(searchText: string): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseURL}/extract-keywords-enhanced`, {
        searchText
      });
      return response.data;
    } catch (error) {
      console.error('Error extracting enhanced keywords:', error);
      // Fallback to regular keyword extraction
      return this.extractKeywords(searchText);
    }
  }

  /**
   * Convert enhanced keywords to must/should filters
   */
  async convertEnhancedKeywordsToFilters(keywords: any): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseURL}/convert-keywords-enhanced`, keywords);
      return response.data;
    } catch (error) {
      console.error('Error converting enhanced keywords to filters:', error);
      throw error;
    }
  }

  /**
   * Enhanced AI search with must vs should logic
   */
  async searchEnhanced(searchText: string, includeExternal: boolean = true, pagination?: PaginationOptions): Promise<SearchResponse> {
    try {
      const response = await apiClient.post<SearchResponse>(`${this.baseURL}/search-enhanced`, {
        searchText,
        includeExternal
      }, {
        params: {
          page: pagination?.page || 1,
          limit: pagination?.limit || 20
        }
      });

      return response.data;
    } catch (error) {
      console.error('Enhanced search failed:', error);
      // Fallback to combined search
      const fallbackKeywords = await this.extractKeywords(searchText);
      const fallbackFilters = await this.convertKeywordsToFilters(fallbackKeywords);
      return this.searchCandidatesCombined(fallbackFilters, searchText, pagination, includeExternal);
    }
  }

  /**
   * Search using external sources with rich candidate data (equivalent to /search/candidates/external)
   * This provides the same detailed candidate information as the direct external search endpoint
   */
  async searchCandidatesExternalDirect(filters: SearchFilters, searchText?: string, pagination?: PaginationOptions): Promise<SearchResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (pagination?.page) {
        queryParams.append('page', pagination.page.toString());
      }
      if (pagination?.limit) {
        queryParams.append('limit', pagination.limit.toString());
      }
      
      const url = `${this.baseURL}/candidates/external${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.post<SearchResponse>(url, {
        filters,
        searchText: searchText || ''
      });

      console.log('🔍 External search response:', response.data);
      console.log('🔍 Results count:', response.data?.results?.length || 0);
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', response.headers);
      
      return response.data;
    } catch (error) {
      console.error('❌ External direct search failed:', error);
      console.error('❌ Error details:', error.response?.data);
      throw error;
    }
  }

  async searchCandidatesExternalEnhanced(filters: SearchFilters | any, searchText?: string, pagination?: PaginationOptions): Promise<SearchResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (pagination?.page) {
        queryParams.append('page', pagination.page.toString());
      }
      // Always limit enhanced search results to 3
      queryParams.append('limit', '3');
      
      const url = `${this.baseURL}/candidates/external-enhanced${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      let enhancedPayload;
      
      // Check if filters are already in enhanced format (from convertEnhancedKeywordsToFilters)
      if (filters && typeof filters === 'object' && 'mustFilters' in filters && 'shouldFilters' in filters) {
        // Filters are already in enhanced format, use them directly
        enhancedPayload = {
          filters,
          searchText: searchText || ''
        };
      } else {
        // Filters are regular SearchFilters, transform to enhanced format
        enhancedPayload = {
          filters: {
            mustFilters: filters, // Use the provided filters as must filters
            shouldFilters: {}, // Empty should filters for now
            searchText: searchText || '',
            contextualHints: {
              urgency: 'low',
              flexibility: 'moderate', 
              primaryFocus: 'technical',
              isLocationAgnostic: false
            }
          },
          searchText: searchText || ''
        };
      }

      const response = await apiClient.post<SearchResponse>(url, enhancedPayload);

      console.log('🚀 Enhanced external search response:', response.data);
      console.log('🔍 Results count:', response.data?.results?.length || 0);
      console.log('🔍 Response status:', response.status);
      
      // Log cache/cost information
      const metadata = response.data?.metadata as any;
      if (metadata?.costInfo) {
        const costInfo = metadata.costInfo;
        console.log(`💰 ${costInfo.message}`);
        console.log(`📦 Source: ${costInfo.source} (${costInfo.coreSignalCreditsUsed} credits)`);
      }
      
      // Log pagination info  
      if (metadata?.pagination) {
        const pag = metadata.pagination;
        console.log(`📄 Page ${pag.currentPage} of ${pag.totalPages} (${pag.totalResults} total results)`);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Enhanced external search failed:', error);
      console.error('❌ Error details:', error.response?.data);
      throw error;
    }
  }

  /**
   * Direct AI search - Single API call from raw text to results
   * Consolidates keyword extraction, filter conversion, and AI query generation into one call
   */
  async searchCandidatesDirectAI(searchText: string, contextualHints?: any, pagination?: PaginationOptions): Promise<SearchResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (pagination?.page) {
        queryParams.append('page', pagination.page.toString());
      }
      if (pagination?.limit) {
        queryParams.append('limit', pagination.limit.toString());
      }
      
      const url = `${this.baseURL}/candidates/external-ai-direct${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const directPayload = {
        searchText,
        contextualHints: contextualHints || {
          urgency: 'medium',
          flexibility: 'moderate',
          primaryFocus: 'technical',
          isLocationAgnostic: false
        }
      };

      console.log('🚀 Direct AI search payload:', directPayload);
      const response = await apiClient.post<SearchResponse>(url, directPayload);

      console.log('🎯 Direct AI search response (single call):', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Direct AI search failed:', error);
      console.error('❌ Error details:', error.response?.data);
      throw error;
    }
  }

  /**
   * Fetch cached enhanced search results for pagination (No new search query)
   */
  async fetchCachedEnhancedResults(queryHash: string, pagination?: PaginationOptions): Promise<SearchResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (pagination?.page) {
        queryParams.append('page', pagination.page.toString());
      }
      // Always limit to 3 for enhanced search
      queryParams.append('limit', '3');
      
      const url = `${this.baseURL}/candidates/external-enhanced/cache${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const cachePayload = {
        queryHash: queryHash
      };

      console.log(`🔍 Fetching cached results for query hash: ${queryHash}`);
      console.log(`📄 Requesting page ${pagination?.page || 1} (cache-only, no new search)`);

      const response = await apiClient.post<SearchResponse>(url, cachePayload);

      console.log('📦 Cached enhanced search response:', response.data);
      console.log('🔍 Results count:', response.data?.results?.length || 0);
      
      // Log cost information
      const metadata = response.data?.metadata as any;
      if (metadata?.costInfo) {
        console.log(`💰 ${metadata.costInfo.message}`);
        console.log(`📦 Source: ${metadata.costInfo.source} (${metadata.costInfo.coreSignalCreditsUsed} credits)`);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Cached enhanced search failed:', error);
      console.error('❌ Error details:', error.response?.data);
      throw error;
    }
  }

  /**
   * Fetch cached advanced filters results for pagination (No new search query)
   */
  async fetchCachedAdvancedFiltersResults(queryHash: string, pagination?: PaginationOptions): Promise<SearchResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (pagination?.page) {
        queryParams.append('page', pagination.page.toString());
      }
      // Always limit to 3 for advanced filters search
      queryParams.append('limit', '3');
      
      const url = `${this.baseURL}/candidates/advanced-filters/cache${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const cachePayload = {
        queryHash: queryHash
      };

      console.log(`🔍 Fetching cached advanced filters results for query hash: ${queryHash}`);
      console.log(`📄 Requesting page ${pagination?.page || 1} (cache-only, no new search)`);

      const response = await apiClient.post<SearchResponse>(url, cachePayload);

      console.log('📦 Cached advanced filters search response:', response.data);
      console.log('🔍 Results count:', response.data?.results?.length || 0);
      
      // Log cost information
      const metadata = response.data?.metadata as any;
      if (metadata?.costInfo) {
        console.log(`💰 ${metadata.costInfo.message}`);
        console.log(`📦 Source: ${metadata.costInfo.source} (${metadata.costInfo.coreSignalCreditsUsed} credits)`);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Cached advanced filters search failed:', error);
      console.error('❌ Error details:', error.response?.data);
      throw error;
    }
  }

  /**
   * Get candidate by ID (using existing candidate service)
   */
  async getCandidateById(id: string): Promise<Candidate | undefined> {
    try {
      return await candidateApiService.getCandidateById(id);
    } catch (error) {
      console.error('Error fetching candidate by ID:', error);
      return undefined;
    }
  }

  /**
   * Get all candidates (for backward compatibility - use with caution for large datasets)
   */
  async getAllUsers(): Promise<Candidate[]> {
    try {
      // Get first page with a reasonable limit
      const response = await this.searchCandidates({}, '', { page: 1, limit: 100 });
      return response.results.map(result => result.candidate);
    } catch (error) {
      console.error('Error fetching all candidates:', error);
      return [];
    }
  }

  /**
   * Shortlist an external candidate (save to database)
   */
  async shortlistExternalCandidate(
    coreSignalId: number,
    candidateData: any,
    createdBy: string
  ): Promise<{ success: boolean; candidateId?: string; message: string; existingCandidateId?: string }> {
    try {
      const response = await apiClient.post(`${this.baseURL}/shortlist-external-candidate`, {
        coreSignalId,
        candidateData,
        createdBy
      });

      return response.data;
    } catch (error) {
      console.error('Error shortlisting external candidate:', error);
      throw error;
    }
  }

  /**
   * Generate AI-powered profile analysis for a candidate
   */
  async generateProfileAnalysis(candidateData: any, searchContext?: { query?: string; filters?: SearchFilters }): Promise<{ summary: string; keyHighlights: string[] }> {
    try {
      const response = await apiClient.post(`${this.baseURL}/profile-analysis`, {
        candidateData,
        searchContext
      });

      return response.data;
    } catch (error) {
      console.error('Error generating profile analysis:', error);
      throw error;
    }
  }

  /**
   * Search candidates using advanced filters based on CoreSignal schema
   * Converts advanced filters to Elasticsearch query and executes search
   */
  async searchCandidatesWithAdvancedFilters(advancedFilters: any, searchText: string = '', pagination?: PaginationOptions): Promise<SearchResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (pagination?.page) {
        queryParams.append('page', pagination.page.toString());
      }
      if (pagination?.limit) {
        queryParams.append('limit', pagination.limit.toString());
      }
      
      const url = `${this.baseURL}/candidates/advanced-filters${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const payload = {
        filters: advancedFilters,
        searchText: searchText || ''
      };

      console.log('🔧 Advanced filters search payload:', payload);
      const response = await apiClient.post<SearchResponse>(url, payload);

      console.log('🎯 Advanced filters search response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Advanced filters search failed:', error);
      console.error('❌ Error details:', error.response?.data);
      throw error;
    }
  }
}
export const searchService = new SearchService();

// Export convenience functions for easier imports
export const extractKeywords = (searchText: string) => searchService.extractKeywords(searchText);
export const convertKeywordsToFilters = (keywords: ExtractedKeywords) => searchService.convertKeywordsToFilters(keywords);
export const extractEnhancedKeywords = (searchText: string) => searchService.extractEnhancedKeywords(searchText);
export const convertEnhancedKeywordsToFilters = (keywords: any) => searchService.convertEnhancedKeywordsToFilters(keywords);
export const searchEnhanced = (searchText: string, includeExternal?: boolean, pagination?: PaginationOptions) => searchService.searchEnhanced(searchText, includeExternal, pagination);
export const searchCandidatesExternalDirect = (filters: SearchFilters, searchText?: string, pagination?: PaginationOptions) => searchService.searchCandidatesExternalDirect(filters, searchText, pagination);
export const searchCandidatesExternalEnhanced = (filters: SearchFilters, searchText?: string, pagination?: PaginationOptions) => searchService.searchCandidatesExternalEnhanced(filters, searchText, pagination);
export const searchCandidatesDirectAI = (searchText: string, contextualHints?: any, pagination?: PaginationOptions) => searchService.searchCandidatesDirectAI(searchText, contextualHints, pagination);
export const fetchCachedEnhancedResults = (queryHash: string, pagination?: PaginationOptions) => searchService.fetchCachedEnhancedResults(queryHash, pagination);
export const fetchCachedAdvancedFiltersResults = (queryHash: string, pagination?: PaginationOptions) => searchService.fetchCachedAdvancedFiltersResults(queryHash, pagination);
export const searchUsers = (filters: SearchFilters, searchText?: string, pagination?: PaginationOptions) => searchService.searchUsers(filters, searchText, pagination);
export const searchCandidates = (filters: SearchFilters, searchText?: string, pagination?: PaginationOptions) => searchService.searchCandidates(filters, searchText, pagination);
export const getAllCandidates = () => searchService.getAllUsers();
export const getCandidateById = (id: string) => searchService.getCandidateById(id);
export const shortlistExternalCandidate = (coreSignalId: number, candidateData: any, createdBy: string) => 
  searchService.shortlistExternalCandidate(coreSignalId, candidateData, createdBy);
export const generateProfileAnalysis = (candidateData: any, searchContext?: { query?: string; filters?: SearchFilters }) => 
  searchService.generateProfileAnalysis(candidateData, searchContext);
export const searchCandidatesWithAdvancedFilters = (advancedFilters: any, searchText: string = '', pagination?: PaginationOptions) => 
  searchService.searchCandidatesWithAdvancedFilters(advancedFilters, searchText, pagination);
