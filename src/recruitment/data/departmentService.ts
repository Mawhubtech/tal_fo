import { Department } from './types';

// Mock departments data by organization
const mockDepartmentsByOrg: Record<string, Department[]> = {
  'org-1': [
    {
      id: 'eng',
      name: 'Engineering',
      description: 'Software development, DevOps, and technical infrastructure teams.',
      manager: 'Sarah Johnson',
      activeJobs: 8,
      totalEmployees: 450,
      color: 'bg-blue-500',
      icon: '💻'
    },
    {
      id: 'product',
      name: 'Product',
      description: 'Product management, strategy, and user experience design.',
      manager: 'Michael Chen',
      activeJobs: 3,
      totalEmployees: 85,
      color: 'bg-green-500',
      icon: '🎯'
    },
    {
      id: 'design',
      name: 'Design',
      description: 'UI/UX design, visual design, and design systems.',
      manager: 'Emily Rodriguez',
      activeJobs: 2,
      totalEmployees: 45,
      color: 'bg-purple-500',
      icon: '🎨'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Digital marketing, brand management, and growth strategies.',
      manager: 'David Kim',
      activeJobs: 4,
      totalEmployees: 120,
      color: 'bg-pink-500',
      icon: '📈'
    },
    {
      id: 'sales',
      name: 'Sales',
      description: 'Business development, account management, and revenue growth.',
      manager: 'Lisa Wang',
      activeJobs: 3,
      totalEmployees: 95,
      color: 'bg-orange-500',
      icon: '💼'
    },
    {
      id: 'hr',
      name: 'Human Resources',
      description: 'Talent acquisition, employee relations, and organizational development.',
      manager: 'James Wilson',
      activeJobs: 2,
      totalEmployees: 35,
      color: 'bg-teal-500',
      icon: '👥'
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Financial planning, accounting, and corporate finance.',
      manager: 'Maria Garcia',
      activeJobs: 1,
      totalEmployees: 28,
      color: 'bg-indigo-500',
      icon: '💰'
    },
    {
      id: 'operations',
      name: 'Operations',
      description: 'Business operations, IT support, and administrative functions.',
      manager: 'Robert Taylor',
      activeJobs: 2,
      totalEmployees: 65,
      color: 'bg-gray-500',
      icon: '⚙️'
    }
  ],
  'org-2': [
    {
      id: 'eng',
      name: 'Engineering',
      description: 'Financial technology development and platform engineering.',
      manager: 'Alex Thompson',
      activeJobs: 5,
      totalEmployees: 180,
      color: 'bg-blue-500',
      icon: '💻'
    },
    {
      id: 'product',
      name: 'Product',
      description: 'Financial product management and strategy.',
      manager: 'Jennifer Lee',
      activeJobs: 2,
      totalEmployees: 45,
      color: 'bg-green-500',
      icon: '🎯'
    },
    {
      id: 'compliance',
      name: 'Compliance',
      description: 'Regulatory compliance and risk management.',
      manager: 'Thomas Brown',
      activeJobs: 3,
      totalEmployees: 55,
      color: 'bg-red-500',
      icon: '⚖️'
    },
    {
      id: 'sales',
      name: 'Sales',
      description: 'Financial services sales and client relationship management.',
      manager: 'Amanda Davis',
      activeJobs: 4,
      totalEmployees: 85,
      color: 'bg-orange-500',
      icon: '💼'
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Corporate finance and financial planning & analysis.',
      manager: 'Kevin Martinez',
      activeJobs: 2,
      totalEmployees: 35,
      color: 'bg-indigo-500',
      icon: '💰'
    },
    {
      id: 'operations',
      name: 'Operations',
      description: 'Financial operations and customer support.',
      manager: 'Rachel Kim',
      activeJobs: 3,
      totalEmployees: 75,
      color: 'bg-gray-500',
      icon: '⚙️'
    }
  ],
  'org-3': [
    {
      id: 'medical',
      name: 'Medical',
      description: 'Healthcare professionals and medical specialists.',
      manager: 'Dr. Sarah Williams',
      activeJobs: 8,
      totalEmployees: 850,
      color: 'bg-blue-500',
      icon: '🏥'
    },
    {
      id: 'nursing',
      name: 'Nursing',
      description: 'Nursing staff and patient care specialists.',
      manager: 'Mary Johnson',
      activeJobs: 12,
      totalEmployees: 650,
      color: 'bg-green-500',
      icon: '👩‍⚕️'
    },
    {
      id: 'research',
      name: 'Research',
      description: 'Medical research and clinical trials.',
      manager: 'Dr. Michael Chen',
      activeJobs: 4,
      totalEmployees: 120,
      color: 'bg-purple-500',
      icon: '🔬'
    },
    {
      id: 'admin',
      name: 'Administration',
      description: 'Healthcare administration and management.',
      manager: 'Jennifer Davis',
      activeJobs: 3,
      totalEmployees: 180,
      color: 'bg-orange-500',
      icon: '📋'
    }
  ]
};

// Service class for department operations
export class DepartmentService {
  // Get departments by organization ID
  static async getDepartmentsByOrganization(organizationId: string): Promise<Department[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockDepartmentsByOrg[organizationId] || [];
  }

  // Get department by organization and department ID
  static async getDepartmentById(organizationId: string, departmentId: string): Promise<Department | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const departments = mockDepartmentsByOrg[organizationId] || [];
    return departments.find(dept => dept.id === departmentId) || null;
  }

  // Search departments within an organization
  static async searchDepartments(organizationId: string, query: string): Promise<Department[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const departments = mockDepartmentsByOrg[organizationId] || [];
    const lowercaseQuery = query.toLowerCase();
    
    return departments.filter(dept =>
      dept.name.toLowerCase().includes(lowercaseQuery) ||
      dept.description.toLowerCase().includes(lowercaseQuery) ||
      dept.manager.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get department statistics for an organization
  static async getDepartmentStats(organizationId: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const departments = mockDepartmentsByOrg[organizationId] || [];
    
    return {
      totalDepartments: departments.length,
      totalActiveJobs: departments.reduce((sum, dept) => sum + dept.activeJobs, 0),
      totalEmployees: departments.reduce((sum, dept) => sum + dept.totalEmployees, 0)
    };
  }
}

// Export mock data for direct access (temporary, will be removed when connecting to backend)
export { mockDepartmentsByOrg };
