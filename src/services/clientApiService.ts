import apiClient from './api';

// Client interface matching the backend
export interface Client {
  id: string;
  name: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  employees: number;
  openJobs: number;
  totalHires: number;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  description?: string;
  logoUrl?: string;
}

export interface CreateClientDto {
  name: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  email: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
  employees?: number;
  openJobs?: number;
  totalHires?: number;
  description?: string;
  logoUrl?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {}

export interface ClientQueryParams {
  search?: string;
  status?: string;
  industry?: string;
  size?: string;
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ClientsResponse {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  totalOpenJobs: number;
  totalHires: number;
  byIndustry: { industry: string; count: number }[];
  bySize: { size: string; count: number }[];
}

export class ClientApiService {
  private basePath = '/clients';

  async getAllClients(params?: ClientQueryParams): Promise<ClientsResponse> {
    const response = await apiClient.get(this.basePath, { params });
    return response.data;
  }

  async getCurrentUserClients(params?: ClientQueryParams): Promise<ClientsResponse> {
    const response = await apiClient.get('/users/me/clients', { params });
    return response.data;
  }

  async getClientById(id: string): Promise<Client> {
    const response = await apiClient.get(`${this.basePath}/${id}`);
    return response.data;
  }

  async createClient(clientData: CreateClientDto): Promise<Client> {
    const response = await apiClient.post(this.basePath, clientData);
    return response.data;
  }

  async updateClient(id: string, clientData: UpdateClientDto): Promise<Client> {
    const response = await apiClient.patch(`${this.basePath}/${id}`, clientData);
    return response.data;
  }

  async deleteClient(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  async getClientStats(): Promise<ClientStats> {
    const response = await apiClient.get(`${this.basePath}/stats`);
    return response.data;
  }

  async getIndustries(): Promise<string[]> {
    const response = await apiClient.get(`${this.basePath}/industries`);
    return response.data;
  }

  async getLocations(): Promise<string[]> {
    const response = await apiClient.get(`${this.basePath}/locations`);
    return response.data;
  }

  async searchClients(query: string): Promise<ClientsResponse> {
    const response = await apiClient.get(`${this.basePath}/search`, {
      params: { search: query }
    });
    return response.data;
  }

  async findByName(name: string): Promise<Client | null> {
    const response = await apiClient.get(`${this.basePath}/name/${encodeURIComponent(name)}`);
    return response.data;
  }

  async findByEmail(email: string): Promise<Client | null> {
    const response = await apiClient.get(`${this.basePath}/email/${encodeURIComponent(email)}`);
    return response.data;
  }

  async updateLastActivity(id: string): Promise<Client> {
    const response = await apiClient.patch(`${this.basePath}/${id}/activity`);
    return response.data;
  }

  async updateJobMetrics(id: string, metrics: { openJobs?: number; totalHires?: number }): Promise<Client> {
    const response = await apiClient.patch(`${this.basePath}/${id}/metrics`, metrics);
    return response.data;
  }
}
