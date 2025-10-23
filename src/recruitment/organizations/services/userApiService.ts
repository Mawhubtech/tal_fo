import apiClient from '../../../services/api';

export interface AssignableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId?: string;
  organizationId?: string;
  department?: string;
}

export interface UserClient {
  id: string;
  name: string;
  industry: string;
  status: string;
  logoUrl?: string;
  location: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'active' | 'inactive' | 'banned';
  avatar?: string;
  clients: UserClient[];
  roles: {
    id: string;
    name: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignUserToClientsData {
  userId: string;
  clientIds: string[];
}

export interface BulkAssignUsersToClientsData {
  userIds: string[];
  clientIds: string[];
}

export interface BulkAssignmentResult {
  success: number;
  failed: string[];
}

export const userApiService = {
  // Get users who can be assigned tasks
  getAssignableUsers: async (): Promise<AssignableUser[]> => {
    try {
      const response = await apiClient.get('/users/assignable');
      console.log('Assignable users API response:', response.data);
      
      // Handle different possible response structures
      if (response.data.users) {
        return response.data.users;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected assignable users response structure:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching assignable users:', error);
      throw error;
    }
  },

  // Get current user's accessible clients/organizations
  getUserClients: async (): Promise<UserClient[]> => {
    const response = await apiClient.get('/users/me/clients');
    return response.data.clients;
  },

  // Get all users (admin only)
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/users');
    return response.data.users;
  },

  // Assign user to clients
  assignUserToClients: async (data: AssignUserToClientsData): Promise<User> => {
    const response = await apiClient.post(`/users/${data.userId}/clients`, {
      clientIds: data.clientIds
    });
    return response.data.user;
  },

  // Bulk assign multiple users to clients
  bulkAssignUsersToClients: async (data: BulkAssignUsersToClientsData): Promise<BulkAssignmentResult> => {
    const response = await apiClient.post('/users/bulk/assign-clients', {
      userIds: data.userIds,
      clientIds: data.clientIds
    });
    return response.data.result;
  },
};
