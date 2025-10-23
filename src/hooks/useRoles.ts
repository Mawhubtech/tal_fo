import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignPermissionsToRole,
  removePermissionsFromRole,
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  type RoleQueryParams,
  type PermissionQueryParams,
  type CreateRoleData,
  type UpdateRoleData,
  type CreatePermissionData,
  type UpdatePermissionData
} from '../services/roleApiService';

// Role hooks
export const useRoles = (params: RoleQueryParams = {}) => {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => getRoles(params),
  });
};

export const useRole = (id: string) => {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => getRoleById(id),
    enabled: !!id,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, roleData }: { id: string; roleData: UpdateRoleData }) =>
      updateRole(id, roleData),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', id] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

export const useAssignPermissionsToRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      assignPermissionsToRole(roleId, permissionIds),
    onSuccess: (data, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', roleId] });
    },
  });
};

export const useRemovePermissionsFromRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      removePermissionsFromRole(roleId, permissionIds),
    onSuccess: (data, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', roleId] });
    },
  });
};

// Permission hooks
export const usePermissions = (params: PermissionQueryParams = {}) => {
  return useQuery({
    queryKey: ['permissions', params],
    queryFn: () => getPermissions(params),
  });
};

export const usePermission = (id: string) => {
  return useQuery({
    queryKey: ['permission', id],
    queryFn: () => getPermissionById(id),
    enabled: !!id,
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, permissionData }: { id: string; permissionData: UpdatePermissionData }) =>
      updatePermission(id, permissionData),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permission', id] });
    },
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
  });
};
