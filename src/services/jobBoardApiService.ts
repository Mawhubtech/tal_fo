import apiClient from '../lib/api';

export interface JobBoardConfig {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  supportedFeatures: {
    autoPosting: boolean;
    responseTracking: boolean;
    analytics: boolean;
    budgetManagement: boolean;
  };
  authType: 'api_key' | 'oauth' | 'username_password';
  fields: {
    [key: string]: {
      type: 'text' | 'password' | 'url' | 'email';
      label: string;
      required: boolean;
      placeholder?: string;
    };
  };
}

export interface OrganizationJobBoard {
  id: string;
  jobBoardId: string;
  organizationId: string;
  departmentId?: string;
  isActive: boolean;
  credentials: {
    isConfigured: boolean;
    configuredBy: string;
    configuredAt: string;
    fields: { [key: string]: string };
  };
  settings: {
    autoPost: boolean;
    requireApproval: boolean;
    defaultTemplate?: string;
    syncFrequency: string;
    notifications: {
      onNewResponse: boolean;
      onSyncError: boolean;
      onBudgetAlert: boolean;
    };
  };
  assignedRecruiters: string[];
  analytics: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    totalResponses: number;
    responseRate: number;
    lastSync: string;
  };
  budget?: {
    total: number;
    spent: number;
    currency: string;
    period: 'monthly' | 'quarterly' | 'yearly';
  };
}

export interface RecruiterJobBoardAccess {
  id: string;
  recruiterId: string;
  organizationJobBoardId: string;
  permissions: {
    canPost: boolean;
    canViewResponses: boolean;
    canManageCredentials: boolean;
    canViewAnalytics: boolean;
    canManageBudget: boolean;
  };
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}

export interface JobBoardPosting {
  id: string;
  jobId: string;
  organizationJobBoardId: string;
  externalPostingId: string;
  status: 'draft' | 'pending' | 'active' | 'paused' | 'expired' | 'rejected';
  postedAt?: string;
  expiresAt?: string;
  postedBy: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  analytics: {
    views: number;
    applications: number;
    responses: number;
    clicks: number;
    impressions: number;
  };
  budget?: {
    allocated: number;
    spent: number;
    cpc: number; // cost per click
    cpa: number; // cost per application
  };
  lastSyncAt: string;
}

export interface JobBoardResponse {
  id: string;
  jobBoardPostingId: string;
  externalResponseId: string;
  candidateData: {
    name: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    coverLetterUrl?: string;
    portfolioUrl?: string;
    linkedInUrl?: string;
  };
  responseType: 'application' | 'inquiry' | 'referral' | 'screening_question';
  responseDate: string;
  responseQuality: number; // 1-5 rating assigned by recruiter
  status: 'new' | 'reviewed' | 'contacted' | 'rejected' | 'hired' | 'archived';
  recruiterNotes?: string;
  lastActionDate?: string;
  lastActionBy?: string;
  screeningAnswers?: {
    questionId: string;
    question: string;
    answer: string;
  }[];
  source: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    referrer?: string;
  };
}

class JobBoardApiService {
  // Job Board Configuration
  async getAvailableJobBoards(): Promise<JobBoardConfig[]> {
    const response = await apiClient.get('/api/v1/job-boards/available');
    return response.data;
  }

  async getJobBoardConfig(jobBoardId: string): Promise<JobBoardConfig> {
    const response = await apiClient.get(`/api/v1/job-boards/${jobBoardId}/config`);
    return response.data;
  }

