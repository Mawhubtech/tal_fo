import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Users, User, Crown, UserCheck, MessageSquare, Calendar, Gavel, Shield, Eye, Plus, Minus } from 'lucide-react';
import { useTeamMembers, useAddTeamMember, useRemoveTeamMember } from '../../hooks/useHiringTeam';
import { useCompanyMembers } from '../../hooks/useCompany';
import { toast } from '../../components/ToastContainer';

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

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  companyId: string;
}

export const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  isOpen,
  onClose,
  teamId,
  teamName,
  companyId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<TeamRole>('Interviewer');
  const [isProcessing, setIsProcessing] = useState(false);

  // API hooks
  const { data: teamMembers = [], refetch: refetchTeamMembers } = useTeamMembers(teamId);
  const { data: companyMembersData } = useCompanyMembers(companyId);
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();

  // Enhanced modal behavior hooks
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Handle ESC key
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEsc);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  const companyMembers = companyMembersData?.members || [];

  // Get team member user IDs for filtering
  const teamMemberUserIds = new Set(
    teamMembers
      .filter(member => member.userId)
      .map(member => member.userId)
  );

  // Filter available company members (not already in team)
  const availableMembers = companyMembers.filter(member => 
    !teamMemberUserIds.has(member.userId) &&
    (searchTerm === '' || 
     `${member.user?.firstName} ${member.user?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter current team members
  const currentTeamMembers = teamMembers.filter(member =>
    member.userId && teamMemberUserIds.has(member.userId) &&
    (searchTerm === '' || 
     `${member.user?.firstName} ${member.user?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddMember = async (companyMember: any) => {
    setIsProcessing(true);
    try {
      await addMemberMutation.mutateAsync({
        teamId,
        userId: companyMember.userId,
        memberType: 'internal',
        teamRole: selectedRole,
        canViewApplications: true,
        canMoveCandidates: selectedRole === 'Hiring Manager' || selectedRole === 'Recruiter',
        canScheduleInterviews: selectedRole === 'Coordinator' || selectedRole === 'Hiring Manager',
        canLeaveFeedback: selectedRole !== 'Observer',
        canMakeDecisions: selectedRole === 'Hiring Manager' || selectedRole === 'Decision Maker',
      });
      
      await refetchTeamMembers();
      toast.success(`${companyMember.user?.firstName} ${companyMember.user?.lastName} added to team successfully!`);
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast.error(error.response?.data?.message || 'Failed to add team member');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveMember = async (teamMember: any) => {
    setIsProcessing(true);
    try {
      await removeMemberMutation.mutateAsync(teamMember.id);
      await refetchTeamMembers();
      toast.success(`${teamMember.user?.firstName} ${teamMember.user?.lastName} removed from team successfully!`);
    } catch (error: any) {
      console.error('Error removing member:', error);  
      toast.error(error.response?.data?.message || 'Failed to remove team member');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleIcon = (role: TeamRole) => {
    const roleConfig = TEAM_ROLES.find(r => r.value === role);
    return roleConfig?.icon || <User className="h-4 w-4" />;
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Manage Team Members
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Add or remove company members from "{teamName}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>

            {/* Role Selection for Adding */}
            <div className="sm:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Role for New Members
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              >
                {TEAM_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 h-full">
            {/* Available Members */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Available Company Members
                </h4>
                <span className="text-sm text-gray-500">
                  {availableMembers.length} available
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                {availableMembers.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {searchTerm ? 'No members found' : 'All company members are already in this team'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'Great job building your team!'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {availableMembers.map((member) => (
                      <div key={member.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
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
                            <div>
                              <p className="font-medium text-gray-900">
                                {member.user?.firstName} {member.user?.lastName}
                              </p>
                              <p className="text-sm text-gray-600">{member.user?.email}</p>
                              <p className="text-xs text-gray-500">{member.role}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddMember(member)}
                            disabled={isProcessing}
                            className="flex items-center space-x-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Current Team Members */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Current Team Members
                </h4>
                <span className="text-sm text-gray-500">
                  {currentTeamMembers.length} members
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                {currentTeamMembers.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">No team members yet</h3>
                    <p className="text-sm text-gray-600">Add company members to start building your team.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {currentTeamMembers.map((member) => (
                      <div key={member.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
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
                            <div>
                              <p className="font-medium text-gray-900">
                                {member.user?.firstName} {member.user?.lastName}
                              </p>
                              <p className="text-sm text-gray-600">{member.user?.email}</p>
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                {getRoleIcon(member.teamRole)}
                                <span>{member.teamRole}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveMember(member)}
                            disabled={isProcessing}
                            className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
