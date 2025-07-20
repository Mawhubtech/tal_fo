import apiClient from './api';

export interface PublicJob {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  status: 'Published';
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  remote: boolean;
  skills: string[];
  benefits: string[];
  requirements: string[];
  responsibilities: string[];
  applicationDeadline?: Date | string;
  applicantsCount: number;
  organizationId: string;
  customQuestions?: Array<{
    question: string;
    type: 'text' | 'multiple-choice';
    required: boolean;
    options?: string[];
  }>;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Computed fields for display
  postedDate: Date | string;
  salaryRange?: string;
}

export interface PublicJobFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  type?: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  experienceLevel?: string;
  remote?: boolean;
  sortBy?: 'createdAt' | 'title' | 'location' | 'applicantsCount';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PublicJobsResponse {
  jobs: PublicJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

class PublicJobApiService {
  /**
   * Get all published jobs for public job board
   */
  async getPublishedJobs(filters: PublicJobFilters = {}): Promise<PublicJobsResponse> {
    try {
      const params = new URLSearchParams();
      
      // Don't need to append status since backend endpoint only returns published jobs
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/public/jobs?${params.toString()}`);

      return {
        jobs: response.data.jobs || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 20,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || 0) / (response.data.limit || 20)),
        hasNextPage: response.data.hasNextPage || false,
        hasPreviousPage: response.data.hasPreviousPage || false,
      };
    } catch (error) {
      console.error('Error fetching published jobs:', error);
      throw error;
    }
  }

  /**
   * Get a single published job by ID for public viewing
   */
  async getPublishedJobById(id: string): Promise<PublicJob> {
    try {
      const response = await apiClient.get(`/public/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching published job:', error);
      throw error;
    }
  }

  /**
   * Apply to a job (requires authentication)
   */
  async applyToJob(jobId: string, applicationData: {
    coverLetter?: string;
    resumeFileId?: string;
    customAnswers?: Array<{
      questionId: string;
      answer: string;
    }>;
  }): Promise<{ success: boolean; applicationId: string }> {
    try {
      const response = await apiClient.post(`/jobs/${jobId}/applications`, applicationData);
      return response.data;
    } catch (error) {
      console.error('Error applying to job:', error);
      throw error;
    }
  }

  /**
   * Get job statistics for public display
   */
  async getPublicJobStats(): Promise<{
    totalJobs: number;
    totalCompanies: number;
    recentJobs: number;
  }> {
    try {
      const response = await apiClient.get('/public/jobs/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching public job stats:', error);
      throw error;
    }
  }

  /**
   * Get featured jobs for homepage
   */
  async getFeaturedJobs(limit: number = 6): Promise<PublicJob[]> {
    try {
      const response = await apiClient.get(`/public/jobs/featured?limit=${limit}`);
      return response.data.jobs || response.data || [];
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
      throw error;
    }
  }

  /**
   * Get related jobs based on skills or department
   */
  async getRelatedJobs(jobId: string, limit: number = 5): Promise<PublicJob[]> {
    try {
      const response = await apiClient.get(`/public/jobs/${jobId}/related?limit=${limit}`);
      return response.data.jobs || response.data || [];
    } catch (error) {
      console.error('Error fetching related jobs:', error);
      throw error;
    }
  }
}

export const publicJobApiService = new PublicJobApiService();
export default PublicJobApiService;
