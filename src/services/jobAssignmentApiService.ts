import apiClient from './api';
import type { Job } from '../recruitment/data/types';

export interface BulkAssignmentResult {
  success: number;
  failed: string[];
}

export const jobAssignmentApiService = {
  // Get jobs available for assignment to a hiring team
  getJobsForTeamAssignment: async (teamId: string): Promise<Job[]> => {
    const response = await apiClient.get(`/jobs/teams/${teamId}/available`);
    return response.data.jobs;
  },

  // Get jobs already assigned to a hiring team
  getJobsAssignedToTeam: async (teamId: string): Promise<Job[]> => {
    const response = await apiClient.get(`/jobs/teams/${teamId}/assigned`);
    return response.data.jobs;
  },

  // Assign a single job to a hiring team
  assignJobToTeam: async (jobId: string, teamId: string): Promise<Job> => {
    const response = await apiClient.post(`/jobs/${jobId}/assign-team/${teamId}`);
    return response.data.job;
  },

  // Unassign a job from its hiring team
  unassignJobFromTeam: async (jobId: string): Promise<Job> => {
    const response = await apiClient.post(`/jobs/${jobId}/unassign-team`);
    return response.data.job;
  },

  // Bulk assign multiple jobs to a hiring team
  bulkAssignJobsToTeam: async (jobIds: string[], teamId: string): Promise<BulkAssignmentResult> => {
    const response = await apiClient.post(`/jobs/bulk-assign-team/${teamId}`, {
      jobIds
    });
    return response.data.result;
  },

  // Bulk unassign multiple jobs from their hiring teams
  bulkUnassignJobsFromTeam: async (jobIds: string[]): Promise<BulkAssignmentResult> => {
    const response = await apiClient.post(`/jobs/bulk-unassign-team`, {
      jobIds
    });
    return response.data.result;
  }
};
