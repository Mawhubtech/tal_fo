import { ClientApiService, Client, ClientQueryParams, ClientsResponse } from '../../../services/clientApiService';
import { jobApiService } from '../../../services/jobApiService';
import { DepartmentApiService, Department as BackendDepartment } from './departmentApiService';
import apiClient from '../../../services/api';

// Type mapping interface - clients ARE organizations
export interface Organization {
  id: string;
  name: string;
  description: string;
  departmentCount: number;
  activeJobs: number;
  totalEmployees: number;
  logoUrl?: string;
  industry: string;
  location: string;
  status: 'active' | 'inactive' | 'suspended';
}

// New interfaces for the organization page data endpoint
export interface OrganizationPageStats {
  organizations: number;
  departments: number;
  activeJobs: number;
  employees: number;
}

export interface OrganizationPageData {
  organizations: Organization[];
  stats: OrganizationPageStats;
  industries: string[];
}

// New interface for organization detail page data
export interface OrganizationDetailPageData {
  organization: Organization;
  departments: Department[];
  jobs: any[]; // Use Job type from your types
  stats: {
    totalJobs: number;
    activeDepartments: number;
    totalEmployees: number;
  };
}

// New interface for department jobs page data
export interface DepartmentJobsPageData {
  organization: Organization;
  department: Department;
  jobs: any[]; // Use Job type from your types
  stats: {
    totalJobs: number;
    activeJobs: number;
    totalApplicants: number;
  };
}

// New interface for job ATS page data (COMPREHENSIVE)
export interface JobATSPageData {
  job: any; // Use Job type from your types
  department: {
    id: string;
    name: string;
    description: string;
    manager: string;
    managerEmail: string;
    totalEmployees: number;
    color: string;
    icon: string;
    isActive: boolean;
    clientId: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  pipeline: any; // Use Pipeline type
  applications: any[]; // Use JobApplication type
  tasks: any[]; // Use Task type
  interviews: any[]; // Use Interview type
  taskStats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  applicationStats: Array<{
    stage: any;
    count: number;
  }>;
}

// New interface for departments page data (lighter than full detail page)
export interface DepartmentsPageData {
  organization: Organization;
  departments: Department[];
}

// Department interface - now uses backend data
export interface Department {
  id: string;
  name: string;
  description: string;
  manager: string;
  activeJobs: number;
  totalJobs: number;
  totalEmployees: number;
  color: string;
  icon: string;
}

export class OrganizationApiService {
  private clientApiService = new ClientApiService();
  private departmentApiService = new DepartmentApiService();
  /**
   * Convert client data to organization format
   */
  private async mapClientToOrganization(client: Client, includeDepartmentCount: boolean = false): Promise<Organization> {
    let departmentCount = 0;
    let activeJobs = client.openJobs; // Use client data as default
    
    // Only make additional API calls when specifically requested (e.g., for detail view)
    if (includeDepartmentCount) {
      try {
        const departments = await this.getDepartmentsByOrganization(client.id);
        departmentCount = departments.length;
        
        // Only get job stats for detail view, not for listing
        const jobStats = await jobApiService.getJobStats(client.id);
        activeJobs = jobStats.published;
      } catch (error) {
        console.error('Error getting detailed organization data:', error);
        // Fallback to client data
        departmentCount = 0;
        activeJobs = client.openJobs;
      }
    }
    
    return {
      id: client.id,
      name: client.name,
      description: client.description || '',
      departmentCount,
      activeJobs,
      totalEmployees: client.employees,
      logoUrl: client.logoUrl,
      industry: client.industry,
      location: client.location,
      status: client.status,
    };
  }
  /**
   * Get all organizations (using clients API) - for super-admin only
   */
  async getAllOrganizations(): Promise<Organization[]> {
    const response = await this.clientApiService.getAllClients();
    // Don't include department count for listing view to avoid excessive API calls
    return Promise.all(response.clients.map(client => this.mapClientToOrganization(client, false)));
  }

