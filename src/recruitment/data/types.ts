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

export interface JobPublishingOptions {
  visibility: 'private'; // Always private, posting options determine where it's published
  talJobBoard?: boolean; // TAL platform job board
  externalJobBoards?: string[]; // Selected external job board IDs
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  department: string;
  departmentId: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  status: 'Published' | 'Draft' | 'Paused' | 'Closed' | 'Archived';
  urgency: 'High' | 'Medium' | 'Low';
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  remote: boolean;
  skills?: string[];
  benefits?: string[];
  requirements?: string[];
  responsibilities?: string[];
  hiringTeamId?: string;
  applicationDeadline?: Date | string;
  applicantsCount: number;
  organizationId?: string;
  customQuestions?: Array<{
    question: string;
    type: 'text' | 'multiple-choice';
    required: boolean;
    options?: string[];
  }>;
  pipelineId?: string;
  pipeline?: {
    id: string;
    name: string;
    stages: Array<{
      id: string;
      name: string;
      order: number;
    }>;
  };
  publishingOptions?: JobPublishingOptions;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  // Legacy fields for compatibility with existing frontend code
  applicants?: number; // Maps to applicantsCount
  postedDate?: string; // Computed from createdAt
  salary?: {
    min?: number;
    max?: number;
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
