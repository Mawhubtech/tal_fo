/**
 * UserManagementPage - Comprehensive admin interface for managing users
 * 
 * Features:
 * - View all users with pagination, search, and filters
 * - Create new users with role assignments
 * - Edit existing users (all fields including roles)
 * - View detailed user information including jobs and organizations
 * - Archive/restore users  
 * - Delete users (with confirmation)
 * - Update user status (active/inactive/banned)
 * - Send password reset and email verification
 * - Real-time statistics display
 * - Role management (jobseeker, company-hr, freelance-hr, admin, super-admin)
 * - Display associated clients (read-only)
 * - Responsive design with loading states and error handling
 * 
 * Note: Client management is handled on a separate page - this is for TAL platform admin use only
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck, 
  UserX,
  MoreVertical,
  Eye,
  Archive,
  RotateCcw,
  AlertCircle,
  Key
} from 'lucide-react';
import { 
  useUsers, 
  useUserStats, 
  useRoles,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useArchiveUser,
  useRestoreUser,
  useUpdateUserStatus,
  useSendPasswordReset,
  useSendEmailVerification,
  useAssignRole,
  useRemoveRole
} from '../../hooks/useAdminUsers';
import { useQueryClient } from '@tanstack/react-query';
import { adminUserKeys } from '../../hooks/useAdminUsers';
import { type User, type CreateUserData, type UpdateUserData, type UserQueryParams } from '../../services/adminUserApiService';
import { UserModal } from '../../components/UserModal';
import { UserDetailsModal } from '../../components/UserDetailsModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import ToastContainer, { toast } from '../../components/ToastContainer';
import { useAuthContext } from '../../contexts/AuthContext';
import { isSuperAdmin } from '../../utils/roleUtils';

const UserManagementPage: React.FC = () => {
  // Query client for manual invalidation
  const queryClient = useQueryClient();
  
  // Get current user from auth context to check permissions
  const { user: currentUser } = useAuthContext();
  const isCurrentUserSuperAdmin = isSuperAdmin(currentUser);
  
  // State for filters and modals
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, roleFilter]);

  // Prepare query params
  const queryParams: UserQueryParams = {
    search: debouncedSearchTerm || undefined,
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    page: currentPage,
    limit: pageSize,
  };

  // API hooks
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useUsers(queryParams);
  const { data: stats, isLoading: isLoadingStats } = useUserStats();
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();

  // Mutation hooks
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const archiveUser = useArchiveUser();
  const restoreUser = useRestoreUser();
  const updateUserStatus = useUpdateUserStatus();
  const sendPasswordReset = useSendPasswordReset();
  const sendEmailVerification = useSendEmailVerification();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  // Extract users and pagination from API response
  const users = usersData?.users || [];
  const totalUsers = usersData?.total || 0;
  const totalPages = Math.ceil(totalUsers / pageSize);

  // Extract roles from API responses
  const roles = rolesData?.roles || [];

  // Filter roles based on current user permissions
  // Only super admins can assign super admin roles to other users
  // Note: Super admins see ALL roles in the modal, but this filtering is used for the dropdown filter only
  const availableRoles = Array.isArray(roles) ? 
    roles.filter(role => {
      // Super admins can assign any role including super admin
      if (isCurrentUserSuperAdmin) {
        return true;
      }
      // Non-super admins cannot assign super admin roles
      // This prevents privilege escalation while allowing admins to manage other roles
      return role.name !== 'super-admin';
    }) : [];

  // Helper function to force refresh all data
  const forceRefreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
      queryClient.refetchQueries({ queryKey: adminUserKeys.users(queryParams) }),
      queryClient.refetchQueries({ queryKey: adminUserKeys.stats() }),
      queryClient.refetchQueries({ queryKey: adminUserKeys.roles() })
    ]);
  };

  // Handlers
  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      await createUser.mutateAsync(userData);
      // Force immediate refresh of all user-related data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
        queryClient.refetchQueries({ queryKey: adminUserKeys.users(queryParams) }),
        queryClient.refetchQueries({ queryKey: adminUserKeys.stats() })
      ]);
      toast.success('User Created', 'New user has been created successfully.');
      setIsUserModalOpen(false);
    } catch (error) {
      toast.error('Creation Failed', 'Failed to create user. Please try again.');
    }
  };

  const handleUpdateUser = async (userData: UpdateUserData) => {
    if (!selectedUser) return;
    
    try {
      await updateUser.mutateAsync({ id: selectedUser.id, userData });
      // Force immediate refresh of all user-related data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
        queryClient.refetchQueries({ queryKey: adminUserKeys.users(queryParams) }),
        queryClient.refetchQueries({ queryKey: adminUserKeys.stats() })
      ]);
      toast.success('User Updated', 'User information has been updated successfully.');
      setIsUserModalOpen(false);
      setSelectedUser(null);
      setIsEditing(false);
    } catch (error) {
      toast.error('Update Failed', 'Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser.mutateAsync(userToDelete.id);
      // Force immediate refresh of all user-related data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
        queryClient.refetchQueries({ queryKey: adminUserKeys.users(queryParams) }),
        queryClient.refetchQueries({ queryKey: adminUserKeys.stats() })
      ]);
      toast.success('User Deleted', 'User has been deleted successfully.');
      setIsDetailsModalOpen(false);
      setSelectedUser(null);
      setUserToDelete(null);
    } catch (error: any) {
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.message || 'Failed to delete user. Please try again.';
      
      // Show more user-friendly error handling
      if (errorMessage.includes('hiring teams')) {
        toast.error(
          'Cannot Delete User', 
          'This user is assigned to hiring teams. Please remove them from all hiring teams before deleting their account.',
          6000
        );
      } else if (errorMessage.includes('companies')) {
        toast.error(
          'Cannot Delete User', 
          'This user is a member of one or more companies. Please remove them from all companies before deleting their account.',
          6000
        );
      } else if (errorMessage.includes('candidates')) {
        toast.error(
          'Cannot Delete User', 
          'This user has created candidates in the system. Please reassign or remove their candidates before deleting their account.',
          6000
        );
      } else if (errorMessage.includes('jobs')) {
        toast.error(
          'Cannot Delete User', 
          'This user has created jobs in the system. Please reassign or remove their jobs before deleting their account.',
          6000
        );
      } else {
        // Generic error message
        toast.error('Delete Failed', errorMessage);
      }
    }
  };

  const handleArchiveUser = async (userId: string) => {
    try {
      await archiveUser.mutateAsync(userId);
      // Force immediate refresh of all user-related data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
        queryClient.refetchQueries({ queryKey: adminUserKeys.users(queryParams) }),
        queryClient.refetchQueries({ queryKey: adminUserKeys.stats() })
      ]);
      toast.success('User Archived', 'User has been archived successfully.');
      setIsDetailsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error('Archive Failed', 'Failed to archive user. Please try again.');
    }
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      await restoreUser.mutateAsync(userId);
      // Force immediate refresh of all user-related data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
        queryClient.refetchQueries({ queryKey: adminUserKeys.users(queryParams) }),
        queryClient.refetchQueries({ queryKey: adminUserKeys.stats() })
      ]);
      toast.success('User Restored', 'User has been restored successfully.');
    } catch (error) {
      toast.error('Restore Failed', 'Failed to restore user. Please try again.');
    }
  };

  const handleStatusChange = async (userId: string, status: 'active' | 'inactive' | 'banned') => {
    try {
      await updateUserStatus.mutateAsync({ id: userId, status });
      // Force immediate refresh of all user-related data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
        queryClient.refetchQueries({ queryKey: adminUserKeys.users(queryParams) }),
        queryClient.refetchQueries({ queryKey: adminUserKeys.stats() })
      ]);
      toast.success('Status Updated', `User status has been changed to ${status}.`);
    } catch (error) {
      toast.error('Status Update Failed', 'Failed to update user status. Please try again.');
    }
  };

  const handleSendPasswordReset = async (userId: string) => {
    try {
      await sendPasswordReset.mutateAsync(userId);
      toast.success('Password Reset Sent', 'Password reset email has been sent to the user.');
    } catch (error) {
      toast.error('Send Failed', 'Failed to send password reset email. Please try again.');
    }
  };

  const handleSendEmailVerification = async (userId: string) => {
    try {
      await sendEmailVerification.mutateAsync(userId);
      toast.success('Verification Sent', 'Email verification has been sent to the user.');
    } catch (error) {
      toast.error('Send Failed', 'Failed to send email verification. Please try again.');
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
    setIsUserModalOpen(true);
  };

  const handleCreateNewUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setIsUserModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsUserModalOpen(false);
    setIsDetailsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
    setUserToDelete(null);
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      banned: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
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
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none"
            />
          </div>
          
          {/* Filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none"
            disabled={isLoadingRoles}
          >
            <option value="all">All Roles</option>
            {(isCurrentUserSuperAdmin ? roles : availableRoles).map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCreateNewUser}
            disabled={createUser.isPending}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {createUser.isPending ? 'Creating...' : 'Add User'}
          </button>
          
          <button
            onClick={forceRefreshData}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            title="Refresh Data"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoadingStats ? '...' : stats?.stats?.total || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoadingStats ? '...' : stats?.stats?.active || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserX className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoadingStats ? '...' : stats?.stats?.inactive || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoadingStats ? '...' : stats?.stats?.admins || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span>Loading users...</span>
            </div>
          </div>
        ) : usersError ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-red-500">
              <AlertCircle className="w-6 h-6" />
              <span>Failed to load users. Please try again.</span>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No users found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <span
                            key={role.id}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(role.name)}`}
                          >
                            {role.name}
                          </span>
                        )) || <span className="text-gray-400 text-sm">No roles</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.clients?.map((client) => (
                          <span
                            key={client.id}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                          >
                            {client.name}
                          </span>
                        )) || <span className="text-gray-400 text-sm">No clients</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.provider}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewDetails(user)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleSendPasswordReset(user.id)}
                          disabled={sendPasswordReset.isPending}
                          className="px-3 py-1 text-sm border border-blue-300 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Send Password Reset"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-red-600 hover:text-red-700 flex items-center gap-1"
                          title="Delete User"
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

      {/* Pagination */}
      <div className="bg-white px-6 py-3 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * pageSize, totalUsers)}</span> of{' '}
            <span className="font-medium">{totalUsers}</span> results
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1 || isLoadingUsers}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages || isLoadingUsers}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* User Modal for Create/Edit */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={handleCloseModals}
        onSubmit={isEditing ? handleUpdateUser : handleCreateUser}
        isLoading={isEditing ? updateUser.isPending : createUser.isPending}
        user={isEditing ? selectedUser : null}
        isEditing={isEditing}
        roles={isCurrentUserSuperAdmin ? roles : availableRoles}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onArchive={handleArchiveUser}
        onRestore={handleRestoreUser}
        onStatusChange={handleStatusChange}
        onSendPasswordReset={handleSendPasswordReset}
        onSendEmailVerification={handleSendEmailVerification}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}? This action cannot be undone.`}
        confirmText="Delete User"
        cancelText="Cancel"
        type="danger"
      />

      {/* Toast Container */}
      <ToastContainer position="top-right" />
    </div>
  );
};

export default UserManagementPage;
