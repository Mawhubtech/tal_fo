import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { OrganizationApiService, type Organization } from '../recruitment/organizations/services/organizationApiService';
import { useAuth } from './useAuth';

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

// Get all organizations (role-based)
export function useOrganizations() {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.some(role => role.name === 'super-admin') || false;

  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: () => isSuperAdmin 
      ? organizationApiService.getAllOrganizations()
      : organizationApiService.getCurrentUserOrganizations(),
    staleTime: 1000 * 60 * 10, // 10 minutes - organizations don't change frequently
    gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
    enabled: !!user, // Only fetch when user is loaded
  });
}

// Get all organization page data in a single optimized request (role-based)
export function useOrganizationPageData() {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.some(role => role.name === 'super-admin') || false;

  return useQuery({
    queryKey: [...organizationKeys.all, 'page-data'],
    queryFn: () => isSuperAdmin 
      ? organizationApiService.getOrganizationPageData()
      : organizationApiService.getCurrentUserOrganizationPageData(),
    staleTime: 1000 * 60 * 10, // 10 minutes - page data doesn't change frequently
    gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
    enabled: !!user, // Only fetch when user is loaded
  });
}

// Get organization by ID
export function useOrganization(organizationId: string) {
  return useQuery({
    queryKey: organizationKeys.detail(organizationId),
    queryFn: () => organizationApiService.getOrganizationById(organizationId),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15,
  });
}

// Get organization statistics
export function useOrganizationStats() {
  const { data: organizations = [] } = useOrganizations(); // Reuse organizations data
  
  return useQuery({
    queryKey: organizationKeys.stats(),
    queryFn: async () => {
      // Try to get stats from API
      try {
        const apiStats = await organizationApiService.getStats();
        return apiStats;
      } catch (error) {
        // Fallback: calculate from organizations data we already have
        const totalEmployees = organizations.reduce((sum, org) => sum + (org.totalEmployees || 0), 0);
        const totalActiveJobs = organizations.reduce((sum, org) => sum + (org.activeJobs || 0), 0);
        const totalDepartments = organizations.reduce((sum, org) => sum + (org.departmentCount || 0), 0);
        
        return {
          organizations: organizations.length,
          departments: totalDepartments,
          activeJobs: totalActiveJobs,
          employees: totalEmployees,
        };
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - stats don't change frequently
    gcTime: 1000 * 60 * 15,
    enabled: organizations.length > 0, // Only run when we have organizations data
  });
}

// Get departments for an organization
export function useOrganizationDepartments(organizationId: string) {
  return useQuery({
    queryKey: organizationKeys.departments(organizationId),
    queryFn: () => organizationApiService.getDepartmentsByOrganization(organizationId),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15,
  });
}

// Get jobs for an organization
export function useOrganizationJobs(organizationId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: organizationKeys.jobs(organizationId),
    queryFn: () => organizationApiService.getJobsByOrganization(organizationId),
    enabled: !!organizationId && (options?.enabled !== false),
    staleTime: 1000 * 60 * 8, // 8 minutes
    gcTime: 1000 * 60 * 12,
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
  
  return useCallback((organizationId: string) => {
    // Only prefetch if data is not already in cache or is stale
    const existingData = queryClient.getQueryData(organizationKeys.detail(organizationId));
    const queryState = queryClient.getQueryState(organizationKeys.detail(organizationId));
    
    // Skip prefetch if data exists and is fresh
    if (existingData && queryState && queryState.dataUpdatedAt > Date.now() - (1000 * 60 * 5)) {
      return;
    }
    
    queryClient.prefetchQuery({
      queryKey: organizationKeys.detail(organizationId),
      queryFn: () => organizationApiService.getOrganizationById(organizationId),
      staleTime: 1000 * 60 * 10,
    });
  }, [queryClient]);
}

// Alias for organizations (since clients are organizations in this system)
export const useClients = useOrganizations;
