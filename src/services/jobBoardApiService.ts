import apiClient from '../lib/api';
import type { ApiResponse } from '../recruitment/data/types';

export interface JobBoard {
  id: string;
  type: 'linkedin' | 'indeed' | 'glassdoor' | 'monster' | 'ziprecruiter' | 'careerbuilder' | 'dice' | 'stackoverflow' | 'angellist' | 'behance';
  metadata: {
    name: string;
    description: string;
    website: string;
    logo: string;
    requiredFields: string[];
    optionalFields: string[];
    apiDocumentation: string;
    supportedFeatures: {
      autoPost: boolean;
      applicationTracking: boolean;
      analytics: boolean;
      bulkPosting: boolean;
    };
  };
  status: 'active' | 'inactive' | 'setup_required' | 'error';
  description?: string;
  isAvailable: boolean;
  sortOrder: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobBoardConnection {
  id: string;
  jobBoardId: string;
  jobBoardType: JobBoard['type'];
  jobBoardName: string;
  clientId: string;
  departmentId?: string;
  status: 'active' | 'inactive' | 'expired' | 'error' | 'pending_verification';
  postingSettings: {
    autoPost: boolean;
    requireApproval: boolean;
    defaultTemplate?: string;
    categories?: string[];
    locations?: string[];
    salaryVisibility?: boolean;
    applicationMethod?: 'external' | 'direct' | 'both';
    customFields?: Record<string, any>;
  };
  analyticsData?: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    responseRate: number;
    lastSync: string;
    syncFrequency: string;
    avgTimeToResponse: number;
    qualityScore: number;
  };
  errorMessage?: string;
  lastSyncAt?: string;
  credentialsExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobBoardConnectionData {
  jobBoardType: JobBoard['type'];
  clientId: string;
  departmentId?: string;
  credentials: Record<string, string>;
  postingSettings?: {
    autoPost?: boolean;
    requireApproval?: boolean;
    defaultTemplate?: string;
    categories?: string[];
    locations?: string[];
    salaryVisibility?: boolean;
    applicationMethod?: 'external' | 'direct' | 'both';
    customFields?: Record<string, any>;
  };
  webhookConfig?: {
    url?: string;
    secret?: string;
    events?: string[];
  };
}

export interface UpdateJobBoardConnectionData {
  credentials?: Record<string, string>;
  postingSettings?: {
    autoPost?: boolean;
    requireApproval?: boolean;
    defaultTemplate?: string;
    categories?: string[];
    locations?: string[];
    salaryVisibility?: boolean;
    applicationMethod?: 'external' | 'direct' | 'both';
    customFields?: Record<string, any>;
  };
  webhookConfig?: {
    url?: string;
    secret?: string;
    events?: string[];
  };
  isActive?: boolean;
}

export interface PostJobToExternalBoardData {
  jobId: string;
  jobBoardConnectionIds: string[];
  customData?: Record<string, any>;
}

class JobBoardApiService {
  private readonly baseUrl = '/job-boards';

  /**
   * Get all available job boards
   */
  async getAvailableJobBoards(): Promise<ApiResponse<JobBoard[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/available`);
      return {
        success: true,
        data: response.data,
        message: 'Available job boards retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch available job boards',
        data: []
      };
    }
  }

  /**
   * Get job board connections for a client
   */
  async getJobBoardConnections(clientId: string): Promise<ApiResponse<JobBoardConnection[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/connections`, {
        params: { clientId }
      });
      return {
        success: true,
        data: response.data,
        message: 'Job board connections retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch job board connections',
        data: []
      };
    }
  }

  /**
   * Create a new job board connection
   */
  async createJobBoardConnection(data: CreateJobBoardConnectionData): Promise<ApiResponse<JobBoardConnection>> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/connections`, data);
      return {
        success: true,
        data: response.data,
        message: 'Job board connection created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create job board connection',
        data: null
      };
    }
  }

  /**
   * Update a job board connection
   */
  async updateJobBoardConnection(
    connectionId: string, 
    data: UpdateJobBoardConnectionData
  ): Promise<ApiResponse<JobBoardConnection>> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/connections/${connectionId}`, data);
      return {
        success: true,
        data: response.data,
        message: 'Job board connection updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update job board connection',
        data: null
      };
    }
  }

  /**
   * Get a specific job board connection by ID
   */
  async getJobBoardConnection(connectionId: string): Promise<ApiResponse<JobBoardConnection>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/connections/${connectionId}`);
      return {
        success: true,
        data: response.data,
        message: 'Job board connection retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to retrieve job board connection',
        data: {} as JobBoardConnection
      };
    }
  }

  /**
   * Delete a job board connection
   */
  async deleteJobBoardConnection(connectionId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`${this.baseUrl}/connections/${connectionId}`);
      return {
        success: true,
        data: undefined,
        message: 'Job board connection deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete job board connection',
        data: undefined
      };
    }
  }

  /**
   * Post a job to external job boards
   */
  async postJobToExternalBoards(data: PostJobToExternalBoardData): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/post-job`, data);
      return {
        success: true,
        data: response.data,
        message: 'Job posted to external boards successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to post job to external boards',
        data: null
      };
    }
  }

  /**
   * Sync job board data
   */
  async syncJobBoardData(connectionId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/connections/${connectionId}/sync`);
      return {
        success: true,
        data: response.data,
        message: 'Job board data synced successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to sync job board data',
        data: null
      };
    }
  }

  /**
   * Test job board connection
   */
  async testConnection(connectionId: string): Promise<ApiResponse<{ isConnected: boolean; error?: string }>> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/connections/${connectionId}/test`);
      return {
        success: true,
        data: response.data,
        message: 'Connection test completed'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to test connection',
        data: { isConnected: false, error: error.response?.data?.message }
      };
    }
  }
}

export const jobBoardApiService = new JobBoardApiService();
