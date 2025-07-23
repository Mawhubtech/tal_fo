import apiClient from '../lib/api';
import {
  mockProjects,
  mockSearches,
  mockProspects,
  mockAnalytics,
  getProjectById,
  getSearchesByProjectId,
  getProspectsByProjectId,
  getSearchById,
  getProspectById,
  getAnalyticsByProjectId,
  mockDelay
} from './mockData/clientOutreachMockData';

// Client Outreach Project Types
export interface ClientOutreachProject {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  visibility: 'private' | 'team' | 'public';
  objectives?: {
    targetClients?: number;
    targetMeetings?: number;
    deadline?: string;
    revenue?: {
      target?: number;
      currency?: string;
    };
    industries?: string[];
    companySize?: string[];
    location?: string[];
    serviceOfferings?: string[];
  };
  targets?: {
    totalProspects?: number;
    totalSearches?: number;
    avgProspectsPerSearch?: number;
    expectedResponseRate?: number;
    expectedConversionRate?: number;
    expectedRevenue?: number;
  };
  progress?: {
    totalProspects?: number;
    totalSearches?: number;
    totalSequences?: number;
    activeSequences?: number;
    completedSequences?: number;
    responseRate?: number;
    conversionRate?: number;
    meetingsScheduled?: number;
    dealsClosed?: number;
    actualRevenue?: number;
  };
  startDate?: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  createdById: string;
  assignedToTeamId?: string;
  clientType?: 'enterprise' | 'mid-market' | 'smb' | 'startup';
  metadata?: Record<string, any>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: any;
  assignedToTeam?: any;
}

export interface CreateClientOutreachProjectData {
  name: string;
  description?: string;
  status?: 'active' | 'paused' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  visibility?: 'private' | 'team' | 'public';
  objectives?: ClientOutreachProject['objectives'];
  targets?: ClientOutreachProject['targets'];
  startDate?: string;
  targetCompletionDate?: string;
  assignedToTeamId?: string;
  clientType?: 'enterprise' | 'mid-market' | 'smb' | 'startup';
  tags?: string[];
}

export interface UpdateClientOutreachProjectData extends Partial<CreateClientOutreachProjectData> {
  id: string;
}

export interface ProjectListResponse {
  projects: ClientOutreachProject[];
  total: number;
  page: number;
  limit: number;
}

export interface ProjectFilters {
  status?: string[];
  priority?: string[];
  visibility?: string[];
  clientType?: string[];
  assignedToTeamId?: string;
  search?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
}

export interface ProjectSortOptions {
  field: 'name' | 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'targetCompletionDate';
  direction: 'asc' | 'desc';
}

// Client Outreach Search Types
export interface ClientOutreachSearch {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  searchCriteria: {
    industries?: string[];
    companySize?: string[];
    location?: string[];
    revenue?: {
      min?: number;
      max?: number;
      currency?: string;
    };
    employees?: {
      min?: number;
      max?: number;
    };
    keywords?: string[];
    technologies?: string[];
    fundingStage?: string[];
    excludeCompanies?: string[];
  };
  results?: {
    totalFound?: number;
    totalAdded?: number;
    lastRunAt?: string;
    avgCompanyScore?: number;
    topIndustries?: Array<{ industry: string; count: number }>;
    topLocations?: Array<{ location: string; count: number }>;
  };
  automationSettings?: {
    autoRun?: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
    maxResults?: number;
    qualityThreshold?: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: any;
}

export interface CreateClientOutreachSearchData {
  projectId: string;
  name: string;
  description?: string;
  searchCriteria: ClientOutreachSearch['searchCriteria'];
  automationSettings?: ClientOutreachSearch['automationSettings'];
}

export interface UpdateClientOutreachSearchData extends Partial<CreateClientOutreachSearchData> {
  id: string;
}

// Client Prospect Types
export interface ClientProspect {
  id: string;
  projectId: string;
  searchId?: string;
  companyName: string;
  companyDomain?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  revenue?: {
    amount?: number;
    currency?: string;
  };
  employees?: number;
  description?: string;
  contactPerson?: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
  };
  status: 'new' | 'contacted' | 'responded' | 'meeting-scheduled' | 'proposal-sent' | 'negotiating' | 'closed-won' | 'closed-lost' | 'not-interested';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  score?: number;
  tags?: string[];
  notes?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  dealValue?: {
    amount?: number;
    currency?: string;
  };
  source?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// API Service Class
class ClientOutreachProjectApiService {
  private baseUrl = '/client-outreach/projects';
  private searchUrl = '/client-outreach/searches';
  private prospectUrl = '/client-outreach/prospects';
  private useMockData = true; // Toggle for using mock data vs real API

