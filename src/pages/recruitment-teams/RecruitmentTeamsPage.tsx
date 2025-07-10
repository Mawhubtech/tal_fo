import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Users, Trash2, ChevronRight, RefreshCw, AlertCircle, Crown, User, Edit2 } from 'lucide-react';
import { useMyTeams, useDeleteTeam } from '../../hooks/useRecruitmentTeams';
import { useAuthContext } from '../../contexts/AuthContext';
import CreateTeamModal from './CreateTeamModal';
import TeamDetailsModal from './TeamDetailsModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import ToastContainer from '../../components/ToastContainer';
import type { RecruitmentTeam } from '../../services/recruitmentTeamsApiService';

const RecruitmentTeamsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { data: teams = [], isLoading, error, refetch: refetchTeams } = useMyTeams();
  const deleteTeamMutation = useDeleteTeam();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<RecruitmentTeam | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<RecruitmentTeam | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<RecruitmentTeam | null>(null);

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      await deleteTeamMutation.mutateAsync(teamToDelete.id);
      setTeamToDelete(null);
      refetchTeams();
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  const isTeamAdmin = (team: RecruitmentTeam) => {
    if (team.createdById === user?.id) return true;
    return team.members?.some(
      member => member.userId === user?.id && member.role === 'admin'
    );
  };

  const getTeamRoleBadge = (team: RecruitmentTeam) => {
    if (team.createdById === user?.id) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Crown className="h-3 w-3 mr-1" />
        Owner
      </span>;
    }
    if (team.members?.some(member => member.userId === user?.id && member.role === 'admin')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Edit2 className="h-3 w-3 mr-1" />
        Admin
      </span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      <User className="h-3 w-3 mr-1" />
      Member
    </span>;
  };

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
              <span className="text-gray-900 font-medium">Recruitment Teams</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Recruitment Teams</h1>
                <p className="text-gray-600 mt-1">
                  Manage your recruitment teams and collaborate with colleagues on sourcing and recruiting
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Team</span>
                </button>
                <button
                  onClick={() => refetchTeams()}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Teams List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Teams</h3>
              <p className="text-gray-600 mb-6">Failed to load teams. Please refresh the page.</p>
              <button
                onClick={() => refetchTeams()}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          ) : teams.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
              <p className="text-gray-600 mb-6">
                No recruitment teams are currently available. Start by creating your first team.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Create Team</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Teams ({teams.length})
                    </h2>
                    <p className="text-sm text-gray-600">
                      Manage your recruitment teams and their members
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Your Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teams.map((team) => (
                      <tr key={team.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-purple-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                <button
                                  onClick={() => navigate(`/dashboard/admin/recruitment-teams/${team.id}`)}
                                  className="text-purple-600 hover:text-purple-900 font-medium hover:underline"
                                >
                                  {team.name}
                                </button>
                              </div>
                              {team.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {team.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {/* Count only active members + creator */}
                            {(() => {
                              const activeMembers = team.members?.filter(member => member.isActive !== false) || [];
                              const creatorIsInMembers = activeMembers.some(member => member.userId === team.createdById);
                              const totalCount = activeMembers.length + (creatorIsInMembers ? 0 : 1);
                              return `${totalCount} member${totalCount !== 1 ? 's' : ''}`;
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTeamRoleBadge(team)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(team.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">

                            {isTeamAdmin(team) && (
                              <button
                                onClick={() => {
                                  setEditingTeam(team);
                                  setSelectedTeam(team);
                                  setShowDetailsModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Edit team"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            )}
                            {team.createdById === user?.id && (
                              <button
                                onClick={() => setTeamToDelete(team)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Delete team"
                              >
                                <Trash2 className="h-4 w-4" />
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
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetchTeams();
          }}
        />
      )}

      {selectedTeam && showDetailsModal && (
        <TeamDetailsModal
          team={selectedTeam}
          onClose={() => {
            setSelectedTeam(null);
            setShowDetailsModal(false);
            setEditingTeam(null);
          }}
          onEdit={(team) => {
            setEditingTeam(team);
            setShowDetailsModal(false);
          }}
          onUpdate={() => {
            refetchTeams();
          }}
          showOnlySettings={true}
        />
      )}

      {teamToDelete && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Team"
          message={`Are you sure you want to delete "${teamToDelete.name}"? This action cannot be undone and will remove all team members.`}
          confirmText="Delete"
          type="danger"
          onConfirm={handleDeleteTeam}
          onClose={() => setTeamToDelete(null)}
        />
      )}
      
      <ToastContainer />
    </div>
  );
};

export default RecruitmentTeamsPage;
