import apiClient from '../../../services/api';
import type { Job, ApiResponse, PaginatedResponse } from '../../data/types';

export interface CreateJobData {
  title: string;
  description?: string;
  department: string;
  departmentId: string;
  location: string;
  type?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  status?: 'Active' | 'Draft' | 'Paused' | 'Closed';
  urgency?: 'High' | 'Medium' | 'Low';
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  remote?: boolean;
  skills?: string[];
  benefits?: string[];
  requirements?: string[];
  responsibilities?: string[];
  hiringTeam?: string[];
  applicationDeadline?: string;
  organizationId?: string;
  customQuestions?: Array<{
    question: string;
    type: 'text' | 'multiple-choice';
    required: boolean;
    options?: string[];
  }>;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  departmentId?: string;
  organizationId?: string;
  type?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  status?: 'Active' | 'Draft' | 'Paused' | 'Closed';
  urgency?: 'High' | 'Medium' | 'Low';
  location?: string;
  remote?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface JobStats {
  total: number;
  active: number;
  draft: number;
  paused: number;
  closed: number;
}

class JobApiService {
  private baseURL: string = '/jobs';

  async getAllJobs(filters: JobFilters = {}): Promise<PaginatedResponse<Job>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`${this.baseURL}?${params.toString()}`);

      return {
        data: response.data.jobs,
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
      };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }
  async getJobById(id: string): Promise<Job> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }

  async createJob(jobData: CreateJobData): Promise<Job> {
    try {
      const response = await apiClient.post(this.baseURL, jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async updateJob(id: string, jobData: Partial<CreateJobData>): Promise<Job> {
    try {
      const response = await apiClient.patch(`${this.baseURL}/${id}`, jobData);
      return response.data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  async deleteJob(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }
  async getJobsByDepartment(departmentId: string, filters: JobFilters = {}): Promise<{ jobs: Job[]; total: number }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`${this.baseURL}/department/${departmentId}?${params.toString()}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching department jobs:', error);
      throw error;
    }
  }

  async getJobsByOrganization(organizationId: string, filters: JobFilters = {}): Promise<{ jobs: Job[]; total: number }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`${this.baseURL}/organization/${organizationId}?${params.toString()}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching organization jobs:', error);
      throw error;
    }
  }

  async getJobStats(organizationId?: string): Promise<JobStats> {
    try {
      const params = organizationId ? `?organizationId=${organizationId}` : '';
      const response = await apiClient.get(`${this.baseURL}/stats${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job stats:', error);
      throw error;
    }
  }

  async incrementApplicantCount(id: string): Promise<Job> {
    try {
      const response = await apiClient.patch(`${this.baseURL}/${id}/applicant-count`, {});
      return response.data;
    } catch (error) {
      console.error('Error incrementing applicant count:', error);
      throw error;
    }
  }
}

export const jobApiService = new JobApiService();
export default JobApiService;
