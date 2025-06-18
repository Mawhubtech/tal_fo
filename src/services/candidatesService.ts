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
    const response = await apiClient.get('/candidates', { params });
    return {
      items: response.data.items || response.data,
      total: response.data.total || response.data.length,
      page: response.data.page || 1,
      limit: response.data.limit || 10,
      totalPages: response.data.totalPages || Math.ceil((response.data.total || response.data.length) / (response.data.limit || 10))
    };
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
};
