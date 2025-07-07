/**
 * TeamManagementPage - Interface for managing team members and their client access
 *
 * Features:
 * - Create new team members (restricted roles based on current user)
 * - View and manage existing team members
 * - Edit and delete team members
 * - Assign team members to clients/organizations
 * - Bulk actions for client assignments
 * - Role-based access control (admin and super-admin only)
 * - Filtering and search capabilities
 *
 * Restrictions:
 * - Users cannot create super-admin or admin roles (unless they are super-admin)
 * - Only shows team members created by or assigned to the current user
 * - Pricing tier limits (to be implemented later)
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Users, Building, Link as LinkIcon, Search, Filter,
  MoreHorizontal, Edit, Plus, X, Check, AlertCircle, User,
  ChevronRight, UserCheck, Crown, Settings, RefreshCw,
  CheckSquare, Trash2, UserPlus, Shield, Eye, ChevronLeft
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useAssignClient,
  useRemoveClient,
  useRoles,
  useUpdateUserStatus,
  useSendPasswordReset,
  useSendEmailVerification,
  useArchiveUser,
  useRestoreUser
} from '../../hooks/useAdminUsers';
import { useClients } from '../../hooks/useOrganizations';
import { useAuthContext } from '../../contexts/AuthContext';
import { UserModal } from '../../components/UserModal';
import { UserDetailsModal } from '../../components/UserDetailsModal';
import ToastContainer, { toast } from '../../components/ToastContainer';

interface UserWithClients {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  avatar?: string;
  clients: {
    id: string;
    name: string;
    industry?: string;
  }[];
  roles: {
    id: string;
    name: string;
  }[];
}

const TeamManagementPage: React.FC = () => {
  const { user: currentUser } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'super-admin'>('all');
  const [clientFilter, setClientFilter] = useState<'all' | 'has-access' | 'no-access'>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithClients | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithClients | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Check if current user has admin permissions
  const isAdmin = currentUser?.roles?.some(role =>
    role.name === 'admin' || role.name === 'super-admin'
  );

  const isSuperAdmin = currentUser?.roles?.some(role =>
    role.name === 'super-admin'
  );

  // Redirect if user doesn't have admin permissions
  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      // Redirect would be handled by route protection
    }
  }, [isAdmin]);

  // API hooks
  const { data: usersResponse, isLoading: loadingUsers, error: usersError, refetch: refetchUsers } = useUsers();
  const { data: allClients = [], isLoading: loadingClients } = useClients();
  const { data: roles = [] } = useRoles();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const assignClientMutation = useAssignClient();
  const removeClientMutation = useRemoveClient();
  const updateUserStatusMutation = useUpdateUserStatus();
  const sendPasswordResetMutation = useSendPasswordReset();
  const sendEmailVerificationMutation = useSendEmailVerification();
  const archiveUserMutation = useArchiveUser();
  const restoreUserMutation = useRestoreUser();

  // Extract users and roles from response
  const users = usersResponse?.users || [];
  const availableRoles = Array.isArray(roles) ? roles : roles?.roles || [];

  // Convert users to include client information and filter based on role restrictions
  const usersWithClients: UserWithClients[] = users
    .map(user => ({
      ...user,
      clients: (user.clients || []).map(client => ({
        id: client.id,
        name: client.name,
        industry: 'N/A' // Default value since client doesn't have industry
      }))
    }))
    .filter(user => {
      // If user is not super-admin, hide other super-admins and admins from non-super-admins
      if (!isSuperAdmin) {
        const hasAdminRole = user.roles?.some(role =>
          role.name === 'super-admin' || role.name === 'admin'
        );
        if (hasAdminRole) return false;
      }
      return true;
    });

  // Enhanced filtering with memoization for performance
  const filteredUsers = useMemo(() => {
    return usersWithClients.filter(user => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.clients.some(client => client.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = roleFilter === 'all' ||
        user.roles.some(role => role.name === roleFilter);

      const matchesClientFilter =
        clientFilter === 'all' ||
        (clientFilter === 'has-access' && user.clients.length > 0) ||
        (clientFilter === 'no-access' && user.clients.length === 0);

      return matchesSearch && matchesRole && matchesClientFilter;
    });
  }, [usersWithClients, searchTerm, roleFilter, clientFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, clientFilter]);

  // Reset selected users when pagination changes
  useEffect(() => {
    setSelectedUsers([]);
  }, [currentPage, itemsPerPage]);

  const handleAssignClients = async () => {
    if (!selectedUser) return;

    try {
      // Get current client IDs
      const currentClientIds = selectedUser.clients.map(c => c.id);

      // Find clients to add and remove
      const clientsToAdd = selectedClients.filter(id => !currentClientIds.includes(id));
      const clientsToRemove = currentClientIds.filter(id => !selectedClients.includes(id));

      // Add new clients
      for (const clientId of clientsToAdd) {
        await assignClientMutation.mutateAsync({ userId: selectedUser.id, clientId });
      }

      // Remove old clients
      for (const clientId of clientsToRemove) {
        await removeClientMutation.mutateAsync({ userId: selectedUser.id, clientId });
      }

      toast.success('Client assignments updated successfully!');
      setShowAssignModal(false);
      setSelectedUser(null);
      setSelectedClients([]);
      refetchUsers(); // Refresh the users list
    } catch (error) {
      console.error('Error updating client assignments:', error);
      toast.error('Failed to update client assignments. Please try again.');
    }
  };

  const handleBulkAssignClients = async () => {
    if (selectedUsers.length === 0) return;

    try {
      let successCount = 0;
      let failedCount = 0;

      // Process each user individually since we don't have a bulk endpoint
      for (const userId of selectedUsers) {
        try {
          for (const clientId of selectedClients) {
            await assignClientMutation.mutateAsync({ userId, clientId });
          }
          successCount++;
        } catch (error) {
          console.error(`Failed to assign clients to user ${userId}:`, error);
          failedCount++;
        }
      }

      if (failedCount > 0) {
        toast.success(`Updated client access for ${successCount} user${successCount > 1 ? 's' : ''}. ${failedCount} user${failedCount > 1 ? 's' : ''} failed.`);
      } else {
        toast.success(`Successfully updated client access for ${successCount} user${successCount > 1 ? 's' : ''}!`);
      }

      setShowBulkAssignModal(false);
      setSelectedUsers([]);
      setSelectedClients([]);
      setBulkMode(false);
      refetchUsers();
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      toast.error('Failed to update some client assignments. Please try again.');
    }
  };

  // Handle user creation
  const handleCreateUser = async (userData: any) => {
    try {
      await createUserMutation.mutateAsync(userData);
      toast.success('User created successfully!');
      setShowUserModal(false);
      refetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user. Please try again.');
    }
  };

  // Handle user update
  const handleUpdateUser = async (userData: any) => {
    if (!editingUser) return;

    try {
      await updateUserMutation.mutateAsync({ id: editingUser.id, userData });
      toast.success('User updated successfully!');
      setShowUserModal(false);
      setEditingUser(null);
      refetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user. Please try again.');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(userId);
      toast.success('User deleted successfully!');
      refetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. Please try again.');
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const openAssignModal = (user: UserWithClients) => {
    setSelectedUser(user);
    setSelectedClients(user.clients.map(client => client.id));
    setShowAssignModal(true);
  };

  const openBulkAssignModal = () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user first.');
      return;
    }
    setSelectedClients([]);
    setShowBulkAssignModal(true);
  };

  const getUserRoleBadge = (roles: { name: string }[]) => {
    if (roles.some(role => role.name === 'super-admin')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        <Crown className="h-3 w-3 mr-1" />
        Super Admin
      </span>;
    }
    if (roles.some(role => role.name === 'admin')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Settings className="h-3 w-3 mr-1" />
        Admin
      </span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      <User className="h-3 w-3 mr-1" />
      User
    </span>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      inactive: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Inactive' },
      banned: { bg: 'bg-red-100', text: 'text-red-800', label: 'Banned' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

    return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ToastContainer />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 px-6 py-8 w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <Link
                to="/admin"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Admin
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              <span className="text-gray-900 font-medium">Team Management</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
                <p className="text-gray-600 mt-1">
                  Create and manage team members and their client access
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowUserModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add Team Member</span>
                </button>
                <button
                  onClick={() => refetchUsers()}
                  disabled={loadingUsers}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setBulkMode(!bulkMode)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${bulkMode
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>{bulkMode ? 'Exit Bulk Mode' : 'Bulk Actions'}</span>
                </button>
                {bulkMode && selectedUsers.length > 0 && (
                  <button
                    onClick={openBulkAssignModal}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>Assign Clients ({selectedUsers.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users, emails, or client names..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-0"
              >
                <option value="all">All Roles</option>
                <option value="super-admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-0"
              >
                <option value="all">All Users</option>
                <option value="has-access">Has Client Access</option>
                <option value="no-access">No Client Access</option>
              </select>
            </div>
          </div>
          {(searchTerm || roleFilter !== 'all' || clientFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>
                Showing {filteredUsers.length} of {usersWithClients.length} users
                {searchTerm && <span className="ml-1">matching "{searchTerm}"</span>}
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setClientFilter('all');
                }}
                className="ml-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Users List */}
        {loadingUsers ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : usersError ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
            <p className="text-gray-600 mb-6">Failed to load users. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mx-auto"
            >
              <span>Refresh Page</span>
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || roleFilter !== 'all' ? 'No users match your search' : 'No users found'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || roleFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'No users are currently in the system.'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Users & Client Access</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {filteredUsers.length > itemsPerPage && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Items per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {bulkMode && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                          onChange={(e) => handleSelectAllUsers(e.target.checked)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Access
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      {bulkMode && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.avatar ? (
                              <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {user.firstName[0]}{user.lastName[0]}
                                </span>
                              </div>
                            )}
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
                        {getUserRoleBadge(user.roles)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4">
                        {user.clients.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.clients.slice(0, 3).map((client) => (
                              <span
                                key={client.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                <Building className="h-3 w-3 mr-1" />
                                {client.name}
                              </span>
                            ))}
                            {user.clients.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                +{user.clients.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 italic">No client access</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1 lg:space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailsModal(true);
                            }}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3 lg:mr-1" />
                            <span className="hidden lg:inline">View</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserModal(true);
                            }}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            title="Edit User"
                          >
                            <Edit className="h-3 w-3 lg:mr-1" />
                            <span className="hidden lg:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => openAssignModal(user)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded hover:bg-purple-200 transition-colors"
                            title="Manage Client Access"
                          >
                            <LinkIcon className="h-3 w-3 lg:mr-1" />
                            <span className="hidden lg:inline">Clients</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-3 w-3 lg:mr-1" />
                            <span className="hidden lg:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 7) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 4) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 3) {
                          pageNumber = totalPages - 6 + i;
                        } else {
                          pageNumber = currentPage - 3 + i;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              currentPage === pageNumber
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assign Clients Modal */}
        {showAssignModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Manage Client Access - {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedUser(null);
                      setSelectedClients([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Select which clients/organizations {selectedUser.firstName} should have access to:
                    </p>
                  </div>

                  {loadingClients ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="text-sm mt-2">Loading clients...</p>
                    </div>
                  ) : allClients.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3">
                      {allClients.map((client: any) => (
                        <label key={client.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedClients.includes(client.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedClients([...selectedClients, client.id]);
                              } else {
                                setSelectedClients(selectedClients.filter(id => id !== client.id));
                              }
                            }}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <Building className="h-5 w-5 text-gray-500" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{client.name}</div>
                            {client.industry && (
                              <div className="text-xs text-gray-500">{client.industry}</div>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {client.status}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                      <Building className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="font-medium">No Clients Available</p>
                      <p className="text-sm">Create a client first to assign them to a user.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignClients}
                  className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  disabled={assignClientMutation.isPending || removeClientMutation.isPending}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for Bulk Assign Modal */}
        {showBulkAssignModal && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             {/* A full implementation would be similar to the Assign Clients Modal but for multiple users */}
             <div className="bg-white rounded-lg shadow-xl p-6">
                <h3 className="text-lg font-bold mb-4">Bulk Assign Clients</h3>
                <p>This is where the bulk client assignment UI would go.</p>
                <p className="my-4">Selected Users: {selectedUsers.length}</p>
                 <button onClick={handleBulkAssignClients} className="bg-blue-500 text-white p-2 rounded mr-2">Confirm Bulk Assign</button>
                <button onClick={() => setShowBulkAssignModal(false)} className="bg-gray-300 p-2 rounded">Close</button>
             </div>
           </div>
        )}

        {/* Placeholder for User Modal */}
        {showUserModal && (
          <UserModal
            isOpen={showUserModal}
            onClose={() => {
              setShowUserModal(false);
              setEditingUser(null);
            }}
            onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
            isLoading={createUserMutation.isPending || updateUserMutation.isPending}
            user={editingUser ? {
              ...editingUser,
              status: editingUser.status as 'active' | 'inactive' | 'banned',
              provider: 'local' as const,
              isEmailVerified: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              clients: editingUser.clients.map(client => ({
                ...client,
                createdAt: new Date().toISOString()
              }))
            } : null}
            isEditing={!!editingUser}
            roles={availableRoles}
          />
        )}
        
        {/* Placeholder for User Details Modal */}
        {showDetailsModal && selectedUser && (
          <UserDetailsModal 
             isOpen={showDetailsModal}
             onClose={() => {
                setShowDetailsModal(false);
                setSelectedUser(null);
             }}
             user={{
               ...selectedUser,
               status: selectedUser.status as 'active' | 'inactive' | 'banned',
               provider: 'local' as const,
               isEmailVerified: true,
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString(),
               clients: selectedUser.clients.map(client => ({
                 ...client,
                 createdAt: new Date().toISOString()
               }))
             }}
             onEdit={(user) => {
               setEditingUser(selectedUser);
               setShowUserModal(true);
               setShowDetailsModal(false);
             }}
             onDelete={handleDeleteUser}
             onArchive={(userId) => archiveUserMutation.mutate(userId)}
             onRestore={(userId) => restoreUserMutation.mutate(userId)}
             onStatusChange={(userId, status) => updateUserStatusMutation.mutate({ id: userId, status })}
             onSendPasswordReset={(userId) => sendPasswordResetMutation.mutate(userId)}
             onSendEmailVerification={(userId) => sendEmailVerificationMutation.mutate(userId)}
          />
        )}
        </div>
      </div>
    </div>
  );
};

export default TeamManagementPage;