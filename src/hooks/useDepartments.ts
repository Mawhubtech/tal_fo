import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrganizationApiService, type Department } from '../recruitment/organizations/services/organizationApiService';
import { DepartmentApiService, type CreateDepartmentRequest, type UpdateDepartmentRequest } from '../recruitment/organizations/services/departmentApiService';

// Query Keys
export const departmentKeys = {
  all: ['departments'] as const,
  byOrganization: (organizationId: string) => [...departmentKeys.all, 'byOrganization', organizationId] as const,
  detail: (organizationId: string, departmentId: string) => [...departmentKeys.all, 'detail', organizationId, departmentId] as const,
  jobsByDepartment: (organizationId: string, departmentId: string) => [...departmentKeys.all, 'jobs', organizationId, departmentId] as const,
};

const organizationApiService = new OrganizationApiService();
const departmentApiService = new DepartmentApiService();

// Get departments by organization
export const useDepartmentsByOrganization = (organizationId: string) => {
  return useQuery({
    queryKey: departmentKeys.byOrganization(organizationId),
    queryFn: () => organizationApiService.getDepartmentsByOrganization(organizationId),
    enabled: !!organizationId,
  });
};

// Get single department
export const useDepartment = (organizationId: string, departmentId: string) => {
  return useQuery({
    queryKey: departmentKeys.detail(organizationId, departmentId),
    queryFn: () => organizationApiService.getDepartmentById(organizationId, departmentId),
    enabled: !!organizationId && !!departmentId,
  });
};

// Get jobs by department
export const useJobsByDepartment = (organizationId: string, departmentId: string) => {
  return useQuery({
    queryKey: departmentKeys.jobsByDepartment(organizationId, departmentId),
    queryFn: () => organizationApiService.getJobsByDepartment(organizationId, departmentId),
    enabled: !!organizationId && !!departmentId,
  });
};

// Create department mutation
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDepartmentRequest) =>
      departmentApiService.createDepartment(data),
    onSuccess: (newDepartment) => {
      // Invalidate departments list for the organization
      queryClient.invalidateQueries({ 
        queryKey: departmentKeys.byOrganization(newDepartment.clientId) 
      });
      
      // Also invalidate organization data since it might include department counts
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

// Update department mutation
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ departmentId, data }: { 
      departmentId: string; 
      data: UpdateDepartmentRequest 
    }) =>
      departmentApiService.updateDepartment(departmentId, data),
    onSuccess: (updatedDepartment) => {
      // Update the specific department in cache
      queryClient.setQueryData(
        departmentKeys.detail(updatedDepartment.clientId, updatedDepartment.id),
        updatedDepartment
      );
      
      // Invalidate departments list for the organization
      queryClient.invalidateQueries({ 
        queryKey: departmentKeys.byOrganization(updatedDepartment.clientId) 
      });
      
      // Also invalidate organization data
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

// Delete department mutation
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (departmentId: string) =>
      departmentApiService.deleteDepartment(departmentId),
    onSuccess: (_, departmentId) => {
      // Remove from cache - we need to remove all department detail entries
      queryClient.removeQueries({ 
        queryKey: [...departmentKeys.all, 'detail'],
        predicate: (query) => {
          const key = query.queryKey as string[];
          return key.includes(departmentId);
        }
      });
      
      // Invalidate all departments and organizations queries
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};
