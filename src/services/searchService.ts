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
  async searchCandidatesWithCoreSignal(filters: SearchFilters, searchText?: string, pagination?: PaginationOptions): Promise<SearchResponse> {
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
      console.error('Error searching candidates with CoreSignal:', error);
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
}
export const searchService = new SearchService();

// Export convenience functions for easier imports
export const extractKeywords = (searchText: string) => searchService.extractKeywords(searchText);
export const convertKeywordsToFilters = (keywords: ExtractedKeywords) => searchService.convertKeywordsToFilters(keywords);
export const searchUsers = (filters: SearchFilters, searchText?: string, pagination?: PaginationOptions) => searchService.searchUsers(filters, searchText, pagination);
export const searchCandidates = (filters: SearchFilters, searchText?: string, pagination?: PaginationOptions) => searchService.searchCandidates(filters, searchText, pagination);
export const getAllCandidates = () => searchService.getAllUsers();
export const getCandidateById = (id: string) => searchService.getCandidateById(id);
