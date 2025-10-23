export interface JobBoard {
  id: string;
  name: string;
  platform: string;
  website: string;
  logo?: string;
  description?: string;
  authType: 'oauth2' | 'api_key' | 'basic' | 'custom';
  isActive: boolean;
  supportedFeatures: {
    posting: boolean;
    application_tracking: boolean;
    analytics: boolean;
    bulk_operations: boolean;
  };
  configurationSchema: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface JobBoardConnection {
  id: string;
  clientId: string;
  jobBoardId: string;
  jobBoard?: JobBoard;
  isActive: boolean;
  credentials: Record<string, any>;
  settings: {
    autoPosting: boolean;
    requireApproval: boolean;
    defaultDepartment?: string;
    postingTemplate?: string;
    syncFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  };
  lastSync?: string;
  status: 'connected' | 'error' | 'pending' | 'disconnected';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateJobBoardConnectionDto {
  clientId: string;
  jobBoardId: string;
  credentials: Record<string, any>;
  settings?: {
    autoPosting?: boolean;
    requireApproval?: boolean;
    defaultDepartment?: string;
    postingTemplate?: string;
    syncFrequency?: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  };
}

export interface UpdateJobBoardConnectionDto {
  isActive?: boolean;
  credentials?: Record<string, any>;
  settings?: {
    autoPosting?: boolean;
    requireApproval?: boolean;
    defaultDepartment?: string;
    postingTemplate?: string;
    syncFrequency?: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  };
}

export interface JobBoardConnectionStats {
  totalConnections: number;
  activeConnections: number;
  totalJobsPosted: number;
  totalApplications: number;
  lastSyncTime?: string;
}

// Legacy interface to match the current component structure
export interface OrganizationJobBoard {
  id: string;
  jobBoardId: string;
  jobBoardName: string;
  jobBoardUrl: string;
  isActive: boolean;
  organizationId: string;
  departmentId?: string;
  assignedRecruiters: string[];
  credentials: {
    isConfigured: boolean;
    configuredBy: string;
    configuredAt: string;
  };
  posting: {
    autoPost: boolean;
    requireApproval: boolean;
    defaultTemplate?: string;
  };
  analytics: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    lastSync: string;
    syncFrequency: string;
  };
  responses?: {
    totalResponses: number;
    responseRate: number;
    avgTimeToResponse: number;
    qualityScore: number;
  };
}
