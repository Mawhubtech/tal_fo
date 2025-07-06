import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';
import type { AxiosError } from 'axios';

// Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  body?: string;
  description?: string;
  type: 'candidate_outreach' | 'client_outreach' | 'interview_invite' | 'interview_reminder' | 'rejection' | 'offer' | 'follow_up' | 'custom' | 'interview_invitation' | 'interview_reschedule' | 'interview_cancellation' | 'feedback_request' | 'offer_letter' | 'rejection_letter' | 'welcome_email' | 'team_invitation';
  category: 'outreach' | 'interview' | 'hiring' | 'general' | 'recruitment' | 'interviews' | 'client_communication' | 'team_management';
  scope: 'personal' | 'team' | 'organization' | 'global';
  isDefault: boolean;
  isShared?: boolean;
  isActive?: boolean;
  usageCount: number;
  variables?: string[];
  organizationId?: string;
  teamId?: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Preset Template Types
export interface PresetTemplateInfo {
  type: string;
  category: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface CreatePresetTemplatesDto {
  templateTypes?: string[];
  categories?: string[];
  scope?: 'personal' | 'team' | 'organization' | 'global';
  generateAll?: boolean;
  useAiGeneration?: boolean;
}

export interface PresetTemplatesResponse {
  success: boolean;
  message: string;
  createdTemplates: {
    type: string;
    category: string;
    name: string;
    id: string;
  }[];
  skippedTemplates: {
    type: string;
    category: string;
    name: string;
    reason: string;
  }[];
}

export interface AvailablePresetsResponse {
  templates: PresetTemplateInfo[];
  types: string[];
  categories: string[];
}

export interface EmailProvider {
  id: string;
  name: string;
  type: 'gmail' | 'outlook' | 'smtp';
  status: 'active' | 'inactive' | 'error' | 'expired';
  config?: Record<string, any>;
  credentials?: Record<string, any>;
  isDefault: boolean;
  isActive: boolean;
  fromEmail?: string;
  fromName?: string;
  replyToEmail?: string;
  lastSyncedAt?: string;
  lastErrorMessage?: string;
  emailsSentCount: number;
  emailsFailedCount: number;
  dailyLimit: number;
  dailyUsage: number;
  lastResetDate?: string;
  userId: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  email?: string;
  isConnected?: boolean;
  lastUsed?: string;
  usageCount?: number;
  settings?: {
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    username?: string;
    password?: string;
  };
}

export interface EmailLog {
  id: string;
  providerId: string;
  templateId?: string;
  recipientEmail: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}

export interface CreateTemplateData {
  name: string;
  subject: string;
  content: string;
  type: EmailTemplate['type'];
  category: EmailTemplate['category'];
  scope: EmailTemplate['scope'];
  isShared?: boolean;
  organizationId?: string;
  teamId?: string;
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> {
  id: string;
}

export interface CreateProviderData {
  name: string;
  type: EmailProvider['type'];
  fromEmail?: string;
  fromName?: string;
  replyToEmail?: string;
  isDefault?: boolean;
  config?: Record<string, any>;
  // Legacy fields for backward compatibility  
  email?: string;
  settings?: {
    smtpHost?: string;
    smtpPort?: number;
    smtpSecure?: boolean;
    username?: string;
    password?: string;
  };
}

export interface SendEmailData {
  providerId: string;
  templateId?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  content: string;
  plainText?: string;
  variables?: Record<string, string>;
}

export interface GmailIntegration {
  isConnected: boolean;
  email?: string;
  connectedAt?: Date;
  type: string;
  hasCredentials: boolean;
}

// Email Templates API
export const emailTemplateApi = {
  // Get all templates with filters
  getAll: async (params?: {
    type?: string;
    category?: string;
    scope?: string;
    isDefault?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/email-management/templates', { params });
    return response.data;
  },

  // Get template by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/email-management/templates/${id}`);
    return response.data;
  },

  // Create new template
  create: async (data: CreateTemplateData) => {
    const response = await apiClient.post('/email-management/templates', data);
    return response.data;
  },

  // Update template
  update: async (data: UpdateTemplateData) => {
    const { id, ...updateData } = data;
    const response = await apiClient.put(`/email-management/templates/${id}`, updateData);
    return response.data;
  },

  // Delete template
  delete: async (id: string) => {
    const response = await apiClient.delete(`/email-management/templates/${id}`);
    return response.data;
  },

  // Duplicate template
  duplicate: async (id: string, name?: string) => {
    const response = await apiClient.post(`/email-management/templates/${id}/duplicate`, { name });
    return response.data;
  },

  // Get template types
  getTypes: async () => {
    const response = await apiClient.get('/email-management/templates/types');
    return response.data;
  },

  // Get default templates
  getDefaults: async () => {
    const response = await apiClient.get('/email-management/templates/defaults');
    return response.data;
  },

  // Initialize default templates (admin only)
  initializeDefaults: async () => {
    const response = await apiClient.post('/email-management/templates/initialize-defaults');
    return response.data;
  },

  // Generate AI content for template
  generateAiContent: async (type: string, category: string, instructions?: string) => {
    const response = await apiClient.post('/email-management/templates/generate-ai-content', {
      type,
      category,
      instructions
    });
    return response.data;
  }
};

// Email Providers API
export const emailProviderApi = {
  // Get all providers
  getAll: async () => {
    const response = await apiClient.get('/email-management/providers');
    return response.data;
  },

  // Get provider by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/email-management/providers/${id}`);
    return response.data;
  },

