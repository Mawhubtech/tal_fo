/**
 * RoleManagementPage - Comprehensive admin interface for managing roles and permissions
 * 
 * Features:
 * - View all roles with permissions and user counts
 * - Create new roles with permission assignments
 * - Edit existing roles (name, description, permissions, status)
 * - Delete roles (with confirmation and user count check)
 * - Manage permissions (create, edit, delete)
 * - Assign/remove permissions to/from roles
 * - Search and filter roles and permissions
 * - Responsive design with loading states and error handling
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Key,
  MoreVertical,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
  useAssignPermissionsToRole,
  useRemovePermissionsFromRole
} from '../../hooks/useRoles';
import { type Role, type Permission, type CreateRoleData, type UpdateRoleData, type CreatePermissionData } from '../../services/roleApiService';
import { RoleModal } from '../../components/RoleModal';
import { PermissionModal } from '../../components/PermissionModal';
import { RolePermissionModal } from '../../components/RolePermissionModal';
import ToastContainer, { toast } from '../../components/ToastContainer';

const RoleManagementPage: React.FC = () => {
  // State for filters and modals
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isRolePermissionModalOpen, setIsRolePermissionModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, activeTab]);

  // Prepare query params
  const roleQueryParams = {
    search: debouncedSearchTerm || undefined,
    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    page: currentPage,
    limit: pageSize,
  };

  const permissionQueryParams = {
    search: debouncedSearchTerm || undefined,
    page: currentPage,
    limit: pageSize,
  };

  // API hooks
  const { data: rolesData, isLoading: isLoadingRoles, error: rolesError } = useRoles(roleQueryParams);
  const { data: permissionsData, isLoading: isLoadingPermissions, error: permissionsError } = usePermissions(permissionQueryParams);

  // Mutation hooks
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();
  const assignPermissions = useAssignPermissionsToRole();
  const removePermissions = useRemovePermissionsFromRole();

  // Extract data from API responses
  const roles = rolesData?.roles || [];
  const totalRoles = rolesData?.total || 0;
  const permissions = permissionsData?.permissions || [];
  const totalPermissions = permissionsData?.total || 0;
  
  // Get all permissions for role modal
  const { data: allPermissionsData } = usePermissions({ limit: 100 }); // Get all permissions (max limit 100)
  const allPermissions = allPermissionsData?.permissions || [];
  
  const totalPages = activeTab === 'roles' 
    ? Math.ceil(totalRoles / pageSize)
    : Math.ceil(totalPermissions / pageSize);

  // Handlers for roles
  const handleCreateRole = async (roleData: CreateRoleData) => {
    try {
      await createRole.mutateAsync(roleData);
      toast.success('Role Created', 'New role has been created successfully.');
      setIsRoleModalOpen(false);
      setSelectedRole(null);
      setIsEditing(false);
    } catch (error) {
      toast.error('Creation Failed', 'Failed to create role. Please try again.');
    }
  };

  const handleUpdateRole = async (roleData: UpdateRoleData) => {
    if (!selectedRole) return;
    
    try {
      await updateRole.mutateAsync({ id: selectedRole.id, roleData });
      toast.success('Role Updated', 'Role has been updated successfully.');
      setIsRoleModalOpen(false);
      setSelectedRole(null);
      setIsEditing(false);
    } catch (error) {
      toast.error('Update Failed', 'Failed to update role. Please try again.');
    }
  };

  const handleDeleteRole = async (role: Role) => {
    const userCount = role._count?.users || 0;
    
    if (userCount > 0) {
      toast.error('Cannot Delete', `This role is assigned to ${userCount} user(s). Please reassign users before deleting.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteRole.mutateAsync(role.id);
      toast.success('Role Deleted', 'Role has been deleted successfully.');
    } catch (error) {
      toast.error('Delete Failed', 'Failed to delete role. Please try again.');
    }
  };

  // Handlers for permissions
  const handleCreatePermission = async (permissionData: CreatePermissionData) => {
    try {
      await createPermission.mutateAsync(permissionData);
      toast.success('Permission Created', 'New permission has been created successfully.');
      setIsPermissionModalOpen(false);
      setSelectedPermission(null);
      setIsEditing(false);
    } catch (error) {
      toast.error('Creation Failed', 'Failed to create permission. Please try again.');
    }
  };

  const handleDeletePermission = async (permission: Permission) => {
    if (!window.confirm(`Are you sure you want to delete the permission "${permission.resource}:${permission.action}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deletePermission.mutateAsync(permission.id);
      toast.success('Permission Deleted', 'Permission has been deleted successfully.');
    } catch (error) {
      toast.error('Delete Failed', 'Failed to delete permission. Please try again.');
    }
  };

  // Modal handlers
  const handleCreateNewRole = () => {
    setSelectedRole(null);
    setIsEditing(false);
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditing(true);
    setIsRoleModalOpen(true);
  };

  const handleManageRolePermissions = (role: Role) => {
    setSelectedRoleForPermissions(role);
    setIsRolePermissionModalOpen(true);
  };

  const handleSaveRolePermissions = async (roleId: string, permissionIds: string[]) => {
    try {
      // First remove all current permissions
      if (selectedRoleForPermissions?.permissions) {
        const currentPermissionIds = selectedRoleForPermissions.permissions.map(p => p.id);
        if (currentPermissionIds.length > 0) {
          await removePermissions.mutateAsync({ roleId, permissionIds: currentPermissionIds });
        }
      }
      
      // Then assign new permissions
      if (permissionIds.length > 0) {
        await assignPermissions.mutateAsync({ roleId, permissionIds });
      }
      
      toast.success('Permissions Updated', 'Role permissions have been updated successfully.');
      setIsRolePermissionModalOpen(false);
      setSelectedRoleForPermissions(null);
    } catch (error) {
      toast.error('Update Failed', 'Failed to update role permissions. Please try again.');
    }
  };

  const handleCreateNewPermission = () => {
    setSelectedPermission(null);
    setIsEditing(false);
    setIsPermissionModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsRoleModalOpen(false);
    setIsPermissionModalOpen(false);
    setIsRolePermissionModalOpen(false);
    setSelectedRole(null);
    setSelectedPermission(null);
    setSelectedRoleForPermissions(null);
    setIsEditing(false);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive 
      ? <CheckCircle className="w-4 h-4 text-green-600" />
      : <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role & Permission Management</h1>
          <p className="text-gray-600 mt-1">Manage user roles and their permissions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Roles ({totalRoles})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>Permissions ({totalPermissions})</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none"
            />
          </div>
          
          {/* Status Filter (only for roles) */}
          {activeTab === 'roles' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
        </div>
        
        <button
          onClick={activeTab === 'roles' ? handleCreateNewRole : handleCreateNewPermission}
          disabled={createRole.isPending || createPermission.isPending}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'roles' ? 'Add Role' : 'Add Permission'}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'roles' ? (
        <RolesTable
          roles={roles}
          isLoading={isLoadingRoles}
          error={rolesError}
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
          onManagePermissions={handleManageRolePermissions}
          getStatusBadge={getStatusBadge}
          getStatusIcon={getStatusIcon}
        />
      ) : (
        <PermissionsTable
          permissions={permissions}
          isLoading={isLoadingPermissions}
          error={permissionsError}
          onDelete={handleDeletePermission}
        />
      )}

      {/* Pagination */}
      <div className="bg-white px-6 py-3 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * pageSize, activeTab === 'roles' ? totalRoles : totalPermissions)}</span> of{' '}
            <span className="font-medium">{activeTab === 'roles' ? totalRoles : totalPermissions}</span> results
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1 || (activeTab === 'roles' ? isLoadingRoles : isLoadingPermissions)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages || (activeTab === 'roles' ? isLoadingRoles : isLoadingPermissions)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Role Modal */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={handleCloseModals}
        onSubmit={isEditing ? handleUpdateRole : handleCreateRole}
        isLoading={isEditing ? updateRole.isPending : createRole.isPending}
        role={isEditing ? selectedRole : null}
        isEditing={isEditing}
        permissions={allPermissions}
      />

      {/* Permission Modal */}
      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleCreatePermission}
        isLoading={createPermission.isPending}
        permission={selectedPermission}
        isEditing={false}
      />

      {/* Role Permission Assigner Modal */}
      <RolePermissionModal
        isOpen={isRolePermissionModalOpen}
        onClose={handleCloseModals}
        role={selectedRoleForPermissions}
        permissions={allPermissions}
        onSave={handleSaveRolePermissions}
        isLoading={assignPermissions.isPending || removePermissions.isPending}
      />

      {/* Toast Container */}
      <ToastContainer position="top-right" />
    </div>
  );
};

