import apiClient from '../lib/api';

// Project Types
export interface SourcingProject {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  visibility: 'private' | 'team' | 'public';
  requirements?: {
    positions?: number;
    targetHires?: number;
    deadline?: string;
    urgency?: string;
    budget?: {
      amount?: number;
      currency?: string;
    };
    skills?: string[];
    experience?: string;
    location?: string[];
  };
  targets?: {
    totalProspects?: number;
    totalSearches?: number;
    avgProspectsPerSearch?: number;
    expectedResponseRate?: number;
    expectedHireRate?: number;
  };
  progress?: {
    totalProspects?: number;
    totalSearches?: number;
    totalSequences?: number;
    activeSequences?: number;
    completedSequences?: number;
    responseRate?: number;
    hireRate?: number;
  };
  startDate?: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  createdById: string;
  assignedToTeamId?: string;
  pipelineId?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: any;
  assignedToTeam?: any;
  pipeline?: any;
  collaborators?: any[];
  prospects?: any[];
  searches?: any[];
  sequences?: any[];
}

export interface CreateSourcingProjectDto {
  name: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  visibility?: 'private' | 'team' | 'public';
  requirements?: SourcingProject['requirements'];
  targets?: SourcingProject['targets'];
  startDate?: string;
  targetCompletionDate?: string;
  assignedToTeamId?: string;
  pipelineId?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  collaboratorIds?: string[];
}

export interface UpdateSourcingProjectDto extends Partial<CreateSourcingProjectDto> {
  status?: 'active' | 'paused' | 'completed' | 'archived';
  actualCompletionDate?: string;
  progress?: SourcingProject['progress'];
}

export interface SourcingProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  visibility?: string;
  assignedToTeamId?: string;
  createdById?: string;
  includeCollaborations?: boolean;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface SourcingProjectResponse {
  projects: SourcingProject[];
  total: number;
}

// Search Types
export interface SourcingSearch {
  id: string;
  name: string;
  description?: string;
  searchType: 'boolean' | 'natural_language' | 'ai_assisted' | 'manual';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  query: string;
  filters?: Record<string, any>;
  executedAt?: string;
  completedAt?: string;
  resultsCount: number;
  prospectsAdded: number;
  resultsMetadata?: Record<string, any>;
  searchConfig?: Record<string, any>;
  projectId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  project?: SourcingProject;
  createdBy?: any;
}

export interface CreateSourcingSearchDto {
  name: string;
  description?: string;
  searchType: SourcingSearch['searchType'];
  query: string;
  filters?: Record<string, any>;
  searchConfig?: Record<string, any>;
  projectId: string;
}

export interface UpdateSourcingSearchDto extends Partial<CreateSourcingSearchDto> {
  status?: SourcingSearch['status'];
  resultsCount?: number;
  prospectsAdded?: number;
  resultsMetadata?: Record<string, any>;
}

// Sequence Types
export interface SourcingSequence {
  id: string;
  name: string;
  description?: string;
  type: 'email' | 'linkedin' | 'phone' | 'multi_channel';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  trigger: 'manual' | 'automatic' | 'prospect_added' | 'stage_change' | 'time_based';
  config?: Record<string, any>;
  targetCriteria?: Record<string, any>;
  metrics?: Record<string, any>;
  abTestConfig?: Record<string, any>;
  projectId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  project?: SourcingProject;
  createdBy?: any;
  steps?: SourcingSequenceStep[];
}

export interface SourcingSequenceStep {
  id: string;
  stepOrder: number;
  name: string;
  type: 'email' | 'linkedin_message' | 'linkedin_connection' | 'phone_call' | 'task' | 'wait' | 'condition';
  status: 'active' | 'paused' | 'completed' | 'archived';
  subject?: string;
  content?: string;
  config?: Record<string, any>;
  metrics?: Record<string, any>;
  abTestVariant?: string;
  personalization?: Record<string, any>;
  sequenceId: string;
  createdAt: string;
  updatedAt: string;
  sequence?: SourcingSequence;
}

export interface CreateSourcingSequenceDto {
  name: string;
  description?: string;
  type: SourcingSequence['type'];
  trigger: SourcingSequence['trigger'];
  config?: Record<string, any>;
  targetCriteria?: Record<string, any>;
  abTestConfig?: Record<string, any>;
  projectId: string;
}

export interface UpdateSourcingSequenceDto extends Partial<CreateSourcingSequenceDto> {
  status?: SourcingSequence['status'];
  metrics?: Record<string, any>;
}

export interface CreateSourcingSequenceStepDto {
  stepOrder?: number;
  name: string;
  type: SourcingSequenceStep['type'];
  subject?: string;
  content?: string;
  config?: Record<string, any>;
  abTestVariant?: string;
  personalization?: Record<string, any>;
}

export interface UpdateSourcingSequenceStepDto extends Partial<CreateSourcingSequenceStepDto> {
  status?: SourcingSequenceStep['status'];
  metrics?: Record<string, any>;
}

