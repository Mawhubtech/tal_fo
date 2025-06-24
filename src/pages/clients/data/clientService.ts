import { OrganizationService } from '../../../recruitment/organizations/data/organizationService';
import { DepartmentService } from '../../../recruitment/organizations/data/departmentService';
import type { Organization } from '../../../recruitment/organizations/data/types';

// Client interface matching backend entity
export interface Client {
  id: string;
  name: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  employees: number;
  openJobs: number;
  totalHires: number;
  description?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
}

// Mock additional client data to supplement organization data
const clientContactInfo: Record<string, {
  email: string;
  phone: string;
  website: string;
  createdDate: string;
  lastActivity: string;
}> = {
  'org-1': {
    email: 'hr@technovate.com',
    phone: '+1 (555) 123-4567',
    website: 'https://technovate.com',
    createdDate: '2023-01-15',
    lastActivity: '2024-06-08'
  },
  'org-2': {
    email: 'careers@fintechpro.com',
    phone: '+1 (555) 234-5678',
    website: 'https://fintechpro.com',
    createdDate: '2023-03-20',
    lastActivity: '2024-06-07'
  },
  'org-3': {
    email: 'jobs@healthcarefirst.com',
    phone: '+1 (555) 345-6789',
    website: 'https://healthcarefirst.com',
    createdDate: '2022-11-10',
    lastActivity: '2024-06-06'
  },
  'org-4': {
    email: 'talent@greenenergy.com',
    phone: '+1 (555) 456-7890',
    website: 'https://greenenergy.com',
    createdDate: '2023-05-15',
    lastActivity: '2024-05-20'
  }
};

export class ClientService {
  private organizationService = new OrganizationService();
  private departmentService = new DepartmentService();

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private mapOrganizationToClient(org: Organization, contactInfo: any, totalOpenJobs: number, totalEmployees: number): Client {
    return {
      id: org.id,
      name: org.name,
      industry: org.industry,
      size: this.mapEmployeeCountToSize(totalEmployees),
      location: org.location,
      description: org.description,
      logoUrl: org.logoUrl,
      status: totalOpenJobs > 0 ? 'active' : 'inactive',
      employees: totalEmployees,
      openJobs: totalOpenJobs,
      totalHires: Math.floor(totalOpenJobs * 1.5), // Mock calculation
      totalOpenJobs,
      totalEmployees,
      ...contactInfo
    };
  }

  private mapEmployeeCountToSize(employeeCount: number): string {
    if (employeeCount <= 50) return 'Small (1-50 employees)';
    if (employeeCount <= 200) return 'Medium (51-200 employees)';
    if (employeeCount <= 1000) return 'Large (201-1000 employees)';
    return 'Enterprise (1000+ employees)';
  }

  async getAllClients(): Promise<Client[]> {
    await this.delay(400);
    const organizations = await this.organizationService.getAllOrganizations();
    
    // Convert organizations to clients and calculate additional metrics
    const clients: Client[] = await Promise.all(
      organizations.map(async (org) => {
        const departments = await this.departmentService.getDepartmentsByOrganization(org.id);
        
        const totalOpenJobs = departments.reduce((sum, dept) => sum + dept.activeJobs, 0);
        const totalEmployees = departments.reduce((sum, dept) => sum + dept.totalEmployees, 0);
        
        const contactInfo = clientContactInfo[org.id] || {
          email: `hr@${org.name.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: '+1 (555) 000-0000',
          website: `https://${org.name.toLowerCase().replace(/\s+/g, '')}.com`,
          createdDate: '2023-01-01',
          lastActivity: '2024-06-01'
        };

        return this.mapOrganizationToClient(org, contactInfo, totalOpenJobs, totalEmployees);
      })
    );

    return clients;
  }

  async getClientById(clientId: string): Promise<Client | null> {
    await this.delay(300);
    const organization = await this.organizationService.getOrganizationById(clientId);
    
    if (!organization) return null;

    const departments = await this.departmentService.getDepartmentsByOrganization(clientId);
    const totalOpenJobs = departments.reduce((sum, dept) => sum + dept.activeJobs, 0);
    const totalEmployees = departments.reduce((sum, dept) => sum + dept.totalEmployees, 0);

    const contactInfo = clientContactInfo[clientId] || {
      email: `hr@${organization.name.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: '+1 (555) 000-0000',
      website: `https://${organization.name.toLowerCase().replace(/\s+/g, '')}.com`,
      createdDate: '2023-01-01',
      lastActivity: '2024-06-01'
    };

    return this.mapOrganizationToClient(organization, contactInfo, totalOpenJobs, totalEmployees);
  }

  async searchClients(query: string): Promise<Client[]> {
    await this.delay(350);
    const allClients = await this.getAllClients();
    const lowerQuery = query.toLowerCase();
    
    return allClients.filter(client =>
      client.name.toLowerCase().includes(lowerQuery) ||
      client.industry.toLowerCase().includes(lowerQuery) ||
      client.location.toLowerCase().includes(lowerQuery) ||
      (client.description && client.description.toLowerCase().includes(lowerQuery))
    );
  }

  async getClientsByIndustry(industry: string): Promise<Client[]> {
    await this.delay(300);
    const allClients = await this.getAllClients();
    return allClients.filter(client => client.industry === industry);
  }

  async getClientsBySize(size: string): Promise<Client[]> {
    await this.delay(300);
    const allClients = await this.getAllClients();
    return allClients.filter(client => client.size.includes(size));
  }

  async getClientsByStatus(status: string): Promise<Client[]> {
    await this.delay(300);
    const allClients = await this.getAllClients();
    return allClients.filter(client => client.status === status);
  }

  // Get departments for a specific client
  async getClientDepartments(clientId: string) {
    return this.departmentService.getDepartmentsByOrganization(clientId);
  }

  // Get jobs for a specific client department
  async getClientDepartmentJobs(clientId: string, departmentId: string) {
    // This would typically call a job service
    // For now, return mock data based on department activeJobs
    const department = await this.departmentService.getDepartmentById(clientId, departmentId);
    return department ? department.activeJobs : 0;
  }
}
