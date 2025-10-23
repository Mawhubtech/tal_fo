import React, { useState } from 'react';
import { X, UserPlus, Mail, Trash2, Edit2, RefreshCw, Check, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useJobCollaborators, useInviteCollaborator, useResendInvitation, useUpdateCollaborator, useRemoveCollaborator } from '../../../hooks/useJobCollaborators';
import type { JobCollaborator } from '../../../services/jobCollaboratorApiService';
import type { JobCollaboratorInvite } from '../../jobs/components/JobCollaboratorInviteForm';
import ConfirmationDialog from '../../../components/ConfirmationDialog';

interface ManageTeamsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

const ManageTeamsDialog: React.FC<ManageTeamsDialogProps> = ({ isOpen, onClose, jobId, jobTitle }) => {
  const { data: collaborators = [], isLoading } = useJobCollaborators(jobId);
  const inviteMutation = useInviteCollaborator();
  const resendMutation = useResendInvitation();
  const updateMutation = useUpdateCollaborator();
  const removeMutation = useRemoveCollaborator();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<JobCollaboratorInvite>({
    email: '',
    role: 'viewer',
    canViewApplications: true,
    canMoveCandidates: false,
    canEditJob: false,
  });

  if (!isOpen) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    await inviteMutation.mutateAsync({ jobId, data: formData });
    setFormData({
      email: '',
      role: 'viewer',
      canViewApplications: true,
      canMoveCandidates: false,
      canEditJob: false,
    });
    setShowAddForm(false);
  };

  const handleUpdate = async (collaboratorId: string) => {
    await updateMutation.mutateAsync({ jobId, collaboratorId, data: formData });
    setEditingId(null);
    setFormData({
      email: '',
      role: 'viewer',
      canViewApplications: true,
      canMoveCandidates: false,
      canEditJob: false,
    });
  };

  const handleResend = async (collaboratorId: string) => {
    await resendMutation.mutateAsync({ jobId, collaboratorId });
  };

  const handleRemove = async () => {
    if (!deleteConfirmId) return;
    await removeMutation.mutateAsync({ jobId, collaboratorId: deleteConfirmId });
    setDeleteConfirmId(null);
  };

  const startEdit = (collaborator: JobCollaborator) => {
    setEditingId(collaborator.id);
    setFormData({
      email: collaborator.email,
      role: collaborator.role,
      canViewApplications: collaborator.canViewApplications,
      canMoveCandidates: collaborator.canMoveCandidates,
      canEditJob: collaborator.canEditJob,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      email: '',
      role: 'viewer',
      canViewApplications: true,
      canMoveCandidates: false,
      canEditJob: false,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Accepted
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      viewer: 'bg-blue-100 text-blue-800',
      recruiter: 'bg-purple-100 text-purple-800',
      hiring_manager: 'bg-indigo-100 text-indigo-800',
      admin: 'bg-pink-100 text-pink-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role as keyof typeof colors]}`}>
        {role.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Team Members</h2>
              <p className="text-sm text-gray-600 mt-1">{jobTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Add New Member Button */}
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mb-6 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-colors"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Add New Team Member
              </button>
            )}

            {/* Add Member Form */}
            {showAddForm && (
              <form onSubmit={handleInvite} className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Invite New Member</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="hiring_manager">Hiring Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.canViewApplications}
                      onChange={(e) => setFormData({ ...formData, canViewApplications: e.target.checked })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Can view applications</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.canMoveCandidates}
                      onChange={(e) => setFormData({ ...formData, canMoveCandidates: e.target.checked })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Can move candidates through stages</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.canEditJob}
                      onChange={(e) => setFormData({ ...formData, canEditJob: e.target.checked })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Can edit job details</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteMutation.isPending}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            )}

            {/* Team Members List */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-gray-600">Loading team members...</p>
              </div>
            ) : collaborators.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No team members yet</p>
                <p className="text-sm text-gray-500 mt-1">Add members to collaborate on this job</p>
              </div>
            ) : (
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                  >
                    {editingId === collaborator.id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <select
                              value={formData.role}
                              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            >
                              <option value="viewer">Viewer</option>
                              <option value="recruiter">Recruiter</option>
                              <option value="hiring_manager">Hiring Manager</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.canViewApplications}
                              onChange={(e) => setFormData({ ...formData, canViewApplications: e.target.checked })}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Can view applications</span>
                          </label>

                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.canMoveCandidates}
                              onChange={(e) => setFormData({ ...formData, canMoveCandidates: e.target.checked })}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Can move candidates through stages</span>
                          </label>

                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.canEditJob}
                              onChange={(e) => setFormData({ ...formData, canEditJob: e.target.checked })}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Can edit job details</span>
                          </label>
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdate(collaborator.id)}
                            disabled={updateMutation.isPending}
                            className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                          >
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{collaborator.email}</h4>
                            {getRoleBadge(collaborator.role)}
                            {getStatusBadge(collaborator.status)}
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                            {collaborator.canViewApplications && (
                              <span className="bg-gray-100 px-2 py-1 rounded">👁️ View apps</span>
                            )}
                            {collaborator.canMoveCandidates && (
                              <span className="bg-gray-100 px-2 py-1 rounded">🔄 Move candidates</span>
                            )}
                            {collaborator.canEditJob && (
                              <span className="bg-gray-100 px-2 py-1 rounded">✏️ Edit job</span>
                            )}
                          </div>

                          {collaborator.invitationSentAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Invited: {new Date(collaborator.invitationSentAt).toLocaleDateString()}
                            </p>
                          )}
                          {collaborator.acceptedAt && (
                            <p className="text-xs text-gray-500">
                              Accepted: {new Date(collaborator.acceptedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {collaborator.status === 'pending' && (
                            <button
                              onClick={() => handleResend(collaborator.id)}
                              disabled={resendMutation.isPending}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Resend invitation"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => startEdit(collaborator)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                            title="Edit permissions"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(collaborator.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleRemove}
        title="Remove Team Member"
        message="Are you sure you want to remove this team member? They will lose access to this job."
        confirmText="Remove"
      />
    </>
  );
};

export default ManageTeamsDialog;
