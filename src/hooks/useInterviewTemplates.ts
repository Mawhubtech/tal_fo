import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InterviewTemplateService } from '../services/interviewTemplateService';
import {
  InterviewTemplate,
  CreateInterviewTemplateRequest,
  UpdateInterviewTemplateRequest,
  InterviewTemplateFilters,
  AIInterviewTemplateRequest
} from '../types/interviewTemplate.types';

// Query keys
export const interviewTemplateKeys = {
  all: ['interviewTemplates'] as const,
  lists: () => [...interviewTemplateKeys.all, 'list'] as const,
  list: (filters: InterviewTemplateFilters) => [...interviewTemplateKeys.lists(), filters] as const,
  details: () => [...interviewTemplateKeys.all, 'detail'] as const,
  detail: (id: string) => [...interviewTemplateKeys.details(), id] as const,
  defaults: (interviewType?: string) => [...interviewTemplateKeys.all, 'defaults', interviewType] as const,
  job: (jobId: string) => [...interviewTemplateKeys.all, 'job', jobId] as const,
};

/**
 * Hook to get interview templates with filters
 */
export function useInterviewTemplates(filters: InterviewTemplateFilters = {}) {
  return useQuery({
    queryKey: interviewTemplateKeys.list(filters),
    queryFn: () => InterviewTemplateService.getTemplates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get a specific interview template
 */
export function useInterviewTemplate(id: string) {
  return useQuery({
    queryKey: interviewTemplateKeys.detail(id),
    queryFn: () => InterviewTemplateService.getTemplate(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get default templates
 */
export function useDefaultInterviewTemplates(interviewType?: string) {
  return useQuery({
    queryKey: interviewTemplateKeys.defaults(interviewType),
    queryFn: () => InterviewTemplateService.getDefaultTemplates(interviewType),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get templates for a specific job
 */
export function useJobInterviewTemplates(jobId: string) {
  return useQuery({
    queryKey: interviewTemplateKeys.job(jobId),
    queryFn: () => InterviewTemplateService.getJobTemplates(jobId),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create an interview template
 */
export function useCreateInterviewTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInterviewTemplateRequest) => 
      InterviewTemplateService.createTemplate(data),
    onSuccess: (newTemplate) => {
      // Invalidate and refetch template lists
      queryClient.invalidateQueries({ queryKey: interviewTemplateKeys.lists() });
      
      // If template is for a specific job, invalidate job templates
      if (newTemplate.jobId) {
        queryClient.invalidateQueries({ queryKey: interviewTemplateKeys.job(newTemplate.jobId) });
      }
      
      // If template is default, invalidate defaults
      if (newTemplate.isDefault) {
        queryClient.invalidateQueries({ queryKey: interviewTemplateKeys.defaults() });
      }
    },
  });
}

/**
 * Hook to update an interview template
 */
export function useUpdateInterviewTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateInterviewTemplateRequest) => 
      InterviewTemplateService.updateTemplate(data),
    onSuccess: (updatedTemplate) => {
      // Update the cached template
      queryClient.setQueryData(
        interviewTemplateKeys.detail(updatedTemplate.id), 
        updatedTemplate
      );
      
      // Invalidate template lists
      queryClient.invalidateQueries({ queryKey: interviewTemplateKeys.lists() });
      
      // If template is for a specific job, invalidate job templates
      if (updatedTemplate.jobId) {
        queryClient.invalidateQueries({ queryKey: interviewTemplateKeys.job(updatedTemplate.jobId) });
      }
      
      // If template is default, invalidate defaults
      if (updatedTemplate.isDefault) {
        queryClient.invalidateQueries({ queryKey: interviewTemplateKeys.defaults() });
      }
    },
  });
}

/**
 * Hook to delete an interview template
 */
export function useDeleteInterviewTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InterviewTemplateService.deleteTemplate(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: interviewTemplateKeys.detail(deletedId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: interviewTemplateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: interviewTemplateKeys.defaults() });
    },
  });
}

/**
 * Hook to generate AI interview template
 */
export function useGenerateAIInterviewTemplate() {
  return useMutation({
    mutationFn: (data: AIInterviewTemplateRequest) => 
      InterviewTemplateService.generateAITemplate(data),
  });
}

/**
 * Hook to clone an interview template
 */
export function useCloneInterviewTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName?: string }) => 
      InterviewTemplateService.cloneTemplate(id, newName),
    onSuccess: (clonedTemplate) => {
      // Invalidate and refetch template lists
      queryClient.invalidateQueries({ queryKey: interviewTemplateKeys.lists() });
      
      // If template is for a specific job, invalidate job templates
      if (clonedTemplate.jobId) {
        queryClient.invalidateQueries({ queryKey: interviewTemplateKeys.job(clonedTemplate.jobId) });
      }
    },
  });
}

/**
 * Hook to mark template as used
 */
export function useMarkTemplateUsed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InterviewTemplateService.markTemplateUsed(id),
    onSuccess: (_, templateId) => {
      // Invalidate the specific template to refresh usage stats
      queryClient.invalidateQueries({ queryKey: interviewTemplateKeys.detail(templateId) });
      // Also invalidate lists to refresh usage counts
      queryClient.invalidateQueries({ queryKey: interviewTemplateKeys.lists() });
    },
  });
}
