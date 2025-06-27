import apiClient from '../../../services/api';

export interface AssignableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export const userApiService = {
  // Get users who can be assigned tasks
  getAssignableUsers: async (): Promise<AssignableUser[]> => {
    const response = await apiClient.get('/users/assignable');
    return response.data.users;
  },
};
