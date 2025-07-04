import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Search, MoreHorizontal, Edit, Copy, Trash2,
  Eye, Users, Lock, Globe, Building, Settings, ChevronRight,
  CheckCircle, Clock, AlertCircle, X, Crown,
  Archive, Download, Star, StarOff, Share, Link2, 
  FileText, Calendar, Activity, Briefcase
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  useHiringTeams,
  useCreateHiringTeam,
  useUpdateHiringTeam,
  useDeleteHiringTeam
} from '../../hooks/useHiringTeam';
import { useOrganization } from '../../hooks/useOrganizations';
import { useUserClients } from '../../hooks/useUser';
import type { HiringTeam, CreateHiringTeamData, UpdateHiringTeamData } from '../../services/hiringTeamApiService';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastContainer, { toast } from '../../components/ToastContainer';
import JobAssignmentModal from '../../components/JobAssignmentModal';

type ModalMode = 'create' | 'edit' | 'none';

// A helper type for the form data to include the optional 'id' for editing
type TeamFormData = CreateHiringTeamData & { id?: string };

const HiringTeamsPage: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');
  const [modalMode, setModalMode] = useState<ModalMode>('none');
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState<HiringTeam | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  const [jobAssignmentTeam, setJobAssignmentTeam] = useState<HiringTeam | null>(null);

  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    visibility: 'organization',
    status: 'active',
    isDefault: false,
    color: '#6366f1',
    organizationIds: organizationId ? [organizationId] : []
  });

  const { data: organization } = useOrganization(organizationId || '');
  const { data: userClients = [], isLoading: loadingClients } = useUserClients();

  // PERFORMANCE: Memoize organization IDs to avoid re-calculating on every render
  const teamOrganizationIds = useMemo(() => organizationId
    ? [organizationId]
    : userClients.map(client => client.id), [organizationId, userClients]);

  const { data: hiringTeams = [], isLoading, error } = useHiringTeams(
    teamOrganizationIds.length > 0 ? teamOrganizationIds : undefined
  );

  // FIX: Corrected typos in hook names (Haching -> Hiring)
  const createTeamMutation = useCreateHiringTeam();
  const updateTeamMutation = useUpdateHiringTeam();
  const deleteTeamMutation = useDeleteHiringTeam();

  // BEST PRACTICE: Wrap resetForm in useCallback for stable function identity
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      visibility: 'organization',
      status: 'active',
      isDefault: false,
      color: '#6366f1',
      organizationIds: organizationId ? [organizationId] : userClients.map(client => client.id)
    });
  }, [organizationId, userClients]);

  useEffect(() => {
    if (modalMode === 'none') {
      resetForm();
    }
  }, [modalMode, resetForm]);

  // PERFORMANCE: Memoize filtered teams to prevent re-filtering on every render
  const filteredTeams = useMemo(() => hiringTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [hiringTeams, searchTerm, statusFilter]);

  const handleCreateTeam = async () => {
    try {
      const { id, ...createData } = formData; // Exclude ID for creation
      const teamData: CreateHiringTeamData = {
        ...createData,
        organizationIds: formData.visibility === 'organization' ? formData.organizationIds : [],
      };
      await createTeamMutation.mutateAsync(teamData);
      toast.success('Hiring team created successfully!');
      setModalMode('none');
    } catch (err) {
      console.error('Error creating team:', err);
      toast.error('Failed to create hiring team. Please try again.');
    }
  };

  const handleUpdateTeam = async () => {
    if (!formData.id) return;
    try {
      const { id, organizationIds, ...updateData } = formData;
      const teamData: UpdateHiringTeamData = updateData;
      await updateTeamMutation.mutateAsync({ teamId: id, data: teamData });
      toast.success('Hiring team updated successfully!');
      setModalMode('none');
    } catch (err) {
      console.error('Error updating team:', err);
      toast.error('Failed to update hiring team. Please try again.');
    }
  };

  const handleDeleteTeam = async () => {
    if (!deleteConfirmTeam) return;
    try {
      await deleteTeamMutation.mutateAsync(deleteConfirmTeam.id);
      toast.success('Hiring team deleted successfully!');
      setDeleteConfirmTeam(null);
    } catch (err) {
      console.error('Error deleting team:', err);
      toast.error('Failed to delete hiring team. Please try again.');
    }
  };

  const handleDuplicateTeam = async (team: HiringTeam) => {
    const actionKey = `duplicate-${team.id}`;
    try {
      setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
      const duplicateData: CreateHiringTeamData = {
        name: `${team.name} (Copy)`,
        description: team.description || '',
        visibility: team.visibility,
        status: 'active',
        isDefault: false,
        color: team.color || '#6366f1',
        organizationIds: team.organizations ? team.organizations.map(org => org.id) : (team.organizationId ? [team.organizationId] : []),
      };

      await createTeamMutation.mutateAsync(duplicateData);
      toast.success('Team duplicated successfully!');
      setActiveDropdown(null);
    } catch (err) {
      console.error('Error duplicating team:', err);
      toast.error('Failed to duplicate team. Please try again.');
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
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
      toast.success(`Team ${team.isDefault ? 'removed from' : 'set as'} default successfully!`);
      setActiveDropdown(null);
    } catch (err) {
      console.error('Error toggling default status:', err);
      toast.error('Failed to update default status. Please try again.');
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleArchiveTeam = async (team: HiringTeam) => {
    const actionKey = `archive-${team.id}`;
    try {
      setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
      const newStatus = team.status === 'archived' ? 'active' : 'archived';
      await updateTeamMutation.mutateAsync({
        teamId: team.id,
        data: { status: newStatus }
      });
      toast.success(`Team ${newStatus === 'archived' ? 'archived' : 'restored'} successfully!`);
      setActiveDropdown(null);
    } catch (err) {
      console.error('Error archiving team:', err);
      toast.error('Failed to update team status. Please try again.');
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleExportTeam = (team: HiringTeam) => {
    try {
      const teamData = {
        id: team.id,
        name: team.name,
        description: team.description,
        visibility: team.visibility,
        status: team.status,
        isDefault: team.isDefault,
        color: team.color,
        memberCount: team.members?.length || 0,
        organizations: team.organizations?.map(org => ({ id: org.id, name: org.name, industry: org.industry })),
        createdBy: team.createdBy,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt
      };

      const dataStr = JSON.stringify(teamData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `hiring-team-${team.name.toLowerCase().replace(/\s+/g, '-')}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast.success('Team data exported successfully!');
      setActiveDropdown(null);
    } catch (err) {
      console.error('Error exporting team:', err);
      toast.error('Failed to export team data. Please try again.');
    }
  };

  const handleShareTeam = async (team: HiringTeam) => {
    try {
      const shareUrl = `${window.location.origin}/dashboard/admin/hiring-teams/${team.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Hiring Team: ${team.name}`,
          text: team.description || `Check out the ${team.name} hiring team`,
          url: shareUrl,
        });
        toast.success('Team shared successfully!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Team link copied to clipboard!');
      }
      setActiveDropdown(null);
    } catch (err) {
      console.error('Error sharing team:', err);
      toast.error('Failed to share team. Please try again.');
    }
  };

  const handleViewSettings = (team: HiringTeam) => {
    setActiveDropdown(null);
    // This could navigate to a team settings page or open a settings modal
    toast.info('Team settings feature coming soon!');
  };

  const handleViewActivity = (team: HiringTeam) => {
    setActiveDropdown(null);
    // This could navigate to team activity/audit log
    toast.info('Activity log feature coming soon!');
  };

  const handleViewReports = (team: HiringTeam) => {
    setActiveDropdown(null);
    // This could navigate to team reports
    toast.info('Team reports feature coming soon!');
  };

  const handleManageJobs = (team: HiringTeam) => {
    setActiveDropdown(null);
    setJobAssignmentTeam(team);
  };

  const openEditModal = (team: HiringTeam) => {
    setFormData({
      id: team.id, // Keep track of the ID for the update
      name: team.name,
      description: team.description || '',
      visibility: team.visibility,
      status: team.status,
      isDefault: team.isDefault,
      color: team.color || '#6366f1',
      organizationIds: team.organizations ? team.organizations.map(org => org.id) : (team.organizationId ? [team.organizationId] : [])
    });
    setModalMode('edit');
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedTeams.map(teamId => deleteTeamMutation.mutateAsync(teamId)));
      toast.success(`Successfully deleted ${selectedTeams.length} team(s)!`);
      setSelectedTeams([]);
      setBulkActionMode(false);
    } catch (err) {
      toast.error('Failed to delete some teams. Please try again.');
    }
  };

  // ENHANCEMENT: Versatile bulk action handler
  const handleBulkStatusChange = async (status: 'archived' | 'active') => {
    try {
      await Promise.all(selectedTeams.map(teamId =>
        updateTeamMutation.mutateAsync({ teamId, data: { status } })
      ));
      toast.success(`Successfully ${status === 'archived' ? 'archived' : 'restored'} ${selectedTeams.length} team(s)!`);
      setSelectedTeams([]);
      setBulkActionMode(false);
    } catch (err) {
      toast.error(`Failed to ${status} some teams. Please try again.`);
    }
  };

  const handleSelectTeam = (teamId: string, checked: boolean) => {
    setSelectedTeams(prev => checked ? [...prev, teamId] : prev.filter(id => id !== teamId));
  };

  const handleSelectAllTeams = (checked: boolean) => {
    setSelectedTeams(checked ? filteredTeams.map(team => team.id) : []);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'archived': return <Archive className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      case 'organization': return <Building className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const showCreateInsteadOfError = error && (hiringTeams.length === 0);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when no modal is open and not in an input
      if (modalMode !== 'none' || 
          (event.target as HTMLElement)?.tagName === 'INPUT' || 
          (event.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            setModalMode('create');
            break;
          case 'b':
            event.preventDefault();
            setBulkActionMode(!bulkActionMode);
            break;
        }
      }

      if (event.key === 'Escape') {
        setActiveDropdown(null);
        if (modalMode !== 'none') {
          setModalMode('none');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalMode, bulkActionMode]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            {/* FIX: Use template literal for dynamic Link 'to' prop */}
            <Link
              to={`/dashboard/admin/hiring-teams`}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Hiring Teams
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            <span className="text-gray-900 font-medium">{organization?.name || 'Organization'}</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hiring Teams</h1>
              <p className="text-gray-600 mt-1">
                Manage teams responsible for hiring across your organization
              </p>
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-mono bg-gray-100 px-1 rounded">Ctrl+N</span> to create team • 
                <span className="font-mono bg-gray-100 px-1 rounded ml-1">Ctrl+B</span> for bulk actions • 
                <span className="font-mono bg-gray-100 px-1 rounded ml-1">Esc</span> to close
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setBulkActionMode(!bulkActionMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${bulkActionMode
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <Settings className="h-4 w-4" />
                <span>{bulkActionMode ? 'Exit Bulk Mode' : 'Bulk Actions'}</span>
              </button>

              {/* ENHANCEMENT: Added bulk restore/unarchive button */}
              {bulkActionMode && selectedTeams.length > 0 && (
                <>
                  <button
                    onClick={() => handleBulkStatusChange('active')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    title="Restore selected teams"
                  >
                    <Archive className="h-4 w-4" />
                    <span>Restore ({selectedTeams.length})</span>
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('archived')}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    title="Archive selected teams"
                  >
                    <Archive className="h-4 w-4" />
                    <span>Archive ({selectedTeams.length})</span>
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete selected teams"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete ({selectedTeams.length})</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setModalMode('create')}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create Team</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : error && !showCreateInsteadOfError ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Hiring Teams</h3>
            <p className="text-gray-600 mb-6">An unexpected error occurred. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mx-auto"
            >
              <span>Refresh Page</span>
            </button>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No teams match your search' : 'No hiring teams yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Create your first hiring team to get started with organized recruitment.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') || showCreateInsteadOfError ? (
              <button
                onClick={() => setModalMode('create')}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Team</span>
              </button>
            ) : null}
          </div>
        ) : (
          <div>
            {bulkActionMode && (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedTeams.length === filteredTeams.length && filteredTeams.length > 0}
                      onChange={(e) => handleSelectAllTeams(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({filteredTeams.length} teams)
                    </span>
                  </div>
                  {selectedTeams.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedTeams.length} team{selectedTeams.length > 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {bulkActionMode && (
                          <input
                            type="checkbox"
                            checked={selectedTeams.includes(team.id)}
                            onChange={(e) => handleSelectTeam(team.id, e.target.checked)}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                        )}
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: team.color || '#6366f1' }}
                          >
                            <Users className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 flex items-center truncate">
                              <span className="truncate" title={team.name}>{team.name}</span>
                              {team.isDefault && (
                                <Crown className="h-4 w-4 text-yellow-500 ml-2 flex-shrink-0" />
                              )}
                              {team.status === 'archived' && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                                  Archived
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              {getStatusIcon(team.status)}
                              <span className="text-sm text-gray-600 capitalize">{team.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === team.id ? null : team.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>
                        {activeDropdown === team.id && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              {/* Primary Actions */}
                              <Link
                                to={`/dashboard/admin/hiring-teams/${team.id}`}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <Eye className="h-4 w-4 mr-3 text-gray-500" />
                                View Details
                              </Link>
                              <button
                                onClick={() => {
                                  openEditModal(team);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Edit className="h-4 w-4 mr-3 text-gray-500" />
                                Edit Team
                              </button>
                              <Link
                                to={`/dashboard/admin/hiring-teams/${team.id}/members`}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <Users className="h-4 w-4 mr-3 text-gray-500" />
                                Manage Members
                              </Link>
                              <button
                                onClick={() => handleManageJobs(team)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Briefcase className="h-4 w-4 mr-3 text-gray-500" />
                                Manage Jobs
                              </button>
                              
                              <div className="border-t border-gray-100 my-1"></div>
                              
                              {/* Team Management */}
                              <button
                                onClick={() => handleToggleDefault(team)}
                                disabled={loadingActions[`default-${team.id}`]}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                              >
                                {loadingActions[`default-${team.id}`] ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-3"></div>
                                ) : team.isDefault ? (
                                  <StarOff className="h-4 w-4 mr-3 text-yellow-500" />
                                ) : (
                                  <Star className="h-4 w-4 mr-3 text-yellow-500" />
                                )}
                                {team.isDefault ? 'Remove as Default' : 'Set as Default'}
                              </button>
                              <button
                                onClick={() => handleDuplicateTeam(team)}
                                disabled={loadingActions[`duplicate-${team.id}`]}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                              >
                                {loadingActions[`duplicate-${team.id}`] ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-3"></div>
                                ) : (
                                  <Copy className="h-4 w-4 mr-3 text-gray-500" />
                                )}
                                Duplicate Team
                              </button>
                              <button
                                onClick={() => handleShareTeam(team)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Share className="h-4 w-4 mr-3 text-gray-500" />
                                Share Team
                              </button>
                              
                              <div className="border-t border-gray-100 my-1"></div>
                              
                              {/* Data & Reports */}
                              <button
                                onClick={() => handleViewReports(team)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <FileText className="h-4 w-4 mr-3 text-gray-500" />
                                View Reports
                              </button>
                              <button
                                onClick={() => handleViewActivity(team)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Activity className="h-4 w-4 mr-3 text-gray-500" />
                                Activity Log
                              </button>
                              <button
                                onClick={() => handleExportTeam(team)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Download className="h-4 w-4 mr-3 text-gray-500" />
                                Export Data
                              </button>
                              
                              <div className="border-t border-gray-100 my-1"></div>
                              
                              {/* Settings & Status */}
                              <button
                                onClick={() => handleViewSettings(team)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Settings className="h-4 w-4 mr-3 text-gray-500" />
                                Team Settings
                              </button>
                              <button
                                onClick={() => handleArchiveTeam(team)}
                                disabled={loadingActions[`archive-${team.id}`]}
                                className={`flex items-center w-full px-4 py-2 text-sm transition-colors disabled:opacity-50 ${
                                  team.status === 'archived' 
                                    ? 'text-green-600 hover:bg-green-50' 
                                    : 'text-yellow-600 hover:bg-yellow-50'
                                }`}
                              >
                                {loadingActions[`archive-${team.id}`] ? (
                                  <div className={`animate-spin rounded-full h-4 w-4 border-b-2 mr-3 ${
                                    team.status === 'archived' ? 'border-green-500' : 'border-yellow-500'
                                  }`}></div>
                                ) : (
                                  <Archive className="h-4 w-4 mr-3" />
                                )}
                                {team.status === 'archived' ? 'Restore' : 'Archive'} Team
                              </button>
                              
                              <div className="border-t border-gray-100 my-1"></div>
                              
                              {/* Destructive Actions */}
                              <button
                                onClick={() => {
                                  setDeleteConfirmTeam(team);
                                  setActiveDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4 mr-3" />
                                Delete Team
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {team.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{team.description}</p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-gray-500">
                          {getVisibilityIcon(team.visibility)}
                          <span className="capitalize">{team.visibility}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Users className="h-4 w-4" />
                          <span>{team.members?.length || 0} members</span>
                        </div>
                      </div>
                      
                      {/* Quick Actions - Only show default team indicator */}
                      {team.isDefault && (
                        <div className="flex items-center">
                          <Tooltip text="Default Team">
                            <div className="p-1 text-yellow-500">
                              <Crown className="h-4 w-4" />
                            </div>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(modalMode !== 'none') && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {modalMode === 'edit' ? 'Edit Hiring Team' : 'Create Hiring Team'}
                  </h3>
                  <button
                    onClick={() => setModalMode('none')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      id="teamName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. Engineering Hiring Team"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="teamDescription"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Brief description of this team's responsibilities..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="teamVisibility" className="block text-sm font-medium text-gray-700 mb-2">
                        Visibility
                      </label>
                      <select
                        id="teamVisibility"
                        value={formData.visibility}
                        onChange={(e) => {
                          const newVisibility = e.target.value as CreateHiringTeamData['visibility'];
                          setFormData({
                            ...formData,
                            visibility: newVisibility
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="organization">Organization</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="teamStatus" className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        id="teamStatus"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        {/* Only show archived option when editing an existing team */}
                        {modalMode === 'edit' && <option value="archived">Archived</option>}
                      </select>
                    </div>
                  </div>

                  {/* Organization Selection */}
                  {formData.visibility === 'organization' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organizations *
                      </label>
                      <div className="space-y-2">
                        {loadingClients ? (
                          <div className="p-3 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="text-sm mt-2">Loading organizations...</p>
                          </div>
                        ) : userClients && userClients.length > 0 ? (
                          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                            {userClients.map((client) => (
                              <label key={client.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.organizationIds?.includes(client.id) || false}
                                  onChange={(e) => {
                                    const currentIds = formData.organizationIds || [];
                                    if (e.target.checked) {
                                      setFormData({ ...formData, organizationIds: [...currentIds, client.id] });
                                    } else {
                                      setFormData({ ...formData, organizationIds: currentIds.filter(id => id !== client.id) });
                                    }
                                  }}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <Building className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-900 text-sm">{client.name}</span>
                              </label>
                            ))}
                          </div>
                        ) : organizationId ? (
                          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-900">{organization?.name || 'Current Organization'}</span>
                          </div>
                        ) : (
                          <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                             <Building className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">No organizations available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <div>
                      <label htmlFor="teamColor" className="block text-sm font-medium text-gray-700 mb-2">
                        Team Color
                      </label>
                      <input
                        type="color"
                        id="teamColor"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center pt-6">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                        Set as default team
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalMode('none')}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={modalMode === 'edit' ? handleUpdateTeam : handleCreateTeam}
                  disabled={
                    !formData.name.trim() ||
                    (formData.visibility === 'organization' && (!formData.organizationIds || formData.organizationIds.length === 0)) ||
                    createTeamMutation.isPending ||
                    updateTeamMutation.isPending
                  }
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createTeamMutation.isPending || updateTeamMutation.isPending ? 'Saving...' : (modalMode === 'edit' ? 'Update Team' : 'Create Team')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteConfirmTeam}
          onClose={() => setDeleteConfirmTeam(null)}
          onConfirm={handleDeleteTeam}
          title="Delete Hiring Team"
          message={`Are you sure you want to delete "${deleteConfirmTeam?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive={true}
        />
      </div>

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* Job Assignment Modal */}
      {jobAssignmentTeam && (
        <JobAssignmentModal
          isOpen={!!jobAssignmentTeam}
          onClose={() => setJobAssignmentTeam(null)}
          team={jobAssignmentTeam}
        />
      )}

      <ToastContainer />
    </div>
  );
};

// Simple tooltip component for better UX
const Tooltip: React.FC<{ children: React.ReactNode; text: string }> = ({ children, text }) => (
  <div className="relative group">
    {children}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
      {text}
    </div>
  </div>
);

export default HiringTeamsPage;