  // Create new provider
  create: async (data: CreateProviderData) => {
    // Map frontend fields to backend expected fields
    const backendData = {
      ...data,
      fromEmail: data.fromEmail || data.email, // Map email to fromEmail
      config: data.config || {} // Ensure config is present
    };
    
    // Remove the frontend-only email field if fromEmail is set
    if (backendData.fromEmail && data.email && !data.fromEmail) {
      delete (backendData as any).email;
    }
    
    const response = await apiClient.post('/email-management/providers', backendData);
    return response.data;
  },

  // Update provider
  update: async (id: string, data: Partial<CreateProviderData>) => {
    const response = await apiClient.patch(`/email-management/providers/${id}`, data);
    return response.data;
  },

  // Delete provider
  delete: async (id: string) => {
    const response = await apiClient.delete(`/email-management/providers/${id}`);
    return response.data;
  },

  // Test provider connection
  test: async (id: string) => {
    const response = await apiClient.post(`/email-management/providers/${id}/test`);
    return response.data;
  },

  // Get provider types
  getTypes: async () => {
    const response = await apiClient.get('/email-management/providers/types');
    return response.data;
  },

  // Set default provider
  setDefault: async (id: string) => {
    const response = await apiClient.patch(`/email-management/providers/${id}/set-default`);
    return response.data;
  },

  // Toggle active status
  toggleActive: async (id: string) => {
    const response = await apiClient.patch(`/email-management/providers/${id}/toggle-active`);
    return response.data;
  }
};

// Email sending API
export const emailSendingApi = {
  // Send email
  send: async (data: SendEmailData) => {
    // Transform data to match backend expectations
    const requestData = {
      providerId: data.providerId,
      to: data.to,
      subject: data.subject,
      body: data.plainText || data.content, // Use plainText if available, otherwise content as fallback
      htmlBody: data.content, // Use content for HTML body
      replyTo: undefined, // Can be added later if needed
    };
    const response = await apiClient.post('/email-management/send-email', requestData);
    return response.data;
  },

  // Get email logs
  getLogs: async (params?: {
    providerId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/email-management/logs', { params });
    return response.data;
  }
};

// Gmail integration API functions
const getGmailIntegration = async (): Promise<GmailIntegration> => {
  const response = await apiClient.get('/email-management/gmail-integration');
  return response.data.data;
};

const migrateGmailIntegration = async (): Promise<EmailProvider> => {
  const response = await apiClient.post('/email-management/migrate-gmail');
  return response.data.data;
};

// Gmail OAuth API functions
const getGmailAuthUrl = async (): Promise<{ authUrl: string }> => {
  const response = await apiClient.post('/email/connect-gmail');
  return response.data;
};

// React Query hooks for Email Templates
export const useEmailTemplates = (params?: Parameters<typeof emailTemplateApi.getAll>[0]) => {
  return useQuery({
    queryKey: ['email-templates', params],
    queryFn: async () => {
      try {
        return await emailTemplateApi.getAll(params);
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

export const useEmailTemplate = (id: string) => {
  return useQuery({
    queryKey: ['email-template', id],
    queryFn: () => emailTemplateApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: emailTemplateApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
  });
};

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: emailTemplateApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['email-template', data.id] });
    },
  });
};

export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: emailTemplateApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
  });
};

