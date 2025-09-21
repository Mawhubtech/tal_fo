import React, { useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, Users, Settings, Archive, Trash2,
  Globe, Lock, Building, Crown, CheckCircle, Clock,
  AlertCircle, Share, Copy, Download, Activity,
  FileText, Calendar, MapPin, Mail, Phone, Briefcase, ChevronRight, X, Building2
} from 'lucide-react';
import { useHiringTeam, useUpdateHiringTeam, useDeleteHiringTeam, useTeamClients } from '../../hooks/useHiringTeam';
import { useJobsAssignedToTeam } from '../../hooks/useJobAssignment';
import { useOrganization } from '../../hooks/useOrganizations';
import { useUserClients } from '../../hooks/useUser';
import { useCompany } from '../../hooks/useCompany';
import ConfirmDialog from '../../components/ConfirmDialog';
import ToastContainer, { toast } from '../../components/ToastContainer';
import JobAssignmentModal from '../../components/JobAssignmentModal';
import { ClientManagementModal } from '../../components/company/ClientManagementModal';
import { MemberManagementModal } from '../../components/company/MemberManagementModal';

// Types for the edit form
type TeamFormData = {
  id?: string;
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'organization';
  status: 'active' | 'inactive' | 'archived';
  isDefault: boolean;
  color: string;
  organizationIds: string[];
};

