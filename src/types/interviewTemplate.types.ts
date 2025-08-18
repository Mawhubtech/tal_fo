// Interview Template Types
export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'technical' | 'behavioral' | 'cultural' | 'situational' | 'general';
  category: string;
  expectedAnswer?: string;
  scoringCriteria?: string[];
  timeLimit?: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
}

export interface InterviewTemplate {
  id: string;
  name: string;
  description: string;
  interviewType: 'Phone Screen' | 'Technical' | 'Behavioral' | 'Final' | 'Panel' | 'Culture Fit' | 'Case Study' | 'Presentation';
  duration: number; // in minutes
  questions: InterviewQuestion[];
  instructions?: string;
  preparationNotes?: string;
  evaluationCriteria?: string[];
  isDefault: boolean;
  isPublic: boolean;
  createdBy: string;
  organizationId?: string;
  jobId?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  lastUsedAt?: string;
}

export interface CreateInterviewTemplateRequest {
  name: string;
  description: string;
  interviewType: InterviewTemplate['interviewType'];
  duration: number;
  questions: Omit<InterviewQuestion, 'id' | 'order'>[];
  instructions?: string;
  preparationNotes?: string;
  evaluationCriteria?: string[];
  isDefault?: boolean;
  isPublic?: boolean;
  organizationId?: string;
  jobId?: string;
}

export interface UpdateInterviewTemplateRequest extends Partial<CreateInterviewTemplateRequest> {
  id: string;
}

export interface InterviewTemplateFilters {
  search?: string;
  interviewType?: InterviewTemplate['interviewType'];
  organizationId?: string;
  jobId?: string;
  isPublic?: boolean;
  isDefault?: boolean;
  createdBy?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'usageCount' | 'lastUsedAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface InterviewTemplatesResponse {
  templates: InterviewTemplate[];
  total: number;
  page: number;
  limit: number;
}

export interface AIInterviewTemplateRequest {
  jobTitle: string;
  jobDescription: string;
  jobRequirements: string[];
  interviewType: InterviewTemplate['interviewType'];
  duration: number;
  difficulty: 'entry' | 'mid' | 'senior' | 'lead';
  focusAreas?: string[];
  companyInfo?: string;
}

export interface AIInterviewTemplateResponse {
  template: Omit<InterviewTemplate, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsedAt'>;
}
