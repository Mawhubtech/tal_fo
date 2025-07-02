import apiClient from './api';

export interface HiringTeam {
  id: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private' | 'organization';
  status: 'active' | 'inactive' | 'archived';
  isDefault: boolean;
  color?: string;
  icon?: string;
  organizations?: {
    id: string;
    name: string;
    industry?: string;
    status: string;
  }[];
  // Legacy field for backward compatibility
  organizationId?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  members: HiringTeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HiringTeamMember {
  id: string;
  teamId: string;
  userId?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  externalEmail?: string;
  externalFirstName?: string;
  externalLastName?: string;
  memberType: 'internal' | 'external';
  teamRole: 'Hiring Manager' | 'Recruiter' | 'Interviewer' | 'Coordinator' | 'Decision Maker' | 'Team Lead' | 'Observer';
  canViewApplications: boolean;
  canMoveCandidates: boolean;
  canScheduleInterviews: boolean;
  canLeaveFeedback: boolean;
  canMakeDecisions: boolean;
  accessToken?: string;
  accessTokenExpires?: Date;
  invitationSent: boolean;
  invitationAccepted: boolean;
  invitationSentAt?: Date;
  invitationAcceptedAt?: Date;
  addedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHiringTeamData {
  name: string;
  description?: string;
  visibility?: 'public' | 'private' | 'organization';
  status?: 'active' | 'inactive' | 'archived';
  isDefault?: boolean;
  color?: string;
  icon?: string;
  organizationIds?: string[];
  // Legacy field for backward compatibility
  organizationId?: string;
}

export interface UpdateHiringTeamData {
  name?: string;
  description?: string;
  visibility?: 'public' | 'private' | 'organization';
  status?: 'active' | 'inactive' | 'archived';
  isDefault?: boolean;
  color?: string;
  icon?: string;
}

export interface CreateHiringTeamMemberData {
  teamId: string;
  memberType: 'internal' | 'external';
  teamRole: 'Hiring Manager' | 'Recruiter' | 'Interviewer' | 'Coordinator' | 'Decision Maker' | 'Team Lead' | 'Observer';
  userId?: string;
  externalEmail?: string;
  externalFirstName?: string;
  externalLastName?: string;
  canViewApplications?: boolean;
  canMoveCandidates?: boolean;
  canScheduleInterviews?: boolean;
  canLeaveFeedback?: boolean;
  canMakeDecisions?: boolean;
}

export interface InviteExternalMemberData {
  teamId: string;
  email: string;
  firstName: string;
  lastName: string;
  teamRole: 'Hiring Manager' | 'Recruiter' | 'Interviewer' | 'Coordinator' | 'Decision Maker' | 'Team Lead' | 'Observer';
  canViewApplications?: boolean;
  canMoveCandidates?: boolean;
  canScheduleInterviews?: boolean;
  canLeaveFeedback?: boolean;
  canMakeDecisions?: boolean;
}

export interface UpdateHiringTeamMemberData {
  teamRole?: 'Hiring Manager' | 'Recruiter' | 'Interviewer' | 'Coordinator' | 'Decision Maker' | 'Team Lead' | 'Observer';
  canViewApplications?: boolean;
  canMoveCandidates?: boolean;
  canScheduleInterviews?: boolean;
  canLeaveFeedback?: boolean;
  canMakeDecisions?: boolean;
}

export interface SearchUserResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export const hiringTeamApiService = {
  // Hiring Team CRUD
  getAllTeams: async (organizationIds?: string[]): Promise<HiringTeam[]> => {
    const response = await apiClient.get('/hiring-teams', {
      params: organizationIds && organizationIds.length > 0 ? { organizationIds: organizationIds.join(',') } : {},
    });
    return response.data.data;
  },

  getTeamById: async (teamId: string): Promise<HiringTeam> => {
    const response = await apiClient.get(`/hiring-teams/${teamId}`);
    return response.data.data;
  },

  createTeam: async (data: CreateHiringTeamData): Promise<HiringTeam> => {
    const response = await apiClient.post('/hiring-teams', data);
    return response.data.data;
  },

  updateTeam: async (teamId: string, data: UpdateHiringTeamData): Promise<HiringTeam> => {
    const response = await apiClient.put(`/hiring-teams/${teamId}`, data);
    return response.data.data;
  },

  deleteTeam: async (teamId: string): Promise<void> => {
    await apiClient.delete(`/hiring-teams/${teamId}`);
  },

  // Team Members
  getTeamMembers: async (teamId: string): Promise<HiringTeamMember[]> => {
    const response = await apiClient.get(`/hiring-teams/${teamId}/members`);
    return response.data.data;
  },

  addTeamMember: async (data: CreateHiringTeamMemberData): Promise<HiringTeamMember> => {
    const response = await apiClient.post('/hiring-teams/members', data);
    return response.data.data;
  },

  inviteExternalMember: async (data: InviteExternalMemberData): Promise<HiringTeamMember> => {
    const response = await apiClient.post('/hiring-teams/members/invite', data);
    return response.data.data;
  },

  updateTeamMember: async (memberId: string, data: UpdateHiringTeamMemberData): Promise<HiringTeamMember> => {
    const response = await apiClient.put(`/hiring-teams/members/${memberId}`, data);
    return response.data.data;
  },

  removeTeamMember: async (memberId: string): Promise<void> => {
    await apiClient.delete(`/hiring-teams/members/${memberId}`);
  },

  // Search and other utilities
  searchUsers: async (query: string, limit?: number): Promise<SearchUserResult[]> => {
    const response = await apiClient.get('/hiring-teams/users/search', {
      params: { q: query, limit },
    });
    return response.data.data;
  },

  getTeamMembershipsByUser: async (userId: string): Promise<HiringTeamMember[]> => {
    const response = await apiClient.get(`/hiring-teams/user/${userId}/memberships`);
    return response.data.data;
  },

  // External access
  acceptInvitation: async (token: string, teamId: string): Promise<HiringTeamMember> => {
    const response = await apiClient.post(`/hiring-teams/members/accept-invitation/${token}/${teamId}`);
    return response.data.data;
  },

  verifyExternalAccess: async (token: string, teamId: string): Promise<{ hasAccess: boolean; teamMember?: HiringTeamMember }> => {
    const response = await apiClient.get(`/hiring-teams/members/verify-access/${token}/${teamId}`);
    return {
      hasAccess: response.data.hasAccess,
      teamMember: response.data.data,
    };
  },
};