// Roles Table Component
interface RolesTableProps {
  roles: Role[];
  isLoading: boolean;
  error: any;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onManagePermissions: (role: Role) => void;
  getStatusBadge: (isActive: boolean) => string;
  getStatusIcon: (isActive: boolean) => React.ReactNode;
}

const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  isLoading,
  error,
  onEdit,
  onDelete,
  onManagePermissions,
  getStatusBadge,
  getStatusIcon
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span>Loading roles...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="w-6 h-6" />
            <span>Failed to load roles. Please try again.</span>
          </div>
        </div>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No roles found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(role.isActive)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(role.isActive)}`}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{role.permissions?.length || 0} permissions</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{role._count?.users || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(role.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => onManagePermissions(role)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      title="Manage Permissions"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Permissions</span>
                    </button>
                    <button 
                      onClick={() => onEdit(role)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                      title="Edit Role"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(role)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-red-600 hover:text-red-700 flex items-center gap-1"
                      title="Delete Role"
                      disabled={role._count?.users && role._count.users > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Permissions Table Component
interface PermissionsTableProps {
  permissions: Permission[];
  isLoading: boolean;
  error: any;
  onDelete: (permission: Permission) => void;
}

const PermissionsTable: React.FC<PermissionsTableProps> = ({
  permissions,
  isLoading,
  error,
  onDelete
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span>Loading permissions...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="w-6 h-6" />
            <span>Failed to load permissions. Please try again.</span>
          </div>
        </div>
      </div>
    );
  }

  if (permissions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No permissions found</p>
            <p className="text-sm text-gray-400">Try adjusting your search</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {permissions.map((permission) => (
              <tr key={permission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{permission.resource}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{permission.action}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{permission.description || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(permission.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => onDelete(permission)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-red-600 hover:text-red-700 flex items-center gap-1"
                    title="Delete Permission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleManagementPage;
