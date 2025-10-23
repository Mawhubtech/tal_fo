import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApiService, type UserClient, type AssignableUser, type User, type AssignUserToClientsData, type BulkAssignUsersToClientsData } from '../recruitment/organizations/services/userApiService';

// Query keys
export const userKeys = {
  all: ['user'] as const,
  clients: () => [...userKeys.all, 'clients'] as const,
  assignableUsers: () => [...userKeys.all, 'assignable'] as const,
  users: () => [...userKeys.all, 'users'] as const,
};

// Get current user's accessible clients/organizations
export function useUserClients() {
  return useQuery({
    queryKey: userKeys.clients(),
    queryFn: () => userApiService.getUserClients(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get assignable users
export function useAssignableUsers() {
  return useQuery({
    queryKey: userKeys.assignableUsers(),
    queryFn: () => userApiService.getAssignableUsers(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get all users (admin only)
export function useUsers() {
  return useQuery({
    queryKey: userKeys.users(),
    queryFn: () => userApiService.getUsers(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Assign user to clients mutation
export function useAssignUserToClients() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AssignUserToClientsData) => userApiService.assignUserToClients(data),
    onSuccess: () => {
      // Invalidate users list to refresh the data
      queryClient.invalidateQueries({ queryKey: userKeys.users() });
    },
  });
}

// Bulk assign users to clients mutation
export function useBulkAssignUsersToClients() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BulkAssignUsersToClientsData) => userApiService.bulkAssignUsersToClients(data),
    onSuccess: () => {
      // Invalidate users list to refresh the data
      queryClient.invalidateQueries({ queryKey: userKeys.users() });
    },
  });
}