  // Method to toggle between mock data and real API
  setUseMockData(useMock: boolean): void {
    this.useMockData = useMock;
  }

  getUseMockData(): boolean {
    return this.useMockData;
  }

  // Project Methods
  async getProjects(
    page: number = 1,
    limit: number = 10,
    filters?: ProjectFilters,
    sort?: ProjectSortOptions
  ): Promise<ProjectListResponse> {
    if (this.useMockData) {
      await mockDelay();
      
      let filteredProjects = [...mockProjects];
      
      // Apply filters
      if (filters) {
        if (filters.status?.length) {
          filteredProjects = filteredProjects.filter(p => filters.status!.includes(p.status));
        }
        if (filters.priority?.length) {
          filteredProjects = filteredProjects.filter(p => filters.priority!.includes(p.priority));
        }
        if (filters.visibility?.length) {
          filteredProjects = filteredProjects.filter(p => filters.visibility!.includes(p.visibility));
        }
        if (filters.clientType?.length) {
          filteredProjects = filteredProjects.filter(p => p.clientType && filters.clientType!.includes(p.clientType));
        }
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredProjects = filteredProjects.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description?.toLowerCase().includes(searchTerm)
          );
        }
        if (filters.tags?.length) {
          filteredProjects = filteredProjects.filter(p => 
            p.tags?.some(tag => filters.tags!.includes(tag))
          );
        }
      }
      
