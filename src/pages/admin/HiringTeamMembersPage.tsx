import React, { useState } from 'react';
import { 
  Plus, Search, Edit, Trash2, 
  Users, Mail, User, Shield, ChevronRight, AlertCircle, 
  X, Crown, UserCheck, Calendar, MessageSquare, Gavel, Eye,
  ArrowLeft, UserPlus, ExternalLink
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  useHiringTeam, 
  useTeamMembers,
  useAddTeamMember, 
  useInviteExternalMember,
  useResendInvitation,
  useUpdateTeamMember, 
  useRemoveTeamMember,
  useUserSearch 
} from '../../hooks/useHiringTeam';
import { useOrganization } from '../../hooks/useOrganizations';
import { useCompany } from '../../hooks/useCompany';
import type { 
  HiringTeamMember, 
  CreateHiringTeamMemberData, 
  InviteExternalMemberData,
  UpdateHiringTeamMemberData,
  SearchUserResult 
} from '../../services/hiringTeamApiService';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastContainer, { toast } from '../../components/ToastContainer';

type TeamRole = 'Hiring Manager' | 'Recruiter' | 'Interviewer' | 'Coordinator' | 'Decision Maker' | 'Team Lead' | 'Observer';

const TEAM_ROLES: { value: TeamRole; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    value: 'Hiring Manager', 
    label: 'Hiring Manager', 
    description: 'Leads the hiring process and makes final decisions',
    icon: <Crown className="h-4 w-4" />
  },
  { 
    value: 'Recruiter', 
    label: 'Recruiter', 
    description: 'Sources and screens candidates',
    icon: <UserCheck className="h-4 w-4" />
  },
  { 
    value: 'Interviewer', 
    label: 'Interviewer', 
    description: 'Conducts interviews and provides feedback',
    icon: <MessageSquare className="h-4 w-4" />
  },
  { 
    value: 'Coordinator', 
    label: 'Coordinator', 
    description: 'Manages schedules and coordinates the process',
    icon: <Calendar className="h-4 w-4" />
  },
  { 
    value: 'Decision Maker', 
    label: 'Decision Maker', 
    description: 'Has authority to approve or reject candidates',
    icon: <Gavel className="h-4 w-4" />
  },
  { 
    value: 'Team Lead', 
    label: 'Team Lead', 
    description: 'Technical lead who evaluates candidate skills',
    icon: <Shield className="h-4 w-4" />
  },
  { 
    value: 'Observer', 
    label: 'Observer', 
    description: 'Can view but has limited interaction permissions',
    icon: <Eye className="h-4 w-4" />
  },
];

// Helper functions
const getRoleIcon = (role: TeamRole) => {
  const roleConfig = TEAM_ROLES.find(r => r.value === role);
  return roleConfig?.icon || <User className="h-4 w-4" />;
};

const getPermissionSummary = (member: HiringTeamMember) => {
  const permissions = [];
  if (member.canViewApplications) permissions.push('View Apps');
  if (member.canMoveCandidates) permissions.push('Move Candidates');
  if (member.canScheduleInterviews) permissions.push('Schedule');
  if (member.canLeaveFeedback) permissions.push('Feedback');
  if (member.canMakeDecisions) permissions.push('Decisions');
  
  return permissions.length > 0 ? permissions.join(', ') : 'Basic access';
};

