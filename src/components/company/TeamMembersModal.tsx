import React, { useState } from 'react';
import { X, UserPlus, Trash2, Crown, User, Search } from 'lucide-react';
import { useCompanyMembers, useAddTeamMember, useRemoveTeamMember, useUpdateTeamMemberRole, useToggleTeamMemberStatus } from '../../hooks/useCompany';
import { RecruitmentTeam } from '../../services/companyApiService';
import { toast } from '../ToastContainer';
import ConfirmationModal from '../ConfirmationModal';

interface TeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: RecruitmentTeam;
  companyId: string;
}

export const TeamMembersModal: React.FC<TeamMembersModalProps> = ({
  isOpen,
  onClose,
  team,
  companyId
}) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member'>('member');
  const [searchTerm, setSearchTerm] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<any>(null);

  const { data: companyMembersData } = useCompanyMembers(companyId);
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();
  const updateRole = useUpdateTeamMemberRole();
  const toggleStatus = useToggleTeamMemberStatus();

  const companyMembers = companyMembersData?.members || [];
  const teamMembers = team.members || [];

  // Filter company members who are not in this team
  const availableMembers = companyMembers.filter(companyMember => 
    !teamMembers.some(teamMember => teamMember.userId === companyMember.userId) &&
    (companyMember.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     companyMember.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     companyMember.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error('Validation Error', 'Please select a user to add.');
      return;
    }

    try {
      await addMember.mutateAsync({
        companyId,
        teamId: team.id,
        data: {
          userId: selectedUserId,
          role: selectedRole
        }
      });

      toast.success('Member Added', 'Team member has been added successfully.');
      setShowAddMember(false);
      setSelectedUserId('');
      setSelectedRole('member');
    } catch (error) {
      toast.error('Add Failed', 'Failed to add team member. Please try again.');
    }
  };

  const handleRemoveMember = async (member: any) => {
    try {
      await removeMember.mutateAsync({
        companyId,
        teamId: team.id,
        memberId: member.id
      });

      toast.success('Member Removed', `${member.user.firstName} has been removed from the team.`);
      setMemberToRemove(null);
    } catch (error) {
      toast.error('Remove Failed', 'Failed to remove team member. Please try again.');
    }
  };

  const handleRoleChange = async (member: any, newRole: 'admin' | 'member') => {
    try {
      await updateRole.mutateAsync({
        companyId,
        teamId: team.id,
        memberId: member.id,
        role: newRole
      });

      toast.success('Role Updated', `${member.user.firstName}'s role has been updated.`);
    } catch (error) {
      toast.error('Update Failed', 'Failed to update member role. Please try again.');
    }
  };

  const handleToggleStatus = async (member: any) => {
    try {
      await toggleStatus.mutateAsync({
        companyId,
        teamId: team.id,
        memberId: member.id
      });

      toast.success('Status Updated', `${member.user.firstName}'s status has been updated.`);
    } catch (error) {
      toast.error('Update Failed', 'Failed to update member status. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{team.name} Members</h2>
            <p className="text-sm text-gray-500 mt-1">{teamMembers.length} members</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add Member Section */}
          <div className="mb-6">
            {!showAddMember ? (
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </button>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Add Team Member</h3>
                  <button
                    onClick={() => setShowAddMember(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search company members..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Available Members */}
                <div className="max-h-40 overflow-y-auto">
                  {availableMembers.length > 0 ? (
                    <div className="space-y-2">
                      {availableMembers.map((member) => (
                        <label
                          key={member.id}
                          className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="selectedUser"
                            value={member.userId}
                            checked={selectedUserId === member.userId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex items-center space-x-3">
                            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {member.user.firstName[0]}{member.user.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {member.user.firstName} {member.user.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{member.user.email}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {searchTerm ? 'No members found matching your search.' : 'All company members are already in this team.'}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'member')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddMember(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMember}
                    disabled={!selectedUserId || addMember.isPending}
                    className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addMember.isPending ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current Members */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Current Members</h3>
            {teamMembers.length > 0 ? (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">
                            {member.user?.firstName} {member.user?.lastName}
                          </p>
                          {member.role === 'admin' && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{member.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member, e.target.value as 'admin' | 'member')}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                        disabled={updateRole.isPending}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        onClick={() => handleToggleStatus(member)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        disabled={toggleStatus.isPending}
                      >
                        {member.isActive ? 'Active' : 'Inactive'}
                      </button>

                      <button
                        onClick={() => setMemberToRemove(member)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove from team"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No members in this team yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>

      {/* Remove Member Confirmation */}
      {memberToRemove && (
        <ConfirmationModal
          isOpen={!!memberToRemove}
          onClose={() => setMemberToRemove(null)}
          onConfirm={() => handleRemoveMember(memberToRemove)}
          title="Remove Team Member"
          message={`Are you sure you want to remove ${memberToRemove.user?.firstName} ${memberToRemove.user?.lastName} from this team?`}
          confirmText="Remove Member"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </div>
  );
};
