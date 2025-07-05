import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  rolePermissionApiService, 
  type Role, 
  type Permission, 
  type CreateRoleData, 
  type UpdateRoleData, 
  type CreatePermissionData, 
  type UpdatePermissionData 
} from '../services/rolePermissionApiService';

// Role hooks
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: rolePermissionApiService.getRoles,
  });
};

export const useRoleById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => rolePermissionApiService.getRoleById(id),
    enabled: !!id && enabled,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRoleData) => rolePermissionApiService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleData }) => 
      rolePermissionApiService.updateRole(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', id] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => rolePermissionApiService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useToggleRoleStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => rolePermissionApiService.toggleRoleStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', id] });
    },
  });
};

export const useAssignPermissionToRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) => 
      rolePermissionApiService.assignPermissionToRole(roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', roleId] });
    },
  });
};

export const useRemovePermissionFromRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) => 
      rolePermissionApiService.removePermissionFromRole(roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', roleId] });
    },
  });
};

// Permission hooks
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: rolePermissionApiService.getPermissions,
  });
};

export const usePermissionById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['permissions', id],
    queryFn: () => rolePermissionApiService.getPermissionById(id),
    enabled: !!id && enabled,
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePermissionData) => rolePermissionApiService.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissionData }) => 
      rolePermissionApiService.updatePermission(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permissions', id] });
    },
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => rolePermissionApiService.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] }); // Refresh roles too as they might have this permission
    },
  });
};

export const usePermissionsByResource = (resource: string, enabled = true) => {
  return useQuery({
    queryKey: ['permissions', 'by-resource', resource],
    queryFn: () => rolePermissionApiService.getPermissionsByResource(resource),
    enabled: !!resource && enabled,
  });
};
