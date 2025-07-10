import apiClient from './api';

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'Applied' | 'Screening' | 'Phone Interview' | 'Technical Interview' | 'Final Interview' | 'Offer Extended' | 'Hired' | 'Rejected' | 'Withdrawn';
  stage: 'Application' | 'Screening' | 'Interview' | 'Decision' | 'Offer' | 'Hired';
  appliedDate: string;
  lastActivityDate?: string;
  notes?: string;
  coverLetter?: string;
  score?: number;
  resumeUrl?: string;
  portfolioUrl?: string;
  customFields?: Record<string, any>;
  // Pipeline stage tracking fields
  currentPipelineStageId?: string;
  currentPipelineStageName?: string;
  pipelineId?: string;
  job?: any;
  candidate?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobApplicationData {
  jobId: string;
  candidateId: string;
  status?: 'Applied' | 'Screening' | 'Phone Interview' | 'Technical Interview' | 'Final Interview' | 'Offer Extended' | 'Hired' | 'Rejected' | 'Withdrawn';
  stage?: 'Application' | 'Screening' | 'Interview' | 'Decision' | 'Offer' | 'Hired';
  appliedDate?: string;
  notes?: string;
  coverLetter?: string;
  score?: number;
  resumeUrl?: string;
  portfolioUrl?: string;
  customFields?: Record<string, any>;
  // Pipeline stage tracking fields
  currentPipelineStageId?: string;
  currentPipelineStageName?: string;
  pipelineId?: string;
  stageEnteredAt?: string;
}

export interface JobApplicationFilters {
  page?: number;
  limit?: number;
  jobId?: string;
  candidateId?: string;
  status?: 'Applied' | 'Screening' | 'Phone Interview' | 'Technical Interview' | 'Final Interview' | 'Offer Extended' | 'Hired' | 'Rejected' | 'Withdrawn';
  stage?: 'Application' | 'Screening' | 'Interview' | 'Decision' | 'Offer' | 'Hired';
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

class JobApplicationApiService {
  private baseURL: string = '/job-applications';

  async createJobApplication(data: CreateJobApplicationData): Promise<JobApplication> {
    try {
      const response = await apiClient.post('/job-applications', data);
      return response.data;
    } catch (error) {
      console.error('Error creating job application:', error);
      throw error;
    }
  }

  async getAllJobApplications(filters: JobApplicationFilters = {}): Promise<{ applications: JobApplication[]; total: number }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/job-applications?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job applications:', error);
      throw error;
    }
  }

  async getJobApplicationById(id: string): Promise<JobApplication> {
    try {
      const response = await apiClient.get(`/job-applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job application:', error);
      throw error;
    }
  }

  async getJobApplicationsByJobId(jobId: string, filters: JobApplicationFilters = {}): Promise<{ applications: JobApplication[]; total: number }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/job-applications/job/${jobId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job applications by job ID:', error);
      throw error;
    }
  }

  async getJobApplicationsByCandidateId(candidateId: string, filters: JobApplicationFilters = {}): Promise<{ applications: JobApplication[]; total: number }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/job-applications/candidate/${candidateId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job applications by candidate ID:', error);
      throw error;
    }
  }

  async updateJobApplication(id: string, data: Partial<CreateJobApplicationData>): Promise<JobApplication> {
    try {
      const response = await apiClient.patch(`/job-applications/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating job application:', error);
      throw error;
    }
  }

  async deleteJobApplication(id: string): Promise<void> {
    try {
      await apiClient.delete(`/job-applications/${id}`);
    } catch (error) {
      console.error('Error deleting job application:', error);
      throw error;
    }
  }

  async getJobApplicationStats(jobId?: string): Promise<any> {
    try {
      const params = jobId ? `?jobId=${jobId}` : '';
      const response = await apiClient.get(`/job-applications/stats${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job application stats:', error);
      throw error;
    }
  }
}

export const jobApplicationApiService = new JobApplicationApiService();
export default JobApplicationApiService;
