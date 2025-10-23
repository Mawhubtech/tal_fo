import apiClient from '../lib/api';

export interface SequenceEnrollment {
  id: string;
  sequenceId: string;
  jobApplicationId: string;
  currentStepId?: string;
  status: 'active' | 'paused' | 'completed' | 'failed' | 'unsubscribed';
  enrollmentTrigger: 'manual' | 'automatic' | 'pipeline_stage';
  currentStepOrder: number;
  nextExecutionAt?: string;
  lastExecutedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  enrolledAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  executionLog?: Record<string, any>;
  jobApplication?: {
    id: string;
    job?: {
      id: string;
      title: string;
    };
    candidate?: {
      id: string;
      fullName: string;
      email: string;
      currentPosition?: string;
    };
    currentPipelineStageId?: string;
    currentPipelineStageName?: string;
  };
}

export interface CreateEnrollmentRequest {
  sequenceId: string;
  jobApplicationId: string;
  enrollmentTrigger?: 'manual' | 'automatic' | 'pipeline_stage';
  metadata?: Record<string, any>;
}

export interface BulkEnrollmentRequest {
  sequenceId: string;
  jobApplicationIds: string[];
  enrollmentTrigger?: 'manual' | 'automatic' | 'pipeline_stage';
  metadata?: Record<string, any>;
}

export interface AutoEnrollmentConfig {
  sequenceId: string;
  autoEnrollEnabled: boolean;
  triggerStages?: string[];
  includeExistingCandidates?: boolean;
  excludeStages?: string[];
}

export interface GetEnrollmentsParams {
  sequenceId?: string;
  jobId?: string;
  status?: 'active' | 'paused' | 'completed' | 'failed' | 'unsubscribed';
  enrollmentTrigger?: 'manual' | 'automatic' | 'pipeline_stage';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedEnrollmentsResponse {
  data: SequenceEnrollment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class SequenceEnrollmentsApiService {
  private static baseUrl = '/sequence-enrollments';

  static async getEnrollments(params?: GetEnrollmentsParams): Promise<PaginatedEnrollmentsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(`${this.baseUrl}/enrollments?${searchParams.toString()}`);
    return response.data;
  }

  static async getSequenceEnrollments(sequenceId: string): Promise<{
    data: SequenceEnrollment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await apiClient.get(`/sequence-enrollments/sequences/${sequenceId}/enrollments`);
    return response.data;
  }

  static async createEnrollment(data: CreateEnrollmentRequest): Promise<SequenceEnrollment> {
    const response = await apiClient.post(`${this.baseUrl}/enrollments`, data);
    return response.data;
  }

  static async bulkEnrollment(data: BulkEnrollmentRequest): Promise<SequenceEnrollment[]> {
    const response = await apiClient.post(`${this.baseUrl}/enrollments/bulk`, data);
    return response.data;
  }

  static async pauseEnrollment(enrollmentId: string): Promise<SequenceEnrollment> {
    const response = await apiClient.patch(`${this.baseUrl}/enrollments/${enrollmentId}/pause`);
    return response.data;
  }

  static async resumeEnrollment(enrollmentId: string): Promise<SequenceEnrollment> {
    const response = await apiClient.patch(`${this.baseUrl}/enrollments/${enrollmentId}/resume`);
    return response.data;
  }

  static async removeEnrollment(enrollmentId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/enrollments/${enrollmentId}`);
  }

  static async updateEnrollment(enrollmentId: string, data: {
    status?: 'active' | 'paused' | 'completed' | 'failed' | 'unsubscribed';
    currentStepId?: string;
    currentStepOrder?: number;
    nextExecutionAt?: string;
    metadata?: Record<string, any>;
  }): Promise<SequenceEnrollment> {
    const response = await apiClient.patch(`${this.baseUrl}/enrollments/${enrollmentId}`, data);
    return response.data;
  }

  static async configureAutoEnrollment(config: AutoEnrollmentConfig): Promise<void> {
    await apiClient.post(`/sequence-enrollments/sequences/${config.sequenceId}/auto-enrollment`, config);
  }

  static async getAutoEnrollmentConfig(sequenceId: string): Promise<any> {
    const response = await apiClient.get(`/sequence-enrollments/sequences/${sequenceId}/auto-enrollment`);
    return response.data;
  }
}
