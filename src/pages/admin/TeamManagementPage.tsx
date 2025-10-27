/**
 * TeamManagementPage - Interface for managing team members and their client access
 * 
 * Features:
 * - Create new team members
 * - View and manage existing team members
 * - Edit and delete team members
 * - Assign team members to clients/organizations
 * - Bulk actions for client assignments
 * - Pagination for large user lists
 * 
 * Restrictions:
 * - Pricing tier limits (to be implemented later)
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, Building, Link as LinkIcon, 
  MoreHorizontal, Edit, Plus, X, Check, AlertCircle, User,
  ChevronRight, UserCheck, Crown, Settings, RefreshCw, 
  CheckSquare, Trash2, UserPlus, Shield, Eye, ChevronLeft, Search
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { 
  useUsers,
  useTeamMembers,
  useCreateUser,
  useCreateTeamMember, 
  useUpdateUser,
  useDeleteUser,
  useAssignClient, 
  useRemoveClient,
  useAssignClients,
  useUpdateUserClients,
  useBulkAssignUsersToClients,
  useRoles,
  useUpdateUserStatus,
  useSendPasswordReset,
  useSendEmailVerification,
  useArchiveUser,
  useRestoreUser,
  useInviteUserToTeam,
  useClients,
  useCurrentUserClients
} from '../../hooks/useAdminUsers';
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
  
  // Check if current user is super-admin
  const isSuperAdmin = currentUser?.roles?.some(role => role.name === 'super-admin') || false;
  
  const [selectedUser, setSelectedUser] = useState<UserWithClients | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithClients | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Pagination state for users
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Client search and pagination state
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientPage, setClientPage] = useState(1);
  const [clientLimit, setClientLimit] = useState(10);

  // API hooks - pass pagination parameters
  // Super-admin sees all users, regular users see only team members
  const { data: usersResponse, isLoading: loadingUsers, error: usersError, refetch: refetchUsers } = isSuperAdmin
    ? useUsers({
        page: currentPage,
        limit: itemsPerPage
      })
    : useTeamMembers({
        page: currentPage,
        limit: itemsPerPage
      });
  
  // Super-admin sees all clients with pagination and search, regular users see only their assigned clients  
  const { data: clientsResponse, isLoading: loadingClients } = isSuperAdmin 
    ? useClients({
        page: clientPage,
        limit: clientLimit,
        search: clientSearchTerm,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      })
    : useCurrentUserClients();
    
  const { data: roles = [] } = useRoles();
  const createUserMutation = isSuperAdmin ? useCreateUser() : useCreateTeamMember();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const assignClientMutation = useAssignClient();
  const removeClientMutation = useRemoveClient();
  const assignClientsMutation = useAssignClients();
  const updateUserClientsMutation = useUpdateUserClients();
  const bulkAssignMutation = useBulkAssignUsersToClients();
  const updateUserStatusMutation = useUpdateUserStatus();
  const sendPasswordResetMutation = useSendPasswordReset();
  const sendEmailVerificationMutation = useSendEmailVerification();
  const archiveUserMutation = useArchiveUser();
  const restoreUserMutation = useRestoreUser();
  const inviteUserMutation = useInviteUserToTeam();

  // Enhanced modal behavior: ESC key and body scroll prevention
  useEffect(() => {
    const isAnyModalOpen = showAssignModal || showBulkAssignModal || showUserModal || showDetailsModal || showInviteModal;
    
    if (isAnyModalOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Handle ESC key to close modals
      const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          // Close the appropriate modal
          if (showAssignModal) {
            closeAssignModal();
          } else if (showBulkAssignModal) {
            setShowBulkAssignModal(false);
            setSelectedClients([]);
          } else if (showUserModal) {
            setShowUserModal(false);
            setEditingUser(null);
          } else if (showDetailsModal) {
            setShowDetailsModal(false);
            setSelectedUser(null);
          } else if (showInviteModal) {
            setShowInviteModal(false);
            setInviteEmail('');
          }
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      return () => {
        document.removeEventListener('keydown', handleEscKey);
        // Restore body scroll when modal closes
        document.body.style.overflow = 'unset';
      };
    }
  }, [showAssignModal, showBulkAssignModal, showUserModal, showDetailsModal, showInviteModal]);

  // Extract users and roles from response
  const users = usersResponse?.users || [];
  const totalUsers = usersResponse?.total || users.length;
  const totalPages = usersResponse?.pages || Math.ceil(totalUsers / itemsPerPage);
  const allRoles = Array.isArray(roles) ? roles : roles?.roles || [];
  
  // Extract clients from response with pagination data
  const allClients = Array.isArray(clientsResponse) ? clientsResponse : clientsResponse?.clients || [];
  const totalClients = (clientsResponse as any)?.total || allClients.length;
  const clientTotalPages = (clientsResponse as any)?.totalPages || Math.ceil((totalClients || allClients.length) / clientLimit);
  
  // Filter out admin/super-admin roles for team management context (except for super-admin users)
  const availableRoles = isSuperAdmin 
    ? allRoles // Super-admin can assign any role
    : allRoles.filter(role => 
        !['admin', 'super-admin'].includes(role.name.toLowerCase())
      );

  // Convert users to include client information
  const usersWithClients: UserWithClients[] = users
    .map(user => ({
      ...user,
      clients: (user.clients || []).map(client => ({
        id: client.id,
        name: client.name,
        industry: 'N/A' // Default value since client doesn't have industry
      }))
    }));

  // For non-super-admin users, ensure the current user is always shown in the team list
  // even if not returned by the backend (frontend-only logic)
  let displayUsers = usersWithClients;
  if (!isSuperAdmin && currentUser) {
    const currentUserExists = usersWithClients.some(user => user.id === currentUser.id);
    if (!currentUserExists) {
      // Get current user's clients from the clients response
      const currentUserClients = Array.isArray(allClients) ? allClients : [];
      
      // Add current user to the beginning of the list
      const currentUserWithClients: UserWithClients = {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        status: currentUser.status || 'active',
        avatar: currentUser.avatar,
        clients: currentUserClients.map(client => ({
          id: client.id,
          name: client.name,
          industry: 'N/A'
        })),
        roles: currentUser.roles || []
      };
      displayUsers = [currentUserWithClients, ...usersWithClients];
    }
  }

  // Pagination calculations - backend handles pagination, no need to slice
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + displayUsers.length - 1, totalUsers);
  // Use displayUsers since it includes the current user if needed
  const paginatedUsers = displayUsers;

  // Reset selected users when pagination changes
  useEffect(() => {
    setSelectedUsers([]);
  }, [currentPage, itemsPerPage]);

  // Helper function to close assign modal and reset state
  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedUser(null);
    setSelectedClients([]);
    setClientSearchTerm('');
    setClientPage(1);
  };

  // Quick assign single client to user
  const handleQuickAssignClient = async (userId: string, clientId: string) => {
    try {
      await assignClientMutation.mutateAsync({ userId, clientId });
      toast.success('Client assigned successfully!');
      refetchUsers();
    } catch (error) {
      console.error('Error assigning client:', error);
      toast.error('Failed to assign client. Please try again.');
    }
  };

  // Quick remove single client from user
  const handleQuickRemoveClient = async (userId: string, clientId: string) => {
    try {
      await removeClientMutation.mutateAsync({ userId, clientId });
      toast.success('Client access removed successfully!');
      refetchUsers();
    } catch (error) {
      console.error('Error removing client:', error);
      toast.error('Failed to remove client access. Please try again.');
    }
  };

  const handleAssignClients = async () => {
    if (!selectedUser) return;
    
    try {
      // Use the new updateUserClients method which replaces all client assignments
      await updateUserClientsMutation.mutateAsync({ 
        userId: selectedUser.id, 
        clientIds: selectedClients 
      });
      
      toast.success('Client assignments updated successfully!');
      closeAssignModal();
      refetchUsers(); // Refresh the users list
    } catch (error) {
      console.error('Error updating client assignments:', error);
      toast.error('Failed to update client assignments. Please try again.');
    }
  };

  const handleBulkAssignClients = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      const result = await bulkAssignMutation.mutateAsync({
        userIds: selectedUsers,
        clientIds: selectedClients
      });
      
      toast.success(result.message);
      setShowBulkAssignModal(false);
      setSelectedUsers([]);
      setSelectedClients([]);
      setBulkMode(false);
      refetchUsers();
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      toast.error('Failed to update client assignments. Please try again.');
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
    } catch (error: any) {
      console.error('Error deleting user:', error);
      
      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.message || 'Failed to delete user. Please try again.';
      
      // Show more user-friendly error handling
      if (errorMessage.includes('hiring teams')) {
        toast.error(
          'Cannot Delete User: This user is assigned to hiring teams. Please remove them from all hiring teams before deleting their account.'
        );
      } else if (errorMessage.includes('companies')) {
        toast.error(
          'Cannot Delete User: This user is a member of one or more companies. Please remove them from all companies before deleting their account.'
        );
      } else if (errorMessage.includes('candidates')) {
        toast.error(
          'Cannot Delete User: This user has created candidates in the system. Please reassign or remove their candidates before deleting their account.'
        );
      } else if (errorMessage.includes('jobs')) {
        toast.error(
          'Cannot Delete User: This user has created jobs in the system. Please reassign or remove their jobs before deleting their account.'
        );
      } else {
        // Generic error message
        toast.error(`Delete Failed: ${errorMessage}`);
      }
    }
  };

  // Handle user invitation
  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await inviteUserMutation.mutateAsync(inviteEmail.trim());
      toast.success('User invited to team successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      refetchUsers();
    } catch (error: any) {
      console.error('Error inviting user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to invite user. Please try again.';
      toast.error(errorMessage);
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
    if (roles.some(role => role.name === 'internal-admin')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Settings className="h-3 w-3 mr-1" />
        Organization Admin
      </span>;
    }
    if (roles.some(role => role.name === 'freelance-hr')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <User className="h-3 w-3 mr-1" />
        Freelance HR
      </span>;
    }
    if (roles.some(role => role.name === 'external-hr')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        <User className="h-3 w-3 mr-1" />
        External HR
      </span>;
    }
    if (roles.some(role => role.name === 'internal-hr')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        <User className="h-3 w-3 mr-1" />
        Internal HR
      </span>;
    }
    if (roles.some(role => role.name === 'external-user')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
        <User className="h-3 w-3 mr-1" />
        External User
      </span>;
    }
    if (roles.some(role => role.name === 'jobseeker')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
        <User className="h-3 w-3 mr-1" />
        Job Seeker
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

  // Handle overlay click to close modals
  const handleAssignModalOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeAssignModal();
    }
  };

  const handleBulkAssignModalOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowBulkAssignModal(false);
      setSelectedClients([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
              <span className="text-gray-900 font-medium">
                {isSuperAdmin ? 'User Management' : 'Team Management'}
              </span>
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isSuperAdmin ? 'User Management' : 'Team Management'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isSuperAdmin 
                    ? 'Manage all users and their access across the platform'
                    : 'Create and manage team members and their client access'
                  }
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowUserModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isSuperAdmin ? 'Add User' : 'Add Team Member'}</span>
                </button>
                {!isSuperAdmin && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Invite User</span>
                  </button>
                )}
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
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    bulkMode 
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
        ) : displayUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isSuperAdmin ? 'No users found' : 'No team members found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isSuperAdmin 
                ? 'No users are currently in the system. Start by adding a new user.'
                : 'No team members are currently in your team. Start by adding a new team member or inviting an existing user.'
              }
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowUserModal(true)}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>{isSuperAdmin ? 'Add User' : 'Add Team Member'}</span>
              </button>
              {!isSuperAdmin && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Invite User</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {isSuperAdmin ? 'Users & Client Access' : 'Team Members & Client Access'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {startIndex}-{endIndex} of {totalUsers} {isSuperAdmin ? 'user' : 'team member'}{totalUsers !== 1 ? 's' : ''}
                  </p>
                </div>
                {totalUsers > itemsPerPage && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Items per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1); // Reset to first page when changing items per page
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                  {paginatedUsers.map((user, index) => (
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
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              {user.id === currentUser?.id && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  You
                                </span>
                              )}
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
                            <Eye className="h-3 w-3 mr-1" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserModal(true);
                            }}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            title="Edit User"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => openAssignModal(user)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded hover:bg-purple-200 transition-colors"
                            title="Manage Client Access"
                          >
                            <LinkIcon className="h-3 w-3 mr-1" />
                            <span>Clients</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            <span>Delete</span>
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
                    Showing {startIndex} to {endIndex} of {totalUsers} results
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
        {showAssignModal && selectedUser && createPortal(
          <div 
            className="fixed top-0 right-0 bottom-0 left-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]"
            onClick={handleAssignModalOverlayClick}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Manage Client Access - {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <button
                    onClick={closeAssignModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Select which clients/organizations {selectedUser.firstName} should have access to:
                    </p>
                    
                    {/* Search Input */}
                    {isSuperAdmin && (
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search clients by name, industry, or location..."
                          value={clientSearchTerm}
                          onChange={(e) => {
                            setClientSearchTerm(e.target.value);
                            setClientPage(1); // Reset to first page on search
                          }}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  {loadingClients ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="text-sm mt-2">Loading clients...</p>
                    </div>
                  ) : allClients.length > 0 ? (
                    <>
                      <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3">
                        {allClients.map((client) => (
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
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {client.status}
                            </span>
                          </label>
                        ))}
                      </div>
                      
                      {/* Pagination Controls for Clients */}
                      {isSuperAdmin && clientTotalPages > 1 && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-gray-700">
                            Showing {((clientPage - 1) * clientLimit) + 1} to {Math.min(clientPage * clientLimit, totalClients)} of {totalClients} clients
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setClientPage(Math.max(1, clientPage - 1))}
                              disabled={clientPage === 1}
                              className="flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="h-3 w-3 mr-1" />
                              Prev
                            </button>
                            <span className="text-gray-700">
                              Page {clientPage} of {clientTotalPages}
                            </span>
                            <button
                              onClick={() => setClientPage(Math.min(clientTotalPages, clientPage + 1))}
                              disabled={clientPage === clientTotalPages}
                              className="flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Next
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                      <Building className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">
                        {clientSearchTerm ? 'No clients found matching your search' : 'No clients available'}
                      </p>
                    </div>
                  )}

                  {selectedClients.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Check className="h-4 w-4 inline mr-1" />
                        {selectedClients.length} client{selectedClients.length > 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={closeAssignModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignClients}
                  disabled={updateUserClientsMutation.isPending}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateUserClientsMutation.isPending ? 'Updating...' : 'Update Access'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Bulk Assign Clients Modal */}
        {showBulkAssignModal && createPortal(
          <div 
            className="fixed top-0 right-0 bottom-0 left-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]"
            onClick={handleBulkAssignModalOverlayClick}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Bulk Assign Client Access ({selectedUsers.length} users)
                  </h3>
                  <button
                    onClick={() => {
                      setShowBulkAssignModal(false);
                      setSelectedClients([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Select which clients/organizations the selected users should have access to:
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800 font-medium">
                        Selected Users ({selectedUsers.length}):
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedUsers.slice(0, 5).map(userId => {
                          const user = displayUsers.find(u => u.id === userId);
                          return user ? (
                            <span key={userId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user.firstName} {user.lastName}
                            </span>
                          ) : null;
                        })}
                        {selectedUsers.length > 5 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{selectedUsers.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {loadingClients ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="text-sm mt-2">Loading clients...</p>
                    </div>
                  ) : allClients.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3">
                      {allClients.map((client) => (
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
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.status}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                      <Building className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No clients available</p>
                    </div>
                  )}

                  {selectedClients.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <Check className="h-4 w-4 inline mr-1" />
                        {selectedClients.length} client{selectedClients.length > 1 ? 's' : ''} selected for {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBulkAssignModal(false);
                    setSelectedClients([]);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAssignClients}
                  disabled={bulkAssignMutation.isPending || selectedClients.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkAssignMutation.isPending ? 'Updating...' : `Update Access for ${selectedUsers.length} Users`}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* User Creation/Edit Modal */}
      {showUserModal && (
        <UserModal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          user={editingUser as any}
          isEditing={!!editingUser}
          isLoading={editingUser ? updateUserMutation.isPending : createUserMutation.isPending}
          roles={allRoles}
          filterAdminRoles={!isSuperAdmin}
        />
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser as any}
          onEdit={(user) => {
            setEditingUser(user as any);
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

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Invite User to Team
                </h3>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Enter the email address of an existing user to invite them to your team. 
                    They will be given access to the same clients as you.
                  </p>
                </div>

                <div>
                  <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="inviteEmail"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    disabled={inviteUserMutation.isPending}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={inviteUserMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleInviteUser}
                disabled={inviteUserMutation.isPending || !inviteEmail.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviteUserMutation.isPending ? 'Inviting...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
      </div>
    </div>
  );
};

export default TeamManagementPage;
