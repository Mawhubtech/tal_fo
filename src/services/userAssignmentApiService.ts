import apiClient from './api';

export interface UserAssignment {
  userId: string;
  clientId: string;
  clientName: string;
  organizationId: string; // Alias for clientId for backward compatibility
  organizationName: string; // Alias for clientName for backward compatibility
  departmentId?: string;
  departmentName?: string;
  assignedAt: string;
  assignedBy: string;
}

class UserAssignmentApiService {
  /**
   * Get the organization/client assigned to the current user by admin
   * This is specifically for internal recruiters who are assigned to a single organization
   */
  async getMyAssignment(): Promise<UserAssignment | null> {
    try {
      const response = await apiClient.get('/users/me/assignment');
      return response.data?.assignment; // Extract assignment from the response
    } catch (error) {
      console.error('Error fetching user assignment:', error);
      // Return null if no assignment found or error occurs
      return null;
    }
  }

  /**
   * Get assignments for a specific user (admin endpoint)
   */
  async getUserAssignment(userId: string): Promise<UserAssignment | null> {
    try {
      const response = await apiClient.get(`/users/${userId}/assignment`);
      return response.data?.assignment;
    } catch (error) {
      console.error('Error fetching user assignment:', error);
      return null;
    }
  }

  /**
   * Assign a user to an organization (admin endpoint)
   */
  async assignUserToOrganization(userId: string, organizationId: string, departmentId?: string): Promise<UserAssignment> {
    try {
      const response = await apiClient.put(`/users/${userId}/assignment`, {
        clientId: organizationId, // Use clientId since backend works with clients
        departmentId
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning user to organization:', error);
      throw error;
    }
  }

  /**
   * Remove user assignment (admin endpoint)
   */
  async removeUserAssignment(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${userId}/assignment`);
    } catch (error) {
      console.error('Error removing user assignment:', error);
      throw error;
    }
  }
}

export const userAssignmentApiService = new UserAssignmentApiService();
export default UserAssignmentApiService;
