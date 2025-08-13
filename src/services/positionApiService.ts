import apiClient from './api';

// Position interface matching the organization chart component
export interface Position {
  id: string;
  title: string;
  employeeName?: string;
  email?: string;
  phone?: string;
  department: string;
  departmentId?: string;
  parentId?: string;
  level: number;
  clientId: string;
  children?: Position[];
  isExpanded?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionDto {
  title: string;
  employeeName?: string;
  email?: string;
  phone?: string;
  department: string;
  departmentId?: string;
  parentId?: string;
  level: number;
  clientId: string;
}

export interface UpdatePositionDto extends Partial<Omit<CreatePositionDto, 'clientId'>> {}

export interface PositionQueryParams {
  clientId?: string;
  departmentId?: string;
  parentId?: string;
  level?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PositionResponse {
  data: Position[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Position API Service
export class PositionApiService {
  private readonly baseUrl = '/positions';

  // Get all positions with optional filtering
  async getPositions(params?: PositionQueryParams): Promise<PositionResponse> {
    const response = await apiClient.get(this.baseUrl, { params });
    return response.data;
  }

  // Get positions by client ID
  async getPositionsByClient(clientId: string, params?: Omit<PositionQueryParams, 'clientId'>): Promise<Position[]> {
    const response = await apiClient.get(`/clients/${clientId}/positions`, { params });
    return response.data;
  }

  // Get positions by department ID
  async getPositionsByDepartment(departmentId: string, params?: Omit<PositionQueryParams, 'departmentId'>): Promise<Position[]> {
    const response = await apiClient.get(`/departments/${departmentId}/positions`, { params });
    return response.data;
  }

  // Get a single position by ID
  async getPosition(id: string): Promise<Position> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Create a new position
  async createPosition(data: CreatePositionDto): Promise<Position> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  // Update an existing position
  async updatePosition(id: string, data: UpdatePositionDto): Promise<Position> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Delete a position
  async deletePosition(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Get position hierarchy (with parent and children)
  async getPositionHierarchy(clientId: string): Promise<Position[]> {
    const response = await apiClient.get(`/clients/${clientId}/positions/hierarchy`);
    return response.data;
  }

  // Get subordinates of a position
  async getSubordinates(positionId: string): Promise<Position[]> {
    const response = await apiClient.get(`${this.baseUrl}/${positionId}/subordinates`);
    return response.data;
  }

  // Move position to new parent
  async movePosition(id: string, newParentId?: string): Promise<Position> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/move`, { parentId: newParentId });
    return response.data;
  }

  // Get organization chart data for a client
  async getOrganizationChart(clientId: string, departmentId?: string): Promise<Position[]> {
    const params = departmentId ? { departmentId } : {};
    const response = await apiClient.get(`/clients/${clientId}/positions/organization-chart`, { params });
    return response.data;
  }

  // Bulk create positions (useful for importing org charts)
  async bulkCreatePositions(clientId: string, positions: CreatePositionDto[]): Promise<Position[]> {
    const response = await apiClient.post(`/clients/${clientId}/positions/bulk`, { positions });
    return response.data;
  }

  // Validate position hierarchy (check for circular references)
  async validateHierarchy(clientId: string, positionId?: string, newParentId?: string): Promise<{ valid: boolean; error?: string }> {
    const params = { positionId, newParentId };
    const response = await apiClient.get(`/clients/${clientId}/positions/validate-hierarchy`, { params });
    return response.data;
  }

  // Get positions that can be parents for a given position (excludes circular references)
  async getAvailableParents(clientId: string, positionId?: string): Promise<Position[]> {
    const params = positionId ? { excludeId: positionId } : {};
    const response = await apiClient.get(`/clients/${clientId}/positions/available-parents`, { params });
    return response.data;
  }

  // Get organization statistics
  async getOrganizationStats(clientId: string): Promise<{
    totalPositions: number;
    filledPositions: number;
    vacantPositions: number;
    departmentBreakdown: Array<{
      departmentId: string;
      departmentName: string;
      positionCount: number;
      filledCount: number;
    }>;
    levelBreakdown: Array<{
      level: number;
      positionCount: number;
    }>;
  }> {
    const response = await apiClient.get(`/clients/${clientId}/positions/stats`);
    return response.data;
  }
}

// Default export for convenience
const positionApiService = new PositionApiService();
export default positionApiService;
