import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Settings,
  Eye,
  Lock,
  Globe,
  Star,
  StarOff,
  Archive,
  Copy,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  useCompanyHiringTeams, 
  useCreateHiringTeam, 
  useUpdateHiringTeam, 
  useDeleteHiringTeam 
} from '../../hooks/useHiringTeam';
import { useAuthContext } from '../../contexts/AuthContext';
import { isSuperAdmin } from '../../utils/roleUtils';
import { HiringTeamModal } from './HiringTeamModal';
import ConfirmationModal from '../ConfirmationModal';
import { toast } from '../ToastContainer';
import { formatApiError } from '../../utils/errorUtils';
import type { HiringTeam, CreateHiringTeamData, UpdateHiringTeamData } from '../../services/hiringTeamApiService';

interface HiringTeamsSectionProps {
  companyId: string;
  canManage: boolean;
}

export const HiringTeamsSection: React.FC<HiringTeamsSectionProps> = ({
  companyId,
  canManage
}) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [teamToDelete, setTeamToDelete] = useState<HiringTeam | null>(null);
  const [teamToEdit, setTeamToEdit] = useState<HiringTeam | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  // Get hiring teams for this company
  const { data: hiringTeams = [], isLoading, error } = useCompanyHiringTeams(companyId);
  const createTeamMutation = useCreateHiringTeam();
  const updateTeamMutation = useUpdateHiringTeam();
  const deleteTeamMutation = useDeleteHiringTeam();

  const isUserSuperAdmin = isSuperAdmin(user);

  const handleTeamClick = (teamId: string) => {
    navigate(`/dashboard/admin/companies/${companyId}/hiring-teams/${teamId}`);
  };

  const handleCreateTeam = async (data: CreateHiringTeamData) => {
    try {
      await createTeamMutation.mutateAsync({
        ...data,
        companyId: companyId,
        organizationIds: [] // Organizations can be assigned later
      });
      toast.success('Team Created', 'Hiring team created successfully.');
      setShowCreateModal(false);
    } catch (error: any) {
      console.error('Error creating hiring team:', error);
      const errorMessage = formatApiError(error);
      toast.error('Creation Failed', errorMessage);
      throw error; // Re-throw to let modal handle loading state
    }
  };

  const handleEditTeam = async (data: UpdateHiringTeamData) => {
    if (!teamToEdit) return;

    try {
      await updateTeamMutation.mutateAsync({
        teamId: teamToEdit.id,
        data: data
      });
      toast.success('Team Updated', 'Hiring team updated successfully.');
      setTeamToEdit(null);
    } catch (error: any) {
      console.error('Error updating hiring team:', error);
      const errorMessage = formatApiError(error);
      toast.error('Update Failed', errorMessage);
      throw error; // Re-throw to let modal handle loading state
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      await deleteTeamMutation.mutateAsync(teamToDelete.id);
      toast.success('Team Deleted', 'Hiring team deleted successfully.');
      setTeamToDelete(null);
    } catch (error: any) {
      console.error('Error deleting hiring team:', error);
      const errorMessage = formatApiError(error);
      toast.error('Delete Failed', errorMessage);
    }
  };

  const handleToggleDefault = async (team: HiringTeam) => {
    const actionKey = `default-${team.id}`;
    try {
      setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
      await updateTeamMutation.mutateAsync({
        teamId: team.id,
        data: { isDefault: !team.isDefault }
      });
      toast.success('Default Status Updated', `Team ${team.isDefault ? 'removed from' : 'set as'} default successfully.`);
    } catch (error: any) {
      console.error('Error toggling default status:', error);
      const errorMessage = formatApiError(error);
      toast.error('Update Failed', errorMessage);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleToggleStatus = async (team: HiringTeam) => {
    const actionKey = `status-${team.id}`;
    const newStatus = team.status === 'active' ? 'archived' : 'active';
    
    try {
      setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
      await updateTeamMutation.mutateAsync({
        teamId: team.id,
        data: { status: newStatus }
      });
      toast.success('Team Status Updated', `Team ${newStatus === 'active' ? 'activated' : 'archived'} successfully.`);
    } catch (error: any) {
      console.error('Error updating team status:', error);
      const errorMessage = formatApiError(error);
      toast.error('Update Failed', errorMessage);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleDuplicateTeam = async (team: HiringTeam) => {
    const actionKey = `duplicate-${team.id}`;
    try {
      setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
      await createTeamMutation.mutateAsync({
        name: `${team.name} (Copy)`,
        description: team.description || '',
        visibility: team.visibility,
        status: 'active',
        isDefault: false,
        color: team.color || '#6366f1',
        companyId: companyId,
        organizationIds: team.organizations?.map(org => org.id) || [],
      });
      toast.success('Team Duplicated', 'Team duplicated successfully.');
    } catch (error: any) {
      console.error('Error duplicating team:', error);
      const errorMessage = formatApiError(error);
      toast.error('Duplication Failed', errorMessage);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-4 w-4 text-blue-500" />;
      case 'private':
        return <Lock className="h-4 w-4 text-red-500" />;
      case 'organization':
        return <Eye className="h-4 w-4 text-purple-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Hiring Teams</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Hiring Teams</h2>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load hiring teams</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Hiring Teams</h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {hiringTeams.length} team{hiringTeams.length !== 1 ? 's' : ''}
          </span>
          {canManage && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              title="Create a new hiring team for this company"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </button>
          )}
        </div>
      </div>

      {hiringTeams.length > 0 ? (
        <div className="space-y-4">
          {hiringTeams.map((team) => (
            <div key={team.id} className="border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200 overflow-hidden group">
              <div className="flex items-center justify-between">
                {/* Clickable main area */}
                <div 
                  className="flex items-center space-x-4 p-4 flex-1 cursor-pointer hover:bg-gray-50 transition-colors group-hover:bg-purple-50"
                  onClick={() => handleTeamClick(team.id)}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: team.color || '#6366f1' }}
                  >
                    {team.icon ? (
                      <span className="text-lg">{team.icon}</span>
                    ) : (
                      <Users className="h-6 w-6" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 flex-wrap">
                      <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                        {team.name}
                        <span className="text-xs text-gray-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to view details
                        </span>
                      </h3>
                      
                      {team.isDefault && (
                        <span className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </span>
                      )}
                      
                      <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                        {getStatusIcon(team.status)}
                        <span className="ml-1 capitalize">{team.status}</span>
                      </span>
                      
                      <span className="flex items-center text-gray-500" title={`${team.visibility} visibility`}>
                        {getVisibilityIcon(team.visibility)}
                      </span>
                    </div>
                    
                    {team.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{team.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{team.members?.length || 0} members</span>
                      <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons - not clickable for navigation */}
                {canManage && (
                  <div className="flex items-center space-x-2 p-4 border-l border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDefault(team);
                      }}
                      disabled={loadingActions[`default-${team.id}`]}
                      className="p-2 text-gray-400 hover:text-yellow-600 transition-colors disabled:opacity-50"
                      title={team.isDefault ? 'Remove as default' : 'Set as default'}
                    >
                      {loadingActions[`default-${team.id}`] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                      ) : team.isDefault ? (
                        <StarOff className="h-4 w-4" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateTeam(team);
                      }}
                      disabled={loadingActions[`duplicate-${team.id}`]}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                      title="Duplicate team"
                    >
                      {loadingActions[`duplicate-${team.id}`] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(team);
                      }}
                      disabled={loadingActions[`status-${team.id}`]}
                      className="p-2 text-gray-400 hover:text-orange-600 transition-colors disabled:opacity-50"
                      title={team.status === 'active' ? 'Archive team' : 'Activate team'}
                    >
                      {loadingActions[`status-${team.id}`] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTeamToEdit(team);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit team"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    {!team.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTeamToDelete(team);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete team"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hiring teams yet</h3>
          <p className="text-gray-500 mb-4">Create your first hiring team to organize recruitment for this company.</p>
          {canManage && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              title="Create a new hiring team for this company"
            >
              Create First Team
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {teamToDelete && (
        <ConfirmationModal
          isOpen={!!teamToDelete}
          onClose={() => setTeamToDelete(null)}
          onConfirm={handleDeleteTeam}
          title="Delete Hiring Team"
          message={`Are you sure you want to delete "${teamToDelete.name}"? This action cannot be undone and will remove all team members and associated data.`}
          confirmText="Delete Team"
          cancelText="Cancel"
          type="danger"
        />
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <HiringTeamModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTeam}
          title="Create Hiring Team"
          isLoading={createTeamMutation.isPending}
        />
      )}

      {/* Edit Team Modal */}
      {teamToEdit && (
        <HiringTeamModal
          isOpen={!!teamToEdit}
          onClose={() => setTeamToEdit(null)}
          onSubmit={handleEditTeam}
          team={teamToEdit}
          title="Edit Hiring Team"
          isLoading={updateTeamMutation.isPending}
        />
      )}
    </div>
  );
};
