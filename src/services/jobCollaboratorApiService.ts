import apiClient from '../lib/api';
import type { JobCollaboratorInvite } from '../recruitment/jobs/components/JobCollaboratorInviteForm';
import type { Job } from '../recruitment/data/types';
import type { User } from '../types/auth';

export interface JobCollaborator {
  id: string;
  jobId: string;
  userId: string | null;
  email: string;
  role: 'viewer' | 'recruiter' | 'hiring_manager' | 'admin';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  canViewApplications: boolean;
  canMoveCandidates: boolean;
  canEditJob: boolean;
  invitationToken?: string;
  invitationSentAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
  // Relations (optional, populated based on query)
  job?: Job;
  user?: User;
  invitedBy?: User;
}

export const jobCollaboratorApiService = {
  // Invite single collaborator
  async inviteCollaborator(jobId: string, data: JobCollaboratorInvite): Promise<JobCollaborator> {
    const response = await apiClient.post(`/jobs/${jobId}/collaborators/invite`, data);
    return response.data;
  },

  // Invite multiple collaborators
  async inviteBulk(jobId: string, collaborators: JobCollaboratorInvite[]): Promise<{ invited: number; collaborators: JobCollaborator[] }> {
    const response = await apiClient.post(`/jobs/${jobId}/collaborators/invite-bulk`, { collaborators });
    return response.data;
  },

  // Get all collaborators for a job
  async getJobCollaborators(jobId: string): Promise<JobCollaborator[]> {
    const response = await apiClient.get(`/jobs/${jobId}/collaborators`);
    return response.data;
  },

  // Accept invitation
  async acceptInvitation(token: string): Promise<JobCollaborator> {
    const response = await apiClient.post(`/collaborators/accept/${token}`);
    return response.data;
  },

  // Get my jobs (where I'm a collaborator)
  async getMyCollaboratorJobs(): Promise<JobCollaborator[]> {
    const response = await apiClient.get('/collaborators/my-jobs');
    return response.data;
  },

  // Get my pending job collaborator invitations
  async getMyPendingInvitations(): Promise<JobCollaborator[]> {
    const response = await apiClient.get('/collaborators/pending-invitations');
    return response.data;
  },

  // Resend invitation to a collaborator
  async resendInvitation(jobId: string, collaboratorId: string): Promise<JobCollaborator> {
    const response = await apiClient.post(`/jobs/${jobId}/collaborators/${collaboratorId}/resend`);
    return response.data;
  },

  // Update collaborator permissions and role
  async updateCollaborator(
    jobId: string, 
    collaboratorId: string, 
    data: Partial<JobCollaboratorInvite>
  ): Promise<JobCollaborator> {
    const response = await apiClient.post(`/jobs/${jobId}/collaborators/${collaboratorId}`, data);
    return response.data;
  },

  // Remove collaborator from job
  async removeCollaborator(jobId: string, collaboratorId: string): Promise<void> {
    await apiClient.delete(`/jobs/${jobId}/collaborators/${collaboratorId}`);
  },
};
