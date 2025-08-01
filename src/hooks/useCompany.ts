import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApiService, CreateCompanyData, UpdateCompanyData, InviteMemberData, UpdateMemberData, CreateTeamData, UpdateTeamData, AddTeamMemberData } from '../services/companyApiService';

// Query keys
export const companyKeys = {
  all: ['companies'] as const,
  myCompanies: () => [...companyKeys.all, 'my-companies'] as const,
  memberCompanies: () => [...companyKeys.all, 'member-companies'] as const,
  company: (id: string) => [...companyKeys.all, 'company', id] as const,
  companyMembers: (companyId: string) => [...companyKeys.all, 'members', companyId] as const,
  companyDepartments: (companyId: string) => [...companyKeys.all, 'departments', companyId] as const,
  companyStats: (companyId: string) => [...companyKeys.all, 'stats', companyId] as const,
  companyTeams: (companyId: string) => [...companyKeys.all, 'teams', companyId] as const,
  companyTeam: (companyId: string, teamId: string) => [...companyKeys.all, 'teams', companyId, teamId] as const,
};

// Company queries
export const useMyCompanies = () => {
  return useQuery({
    queryKey: companyKeys.myCompanies(),
    queryFn: () => companyApiService.getMyCompanies(),
  });
};

export const useMemberCompanies = () => {
  return useQuery({
    queryKey: companyKeys.memberCompanies(),
    queryFn: () => companyApiService.getMemberCompanies(),
  });
};

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: companyKeys.company(id),
    queryFn: () => companyApiService.getCompany(id),
    enabled: !!id,
  });
};

export const useCompanyMembers = (companyId: string) => {
  return useQuery({
    queryKey: companyKeys.companyMembers(companyId),
    queryFn: () => companyApiService.getCompanyMembers(companyId),
    enabled: !!companyId,
  });
};

export const useCompanyDepartments = (companyId: string) => {
  return useQuery({
    queryKey: companyKeys.companyDepartments(companyId),
    queryFn: () => companyApiService.getCompanyDepartments(companyId),
    enabled: !!companyId,
  });
};

export const useCompanyStats = (companyId: string) => {
  return useQuery({
    queryKey: companyKeys.companyStats(companyId),
    queryFn: () => companyApiService.getCompanyStats(companyId),
    enabled: !!companyId,
  });
};

export const useCompanyTeams = (companyId: string) => {
  return useQuery({
    queryKey: companyKeys.companyTeams(companyId),
    queryFn: () => companyApiService.getCompanyTeams(companyId),
    enabled: !!companyId,
  });
};

export const useCompanyTeam = (companyId: string, teamId: string) => {
  return useQuery({
    queryKey: companyKeys.companyTeam(companyId, teamId),
    queryFn: () => companyApiService.getCompanyTeam(companyId, teamId),
    enabled: !!companyId && !!teamId,
  });
};

// Company mutations
export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyData) => companyApiService.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.myCompanies() });
      queryClient.invalidateQueries({ queryKey: companyKeys.memberCompanies() });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyData }) => 
      companyApiService.updateCompany(id, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.company(variables.id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.myCompanies() });
      queryClient.invalidateQueries({ queryKey: companyKeys.memberCompanies() });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => companyApiService.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.myCompanies() });
      queryClient.invalidateQueries({ queryKey: companyKeys.memberCompanies() });
    },
  });
};

// Member mutations
export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: InviteMemberData }) => 
      companyApiService.inviteMember(companyId, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.companyMembers(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyStats(variables.companyId) });
    },
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => companyApiService.acceptInvitation(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.memberCompanies() });
      // We don't know the companyId here, so invalidate all member queries
      queryClient.invalidateQueries({ queryKey: ['companies', 'members'] });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data, companyId }: { memberId: string; data: UpdateMemberData; companyId: string }) => 
      companyApiService.updateMember(companyId, memberId, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.companyMembers(variables.companyId) });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, companyId }: { memberId: string; companyId: string }) => 
      companyApiService.removeMember(companyId, memberId),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.companyMembers(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyStats(variables.companyId) });
    },
  });
};

// Department mutations
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: any }) => 
      companyApiService.createDepartment(companyId, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.companyDepartments(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyStats(variables.companyId) });
    },
  });
};

// Team mutations
export const useCreateCompanyTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: CreateTeamData }) => 
      companyApiService.createCompanyTeam(companyId, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.companyTeams(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyStats(variables.companyId) });
    },
  });
};

export const useUpdateCompanyTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, teamId, data }: { companyId: string; teamId: string; data: UpdateTeamData }) => 
      companyApiService.updateCompanyTeam(companyId, teamId, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.companyTeam(variables.companyId, variables.teamId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyTeams(variables.companyId) });
    },
  });
};

export const useDeleteCompanyTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, teamId }: { companyId: string; teamId: string }) => 
      companyApiService.deleteCompanyTeam(companyId, teamId),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.companyTeams(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyStats(variables.companyId) });
    },
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, teamId, data }: { companyId: string; teamId: string; data: AddTeamMemberData }) => 
      companyApiService.addTeamMember(companyId, teamId, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.companyTeam(variables.companyId, variables.teamId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyTeams(variables.companyId) });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, teamId, memberId }: { companyId: string; teamId: string; memberId: string }) => 
      companyApiService.removeTeamMember(companyId, teamId, memberId),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.companyTeam(variables.companyId, variables.teamId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyTeams(variables.companyId) });
    },
  });
};

export const useUpdateTeamMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, teamId, memberId, role }: { companyId: string; teamId: string; memberId: string; role: 'admin' | 'member' }) => 
      companyApiService.updateTeamMemberRole(companyId, teamId, memberId, role),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.companyTeam(variables.companyId, variables.teamId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyTeams(variables.companyId) });
    },
  });
};

export const useToggleTeamMemberStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, teamId, memberId }: { companyId: string; teamId: string; memberId: string }) => 
      companyApiService.toggleTeamMemberStatus(companyId, teamId, memberId),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.companyTeam(variables.companyId, variables.teamId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyTeams(variables.companyId) });
    },
  });
};

export const useSyncTeamMembersToCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId }: { teamId: string }) => 
      companyApiService.syncTeamMembersToCompany(teamId),
    onSuccess: () => {
      // Invalidate all company queries to show newly synced members
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
};
