import { Organization } from './types';

// Mock organizations data
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

// Service class for organization operations
export class OrganizationService {
  // Get all organizations
  static async getAllOrganizations(): Promise<Organization[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockOrganizations;
  }

  // Get organization by ID
  static async getOrganizationById(id: string): Promise<Organization | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockOrganizations.find(org => org.id === id) || null;
  }

  // Get organizations by industry
  static async getOrganizationsByIndustry(industry: string): Promise<Organization[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockOrganizations.filter(org => org.industry === industry);
  }

  // Search organizations
  static async searchOrganizations(query: string): Promise<Organization[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const lowercaseQuery = query.toLowerCase();
    return mockOrganizations.filter(org =>
      org.name.toLowerCase().includes(lowercaseQuery) ||
      org.description.toLowerCase().includes(lowercaseQuery) ||
      org.location.toLowerCase().includes(lowercaseQuery) ||
      org.industry.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get unique industries
  static async getIndustries(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return [...new Set(mockOrganizations.map(org => org.industry))];
  }

  // Get organization statistics
  static async getOrganizationStats() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      totalOrganizations: mockOrganizations.length,
      totalDepartments: mockOrganizations.reduce((sum, org) => sum + org.departmentCount, 0),
      totalActiveJobs: mockOrganizations.reduce((sum, org) => sum + org.activeJobs, 0),
      totalEmployees: mockOrganizations.reduce((sum, org) => sum + org.totalEmployees, 0)
    };
  }
}

// Export mock data for direct access (temporary, will be removed when connecting to backend)
export { mockOrganizations };
