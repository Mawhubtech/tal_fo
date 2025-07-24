import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientOutreachApiService from '../services/clientOutreachApiService';

// Types for client outreach sequences/campaigns
export interface ClientSequence {
  id: string;
  name: string;
  description?: string;
  type: 'email' | 'linkedin' | 'phone' | 'mixed';
  category: 'initial_outreach' | 'follow_up' | 'nurture' | 'promotional' | 'client_communication';
  status: 'active' | 'paused' | 'draft' | 'completed';
  trigger?: 'manual' | 'stage_change' | 'scheduled' | 'event_based';
  projectId: string;
  targetCriteria?: Record<string, any>;
  config?: {
    businessHoursOnly?: boolean;
    sendingDays?: number[];
    sendingHours?: { start: number; end: number };
    stopOnReply?: boolean;
    trackingEnabled?: boolean;
  };
  metrics?: {
    totalRecipients?: number;
    totalSent?: number;
    totalOpens?: number;
    totalClicks?: number;
    totalResponses?: number;
    totalBounces?: number;
    totalUnsubscribes?: number;
  };
  steps?: ClientSequenceStep[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientSequenceStep {
  id: string;
  sequenceId: string;
  stepOrder: number;
  name: string;
  type: 'email' | 'linkedin_message' | 'linkedin_connection' | 'phone_call' | 'task' | 'wait' | 'condition' | 'meeting_request';
  status: 'pending' | 'active' | 'paused' | 'completed' | 'failed';
  subject?: string;
  content?: string;
  htmlContent?: string;
  isHtmlContent?: boolean;
  templateId?: string;
  config?: {
    delayDays?: number;
    delayHours?: number;
    delayMinutes?: number;
    sendTime?: string;
    timezone?: string;
    conditions?: Array<{
      field: string;
      operator: string;
      value: string;
      action: string;
    }>;
    emailSettings?: {
      trackOpens?: boolean;
      trackClicks?: boolean;
      includeSignature?: boolean;
      priority?: 'low' | 'normal' | 'high';
      replyTo?: string;
      cc?: string[];
      bcc?: string[];
      attachments?: Array<{
        name: string;
        url: string;
        type: string;
        size?: number;
      }>;
    };
    linkedinSettings?: {
      personalNote?: boolean;
      connectionMessage?: string;
      followUpAfterConnection?: boolean;
      followUpDelayDays?: number;
      messageType?: 'connection' | 'message' | 'inmessage';
    };
    phoneSettings?: {
      preferredTimeSlots?: Array<{
        day: string;
        startTime: string;
        endTime: string;
      }>;
      maxAttempts?: number;
      timeBetweenAttempts?: number;
      leaveVoicemail?: boolean;
      voicemailScript?: string;
      callDuration?: number;
      callObjective?: string;
    };
    taskSettings?: {
      taskType?: 'call' | 'email' | 'research' | 'meeting' | 'follow_up' | 'proposal' | 'demo' | 'other';
      estimatedDuration?: number;
      description?: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      dueDate?: string;
      assignedTo?: string;
    };
    meetingSettings?: {
      duration?: number;
      meetingType?: 'discovery' | 'demo' | 'proposal' | 'follow_up' | 'closing';
      agenda?: string;
      isVirtual?: boolean;
      meetingLink?: string;
      location?: string;
      maxAttendees?: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface ClientSequenceEnrollment {
  id: string;
  sequenceId: string;
  prospectId?: string;
  contactEmail: string;
  contactName: string;
  contactCompany?: string;
  contactTitle?: string;
  status: 'active' | 'paused' | 'completed' | 'failed' | 'unsubscribed';
  currentStepId?: string;
  currentStepOrder: number;
  enrolledAt: string;
  lastExecutedAt?: string;
  nextExecutionAt?: string;
  completedAt?: string;
  totalStepsCompleted: number;
  totalEmailsSent: number;
  totalEmailsOpened: number;
  totalEmailsClicked: number;
  hasReplied: boolean;
  lastReplyAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ClientSequenceResponse {
  id: string;
  sequenceId: string;
  enrollmentId: string;
  stepId: string;
  contactEmail: string;
  contactName: string;
  responseType: 'reply' | 'click' | 'open' | 'bounce' | 'unsubscribe' | 'spam_complaint';
  responseContent?: string;
  responseDate: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CreateClientSequenceDto {
  name: string;
  description?: string;
  type: 'email' | 'linkedin' | 'phone' | 'mixed';
  category: 'initial_outreach' | 'follow_up' | 'nurture' | 'promotional' | 'client_communication';
  trigger?: 'manual' | 'stage_change' | 'scheduled' | 'event_based';
  targetCriteria?: Record<string, any>;
  config?: {
    businessHoursOnly?: boolean;
    sendingDays?: number[];
    sendingHours?: { start: number; end: number };
    stopOnReply?: boolean;
    trackingEnabled?: boolean;
  };
}

export interface UpdateClientSequenceDto extends Partial<CreateClientSequenceDto> {
  status?: 'active' | 'paused' | 'draft' | 'completed';
}

export interface CreateClientSequenceStepDto {
  stepOrder: number;
  name: string;
  type: 'email' | 'linkedin_message' | 'linkedin_connection' | 'phone_call' | 'task' | 'wait' | 'condition' | 'meeting_request';
  subject?: string;
  content?: string;
  htmlContent?: string;
  isHtmlContent?: boolean;
  templateId?: string;
  config?: {
    delayDays?: number;
    delayHours?: number;
    delayMinutes?: number;
    sendTime?: string;
    timezone?: string;
    conditions?: Array<{
      field: string;
      operator: string;
      value: string;
      action: string;
    }>;
    emailSettings?: {
      trackOpens?: boolean;
      trackClicks?: boolean;
      includeSignature?: boolean;
      priority?: 'low' | 'normal' | 'high';
      replyTo?: string;
      cc?: string[];
      bcc?: string[];
      attachments?: Array<{
        name: string;
        url: string;
        type: string;
        size?: number;
      }>;
    };
    linkedinSettings?: {
      personalNote?: boolean;
      connectionMessage?: string;
      followUpAfterConnection?: boolean;
      followUpDelayDays?: number;
      messageType?: 'connection' | 'message' | 'inmessage';
    };
    phoneSettings?: {
      preferredTimeSlots?: Array<{
        day: string;
        startTime: string;
        endTime: string;
      }>;
      maxAttempts?: number;
      timeBetweenAttempts?: number;
      leaveVoicemail?: boolean;
      voicemailScript?: string;
      callDuration?: number;
      callObjective?: string;
    };
    taskSettings?: {
      taskType?: 'call' | 'email' | 'research' | 'meeting' | 'follow_up' | 'proposal' | 'demo' | 'other';
      estimatedDuration?: number;
      description?: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      dueDate?: string;
      assignedTo?: string;
    };
    meetingSettings?: {
      duration?: number;
      meetingType?: 'discovery' | 'demo' | 'proposal' | 'follow_up' | 'closing';
      agenda?: string;
      isVirtual?: boolean;
      meetingLink?: string;
      location?: string;
      maxAttendees?: number;
    };
  };
}

export interface UpdateClientSequenceStepDto extends Partial<CreateClientSequenceStepDto> {
  status?: 'pending' | 'active' | 'paused' | 'completed' | 'failed';
}

export interface SequenceAnalytics {
  totalSequences: number;
  activeSequences: number;
  pausedSequences: number;
  completedSequences: number;
  draftSequences: number;
  totalSteps: number;
  avgStepsPerSequence: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  totalEmailsSent: number;
  totalEmailsOpened: number;
  totalEmailsClicked: number;
  totalReplies: number;
  totalBounces: number;
  totalUnsubscribes: number;
  avgOpenRate: number;
  avgClickRate: number;
  avgReplyRate: number;
  performanceBySequence: Array<{
    sequenceId: string;
    sequenceName: string;
    enrollments: number;
    emailsSent: number;
    opensReceived: number;
    clicksReceived: number;
    repliesReceived: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
  }>;
  recentActivity: Array<{
    sequenceId: string;
    sequenceName: string;
    activity: string;
    timestamp: string;
  }>;
}

// Query Keys
export const clientSequenceQueryKeys = {
  all: ['client-outreach-sequences'] as const,
  byProject: (projectId: string) => [...clientSequenceQueryKeys.all, 'project', projectId] as const,
  detail: (id: string) => [...clientSequenceQueryKeys.all, 'detail', id] as const,
  steps: (sequenceId: string) => [...clientSequenceQueryKeys.detail(sequenceId), 'steps'] as const,
  step: (stepId: string) => [...clientSequenceQueryKeys.all, 'step', stepId] as const,
  analytics: (projectId: string) => [...clientSequenceQueryKeys.byProject(projectId), 'analytics'] as const,
  enrollments: (sequenceId: string) => [...clientSequenceQueryKeys.detail(sequenceId), 'enrollments'] as const,
  responses: (sequenceId: string) => [...clientSequenceQueryKeys.detail(sequenceId), 'responses'] as const,
};

// Sequence Queries
export const useClientProjectSequences = (projectId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: clientSequenceQueryKeys.byProject(projectId),
    queryFn: () => clientOutreachApiService.getProjectSequences(projectId),
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useClientSequence = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: clientSequenceQueryKeys.detail(id),
    queryFn: () => clientOutreachApiService.getSequence(id),
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useClientSequenceSteps = (sequenceId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: clientSequenceQueryKeys.steps(sequenceId),
    queryFn: () => clientOutreachApiService.getSequenceSteps(sequenceId),
    enabled: enabled && !!sequenceId,
    staleTime: 1 * 60 * 1000,
  });
};

export const useClientSequenceStep = (stepId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: clientSequenceQueryKeys.step(stepId),
    queryFn: () => clientOutreachApiService.getSequenceStep(stepId),
    enabled: enabled && !!stepId,
    staleTime: 1 * 60 * 1000,
  });
};

export const useClientSequenceAnalytics = (projectId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: clientSequenceQueryKeys.analytics(projectId),
    queryFn: () => clientOutreachApiService.getSequenceAnalytics(projectId),
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useClientSequenceEnrollments = (sequenceId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: clientSequenceQueryKeys.enrollments(sequenceId),
    queryFn: () => clientOutreachApiService.getSequenceEnrollments(sequenceId),
    enabled: enabled && !!sequenceId,
    staleTime: 1 * 60 * 1000,
  });
};

export const useClientSequenceResponses = (sequenceId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: clientSequenceQueryKeys.responses(sequenceId),
    queryFn: () => clientOutreachApiService.getSequenceResponses(sequenceId),
    enabled: enabled && !!sequenceId,
    staleTime: 1 * 60 * 1000,
  });
};

// Sequence Mutations
export const useCreateClientSequence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: CreateClientSequenceDto }) => 
      clientOutreachApiService.createSequence(projectId, data),
    onSuccess: (_, { projectId }) => {
      // Invalidate sequences for this project
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.byProject(projectId) 
      });
    },
  });
};

