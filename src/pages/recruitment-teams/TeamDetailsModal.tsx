import React, { useState } from 'react';
import { X, UserPlus, Edit2, Trash2, Crown, Shield, User, Search, Link, Unlink, Users, Mail, Phone, Calendar } from 'lucide-react';
import { useTeamMembers, useAddTeamMember, useRemoveTeamMember, useUpdateTeamMember, useUpdateTeam } from '../../hooks/useRecruitmentTeams';
import { useAuthContext } from '../../contexts/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import type { RecruitmentTeam, RecruitmentTeamMember } from '../../services/recruitmentTeamsApiService';

interface TeamDetailsModalProps {
  team: RecruitmentTeam;
  onClose: () => void;
  onEdit?: (team: RecruitmentTeam) => void;
  onUpdate?: () => void;
  initialTab?: 'overview' | 'members' | 'settings';
  showOnlySettings?: boolean;
}

interface UserSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  roles: Array<{ name: string }>;
}

const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({ team, onClose, onEdit, onUpdate, initialTab = 'overview', showOnlySettings = false }) => {
  const { user } = useAuthContext();
  const { data: members = [], isLoading } = useTeamMembers(team.id);
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();
  const updateMemberMutation = useUpdateTeamMember();
  const updateTeamMutation = useUpdateTeam();

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>(showOnlySettings ? 'settings' : initialTab);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<RecruitmentTeamMember | null>(null);
  const [editingTeam, setEditingTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: team.name,
    description: team.description || '',
  });
  
  // User search and management
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const isOwner = team.createdById === user?.id;
  const isAdmin = isOwner || members.some(
    member => member.userId === user?.id && member.role === 'admin'
  );

  // Mock user search function - in real implementation, this would call an API
  const handleUserSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Mock search results - replace with actual API call
      const mockUsers: UserSearchResult[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          roles: [{ name: 'user' }]
        },
        {
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          roles: [{ name: 'hr' }]
        }
      ].filter(user => 
        user.firstName.toLowerCase().includes(query.toLowerCase()) ||
        user.lastName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateTeam = async () => {
    try {
      await updateTeamMutation.mutateAsync({
        teamId: team.id,
        data: {
          name: teamForm.name.trim(),
          description: teamForm.description.trim() || undefined,
        },
      });
      setEditingTeam(false);
      onUpdate?.();
      if (showOnlySettings) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to update team:', error);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeMemberMutation.mutateAsync({
        teamId: team.id,
        memberId: memberToRemove.id,
      });
      setMemberToRemove(null);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleToggleMemberRole = async (member: RecruitmentTeamMember) => {
    if (!isOwner) return;

    try {
      await updateMemberMutation.mutateAsync({
        teamId: team.id,
        memberId: member.id,
        data: {
          role: member.role === 'admin' ? 'member' : 'admin',
        },
      });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  };

  const handleAddSelectedUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      for (const userId of selectedUsers) {
        await addMemberMutation.mutateAsync({
          teamId: team.id,
          data: {
            userId,
            role: 'member',
          },
        });
      }
      setSelectedUsers([]);
      setSearchQuery('');
      setSearchResults([]);
      setShowAddMember(false);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to add members:', error);
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

  const getMemberCount = () => {
    return (members?.length || 0) + 1; // +1 for team owner
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1">
            {editingTeam ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-xl font-semibold border-b-2 border-blue-500 focus:outline-none bg-transparent w-full"
                  maxLength={100}
                />
                <textarea
                  value={teamForm.description}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Team description..."
                  className="w-full text-gray-600 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  maxLength={500}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateTeam}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    disabled={updateTeamMutation.isPending}
                  >
                    {updateTeamMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingTeam(false);
                      setTeamForm({ name: team.name, description: team.description || '' });
                    }}
                    className="text-sm border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-50 transition-colors"
                    disabled={updateTeamMutation.isPending}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {showOnlySettings ? 'Edit Team Settings' : team.name}
                  </h2>
                  {isOwner && !showOnlySettings && (
                    <button
                      onClick={() => setEditingTeam(true)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {!showOnlySettings && team.description && (
                  <p className="text-gray-600 text-sm mt-1">{team.description}</p>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        {!showOnlySettings && (
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Users },
                { id: 'members', label: 'Members', icon: User },
                { id: 'settings', label: 'Settings', icon: Edit2 }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {!showOnlySettings && activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Team Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-900">Total Members</p>
                      <p className="text-2xl font-bold text-purple-600">{getMemberCount()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">Admins</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {1 + (members?.filter(m => m.role === 'admin').length || 0)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-900">Created</p>
                      <p className="text-sm font-bold text-green-600">
                        {new Date(team.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Members */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Members</h3>
                <div className="space-y-3">
                  {/* Team Owner */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Crown className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {team.createdById === user?.id ? 'You' : 'Team Owner'}
                        </p>
                        <p className="text-sm text-gray-600">Owner</p>
                      </div>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      Owner
                    </span>
                  </div>

                  {/* First 3 members */}
                  {members?.slice(0, 3).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          {getRoleIcon(member.role)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.user ? 
                              `${member.user.firstName} ${member.user.lastName}` : 
                              member.userId === user?.id ? 'You' : 'Unknown User'
                            }
                          </p>
                          <p className="text-sm text-gray-600">
                            {member.user?.email || member.userId}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.role === 'admin'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {member.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                    </div>
                  ))}

                  {members && members.length > 3 && (
                    <div className="text-center">
                      <button
                        onClick={() => setActiveTab('members')}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        View all {members.length} members
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!showOnlySettings && activeTab === 'members' && (
            <div className="space-y-6">
              {/* Members Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Team Members ({getMemberCount()})
                </h3>
                {isAdmin && (
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Member
                  </button>
                )}
              </div>

              {/* Add Member Section */}
              {showAddMember && (
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">Add Team Members</h4>
                    <button
                      onClick={() => {
                        setShowAddMember(false);
                        setSearchQuery('');
                        setSearchResults([]);
                        setSelectedUsers([]);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* User Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Users
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleUserSearch(e.target.value);
                        }}
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Search Results */}
                  {isSearching && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Search Results:</p>
                      {searchResults.map((searchUser) => (
                        <div
                          key={searchUser.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(searchUser.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, searchUser.id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== searchUser.id));
                                }
                              }}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {searchUser.firstName} {searchUser.lastName}
                              </p>
                              <p className="text-sm text-gray-600">{searchUser.email}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {searchUser.roles[0]?.name || 'User'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedUsers.length > 0 && (
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddSelectedUsers}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        disabled={addMemberMutation.isPending}
                      >
                        {addMemberMutation.isPending ? 'Adding...' : `Add ${selectedUsers.length} Member${selectedUsers.length > 1 ? 's' : ''}`}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Members List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Team Owner */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Crown className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {team.createdById === user?.id ? 'You' : 'Team Owner'}
                        </p>
                        <p className="text-sm text-gray-600">Owner • Full access</p>
                      </div>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Owner
                    </span>
                  </div>

                  {/* Team Members */}
                  {members?.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getRoleIcon(member.role)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.user ? 
                              `${member.user.firstName} ${member.user.lastName}` : 
                              member.userId === user?.id ? 'You' : 'Unknown User'
                            }
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.user?.email || member.userId}
                            </span>
                            <span>
                              Joined {new Date(member.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            member.role === 'admin'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {member.role === 'admin' ? 'Admin' : 'Member'}
                        </span>
                        {isOwner && member.userId !== user?.id && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleToggleMemberRole(member)}
                              className="text-blue-600 hover:text-blue-700 transition-colors text-sm px-2 py-1 rounded"
                              disabled={updateMemberMutation.isPending}
                            >
                              {member.role === 'admin' ? 'Make Member' : 'Make Admin'}
                            </button>
                            <button
                              onClick={() => setMemberToRemove(member)}
                              className="text-red-600 hover:text-red-700 transition-colors p-1 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        {isAdmin && !isOwner && member.userId === user?.id && (
                          <button
                            onClick={() => setMemberToRemove(member)}
                            className="text-red-600 hover:text-red-700 transition-colors text-sm px-2 py-1 rounded"
                          >
                            Leave Team
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {(!members || members.length === 0) && !isLoading && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No additional members yet</p>
                      <p className="text-sm text-gray-500">Invite team members to start collaborating</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {(showOnlySettings || activeTab === 'settings') && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Team Settings</h3>
              
              {/* Basic Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={teamForm.name}
                      onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      disabled={!isOwner}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={teamForm.description}
                      onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows={3}
                      disabled={!isOwner}
                    />
                  </div>
                  {isOwner && (
                    <div className="flex justify-end">
                      <button
                        onClick={handleUpdateTeam}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        disabled={updateTeamMutation.isPending}
                      >
                        {updateTeamMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Team Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 text-gray-900">{new Date(team.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="ml-2 text-gray-900">{new Date(team.updatedAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Team ID:</span>
                    <span className="ml-2 text-gray-900 font-mono text-xs">{team.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Members:</span>
                    <span className="ml-2 text-gray-900">{getMemberCount()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {memberToRemove && (
          <ConfirmationModal
            isOpen={true}
            title={memberToRemove.userId === user?.id ? 'Leave Team' : 'Remove Member'}
            message={
              memberToRemove.userId === user?.id
                ? `Are you sure you want to leave "${team.name}"?`
                : `Are you sure you want to remove this member from "${team.name}"?`
            }
            confirmText={memberToRemove.userId === user?.id ? 'Leave' : 'Remove'}
            type="danger"
            onConfirm={handleRemoveMember}
            onClose={() => setMemberToRemove(null)}
          />
        )}
      </div>
    </div>
  );
};

export default TeamDetailsModal;