  /**
   * Get user's assigned organizations only
   */
  async getCurrentUserOrganizations(): Promise<Organization[]> {
    const response = await this.clientApiService.getCurrentUserClients();
    // Don't include department count for listing view to avoid excessive API calls
    return Promise.all(response.clients.map(client => this.mapClientToOrganization(client, false)));
  }
  /**
   * Get organization by ID
   */
  async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      const client = await this.clientApiService.getClientById(id);
      return this.mapClientToOrganization(client, true);
    } catch (error) {
      return null;
    }
  }
  /**
   * Search organizations
   */
  async searchOrganizations(query: string): Promise<Organization[]> {
    const response = await this.clientApiService.searchClients(query);
    return Promise.all(response.clients.map(client => this.mapClientToOrganization(client)));
  }
  /**
   * Get organizations by industry
   */
  async getOrganizationsByIndustry(industry: string): Promise<Organization[]> {
    const response = await this.clientApiService.getAllClients({ industry });
    return Promise.all(response.clients.map(client => this.mapClientToOrganization(client)));
  }  
  
  /**
   * Get all organization page data in a single request - for super-admin only
   */
  async getOrganizationPageData(): Promise<OrganizationPageData> {
    try {
      const response = await apiClient.get('/clients/organization-page-data');
      return response.data;
    } catch (error) {
      console.error('Error fetching organization page data:', error);
      throw error;
    }
  }

  /**
   * Get organization page data for current user's assigned clients
   */
  async getCurrentUserOrganizationPageData(): Promise<OrganizationPageData> {
    try {
      // Get user's assigned clients
      const organizations = await this.getCurrentUserOrganizations();
      
      // Calculate stats from the user's assigned organizations
      const stats: OrganizationPageStats = {
        organizations: organizations.length,
        departments: organizations.reduce((sum, org) => sum + org.departmentCount, 0),
        activeJobs: organizations.reduce((sum, org) => sum + org.activeJobs, 0),
        employees: organizations.reduce((sum, org) => sum + org.totalEmployees, 0),
      };

      // Get unique industries from user's organizations
      const industries = [...new Set(organizations.map(org => org.industry))].filter(Boolean);

      return {
        organizations,
        stats,
        industries,
      };
    } catch (error) {
      console.error('Error fetching current user organization page data:', error);
      throw error;
    }
  }

  /**
   * Get departments for an organization using the backend API
   */
  async getDepartmentsByOrganization(organizationId: string): Promise<Department[]> {
    try {
      const backendDepartments = await this.departmentApiService.getDepartmentsByClient(organizationId);
      
      // Map backend department data to frontend interface
      const departments: Department[] = await Promise.all(
        backendDepartments.map(async (dept) => {
          // Get jobs count for this department
          let activeJobs = 0;
          let totalJobs = 0;
          try {
            const jobsResponse = await jobApiService.getAllJobs({ 
              organizationId,
              departmentId: dept.id
            });
            totalJobs = jobsResponse.data.length;
            activeJobs = jobsResponse.data.filter(job => job.status === 'Published').length;
          } catch (error) {
            console.error('Error getting jobs count for department:', error);
          }
          
          return {
            id: dept.id,
            name: dept.name,
            description: dept.description || `${dept.name} department`,
            manager: dept.manager || 'Department Manager',
            activeJobs,
            totalJobs,
            totalEmployees: dept.totalEmployees,
            color: dept.color || this.getDepartmentColor(backendDepartments.indexOf(dept)),
            icon: dept.icon || this.getDepartmentIcon(dept.name)
          };
        })
      );

      return departments;
    } catch (error) {
      console.error('Error getting departments from backend:', error);
      // Fallback to old method if backend fails
      return this.getDepartmentsByOrganizationFallback(organizationId);
    }
  }

  /**
   * Fallback method for getting departments (derived from jobs data)
   */
  private async getDepartmentsByOrganizationFallback(organizationId: string): Promise<Department[]> {
    try {
      // Get all jobs for this organization
      const allJobsResponse = await jobApiService.getAllJobs({ organizationId });
      
      // Group jobs by department to create department data
      const departmentMap = new Map<string, {
        name: string;
        jobs: any[];
      }>();

      allJobsResponse.data.forEach(job => {
        const deptKey = job.departmentId || job.department || 'general';
        const deptName = job.department || 'General';
        
        if (!departmentMap.has(deptKey)) {
          departmentMap.set(deptKey, {
            name: deptName,
            jobs: []
          });
        }
        
        departmentMap.get(deptKey)!.jobs.push(job);
      });

      // Convert to Department objects
      const departments: Department[] = Array.from(departmentMap.entries()).map(([id, data], index) => ({
        id,
        name: data.name,
        description: `${data.name} department`,
        manager: 'Department Manager', // Mock data for now
        activeJobs: data.jobs.filter(job => job.status === 'Published').length,
        totalJobs: data.jobs.length,
        totalEmployees: Math.floor(Math.random() * 50) + 10, // Mock data for now
        color: this.getDepartmentColor(index),
        icon: this.getDepartmentIcon(data.name)
      }));

      return departments;
    } catch (error) {
      console.error('Error getting departments:', error);
      return [];
    }
  }
  /**
   * Get department by ID within an organization
   */
  async getDepartmentById(organizationId: string, departmentId: string): Promise<Department | null> {
    try {
      const backendDept = await this.departmentApiService.getDepartmentById(departmentId);
      
      // Get jobs count for this department
      let activeJobs = 0;
      let totalJobs = 0;
      try {
        const jobsResponse = await jobApiService.getAllJobs({ 
          organizationId,
          departmentId: backendDept.id
        });
        totalJobs = jobsResponse.data.length;
        activeJobs = jobsResponse.data.filter(job => job.status === 'Published').length;
      } catch (error) {
        console.error('Error getting jobs count for department:', error);
      }
      
      return {
        id: backendDept.id,
        name: backendDept.name,
        description: backendDept.description || `${backendDept.name} department`,
        manager: backendDept.manager || 'Department Manager',
        activeJobs,
        totalJobs,
        totalEmployees: backendDept.totalEmployees,
        color: backendDept.color || this.getDepartmentColor(0),
        icon: backendDept.icon || this.getDepartmentIcon(backendDept.name)
      };
    } catch (error) {
      console.error('Error getting department by ID:', error);
      return null;
    }
  }/**
   * Get jobs for a specific department
   */
  async getJobsByDepartment(organizationId: string, departmentId: string) {
    return jobApiService.getAllJobs({ 
      organizationId,
      departmentId
    });
  }

  /**
   * Get all jobs for an organization
   */
  async getJobsByOrganization(organizationId: string) {
    return jobApiService.getAllJobs({ 
      organizationId
    });
  }

  /**
   * Get all industries
   */
  async getIndustries(): Promise<string[]> {
    return this.clientApiService.getIndustries();
  }

  /**
   * Get all locations
   */
  async getLocations(): Promise<string[]> {
    return this.clientApiService.getLocations();
  }
  /**
   * Get organization statistics
   */
  async getStats(): Promise<{
    organizations: number;
    departments: number;
    activeJobs: number;
    employees: number;
  }> {
    try {
      // Get basic client stats (this should be lightweight)
      const clientStats = await this.clientApiService.getClientStats();
      
      return {
        organizations: clientStats.total,
        departments: 0, // Calculate from organizations data we already have
        activeJobs: clientStats.totalOpenJobs || 0, // Use client stats instead of fetching all jobs
        employees: 0, // Calculate if needed
      };
    } catch (error) {
      console.error('Error getting organization stats:', error);
      // Return fallback stats
      return {
        organizations: 0,
        departments: 0,
        activeJobs: 0,
        employees: 0,
      };
    }
  }

  /**
   * Get organization detail page data in a single request (OPTIMIZED)
   * This combines organization, departments, and jobs data to reduce API calls
   */
  async getOrganizationDetailPageData(organizationId: string): Promise<OrganizationDetailPageData> {
    try {
      // Use the new optimized organizations endpoint
      const response = await apiClient.get(`/organizations/${organizationId}/detail-page-data`);
      return response.data;
    } catch (error) {
      console.error('Error fetching organization detail page data:', error);
      
      // Fallback: make individual calls if combined endpoint fails
      console.warn('Falling back to individual API calls...');
      const [organization, departments, jobsResponse] = await Promise.all([
        this.getOrganizationById(organizationId),
        this.getDepartmentsByOrganization(organizationId),
        this.getJobsByOrganization(organizationId)
      ]);
      
      const jobs = jobsResponse?.data || [];
      
      return {
        organization,
        departments,
        jobs,
        stats: {
          totalJobs: jobs.length,
          activeDepartments: departments.filter(d => d.activeJobs > 0).length,
          totalEmployees: organization.totalEmployees
        }
      };
    }
  }

  /**
   * Get department jobs page data in a single request (OPTIMIZED)
   * This combines organization, department, and jobs data to reduce API calls
   */
  async getDepartmentJobsPageData(organizationId: string, departmentId: string): Promise<DepartmentJobsPageData> {
    try {
      // Use the new optimized organizations endpoint
      const response = await apiClient.get(`/organizations/${organizationId}/departments/${departmentId}/jobs-page-data`);
      return response.data;
    } catch (error) {
      console.error('Error fetching department jobs page data:', error);
      
      // Fallback: make individual calls if combined endpoint fails
      console.warn('Falling back to individual API calls...');
      const [organization, department, jobsResponse] = await Promise.all([
        this.getOrganizationById(organizationId),
        this.getDepartmentById(organizationId, departmentId),
        this.getJobsByDepartment(organizationId, departmentId)
      ]);
      
      const jobs = jobsResponse?.data || [];
      
      return {
        organization,
        department,
        jobs,
        stats: {
          totalJobs: jobs.length,
          activeJobs: jobs.filter(j => j.status === 'Published').length,
          totalApplicants: jobs.reduce((sum, job) => sum + (job.applicantsCount || 0), 0)
        }
      };
    }
  }

  /**
   * Get job ATS page data in a single request (SUPER OPTIMIZED)
   * This combines ALL data needed for the Job ATS page to reduce API calls from 12+ to 1
   */
  async getJobATSPageData(organizationId: string, jobId: string): Promise<JobATSPageData> {
    try {
      // Use the new super optimized endpoint
      const response = await apiClient.get(`/organizations/${organizationId}/jobs/${jobId}/ats-page-data`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job ATS page data:', error);
      
      // Fallback: make individual calls if combined endpoint fails
      console.warn('Falling back to individual API calls...');
      const [jobResponse] = await Promise.all([
        jobApiService.getJobById(jobId)
      ]);
      
      // For fallback, return minimal data structure
      return {
        job: jobResponse,
        department: null, // No department data available in fallback
        pipeline: null,
        applications: [],
        tasks: [],
        interviews: [],
        taskStats: { total: 0, completed: 0, pending: 0, overdue: 0 },
        applicationStats: []
      };
    }
  }

  /**
   * Get departments page data in a single request (OPTIMIZED)
   * This combines organization and departments data to reduce API calls
   */
  async getDepartmentsPageData(organizationId: string): Promise<DepartmentsPageData> {
    try {
      // Use the new optimized organizations endpoint
      const response = await apiClient.get(`/organizations/${organizationId}/departments-page-data`);
      return response.data;
    } catch (error) {
      console.error('Error fetching departments page data:', error);
      
      // Fallback: make individual calls if combined endpoint fails
      console.warn('Falling back to individual API calls...');
      const [organization, departments] = await Promise.all([
        this.getOrganizationById(organizationId),
        this.getDepartmentsByOrganization(organizationId)
      ]);
      
      return {
        organization,
        departments
      };
    }
  }

  /**
   * Helper method to get department color based on index
   */
  private getDepartmentColor(index: number): string {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-gray-500'
    ];
    return colors[index % colors.length];
  }

  /**
   * Helper method to get department icon based on name
   */
  private getDepartmentIcon(name: string): string {
    const iconMap: Record<string, string> = {
      'Engineering': '💻',
      'Product': '🎯',
      'Design': '🎨',
      'Marketing': '📈',
      'Sales': '💼',
      'HR': '👥',
      'Human Resources': '👥',
      'Finance': '💰',
      'Operations': '⚙️',
      'Legal': '⚖️',
      'Research': '🔬',
      'Development': '🔧',
      'Customer Support': '🎧',
      'IT': '🖥️',
      'Security': '🔐',
      'General': '🏢'
    };
    
    // Find matching icon or default
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    return '🏢'; // Default icon
  }
}
