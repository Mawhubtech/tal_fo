import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Edit3, Trash2, UserPlus, MoreVertical, RefreshCw } from 'lucide-react';
import { useCompanyTeams, useCreateCompanyTeam, useDeleteCompanyTeam, useSyncTeamMembersToCompany } from '../../hooks/useCompany';
import { RecruitmentTeam } from '../../services/companyApiService';
import { toast } from '../ToastContainer';
import ConfirmationModal from '../ConfirmationModal';
import { CreateTeamModal } from './CreateTeamModal';
import { EditTeamModal } from './EditTeamModal';
import { TeamMembersModal } from './TeamMembersModal';

interface CompanyTeamsSectionProps {
  companyId: string;
}

export const CompanyTeamsSection: React.FC<CompanyTeamsSectionProps> = ({ companyId }) => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<RecruitmentTeam | null>(null);
  const [viewingTeam, setViewingTeam] = useState<RecruitmentTeam | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<RecruitmentTeam | null>(null);

  const { data: teamsData, isLoading } = useCompanyTeams(companyId);
  const deleteTeam = useDeleteCompanyTeam();
  const syncTeamMembers = useSyncTeamMembersToCompany();

  const teams = teamsData?.teams || [];

  const handleTeamClick = (teamId: string) => {
    navigate(`/dashboard/admin/recruitment-teams/${teamId}`);
  };

  const handleDeleteTeam = async (team: RecruitmentTeam) => {
    try {
      await deleteTeam.mutateAsync({ companyId, teamId: team.id });
      toast.success('Team Deleted', `${team.name} has been deleted successfully.`);
      setTeamToDelete(null);
    } catch (error) {
      toast.error('Delete Failed', 'Failed to delete team. Please try again.');
    }
  };

  const handleSyncTeamMembers = async (team: RecruitmentTeam) => {
    try {
      const result = await syncTeamMembers.mutateAsync({ teamId: team.id });
      toast.success(
        'Sync Completed', 
        `${result.synced} members synced to company. ${result.skipped} members were already in the company.`
      );
    } catch (error) {
      toast.error('Sync Failed', 'Failed to sync team members. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recruitment Teams</h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {teams.length} team{teams.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Team
          </button>
        </div>
      </div>

      {/* Teams List */}
      {teams.length > 0 ? (
        <div className="space-y-3">
          {teams.map((team) => (
            <div key={team.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 
                      className="font-medium text-gray-900 hover:text-primary-600 cursor-pointer transition-colors"
                      onClick={() => handleTeamClick(team.id)}
                    >
                      {team.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      team.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {team.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {team.description && (
                    <p className="text-sm text-gray-500 mt-1">{team.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{team.members?.length || 0} members</span>
                    <span>Created by {team.createdBy?.firstName} {team.createdBy?.lastName}</span>
                    <span>{new Date(team.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewingTeam(team)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View members"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleSyncTeamMembers(team)}
                  disabled={syncTeamMembers.isPending}
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Sync team members to company"
                >
                  <RefreshCw className={`h-4 w-4 ${syncTeamMembers.isPending ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setEditingTeam(team)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Edit team"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTeamToDelete(team)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete team"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recruitment teams yet</h3>
          <p className="text-gray-500 mb-4">Create specialized teams to organize your recruitment efforts.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create First Team
          </button>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateTeamModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          companyId={companyId}
        />
      )}

      {editingTeam && (
        <EditTeamModal
          isOpen={!!editingTeam}
          onClose={() => setEditingTeam(null)}
          team={editingTeam}
          companyId={companyId}
        />
      )}

      {viewingTeam && (
        <TeamMembersModal
          isOpen={!!viewingTeam}
          onClose={() => setViewingTeam(null)}
          team={viewingTeam}
          companyId={companyId}
        />
      )}

      {teamToDelete && (
        <ConfirmationModal
          isOpen={!!teamToDelete}
          onClose={() => setTeamToDelete(null)}
          onConfirm={() => handleDeleteTeam(teamToDelete)}
          title="Delete Recruitment Team"
          message={`Are you sure you want to delete "${teamToDelete.name}"? This action cannot be undone and will remove all team members.`}
          confirmText="Delete Team"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </div>
  );
};
