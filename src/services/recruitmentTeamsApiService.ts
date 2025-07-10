import apiClient from '../lib/api';

export interface RecruitmentTeam {
  id: string;
  name: string;
  description?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  members?: RecruitmentTeamMember[];
}

export interface RecruitmentTeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'admin' | 'member';
  isActive: boolean;
  addedById: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateRecruitmentTeamDto {
  name: string;
  description?: string;
}

export interface UpdateRecruitmentTeamDto {
  name?: string;
  description?: string;
}

export interface AddTeamMemberDto {
  userId: string;
  role: 'admin' | 'member';
}

export interface UpdateTeamMemberDto {
  role: 'admin' | 'member';
}

export class RecruitmentTeamsApiService {
  // Team management
  static async createTeam(data: CreateRecruitmentTeamDto): Promise<RecruitmentTeam> {
    const response = await apiClient.post('/recruitment-teams', data);
    return response.data;
  }

  static async getMyTeams(): Promise<RecruitmentTeam[]> {
    const response = await apiClient.get('/recruitment-teams/my-teams');
    return response.data;
  }

  static async getTeamById(teamId: string): Promise<RecruitmentTeam> {
    const response = await apiClient.get(`/recruitment-teams/${teamId}`);
    return response.data;
  }

  static async updateTeam(teamId: string, data: UpdateRecruitmentTeamDto): Promise<RecruitmentTeam> {
    const response = await apiClient.patch(`/recruitment-teams/${teamId}`, data);
    return response.data;
  }

  static async deleteTeam(teamId: string): Promise<void> {
    await apiClient.delete(`/recruitment-teams/${teamId}`);
  }

  // Team member management
  static async addTeamMember(teamId: string, data: AddTeamMemberDto): Promise<RecruitmentTeamMember> {
    const response = await apiClient.post(`/recruitment-teams/${teamId}/members`, data);
    return response.data;
  }

  static async updateTeamMember(teamId: string, memberId: string, data: UpdateTeamMemberDto): Promise<RecruitmentTeamMember> {
    const response = await apiClient.patch(`/recruitment-teams/${teamId}/members/${memberId}`, data);
    return response.data;
  }

  static async removeTeamMember(teamId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/recruitment-teams/${teamId}/members/${memberId}`);
  }

  static async getTeamMembers(teamId: string): Promise<RecruitmentTeamMember[]> {
    const response = await apiClient.get(`/recruitment-teams/${teamId}/members`);
    return response.data;
  }
}
