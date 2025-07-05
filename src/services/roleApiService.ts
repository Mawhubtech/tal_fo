import apiClient from './api';

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
  };
}

export interface CreateRoleData {
  name: string;
  description: string;
  permissionIds?: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
}

export interface CreatePermissionData {
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionData {
  resource?: string;
  action?: string;
  description?: string;
}

export interface RoleQueryParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PermissionQueryParams {
  search?: string;
  resource?: string;
  page?: number;
  limit?: number;
}

// Role API functions
export const getRoles = async (params: RoleQueryParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search);
  if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get(`/roles?${queryParams.toString()}`);
  return response.data;
};

export const getRoleById = async (id: string): Promise<{ role: Role }> => {
  const response = await apiClient.get(`/roles/${id}`);
  return response.data;
};

export const createRole = async (roleData: CreateRoleData): Promise<{ role: Role }> => {
  const response = await apiClient.post('/roles', roleData);
  return response.data;
};

export const updateRole = async (id: string, roleData: UpdateRoleData): Promise<{ role: Role }> => {
  const response = await apiClient.patch(`/roles/${id}`, roleData);
  return response.data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await apiClient.delete(`/roles/${id}`);
};

export const assignPermissionsToRole = async (roleId: string, permissionIds: string[]): Promise<{ role: Role }> => {
  const response = await apiClient.post(`/roles/${roleId}/permissions`, { permissionIds });
  return response.data;
};

export const removePermissionsFromRole = async (roleId: string, permissionIds: string[]): Promise<{ role: Role }> => {
  const response = await apiClient.delete(`/roles/${roleId}/permissions`, { data: { permissionIds } });
  return response.data;
};

// Permission API functions
export const getPermissions = async (params: PermissionQueryParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search);
  if (params.resource) queryParams.append('resource', params.resource);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get(`/permissions?${queryParams.toString()}`);
  return response.data;
};

export const getPermissionById = async (id: string): Promise<{ permission: Permission }> => {
  const response = await apiClient.get(`/permissions/${id}`);
  return response.data;
};

export const createPermission = async (permissionData: CreatePermissionData): Promise<{ permission: Permission }> => {
  const response = await apiClient.post('/permissions', permissionData);
  return response.data;
};

export const updatePermission = async (id: string, permissionData: UpdatePermissionData): Promise<{ permission: Permission }> => {
  const response = await apiClient.patch(`/permissions/${id}`, permissionData);
  return response.data;
};

export const deletePermission = async (id: string): Promise<void> => {
  await apiClient.delete(`/permissions/${id}`);
};
