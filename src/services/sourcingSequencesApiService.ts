import apiClient from '../lib/api';

export interface SourcingSequenceStep {
  id?: string;
  name: string;
  description?: string;
  type: 'email' | 'sms' | 'call' | 'task' | 'wait' | 'linkedin_message';
  status: 'active' | 'inactive' | 'draft';
  stepOrder: number;
  subject?: string;
  content: string;
  htmlContent?: string;
  isHtmlContent?: boolean;
  variables?: string[];
  triggerType: 'immediate' | 'delay' | 'condition' | 'manual';
  delayHours: number;
  delayMinutes: number;
  triggerConditions?: Record<string, any>;
  sendingSettings?: Record<string, any>;
  analytics?: Record<string, any>;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface SourcingSequence {
  id: string;
  name: string;
  description?: string;
  type: 'initial' | 'follow_up' | 'cold_outreach' | 'warm_intro' | 'thank_you' | 'candidate_outreach' | 'client_outreach' | 'custom';
  trigger: 'manual' | 'stage_entry' | 'time_based' | 'condition_met';
  status: 'active' | 'inactive' | 'draft' | 'archived';
  projectId?: string;
  tags?: string[];
  variables?: string[];
  metadata?: Record<string, any>;
  isActive: boolean;
  usageCount: number;
  responseRate: number;
  lastUsedAt?: string;
  version: number;
  config?: {
    maxSteps?: number;
    stopOnReply?: boolean;
    stopOnUnsubscribe?: boolean;
    businessHoursOnly?: boolean;
    businessHoursStart?: string;
    businessHoursEnd?: string;
    workDays?: string[];
    maxEmailsPerDay?: number;
    delayBetweenEmails?: number;
  };
  analytics?: {
    totalSent: number;
    totalResponses: number;
    totalClicks: number;
    totalOpens: number;
    averageResponseTime: number;
    conversionRate: number;
  };
  createdById: string;
  createdBy?: any;
  createdAt: string;
  updatedAt: string;
  steps: SourcingSequenceStep[];
  stepCount: number;
  averageResponseRate: number;
}

export interface CreateSourcingSequenceRequest {
  name: string;
  description?: string;
  type: SourcingSequence['type'];
  trigger: SourcingSequence['trigger'];
  status?: SourcingSequence['status'];
  projectId?: string;
  tags?: string[];
  variables?: string[];
  metadata?: Record<string, any>;
  isActive?: boolean;
  config?: SourcingSequence['config'];
  steps: Omit<SourcingSequenceStep, 'id'>[];
}

export interface UpdateSourcingSequenceRequest {
  name?: string;
  description?: string;
  type?: SourcingSequence['type'];
  trigger?: SourcingSequence['trigger'];
  status?: SourcingSequence['status'];
  tags?: string[];
  variables?: string[];
  metadata?: Record<string, any>;
  isActive?: boolean;
  config?: SourcingSequence['config'];
  steps?: Omit<SourcingSequenceStep, 'id'>[];
}

export interface GetSourcingSequencesResponse {
  data: SourcingSequence[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class SourcingSequencesApiService {
  private static baseUrl = '/api/v1/sourcing/sequences';

  static async getSequencesByProject(projectId: string): Promise<GetSourcingSequencesResponse> {
    const response = await apiClient.get(`${this.baseUrl}/project/${projectId}`);
    return response.data;
  }

  static async getSequenceById(id: string): Promise<SourcingSequence> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  static async createSequence(data: CreateSourcingSequenceRequest): Promise<SourcingSequence> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  static async updateSequence(id: string, data: UpdateSourcingSequenceRequest): Promise<SourcingSequence> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  static async deleteSequence(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  static async toggleSequenceStatus(id: string): Promise<SourcingSequence> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/toggle-status`);
    return response.data;
  }

  static async duplicateSequence(id: string, data: { name: string; description?: string }): Promise<SourcingSequence> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/duplicate`, data);
    return response.data;
  }

  static async trackUsage(id: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/track-usage`);
  }

  // Enrollment methods
  static async getSequenceEnrollments(sequenceId: string): Promise<any[]> {
    const response = await apiClient.get(`${this.baseUrl}/${sequenceId}/enrollments`);
    return response.data;
  }

  static async enrollCandidate(sequenceId: string, candidateId: string): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/${sequenceId}/enroll`, { candidateId });
    return response.data;
  }

  static async bulkEnrollCandidates(sequenceId: string, candidateIds: string[]): Promise<any[]> {
    const response = await apiClient.post(`${this.baseUrl}/${sequenceId}/bulk-enroll`, { candidateIds });
    return response.data;
  }

  static async pauseEnrollment(enrollmentId: string): Promise<any> {
    const response = await apiClient.patch(`${this.baseUrl}/enrollments/${enrollmentId}/pause`);
    return response.data;
  }

  static async resumeEnrollment(enrollmentId: string): Promise<any> {
    const response = await apiClient.patch(`${this.baseUrl}/enrollments/${enrollmentId}/resume`);
    return response.data;
  }

  static async removeEnrollment(enrollmentId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/enrollments/${enrollmentId}`);
  }

  static async sendSequenceEmails(sequenceId: string): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/${sequenceId}/send-emails`);
    return response.data;
  }
}
