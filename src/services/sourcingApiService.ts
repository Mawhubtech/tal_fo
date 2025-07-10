import apiClient from '../lib/api';

export interface SourcingProspect {
  id: string;
  candidateId: string;
  candidate?: any; // This will contain the full candidate data
  status: 'new' | 'contacted' | 'responded' | 'interested' | 'not_interested' | 'closed';
  lastContact?: string;
  source: 'linkedin' | 'linkedin_chrome_extension' | 'github' | 'indeed' | 'referral' | 'direct_application' | 'recruitment_agency' | 'other';
  rating: number;
  notes?: string;
  metadata?: Record<string, any>;
  pipelineId?: string;
  currentStageId?: string;
  pipeline?: any;
  currentStage?: any;
  createdBy?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSourcingProspectDto {
  candidateId: string;
  status?: 'new' | 'contacted' | 'responded' | 'interested' | 'not_interested' | 'closed';
  source?: 'linkedin' | 'linkedin_chrome_extension' | 'github' | 'indeed' | 'referral' | 'direct_application' | 'recruitment_agency' | 'other';
  rating?: number;
  notes?: string;
  pipelineId?: string;
  currentStageId?: string;
  metadata?: Record<string, any>;
}

export interface SourcingProspectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  source?: string;
  skills?: string[];
  location?: string;
  minRating?: number;
  pipelineId?: string;
  stageId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface SourcingProspectResponse {
  prospects: SourcingProspect[];
  total: number;
}

export interface MoveSourcingProspectStageDto {
  stageId: string;
  notes?: string;
}

export interface SourcingStats {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  byRating: Record<string, number>;
}

export interface PipelineStats {
  pipelineId: string;
  pipelineName: string;
  totalProspects: number;
  stageStats: Array<{
    stageId: string;
    stageName: string;
    count: number;
    order: number;
  }>;
}

export interface ConversionRate {
  fromStage: string;
  toStage: string;
  fromCount: number;
  toCount: number;
  conversionRate: number;
}

export const sourcingApiService = {
  // Prospect management
  async createProspect(data: CreateSourcingProspectDto): Promise<SourcingProspect> {
    const response = await apiClient.post('/api/v1/sourcing/prospects', data);
    return response.data;
  },

  async getProspects(params: SourcingProspectQueryParams = {}): Promise<SourcingProspectResponse> {
    // Filter out empty string values to avoid validation errors
    const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        // For arrays, only include if they have elements
        if (Array.isArray(value) && value.length === 0) {
          return acc;
        }
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    const response = await apiClient.get('/api/v1/sourcing/prospects', { params: filteredParams });
    return response.data;
  },

  async getProspect(id: string): Promise<SourcingProspect> {
    const response = await apiClient.get(`/api/v1/sourcing/prospects/${id}`);
    return response.data;
  },

  async updateProspect(id: string, data: Partial<CreateSourcingProspectDto>): Promise<SourcingProspect> {
    const response = await apiClient.patch(`/api/v1/sourcing/prospects/${id}`, data);
    return response.data;
  },

  async deleteProspect(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/sourcing/prospects/${id}`);
  },

  async moveProspectToStage(id: string, data: MoveSourcingProspectStageDto): Promise<SourcingProspect> {
    const response = await apiClient.patch(`/api/v1/sourcing/prospects/${id}/move-stage`, data);
    return response.data;
  },

  // Pipeline-specific endpoints
  async getProspectsByPipeline(pipelineId: string): Promise<SourcingProspect[]> {
    const response = await apiClient.get(`/api/v1/sourcing/prospects/pipeline/${pipelineId}`);
    return response.data;
  },

  async getProspectsByStage(stageId: string): Promise<SourcingProspect[]> {
    const response = await apiClient.get(`/api/v1/sourcing/prospects/stage/${stageId}`);
    return response.data;
  },

  // Statistics
  async getProspectStats(): Promise<SourcingStats> {
    const response = await apiClient.get('/api/v1/sourcing/prospects/stats');
    return response.data;
  },

  async getPipelineStats(pipelineId: string): Promise<PipelineStats> {
    const response = await apiClient.get(`/api/v1/sourcing/pipeline/${pipelineId}/stats`);
    return response.data;
  },

  async getConversionRates(pipelineId: string): Promise<ConversionRate[]> {
    const response = await apiClient.get(`/api/v1/sourcing/pipeline/${pipelineId}/conversion-rates`);
    return response.data;
  },

  // Pipeline management
  async getDefaultPipeline(): Promise<any> {
    const response = await apiClient.get('/api/v1/sourcing/pipeline/default');
    return response.data;
  },

  // Bulk operations
  async bulkMoveProspects(prospectIds: string[], targetStageId: string, notes?: string): Promise<SourcingProspect[]> {
    const response = await apiClient.post('/api/v1/sourcing/prospects/bulk-move', {
      prospectIds,
      targetStageId,
      notes,
    });
    return response.data;
  },
};