      // Apply sorting
      if (sort) {
        filteredProjects.sort((a, b) => {
          const aValue = a[sort.field];
          const bValue = b[sort.field];
          
          if (sort.direction === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        });
      }
      
      // Apply pagination
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedProjects = filteredProjects.slice(start, end);
      
      return {
        projects: paginatedProjects,
        total: filteredProjects.length,
        page,
        limit
      };
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.set(key, value.toString());
          }
        }
      });
    }

    if (sort) {
      params.set('sortField', sort.field);
      params.set('sortDirection', sort.direction);
    }

    const response = await apiClient.get(`${this.baseUrl}?${params}`);
    return response.data;
  }

  async getProject(id: string): Promise<ClientOutreachProject> {
    if (this.useMockData) {
      await mockDelay();
      const project = getProjectById(id);
      if (!project) {
        throw new Error(`Project with id ${id} not found`);
      }
      return project;
    }

    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createProject(data: CreateClientOutreachProjectData): Promise<ClientOutreachProject> {
    console.log('API createProject called with data:', data);
    
    if (this.useMockData) {
      console.log('Using mock data for createProject');
      await mockDelay();
      
      const newProject: ClientOutreachProject = {
        id: `proj-${Date.now()}`,
        name: data.name,
        description: data.description,
        status: data.status || 'active',
        priority: data.priority || 'medium',
        visibility: data.visibility || 'private',
        objectives: data.objectives,
        targets: data.targets,
        progress: {
          totalProspects: 0,
          totalSearches: 0,
          totalSequences: 0,
          activeSequences: 0,
          completedSequences: 0,
          responseRate: 0,
          conversionRate: 0,
          meetingsScheduled: 0,
          dealsClosed: 0,
          actualRevenue: 0
        },
        startDate: data.startDate,
        targetCompletionDate: data.targetCompletionDate,
        createdById: 'current-user',
        assignedToTeamId: data.assignedToTeamId,
        clientType: data.clientType,
        tags: data.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {}
      };
      
      console.log('New project created:', newProject);
      mockProjects.push(newProject);
      return newProject;
    }

    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async updateProject(data: UpdateClientOutreachProjectData): Promise<ClientOutreachProject> {
    if (this.useMockData) {
      await mockDelay();
      
      const projectIndex = mockProjects.findIndex(p => p.id === data.id);
      if (projectIndex === -1) {
        throw new Error(`Project with id ${data.id} not found`);
      }
      
      const { id, ...updateData } = data;
      const updatedProject = {
        ...mockProjects[projectIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      mockProjects[projectIndex] = updatedProject;
      return updatedProject;
    }

    const { id, ...updateData } = data;
    const response = await apiClient.put(`${this.baseUrl}/${id}`, updateData);
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    if (this.useMockData) {
      await mockDelay();
      
      const projectIndex = mockProjects.findIndex(p => p.id === id);
      if (projectIndex === -1) {
        throw new Error(`Project with id ${id} not found`);
      }
      
      mockProjects.splice(projectIndex, 1);
      return;
    }

    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async duplicateProject(id: string, newName?: string): Promise<ClientOutreachProject> {
    if (this.useMockData) {
      await mockDelay();
      
      const originalProject = getProjectById(id);
      if (!originalProject) {
        throw new Error(`Project with id ${id} not found`);
      }
      
      const duplicatedProject: ClientOutreachProject = {
        ...originalProject,
        id: `proj-${Date.now()}`,
        name: newName || `${originalProject.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: {
          totalProspects: 0,
          totalSearches: 0,
          totalSequences: 0,
          activeSequences: 0,
          completedSequences: 0,
          responseRate: 0,
          conversionRate: 0,
          meetingsScheduled: 0,
          dealsClosed: 0,
          actualRevenue: 0
        }
      };
      
      mockProjects.push(duplicatedProject);
      return duplicatedProject;
    }

    const response = await apiClient.post(`${this.baseUrl}/${id}/duplicate`, {
      name: newName
    });
    return response.data;
  }

  async archiveProject(id: string): Promise<ClientOutreachProject> {
    if (this.useMockData) {
      return this.updateProject({ id, status: 'archived' });
    }

    const response = await apiClient.put(`${this.baseUrl}/${id}/archive`);
    return response.data;
  }

  async unarchiveProject(id: string): Promise<ClientOutreachProject> {
    if (this.useMockData) {
      return this.updateProject({ id, status: 'active' });
    }

    const response = await apiClient.put(`${this.baseUrl}/${id}/unarchive`);
    return response.data;
  }

  // Search Methods
  async getProjectSearches(projectId: string): Promise<ClientOutreachSearch[]> {
    if (this.useMockData) {
      await mockDelay();
      return getSearchesByProjectId(projectId);
    }

    const response = await apiClient.get(`${this.searchUrl}?projectId=${projectId}`);
    return response.data;
  }

  async getSearch(id: string): Promise<ClientOutreachSearch> {
    if (this.useMockData) {
      await mockDelay();
      const search = getSearchById(id);
      if (!search) {
        throw new Error(`Search with id ${id} not found`);
      }
      return search;
    }

    const response = await apiClient.get(`${this.searchUrl}/${id}`);
    return response.data;
  }

  async createSearch(data: CreateClientOutreachSearchData): Promise<ClientOutreachSearch> {
    if (this.useMockData) {
      await mockDelay();
      
      const newSearch: ClientOutreachSearch = {
        id: `search-${Date.now()}`,
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        status: 'draft',
        searchCriteria: data.searchCriteria,
        automationSettings: data.automationSettings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockSearches.push(newSearch);
      return newSearch;
    }

    const response = await apiClient.post(this.searchUrl, data);
    return response.data;
  }

  async updateSearch(data: UpdateClientOutreachSearchData): Promise<ClientOutreachSearch> {
    if (this.useMockData) {
      await mockDelay();
      
      const searchIndex = mockSearches.findIndex(s => s.id === data.id);
      if (searchIndex === -1) {
        throw new Error(`Search with id ${data.id} not found`);
      }
      
      const { id, ...updateData } = data;
      const updatedSearch = {
        ...mockSearches[searchIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      mockSearches[searchIndex] = updatedSearch;
      return updatedSearch;
    }

    const { id, ...updateData } = data;
    const response = await apiClient.put(`${this.searchUrl}/${id}`, updateData);
    return response.data;
  }

  async deleteSearch(id: string): Promise<void> {
    if (this.useMockData) {
      await mockDelay();
      
      const searchIndex = mockSearches.findIndex(s => s.id === id);
      if (searchIndex === -1) {
        throw new Error(`Search with id ${id} not found`);
      }
      
      mockSearches.splice(searchIndex, 1);
      return;
    }

    await apiClient.delete(`${this.searchUrl}/${id}`);
  }

  async runSearch(id: string): Promise<{ message: string; resultsCount: number }> {
    if (this.useMockData) {
      await mockDelay(1500); // Simulate longer processing time
      
      const search = getSearchById(id);
      if (!search) {
        throw new Error(`Search with id ${id} not found`);
      }
      
      // Simulate search results
      const resultsCount = Math.floor(Math.random() * 50) + 10;
      
      // Update search with results
      const searchIndex = mockSearches.findIndex(s => s.id === id);
      if (searchIndex !== -1) {
        mockSearches[searchIndex] = {
          ...mockSearches[searchIndex],
          status: 'completed',
          results: {
            totalFound: resultsCount,
            totalAdded: Math.floor(resultsCount * 0.8),
            lastRunAt: new Date().toISOString(),
            avgCompanyScore: Math.round((Math.random() * 3 + 7) * 10) / 10,
            topIndustries: [
              { industry: 'Technology', count: Math.floor(resultsCount * 0.4) },
              { industry: 'SaaS', count: Math.floor(resultsCount * 0.3) }
            ],
            topLocations: [
              { location: 'California', count: Math.floor(resultsCount * 0.3) },
              { location: 'New York', count: Math.floor(resultsCount * 0.2) }
            ]
          },
          updatedAt: new Date().toISOString()
        };
      }
      
      return {
        message: `Search completed successfully. Found ${resultsCount} prospects.`,
        resultsCount
      };
    }

    const response = await apiClient.post(`${this.searchUrl}/${id}/run`);
    return response.data;
  }

  // Prospect Methods
  async getProjectProspects(
    projectId: string,
    page: number = 1,
    limit: number = 10,
    filters?: Record<string, any>
  ): Promise<{ prospects: ClientProspect[]; total: number; page: number; limit: number }> {
    if (this.useMockData) {
      await mockDelay();
      
      let filteredProspects = getProspectsByProjectId(projectId);
      
      // Apply filters
      if (filters) {
        if (filters.status) {
          if (Array.isArray(filters.status)) {
            filteredProspects = filteredProspects.filter(p => filters.status.includes(p.status));
          } else {
            filteredProspects = filteredProspects.filter(p => p.status === filters.status);
          }
        }
        if (filters.priority) {
          if (Array.isArray(filters.priority)) {
            filteredProspects = filteredProspects.filter(p => filters.priority.includes(p.priority));
          } else {
            filteredProspects = filteredProspects.filter(p => p.priority === filters.priority);
          }
        }
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredProspects = filteredProspects.filter(p => 
            p.companyName.toLowerCase().includes(searchTerm) ||
            p.contactPerson?.name?.toLowerCase().includes(searchTerm) ||
            p.industry?.toLowerCase().includes(searchTerm)
          );
        }
        if (filters.tags?.length) {
          filteredProspects = filteredProspects.filter(p => 
            p.tags?.some(tag => filters.tags.includes(tag))
          );
        }
      }
      
      // Apply pagination
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedProspects = filteredProspects.slice(start, end);
      
      return {
        prospects: paginatedProspects,
        total: filteredProspects.length,
        page,
        limit
      };
    }

    const params = new URLSearchParams({
      projectId,
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.set(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get(`${this.prospectUrl}?${params}`);
    return response.data;
  }

  async getProspect(id: string): Promise<ClientProspect> {
    if (this.useMockData) {
      await mockDelay();
      const prospect = getProspectById(id);
      if (!prospect) {
        throw new Error(`Prospect with id ${id} not found`);
      }
      return prospect;
    }

    const response = await apiClient.get(`${this.prospectUrl}/${id}`);
    return response.data;
  }

  async updateProspect(id: string, data: Partial<ClientProspect>): Promise<ClientProspect> {
    if (this.useMockData) {
      await mockDelay();
      
      const prospectIndex = mockProspects.findIndex(p => p.id === id);
      if (prospectIndex === -1) {
        throw new Error(`Prospect with id ${id} not found`);
      }
      
      const updatedProspect = {
        ...mockProspects[prospectIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      mockProspects[prospectIndex] = updatedProspect;
      return updatedProspect;
    }

    const response = await apiClient.put(`${this.prospectUrl}/${id}`, data);
    return response.data;
  }

  async deleteProspect(id: string): Promise<void> {
    if (this.useMockData) {
      await mockDelay();
      
      const prospectIndex = mockProspects.findIndex(p => p.id === id);
      if (prospectIndex === -1) {
        throw new Error(`Prospect with id ${id} not found`);
      }
      
      mockProspects.splice(prospectIndex, 1);
      return;
    }

    await apiClient.delete(`${this.prospectUrl}/${id}`);
  }

  async bulkUpdateProspects(
    prospectIds: string[],
    updates: Partial<ClientProspect>
  ): Promise<ClientProspect[]> {
    if (this.useMockData) {
      await mockDelay();
      
      const updatedProspects: ClientProspect[] = [];
      
      prospectIds.forEach(id => {
        const prospectIndex = mockProspects.findIndex(p => p.id === id);
        if (prospectIndex !== -1) {
          const updatedProspect = {
            ...mockProspects[prospectIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          mockProspects[prospectIndex] = updatedProspect;
          updatedProspects.push(updatedProspect);
        }
      });
      
      return updatedProspects;
    }

    const response = await apiClient.put(`${this.prospectUrl}/bulk`, {
      prospectIds,
      updates
    });
    return response.data;
  }

  async exportProspects(
    projectId: string,
    format: 'csv' | 'xlsx' = 'csv',
    filters?: Record<string, any>
  ): Promise<Blob> {
    if (this.useMockData) {
      await mockDelay(1000);
      
      // Get prospects for the project
      const prospects = getProspectsByProjectId(projectId);
      
      // Create a simple CSV content for demo
      const csvContent = [
        'Company Name,Contact Person,Email,Status,Priority,Industry,Location',
        ...prospects.map(p => [
          p.companyName,
          p.contactPerson?.name || '',
          p.contactPerson?.email || '',
          p.status,
          p.priority,
          p.industry || '',
          p.location || ''
        ].join(','))
      ].join('\n');
      
      return new Blob([csvContent], { type: 'text/csv' });
    }

    const params = new URLSearchParams({
      projectId,
      format,
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.set(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get(`${this.prospectUrl}/export?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Analytics Methods
  async getProjectAnalytics(projectId: string): Promise<{
    overview: {
      totalProspects: number;
      totalSearches: number;
      totalSequences: number;
      responseRate: number;
      conversionRate: number;
      meetingsScheduled: number;
      dealsClosed: number;
      actualRevenue: number;
    };
    trends: {
      prospectsOverTime: Array<{ date: string; count: number }>;
      responseRateOverTime: Array<{ date: string; rate: number }>;
      conversionRateOverTime: Array<{ date: string; rate: number }>;
      revenueOverTime: Array<{ date: string; amount: number }>;
    };
    demographics: {
      byIndustry: Array<{ industry: string; count: number; responseRate: number }>;
      byCompanySize: Array<{ size: string; count: number; responseRate: number }>;
      byLocation: Array<{ location: string; count: number; responseRate: number }>;
      byStatus: Array<{ status: string; count: number }>;
    };
    performance: {
      topPerformingSearches: Array<{ searchId: string; name: string; responseRate: number; conversions: number }>;
      topPerformingSequences: Array<{ sequenceId: string; name: string; responseRate: number; conversions: number }>;
      bestDays: Array<{ day: string; responseRate: number }>;
      bestTimes: Array<{ hour: number; responseRate: number }>;
    };
  }> {
    if (this.useMockData) {
      await mockDelay();
      
      const analytics = getAnalyticsByProjectId(projectId);
      if (!analytics) {
        // Return default analytics for projects without data
        return {
          overview: {
            totalProspects: 0,
            totalSearches: 0,
            totalSequences: 0,
            responseRate: 0,
            conversionRate: 0,
            meetingsScheduled: 0,
            dealsClosed: 0,
            actualRevenue: 0
          },
          trends: {
            prospectsOverTime: [],
            responseRateOverTime: [],
            conversionRateOverTime: [],
            revenueOverTime: []
          },
          demographics: {
            byIndustry: [],
            byCompanySize: [],
            byLocation: [],
            byStatus: []
          },
          performance: {
            topPerformingSearches: [],
            topPerformingSequences: [],
            bestDays: [],
            bestTimes: []
          }
        };
      }
      
      return analytics;
    }

    const response = await apiClient.get(`${this.baseUrl}/${projectId}/analytics`);
    return response.data;
  }
}

const clientOutreachProjectApiService = new ClientOutreachProjectApiService();
export default clientOutreachProjectApiService;
