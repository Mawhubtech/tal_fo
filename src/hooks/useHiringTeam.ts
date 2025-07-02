import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  hiringTeamApiService, 
  type HiringTeam,
  type HiringTeamMember, 
  type CreateHiringTeamData,
  type UpdateHiringTeamData,
  type CreateHiringTeamMemberData, 
  type InviteExternalMemberData,
  type UpdateHiringTeamMemberData,
  type SearchUserResult 
} from '../services/hiringTeamApiService';

// Query keys
export const hiringTeamKeys = {
  all: ['hiringTeam'] as const,
  teams: (organizationIds?: string[]) => [...hiringTeamKeys.all, 'teams', organizationIds || []] as const,
  team: (teamId: string) => [...hiringTeamKeys.all, 'team', teamId] as const,
  teamMembers: (teamId: string) => [...hiringTeamKeys.all, 'teamMembers', teamId] as const,
  user: (userId: string) => [...hiringTeamKeys.all, 'user', userId] as const,
  userSearch: (query: string) => [...hiringTeamKeys.all, 'userSearch', query] as const,
};

// Get all hiring teams
export function useHiringTeams(organizationIds?: string[]) {
  return useQuery({
    queryKey: hiringTeamKeys.teams(organizationIds),
    queryFn: () => hiringTeamApiService.getAllTeams(organizationIds),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get single hiring team
export function useHiringTeam(teamId: string) {
  return useQuery({
    queryKey: hiringTeamKeys.team(teamId),
    queryFn: () => hiringTeamApiService.getTeamById(teamId),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get team members
export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: hiringTeamKeys.teamMembers(teamId),
    queryFn: () => hiringTeamApiService.getTeamMembers(teamId),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Search users
export function useUserSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: hiringTeamKeys.userSearch(query),
    queryFn: () => hiringTeamApiService.searchUsers(query, 10),
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// Get team memberships for a user
export function useUserTeamMemberships(userId: string) {
  return useQuery({
    queryKey: hiringTeamKeys.user(userId),
    queryFn: () => hiringTeamApiService.getTeamMembershipsByUser(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Create hiring team mutation
export function useCreateHiringTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateHiringTeamData) => hiringTeamApiService.createTeam(data),
    onSuccess: (newTeam) => {
      // Invalidate teams list for all organizations this team belongs to
      if (newTeam.organizations && newTeam.organizations.length > 0) {
        const orgIds = newTeam.organizations.map(org => org.id);
        queryClient.invalidateQueries({ 
          queryKey: hiringTeamKeys.teams(orgIds) 
        });
      }
      // Also invalidate the general teams query
      queryClient.invalidateQueries({ 
        queryKey: hiringTeamKeys.teams() 
      });
    },
  });
}

// Update hiring team mutation
export function useUpdateHiringTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: UpdateHiringTeamData }) => 
      hiringTeamApiService.updateTeam(teamId, data),
    onSuccess: (updatedTeam) => {
      // Invalidate specific team and teams list
      queryClient.invalidateQueries({ queryKey: hiringTeamKeys.team(updatedTeam.id) });
      
      // Invalidate teams list for all organizations this team belongs to
      if (updatedTeam.organizations && updatedTeam.organizations.length > 0) {
        const orgIds = updatedTeam.organizations.map(org => org.id);
        queryClient.invalidateQueries({ 
          queryKey: hiringTeamKeys.teams(orgIds) 
        });
      }
      
      // Also invalidate the general teams query
      queryClient.invalidateQueries({ 
        queryKey: hiringTeamKeys.teams() 
      });
    },
  });
}

// Delete hiring team mutation
export function useDeleteHiringTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (teamId: string) => hiringTeamApiService.deleteTeam(teamId),
    onSuccess: () => {
      // Invalidate all teams queries
      queryClient.invalidateQueries({ queryKey: hiringTeamKeys.all });
    },
  });
}

// Add team member mutation
export function useAddTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateHiringTeamMemberData) => hiringTeamApiService.addTeamMember(data),
    onSuccess: (_, variables) => {
      // Invalidate team members and team details
      queryClient.invalidateQueries({ queryKey: hiringTeamKeys.teamMembers(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: hiringTeamKeys.team(variables.teamId) });
      
      // If adding internal user, invalidate their team memberships
      if (variables.userId) {
        queryClient.invalidateQueries({ queryKey: hiringTeamKeys.user(variables.userId) });
      }
    },
  });
}

// Invite external member mutation
export function useInviteExternalMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InviteExternalMemberData) => hiringTeamApiService.inviteExternalMember(data),
    onSuccess: (_, variables) => {
      // Invalidate team members and team details
      queryClient.invalidateQueries({ queryKey: hiringTeamKeys.teamMembers(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: hiringTeamKeys.team(variables.teamId) });
    },
  });
}

// Update team member mutation
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: UpdateHiringTeamMemberData }) => 
      hiringTeamApiService.updateTeamMember(memberId, data),
    onSuccess: (updatedMember) => {
      // Invalidate team members and team details
      queryClient.invalidateQueries({ queryKey: hiringTeamKeys.teamMembers(updatedMember.teamId) });
      queryClient.invalidateQueries({ queryKey: hiringTeamKeys.team(updatedMember.teamId) });
      
      // If it's an internal user, invalidate their team memberships
      if (updatedMember.userId) {
        queryClient.invalidateQueries({ queryKey: hiringTeamKeys.user(updatedMember.userId) });
      }
    },
  });
}

// Remove team member mutation
export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (memberId: string) => hiringTeamApiService.removeTeamMember(memberId),
    onSuccess: () => {
      // Invalidate all hiring team queries since we don't have teamId context
      queryClient.invalidateQueries({ queryKey: hiringTeamKeys.all });
    },
  });
}

// Accept invitation mutation (for external users)
export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ token, teamId }: { token: string; teamId: string }) => 
      hiringTeamApiService.acceptInvitation(token, teamId),
    onSuccess: (updatedMember) => {
      // Invalidate team members and team details
      queryClient.invalidateQueries({ queryKey: hiringTeamKeys.teamMembers(updatedMember.teamId) });
      queryClient.invalidateQueries({ queryKey: hiringTeamKeys.team(updatedMember.teamId) });
    },
  });
}

// Verify external access
export function useVerifyExternalAccess(token: string, teamId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['externalAccess', token, teamId],
    queryFn: () => hiringTeamApiService.verifyExternalAccess(token, teamId),
    enabled: enabled && !!token && !!teamId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry on failed access verification
  });
}
