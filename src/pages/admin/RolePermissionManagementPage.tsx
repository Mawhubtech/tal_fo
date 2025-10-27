/**
 * RolePermissionManagementPage - Comprehensive admin interface for managing roles and permissions
 * 
 * Features:
 * - View all roles and permissions
 * - Create new roles with permission assignments
 * - Edit existing roles and their permissions
 * - Delete roles (with safety checks)
 * - Create new permissions for the system
 * - Edit existing permissions
 * - Delete permissions (with safety checks)
 * - Toggle role active/inactive status
 * - Assign/remove permissions to/from roles
 * - View permissions grouped by resource
 * - Real-time updates and validation
 * - Responsive design with loading states and error handling
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Settings,
  AlertCircle,
  Check,
  X,
  Power,
  PowerOff
} from 'lucide-react';
import { 
  useRoles,
  usePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useToggleRoleStatus,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
  useAssignPermissionToRole,
  useRemovePermissionFromRole
} from '../../hooks/useRolePermissions';
import { type Role, type Permission, type CreateRoleData, type UpdateRoleData, type CreatePermissionData, type UpdatePermissionData } from '../../services/rolePermissionApiService';
import ToastContainer, { toast } from '../../components/ToastContainer';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null;
  permissions: Permission[];
  onSubmit: (data: CreateRoleData | UpdateRoleData) => void;
  isLoading: boolean;
  isEditing?: boolean;
}

const RoleModal: React.FC<RoleModalProps> = ({
  isOpen,
  onClose,
  role,
  permissions,
  onSubmit,
  isLoading,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[]
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && role) {
        setFormData({
          name: role.name,
          description: role.description || '',
          permissionIds: role.permissions?.map(p => p.id) || []
        });
      } else {
        setFormData({
          name: '',
          description: '',
          permissionIds: []
        });
      }
    }
  }, [isOpen, isEditing, role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      permissionIds: formData.permissionIds.length > 0 ? formData.permissionIds : undefined
    });
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId]
    }));
  };

  if (!isOpen) return null;

  // Group permissions by resource
  const permissionsByResource = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Role' : 'Create New Role'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., jobseeker, company-hr, freelance-hr"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="Describe the role and its purpose..."
              />
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Permissions</h4>
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {Object.entries(permissionsByResource).map(([resource, resourcePermissions]) => (
                <div key={resource} className="mb-6 last:mb-0">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 capitalize bg-gray-50 px-3 py-2 rounded">
                    {resource}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                    {resourcePermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`permission-${permission.id}`}
                          checked={formData.permissionIds.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor={`permission-${permission.id}`} className="ml-2 text-sm text-gray-700">
                          <span className="font-medium">{permission.action}</span>
                          {permission.description && (
                            <span className="text-gray-500 ml-1">- {permission.description}</span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {permissions.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No permissions available</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 disabled:opacity-50"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission?: Permission | null;
  onSubmit: (data: CreatePermissionData | UpdatePermissionData) => void;
  isLoading: boolean;
  isEditing?: boolean;
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  permission,
  onSubmit,
  isLoading,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    resource: '',
    action: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && permission) {
        setFormData({
          name: permission.name,
          resource: permission.resource,
          action: permission.action,
          description: permission.description || ''
        });
      } else {
        setFormData({
          name: '',
          resource: '',
          action: '',
          description: ''
        });
      }
    }
  }, [isOpen, isEditing, permission]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.resource.trim() || !formData.action.trim()) return;
    
    onSubmit({
      name: formData.name.trim(),
      resource: formData.resource.trim().toLowerCase(),
      action: formData.action.trim().toLowerCase(),
      description: formData.description.trim() || undefined
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Permission' : 'Create New Permission'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permission Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Create User, View Reports"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource *
            </label>
            <input
              type="text"
              value={formData.resource}
              onChange={(e) => setFormData(prev => ({ ...prev, resource: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., users, jobs, clients"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action *
            </label>
            <input
              type="text"
              value={formData.action}
              onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., create, read, update, delete"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Describe what this permission allows..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 disabled:opacity-50"
              disabled={isLoading || !formData.name.trim() || !formData.resource.trim() || !formData.action.trim()}
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Permission' : 'Create Permission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RolePermissionManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // API hooks
  const { data: rolesData, isLoading: isLoadingRoles, error: rolesError } = useRoles();
  const { data: permissionsData, isLoading: isLoadingPermissions, error: permissionsError } = usePermissions();

  // Mutation hooks
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const toggleRoleStatus = useToggleRoleStatus();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();

  const roles = rolesData?.roles || [];
  const permissions = permissionsData?.permissions || [];

  // Filter data based on search
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleCreateRole = async (data: CreateRoleData) => {
    try {
      await createRole.mutateAsync(data);
      toast.success('Role Created', 'New role has been created successfully.');
      setIsRoleModalOpen(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to create role. Please try again.';
      toast.error('Creation Failed', errorMessage);
    }
  };

  const handleUpdateRole = async (data: UpdateRoleData) => {
    if (!selectedRole) return;
    
    try {
      await updateRole.mutateAsync({ id: selectedRole.id, data });
      toast.success('Role Updated', 'Role has been updated successfully.');
      setIsRoleModalOpen(false);
      setSelectedRole(null);
      setIsEditing(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update role. Please try again.';
      toast.error('Update Failed', errorMessage);
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!window.confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteRole.mutateAsync(roleId);
      toast.success('Role Deleted', 'Role has been deleted successfully.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to delete role. Please try again.';
      toast.error('Delete Failed', errorMessage);
    }
  };

  const handleToggleRoleStatus = async (roleId: string) => {
    try {
      await toggleRoleStatus.mutateAsync(roleId);
      toast.success('Status Updated', 'Role status has been updated successfully.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update role status. Please try again.';
      toast.error('Status Update Failed', errorMessage);
    }
  };

  const handleCreatePermission = async (data: CreatePermissionData) => {
    try {
      await createPermission.mutateAsync(data);
      toast.success('Permission Created', 'New permission has been created successfully.');
      setIsPermissionModalOpen(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to create permission. Please try again.';
      toast.error('Creation Failed', errorMessage);
    }
  };

  const handleUpdatePermission = async (data: UpdatePermissionData) => {
    if (!selectedPermission) return;
    
    try {
      await updatePermission.mutateAsync({ id: selectedPermission.id, data });
      toast.success('Permission Updated', 'Permission has been updated successfully.');
      setIsPermissionModalOpen(false);
      setSelectedPermission(null);
      setIsEditing(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update permission. Please try again.';
      toast.error('Update Failed', errorMessage);
    }
  };

  const handleDeletePermission = async (permissionId: string, permissionName: string) => {
    if (!window.confirm(`Are you sure you want to delete the permission "${permissionName}"? This action cannot be undone and will remove this permission from all roles.`)) {
      return;
    }
    
    try {
      await deletePermission.mutateAsync(permissionId);
      toast.success('Permission Deleted', 'Permission has been deleted successfully.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to delete permission. Please try again.';
      toast.error('Delete Failed', errorMessage);
    }
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditing(true);
    setIsRoleModalOpen(true);
  };

  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsEditing(true);
    setIsPermissionModalOpen(true);
  };

  const handleCreateNewRole = () => {
    setSelectedRole(null);
    setIsEditing(false);
    setIsRoleModalOpen(true);
  };

  const handleCreateNewPermission = () => {
    setSelectedPermission(null);
    setIsEditing(false);
    setIsPermissionModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsRoleModalOpen(false);
    setIsPermissionModalOpen(false);
    setSelectedRole(null);
    setSelectedPermission(null);
    setIsEditing(false);
  };

  const getRoleBadge = (roleName: string) => {
    const badges = {
      'super-admin': 'bg-purple-100 text-purple-800',
      'admin': 'bg-primary-100 text-primary-800',
      'freelance-hr': 'bg-blue-100 text-blue-800',
      'company-hr': 'bg-green-100 text-green-800',
      'jobseeker': 'bg-orange-100 text-orange-800',
      'user': 'bg-gray-100 text-gray-800'
    };
    return badges[roleName as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role & Permission Management</h1>
          <p className="text-gray-600">Manage system roles and permissions for your platform</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Roles ({roles.length})
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Key className="w-4 h-4 inline mr-2" />
            Permissions ({permissions.length})
          </button>
        </nav>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <button
          onClick={activeTab === 'roles' ? handleCreateNewRole : handleCreateNewPermission}
          disabled={activeTab === 'roles' ? createRole.isPending : createPermission.isPending}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'roles' ? (
            createRole.isPending ? 'Creating...' : 'Add Role'
          ) : (
            createPermission.isPending ? 'Creating...' : 'Add Permission'
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'roles' ? (
        /* Roles Table */
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {isLoadingRoles ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <span>Loading roles...</span>
              </div>
            </div>
          ) : rolesError ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle className="w-6 h-6" />
                <span>Failed to load roles. Please try again.</span>
              </div>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No roles found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or create a new role</p>
              </div>
            </div>
          ) : (
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
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRoles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(role.name)} mr-3`}>
                              {role.name}
                            </span>
                          </div>
                          {role.description && (
                            <div className="text-sm text-gray-500 mt-1">{role.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {role.isActive ? (
                            <div className="flex items-center text-green-700">
                              <Power className="w-4 h-4 mr-1" />
                              <span className="text-sm">Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-700">
                              <PowerOff className="w-4 h-4 mr-1" />
                              <span className="text-sm">Inactive</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {role.permissions?.slice(0, 3).map((permission) => (
                            <span
                              key={permission.id}
                              className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                            >
                              {permission.resource}:{permission.action}
                            </span>
                          )) || <span className="text-gray-400 text-sm">No permissions</span>}
                          {role.permissions && role.permissions.length > 3 && (
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{role.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(role.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleRoleStatus(role.id)}
                            className={`px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1 ${
                              role.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                            }`}
                            title={role.isActive ? 'Deactivate Role' : 'Activate Role'}
                          >
                            {role.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleEditRole(role)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                            title="Edit Role"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-red-600 hover:text-red-700 flex items-center gap-1"
                            title="Delete Role"
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
          )}
        </div>
      ) : (
        /* Permissions Table */
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {isLoadingPermissions ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <span>Loading permissions...</span>
              </div>
            </div>
          ) : permissionsError ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle className="w-6 h-6" />
                <span>Failed to load permissions. Please try again.</span>
              </div>
            </div>
          ) : filteredPermissions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Key className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No permissions found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or create a new permission</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
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
                  {filteredPermissions.map((permission) => (
                    <tr key={permission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                          {permission.description && (
                            <div className="text-sm text-gray-500">{permission.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {permission.resource}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {permission.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(permission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditPermission(permission)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                            title="Edit Permission"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePermission(permission.id, permission.name)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-red-600 hover:text-red-700 flex items-center gap-1"
                            title="Delete Permission"
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
          )}
        </div>
      )}

      {/* Role Modal */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={handleCloseModals}
        role={selectedRole}
        permissions={permissions}
        onSubmit={isEditing ? handleUpdateRole : handleCreateRole}
        isLoading={isEditing ? updateRole.isPending : createRole.isPending}
        isEditing={isEditing}
      />

      {/* Permission Modal */}
      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={handleCloseModals}
        permission={selectedPermission}
        onSubmit={isEditing ? handleUpdatePermission : handleCreatePermission}
        isLoading={isEditing ? updatePermission.isPending : createPermission.isPending}
        isEditing={isEditing}
      />

      {/* Toast Container */}
      <ToastContainer position="top-right" />
    </div>
  );
};

export default RolePermissionManagementPage;
