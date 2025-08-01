import apiClient from '../lib/api';

export interface Company {
  id: string;
  name: string;
  description?: string;
  type: 'internal_hr' | 'external_hr_agency' | 'freelance_hr' | 'startup' | 'enterprise' | 'consulting';
  size: '1' | '2-10' | '11-50' | '51-200' | '200+';
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  logoUrl?: string;
  brandColor?: string;
  ownerId: string;
  settings?: any;
  subscription?: any;
  totalEmployees: number;
  activeJobs: number;
  totalHires: number;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
  owner?: any;
  members?: CompanyMember[];
  departments?: any[];
}

export interface CompanyMember {
  id: string;
  companyId: string;
  userId: string;
  role: 'owner' | 'admin' | 'hr_manager' | 'recruiter' | 'coordinator' | 'viewer';
  status: 'active' | 'inactive' | 'pending_invitation' | 'suspended';
  title?: string;
  permissions?: any;
  departmentId?: string;
  invitedBy?: string;
  invitedAt?: Date;
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: any;
  department?: any;
  inviter?: any;
}

export interface CreateCompanyData {
  name: string;
  description?: string;
  type: Company['type'];
  size: Company['size'];
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  settings?: any;
}

export interface UpdateCompanyData {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  logoUrl?: string;
  brandColor?: string;
  settings?: any;
}

export interface InviteMemberData {
  email: string;
  role: CompanyMember['role'];
  title?: string;
  departmentId?: string;
  permissions?: any;
}

export interface UpdateMemberData {
  role?: CompanyMember['role'];
  title?: string;
  departmentId?: string;
  permissions?: any;
  status?: CompanyMember['status'];
}

export interface CompanyStats {
  memberCount: number;
  departmentCount: number;
  totalEmployees: number;
  activeJobs: number;
  totalHires: number;
}

export interface RecruitmentTeam {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  companyId: string;
  company?: Company;
  createdById: string;
  createdBy?: any;
  members?: RecruitmentTeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RecruitmentTeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'admin' | 'member';
  isActive: boolean;
  addedById: string;
  createdAt: Date;
  updatedAt: Date;
  user?: any;
}

export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface AddTeamMemberData {
  userId: string;
  role: RecruitmentTeamMember['role'];
}

class CompanyApiService {
  // Company CRUD
  async createCompany(data: CreateCompanyData): Promise<{ company: Company }> {
    const response = await apiClient.post('/companies', data);
    return response.data;
  }

  async getMyCompanies(): Promise<{ companies: Company[] }> {
    const response = await apiClient.get('/companies/my-companies');
    return response.data;
  }

  async getMemberCompanies(): Promise<{ companies: Company[] }> {
    const response = await apiClient.get('/companies/member-companies');
    return response.data;
  }

  async getCompany(id: string): Promise<{ company: Company }> {
    const response = await apiClient.get(`/companies/${id}`);
    return response.data;
  }

  async updateCompany(id: string, data: UpdateCompanyData): Promise<{ company: Company }> {
    const response = await apiClient.put(`/companies/${id}`, data);
    return response.data;
  }

  async deleteCompany(id: string): Promise<void> {
    await apiClient.delete(`/companies/${id}`);
  }

  // Company members
  async getCompanyMembers(companyId: string): Promise<{ members: CompanyMember[] }> {
    const response = await apiClient.get(`/companies/${companyId}/members`);
    return response.data;
  }

  async inviteMember(companyId: string, data: InviteMemberData): Promise<{ member: CompanyMember }> {
    const response = await apiClient.post(`/companies/${companyId}/members/invite`, data);
    return response.data;
  }

  async acceptInvitation(memberId: string): Promise<{ member: CompanyMember }> {
    const response = await apiClient.put(`/companies/members/${memberId}/accept`);
    return response.data;
  }

  async updateMember(companyId: string, memberId: string, data: UpdateMemberData): Promise<{ member: CompanyMember }> {
    const response = await apiClient.put(`/companies/${companyId}/members/${memberId}`, data);
    return response.data;
  }

  async removeMember(companyId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/companies/${companyId}/members/${memberId}`);
  }

  // Company departments
  async getCompanyDepartments(companyId: string): Promise<{ departments: any[] }> {
    const response = await apiClient.get(`/companies/${companyId}/departments`);
    return response.data;
  }

  async createDepartment(companyId: string, data: any): Promise<{ department: any }> {
    const response = await apiClient.post(`/companies/${companyId}/departments`, data);
    return response.data;
  }

  // Company statistics
  async getCompanyStats(companyId: string): Promise<{ stats: CompanyStats }> {
    const response = await apiClient.get(`/companies/${companyId}/stats`);
    return response.data;
  }

  // Company recruitment teams
  async getCompanyTeams(companyId: string): Promise<{ teams: RecruitmentTeam[] }> {
    const response = await apiClient.get(`/companies/${companyId}/teams`);
    return response.data;
  }

  async createCompanyTeam(companyId: string, data: CreateTeamData): Promise<{ team: RecruitmentTeam; message: string }> {
    const response = await apiClient.post(`/companies/${companyId}/teams`, data);
    return response.data;
  }

  async getCompanyTeam(companyId: string, teamId: string): Promise<{ team: RecruitmentTeam }> {
    const response = await apiClient.get(`/companies/${companyId}/teams/${teamId}`);
    return response.data;
  }

  async updateCompanyTeam(companyId: string, teamId: string, data: UpdateTeamData): Promise<{ team: RecruitmentTeam; message: string }> {
    const response = await apiClient.put(`/companies/${companyId}/teams/${teamId}`, data);
    return response.data;
  }

  async deleteCompanyTeam(companyId: string, teamId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/companies/${companyId}/teams/${teamId}`);
    return response.data;
  }

  async addTeamMember(companyId: string, teamId: string, data: AddTeamMemberData): Promise<{ member: RecruitmentTeamMember; message: string }> {
    const response = await apiClient.post(`/companies/${companyId}/teams/${teamId}/members`, data);
    return response.data;
  }

  async removeTeamMember(companyId: string, teamId: string, memberId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/companies/${companyId}/teams/${teamId}/members/${memberId}`);
    return response.data;
  }

  async updateTeamMemberRole(companyId: string, teamId: string, memberId: string, role: RecruitmentTeamMember['role']): Promise<{ member: RecruitmentTeamMember; message: string }> {
    const response = await apiClient.put(`/companies/${companyId}/teams/${teamId}/members/${memberId}/role`, { role });
    return response.data;
  }

  async toggleTeamMemberStatus(companyId: string, teamId: string, memberId: string): Promise<{ member: RecruitmentTeamMember; message: string }> {
    const response = await apiClient.put(`/companies/${companyId}/teams/${teamId}/members/${memberId}/toggle-status`);
    return response.data;
  }

  async syncTeamMembersToCompany(teamId: string): Promise<{ message: string; synced: number; skipped: number }> {
    const response = await apiClient.post(`/recruitment-teams/${teamId}/sync-members`);
    return response.data;
  }
}

export const companyApiService = new CompanyApiService();