export const useUpdateClientSequence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientSequenceDto }) => 
      clientOutreachApiService.updateSequence(id, data),
    onSuccess: (result: any) => {
      // Invalidate specific sequence and project sequences
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.detail(result.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.byProject(result.projectId) 
      });
    },
  });
};

export const useDeleteClientSequence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clientOutreachApiService.deleteSequence(id),
    onSuccess: (_, id) => {
      // Invalidate all sequence queries that might contain this sequence
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.all 
      });
    },
  });
};

// Step Mutations
export const useCreateClientSequenceStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sequenceId, data }: { sequenceId: string; data: CreateClientSequenceStepDto }) => 
      clientOutreachApiService.createSequenceStep(sequenceId, data),
    onSuccess: (_, { sequenceId }) => {
      // Invalidate steps and sequence details
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.steps(sequenceId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.detail(sequenceId) 
      });
    },
  });
};

export const useUpdateClientSequenceStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientSequenceStepDto }) => 
      clientOutreachApiService.updateSequenceStep(id, data),
    onSuccess: (result: any) => {
      // Invalidate step details and sequence steps
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.step(result.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.steps(result.sequenceId) 
      });
    },
  });
};

export const useDeleteClientSequenceStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clientOutreachApiService.deleteSequenceStep(id),
    onSuccess: () => {
      // Invalidate all step-related queries
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.all 
      });
    },
  });
};