export const useDuplicateEmailTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      emailTemplateApi.duplicate(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
  });
};

// React Query hooks for Email Providers
export const useEmailProviders = () => {
  return useQuery({
    queryKey: ['email-providers'],
    queryFn: async () => {
      try {
        return await emailProviderApi.getAll();
      } catch (error: any) {
        // If it's a 404 (no providers found), return empty array instead of error
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useEmailProvider = (id: string) => {
  return useQuery({
    queryKey: ['email-provider', id],
    queryFn: () => emailProviderApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateEmailProvider = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: emailProviderApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-providers'] });
    },
  });
};

export const useUpdateEmailProvider = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProviderData> }) =>
      emailProviderApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-providers'] });
    },
  });
};

export const useDeleteEmailProvider = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: emailProviderApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-providers'] });
    },
  });
};

export const useTestEmailProvider = () => {
  return useMutation({
    mutationFn: emailProviderApi.test,
    onError: (error: AxiosError) => {
      console.error('Provider test failed:', error);
    },
  });
};

export const useSetDefaultEmailProvider = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: emailProviderApi.setDefault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-providers'] });
    },
  });
};

export const useToggleActiveEmailProvider = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: emailProviderApi.toggleActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-providers'] });
    },
  });
};

// React Query hooks for Email Sending
export const useSendEmail = () => {
  return useMutation({
    mutationFn: emailSendingApi.send,
  });
};

export const useEmailLogs = (params?: Parameters<typeof emailSendingApi.getLogs>[0]) => {
  return useQuery({
    queryKey: ['email-logs', params],
    queryFn: () => emailSendingApi.getLogs(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Template and Provider Types
export const useTemplateTypes = () => {
  return useQuery({
    queryKey: ['email-template-types'],
    queryFn: emailTemplateApi.getTypes,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useProviderTypes = () => {
  return useQuery({
    queryKey: ['email-provider-types'],
    queryFn: emailProviderApi.getTypes,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Default templates
export const useDefaultTemplates = () => {
  return useQuery({
    queryKey: ['email-default-templates'],
    queryFn: emailTemplateApi.getDefaults,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useInitializeDefaultTemplates = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: emailTemplateApi.initializeDefaults,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['email-default-templates'] });
    },
  });
};

export const useGenerateAiTemplateContent = () => {
  return useMutation({
    mutationFn: ({ type, category, instructions }: { type: string; category: string; instructions?: string }) =>
      emailTemplateApi.generateAiContent(type, category, instructions),
  });
};

// Gmail integration hooks
export const useGmailIntegration = () => {
  return useQuery({
    queryKey: ['gmail-integration'],
    queryFn: getGmailIntegration,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMigrateGmailIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: migrateGmailIntegration,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['email-providers'] });
      queryClient.invalidateQueries({ queryKey: ['gmail-integration'] });
    },
  });
};

export const useGmailAuthUrl = () => {
  return useMutation({
    mutationFn: getGmailAuthUrl,
  });
};

// Preset Template Hooks
export const useAvailablePresets = () => {
  return useQuery<AvailablePresetsResponse>({
    queryKey: ['available-presets'],
    queryFn: async () => {
      const response = await apiClient.get('/email/templates/presets');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - presets don't change often
  });
};

export const useCreatePresetTemplates = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PresetTemplatesResponse, AxiosError, CreatePresetTemplatesDto & { useAiGeneration?: boolean }>({
    mutationFn: async (data) => {
      const response = await apiClient.post('/email/templates/presets/create', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate templates query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
  });
};

// Template Preview Hook
export const useTemplatePreview = () => {
  return useMutation<{ renderedSubject: string; renderedBody: string; renderedHtml?: string }, AxiosError, { 
    templateId?: string;
    subject?: string;
    body?: string;
    variables?: Record<string, any>;
  }>({
    mutationFn: async (data) => {
      if (data.templateId) {
        // Preview existing template
        const response = await apiClient.post(`/email/templates/${data.templateId}/preview`, {
          variables: data.variables || {}
        });
        return response.data;
      } else {
        // Preview custom content
        const response = await apiClient.post('/email/templates/preview', {
          subject: data.subject || '',
          body: data.body || '',
          variables: data.variables || {}
        });
        return response.data;
      }
    },
  });
};
