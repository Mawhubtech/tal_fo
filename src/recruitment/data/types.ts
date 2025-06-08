// Common types for recruitment data
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
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  status: 'Active' | 'Draft' | 'Paused' | 'Closed';
  applicants: number;
  postedDate: string;
  urgency: 'High' | 'Medium' | 'Low';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

// API Response types (for future backend integration)
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