// Enrollment Mutations
export const useEnrollInClientSequence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sequenceId, enrollments }: { 
      sequenceId: string; 
      enrollments: Array<{
        contactEmail: string;
        contactName: string;
        contactCompany?: string;
        contactTitle?: string;
        metadata?: Record<string, any>;
      }> 
    }) => clientOutreachApiService.enrollInSequence(sequenceId, enrollments),
    onSuccess: (_, { sequenceId }) => {
      // Invalidate enrollments and sequence details
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.enrollments(sequenceId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.detail(sequenceId) 
      });
    },
  });
};

export const usePauseClientEnrollment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (enrollmentId: string) => clientOutreachApiService.pauseEnrollment(enrollmentId),
    onSuccess: () => {
      // Invalidate all enrollment queries
      queryClient.invalidateQueries({ 
        queryKey: [...clientSequenceQueryKeys.all, 'enrollments'] 
      });
    },
  });
};

export const useResumeClientEnrollment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (enrollmentId: string) => clientOutreachApiService.resumeEnrollment(enrollmentId),
    onSuccess: () => {
      // Invalidate all enrollment queries
      queryClient.invalidateQueries({ 
        queryKey: [...clientSequenceQueryKeys.all, 'enrollments'] 
      });
    },
  });
};

export const useRemoveClientEnrollment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (enrollmentId: string) => clientOutreachApiService.removeEnrollment(enrollmentId),
    onSuccess: () => {
      // Invalidate all enrollment queries
      queryClient.invalidateQueries({ 
        queryKey: [...clientSequenceQueryKeys.all, 'enrollments'] 
      });
    },
  });
};

