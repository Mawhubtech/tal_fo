import { useMutation } from '@tanstack/react-query';
import { shortlistCoreSignalCandidate } from '../services/searchService';

export interface ShortlistCoreSignalCandidateParams {
  coreSignalId: number;
  candidateData: any;
  createdBy: string;
}

export interface ShortlistCoreSignalCandidateResponse {
  success: boolean;
  candidateId?: string;
  message: string;
  existingCandidateId?: string;
}

/**
 * Hook for shortlisting CoreSignal candidates (saving them to the database)
 */
export function useShortlistCoreSignalCandidate() {
  return useMutation<
    ShortlistCoreSignalCandidateResponse,
    Error,
    ShortlistCoreSignalCandidateParams
  >({
    mutationFn: async ({ coreSignalId, candidateData, createdBy }) => {
      return await shortlistCoreSignalCandidate(coreSignalId, candidateData, createdBy);
    },
    onError: (error) => {
      console.error('Error shortlisting CoreSignal candidate:', error);
    }
  });
}
