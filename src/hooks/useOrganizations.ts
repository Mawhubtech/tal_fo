import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrganizationApiService, type Organization } from '../recruitment/organizations/services/organizationApiService';

const organizationApiService = new OrganizationApiService();

// Query keys
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters: string) => [...organizationKeys.lists(), { filters }] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  stats: () => [...organizationKeys.all, 'stats'] as const,
  departments: (organizationId: string) => [...organizationKeys.detail(organizationId), 'departments'] as const,
  jobs: (organizationId: string) => [...organizationKeys.detail(organizationId), 'jobs'] as const,
  departmentJobs: (organizationId: string, departmentId: string) => [...organizationKeys.departments(organizationId), departmentId, 'jobs'] as const,
};

// Get all organizations
export function useOrganizations() {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: () => organizationApiService.getAllOrganizations(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get organization by ID
export function useOrganization(organizationId: string) {
  return useQuery({
    queryKey: organizationKeys.detail(organizationId),
    queryFn: () => organizationApiService.getOrganizationById(organizationId),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get organization statistics
export function useOrganizationStats() {
  return useQuery({
    queryKey: organizationKeys.stats(),
    queryFn: () => organizationApiService.getStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes (stats change more frequently)
  });
}

// Get departments for an organization
export function useOrganizationDepartments(organizationId: string) {
  return useQuery({
    queryKey: organizationKeys.departments(organizationId),
    queryFn: () => organizationApiService.getDepartmentsByOrganization(organizationId),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get jobs for an organization
export function useOrganizationJobs(organizationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: organizationKeys.jobs(organizationId),
    queryFn: () => organizationApiService.getJobsByOrganization(organizationId),
    enabled: !!organizationId && (options?.enabled !== false),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// Get jobs for a specific department
export function useDepartmentJobs(organizationId: string, departmentId: string) {
  return useQuery({
    queryKey: organizationKeys.departmentJobs(organizationId, departmentId),
    queryFn: () => organizationApiService.getJobsByDepartment(organizationId, departmentId),
    enabled: !!organizationId && !!departmentId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

// Search organizations
export function useSearchOrganizations(searchQuery: string) {
  return useQuery({
    queryKey: [...organizationKeys.lists(), 'search', searchQuery],
    queryFn: () => organizationApiService.searchOrganizations(searchQuery),
    enabled: !!searchQuery && searchQuery.length > 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get organizations by industry
export function useOrganizationsByIndustry(industry: string) {
  return useQuery({
    queryKey: [...organizationKeys.lists(), 'industry', industry],
    queryFn: () => organizationApiService.getOrganizationsByIndustry(industry),
    enabled: !!industry,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get industries
export function useIndustries() {
  return useQuery({
    queryKey: [...organizationKeys.all, 'industries'],
    queryFn: () => organizationApiService.getIndustries(),
    staleTime: 1000 * 60 * 15, // 15 minutes (industries don't change often)
  });
}

// Get locations
export function useLocations() {
  return useQuery({
    queryKey: [...organizationKeys.all, 'locations'],
    queryFn: () => organizationApiService.getLocations(),
    staleTime: 1000 * 60 * 15, // 15 minutes (locations don't change often)
  });
}

// Invalidation helpers
export function useInvalidateOrganizations() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: organizationKeys.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: organizationKeys.lists() }),
    invalidateDetail: (organizationId: string) => 
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(organizationId) }),
    invalidateStats: () => queryClient.invalidateQueries({ queryKey: organizationKeys.stats() }),
    invalidateDepartments: (organizationId: string) => 
      queryClient.invalidateQueries({ queryKey: organizationKeys.departments(organizationId) }),
    invalidateJobs: (organizationId: string) => 
      queryClient.invalidateQueries({ queryKey: organizationKeys.jobs(organizationId) }),
  };
}

// Prefetch helpers
export function usePrefetchOrganization() {
  const queryClient = useQueryClient();
  
  return (organizationId: string) => {
    queryClient.prefetchQuery({
      queryKey: organizationKeys.detail(organizationId),
      queryFn: () => organizationApiService.getOrganizationById(organizationId),
      staleTime: 1000 * 60 * 5,
    });
  };
}
