import apiClient from './api';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface CreatePermissionData {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionData {
  name?: string;
  resource?: string;
  action?: string;
  description?: string;
}

// Role API calls
export const rolePermissionApiService = {
  // Roles
  async getRoles(): Promise<{ roles: Role[] }> {
    const response = await apiClient.get('/api/v1/roles');
    return response.data;
  },

  async getRoleById(id: string): Promise<{ role: Role }> {
    const response = await apiClient.get(`/api/v1/roles/${id}`);
    return response.data;
  },

  async createRole(data: CreateRoleData): Promise<{ role: Role }> {
    const response = await apiClient.post('/api/v1/roles', data);
    return response.data;
  },

  async updateRole(id: string, data: UpdateRoleData): Promise<{ role: Role }> {
    const response = await apiClient.patch(`/api/v1/roles/${id}`, data);
    return response.data;
  },

  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/roles/${id}`);
  },

  async toggleRoleStatus(id: string): Promise<{ role: Role }> {
    const response = await apiClient.patch(`/api/v1/roles/${id}/toggle-status`);
    return response.data;
  },

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<{ role: Role }> {
    const response = await apiClient.post(`/api/v1/roles/${roleId}/permissions/${permissionId}`);
    return response.data;
  },

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<{ role: Role }> {
    const response = await apiClient.delete(`/api/v1/roles/${roleId}/permissions/${permissionId}`);
    return response.data;
  },

  // Permissions
  async getPermissions(): Promise<{ permissions: Permission[] }> {
    const response = await apiClient.get('/api/v1/permissions');
    return response.data;
  },

  async getPermissionById(id: string): Promise<{ permission: Permission }> {
    const response = await apiClient.get(`/api/v1/permissions/${id}`);
    return response.data;
  },

  async createPermission(data: CreatePermissionData): Promise<{ permission: Permission }> {
    const response = await apiClient.post('/api/v1/permissions', data);
    return response.data;
  },

  async updatePermission(id: string, data: UpdatePermissionData): Promise<{ permission: Permission }> {
    const response = await apiClient.patch(`/api/v1/permissions/${id}`, data);
    return response.data;
  },

  async deletePermission(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/permissions/${id}`);
  },

  async getPermissionsByResource(resource: string): Promise<{ permissions: Permission[] }> {
    const response = await apiClient.get(`/api/v1/permissions/by-resource?resource=${resource}`);
    return response.data;
  }
};
