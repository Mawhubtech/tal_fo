import { Job } from './types';

// Mock jobs data by organization
const mockJobsByOrg: Record<string, Job[]> = {
  'org-1': [
    {
      id: 'job-1',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      departmentId: 'eng',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'Active',
      applicants: 45,
      postedDate: '2 days ago',
      urgency: 'High',
      salary: {
        min: 140000,
        max: 180000,
        currency: '$'
      }
    },
    {
      id: 'job-2',
      title: 'Product Manager',
      department: 'Product',
      departmentId: 'product',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'Active',
      applicants: 28,
      postedDate: '1 week ago',
      urgency: 'Medium',
      salary: {
        min: 120000,
        max: 160000,
        currency: '$'
      }
    },
    {
      id: 'job-3',
      title: 'UI/UX Designer',
      department: 'Design',
      departmentId: 'design',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'Active',
      applicants: 32,
      postedDate: '3 days ago',
      urgency: 'Medium',
      salary: {
        min: 90000,
        max: 130000,
        currency: '$'
      }
    },
    {
      id: 'job-4',
      title: 'DevOps Engineer',
      department: 'Engineering',
      departmentId: 'eng',
      location: 'Remote',
      type: 'Full-time',
      status: 'Active',
      applicants: 18,
      postedDate: '5 days ago',
      urgency: 'High',
      salary: {
        min: 130000,
        max: 170000,
        currency: '$'
      }
    },
    {
      id: 'job-5',
      title: 'Marketing Specialist',
      department: 'Marketing',
      departmentId: 'marketing',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'Draft',
      applicants: 0,
      postedDate: '1 day ago',
      urgency: 'Low',
      salary: {
        min: 70000,
        max: 90000,
        currency: '$'
      }
    },
    {
      id: 'job-6',
      title: 'Sales Development Representative',
      department: 'Sales',
      departmentId: 'sales',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'Active',
      applicants: 22,
      postedDate: '4 days ago',
      urgency: 'Medium',
      salary: {
        min: 60000,
        max: 85000,
        currency: '$'
      }
    },
    {
      id: 'job-7',
      title: 'HR Business Partner',
      department: 'Human Resources',
      departmentId: 'hr',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'Active',
      applicants: 15,
      postedDate: '6 days ago',
      urgency: 'Medium',
      salary: {
        min: 95000,
        max: 125000,
        currency: '$'
      }
    },
    {
      id: 'job-8',
      title: 'Financial Analyst',
      department: 'Finance',
      departmentId: 'finance',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'Active',
      applicants: 12,
      postedDate: '1 week ago',
      urgency: 'Low',
      salary: {
        min: 80000,
        max: 110000,
        currency: '$'
      }
    }
  ],
  'org-2': [
    {
      id: 'job-9',
      title: 'Senior Financial Analyst',
      department: 'Finance',
      departmentId: 'finance',
      location: 'New York, NY',
      type: 'Full-time',
      status: 'Active',
      applicants: 22,
      postedDate: '4 days ago',
      urgency: 'Medium',
      salary: {
        min: 95000,
        max: 125000,
        currency: '$'
      }
    },
    {
      id: 'job-10',
      title: 'Compliance Officer',
      department: 'Compliance',
      departmentId: 'compliance',
      location: 'New York, NY',
      type: 'Full-time',
      status: 'Active',
      applicants: 15,
      postedDate: '1 week ago',
      urgency: 'High',
      salary: {
        min: 110000,
        max: 140000,
        currency: '$'
      }
    },
    {
      id: 'job-11',
      title: 'Frontend Developer',
      department: 'Engineering',
      departmentId: 'eng',
      location: 'New York, NY',
      type: 'Full-time',
      status: 'Active',
      applicants: 35,
      postedDate: '3 days ago',
      urgency: 'Medium',
      salary: {
        min: 120000,
        max: 150000,
        currency: '$'
      }
    },
    {
      id: 'job-12',
      title: 'Sales Manager',
      department: 'Sales',
      departmentId: 'sales',
      location: 'New York, NY',
      type: 'Full-time',
      status: 'Draft',
      applicants: 0,
      postedDate: '2 days ago',
      urgency: 'Low',
      salary: {
        min: 100000,
        max: 140000,
        currency: '$'
      }
    }
  ],
  'org-3': [
    {
      id: 'job-13',
      title: 'Registered Nurse',
      department: 'Nursing',
      departmentId: 'nursing',
      location: 'Boston, MA',
      type: 'Full-time',
      status: 'Active',
      applicants: 42,
      postedDate: '2 days ago',
      urgency: 'High',
      salary: {
        min: 75000,
        max: 95000,
        currency: '$'
      }
    },
    {
      id: 'job-14',
      title: 'Emergency Medicine Physician',
      department: 'Medical',
      departmentId: 'medical',
      location: 'Boston, MA',
      type: 'Full-time',
      status: 'Active',
      applicants: 8,
      postedDate: '1 week ago',
      urgency: 'High',
      salary: {
        min: 280000,
        max: 350000,
        currency: '$'
      }
    },
    {
      id: 'job-15',
      title: 'Clinical Research Coordinator',
      department: 'Research',
      departmentId: 'research',
      location: 'Boston, MA',
      type: 'Full-time',
      status: 'Active',
      applicants: 18,
      postedDate: '5 days ago',
      urgency: 'Medium',
      salary: {
        min: 55000,
        max: 70000,
        currency: '$'
      }
    }
  ]
};

