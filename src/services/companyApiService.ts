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
  targetOwnerId?: string; // For super admin to assign ownership to another user
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
  type?: string;
  size?: string;
  status?: string;
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

  async getAllCompanies(): Promise<{ companies: Company[] }> {
    const response = await apiClient.get('/companies/all-companies');
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
}

export const companyApiService = new CompanyApiService();
