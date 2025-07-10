import apiClient from './api';
import type { Job, ApiResponse, PaginatedResponse } from '../recruitment/data/types';

export interface CreateJobData {
  title: string;
  description?: string;
  department: string;
  departmentId: string;
  location: string;
  type?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  status?: 'Published' | 'Draft' | 'Paused' | 'Closed' | 'Archived';
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
  hiringTeamId?: string;
  applicationDeadline?: string;
  organizationId?: string;
  customQuestions?: Array<{
    question: string;
    type: 'text' | 'multiple-choice';
    required: boolean;
    options?: string[];
  }>;
  pipelineId?: string;
}

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  departmentId?: string;
  organizationId?: string;
  type?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  status?: 'Published' | 'Draft' | 'Paused' | 'Closed' | 'Archived';
  urgency?: 'High' | 'Medium' | 'Low';
  location?: string;
  remote?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface JobStats {
  total: number;
  published: number;
  draft: number;
  paused: number;
  closed: number;
  archived: number;
}

class JobApiService {
  async getAllJobs(filters: JobFilters = {}): Promise<PaginatedResponse<Job>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/jobs?${params.toString()}`);

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
      const response = await apiClient.get(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }

  async createJob(jobData: CreateJobData): Promise<Job> {
    try {
      const response = await apiClient.post('/jobs', jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async updateJob(id: string, jobData: Partial<CreateJobData>): Promise<Job> {
    try {
      const response = await apiClient.patch(`/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  async deleteJob(id: string): Promise<void> {
    try {
      await apiClient.delete(`/jobs/${id}`);
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

      const response = await apiClient.get(`/jobs/department/${departmentId}?${params.toString()}`);

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

      const response = await apiClient.get(`/jobs/organization/${organizationId}?${params.toString()}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching organization jobs:', error);
      throw error;
    }
  }

  async getJobStats(organizationId?: string): Promise<JobStats> {
    try {
      const params = organizationId ? `?organizationId=${organizationId}` : '';
      const response = await apiClient.get(`/jobs/stats${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job stats:', error);
      throw error;
    }
  }

  // External user specific methods
  async getExternalUserJobs(): Promise<Job[]> {
    try {
      const response = await apiClient.get('/jobs/external/my-jobs');
      return response.data;
    } catch (error) {
      console.error('Error fetching external user jobs:', error);
      throw error;
    }
  }

  async getExternalJobDetail(jobId: string): Promise<Job> {
    try {
      const response = await apiClient.get(`/jobs/external/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching external job detail:', error);
      throw error;
    }
  }

  async getExternalJobApplications(jobId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/jobs/external/${jobId}/applications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching external job applications:', error);
      throw error;
    }
  }

  async incrementApplicantCount(id: string): Promise<Job> {
    try {
      const response = await apiClient.patch(`/jobs/${id}/applicant-count`, {});
      return response.data;
    } catch (error) {
      console.error('Error incrementing applicant count:', error);
      throw error;
    }
  }

  async getJobSuggestions(
    candidateId: string, 
    organizationId?: string,
    limit: number = 5,
    minScore: number = 30
  ): Promise<{ suggestions: any[]; total: number }> {
    try {
      const params: any = { limit, minScore };
      if (organizationId) {
        params.organizationId = organizationId;
      }
      
      const response = await apiClient.get(`/jobs/suggestions/${candidateId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching job suggestions:', error);
      throw error;
    }
  }
}

export const jobApiService = new JobApiService();
export default JobApiService;
