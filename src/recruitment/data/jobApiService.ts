import axios from 'axios';
import type { Job, ApiResponse, PaginatedResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface CreateJobPayload {
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

export interface JobQueryParams {
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

class JobApiService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get all jobs with pagination and filtering
  async getAllJobs(params?: JobQueryParams): Promise<PaginatedResponse<Job>> {
    const response = await this.api.get('/jobs', { params });
    return response.data;
  }

  // Get a specific job by ID
  async getJobById(id: string): Promise<Job> {
    const response = await this.api.get(`/jobs/${id}`);
    return response.data;
  }

  // Create a new job
  async createJob(jobData: CreateJobPayload): Promise<Job> {
    const response = await this.api.post('/jobs', jobData);
    return response.data;
  }

  // Update an existing job
  async updateJob(id: string, jobData: Partial<CreateJobPayload>): Promise<Job> {
    const response = await this.api.patch(`/jobs/${id}`, jobData);
    return response.data;
  }

  // Delete a job
  async deleteJob(id: string): Promise<void> {
    await this.api.delete(`/jobs/${id}`);
  }

  // Get jobs by department
  async getJobsByDepartment(departmentId: string, params?: JobQueryParams): Promise<{ jobs: Job[]; total: number }> {
    const response = await this.api.get(`/jobs/department/${departmentId}`, { params });
    return response.data;
  }

  // Get jobs by organization
  async getJobsByOrganization(organizationId: string, params?: JobQueryParams): Promise<{ jobs: Job[]; total: number }> {
    const response = await this.api.get(`/jobs/organization/${organizationId}`, { params });
    return response.data;
  }

  // Get job statistics
  async getJobStats(organizationId?: string): Promise<{
    total: number;
    active: number;
    draft: number;
    paused: number;
    closed: number;
  }> {
    const params = organizationId ? { organizationId } : {};
    const response = await this.api.get('/jobs/stats', { params });
    return response.data;
  }

  // Increment applicant count
  async incrementApplicantCount(id: string): Promise<Job> {
    const response = await this.api.patch(`/jobs/${id}/applicant-count`);
    return response.data;
  }

  // Convenience methods for specific status filters
  async getActiveJobs(params?: JobQueryParams): Promise<PaginatedResponse<Job>> {
    return this.getAllJobs({ ...params, status: 'Active' });
  }

  async getDraftJobs(params?: JobQueryParams): Promise<PaginatedResponse<Job>> {
    return this.getAllJobs({ ...params, status: 'Draft' });
  }

  async getClosedJobs(params?: JobQueryParams): Promise<PaginatedResponse<Job>> {
    return this.getAllJobs({ ...params, status: 'Closed' });
  }

  // Search jobs
  async searchJobs(searchTerm: string, params?: JobQueryParams): Promise<PaginatedResponse<Job>> {
    return this.getAllJobs({ ...params, search: searchTerm });
  }
}

// Export singleton instance
export const jobApiService = new JobApiService();
export default JobApiService;
