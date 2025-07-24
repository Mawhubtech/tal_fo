import apiClient from '../lib/api';

// TypeScript interfaces based on backend DTOs
export interface ClientOutreachProject {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  targetCriteria?: {
    industries?: string[];
    locations?: string[];
    companySize?: string[];
    technologies?: string[];
    keywords?: string[];
    revenue?: { min?: number; max?: number };
    employees?: { min?: number; max?: number };
    fundingStage?: string[];
  };
  goals?: {
    targetProspects?: number;
    targetRevenue?: number;
    timeline?: string;
    notes?: string;
  };
  color?: string;
  tags?: string;
  pipeline?: any; // Pipeline object
  pipelineId?: string; // Pipeline ID
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientOutreachSearch {
  id: string;
  name: string;
  originalQuery?: string;
  searchType: 'ai' | 'manual';
  filters: any;
  coreSignalQuery?: any;
  results?: any;
  status: 'active' | 'completed' | 'archived';
  projectId?: string;
  project?: ClientOutreachProject; // Added project details
  createdById: string;
  createdBy?: any; // Added user details
  createdAt: string;
  updatedAt: string;
  prospectsCount?: number; // Added for displaying prospect count
}

export interface ClientProspect {
  id: string;
  companyName: string;
  description?: string;
  industry?: string;
  website?: string;
  logo?: string;
  linkedinUrl?: string;
  location?: string;
  sizeRange?: string;
  employeeCount?: number;
  revenue?: number;
  fundingStage?: string;
  technologies?: any;
  specialties?: any;
  socialProfiles?: any;
  matchScore?: number;
  coreSignalId?: string;
  rawData?: any;
  status: 'new' | 'contacted' | 'responded' | 'meeting_scheduled' | 'qualified' | 'unqualified' | 'lost';
  currentStageId?: string;
  priority: number;
  notes?: string;
  tags?: any;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  assignedTo?: string;
  projectId?: string;
  searchId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: 'active' | 'paused' | 'completed' | 'archived';
  targetCriteria?: ClientOutreachProject['targetCriteria'];
  goals?: ClientOutreachProject['goals'];
  color?: string;
  tags?: string;
  pipelineId?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  id: string;
}

export interface CreateSearchData {
  name: string;
  originalQuery?: string;
  searchType: 'ai' | 'manual';
  filters: any;
  coreSignalQuery?: any;
  status?: 'active' | 'completed' | 'archived';
  projectId?: string;
}

export interface UpdateSearchData extends Partial<CreateSearchData> {
  id: string;
}

export interface UpdateProspectData {
  status?: ClientProspect['status'];
  currentStageId?: string;
  priority?: number;
  notes?: string;
  tags?: any;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  assignedTo?: string;
}

export interface SearchCompaniesData {
  filters: any;
  searchText?: string;
  searchName: string;
  projectId?: string;
  searchType?: 'ai' | 'manual';
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchCompaniesResult {
  search: ClientOutreachSearch;
  prospects: ClientProspect[];
  total: number;
  page: number;
  limit: number;
}

export interface ExtractKeywordsResult {
  extractedFilters: any;
  searchText: string;
  confidence: number;
}

class ClientOutreachApiService {
  private readonly baseUrl = '/client-outreach';

  // ===============================================
  // PROJECT ENDPOINTS
  // ===============================================

  async getProjects(): Promise<ClientOutreachProject[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/projects`);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProject(id: string): Promise<ClientOutreachProject> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  async createProject(data: CreateProjectData): Promise<ClientOutreachProject> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/projects`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, data: Partial<CreateProjectData>): Promise<ClientOutreachProject> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/projects/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/projects/${id}`);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // ===============================================
  // SEARCH ENDPOINTS
  // ===============================================

  async getProjectSearches(projectId: string): Promise<ClientOutreachSearch[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/searches`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project searches:', error);
      throw error;
    }
  }

