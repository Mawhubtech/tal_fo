import apiClient from '../../../services/api';

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedIn?: string;
  github?: string;
  avatar?: string;
  summary?: string;
  currentPosition?: string;
  salaryExpectation?: string;
  status: 'active' | 'inactive' | 'hired' | 'interviewing' | 'rejected';
  rating: number;
  appliedDate?: string;
  lastActivity?: string;
  source: 'linkedin' | 'linkedin_chrome_extension' | 'indeed' | 'referral' | 'direct_application' | 'recruitment_agency' | 'other';
  skills?: string[];
  languages?: string[];
  experience?: any[];
  education?: any[];
  certifications?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CandidateFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'hired' | 'interviewing' | 'rejected';
  source?: 'linkedin' | 'linkedin_chrome_extension' | 'indeed' | 'referral' | 'direct_application' | 'recruitment_agency' | 'other';
  skills?: string[];
  location?: string;
  experienceLevel?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateCandidateData {
  fullName: string;
  email: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedIn?: string;
  github?: string;
  avatar?: string;
  summary?: string;
  currentPosition?: string;
  salaryExpectation?: string;
  status?: 'active' | 'inactive' | 'hired' | 'interviewing' | 'rejected';
  rating?: number;
  appliedDate?: string;
  source?: 'linkedin' | 'linkedin_chrome_extension' | 'indeed' | 'referral' | 'direct_application' | 'recruitment_agency' | 'other';
  skills?: string[];
  languages?: string[];
}

class CandidateApiService {
  private baseURL: string = '/candidates';

  async getAllCandidates(filters: CandidateFilters = {}): Promise<{ candidates: Candidate[]; total: number }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => params.append(key, item.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.get(`${this.baseURL}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  }

  async getCandidateById(id: string): Promise<Candidate> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching candidate:', error);
      throw error;
    }
  }

  async createCandidate(data: CreateCandidateData): Promise<Candidate> {
    try {
      const response = await apiClient.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Error creating candidate:', error);
      throw error;
    }
  }

  async updateCandidate(id: string, data: Partial<CreateCandidateData>): Promise<Candidate> {
    try {
      const response = await apiClient.patch(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating candidate:', error);
      throw error;
    }
  }

  async updateCandidateStatus(id: string, status: 'active' | 'inactive' | 'hired' | 'interviewing' | 'rejected'): Promise<Candidate> {
    try {
      const response = await apiClient.patch(`${this.baseURL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating candidate status:', error);
      throw error;
    }
  }

  async updateCandidateRating(id: string, rating: number): Promise<Candidate> {
    try {
      const response = await apiClient.patch(`${this.baseURL}/${id}/rating`, { rating });
      return response.data;
    } catch (error) {
      console.error('Error updating candidate rating:', error);
      throw error;
    }
  }

  async deleteCandidate(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error('Error deleting candidate:', error);
      throw error;
    }
  }

  async searchCandidates(filters: CandidateFilters = {}): Promise<{ candidates: Candidate[]; total: number }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => params.append(key, item.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.get(`${this.baseURL}/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching candidates:', error);
      throw error;
    }
  }

  async getCandidateByEmail(email: string): Promise<Candidate | null> {
    try {
      const response = await apiClient.get(`${this.baseURL}/email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching candidate by email:', error);
      return null;
    }
  }
}

export const candidateApiService = new CandidateApiService();
export default CandidateApiService;
