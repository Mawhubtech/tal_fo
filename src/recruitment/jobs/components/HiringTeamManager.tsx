import React, { useState, useRef, useEffect } from 'react';
import { Users, Plus, Search, Mail, User, Shield, Edit, Trash2, Check, X, Crown, UserCheck, Calendar, MessageSquare, Gavel, Eye } from 'lucide-react';
import { useJobHiringTeam, useAddTeamMember, useInviteExternalMember, useUpdateTeamMember, useRemoveTeamMember, useUserSearch } from '../../../hooks/useHiringTeam';
import type { HiringTeamMember, CreateHiringTeamMemberData, InviteExternalMemberData } from '../../../services/hiringTeamApiService';

interface HiringTeamManagerProps {
  jobId: string;
  isEditMode?: boolean;
  className?: string;
}

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
    description: 'Can view the process but has limited permissions',
    icon: <Eye className="h-4 w-4" />
  },
];

const HiringTeamManager: React.FC<HiringTeamManagerProps> = ({ jobId, isEditMode = false, className = '' }) => {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberType, setAddMemberType] = useState<'internal' | 'external'>('internal');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Form state for adding members
  const [newMemberForm, setNewMemberForm] = useState({
    teamRole: 'Interviewer' as TeamRole,
    email: '',
    firstName: '',
    lastName: '',
    canViewApplications: true,
    canMoveCandidates: false,
    canScheduleInterviews: false,
    canLeaveFeedback: true,
    canMakeDecisions: false,
  });

  // Hooks
  const { data: hiringTeam = [], isLoading, refetch } = useJobHiringTeam(jobId);
  const { data: searchResults = [], isLoading: searchLoading } = useUserSearch(searchQuery, addMemberType === 'internal' && searchQuery.length >= 2);
  const addTeamMemberMutation = useAddTeamMember();
  const inviteExternalMemberMutation = useInviteExternalMember();
  const updateTeamMemberMutation = useUpdateTeamMember();
  const removeTeamMemberMutation = useRemoveTeamMember();

  // Reset form when member type changes
  useEffect(() => {
    setSearchQuery('');
    setSelectedUser(null);
    setNewMemberForm(prev => ({
      ...prev,
      email: '',
      firstName: '',
      lastName: '',
    }));
  }, [addMemberType]);

  const handleAddMember = async () => {
    try {
      if (addMemberType === 'internal') {
        if (!selectedUser) return;
        
        const data: CreateHiringTeamMemberData = {
          jobId,
          memberType: 'internal',
          teamRole: newMemberForm.teamRole,
          userId: selectedUser.id,
          canViewApplications: newMemberForm.canViewApplications,
          canMoveCandidates: newMemberForm.canMoveCandidates,
          canScheduleInterviews: newMemberForm.canScheduleInterviews,
          canLeaveFeedback: newMemberForm.canLeaveFeedback,
          canMakeDecisions: newMemberForm.canMakeDecisions,
        };
        
        await addTeamMemberMutation.mutateAsync(data);
      } else {
        const data: InviteExternalMemberData = {
          jobId,
          email: newMemberForm.email,
          firstName: newMemberForm.firstName,
          lastName: newMemberForm.lastName,
          teamRole: newMemberForm.teamRole,
          canViewApplications: newMemberForm.canViewApplications,
          canMoveCandidates: newMemberForm.canMoveCandidates,
          canScheduleInterviews: newMemberForm.canScheduleInterviews,
          canLeaveFeedback: newMemberForm.canLeaveFeedback,
          canMakeDecisions: newMemberForm.canMakeDecisions,
        };
        
        await inviteExternalMemberMutation.mutateAsync(data);
      }
      
      // Reset form
      setIsAddingMember(false);
      setSearchQuery('');
      setSelectedUser(null);
      setNewMemberForm({
        teamRole: 'Interviewer',
        email: '',
        firstName: '',
        lastName: '',
        canViewApplications: true,
        canMoveCandidates: false,
        canScheduleInterviews: false,
        canLeaveFeedback: true,
        canMakeDecisions: false,
      });
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await removeTeamMemberMutation.mutateAsync(memberId);
      } catch (error) {
        console.error('Error removing team member:', error);
      }
    }
  };

  const getRoleIcon = (role: TeamRole) => {
    const roleData = TEAM_ROLES.find(r => r.value === role);
    return roleData?.icon || <User className="h-4 w-4" />;
  };

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case 'Hiring Manager': return 'bg-purple-100 text-purple-800';
      case 'Recruiter': return 'bg-blue-100 text-blue-800';
      case 'Interviewer': return 'bg-green-100 text-green-800';
      case 'Coordinator': return 'bg-yellow-100 text-yellow-800';
      case 'Decision Maker': return 'bg-red-100 text-red-800';
      case 'Team Lead': return 'bg-indigo-100 text-indigo-800';
      case 'Observer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisplayName = (member: HiringTeamMember) => {
    if (member.memberType === 'internal' && member.user) {
      return `${member.user.firstName} ${member.user.lastName}`;
    }
    return `${member.externalFirstName} ${member.externalLastName}`;
  };

  const getDisplayEmail = (member: HiringTeamMember) => {
    if (member.memberType === 'internal' && member.user) {
      return member.user.email;
    }
    return member.externalEmail;
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border-2 border-purple-600 overflow-hidden ${className}`}>
        <div className="bg-white border-b-2 border-purple-600 px-6 py-4">
          <div className="flex items-center">
            <Users className="text-purple-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-purple-600">Hiring Team</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 border-purple-600 overflow-hidden ${className}`}>
      <div className="bg-white border-b-2 border-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="text-purple-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold text-purple-600">Hiring Team</h2>
          </div>
          <button
            onClick={() => setIsAddingMember(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Current Team Members */}
        {hiringTeam.length > 0 ? (
          <div className="space-y-4 mb-6">
            {hiringTeam.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    {member.memberType === 'internal' && member.user?.avatar ? (
                      <img 
                        src={member.user.avatar} 
                        alt={getDisplayName(member)}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{getDisplayName(member)}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.teamRole)}`}>
                        {getRoleIcon(member.teamRole)}
                        <span className="ml-1">{member.teamRole}</span>
                      </span>
                      {member.memberType === 'external' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Mail className="h-3 w-3 mr-1" />
                          External
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{getDisplayEmail(member)}</p>
                    {member.memberType === 'external' && !member.invitationAccepted && (
                      <p className="text-xs text-yellow-600 mt-1">
                        {member.invitationSent ? 'Invitation sent' : 'Invitation pending'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingMember(editingMember === member.id ? null : member.id)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Edit permissions"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No team members added yet</p>
            <p className="text-sm">Add team members to collaborate on this job</p>
          </div>
        )}

        {/* Add Member Form */}
        {isAddingMember && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Team Member</h3>
            
            {/* Member Type Selection */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setAddMemberType('internal')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  addMemberType === 'internal'
                    ? 'border-purple-600 bg-purple-50 text-purple-800'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <User className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Internal User</div>
                <div className="text-sm">Existing platform user</div>
              </button>
              <button
                onClick={() => setAddMemberType('external')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  addMemberType === 'external'
                    ? 'border-purple-600 bg-purple-50 text-purple-800'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Mail className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">External User</div>
                <div className="text-sm">Invite via email</div>
              </button>
            </div>

            <div className="space-y-4">
              {/* User Selection for Internal Users */}
              {addMemberType === 'internal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Users
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      placeholder="Search by name or email..."
                    />
                  </div>
                  
                  {/* Search Results */}
                  {searchQuery.length >= 2 && (
                    <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                      {searchLoading ? (
                        <div className="p-3 text-center text-gray-500">Searching...</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              setSelectedUser(user);
                              setSearchQuery(`${user.firstName} ${user.lastName}`);
                            }}
                            className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                              selectedUser?.id === user.id ? 'bg-purple-50' : ''
                            }`}
                          >
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">No users found</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* External User Details */}
              {addMemberType === 'external' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={newMemberForm.firstName}
                      onChange={(e) => setNewMemberForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={newMemberForm.lastName}
                      onChange={(e) => setNewMemberForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newMemberForm.email}
                      onChange={(e) => setNewMemberForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Role *
                </label>
                <select
                  value={newMemberForm.teamRole}
                  onChange={(e) => setNewMemberForm(prev => ({ ...prev, teamRole: e.target.value as TeamRole }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  {TEAM_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissions
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newMemberForm.canViewApplications}
                      onChange={(e) => setNewMemberForm(prev => ({ ...prev, canViewApplications: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Can view applications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newMemberForm.canMoveCandidates}
                      onChange={(e) => setNewMemberForm(prev => ({ ...prev, canMoveCandidates: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Can move candidates between stages</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newMemberForm.canScheduleInterviews}
                      onChange={(e) => setNewMemberForm(prev => ({ ...prev, canScheduleInterviews: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Can schedule interviews</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newMemberForm.canLeaveFeedback}
                      onChange={(e) => setNewMemberForm(prev => ({ ...prev, canLeaveFeedback: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Can leave feedback</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newMemberForm.canMakeDecisions}
                      onChange={(e) => setNewMemberForm(prev => ({ ...prev, canMakeDecisions: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">Can make hiring decisions</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsAddingMember(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={
                    (addMemberType === 'internal' && !selectedUser) ||
                    (addMemberType === 'external' && (!newMemberForm.email || !newMemberForm.firstName || !newMemberForm.lastName)) ||
                    addTeamMemberMutation.isPending || inviteExternalMemberMutation.isPending
                  }
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {(addTeamMemberMutation.isPending || inviteExternalMemberMutation.isPending) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  )}
                  {addMemberType === 'internal' ? 'Add Member' : 'Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HiringTeamManager;
