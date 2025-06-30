import { ClientApiService, Client, ClientQueryParams, ClientsResponse } from '../../../services/clientApiService';
import { jobApiService } from '../../../services/jobApiService';
import { DepartmentApiService, Department as BackendDepartment } from './departmentApiService';

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
}

// Department interface - now uses backend data
export interface Department {
  id: string;
  name: string;
  description: string;
  manager: string;
  activeJobs: number;
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
    let activeJobs = 0;
    
    if (includeDepartmentCount) {
      try {
        const departments = await this.getDepartmentsByOrganization(client.id);
        departmentCount = departments.length;
      } catch (error) {
        console.error('Error getting department count:', error);
      }
    }

    // Get actual active jobs count from jobs table instead of using client.openJobs
    try {
      const jobStats = await jobApiService.getJobStats(client.id);
      activeJobs = jobStats.active;
    } catch (error) {
      console.error('Error getting active jobs count:', error);
      // Fallback to client.openJobs if job stats API fails
      activeJobs = client.openJobs;
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
    };
  }
  /**
   * Get all organizations (using clients API)
   */
  async getAllOrganizations(): Promise<Organization[]> {
    const response = await this.clientApiService.getAllClients();
    return Promise.all(response.clients.map(client => this.mapClientToOrganization(client, true)));
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
  }  /**
   * Get departments for an organization using the backend API
   */
  async getDepartmentsByOrganization(organizationId: string): Promise<Department[]> {
    try {
      const backendDepartments = await this.departmentApiService.getDepartmentsByClient(organizationId);
      
      // Map backend department data to frontend interface
      const departments: Department[] = await Promise.all(
        backendDepartments.map(async (dept) => {
          // Get active jobs count for this department
          let activeJobs = 0;
          try {
            const jobsResponse = await jobApiService.getAllJobs({ 
              organizationId,
              departmentId: dept.id
            });
            activeJobs = jobsResponse.data.filter(job => job.status === 'Active').length;
          } catch (error) {
            console.error('Error getting jobs count for department:', error);
          }
          
          return {
            id: dept.id,
            name: dept.name,
            description: dept.description || `${dept.name} department`,
            manager: dept.manager || 'Department Manager',
            activeJobs,
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
        activeJobs: data.jobs.filter(job => job.status === 'Active').length,
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
      
      // Get active jobs count for this department
      let activeJobs = 0;
      try {
        const jobsResponse = await jobApiService.getAllJobs({ 
          organizationId,
          departmentId: backendDept.id
        });
        activeJobs = jobsResponse.data.filter(job => job.status === 'Active').length;
      } catch (error) {
        console.error('Error getting jobs count for department:', error);
      }
      
      return {
        id: backendDept.id,
        name: backendDept.name,
        description: backendDept.description || `${backendDept.name} department`,
        manager: backendDept.manager || 'Department Manager',
        activeJobs,
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
    const [clientStats, allJobsResponse] = await Promise.all([
      this.clientApiService.getClientStats(),
      jobApiService.getAllJobs()
    ]);

    // Count unique departments across all organizations
    const departmentSet = new Set<string>();
    // Count actual active jobs from jobs table
    let activeJobsCount = 0;
    
    allJobsResponse.data.forEach(job => {
      if (job.organizationId && (job.departmentId || job.department)) {
        departmentSet.add(`${job.organizationId}-${job.departmentId || job.department}`);
      }
      // Count active jobs
      if (job.status.toLowerCase() === 'active') {
        activeJobsCount++;
      }
    });

    return {
      organizations: clientStats.total,
      departments: departmentSet.size,
      activeJobs: activeJobsCount,
      employees: 0, // Sum from individual clients if needed
    };
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