  // Organization Job Board Management
  async getOrganizationJobBoards(organizationId: string, departmentId?: string): Promise<OrganizationJobBoard[]> {
    const params = departmentId ? { departmentId } : {};
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/job-boards`, { params });
    return response.data;
  }

  async addJobBoardToOrganization(organizationId: string, data: {
    jobBoardId: string;
    departmentId?: string;
    credentials: { [key: string]: string };
    settings: OrganizationJobBoard['settings'];
  }): Promise<OrganizationJobBoard> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/job-boards`, data);
    return response.data;
  }

  async updateOrganizationJobBoard(organizationId: string, jobBoardId: string, data: Partial<OrganizationJobBoard>): Promise<OrganizationJobBoard> {
    const response = await apiClient.patch(`/api/v1/organizations/${organizationId}/job-boards/${jobBoardId}`, data);
    return response.data;
  }

  async removeJobBoardFromOrganization(organizationId: string, jobBoardId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/job-boards/${jobBoardId}`);
  }

  async testJobBoardConnection(organizationId: string, jobBoardId: string): Promise<{
    success: boolean;
    message: string;
    features: string[];
  }> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/job-boards/${jobBoardId}/test`);
    return response.data;
  }

  // Recruiter Access Management
  async getRecruiterJobBoardAccess(recruiterId: string, organizationId: string): Promise<RecruiterJobBoardAccess[]> {
    const response = await apiClient.get(`/api/v1/recruiters/${recruiterId}/job-board-access`, {
      params: { organizationId }
    });
    return response.data;
  }

  async assignRecruiterToJobBoard(organizationId: string, data: {
    recruiterId: string;
    organizationJobBoardId: string;
    permissions: RecruiterJobBoardAccess['permissions'];
  }): Promise<RecruiterJobBoardAccess> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/recruiter-access`, data);
    return response.data;
  }

  async updateRecruiterJobBoardAccess(accessId: string, data: Partial<RecruiterJobBoardAccess>): Promise<RecruiterJobBoardAccess> {
    const response = await apiClient.patch(`/api/v1/recruiter-access/${accessId}`, data);
    return response.data;
  }

  async removeRecruiterJobBoardAccess(accessId: string): Promise<void> {
    await apiClient.delete(`/api/v1/recruiter-access/${accessId}`);
  }

  // Job Posting Management
  async getJobBoardPostings(filters: {
    recruiterId?: string;
    organizationId?: string;
    jobId?: string;
    status?: string;
    jobBoardId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<JobBoardPosting[]> {
    const response = await apiClient.get('/api/v1/job-board-postings', { params: filters });
    return response.data;
  }

  async createJobBoardPosting(data: {
    jobId: string;
    organizationJobBoardId: string;
    autoPost?: boolean;
    scheduledPostDate?: string;
    budget?: {
      allocated: number;
      duration: number; // days
    };
  }): Promise<JobBoardPosting> {
    const response = await apiClient.post('/api/v1/job-board-postings', data);
    return response.data;
  }

  async updateJobBoardPosting(postingId: string, data: Partial<JobBoardPosting>): Promise<JobBoardPosting> {
    const response = await apiClient.patch(`/api/v1/job-board-postings/${postingId}`, data);
    return response.data;
  }

  async pauseJobBoardPosting(postingId: string): Promise<JobBoardPosting> {
    const response = await apiClient.post(`/api/v1/job-board-postings/${postingId}/pause`);
    return response.data;
  }

  async resumeJobBoardPosting(postingId: string): Promise<JobBoardPosting> {
    const response = await apiClient.post(`/api/v1/job-board-postings/${postingId}/resume`);
    return response.data;
  }

  async deleteJobBoardPosting(postingId: string): Promise<void> {
    await apiClient.delete(`/api/v1/job-board-postings/${postingId}`);
  }

  async approveJobBoardPosting(postingId: string, notes?: string): Promise<JobBoardPosting> {
    const response = await apiClient.post(`/api/v1/job-board-postings/${postingId}/approve`, { notes });
    return response.data;
  }

  async rejectJobBoardPosting(postingId: string, reason: string): Promise<JobBoardPosting> {
    const response = await apiClient.post(`/api/v1/job-board-postings/${postingId}/reject`, { reason });
    return response.data;
  }

  // Response Management
  async getJobBoardResponses(filters: {
    recruiterId?: string;
    organizationId?: string;
    jobId?: string;
    postingId?: string;
    status?: string;
    responseType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    responses: JobBoardResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get('/api/v1/job-board-responses', { params: filters });
    return response.data;
  }

  async updateJobBoardResponse(responseId: string, data: {
    status?: JobBoardResponse['status'];
    responseQuality?: number;
    recruiterNotes?: string;
  }): Promise<JobBoardResponse> {
    const response = await apiClient.patch(`/api/v1/job-board-responses/${responseId}`, data);
    return response.data;
  }

  async bulkUpdateJobBoardResponses(responseIds: string[], data: {
    status?: JobBoardResponse['status'];
    recruiterNotes?: string;
  }): Promise<JobBoardResponse[]> {
    const response = await apiClient.patch('/api/v1/job-board-responses/bulk', {
      responseIds,
      updates: data
    });
    return response.data;
  }

  async convertResponseToCandidate(responseId: string): Promise<{
    candidateId: string;
    applicationId: string;
  }> {
    const response = await apiClient.post(`/api/v1/job-board-responses/${responseId}/convert`);
    return response.data;
  }

  // Analytics and Reporting
  async getJobBoardAnalytics(filters: {
    organizationId: string;
    recruiterId?: string;
    jobBoardId?: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<{
    summary: {
      totalPostings: number;
      totalViews: number;
      totalApplications: number;
      totalResponses: number;
      avgResponseRate: number;
      totalSpent: number;
      avgCostPerApplication: number;
    };
    trends: {
      date: string;
      postings: number;
      views: number;
      applications: number;
      responses: number;
      spent: number;
    }[];
    jobBoardPerformance: {
      jobBoardId: string;
      jobBoardName: string;
      postings: number;
      views: number;
      applications: number;
      responses: number;
      responseRate: number;
      spent: number;
      roi: number;
    }[];
  }> {
    const response = await apiClient.get('/api/v1/job-board-analytics', { params: filters });
    return response.data;
  }

  async getRecruiterPerformance(organizationId: string, recruiterId?: string): Promise<{
    recruiterId: string;
    recruiterName: string;
    totalPostings: number;
    totalResponses: number;
    responseRate: number;
    avgQualityScore: number;
    totalSpent: number;
    roi: number;
  }[]> {
    const params = recruiterId ? { recruiterId } : {};
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/recruiter-performance`, { params });
    return response.data;
  }

  // Sync Operations
  async syncJobBoardData(organizationId: string, jobBoardId: string): Promise<{
    success: boolean;
    syncedPostings: number;
    newResponses: number;
    updatedAnalytics: number;
    errors: string[];
  }> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/job-boards/${jobBoardId}/sync`);
    return response.data;
  }

  async scheduleSync(organizationId: string, jobBoardId: string, schedule: {
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    time?: string; // for daily/weekly syncs
    isActive: boolean;
  }): Promise<void> {
    await apiClient.post(`/api/v1/organizations/${organizationId}/job-boards/${jobBoardId}/schedule-sync`, schedule);
  }

  // Templates
  async getJobPostingTemplates(organizationId: string): Promise<{
    id: string;
    name: string;
    title: string;
    description: string;
    requirements: string[];
    benefits: string[];
    isDefault: boolean;
    usage: number;
    jobBoardSpecific?: {
      [jobBoardId: string]: {
        customFields: { [key: string]: string };
        formatting: string;
      };
    };
  }[]> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/job-posting-templates`);
    return response.data;
  }

  async createJobPostingTemplate(organizationId: string, template: {
    name: string;
    title: string;
    description: string;
    requirements: string[];
    benefits: string[];
    isDefault?: boolean;
    jobBoardSpecific?: {
      [jobBoardId: string]: {
        customFields: { [key: string]: string };
        formatting: string;
      };
    };
  }): Promise<void> {
    await apiClient.post(`/api/v1/organizations/${organizationId}/job-posting-templates`, template);
  }
}

export const jobBoardApiService = new JobBoardApiService();
