import { useMutation } from '@tanstack/react-query';
import { shortlistExternalCandidate } from '../services/searchService';

export interface ShortlistExternalCandidateParams {
  coreSignalId: number | string; // Accept both for flexibility
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
      // Convert coreSignalId to number if it's a string
      const numericCoreSignalId = typeof coreSignalId === 'string' ? parseInt(coreSignalId, 10) : coreSignalId;
      
      if (isNaN(numericCoreSignalId)) {
        throw new Error(`Invalid coreSignalId: ${coreSignalId}`);
      }
      
      return await shortlistExternalCandidate(numericCoreSignalId, candidateData, createdBy);
    },
    onError: (error) => {
      console.error('Error shortlisting external candidate:', error);
    }
  });
}
