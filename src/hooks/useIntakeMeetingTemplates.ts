import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IntakeMeetingTemplateService } from '../services/intakeMeetingTemplateService';
import {
  IntakeMeetingTemplate,
  CreateIntakeMeetingTemplateRequest,
  UpdateIntakeMeetingTemplateRequest,
  IntakeMeetingTemplateFilters,
  IntakeMeetingSession,
  CreateIntakeMeetingSessionRequest,
  UpdateIntakeMeetingSessionRequest,
  SendInvitationsRequest,
  AIIntakeMeetingTemplateRequest
} from '../types/intakeMeetingTemplate.types';

// Query keys
export const intakeMeetingTemplateKeys = {
  all: ['intakeMeetingTemplates'] as const,
  lists: () => [...intakeMeetingTemplateKeys.all, 'list'] as const,
  list: (filters: IntakeMeetingTemplateFilters) => [...intakeMeetingTemplateKeys.lists(), filters] as const,
  details: () => [...intakeMeetingTemplateKeys.all, 'detail'] as const,
  detail: (id: string) => [...intakeMeetingTemplateKeys.details(), id] as const,
  sessions: () => [...intakeMeetingTemplateKeys.all, 'sessions'] as const,
  session: (id: string) => [...intakeMeetingTemplateKeys.sessions(), id] as const,
  clientSessions: (clientId: string) => [...intakeMeetingTemplateKeys.sessions(), 'client', clientId] as const,
};

/**
 * Hook to get intake meeting templates with filters
 */
export function useIntakeMeetingTemplates(filters: IntakeMeetingTemplateFilters = {}) {
  return useQuery({
    queryKey: intakeMeetingTemplateKeys.list(filters),
    queryFn: () => IntakeMeetingTemplateService.getTemplates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get a specific intake meeting template
 */
export function useIntakeMeetingTemplate(id: string) {
  return useQuery({
    queryKey: intakeMeetingTemplateKeys.detail(id),
    queryFn: () => IntakeMeetingTemplateService.getTemplate(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to create an intake meeting template
 */
export function useCreateIntakeMeetingTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIntakeMeetingTemplateRequest) => 
      IntakeMeetingTemplateService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: intakeMeetingTemplateKeys.lists() });
    },
  });
}

/**
 * Hook to update an intake meeting template
 */
export function useUpdateIntakeMeetingTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateIntakeMeetingTemplateRequest) => 
      IntakeMeetingTemplateService.updateTemplate(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: intakeMeetingTemplateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: intakeMeetingTemplateKeys.detail(data.id) });
    },
  });
}

/**
 * Hook to delete an intake meeting template
 */
export function useDeleteIntakeMeetingTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => IntakeMeetingTemplateService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: intakeMeetingTemplateKeys.lists() });
    },
  });
}

/**
 * Hook to clone an intake meeting template
 */
export function useCloneIntakeMeetingTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) => 
      IntakeMeetingTemplateService.cloneTemplate(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: intakeMeetingTemplateKeys.lists() });
    },
  });
}

/**
 * Hook to generate an intake meeting template using AI
 */
export function useGenerateAIIntakeMeetingTemplate() {
  return useMutation({
    mutationFn: (data: AIIntakeMeetingTemplateRequest) => 
      IntakeMeetingTemplateService.generateAITemplate(data),
  });
}

// Session hooks

/**
 * Hook to get intake meeting sessions
 */
export function useIntakeMeetingSessions(clientId?: string) {
  return useQuery({
    queryKey: clientId ? intakeMeetingTemplateKeys.clientSessions(clientId) : intakeMeetingTemplateKeys.sessions(),
    queryFn: () => IntakeMeetingTemplateService.getSessions(clientId),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get a specific intake meeting session
 */
export function useIntakeMeetingSession(id: string) {
  return useQuery({
    queryKey: intakeMeetingTemplateKeys.session(id),
    queryFn: () => IntakeMeetingTemplateService.getSession(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds - shorter for active sessions
  });
}

/**
 * Hook to create an intake meeting session
 */
export function useCreateIntakeMeetingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIntakeMeetingSessionRequest) => 
      IntakeMeetingTemplateService.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: intakeMeetingTemplateKeys.sessions() });
    },
  });
}

/**
 * Hook to update an intake meeting session
 */
export function useUpdateIntakeMeetingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIntakeMeetingSessionRequest }) => 
      IntakeMeetingTemplateService.updateSession(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: intakeMeetingTemplateKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: intakeMeetingTemplateKeys.session(variables.id) });
    },
  });
}

/**
 * Hook to delete an intake meeting session
 */
export function useDeleteIntakeMeetingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => IntakeMeetingTemplateService.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: intakeMeetingTemplateKeys.sessions() });
    },
  });
}

/**
 * Hook to send invitations for an intake meeting session
 */
export function useSendIntakeMeetingInvitations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: SendInvitationsRequest }) => 
      IntakeMeetingTemplateService.sendInvitations(sessionId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: intakeMeetingTemplateKeys.session(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: intakeMeetingTemplateKeys.sessions() });
    },
  });
}

/**
 * Hook to generate job description from intake session
 */
export function useGenerateJobDescription() {
  return useMutation({
    mutationFn: (sessionId: string) => 
      IntakeMeetingTemplateService.generateJobDescription(sessionId),
  });
}

/**
 * Hook to generate interview template from intake session
 */
export function useGenerateInterviewTemplate() {
  return useMutation({
    mutationFn: ({ sessionId, interviewType }: { sessionId: string; interviewType: string }) => 
      IntakeMeetingTemplateService.generateInterviewTemplate(sessionId, interviewType),
  });
}
