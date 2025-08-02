import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApiService, CreateCompanyData, UpdateCompanyData, InviteMemberData, UpdateMemberData } from '../services/companyApiService';

// Query keys
export const companyKeys = {
  all: ['companies'] as const,
  allCompanies: () => [...companyKeys.all, 'all-companies'] as const,
  myCompanies: () => [...companyKeys.all, 'my-companies'] as const,
  memberCompanies: () => [...companyKeys.all, 'member-companies'] as const,
  company: (id: string) => [...companyKeys.all, 'company', id] as const,
  companyMembers: (companyId: string) => [...companyKeys.all, 'members', companyId] as const,
  companyDepartments: (companyId: string) => [...companyKeys.all, 'departments', companyId] as const,
  companyStats: (companyId: string) => [...companyKeys.all, 'stats', companyId] as const,
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

export const useAllCompanies = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: companyKeys.allCompanies(),
    queryFn: () => companyApiService.getAllCompanies(),
    enabled: options?.enabled ?? true,
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

// Company mutations
export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyData) => companyApiService.createCompany(data),
    onSuccess: () => {
      // Invalidate all company-related queries using the base key
      // This is more efficient than invalidating each query individually
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyData }) => 
      companyApiService.updateCompany(id, data),
    onSuccess: (result, variables) => {
      // Invalidate the specific company and all company lists
      queryClient.invalidateQueries({ queryKey: companyKeys.company(variables.id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => companyApiService.deleteCompany(id),
    onSuccess: () => {
      // Invalidate all company-related queries
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
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
      // Invalidate specific company queries and all company lists
      queryClient.invalidateQueries({ queryKey: companyKeys.companyMembers(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyStats(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.company(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => companyApiService.acceptInvitation(memberId),
    onSuccess: () => {
      // Invalidate all company-related queries since user's membership status changed
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data, companyId }: { memberId: string; data: UpdateMemberData; companyId: string }) => 
      companyApiService.updateMember(companyId, memberId, data),
    onSuccess: (result, variables) => {
      // Invalidate specific company queries and all company lists
      queryClient.invalidateQueries({ queryKey: companyKeys.companyMembers(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.company(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, companyId }: { memberId: string; companyId: string }) => 
      companyApiService.removeMember(companyId, memberId),
    onSuccess: (result, variables) => {
      // Invalidate specific company queries and all company lists
      queryClient.invalidateQueries({ queryKey: companyKeys.companyMembers(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyStats(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.company(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
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

// No team mutations - teams functionality removed
