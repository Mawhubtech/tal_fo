import type { Organization } from './types';

// Mock organization data
const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'TechCorp Solutions',
    description: 'Leading technology solutions provider specializing in enterprise software development and cloud services.',
    departmentCount: 8,
    activeJobs: 12,
    totalEmployees: 1250,
    industry: 'Technology',
    location: 'San Francisco, CA'
  },
  {
    id: 'org-2',
    name: 'FinanceFirst',
    description: 'Innovative financial services company providing digital banking and investment solutions.',
    departmentCount: 6,
    activeJobs: 8,
    totalEmployees: 650,
    industry: 'Financial Services',
    location: 'New York, NY'
  },
  {
    id: 'org-3',
    name: 'HealthcarePlus',
    description: 'Comprehensive healthcare services provider with cutting-edge medical technology and patient care.',
    departmentCount: 12,
    activeJobs: 15,
    totalEmployees: 2100,
    industry: 'Healthcare',
    location: 'Boston, MA'
  },
  {
    id: 'org-4',
    name: 'GreenEnergy Co',
    description: 'Sustainable energy solutions company focused on renewable energy and environmental technology.',
    departmentCount: 5,
    activeJobs: 7,
    totalEmployees: 320,
    industry: 'Energy',
    location: 'Austin, TX'
  },
  {
    id: 'org-5',
    name: 'EduTech Innovations',
    description: 'Educational technology platform transforming learning experiences through innovative digital solutions.',
    departmentCount: 7,
    activeJobs: 9,
    totalEmployees: 450,
    industry: 'Education Technology',
    location: 'Seattle, WA'
  }
];

export class OrganizationService {
  // Simulate API delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAllOrganizations(): Promise<Organization[]> {
    await this.delay(500); // Simulate network delay
    return [...mockOrganizations];
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    await this.delay(300);
    return mockOrganizations.find(org => org.id === id) || null;
  }

  async searchOrganizations(query: string): Promise<Organization[]> {
    await this.delay(400);
    const lowerQuery = query.toLowerCase();
    return mockOrganizations.filter(org =>
      org.name.toLowerCase().includes(lowerQuery) ||
      org.description.toLowerCase().includes(lowerQuery) ||
      org.industry.toLowerCase().includes(lowerQuery) ||
      org.location.toLowerCase().includes(lowerQuery)
    );
  }

  async getOrganizationsByIndustry(industry: string): Promise<Organization[]> {
    await this.delay(300);
    return mockOrganizations.filter(org => org.industry === industry);
  }

  async createOrganization(organization: Omit<Organization, 'id'>): Promise<Organization> {
    await this.delay(600);
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      ...organization
    };
    // In a real app, this would be sent to the backend
    mockOrganizations.push(newOrg);
    return newOrg;
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    await this.delay(500);
    const orgIndex = mockOrganizations.findIndex(org => org.id === id);
    if (orgIndex === -1) return null;
    
    mockOrganizations[orgIndex] = { ...mockOrganizations[orgIndex], ...updates };
    return mockOrganizations[orgIndex];
  }

  async deleteOrganization(id: string): Promise<boolean> {
    await this.delay(400);
    const orgIndex = mockOrganizations.findIndex(org => org.id === id);
    if (orgIndex === -1) return false;
    
    mockOrganizations.splice(orgIndex, 1);
    return true;
  }
}
