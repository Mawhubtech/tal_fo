import apiClient from '../lib/api';

export interface EmailSequenceStep {
  id?: string;
  name: string;
  description?: string;
  type: 'email' | 'sms' | 'call' | 'task' | 'wait' | 'linkedin_message';
  status: 'active' | 'inactive' | 'draft';
  stepOrder: number;
  subject?: string;
  content: string;
  htmlContent?: string;
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

export interface EmailSequence {
  id: string;
  name: string;
  description?: string;
  type: 'initial' | 'follow_up' | 'cold_outreach' | 'warm_intro' | 'thank_you' | 'candidate_outreach' | 'client_outreach' | 'custom';
  category: 'candidate_sourcing' | 'client_outreach' | 'recruitment' | 'follow_up' | 'general' | 'networking' | 'interview' | 'onboarding' | 'custom';
  scope: 'global' | 'organization' | 'team' | 'personal';
  status: 'active' | 'inactive' | 'draft' | 'archived';
  tags?: string[];
  variables?: string[];
  metadata?: Record<string, any>;
  isActive: boolean;
  isPreset: boolean;
  isFavorite: boolean;
  usageCount: number;
  responseRate: number;
  lastUsedAt?: string;
  version: number;
  timing?: {
    autoAdvance: boolean;
    defaultDelay: number;
    businessHoursOnly: boolean;
    timezone: string;
  };
  analytics?: {
    totalSent: number;
    totalResponses: number;
    totalClicks: number;
    totalOpens: number;
    bounceRate: number;
  };
  organizationId?: string;
  teamId?: string;
  createdById: string;
  createdBy?: any;
  steps: EmailSequenceStep[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSequenceRequest {
  name: string;
  description?: string;
  type: EmailSequence['type'];
  category: EmailSequence['category'];
  scope?: EmailSequence['scope'];
  status?: EmailSequence['status'];
  tags?: string[];
  variables?: string[];
  metadata?: Record<string, any>;
  isActive?: boolean;
  isPreset?: boolean;
  timing?: EmailSequence['timing'];
  organizationId?: string;
  teamId?: string;
  steps: Omit<EmailSequenceStep, 'id'>[];
}

export interface UpdateSequenceRequest {
  name?: string;
  description?: string;
  type?: EmailSequence['type'];
  category?: EmailSequence['category'];
  scope?: EmailSequence['scope'];
  status?: EmailSequence['status'];
  tags?: string[];
  variables?: string[];
  metadata?: Record<string, any>;
  isActive?: boolean;
  isPreset?: boolean;
  timing?: EmailSequence['timing'];
  organizationId?: string;
  teamId?: string;
  steps?: Partial<EmailSequenceStep>[];
}

export interface GetSequencesParams {
  search?: string;
  type?: EmailSequence['type'];
  category?: EmailSequence['category'];
  scope?: EmailSequence['scope'];
  status?: EmailSequence['status'];
  isActive?: boolean;
  isPreset?: boolean;
  isFavorite?: boolean;
  tags?: string[];
  createdBy?: string;
  organizationId?: string;
  teamId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedSequencesResponse {
  data: EmailSequence[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SequenceAnalytics {
  totalSequences: number;
  activeSequences: number;
  favoriteSequences: number;
  totalUsage: number;
  averageResponseRate: number;
  topPerformingSequences: EmailSequence[];
  recentSequences: EmailSequence[];
  sequencesByCategory: Record<string, number>;
  sequencesByType: Record<string, number>;
}

export interface DuplicateSequenceRequest {
  name?: string;
  description?: string;
  scope?: EmailSequence['scope'];
  organizationId?: string;
  teamId?: string;
}

export interface BulkSequenceActionRequest {
  sequenceIds: string[];
  action: 'activate' | 'deactivate' | 'archive' | 'delete';
}

export class EmailSequencesApiService {
  private static baseUrl = '/email-sequences';

  static async getSequences(params?: GetSequencesParams): Promise<PaginatedSequencesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => searchParams.append(key, item.toString()));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get(`${this.baseUrl}?${searchParams.toString()}`);
    return response.data;
  }

  static async getSequence(id: string): Promise<EmailSequence> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  static async createSequence(data: CreateSequenceRequest): Promise<EmailSequence> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  static async updateSequence(id: string, data: UpdateSequenceRequest): Promise<EmailSequence> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  static async deleteSequence(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  static async duplicateSequence(id: string, data: DuplicateSequenceRequest): Promise<EmailSequence> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/duplicate`, data);
    return response.data;
  }

  static async toggleFavorite(id: string): Promise<EmailSequence> {
    const response = await apiClient.put(`${this.baseUrl}/${id}/favorite`);
    return response.data;
  }

  static async bulkAction(data: BulkSequenceActionRequest): Promise<{ affected: number }> {
    const response = await apiClient.post(`${this.baseUrl}/bulk-action`, data);
    return response.data;
  }

  static async getAnalytics(): Promise<SequenceAnalytics> {
    const response = await apiClient.get(`${this.baseUrl}/analytics`);
    return response.data;
  }

  static async getPresets(): Promise<EmailSequence[]> {
    const response = await apiClient.get(`${this.baseUrl}/presets`);
    return response.data;
  }

  static async trackUsage(id: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/track-usage`);
  }

  static async updateAnalytics(id: string, analytics: {
    totalSent?: number;
    totalResponses?: number;
    totalClicks?: number;
    totalOpens?: number;
    bounceRate?: number;
  }): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/analytics`, analytics);
  }
}
