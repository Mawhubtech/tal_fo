export interface IntakeMeetingQuestion {
  id?: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'date';
  category: string;
  section: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select/multiselect questions
  order: number;
  helpText?: string;
}

export interface IntakeMeetingTemplate {
  id: string;
  name: string;
  description: string;
  questions: IntakeMeetingQuestion[];
  isDefault: boolean;
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdById: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntakeMeetingTemplateRequest {
  name: string;
  description: string;
  questions: Omit<IntakeMeetingQuestion, 'id'>[];
  isDefault?: boolean;
  organizationId?: string;
}

export interface UpdateIntakeMeetingTemplateRequest extends CreateIntakeMeetingTemplateRequest {
  id: string;
}

export interface IntakeMeetingTemplateFilters {
  organizationId?: string;
  isDefault?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IntakeMeetingTemplatesResponse {
  templates: IntakeMeetingTemplate[];
  total: number;
  page: number;
  limit: number;
}

export interface IntakeMeetingSession {
  id: string;
  templateId: string;
  template: IntakeMeetingTemplate;
  clientId: string;
  responses: Record<string, any>;
  conductedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  conductedById: string;
  status: 'draft' | 'completed' | 'follow_up_needed';
  scheduledAt?: string;
  completedAt?: string;
  notes?: string;
  followUpActions?: string[];
  attendees?: string[];
  jobDescription?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntakeMeetingSessionRequest {
  templateId: string;
  clientId: string;
  scheduledAt?: string;
  notes?: string;
  attendees?: string[];
}

export interface UpdateIntakeMeetingSessionRequest {
  responses?: Record<string, any>;
  status?: 'draft' | 'completed' | 'follow_up_needed';
  completedAt?: string;
  notes?: string;
  followUpActions?: string[];
}

export interface SendInvitationsRequest {
  emails: string[];
  meetingLink?: string;
}

// AI Generation Types
export interface AIIntakeMeetingTemplateRequest {
  industry: string;
  companySize: string;
  hiringVolume: string;
  focusAreas: string[];
  questionCount?: number;
  additionalInstructions?: string;
  targetSeniority?: string;
  commonRoles?: string[];
}

export interface AIIntakeMeetingTemplateResponse {
  name: string;
  description: string;
  questions: Omit<IntakeMeetingQuestion, 'id'>[];
  metadata?: {
    estimatedDuration?: number;
    targetRoles?: string[];
    industry?: string;
  };
}
