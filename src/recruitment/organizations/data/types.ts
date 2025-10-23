// Type definitions for organizations, departments, and jobs

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

export interface Job {
  id: string;
  title: string;
  department: string;
  departmentId: string;
  organizationId: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experience: 'entry' | 'mid' | 'senior' | 'lead';
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  status: 'Published' | 'Draft' | 'Paused' | 'Closed' | 'Archived';
  postedDate: Date;
  applicationDeadline: Date;
  applicantCount: number;
}

export interface CreateJobRequest {
  title: string;
  departmentId: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  description: string;
  requirements: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}
