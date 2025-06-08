import type { Department } from './types';

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
      description: 'Clinical operations and patient care services.',
      manager: 'Dr. Sarah Williams',
      activeJobs: 8,
      totalEmployees: 850,
      color: 'bg-red-500',
      icon: '🏥'
    },
    {
      id: 'research',
      name: 'Research & Development',
      description: 'Medical research and innovative treatment development.',
      manager: 'Dr. Michael Chang',
      activeJobs: 4,
      totalEmployees: 125,
      color: 'bg-blue-500',
      icon: '🔬'
    },
    {
      id: 'nursing',
      name: 'Nursing',
      description: 'Patient care and nursing services coordination.',
      manager: 'Jennifer Martinez RN',
      activeJobs: 6,
      totalEmployees: 420,
      color: 'bg-green-500',
      icon: '👩‍⚕️'
    },
    {
      id: 'admin',
      name: 'Administration',
      description: 'Healthcare administration and support services.',
      manager: 'Robert Johnson',
      activeJobs: 3,
      totalEmployees: 180,      color: 'bg-purple-500',
      icon: '📋'
    }
  ],
  'org-4': [
    {
      id: 'eng',
      name: 'Engineering',
      description: 'Renewable energy technology development and system engineering.',
      manager: 'Dr. Susan Green',
      activeJobs: 3,
      totalEmployees: 85,
      color: 'bg-blue-500',
      icon: '💻'
    },
    {
      id: 'sales',
      name: 'Sales',
      description: 'Energy solutions sales and client relationship management.',
      manager: 'Mark Thompson',
      activeJobs: 2,
      totalEmployees: 45,
      color: 'bg-orange-500',
      icon: '💼'
    },
    {
      id: 'operations',
      name: 'Operations',
      description: 'Energy production operations and facility management.',
      manager: 'Lisa Chen',
      activeJobs: 1,
      totalEmployees: 120,
      color: 'bg-gray-500',
      icon: '⚙️'
    },
    {
      id: 'research',
      name: 'Research & Development',
      description: 'Sustainable energy research and innovation.',
      manager: 'Dr. James Wilson',
      activeJobs: 1,
      totalEmployees: 35,
      color: 'bg-green-500',
      icon: '🔬'
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Financial planning and energy project financing.',
      manager: 'Maria Rodriguez',
      activeJobs: 0,
      totalEmployees: 20,
      color: 'bg-indigo-500',
      icon: '💰'
    }
  ]
};

export class DepartmentService {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getDepartmentsByOrganization(organizationId: string): Promise<Department[]> {
    await this.delay(400);
    return mockDepartmentsByOrg[organizationId] || [];
  }

  async getDepartmentById(organizationId: string, departmentId: string): Promise<Department | null> {
    await this.delay(300);
    const departments = mockDepartmentsByOrg[organizationId] || [];
    return departments.find(dept => dept.id === departmentId) || null;
  }

  async searchDepartments(organizationId: string, query: string): Promise<Department[]> {
    await this.delay(350);
    const departments = mockDepartmentsByOrg[organizationId] || [];
    const lowerQuery = query.toLowerCase();
    
    return departments.filter(dept =>
      dept.name.toLowerCase().includes(lowerQuery) ||
      dept.description.toLowerCase().includes(lowerQuery) ||
      dept.manager.toLowerCase().includes(lowerQuery)
    );
  }

  async createDepartment(organizationId: string, department: Omit<Department, 'id'>): Promise<Department> {
    await this.delay(500);
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      ...department
    };
    
    if (!mockDepartmentsByOrg[organizationId]) {
      mockDepartmentsByOrg[organizationId] = [];
    }
    mockDepartmentsByOrg[organizationId].push(newDept);
    
    return newDept;
  }

  async updateDepartment(organizationId: string, departmentId: string, updates: Partial<Department>): Promise<Department | null> {
    await this.delay(450);
    const departments = mockDepartmentsByOrg[organizationId] || [];
    const deptIndex = departments.findIndex(dept => dept.id === departmentId);
    
    if (deptIndex === -1) return null;
    
    departments[deptIndex] = { ...departments[deptIndex], ...updates };
    return departments[deptIndex];
  }

  async deleteDepartment(organizationId: string, departmentId: string): Promise<boolean> {
    await this.delay(400);
    const departments = mockDepartmentsByOrg[organizationId] || [];
    const deptIndex = departments.findIndex(dept => dept.id === departmentId);
    
    if (deptIndex === -1) return false;
    
    departments.splice(deptIndex, 1);
    return true;
  }
}
