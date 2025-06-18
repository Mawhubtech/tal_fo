import apiClient from './api';

// Type definitions based on backend structure
export interface CandidateQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  experienceLevel?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CandidateStats {
  total: number;
  active: number;
  hired: number;
  interviewing: number;
  rejected: number;
  inactive: number;
}

// Service functions
export const candidatesService = {  // Get candidates with filtering and pagination
  async getCandidates(params: CandidateQueryParams) {
    try {
      console.log('Fetching candidates with params:', params);
      console.time('API Request Time');
      
      const response = await apiClient.get('/candidates', { params });
      
      console.timeEnd('API Request Time');
      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', response.headers);
      console.log('API Response Data:', response.data);
        // Create a standardized response object regardless of API format
      let result: {
        items: any[];
        originalResponse: any;
        responseFormat: string;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      } = {
        items: [],
        originalResponse: response.data, // Store the original response for debugging
        responseFormat: 'unknown',
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
      };
      
      // Handle both paginated and non-paginated responses
      if (response.data && typeof response.data === 'object') {
        // If response has candidates array (new API format)
        if (Array.isArray(response.data.candidates)) {
          result = {
            ...result,
            items: response.data.candidates,
            responseFormat: 'candidates_array',
            total: response.data.total || response.data.candidates.length,
            page: response.data.page || 1,
            limit: response.data.limit || 10,
            totalPages: response.data.totalPages || Math.ceil((response.data.total || response.data.candidates.length) / (response.data.limit || 10))
          };
        }
        // If response itself is the array of candidates (old API format)
        else if (Array.isArray(response.data)) {
          result = {
            ...result,
            items: response.data,
            responseFormat: 'direct_array',
            total: response.data.length,
            page: 1,
            limit: response.data.length,
            totalPages: 1
          };
        }
        // Original format with items key
        else if (Array.isArray(response.data.items)) {
          result = {
            ...result,
            items: response.data.items,
            responseFormat: 'items_array',
            total: response.data.total || response.data.items.length,
            page: response.data.page || 1,
            limit: response.data.limit || 10,
            totalPages: response.data.totalPages || Math.ceil((response.data.total || response.data.items.length) / (response.data.limit || 10))
          };
        }
      }
      
      console.log('Processed API response:', result);
      return result;
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  },

  // Get a single candidate by ID
  async getCandidate(id: string) {
    const response = await apiClient.get(`/candidates/${id}`);
    return response.data;
  },

  // Get candidate statistics
  async getStats() {
    const response = await apiClient.get('/candidates/stats/overview');
    return response.data as CandidateStats;
  },

  // Update candidate status
  async updateStatus(id: string, status: string) {
    const response = await apiClient.patch(`/candidates/${id}/status`, { status });
    return response.data;
  },

  // Update candidate rating
  async updateRating(id: string, rating: number) {
    const response = await apiClient.patch(`/candidates/${id}/rating`, { rating });
    return response.data;
  },

  // Delete a candidate
  async deleteCandidate(id: string) {
    await apiClient.delete(`/candidates/${id}`);
    return true;
  },

  // Process a single CV without creating a candidate
  async processCV(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/candidates/process-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Process multiple CVs from a zip file
  async processBulkCVs(zipFile: File) {
    const formData = new FormData();
    formData.append('zipFile', zipFile);
    const response = await apiClient.post('/candidates/process-bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload a CV and create a candidate
  async uploadCV(file: File, candidateId?: string, email?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (candidateId) {
      formData.append('candidateId', candidateId);
    }
    if (email) {
      formData.append('email', email);
    }
    const response = await apiClient.post('/candidates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Create a candidate from processed CV data
  async createFromProcessed(structuredData: any, documentId?: string, overrideData?: any) {
    const response = await apiClient.post('/candidates/create-from-processed', {
      structuredData,
      documentId,
      overrideData,
    });
    return response.data;
  },
};
