import api from '../../../services/api';

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  manager?: string;
  managerEmail?: string;
  totalEmployees?: number;
  color?: string;
  icon?: string;
  clientId: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  manager?: string;
  managerEmail?: string;
  totalEmployees?: number;
  color?: string;
  icon?: string;
}

export interface DepartmentQueryParams {
  search?: string;
  clientId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface Department {
  id: string;
  name: string;
  description: string;
  manager: string;
  managerEmail: string;
  totalEmployees: number;
  color: string;
  icon: string;
  isActive: boolean;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  // Computed fields from relations
  activeJobs?: number;
}

export interface DepartmentsResponse {
  departments: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
  totalEmployees: number;
  byClient: Array<{
    clientId: string;
    clientName: string;
    count: number;
  }>;
}

export class DepartmentApiService {
  private readonly baseUrl = '/departments';

  /**
   * Create a new department
   */
  async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    const response = await api.post<Department>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Get all departments with optional filtering
   */
  async getAllDepartments(params?: DepartmentQueryParams): Promise<DepartmentsResponse> {
    const response = await api.get<DepartmentsResponse>(this.baseUrl, { params });
    return response.data;
  }

  /**
   * Get department by ID
   */
  async getDepartmentById(id: string): Promise<Department> {
    const response = await api.get<Department>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Get departments by client ID
   */
  async getDepartmentsByClient(clientId: string): Promise<Department[]> {
    const response = await api.get<Department[]>(`${this.baseUrl}/by-client/${clientId}`);
    return response.data;
  }

  /**
   * Update department
   */
  async updateDepartment(id: string, data: UpdateDepartmentRequest): Promise<Department> {
    const response = await api.patch<Department>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Delete department
   */
  async deleteDepartment(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Get department statistics
   */
  async getDepartmentStats(clientId?: string): Promise<DepartmentStats> {
    const params = clientId ? { clientId } : undefined;
    const response = await api.get<DepartmentStats>(`${this.baseUrl}/stats`, { params });
    return response.data;
  }
}
