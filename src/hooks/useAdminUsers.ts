import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminUserApiService, type User, type CreateUserData, type UpdateUserData, type UserQueryParams, type UserStats, type Role, type Client } from '../services/adminUserApiService';

// Query keys
export const adminUserKeys = {
  all: ['adminUsers'] as const,
  users: (params?: UserQueryParams) => [...adminUserKeys.all, 'users', params] as const,
  teamMembers: (params?: UserQueryParams) => [...adminUserKeys.all, 'teamMembers', params] as const,
  user: (id: string) => [...adminUserKeys.all, 'user', id] as const,
  stats: () => [...adminUserKeys.all, 'stats'] as const,
  roles: () => [...adminUserKeys.all, 'roles'] as const,
  clients: () => [...adminUserKeys.all, 'clients'] as const,
  userJobs: (userId: string) => [...adminUserKeys.all, 'userJobs', userId] as const,
  userOrganizations: (userId: string) => [...adminUserKeys.all, 'userOrganizations', userId] as const,
  currentUserClients: () => [...adminUserKeys.all, 'currentUserClients'] as const,
};

// Get all users with filters
export function useUsers(params: UserQueryParams = {}) {
  return useQuery({
    queryKey: adminUserKeys.users(params),
    queryFn: () => AdminUserApiService.getUsers(params),
    staleTime: 0, // Always consider data stale to force refetch
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });
}

// Get single user by ID
export function useUser(id: string) {
  return useQuery({
    queryKey: adminUserKeys.user(id),
    queryFn: () => AdminUserApiService.getUserById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get user statistics
export function useUserStats() {
  return useQuery({
    queryKey: adminUserKeys.stats(),
    queryFn: () => AdminUserApiService.getUserStats(),
    staleTime: 0, // Always consider data stale to force refetch
    gcTime: 1000 * 60 * 2, // Keep in cache for 2 minutes
  });
}

// Get all roles
export function useRoles() {
  return useQuery({
    queryKey: adminUserKeys.roles(),
    queryFn: () => AdminUserApiService.getRoles(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Get all clients
export function useClients() {
  return useQuery({
    queryKey: adminUserKeys.clients(),
    queryFn: () => AdminUserApiService.getClients(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get current user's clients
export function useCurrentUserClients() {
  return useQuery({
    queryKey: adminUserKeys.currentUserClients(),
    queryFn: () => AdminUserApiService.getCurrentUserClients(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get user's jobs
export function useUserJobs(userId: string) {
  return useQuery({
    queryKey: adminUserKeys.userJobs(userId),
    queryFn: () => AdminUserApiService.getUserJobs(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get user's organizations
export function useUserOrganizations(userId: string) {
  return useQuery({
    queryKey: adminUserKeys.userOrganizations(userId),
    queryFn: () => AdminUserApiService.getUserOrganizations(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get team members (users who share clients with current user)
export function useTeamMembers(params: UserQueryParams = {}) {
  return useQuery({
    queryKey: adminUserKeys.teamMembers(params),
    queryFn: () => AdminUserApiService.getTeamMembers(params),
    staleTime: 0, // Always consider data stale to force refetch
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserData) => AdminUserApiService.createUser(userData),
    onSuccess: () => {
      // Invalidate all admin user queries
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserData }) => 
      AdminUserApiService.updateUser(id, userData),
    onSuccess: () => {
      // Invalidate all admin user queries
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AdminUserApiService.deleteUser(id),
    onSuccess: () => {
      // Invalidate all admin user queries
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
    onError: (error: any) => {
      // Log the error for debugging
      console.error('Delete user error:', error);
      
      // The error will be handled by the calling component
      // but we can add any additional global error handling here if needed
    },
  });
}

// Archive user mutation
export function useArchiveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AdminUserApiService.archiveUser(id),
    onSuccess: () => {
      // Invalidate all admin user queries
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}

// Restore user mutation
export function useRestoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AdminUserApiService.restoreUser(id),
    onSuccess: () => {
      // Invalidate all admin user queries
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}

// Update user status mutation
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' | 'banned' }) => 
      AdminUserApiService.updateUserStatus(id, status),
    onSuccess: () => {
      // Invalidate all admin user queries
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}

// Assign role mutation
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) => 
      AdminUserApiService.assignRole(userId, roleId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.user(userId) });
    },
  });
}

// Remove role mutation
export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) => 
      AdminUserApiService.removeRole(userId, roleId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.user(userId) });
    },
  });
}

// Assign client mutation
export function useAssignClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, clientId }: { userId: string; clientId: string }) => 
      AdminUserApiService.assignClient(userId, clientId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.user(userId) });
    },
  });
}

// Remove client mutation
export function useRemoveClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, clientId }: { userId: string; clientId: string }) => 
      AdminUserApiService.removeClient(userId, clientId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.user(userId) });
    },
  });
}

// Assign multiple clients to user mutation
export function useAssignClients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, clientIds }: { userId: string; clientIds: string[] }) => 
      AdminUserApiService.assignClients(userId, clientIds),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.user(userId) });
    },
  });
}

// Update user's complete client access mutation
export function useUpdateUserClients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, clientIds }: { userId: string; clientIds: string[] }) => 
      AdminUserApiService.updateUserClients(userId, clientIds),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.user(userId) });
    },
  });
}

// Bulk assign users to clients mutation
export function useBulkAssignUsersToClients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, clientIds }: { userIds: string[]; clientIds: string[] }) => 
      AdminUserApiService.bulkAssignUsersToClients(userIds, clientIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.stats() });
    },
  });
}

// Send password reset mutation
export function useSendPasswordReset() {
  return useMutation({
    mutationFn: (userId: string) => AdminUserApiService.sendPasswordReset(userId),
  });
}

// Send email verification mutation
export function useSendEmailVerification() {
  return useMutation({
    mutationFn: (userId: string) => AdminUserApiService.sendEmailVerification(userId),
  });
}

// Create team member mutation
export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserData) => AdminUserApiService.createTeamMember(userData),
    onSuccess: () => {
      // Invalidate all admin user queries
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}

// Invite user to team mutation
export function useInviteUserToTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => AdminUserApiService.inviteUserToTeam(email),
    onSuccess: () => {
      // Invalidate all admin user queries
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}