// Service class for job operations
export class JobService {
  // Get all jobs across all organizations
  static async getAllJobs(): Promise<Job[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Object.values(mockJobsByOrg).flat();
  }

  // Get all jobs by organization ID
  static async getJobsByOrganization(organizationId: string): Promise<Job[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockJobsByOrg[organizationId] || [];
  }

  // Get jobs by organization and department
  static async getJobsByDepartment(organizationId: string, departmentId: string): Promise<Job[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const allJobs = mockJobsByOrg[organizationId] || [];
    return allJobs.filter(job => job.departmentId === departmentId);
  }

  // Get job by ID
  static async getJobById(organizationId: string, jobId: string): Promise<Job | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const allJobs = mockJobsByOrg[organizationId] || [];
    return allJobs.find(job => job.id === jobId) || null;
  }

  // Search jobs within an organization
  static async searchJobs(organizationId: string, query: string): Promise<Job[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const allJobs = mockJobsByOrg[organizationId] || [];
    const lowercaseQuery = query.toLowerCase();
    
    return allJobs.filter(job =>
      job.title.toLowerCase().includes(lowercaseQuery) ||
      job.department.toLowerCase().includes(lowercaseQuery) ||
      job.location.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Filter jobs by status
  static async getJobsByStatus(organizationId: string, status: Job['status']): Promise<Job[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const allJobs = mockJobsByOrg[organizationId] || [];
    return allJobs.filter(job => job.status === status);
  }

  // Get active jobs count by organization
  static async getActiveJobsCount(organizationId: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const allJobs = mockJobsByOrg[organizationId] || [];
    return allJobs.filter(job => job.status === 'Active').length;
  }

  // Get job statistics for an organization
  static async getJobStats(organizationId: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const allJobs = mockJobsByOrg[organizationId] || [];
    
    const statusCounts = allJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalApplications = allJobs.reduce((sum, job) => sum + job.applicants, 0);

    return {
      totalJobs: allJobs.length,
      totalApplications,
      statusBreakdown: statusCounts,
      avgApplicationsPerJob: allJobs.length > 0 ? Math.round(totalApplications / allJobs.length) : 0
    };
  }

  // Get recent jobs (posted within last week)
  static async getRecentJobs(organizationId: string): Promise<Job[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const allJobs = mockJobsByOrg[organizationId] || [];
    
    // Simple filter for recent jobs (in real app, this would be date-based)
    return allJobs.filter(job => 
      job.postedDate.includes('day') || 
      job.postedDate.includes('1 week')
    ).slice(0, 5);
  }
}

// Export mock data for direct access (temporary, will be removed when connecting to backend)
export { mockJobsByOrg };
