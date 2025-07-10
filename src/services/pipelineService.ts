import { config } from '../lib/config';

export interface PipelineStage {
  id: string;
  name: string;
  description?: string;
  type: string;
  order: number;
  color?: string;
  icon?: string;
  isActive: boolean;
  isTerminal: boolean;
  metadata?: Record<string, any>;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private' | 'organization';
  status: 'active' | 'inactive' | 'archived';
  type: 'recruitment' | 'sourcing' | 'client' | 'custom';
  isDefault: boolean;
  color?: string;
  icon?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  client?: {
    id: string;
    name: string;
  };
  stages: PipelineStage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePipelineDto {
  name: string;
  description?: string;
  visibility?: 'public' | 'private' | 'organization';
  status?: 'active' | 'inactive' | 'archived';
  type?: 'recruitment' | 'sourcing' | 'client' | 'custom';
  isDefault?: boolean;
  color?: string;
  icon?: string;
  clientId?: string;
  stages: {
    name: string;
    description?: string;
    type?: string;
    order: number;
    color?: string;
    icon?: string;
    isActive?: boolean;
    isTerminal?: boolean;
    metadata?: Record<string, any>;
  }[];
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken'); // Changed from 'token' to 'accessToken'
//   console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', response.status, errorText);
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const pipelineService = {
  async getAllPipelines(): Promise<Pipeline[]> {
    const response = await fetch(`${config.apiBaseUrl}/pipelines`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.pipelines || data; // Handle both response formats
  },

  async getUserDefaultPipeline(): Promise<Pipeline | null> {
    const response = await fetch(`${config.apiBaseUrl}/pipelines?isDefault=true&status=active&createdByMe=true`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    const pipelines = data.pipelines || data;
    
    if (!Array.isArray(pipelines)) {
      return null;
    }

    // Backend handles user filtering via createdByMe=true parameter
    // Find the default recruitment pipeline first, or any default pipeline
    const userDefault = pipelines.find((p: Pipeline) => p.isDefault && p.status === 'active' && p.type === 'recruitment') ||
                       pipelines.find((p: Pipeline) => p.isDefault && p.status === 'active');
    return userDefault || null;
  },

  async getUserDefaultPipelineByType(type: 'recruitment' | 'sourcing' | 'client' | 'custom'): Promise<Pipeline | null> {
    const response = await fetch(`${config.apiBaseUrl}/pipelines?isDefault=true&status=active&createdByMe=true&type=${type}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    const pipelines = data.pipelines || data;
    
    if (!Array.isArray(pipelines)) {
      return null;
    }

    // Find the default pipeline for the specific type
    const userDefault = pipelines.find((p: Pipeline) => p.isDefault && p.status === 'active' && p.type === type);
    return userDefault || null;
  },

  async getPipelinesByUser(userId: string): Promise<Pipeline[]> {
    const response = await fetch(`${config.apiBaseUrl}/pipelines?createdById=${userId}&status=active`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.pipelines || data || [];
  },

  async createPipeline(pipelineData: CreatePipelineDto): Promise<Pipeline> {
    const response = await fetch(`${config.apiBaseUrl}/pipelines`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(pipelineData),
    });
    
    const data = await handleResponse(response);
    return data.pipeline || data; // Handle both response formats
  },

  async updatePipeline(id: string, pipelineData: Partial<CreatePipelineDto>): Promise<Pipeline> {
    const response = await fetch(`${config.apiBaseUrl}/pipelines/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(pipelineData),
    });
    
    const data = await handleResponse(response);
    return data.pipeline || data; // Handle both response formats
  },

  async deletePipeline(id: string): Promise<void> {
    const response = await fetch(`${config.apiBaseUrl}/pipelines/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }
  },

  async duplicatePipeline(id: string): Promise<Pipeline> {
    const response = await fetch(`${config.apiBaseUrl}/pipelines/${id}/duplicate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.pipeline || data; // Handle both response formats
  },

  async createDefaultPipeline(type?: 'recruitment' | 'sourcing' | 'client' | 'custom'): Promise<Pipeline> {
    const url = type ? `${config.apiBaseUrl}/pipelines/default?type=${type}` : `${config.apiBaseUrl}/pipelines/default`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.pipeline || data; // Handle both response formats
  },
};
