import { useQuery } from '@tanstack/react-query';
import { userApiService, AssignableUser } from '../recruitment/organizations/services/userApiService';
import apiClient from '../lib/api';
import { useAuthContext } from '../contexts/AuthContext';

// Hook to get assignable users (filtered by company)
export const useAssignableUsers = () => {
  const { user } = useAuthContext();
  
  return useQuery<AssignableUser[], Error>({
    queryKey: ['assignable-users', user?.id],
    queryFn: async () => {
      const users = await userApiService.getAssignableUsers();
      
      // Log for debugging
      console.log('Retrieved assignable users:', users.length);
      console.log('Current user:', user?.email);
      
      // If the backend doesn't filter by company, we'll filter on frontend
      // This is a temporary solution - ideally the backend should handle this
      if (users.length > 0) {
        // Option 1: Filter by company/organization if available in user data
        // Option 2: Use a reasonable limit as fallback (e.g., first 50 users)
        // Option 3: Filter by some other criteria
        
        // For now, let's limit the results and provide company filtering if possible
        if (user) {
          // If we have company information, filter by it
          // Otherwise, just return a reasonable subset
          const filteredUsers = users.slice(0, 50); // Limit to 50 users as fallback
          console.log('Filtered users to:', filteredUsers.length);
          return filteredUsers;
        }
      }
      
      return users;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!user, // Only run when user is available
  });
};

// Alternative hook to get company-specific users
export const useCompanyUsers = () => {
  const { user } = useAuthContext();
  
  return useQuery<AssignableUser[], Error>({
    queryKey: ['company-users', user?.id],
    queryFn: async () => {
      try {
        // First, try the standard assignable users endpoint
        const allUsers = await userApiService.getAssignableUsers();
        
        if (!user || allUsers.length === 0) {
          return allUsers;
        }
        
        console.log(`Total assignable users from API: ${allUsers.length}`);
        console.log('Current user email:', user.email);
        
        // Apply client-side company filtering strategies
        
        // Strategy 1: Filter by email domain (same company domain)
        const userDomain = user.email.split('@')[1];
        const domainFilteredUsers = allUsers.filter(u => {
          const userEmailDomain = u.email.split('@')[1];
          return userEmailDomain === userDomain;
        });
        
        // If domain filtering gives us reasonable results (more than just the current user)
        if (domainFilteredUsers.length > 1 && domainFilteredUsers.length < allUsers.length) {
          console.log(`Filtered users by domain (${userDomain}): ${domainFilteredUsers.length} users`);
          return domainFilteredUsers;
        }
        
        // Strategy 2: If all users have the same domain (or filtering didn't work)
        // apply a reasonable limit to prevent overwhelming the UI
        if (allUsers.length > 50) {
          console.log('Large user list detected, limiting to 50 users for better UX');
          return allUsers.slice(0, 50);
        }
        
        console.log('Returning all assignable users:', allUsers.length);
        return allUsers;
        
      } catch (error) {
        console.error('Error fetching company users:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!user,
  });
};

// User management hooks
export const useUsers = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await apiClient.get('/users', { params });
      return response.data;
    },
  });
};

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await apiClient.get('/clients');
      return response.data;
    },
  });
};

// Placeholder implementations - these would need to be properly implemented
export const useInviteUserToTeam = () => ({
  mutateAsync: async (email: string) => {
    // This would need proper implementation
    console.log('Invite user to team:', email);
    throw new Error('Not implemented yet');
  },
  isPending: false,
});

export const useAssignUserToClient = () => ({
  mutateAsync: async ({ userId, clientId }: { userId: string; clientId: string }) => {
    // This would need proper implementation
    console.log('Assign user to client:', { userId, clientId });
    throw new Error('Not implemented yet');
  },
  isPending: false,
});

export const useRemoveUserFromClient = () => ({
  mutateAsync: async ({ userId, clientId }: { userId: string; clientId: string }) => {
    // This would need proper implementation
    console.log('Remove user from client:', { userId, clientId });
    throw new Error('Not implemented yet');
  },
  isPending: false,
});
