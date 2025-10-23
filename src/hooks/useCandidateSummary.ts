import { useMutation, useQueryClient } from '@tanstack/react-query';
import { searchApiService, type CandidateSummaryResponse } from '../services/searchApiService';

export const useCandidateSummary = () => {
  const queryClient = useQueryClient();

  const summaryMutation = useMutation({
    mutationFn: (candidateId: string) => searchApiService.generateCandidateSummary(candidateId),
    onSuccess: (data, candidateId) => {
      // Cache the summary for this candidate
      queryClient.setQueryData(['candidateSummary', candidateId], data);
    },
    onError: (error) => {
      console.error('Failed to generate candidate summary:', error);
    },
  });

  const generateSummary = (candidateId: string) => {
    return summaryMutation.mutateAsync(candidateId);
  };

  return {
    generateSummary,
    isLoading: summaryMutation.isPending,
    error: summaryMutation.error,
    data: summaryMutation.data,
    reset: summaryMutation.reset,
  };
};