const HiringTeamMembersPage: React.FC = () => {
  const { organizationId, teamId, companyId } = useParams<{ organizationId: string; teamId: string; companyId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<HiringTeamMember | null>(null);
  const [deleteMember, setDeleteMember] = useState<HiringTeamMember | null>(null);
  const [addType, setAddType] = useState<'internal' | 'external'>('internal');
  
  // User search
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const { data: searchResults = [], isLoading: searching } = useUserSearch(userSearchQuery, userSearchQuery.length >= 2);

  // Form state for adding members
  const [memberForm, setMemberForm] = useState({
    userId: '',
    externalEmail: '',
    externalFirstName: '',
    externalLastName: '',
    teamRole: 'Interviewer' as TeamRole,
    canViewApplications: true,
    canMoveCandidates: false,
    canScheduleInterviews: false,
    canLeaveFeedback: true,
    canMakeDecisions: false,
  });

  // API hooks
  const { data: organization } = useOrganization(organizationId || '');
  const { data: company } = useCompany(companyId || '');
  const { data: team, isLoading: teamLoading } = useHiringTeam(teamId || '');
  const { data: members = [], isLoading: membersLoading, error, refetch: refetchMembers } = useTeamMembers(teamId || '');
  const addMemberMutation = useAddTeamMember();
  const inviteExternalMutation = useInviteExternalMember();
  const resendInvitationMutation = useResendInvitation();
  const updateMemberMutation = useUpdateTeamMember();
  const removeMemberMutation = useRemoveTeamMember();

  // Filter members
  const filteredMembers = members.filter(member => {
    const name = member.user 
      ? `${member.user.firstName} ${member.user.lastName}`.toLowerCase()
      : `${member.externalFirstName} ${member.externalLastName}`.toLowerCase();
    const email = member.user?.email || member.externalEmail || '';
    
    return name.includes(searchTerm.toLowerCase()) || 
           email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           member.teamRole.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Debug log to see current data
  console.log('Current team data:', { 
    team,
    teamLoading,
    organizations: team?.organizations,
    organizationId: team?.organizationId
  });
  console.log('Current members data:', { 
    members, 
    filteredMembers, 
    membersLoading, 
    error,
    teamId 
  });

  const handleAddMember = async () => {
    try {
      if (addType === 'internal') {
        if (!memberForm.userId) {
          toast.error('Please select a user');
          return;
        }
        
        const data: CreateHiringTeamMemberData = {
          teamId: teamId!,
          userId: memberForm.userId,
          memberType: 'internal',
          teamRole: memberForm.teamRole,
          canViewApplications: memberForm.canViewApplications,
          canMoveCandidates: memberForm.canMoveCandidates,
          canScheduleInterviews: memberForm.canScheduleInterviews,
          canLeaveFeedback: memberForm.canLeaveFeedback,
          canMakeDecisions: memberForm.canMakeDecisions,
        };
        
        console.log('Adding internal member:', data);
        const result = await addMemberMutation.mutateAsync(data);
        console.log('Internal member added successfully:', result);
        toast.success('Team member added successfully!');
        
        // Manually refetch members list
        await refetchMembers();
      } else {
        if (!memberForm.externalEmail || !memberForm.externalFirstName || !memberForm.externalLastName) {
          toast.error('Please fill in all required fields');
          return;
        }
        
        const data: InviteExternalMemberData = {
          teamId: teamId!,
          email: memberForm.externalEmail,
          firstName: memberForm.externalFirstName,
          lastName: memberForm.externalLastName,
          teamRole: memberForm.teamRole,
          canViewApplications: memberForm.canViewApplications,
          canMoveCandidates: memberForm.canMoveCandidates,
          canScheduleInterviews: memberForm.canScheduleInterviews,
          canLeaveFeedback: memberForm.canLeaveFeedback,
          canMakeDecisions: memberForm.canMakeDecisions,
        };
        
        console.log('Inviting external member:', data);
        const result = await inviteExternalMutation.mutateAsync(data);
        console.log('External member invited successfully:', result);
        toast.success('Invitation sent successfully!');
        
        // Manually refetch members list
        await refetchMembers();
      }
      
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast.error(error.response?.data?.message || 'Failed to add team member');
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;
    
    try {
      const data: UpdateHiringTeamMemberData = {
        teamRole: memberForm.teamRole,
        canViewApplications: memberForm.canViewApplications,
        canMoveCandidates: memberForm.canMoveCandidates,
        canScheduleInterviews: memberForm.canScheduleInterviews,
        canLeaveFeedback: memberForm.canLeaveFeedback,
        canMakeDecisions: memberForm.canMakeDecisions,
      };
      
      await updateMemberMutation.mutateAsync({
        memberId: editingMember.id,
        data
      });
      
      toast.success('Team member updated successfully!');
      setEditingMember(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update team member');
    }
  };

  const handleRemoveMember = async () => {
    if (!deleteMember) return;
    
    try {
      await removeMemberMutation.mutateAsync(deleteMember.id);
      toast.success('Team member removed successfully!');
      setDeleteMember(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove team member');
    }
  };

  const handleResendInvitation = async (member: HiringTeamMember) => {
    try {
      await resendInvitationMutation.mutateAsync(member.id);
      toast.success('Invitation sent successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const resetForm = () => {
    setMemberForm({
      userId: '',
      externalEmail: '',
      externalFirstName: '',
      externalLastName: '',
      teamRole: 'Interviewer',
      canViewApplications: true,
      canMoveCandidates: false,
      canScheduleInterviews: false,
      canLeaveFeedback: true,
      canMakeDecisions: false,
    });
    setUserSearchQuery('');
  };

  const openEditModal = (member: HiringTeamMember) => {
    setMemberForm({
      userId: member.userId || '',
      externalEmail: member.externalEmail || '',
      externalFirstName: member.externalFirstName || '',
      externalLastName: member.externalLastName || '',
      teamRole: member.teamRole,
      canViewApplications: member.canViewApplications,
      canMoveCandidates: member.canMoveCandidates,
      canScheduleInterviews: member.canScheduleInterviews,
      canLeaveFeedback: member.canLeaveFeedback,
      canMakeDecisions: member.canMakeDecisions,
    });
    setEditingMember(member);
  };

  if (teamLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!team) {            return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Team Not Found</h2>
          <p className="text-gray-600 mb-4">The hiring team you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(companyId ? `/dashboard/admin/companies/${companyId}` : `/dashboard/admin/companies`)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Back to {companyId ? 'Company' : 'Companies'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Link
              to={`/dashboard/admin/companies`}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Companies
            </Link>
            {companyId && company && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                <Link
                  to={`/dashboard/admin/companies/${companyId}`}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {company.company.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            <Link
              to={companyId ? `/dashboard/admin/companies/${companyId}/hiring-teams/${teamId}` : `/dashboard/admin/companies`}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {team.name}
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            <span className="text-gray-900 font-medium">Members</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <button
                  onClick={() => navigate(companyId ? `/dashboard/admin/companies/${companyId}/hiring-teams/${teamId}` : `/dashboard/admin/companies`)}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-1" />
                  Back to Team Details
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white mr-3"
                  style={{ backgroundColor: team.color || '#6366f1' }}
                >
                  <Users className="h-4 w-4" />
                </div>
                {team.name} Members
              </h1>
              <p className="text-gray-600 mt-1">
                Manage team members and their permissions for hiring activities
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <UserPlus className="h-5 w-5" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Team Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Team Description</h3>
              <p className="text-gray-600">{team.description || 'No description provided'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Status</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                team.status === 'active' ? 'bg-green-100 text-green-800' :
                team.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {team.status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Members</h3>
              <p className="text-gray-600">{members.length} total members</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Organizations</h3>
              {team.organizations && team.organizations.length > 0 ? (
                <div className="space-y-1">
                  {team.organizations.map((org) => (
                    <div key={org.id} className="flex items-center space-x-1">
                      <span className="text-gray-600 text-sm">{org.name}</span>
                      {org.industry && (
                        <span className="text-xs text-gray-400">({org.industry})</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : team.organizationId && organization ? (
                <div className="flex items-center space-x-1">
                  <span className="text-gray-600 text-sm">{organization.name}</span>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No organizations assigned</p>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search members by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Members List */}
        {membersLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Members</h3>
            <p className="text-gray-600">Failed to load team members. Please refresh the page.</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No members match your search' : 'No team members yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Add team members to start collaborating on hiring activities.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mx-auto"
              >
                <UserPlus className="h-5 w-5" />
                <span>Add First Member</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {member.user?.avatar ? (
                          <img 
                            src={member.user.avatar} 
                            alt="" 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">
                            {member.user 
                              ? `${member.user.firstName} ${member.user.lastName}`
                              : `${member.externalFirstName} ${member.externalLastName}`
                            }
                          </h3>
                          {member.memberType === 'external' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              External
                            </span>
                          )}
                          {member.memberType === 'external' && !member.invitationSent && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Not Invited
                            </span>
                          )}
                          {member.memberType === 'external' && member.invitationSent && !member.invitationAccepted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Invitation Pending
                            </span>
                          )}
                          {member.memberType === 'external' && member.invitationAccepted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Invitation Accepted
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {member.user?.email || member.externalEmail}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            {getRoleIcon(member.teamRole)}
                            <span>{member.teamRole}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {getPermissionSummary(member)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Send Invite button for external members who haven't been sent an invitation or need resending */}
                      {member.memberType === 'external' && (!member.invitationSent || !member.invitationAccepted) && (
                        <button
                          onClick={() => handleResendInvitation(member)}
                          disabled={resendInvitationMutation.isPending}
                          className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title={member.invitationSent ? "Resend Invitation" : "Send Invitation"}
                        >
                          <Mail className="h-4 w-4" />
                          <span>{member.invitationSent ? 'Resend' : 'Send Invite'}</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => openEditModal(member)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Permissions"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteMember(member)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Member Modal */}
        {(showAddModal || editingMember) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingMember(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="space-y-6">
                  {!editingMember && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Member Type
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="internal"
                            checked={addType === 'internal'}
                            onChange={(e) => setAddType(e.target.value as 'internal' | 'external')}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Internal User</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="external"
                            checked={addType === 'external'}
                            onChange={(e) => setAddType(e.target.value as 'internal' | 'external')}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">External User</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {!editingMember && addType === 'internal' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search and Select User *
                      </label>
                      <div className="relative">
                        <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          placeholder="Type to search users by name or email..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      {searching && (
                        <div className="mt-2 text-sm text-gray-500">Searching...</div>
                      )}
                      {userSearchQuery.length >= 2 && searchResults.length > 0 && (
                        <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                          {searchResults.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => {
                                setMemberForm({ ...memberForm, userId: user.id });
                                setUserSearchQuery(`${user.firstName} ${user.lastName} (${user.email})`);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-3"
                            >
                              <User className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {userSearchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                        <div className="mt-2 text-sm text-gray-500">No users found</div>
                      )}
                    </div>
                  )}

                  {!editingMember && addType === 'external' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={memberForm.externalFirstName}
                          onChange={(e) => setMemberForm({ ...memberForm, externalFirstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="John"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={memberForm.externalLastName}
                          onChange={(e) => setMemberForm({ ...memberForm, externalLastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Doe"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={memberForm.externalEmail}
                          onChange={(e) => setMemberForm({ ...memberForm, externalEmail: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="john.doe@company.com"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Role *
                    </label>
                    <select
                      value={memberForm.teamRole}
                      onChange={(e) => setMemberForm({ ...memberForm, teamRole: e.target.value as TeamRole })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {TEAM_ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {TEAM_ROLES.find(r => r.value === memberForm.teamRole)?.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Permissions
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={memberForm.canViewApplications}
                          onChange={(e) => setMemberForm({ ...memberForm, canViewApplications: e.target.checked })}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Can view applications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={memberForm.canMoveCandidates}
                          onChange={(e) => setMemberForm({ ...memberForm, canMoveCandidates: e.target.checked })}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Can move candidates between stages</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={memberForm.canScheduleInterviews}
                          onChange={(e) => setMemberForm({ ...memberForm, canScheduleInterviews: e.target.checked })}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Can schedule interviews</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={memberForm.canLeaveFeedback}
                          onChange={(e) => setMemberForm({ ...memberForm, canLeaveFeedback: e.target.checked })}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Can leave feedback and notes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={memberForm.canMakeDecisions}
                          onChange={(e) => setMemberForm({ ...memberForm, canMakeDecisions: e.target.checked })}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Can make hiring decisions</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMember(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingMember ? handleUpdateMember : handleAddMember}
                  disabled={
                    (!editingMember && addType === 'internal' && !memberForm.userId) ||
                    (!editingMember && addType === 'external' && (!memberForm.externalEmail || !memberForm.externalFirstName || !memberForm.externalLastName)) ||
                    addMemberMutation.isPending || 
                    inviteExternalMutation.isPending || 
                    updateMemberMutation.isPending
                  }
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addMemberMutation.isPending || inviteExternalMutation.isPending || updateMemberMutation.isPending
                    ? 'Saving...' 
                    : editingMember 
                      ? 'Update Member' 
                      : addType === 'external' 
                        ? 'Send Invitation' 
                        : 'Add Member'
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteMember}
          onClose={() => setDeleteMember(null)}
          onConfirm={handleRemoveMember}
          title="Remove Team Member"
          message={`Are you sure you want to remove ${
            deleteMember?.user 
              ? `${deleteMember.user.firstName} ${deleteMember.user.lastName}`
              : `${deleteMember?.externalFirstName} ${deleteMember?.externalLastName}`
          } from this team? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
          isDestructive={true}
        />
      </div>

      <ToastContainer />
    </div>
  );
};

export default HiringTeamMembersPage;