  async getAllSearches(): Promise<ClientOutreachSearch[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/searches`);
      return response.data;
    } catch (error) {
      console.error('Error fetching searches:', error);
      throw error;
    }
  }

  async searchCompanies(
    data: SearchCompaniesData,
    pagination?: PaginationParams
  ): Promise<SearchCompaniesResult> {
    try {
      const params = new URLSearchParams();
      if (pagination?.page) params.append('page', pagination.page.toString());
      if (pagination?.limit) params.append('limit', pagination.limit.toString());

      const response = await apiClient.post(
        `${this.baseUrl}/search/companies-and-save?${params}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error searching companies:', error);
      throw error;
    }
  }

  async extractKeywords(searchText: string): Promise<ExtractKeywordsResult> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/search/extract-keywords`, {
        searchText
      });
      return response.data;
    } catch (error) {
      console.error('Error extracting keywords:', error);
      throw error;
    }
  }

  async generateCoreSignalQuery(filters: any): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/search/generate-query`, {
        filters
      });
      return response.data;
    } catch (error) {
      console.error('Error generating CoreSignal query:', error);
      throw error;
    }
  }

  // ===============================================
  // PROSPECT ENDPOINTS
  // ===============================================

  async getProjectProspects(projectId: string): Promise<ClientProspect[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/prospects`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project prospects:', error);
      throw error;
    }
  }

  async getSearchProspects(searchId: string): Promise<ClientProspect[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/searches/${searchId}/prospects`);
      return response.data;
    } catch (error) {
      console.error('Error fetching search prospects:', error);
      throw error;
    }
  }

  async getSearchDetails(searchId: string): Promise<ClientOutreachSearch> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/searches/${searchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching search details:', error);
      throw error;
    }
  }

  async updateProspect(id: string, data: UpdateProspectData): Promise<ClientProspect> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/prospects/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating prospect:', error);
      throw error;
    }
  }

  async deleteProspect(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/prospects/${id}`);
    } catch (error) {
      console.error('Error deleting prospect:', error);
      throw error;
    }
  }

  // ===============================================
  // SEQUENCE ENDPOINTS (Email Campaigns)
  // ===============================================

  async getProjectSequences(projectId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/sequences`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project sequences:', error);
      // Return empty array for now until backend implements this
      return [];
    }
  }

  async getSequence(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/sequences/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sequence:', error);
      throw error;
    }
  }

  async getSequenceSteps(sequenceId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/sequences/${sequenceId}/steps`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sequence steps:', error);
      return [];
    }
  }

  async getSequenceStep(stepId: string): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/sequence-steps/${stepId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sequence step:', error);
      throw error;
    }
  }

  async getSequenceAnalytics(projectId: string): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/projects/${projectId}/sequences/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sequence analytics:', error);
      // Return default analytics until backend implements this
      return {
        totalSequences: 0,
        activeSequences: 0,
        pausedSequences: 0,
        completedSequences: 0,
        draftSequences: 0,
        totalSteps: 0,
        avgStepsPerSequence: 0,
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        totalEmailsSent: 0,
        totalEmailsOpened: 0,
        totalEmailsClicked: 0,
        totalReplies: 0,
        totalBounces: 0,
        totalUnsubscribes: 0,
        avgOpenRate: 0,
        avgClickRate: 0,
        avgReplyRate: 0,
        performanceBySequence: [],
        recentActivity: []
      };
    }
  }

  async getSequenceEnrollments(sequenceId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/sequences/${sequenceId}/enrollments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sequence enrollments:', error);
      return [];
    }
  }

  async getSequenceResponses(sequenceId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/sequences/${sequenceId}/responses`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sequence responses:', error);
      return [];
    }
  }

  async createSequence(projectId: string, data: any): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/projects/${projectId}/sequences`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating sequence:', error);
      throw error;
    }
  }

  async updateSequence(id: string, data: any): Promise<any> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/sequences/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating sequence:', error);
      throw error;
    }
  }

  async deleteSequence(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/sequences/${id}`);
    } catch (error) {
      console.error('Error deleting sequence:', error);
      throw error;
    }
  }

  async createSequenceStep(sequenceId: string, data: any): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/sequences/${sequenceId}/steps`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating sequence step:', error);
      throw error;
    }
  }

  async updateSequenceStep(id: string, data: any): Promise<any> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/sequence-steps/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating sequence step:', error);
      throw error;
    }
  }

  async deleteSequenceStep(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/sequence-steps/${id}`);
    } catch (error) {
      console.error('Error deleting sequence step:', error);
      throw error;
    }
  }

  async enrollInSequence(sequenceId: string, enrollments: any[]): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/sequences/${sequenceId}/enrollments`, {
        enrollments
      });
      return response.data;
    } catch (error) {
      console.error('Error enrolling in sequence:', error);
      throw error;
    }
  }

  async pauseEnrollment(enrollmentId: string): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/enrollments/${enrollmentId}/pause`);
      return response.data;
    } catch (error) {
      console.error('Error pausing enrollment:', error);
      throw error;
    }
  }

  async resumeEnrollment(enrollmentId: string): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/enrollments/${enrollmentId}/resume`);
      return response.data;
    } catch (error) {
      console.error('Error resuming enrollment:', error);
      throw error;
    }
  }

  async removeEnrollment(enrollmentId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/enrollments/${enrollmentId}`);
    } catch (error) {
      console.error('Error removing enrollment:', error);
      throw error;
    }
  }

  async sendSequenceEmails(sequenceId: string): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/sequences/${sequenceId}/send`);
      return response.data;
    } catch (error) {
      console.error('Error sending sequence emails:', error);
      throw error;
    }
  }

  async setupDefaultSequences(projectId: string): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/projects/${projectId}/sequences/setup-defaults`);
      return response.data;
    } catch (error) {
      console.error('Error setting up default sequences:', error);
      throw error;
    }
  }

  // ===============================================
  // EMAIL TEMPLATE ENDPOINTS
  // ===============================================

  async getClientEmailTemplates(params?: { 
    category?: string; 
    type?: string; 
    projectId?: string; 
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.projectId) queryParams.append('projectId', params.projectId);
      
      const response = await apiClient.get(`/email-management/templates/client-outreach?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching client email templates:', error);
      // Return empty templates structure until backend implements this
      return { templates: [] };
    }
  }

  async getClientSourcingTemplates(): Promise<any[]> {
    try {
      const response = await apiClient.get('/email-management/templates/client-outreach');
      return response.data.templates || [];
    } catch (error) {
      console.error('Error fetching client sourcing templates:', error);
      return [];
    }
  }

  // ===============================================
  // ANALYTICS ENDPOINTS (placeholder for future implementation)
  // ===============================================

  async getProjectAnalytics(projectId: string): Promise<any> {
    // This will be implemented when backend analytics endpoints are available
    console.warn('Analytics endpoints not yet implemented in backend');
    return {
      totalProspects: 0,
      totalSearches: 0,
      conversionRate: 0,
      responseRate: 0,
      meetingsScheduled: 0,
      dealsClosed: 0,
      revenue: 0
    };
  }
}

export default new ClientOutreachApiService();
