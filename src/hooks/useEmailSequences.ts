import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  EmailSequencesApiService, 
  EmailSequence, 
  CreateSequenceRequest, 
  UpdateSequenceRequest,
  GetSequencesParams,
  DuplicateSequenceRequest,
  BulkSequenceActionRequest
} from '../services/emailSequencesApiService';

// Query Keys
export const emailSequenceKeys = {
  all: ['emailSequences'] as const,
  lists: () => [...emailSequenceKeys.all, 'list'] as const,
  list: (params?: GetSequencesParams) => [...emailSequenceKeys.lists(), params] as const,
  details: () => [...emailSequenceKeys.all, 'detail'] as const,
  detail: (id: string) => [...emailSequenceKeys.details(), id] as const,
  analytics: () => [...emailSequenceKeys.all, 'analytics'] as const,
  presets: () => [...emailSequenceKeys.all, 'presets'] as const,
};

// Queries
export const useEmailSequences = (params?: GetSequencesParams) => {
  return useQuery({
    queryKey: emailSequenceKeys.list(params),
    queryFn: () => EmailSequencesApiService.getSequences(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEmailSequence = (id: string) => {
  return useQuery({
    queryKey: emailSequenceKeys.detail(id),
    queryFn: () => EmailSequencesApiService.getSequence(id),
    enabled: !!id,
  });
};

export const useEmailSequenceAnalytics = () => {
  return useQuery({
    queryKey: emailSequenceKeys.analytics(),
    queryFn: () => EmailSequencesApiService.getAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEmailSequencePresets = () => {
  return useQuery({
    queryKey: emailSequenceKeys.presets(),
    queryFn: () => EmailSequencesApiService.getPresets(),
    staleTime: 30 * 60 * 1000, // 30 minutes (presets don't change often)
  });
};

// Mutations
export const useCreateEmailSequence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSequenceRequest) => EmailSequencesApiService.createSequence(data),
    onSuccess: () => {
      // Invalidate all sequence lists and analytics
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.analytics() });
    },
  });
};

export const useUpdateEmailSequence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSequenceRequest }) => 
      EmailSequencesApiService.updateSequence(id, data),
    onSuccess: (updatedSequence) => {
      // Update the specific sequence in cache
      queryClient.setQueryData(
        emailSequenceKeys.detail(updatedSequence.id),
        updatedSequence
      );
      
      // Invalidate lists to ensure they're up to date
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.analytics() });
    },
  });
};

export const useDeleteEmailSequence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => EmailSequencesApiService.deleteSequence(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: emailSequenceKeys.detail(deletedId) });
      
      // Invalidate lists and analytics
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.analytics() });
    },
  });
};

export const useDuplicateEmailSequence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DuplicateSequenceRequest }) => 
      EmailSequencesApiService.duplicateSequence(id, data),
    onSuccess: () => {
      // Invalidate lists and analytics
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.analytics() });
    },
  });
};

export const useToggleEmailSequenceFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => EmailSequencesApiService.toggleFavorite(id),
    onSuccess: (updatedSequence) => {
      // Update the specific sequence in cache
      queryClient.setQueryData(
        emailSequenceKeys.detail(updatedSequence.id),
        updatedSequence
      );
      
      // Update any lists that might contain this sequence
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.lists() });
    },
  });
};

export const useBulkEmailSequenceAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkSequenceActionRequest) => EmailSequencesApiService.bulkAction(data),
    onSuccess: () => {
      // Invalidate all lists and analytics
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.analytics() });
    },
  });
};

export const useTrackEmailSequenceUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => EmailSequencesApiService.trackUsage(id),
    onSuccess: (_, id) => {
      // Invalidate the specific sequence and analytics
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.analytics() });
    },
  });
};

export const useUpdateEmailSequenceAnalytics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, analytics }: { 
      id: string; 
      analytics: {
        totalSent?: number;
        totalResponses?: number;
        totalClicks?: number;
        totalOpens?: number;
        bounceRate?: number;
      }
    }) => EmailSequencesApiService.updateAnalytics(id, analytics),
    onSuccess: (_, { id }) => {
      // Invalidate the specific sequence and analytics
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: emailSequenceKeys.analytics() });
    },
  });
};