// Enhanced Prospect Types (project-based)
export interface SourcingProspectEnhanced {
  id: string;
  candidateId: string;
  candidate?: any;
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
  createdById: string;
  createdBy?: any;
  sharedWithTeamId?: string;
  sharedWithTeam?: any;
  projectId?: string; // NEW
  project?: SourcingProject; // NEW
  createdAt: string;
  updatedAt: string;
}

// Project-based Sourcing API Service
export const sourcingProjectApiService = {
  // Project Management
  async createProject(data: CreateSourcingProjectDto): Promise<SourcingProject> {
    const response = await apiClient.post('/sourcing/projects', data);
    return response.data;
  },

  async getProjects(params: SourcingProjectQueryParams = {}): Promise<SourcingProjectResponse> {
    const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        if (Array.isArray(value) && value.length === 0) return acc;
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    const response = await apiClient.get('/sourcing/projects', { params: filteredParams });
    return response.data;
  },

  async getProject(id: string): Promise<SourcingProject> {
    const response = await apiClient.get(`/sourcing/projects/${id}`);
    return response.data;
  },

  async updateProject(id: string, data: UpdateSourcingProjectDto): Promise<SourcingProject> {
    const response = await apiClient.patch(`/sourcing/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/sourcing/projects/${id}`);
  },

  async addCollaborators(id: string, userIds: string[]): Promise<SourcingProject> {
    const response = await apiClient.post(`/sourcing/projects/${id}/collaborators`, { userIds });
    return response.data;
  },

  async removeCollaborator(id: string, userId: string): Promise<SourcingProject> {
    const response = await apiClient.delete(`/sourcing/projects/${id}/collaborators/${userId}`);
    return response.data;
  },

  async getProjectAnalytics(id: string): Promise<any> {
    const response = await apiClient.get(`/sourcing/projects/${id}/analytics`);
    return response.data;
  },

  // Project Prospects
  async getProjectProspects(projectId: string): Promise<SourcingProspectEnhanced[]> {
    const response = await apiClient.get(`/sourcing/projects/${projectId}/prospects`);
    return response.data;
  },

  async getProjectStats(projectId: string): Promise<any> {
    const response = await apiClient.get(`/sourcing/projects/${projectId}/stats`);
    return response.data;
  },

  async addProspectsToProject(
    projectId: string,
    candidateIds: string[],
    searchId?: string
  ): Promise<SourcingProspectEnhanced[]> {
    const response = await apiClient.post(`/sourcing/projects/${projectId}/prospects`, {
      candidateIds,
      searchId,
    });
    return response.data;
  },

  // Search Management
  async createSearch(data: CreateSourcingSearchDto): Promise<SourcingSearch> {
    const response = await apiClient.post('/sourcing/searches', data);
    return response.data;
  },

  async getProjectSearches(projectId: string): Promise<SourcingSearch[]> {
    const response = await apiClient.get(`/sourcing/searches/project/${projectId}`);
    return response.data;
  },

  async getSearch(id: string): Promise<SourcingSearch> {
    const response = await apiClient.get(`/sourcing/searches/${id}`);
    return response.data;
  },

  async updateSearch(id: string, data: UpdateSourcingSearchDto): Promise<SourcingSearch> {
    const response = await apiClient.patch(`/sourcing/searches/${id}`, data);
    return response.data;
  },

  async executeSearch(id: string): Promise<SourcingSearch> {
    const response = await apiClient.post(`/sourcing/searches/${id}/execute`);
    return response.data;
  },

  async completeSearch(
    id: string,
    results: { resultsCount: number; prospectsAdded: number; resultsMetadata?: any }
  ): Promise<SourcingSearch> {
    const response = await apiClient.post(`/sourcing/searches/${id}/complete`, results);
    return response.data;
  },

  async cancelSearch(id: string): Promise<SourcingSearch> {
    const response = await apiClient.post(`/sourcing/searches/${id}/cancel`);
    return response.data;
  },

  async deleteSearch(id: string): Promise<void> {
    await apiClient.delete(`/sourcing/searches/${id}`);
  },

  async getSearchAnalytics(projectId: string): Promise<any> {
    const response = await apiClient.get(`/sourcing/searches/project/${projectId}/analytics`);
    return response.data;
  },

  // Sequence Management
  async createSequence(data: CreateSourcingSequenceDto): Promise<SourcingSequence> {
    const response = await apiClient.post('/sourcing/sequences', data);
    return response.data;
  },

  async getProjectSequences(projectId: string): Promise<SourcingSequence[]> {
    const response = await apiClient.get(`/sourcing/sequences/project/${projectId}`);
    return response.data;
  },

  async getSequence(id: string): Promise<SourcingSequence> {
    const response = await apiClient.get(`/sourcing/sequences/${id}`);
    return response.data;
  },

  async updateSequence(id: string, data: UpdateSourcingSequenceDto): Promise<SourcingSequence> {
    const response = await apiClient.patch(`/sourcing/sequences/${id}`, data);
    return response.data;
  },

  async deleteSequence(id: string): Promise<void> {
    await apiClient.delete(`/sourcing/sequences/${id}`);
  },

  async duplicateSequence(id: string): Promise<SourcingSequence> {
    const response = await apiClient.post(`/sourcing/sequences/${id}/duplicate`);
    return response.data;
  },

  async activateSequence(id: string): Promise<SourcingSequence> {
    const response = await apiClient.post(`/sourcing/sequences/${id}/activate`);
    return response.data;
  },

  async pauseSequence(id: string): Promise<SourcingSequence> {
    const response = await apiClient.post(`/sourcing/sequences/${id}/pause`);
    return response.data;
  },

  async completeSequence(id: string): Promise<SourcingSequence> {
    const response = await apiClient.post(`/sourcing/sequences/${id}/complete`);
    return response.data;
  },

  async getSequenceAnalytics(projectId: string): Promise<any> {
    const response = await apiClient.get(`/sourcing/sequences/project/${projectId}/analytics`);
    return response.data;
  },

  async getSequencePerformance(id: string): Promise<any> {
    const response = await apiClient.get(`/sourcing/sequences/${id}/performance`);
    return response.data;
  },

  // Sequence Steps
  async createSequenceStep(
    sequenceId: string,
    data: CreateSourcingSequenceStepDto
  ): Promise<SourcingSequenceStep> {
    const response = await apiClient.post(`/sourcing/sequences/${sequenceId}/steps`, data);
    return response.data;
  },

  async getSequenceSteps(sequenceId: string): Promise<SourcingSequenceStep[]> {
    const response = await apiClient.get(`/sourcing/sequences/${sequenceId}/steps`);
    return response.data;
  },

  async getSequenceStep(stepId: string): Promise<SourcingSequenceStep> {
    const response = await apiClient.get(`/sourcing/sequences/steps/${stepId}`);
    return response.data;
  },

  async updateSequenceStep(stepId: string, data: UpdateSourcingSequenceStepDto): Promise<SourcingSequenceStep> {
    const response = await apiClient.patch(`/sourcing/sequences/steps/${stepId}`, data);
    return response.data;
  },

  async deleteSequenceStep(stepId: string): Promise<void> {
    await apiClient.delete(`/sourcing/sequences/steps/${stepId}`);
  },

  async reorderSequenceSteps(
    sequenceId: string,
    stepOrders: { stepId: string; order: number }[]
  ): Promise<SourcingSequenceStep[]> {
    const response = await apiClient.post(`/sourcing/sequences/${sequenceId}/steps/reorder`, {
      stepOrders,
    });
    return response.data;
  },

  // Sequence Enrollment Methods
  async enrollCandidate(data: {
    candidateId: string;
    sequenceId: string;
    enrollmentTrigger?: 'manual' | 'automatic' | 'pipeline_stage';
    metadata?: Record<string, any>;
  }): Promise<any> {
    const response = await apiClient.post(`/sourcing/sequences/${data.sequenceId}/enroll`, {
      candidateId: data.candidateId,
      enrollmentTrigger: data.enrollmentTrigger,
      metadata: data.metadata
    });
    return response.data;
  },

  async bulkEnrollCandidates(data: {
    candidateIds: string[];
    sequenceId: string;
    enrollmentTrigger?: 'manual' | 'automatic' | 'pipeline_stage';
    metadata?: Record<string, any>;
  }): Promise<any[]> {
    const response = await apiClient.post(`/sourcing/sequences/${data.sequenceId}/bulk-enroll`, {
      candidateIds: data.candidateIds,
      enrollmentTrigger: data.enrollmentTrigger,
      metadata: data.metadata
    });
    return response.data;
  },

  async unenrollCandidate(enrollmentId: string): Promise<void> {
    await apiClient.delete(`/sourcing/sequences/enrollments/${enrollmentId}`);
  },

  async pauseEnrollment(enrollmentId: string): Promise<any> {
    const response = await apiClient.patch(`/sourcing/sequences/enrollments/${enrollmentId}/pause`);
    return response.data;
  },

  async resumeEnrollment(enrollmentId: string): Promise<any> {
    const response = await apiClient.patch(`/sourcing/sequences/enrollments/${enrollmentId}/resume`);
    return response.data;
  },

  async getSequenceEnrollments(sequenceId: string): Promise<any[]> {
    const response = await apiClient.get(`/sourcing/sequences/${sequenceId}/enrollments`);
    return response.data;
  },

  async sendSequenceEmails(sequenceId: string): Promise<{ message: string; jobId?: string }> {
    const response = await apiClient.post(`/sourcing/sequences/${sequenceId}/send-emails`);
    return response.data;
  },

  async setupDefaultSequences(projectId: string): Promise<{ 
    message: string; 
    sequences: any[]; 
    totalSteps: number 
  }> {
    const response = await apiClient.post(`/sourcing/projects/${projectId}/setup-default-sequences`);
    return response.data;
  },
};