// Execution Mutations
export const useSendClientSequenceEmails = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sequenceId: string) => clientOutreachApiService.sendSequenceEmails(sequenceId),
    onSuccess: (_, sequenceId) => {
      // Invalidate enrollments and sequence data to reflect updated execution status
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.enrollments(sequenceId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.detail(sequenceId) 
      });
    },
  });
};

// Setup default sequences (similar to sourcing)
export const useSetupDefaultClientSequences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => clientOutreachApiService.setupDefaultSequences(projectId),
    onSuccess: (_, projectId) => {
      // Invalidate project sequences to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: clientSequenceQueryKeys.byProject(projectId) 
      });
    },
  });
};

// ===============================================
// EMAIL TEMPLATE HOOKS
// ===============================================

export const useClientEmailTemplates = (params?: { 
  category?: string; 
  type?: string; 
  projectId?: string; 
}) => {
  return useQuery({
    queryKey: ['client-email-templates', params],
    queryFn: () => clientOutreachApiService.getClientEmailTemplates(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClientSourcingTemplates = () => {
  return useQuery({
    queryKey: ['client-sourcing-templates'],
    queryFn: async () => {
      try {
        return await clientOutreachApiService.getClientSourcingTemplates();
      } catch (error: any) {
        // If it's a 404 (no templates found), return empty array instead of error
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