const HiringTeamDetailPage: React.FC = () => {
  const { teamId, companyId, organizationId } = useParams<{ teamId: string; companyId: string; organizationId?: string }>();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [jobAssignmentModalOpen, setJobAssignmentModalOpen] = useState(false);
  const [clientManagementModalOpen, setClientManagementModalOpen] = useState(false);
  const [memberManagementModalOpen, setMemberManagementModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form data for editing
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
    visibility: 'organization',
    status: 'active',
    isDefault: false,
    color: '#6366f1',
    organizationIds: []
  });

  const { data: team, isLoading: teamLoading, error: teamError } = useHiringTeam(teamId || '');
  const { data: assignedJobs = [], isLoading: jobsLoading } = useJobsAssignedToTeam(teamId || '');
  const { data: teamClients = [], isLoading: clientsLoading } = useTeamClients(teamId || '');
  const { data: organization } = useOrganization(organizationId || '');
  const { data: company } = useCompany(companyId || '');
  const { data: userClients = [], isLoading: loadingClients } = useUserClients();
  const updateTeamMutation = useUpdateHiringTeam();
  const deleteTeamMutation = useDeleteHiringTeam();

  const openEditModal = useCallback(() => {
    if (!team) return;
    
    setFormData({
      id: team.id,
      name: team.name,
      description: team.description || '',
      visibility: team.visibility,
      status: team.status,
      isDefault: team.isDefault,
      color: team.color || '#6366f1',
      organizationIds: team.organizations ? team.organizations.map(org => org.id) : []
    });
    setIsEditModalOpen(true);
  }, [team]);

  const handleUpdateTeam = async () => {
    if (!formData.id) return;
    try {
      const { id, ...updateData } = formData;
      const teamData = {
        ...updateData,
        organizationIds: formData.visibility === 'organization' ? formData.organizationIds : undefined
      };
      await updateTeamMutation.mutateAsync({ teamId: id, data: teamData });
      toast.success('Hiring team updated successfully!');
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating team:', err);
      toast.error('Failed to update hiring team. Please try again.');
    }
  };

  const handleArchiveTeam = async () => {
    if (!team) return;
    try {
      const newStatus = team.status === 'archived' ? 'active' : 'archived';
      await updateTeamMutation.mutateAsync({
        teamId: team.id,
        data: { status: newStatus }
      });
      toast.success(`Team ${newStatus === 'archived' ? 'archived' : 'restored'} successfully!`);
    } catch (err) {
      console.error('Error archiving team:', err);
      toast.error('Failed to update team status. Please try again.');
    }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    try {
      await deleteTeamMutation.mutateAsync(team.id);
      toast.success('Team deleted successfully!');
      // Navigate back to the company page
      if (companyId) {
        navigate(`/dashboard/admin/companies/${companyId}`);
      } else {
        navigate(`/dashboard/admin/companies`);
      }
    } catch (err) {
      console.error('Error deleting team:', err);
      toast.error('Failed to delete team. Please try again.');
    }
  };

  const handleShareTeam = async () => {
    try {
      const shareUrl = `${window.location.origin}/dashboard/admin/hiring-teams/${teamId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Hiring Team: ${team?.name}`,
          text: team?.description || `Check out the ${team?.name} hiring team`,
          url: shareUrl,
        });
        toast.success('Team shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Team link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing team:', err);
      toast.error('Failed to share team. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inactive': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'archived': return <Archive className="h-5 w-5 text-gray-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-5 w-5" />;
      case 'private': return <Lock className="h-5 w-5" />;
      case 'organization': return <Building className="h-5 w-5" />;
      default: return <Building className="h-5 w-5" />;
    }
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
          <p className="text-gray-600 mb-6">The hiring team you're looking for doesn't exist or has been deleted.</p>
          <Link
            to={companyId ? `/dashboard/admin/companies/${companyId}` : `/dashboard/admin/companies`}
            className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {companyId ? 'Company' : 'Companies'}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center mb-4">
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
            <span className="text-gray-500">Hiring Teams</span>
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            <span className="text-gray-900 font-medium">{team?.name || 'Team Details'}</span>
          </div>

          {/* Back Button */}
          <div className="flex items-center mb-4">
            <Link
              to={companyId ? `/dashboard/admin/companies/${companyId}` : `/dashboard/admin/companies`}
              className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to {companyId && company ? company.company.name : 'Companies'}
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: team.color || '#6366f1' }}
                >
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                    {team.isDefault && (
                      <div className="flex items-center" title="Default Team">
                        <Crown className="h-6 w-6 text-yellow-500" />
                      </div>
                    )}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      team.status === 'active' ? 'bg-green-100 text-green-800' :
                      team.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {team.status}
                    </span>
                  </div>
                  {team.description && (
                    <p className="text-gray-600 mt-2 max-w-2xl">{team.description}</p>
                  )}
                  <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      {getVisibilityIcon(team.visibility)}
                      <span className="capitalize">{team.visibility}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{team.members?.length || 0} members</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleShareTeam}
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Share className="h-4 w-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={openEditModal}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Team</span>
                </button>
                <button
                  onClick={handleArchiveTeam}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    team.status === 'archived'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <Archive className="h-4 w-4" />
                  <span>{team.status === 'archived' ? 'Restore' : 'Archive'}</span>
                </button>
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Members */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                <button
                  onClick={() => setMemberManagementModalOpen(true)}
                  className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Manage Members</span>
                </button>
              </div>
              
              {team.members && team.members.length > 0 ? (
                <div className="space-y-4">
                  {team.members.slice(0, 5).map((member, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.user?.firstName} {member.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{member.teamRole}</p>
                      </div>
                    </div>
                  ))}
                  {team.members.length > 5 && (
                    <p className="text-sm text-gray-500">
                      And {team.members.length - 5} more members...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Yet</h3>
                  <p className="text-gray-600 mb-4">This team doesn't have any members assigned.</p>
                  <button
                    onClick={() => setMemberManagementModalOpen(true)}
                    className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span>Add Members</span>
                  </button>
                </div>
              )}
            </div>

            {/* Assigned Jobs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Assigned Jobs</h2>
                <button
                  onClick={() => setJobAssignmentModalOpen(true)}
                  className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Manage Jobs</span>
                </button>
              </div>
              
              {jobsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : assignedJobs && assignedJobs.length > 0 ? (
                <div className="space-y-4">
                  {assignedJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>{job.department}</span>
                          <span>{job.location}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            job.status === 'Published' ? 'bg-green-100 text-green-800' :
                            job.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                            job.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                            job.status === 'Closed' ? 'bg-red-100 text-red-800' :
                            job.status === 'Archived' ? 'bg-gray-100 text-gray-600' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Created {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {assignedJobs.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      And {assignedJobs.length - 5} more jobs...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Assigned</h3>
                  <p className="text-gray-600 mb-4">This team doesn't have any jobs assigned yet.</p>
                  <button
                    onClick={() => setJobAssignmentModalOpen(true)}
                    className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>Assign Jobs</span>
                  </button>
                </div>
              )}
            </div>

            {/* Assigned Organizations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Assigned Organizations</h2>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">{teamClients.length} organization{teamClients.length !== 1 ? 's' : ''}</span>
                  <button
                    onClick={() => setClientManagementModalOpen(true)}
                    className="inline-flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    <Building className="h-4 w-4" />
                    <span>Manage</span>
                  </button>
                </div>
              </div>
              
              {clientsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : teamClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamClients.map((client) => (
                    <div key={client.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{client.name}</h3>
                          {client.industry && (
                            <p className="text-sm text-gray-500">{client.industry}</p>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                            client.status === 'active' ? 'bg-green-100 text-green-800' : 
                            client.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {client.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations Assigned</h3>
                  <p className="text-gray-600 mb-4">This team doesn't have any organizations assigned yet.</p>
                  <button
                    onClick={() => setClientManagementModalOpen(true)}
                    className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Assign Organizations</span>
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                <p className="text-gray-600">Team activity will appear here as it happens.</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Members</span>
                  <span className="font-semibold">{team.members?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned Jobs</span>
                  <span className="font-semibold">{assignedJobs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned Organizations</span>
                  <span className="font-semibold">{teamClients.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-semibold capitalize">{team.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visibility</span>
                  <span className="font-semibold capitalize">{team.visibility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Default Team</span>
                  <span className="font-semibold">{team.isDefault ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setMemberManagementModalOpen(true)}
                  className="flex items-center space-x-3 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-5 w-5 text-gray-500" />
                  <span>Manage Members</span>
                </button>
                <button
                  onClick={() => setJobAssignmentModalOpen(true)}
                  className="flex items-center space-x-3 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Briefcase className="h-5 w-5 text-gray-500" />
                  <span>Manage Jobs</span>
                </button>
                <button
                  onClick={() => setClientManagementModalOpen(true)}
                  className="flex items-center space-x-3 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Building className="h-5 w-5 text-gray-500" />
                  <span>Manage Organizations</span>
                </button>
                <button
                  onClick={() => toast.info('Team settings feature coming soon!')}
                  className="flex items-center space-x-3 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-5 w-5 text-gray-500" />
                  <span>Team Settings</span>
                </button>
                <button
                  onClick={() => toast.info('Team reports feature coming soon!')}
                  className="flex items-center space-x-3 w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-gray-500" />
                  <span>View Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Team Modal */}
        {isEditModalOpen && team && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Team: {team.name}
                  </h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="organization">Organization</option>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  {formData.visibility === 'organization' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organizations *
                      </label>
                      {loadingClients ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                          {userClients.map((client) => (
                            <label key={client.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.organizationIds.includes(client.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      organizationIds: [...formData.organizationIds, client.id]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      organizationIds: formData.organizationIds.filter(id => id !== client.id)
                                    });
                                  }
                                }}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-900">{client.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isDefault" className="text-sm text-gray-700">
                        Set as default team
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <label htmlFor="teamColor" className="text-sm text-gray-700">
                        Color:
                      </label>
                      <input
                        type="color"
                        id="teamColor"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleUpdateTeam}
                  disabled={
                    !formData.name.trim() ||
                    (formData.visibility === 'organization' && formData.organizationIds.length === 0) ||
                    updateTeamMutation.isPending
                  }
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateTeamMutation.isPending ? 'Updating...' : 'Update Team'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteConfirm}
          onClose={() => setDeleteConfirm(false)}
          onConfirm={handleDeleteTeam}
          title="Delete Hiring Team"
          message={`Are you sure you want to delete "${team.name}"? This action cannot be undone and will remove all team data.`}
          confirmText="Delete Team"
          cancelText="Cancel"
          isDestructive={true}
        />

        {/* Job Assignment Modal */}
        {team && (
          <JobAssignmentModal
            isOpen={jobAssignmentModalOpen}
            onClose={() => setJobAssignmentModalOpen(false)}
            team={team}
          />
        )}

        {/* Client Management Modal */}
        {team && (
          <ClientManagementModal
            isOpen={clientManagementModalOpen}
            onClose={() => setClientManagementModalOpen(false)}
            teamId={team.id}
            teamName={team.name}
          />
        )}

        {/* Member Management Modal */}
        {team && companyId && (
          <MemberManagementModal
            isOpen={memberManagementModalOpen}
            onClose={() => setMemberManagementModalOpen(false)}
            teamId={team.id}
            teamName={team.name}
            companyId={companyId}
          />
        )}

        <ToastContainer />
      </div>
    </div>
  );
};

export default HiringTeamDetailPage;
