import { useMutation } from '@tanstack/react-query';
import { shortlistExternalCandidate } from '../services/searchService';

export interface ShortlistExternalCandidateParams {
  coreSignalId: number;
  candidateData: any;
  createdBy: string;
}

export interface ShortlistExternalCandidateResponse {
  success: boolean;
  candidateId?: string;
  message: string;
  existingCandidateId?: string;
}

/**
 * Hook for shortlisting external candidates (saving them to the database)
 */
export function useShortlistExternalCandidate() {
  return useMutation<
    ShortlistExternalCandidateResponse,
    Error,
    ShortlistExternalCandidateParams
  >({
    mutationFn: async ({ coreSignalId, candidateData, createdBy }) => {
      return await shortlistExternalCandidate(coreSignalId, candidateData, createdBy);
    },
    onError: (error) => {
      console.error('Error shortlisting external candidate:', error);
    }
  });
}
