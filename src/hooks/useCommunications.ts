import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientOutreachApiService, { 
  CompanyNote, 
  CreateCompanyNoteData, 
  UpdateCompanyNoteData, 
  CompanyEmailHistory, 
  SendCompanyEmailData 
} from '../services/clientOutreachApiService';

// Company Notes Hooks
export function useCompanyNotes(companyId: string, projectId: string, includePrivate = false) {
  return useQuery({
    queryKey: ['company-notes', companyId, projectId, includePrivate],
    queryFn: () => clientOutreachApiService.getCompanyNotes(companyId, projectId, includePrivate),
    enabled: !!companyId && !!projectId,
  });
}

export function useCreateCompanyNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ companyId, projectId, data }: { 
      companyId: string; 
      projectId: string; 
      data: CreateCompanyNoteData 
    }) => clientOutreachApiService.createCompanyNote(companyId, projectId, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch company notes
      queryClient.invalidateQueries({ 
        queryKey: ['company-notes', variables.companyId, variables.projectId] 
      });
    },
  });
}

export function useUpdateCompanyNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: UpdateCompanyNoteData }) => 
      clientOutreachApiService.updateCompanyNote(noteId, data),
    onSuccess: (data) => {
      // Invalidate and refetch company notes
      queryClient.invalidateQueries({ 
        queryKey: ['company-notes', data.companyId, data.projectId] 
      });
    },
  });
}

export function useDeleteCompanyNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, companyId, projectId }: { 
      noteId: string; 
      companyId: string; 
      projectId: string; 
    }) => clientOutreachApiService.deleteCompanyNote(noteId),
    onSuccess: (data, variables) => {
      // Invalidate and refetch company notes
      queryClient.invalidateQueries({ 
        queryKey: ['company-notes', variables.companyId, variables.projectId] 
      });
    },
  });
}

// Company Email Hooks
export function useCompanyEmailHistory(companyId: string, projectId: string) {
  return useQuery({
    queryKey: ['company-email-history', companyId, projectId],
    queryFn: () => clientOutreachApiService.getCompanyEmailHistory(companyId, projectId),
    enabled: !!companyId && !!projectId,
  });
}

export function useSendCompanyEmail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ companyId, projectId, data }: { 
      companyId: string; 
      projectId: string; 
      data: SendCompanyEmailData 
    }) => clientOutreachApiService.sendCompanyEmail(companyId, projectId, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch email history
      queryClient.invalidateQueries({ 
        queryKey: ['company-email-history', variables.companyId, variables.projectId] 
      });
    },
  });
}
