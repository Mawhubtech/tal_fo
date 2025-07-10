import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RecruitmentTeamsApiService, CreateRecruitmentTeamDto, UpdateRecruitmentTeamDto, AddTeamMemberDto, UpdateTeamMemberDto } from '../services/recruitmentTeamsApiService';

// Query keys
export const recruitmentTeamKeys = {
  all: ['recruitment-teams'] as const,
  myTeams: () => [...recruitmentTeamKeys.all, 'my-teams'] as const,
  team: (teamId: string) => [...recruitmentTeamKeys.all, 'team', teamId] as const,
  members: (teamId: string) => [...recruitmentTeamKeys.all, 'team', teamId, 'members'] as const,
};

// Team queries
export const useMyTeams = () => {
  return useQuery({
    queryKey: recruitmentTeamKeys.myTeams(),
    queryFn: RecruitmentTeamsApiService.getMyTeams,
  });
};

export const useTeam = (teamId: string) => {
  return useQuery({
    queryKey: recruitmentTeamKeys.team(teamId),
    queryFn: () => RecruitmentTeamsApiService.getTeamById(teamId),
    enabled: !!teamId,
  });
};

export const useTeamMembers = (teamId: string) => {
  return useQuery({
    queryKey: recruitmentTeamKeys.members(teamId),
    queryFn: () => RecruitmentTeamsApiService.getTeamMembers(teamId),
    enabled: !!teamId,
  });
};

// Team mutations
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecruitmentTeamDto) => RecruitmentTeamsApiService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentTeamKeys.myTeams() });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: UpdateRecruitmentTeamDto }) =>
      RecruitmentTeamsApiService.updateTeam(teamId, data),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentTeamKeys.team(teamId) });
      queryClient.invalidateQueries({ queryKey: recruitmentTeamKeys.myTeams() });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => RecruitmentTeamsApiService.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentTeamKeys.myTeams() });
    },
  });
};

// Team member mutations
export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: AddTeamMemberDto }) =>
      RecruitmentTeamsApiService.addTeamMember(teamId, data),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentTeamKeys.members(teamId) });
      queryClient.invalidateQueries({ queryKey: recruitmentTeamKeys.team(teamId) });
    },
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, memberId, data }: { teamId: string; memberId: string; data: UpdateTeamMemberDto }) =>
      RecruitmentTeamsApiService.updateTeamMember(teamId, memberId, data),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentTeamKeys.members(teamId) });
      queryClient.invalidateQueries({ queryKey: recruitmentTeamKeys.team(teamId) });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      RecruitmentTeamsApiService.removeTeamMember(teamId, memberId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: recruitmentTeamKeys.members(teamId) });
      queryClient.invalidateQueries({ queryKey: recruitmentTeamKeys.team(teamId) });
    },
  });
};
