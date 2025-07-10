import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Users, Building, Link as LinkIcon, 
  MoreHorizontal, Edit, Plus, X, Check, AlertCircle, User,
  ChevronRight, UserCheck, Crown, Settings, RefreshCw, 
  CheckSquare, Trash2, UserPlus, Shield, Eye, ChevronLeft,
  Mail, UserMinus, ExternalLink
} from 'lucide-react';
import { 
  useTeam, 
  useTeamMembers, 
  useAddTeamMember, 
  useRemoveTeamMember, 
  useUpdateTeamMember,
  useUpdateTeam 
} from '../../hooks/useRecruitmentTeams';
import { useAuthContext } from '../../contexts/AuthContext';
import { useUsers, useClients } from '../../hooks/useUsers';
import { useCreateUser, useRoles, useCurrentUserClients, useUpdateUserClients, useAssignClient, useRemoveClient } from '../../hooks/useAdminUsers';
import ConfirmationModal from '../../components/ConfirmationModal';
import { UserModal } from '../../components/UserModal';
import ToastContainer, { toast } from '../../components/ToastContainer';
import type { RecruitmentTeam, RecruitmentTeamMember } from '../../services/recruitmentTeamsApiService';

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

interface Client {
  id: string;
  name: string;
  industry?: string;
  status: string;
}

const RecruitmentTeamDetailPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthContext();

  // Check if current user is super-admin
  const isSuperAdmin = currentUser?.roles?.some(role => role.name === 'super-admin') || false;

  // Team data
  const { data: team, isLoading: teamLoading, error: teamError, refetch: refetchTeam } = useTeam(teamId!);
  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useTeamMembers(teamId!);
  
  // User and client data - following TeamManagementPage pattern
  const { data: allUsers = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers();
  
  // Super-admin sees all clients, regular users see only their assigned clients  
  const { data: clientsResponse, isLoading: clientsLoading } = isSuperAdmin 
    ? useClients()
    : useCurrentUserClients();
    
  const { data: roles = [] } = useRoles();

  // Mutations
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();
  const updateMemberMutation = useUpdateTeamMember();
  const updateTeamMutation = useUpdateTeam();
  const createUserMutation = useCreateUser();
  const updateUserClientsMutation = useUpdateUserClients();
  const assignClientMutation = useAssignClient();
  const removeClientMutation = useRemoveClient();
  
  // Extract users and roles from response
  const allRoles = Array.isArray(roles) ? roles : roles?.roles || [];
  
  // Extract clients from response - following TeamManagementPage pattern
  const allClients = Array.isArray(clientsResponse) ? clientsResponse : clientsResponse?.clients || [];

  // Convert users to include client information - following TeamManagementPage pattern
  const usersWithClients: UserWithClients[] = Array.isArray(allUsers) 
    ? allUsers.map(user => ({
        ...user,
        clients: (user.clients || []).map(client => ({
          id: client.id,
          name: client.name,
          industry: client.industry || 'N/A'
        }))
      }))
    : (allUsers?.users || []).map(user => ({
        ...user,
        clients: (user.clients || []).map(client => ({
          id: client.id,
          name: client.name,
          industry: client.industry || 'N/A'
        }))
      }));

  // State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithClients | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showLinkClientsModal, setShowLinkClientsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithClients | null>(null);
  const [selectedMember, setSelectedMember] = useState<RecruitmentTeamMember | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<RecruitmentTeamMember | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [editingTeam, setEditingTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: team?.name || '',
    description: team?.description || '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedClientUsers, setExpandedClientUsers] = useState<Set<string>>(new Set());

  // Update form when team data loads
  useEffect(() => {
    if (team) {
      setTeamForm({
        name: team.name,
        description: team.description || '',
      });
    }
  }, [team]);

  // Check permissions
  const isOwner = team?.createdById === currentUser?.id;
  const isAdmin = isOwner || members.some(
    member => member.userId === currentUser?.id && member.role === 'admin'
  );

  // Pagination for members (excluding owner)
  const filteredMembers = members.filter(member => member.userId !== team?.createdById);
  const totalMembers = filteredMembers.length + 1; // +1 for owner
  const totalPages = Math.ceil(totalMembers / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

  const handleUpdateTeam = async () => {
    if (!team) return;

    try {
      await updateTeamMutation.mutateAsync({
        teamId: team.id,
        data: {
          name: teamForm.name.trim(),
          description: teamForm.description.trim() || undefined,
        },
      });
      setEditingTeam(false);
      toast.success('Team updated successfully!');
      refetchTeam();
    } catch (error) {
      console.error('Failed to update team:', error);
      toast.error('Failed to update team. Please try again.');
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      // Find user by email in the users list
      const userToInvite = usersWithClients.find(user => 
        user.email.toLowerCase() === inviteEmail.trim().toLowerCase()
      );

      if (!userToInvite) {
        toast.error('User not found. Please make sure the email address is correct and the user exists in the system.');
        return;
      }

      // Check if user is already a team member
      const isAlreadyMember = members.some(member => member.userId === userToInvite.id);
      const isOwner = userToInvite.id === team?.createdById;

      if (isAlreadyMember || isOwner) {
        toast.error('This user is already a member of the team.');
        return;
      }

      // Add user to team
      await addMemberMutation.mutateAsync({
        teamId: team!.id,
        data: { userId: userToInvite.id, role: 'member' },
      });

      toast.success(`Successfully invited ${userToInvite.firstName} ${userToInvite.lastName} to the team!`);
      setShowInviteModal(false);
      setInviteEmail('');
      refetchMembers();
    } catch (error: any) {
      console.error('Error inviting user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to invite user. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleCreateUser = async (userData: any) => {
    if (!team) return;

    try {
      // 1. Create the user
      const response = await createUserMutation.mutateAsync(userData);
      const newUser = (response as any)?.user || response;
      // 2. Add user to team
      await addMemberMutation.mutateAsync({
        teamId: team.id,
        data: { userId: newUser?.id, role: 'member' },
      });
      
      toast.success('User created and added to team successfully!');
      setShowUserModal(false);
      setEditingUser(null);
      refetchMembers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create user. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !team) return;

    try {
      await removeMemberMutation.mutateAsync({
        teamId: team.id,
        memberId: memberToRemove.userId,
      });
      toast.success('Member removed from team successfully!');
      setMemberToRemove(null);
      refetchMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove member. Please try again.');
    }
  };

  const handleToggleMemberRole = async (member: RecruitmentTeamMember) => {
    if (!isOwner || !team) return;

    try {
      await updateMemberMutation.mutateAsync({
        teamId: team.id,
        memberId: member.id,
        data: {
          role: member.role === 'admin' ? 'member' : 'admin',
        },
      });
      toast.success('Member role updated successfully!');
      refetchMembers();
    } catch (error) {
      console.error('Failed to update member role:', error);
      toast.error('Failed to update member role. Please try again.');
    }
  };

  // Client assignment functions
  const openAssignModal = (userId: string) => {
    // First try to find user in usersWithClients
    let user = usersWithClients.find(u => u.id === userId);
    
    // If not found and it's the current user, create user object
    if (!user && userId === currentUser?.id && currentUser) {
      user = {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        status: currentUser.status || 'active',
        avatar: currentUser.avatar,
        clients: allClients.map(client => ({
          id: client.id,
          name: client.name,
          industry: client.industry || 'N/A'
        })),
        roles: currentUser.roles || []
      };
    }
    
    if (user) {
      setSelectedUser(user);
      setSelectedClients(user.clients.map(client => client.id));
      setShowAssignModal(true);
    } else {
      toast.error('User not found');
    }
  };

  // Link Clients Modal - for team-level client assignments
  const handleLinkClients = async () => {
    if (selectedClients.length === 0) {
      toast.error('Please select at least one client to link');
      return;
    }

    try {
      // Get all team member IDs
      const memberIds = members.map(member => member.userId);
      if (team.createdById) {
        memberIds.push(team.createdById); // Include team owner
      }

      // Remove duplicates
      const uniqueMemberIds = [...new Set(memberIds)];

      // Bulk assign selected clients to all team members
      const promises = uniqueMemberIds.map(userId => {
        const existingClientIds = getUserClients(userId).map(c => c.id);
        const newClientIds = [...new Set([...existingClientIds, ...selectedClients])]; // Merge and deduplicate
        
        return updateUserClientsMutation.mutateAsync({
          userId,
          clientIds: newClientIds
        });
      });

      await Promise.all(promises);
      
      toast.success(`Successfully linked ${selectedClients.length} client${selectedClients.length > 1 ? 's' : ''} to all ${uniqueMemberIds.length} team member${uniqueMemberIds.length > 1 ? 's' : ''}!`);
      setShowLinkClientsModal(false);
      setSelectedClients([]);
      
      // Clear expanded state to force re-render
      setExpandedClientUsers(new Set());
      
      // Force refresh of user data to show updated assignments
      await refetchUsers();
      
      // Also refetch team members to ensure consistency
      await refetchMembers();
    } catch (error) {
      console.error('Error linking clients to team:', error);
      toast.error('Failed to link clients to team. Please try again.');
    }
  };

  // Individual user client assignment
  const handleAssignClients = async () => {
    if (!selectedUser) return;
    
    try {
      // Use the updateUserClients method which replaces all client assignments
      await updateUserClientsMutation.mutateAsync({ 
        userId: selectedUser.id, 
        clientIds: selectedClients 
      });
      
      toast.success('Client assignments updated successfully!');
      setShowAssignModal(false);
      setSelectedUser(null);
      setSelectedClients([]);
      
      // Clear expanded state to force re-render
      setExpandedClientUsers(new Set());
      
      // Force refetch of users data to show updated client assignments
      await refetchUsers();
      
      // Also refetch team members to ensure consistency
      await refetchMembers();
    } catch (error) {
      console.error('Error updating client assignments:', error);
      toast.error('Failed to update client assignments. Please try again.');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <User className="h-3 w-3 mr-1" />
          Member
        </span>;
    }
  };

  const getSystemRoleBadge = (roles: { name: string }[]) => {
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

  // Helper function to get actual user clients - following TeamManagementPage pattern
  const getUserClients = (userId: string) => {
    // Find the user in usersWithClients array (which has proper client data)
    const user = usersWithClients.find(u => u.id === userId);
    
    if (user && user.clients && Array.isArray(user.clients)) {
      return user.clients;
    }
    
    // If user is current user and has clients through clientsResponse
    if (userId === currentUser?.id && allClients.length > 0) {
      return allClients.map(client => ({
        id: client.id,
        name: client.name,
        industry: client.industry || 'N/A'
      }));
    }
    
    // Return empty array if no client data found
    return [];
  };

  // Helper function to get user data from usersWithClients array
  const getUserData = (userId: string) => {
    return usersWithClients.find(u => u.id === userId);
  };

  // Helper function to toggle expanded client list
  const toggleExpandedClients = (userId: string) => {
    setExpandedClientUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Helper function to render client list with show more/less functionality
  const renderClientList = (clients: { id: string; name: string; industry?: string }[], userId: string, isEditable: boolean = false) => {
    const isExpanded = expandedClientUsers.has(userId);
    const displayClients = isExpanded ? clients : clients.slice(0, 3);
    const hasMore = clients.length > 3;

    return (
      <div className="flex flex-wrap gap-1 items-center">
        {displayClients.map((client) => (
          <span
            key={client.id}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            <Building className="h-3 w-3 mr-1" />
            {client.name}
          </span>
        ))}
        {hasMore && (
          <button
            onClick={() => toggleExpandedClients(userId)}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors cursor-pointer"
            title={isExpanded ? 'Show less clients' : `Show ${clients.length - 3} more clients`}
          >
            {isExpanded ? 'Show less' : `+${clients.length - 3} more`}
          </button>
        )}
        {isEditable && (
          <button
            onClick={() => openAssignModal(userId)}
            className="text-blue-600 hover:text-blue-800 text-xs ml-1"
            title="Manage client access"
          >
            <Edit className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  };

  if (teamLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (teamError || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Team Not Found</h3>
          <p className="text-gray-600 mb-6">The team you're looking for doesn't exist or you don't have access to it.</p>
          <Link
            to="/dashboard/admin/recruitment-teams"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  // Add loading check early to prevent errors
  if (teamLoading || usersLoading || membersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (teamError || usersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="h-6 w-6 text-red-600 mb-2" />
          <h3 className="font-medium text-red-800">Error Loading Data</h3>
          <p className="text-red-600 text-sm mt-1">
            {teamError?.message || usersError?.message || 'Failed to load team details'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 px-6 py-8 w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <Link 
                to="/dashboard/admin"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Admin
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              <Link 
                to="/dashboard/admin/recruitment-teams"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Recruitment Teams
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              <span className="text-gray-900 font-medium">{team.name}</span>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
              <div className="flex-1">
                {editingTeam ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={teamForm.name}
                      onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                      className="text-3xl font-bold text-gray-900 border-b-2 border-purple-500 focus:outline-none bg-transparent w-full"
                      maxLength={100}
                    />
                    <textarea
                      value={teamForm.description}
                      onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Team description..."
                      className="w-full text-gray-600 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdateTeam}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        disabled={updateTeamMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                        <span>{updateTeamMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingTeam(false);
                          setTeamForm({ name: team.name, description: team.description || '' });
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={updateTeamMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
                      {isOwner && (
                        <button
                          onClick={() => setEditingTeam(true)}
                          className="text-gray-400 hover:text-purple-600 transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    {team.description && (
                      <p className="text-gray-600 mt-1">{team.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {totalMembers} member{totalMembers !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created {new Date(team.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setShowUserModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Create User</span>
                    </button>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Add Existing User</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClients([]); // Clear previous selections
                        setShowLinkClientsModal(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span>Link Clients</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => refetchMembers()}
                  disabled={membersLoading}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${membersLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage team members and their roles. Client access shows actual linked clients from the system.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      System Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Access
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Team Owner */}
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <Crown className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900">
                              {team.createdById === currentUser?.id ? 'You' : 'Team Owner'}
                            </div>
                            {team.createdById === currentUser?.id && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {team.createdById === currentUser?.id ? currentUser.email : 'Owner Email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {team.createdById === currentUser?.id && currentUser.roles 
                        ? getSystemRoleBadge(currentUser.roles)
                        : <span className="text-sm text-gray-500">-</span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Crown className="h-3 w-3 mr-1" />
                        Owner
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {team.createdById === currentUser?.id 
                        ? getStatusBadge(currentUser.status || 'active')
                        : <span className="text-sm text-gray-500">-</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        if (team.createdById === currentUser?.id) {
                          // Current user is owner - show their actual client access
                          if (allClients.length > 0) {
                            return renderClientList(allClients, team.createdById, isAdmin);
                          } else {
                            return (
                              <span className="text-sm text-gray-500 italic">
                                {isSuperAdmin ? 'All clients' : 'No client access'}
                              </span>
                            );
                          }
                        } else {
                          // Not current user - show generic owner access
                          return (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-500">Owner access</span>
                              <Crown className="h-3 w-3 text-blue-600" />
                            </div>
                          );
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-400">No actions</span>
                    </td>
                  </tr>

                  {/* Team Members */}
                  {paginatedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              {getRoleIcon(member.role)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900">
                                {member.user ? 
                                  `${member.user.firstName} ${member.user.lastName}` : 
                                  member.userId === currentUser?.id ? 'You' : 'Unknown User'
                                }
                              </div>
                              {member.userId === currentUser?.id && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.user?.email || member.userId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          // Get user system roles
                          const user = getUserData(member.userId);
                          
                          if (member.userId === currentUser?.id && currentUser.roles) {
                            return getSystemRoleBadge(currentUser.roles);
                          } else if (user && user.roles && Array.isArray(user.roles)) {
                            return getSystemRoleBadge(user.roles);
                          } else {
                            return <span className="text-sm text-gray-500">-</span>;
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(member.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          // Get user status
                          const user = getUserData(member.userId);
                          
                          if (member.userId === currentUser?.id && currentUser.status) {
                            return getStatusBadge(currentUser.status);
                          } else if (user && user.status) {
                            return getStatusBadge(user.status);
                          } else {
                            return <span className="text-sm text-gray-500">-</span>;
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const memberClients = getUserClients(member.userId);
                          
                          if (memberClients.length > 0) {
                            return renderClientList(memberClients, member.userId, isAdmin);
                          } else {
                            return (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 italic">No client access</span>
                                {isAdmin && (
                                  <button
                                    onClick={() => openAssignModal(member.userId)}
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                    title="Assign clients to this member"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            );
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isOwner && member.userId !== currentUser?.id && (
                            <>
                              <button
                                onClick={() => handleToggleMemberRole(member)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                                disabled={updateMemberMutation.isPending}
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                {member.role === 'admin' ? 'Make Member' : 'Make Admin'}
                              </button>
                              <button
                                onClick={() => setMemberToRemove(member)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                              >
                                <UserMinus className="h-3 w-3 mr-1" />
                                Remove
                              </button>
                            </>
                          )}
                          {isAdmin && !isOwner && member.userId === currentUser?.id && (
                            <button
                              onClick={() => setMemberToRemove(member)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                            >
                              <UserMinus className="h-3 w-3 mr-1" />
                              Leave Team
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Invite User Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add Existing User to {team?.name}
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
                      Enter the email address of an existing user to add them to this team. 
                      The user must already exist in the system.
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={false}
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
                  disabled={false}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUser}
                  disabled={!inviteEmail.trim() || addMemberMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addMemberMutation.isPending ? 'Adding...' : 'Add to Team'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Link Clients Modal */}
        {showLinkClientsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Link Clients to Team</h3>
                  <button
                    onClick={() => {
                      setShowLinkClientsModal(false);
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
                      Select clients to link with this team. These clients will be added to all current team members' access lists.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800 font-medium">
                        This will give access to ALL team members ({totalMembers} members)
                      </p>
                    </div>
                  </div>

                  {clientsLoading ? (
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
                            {client.status || 'active'}
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
                        {selectedClients.length} client{selectedClients.length > 1 ? 's' : ''} selected to link to {totalMembers} team member{totalMembers > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowLinkClientsModal(false);
                    setSelectedClients([]);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkClients}
                  disabled={updateUserClientsMutation.isPending || selectedClients.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateUserClientsMutation.isPending ? 'Linking...' : `Link to Team`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Clients Modal */}
        {showAssignModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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

              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Select which clients/organizations {selectedUser.firstName} should have access to:
                    </p>
                  </div>

                  {clientsLoading ? (
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
                            {client.status || 'active'}
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
                        {selectedClients.length} client{selectedClients.length > 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedUser(null);
                    setSelectedClients([]);
                  }}
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
          </div>
        )}

        {/* Remove Member Confirmation */}
        {memberToRemove && (
          <ConfirmationModal
            isOpen={true}
            title={memberToRemove.userId === currentUser?.id ? 'Leave Team' : 'Remove Member'}
            message={
              memberToRemove.userId === currentUser?.id
                ? `Are you sure you want to leave "${team.name}"?`
                : `Are you sure you want to remove this member from "${team.name}"?`
            }
            confirmText={memberToRemove.userId === currentUser?.id ? 'Leave' : 'Remove'}
            type="danger"
            onConfirm={handleRemoveMember}
            onClose={() => setMemberToRemove(null)}
          />
        )}

        {/* User Creation Modal */}
        {showUserModal && (
          <UserModal
            isOpen={showUserModal}
            onClose={() => {
              setShowUserModal(false);
              setEditingUser(null);
            }}
            onSubmit={handleCreateUser}
            user={editingUser as any}
            isEditing={!!editingUser}
            isLoading={createUserMutation.isPending}
            roles={allRoles}
            filterAdminRoles={true} // Filter out admin roles for team management
          />
        )}

        <ToastContainer />
      </div>
    </div>
  );
};

export default RecruitmentTeamDetailPage;
