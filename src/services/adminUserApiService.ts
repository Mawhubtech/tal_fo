import apiClient from './api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'banned';
  provider: 'local' | 'google' | 'linkedin';
  providerId?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
  clients?: Client[];
  lastLoginAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  roleIds?: string[];
  status?: 'active' | 'inactive' | 'banned';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'banned';
  roleIds?: string[];
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  banned: number;
  admins: number;
  recentSignups: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  pages: number;
  message: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  client?: string;
  provider?: string;
}

export class AdminUserApiService {
  // Get all users with pagination and filters
  static async getUsers(params: UserQueryParams = {}): Promise<UsersResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.role) searchParams.append('role', params.role);
    if (params.client) searchParams.append('client', params.client);
    if (params.provider) searchParams.append('provider', params.provider);

    const response = await apiClient.get(`/users?${searchParams.toString()}`);
    return response.data;
  }

  // Get user by ID
  static async getUserById(id: string): Promise<{ user: User; message: string }> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  }

  // Create new user
  static async createUser(userData: CreateUserData): Promise<{ user: User; message: string }> {
    const response = await apiClient.post('/users', userData);
    return response.data;
  }

  // Update user
  static async updateUser(id: string, userData: UpdateUserData): Promise<{ user: User; message: string }> {
    const response = await apiClient.patch(`/users/${id}`, userData);
    return response.data;
  }

  // Delete user
  static async deleteUser(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }

  // Archive user (soft delete)
  static async archiveUser(id: string): Promise<{ user: User; message: string }> {
    const response = await apiClient.patch(`/users/${id}/archive`);
    return response.data;
  }

  // Restore archived user
  static async restoreUser(id: string): Promise<{ user: User; message: string }> {
    const response = await apiClient.patch(`/users/${id}/restore`);
    return response.data;
  }

  // Update user status
  static async updateUserStatus(id: string, status: 'active' | 'inactive' | 'banned'): Promise<{ user: User; message: string }> {
    const response = await apiClient.patch(`/users/${id}/status`, { status });
    return response.data;
  }

  // Assign role to user
  static async assignRole(userId: string, roleId: string): Promise<{ user: User; message: string }> {
    const response = await apiClient.post(`/users/${userId}/roles/${roleId}`);
    return response.data;
  }

  // Remove role from user
  static async removeRole(userId: string, roleId: string): Promise<{ user: User; message: string }> {
    const response = await apiClient.delete(`/users/${userId}/roles/${roleId}`);
    return response.data;
  }

  // Assign client to user
  static async assignClient(userId: string, clientId: string): Promise<{ user: User; message: string }> {
    const response = await apiClient.post(`/users/${userId}/clients/${clientId}`);
    return response.data;
  }

  // Remove client from user
  static async removeClient(userId: string, clientId: string): Promise<{ user: User; message: string }> {
    const response = await apiClient.delete(`/users/${userId}/clients/${clientId}`);
    return response.data;
  }

  // Assign multiple clients to user (bulk operation)
  static async assignClients(userId: string, clientIds: string[]): Promise<{ user: User; message: string }> {
    const response = await apiClient.post(`/users/${userId}/clients`, { clientIds });
    return response.data;
  }

  // Update user's complete client access (replace all)
  static async updateUserClients(userId: string, clientIds: string[]): Promise<{ user: User; message: string }> {
    const response = await apiClient.put(`/users/${userId}/clients`, { clientIds });
    return response.data;
  }

  // Bulk assign multiple users to multiple clients
  static async bulkAssignUsersToClients(userIds: string[], clientIds: string[]): Promise<{ 
    message: string; 
    result: { success: number; failed: any[] } 
  }> {
    const response = await apiClient.post('/users/bulk/assign-clients', { userIds, clientIds });
    return response.data;
  }

  // Get user statistics
  static async getUserStats(): Promise<{ stats: UserStats; message: string }> {
    const response = await apiClient.get('/users/stats');
    return response.data;
  }

  // Get all roles
  static async getRoles(): Promise<{ roles: Role[]; message: string }> {
    const response = await apiClient.get('/roles?limit=100'); // Get all roles without pagination limit
    return response.data;
  }

  // Get all clients
  static async getClients(params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC' }): Promise<{ clients: Client[]; total: number; page: number; limit: number; totalPages: number; message: string }> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/clients?${searchParams.toString()}`);
    return response.data;
  }

  // Get current user's clients
  static async getCurrentUserClients(): Promise<{ clients: Client[]; message: string }> {
    const response = await apiClient.get('/users/me/clients');
    return response.data;
  }

  // Get user's jobs
  static async getUserJobs(userId: string): Promise<{ jobs: any[]; message: string }> {
    const response = await apiClient.get(`/users/${userId}/jobs`);
    return response.data;
  }

  // Get user's organizations
  static async getUserOrganizations(userId: string): Promise<{ organizations: any[]; message: string }> {
    const response = await apiClient.get(`/users/${userId}/organizations`);
    return response.data;
  }

  // Send password reset email
  static async sendPasswordReset(userId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/users/${userId}/send-password-reset`);
    return response.data;
  }

  // Send email verification
  static async sendEmailVerification(userId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/users/${userId}/verify-email`);
    return response.data;
  }

  // Get team members (users who share clients with current user)
  static async getTeamMembers(params: UserQueryParams = {}): Promise<UsersResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.role) searchParams.append('role', params.role);

    const response = await apiClient.get(`/users/team-members?${searchParams.toString()}`);
    return response.data;
  }

  // Create a new team member (auto-assigned to creator's clients)
  static async createTeamMember(userData: CreateUserData): Promise<{ user: User; message: string }> {
    const response = await apiClient.post('/users/team-member', userData);
    return response.data;
  }

  // Invite existing user to team
  static async inviteUserToTeam(email: string): Promise<{ user: User; message: string }> {
    const response = await apiClient.post('/users/invite-to-team', { email });
    return response.data;
  }
}

export default AdminUserApiService;
