import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidatesService, CandidateQueryParams } from '../services/candidatesService';
import { CreateCandidateDto } from '../types/candidate.types';

// Keys for React Query
const QUERY_KEYS = {
  candidates: 'candidates',
  candidateStats: 'candidateStats',
  candidateDetails: 'candidateDetails',
};

// Hook to fetch candidates with filters and pagination
export const useCandidates = (params: CandidateQueryParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.candidates, params],
    queryFn: async () => {
      const response = await candidatesService.getCandidates(params);
      
      // Transform the API response to match the component's expected format
      if (response.items && Array.isArray(response.items)) {        const transformedItems = response.items.map((candidate: any) => ({
          ...candidate,
          skills: Array.isArray(candidate.skillMappings) 
            ? candidate.skillMappings.map((sm: any) => sm.skill?.name || '').filter(Boolean)
            : [],
          // Keep the original experience array for detailed view
          experience: candidate.experience || [],
          // Add a computed field for years of experience (for display in list view)
          yearsOfExperience: candidate.experience?.length > 0 ? 
            Math.max(...candidate.experience.map((exp: any) => exp.years || 0)) : 0,
          lastActivityDate: candidate.lastActivity || null,
          rating: candidate.rating ? parseFloat(candidate.rating) : 0,
          // Transform languages array
          languages: candidate.languages || [],
          // Transform references array  
          references: candidate.references || [],
          // Transform custom fields array
          customFields: candidate.customFields || [],
          // Transform interests array (already included but ensuring consistency)
          interests: candidate.interests || [],
        }));
        
        return {
          ...response,
          items: transformedItems,
        };
      }
      
      return response;
    },
    placeholderData: (previousData) => previousData, // This replaces keepPreviousData in v5
  });
};

// Hook to fetch candidate statistics
export const useCandidateStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.candidateStats],
    queryFn: () => candidatesService.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to fetch a single candidate by ID
export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.candidateDetails, id],
    queryFn: () => candidatesService.getCandidate(id),
    enabled: !!id,
  });
};

// Hook to update candidate status
export const useUpdateCandidateStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      candidatesService.updateStatus(id, status),
    onSuccess: () => {
      // Invalidate and refetch candidates and stats
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.candidates] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.candidateStats] });
    },
  });
};

// Hook to update candidate rating
export const useUpdateCandidateRating = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) => 
      candidatesService.updateCandidateRating(id, rating),
    onSuccess: (_, variables) => {
      // Invalidate and refetch candidates and stats
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.candidates] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.candidateDetails, variables.id] });
    },
  });
};

// Hook to delete a candidate
export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => candidatesService.deleteCandidate(id),
    onSuccess: () => {
      // Invalidate and refetch candidates and stats
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.candidates] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.candidateStats] });
    },
  });
};

// Hook to create a new candidate
export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (candidateData: CreateCandidateDto) => candidatesService.createCandidate(candidateData),
    onSuccess: () => {
      // Invalidate and refetch candidates and stats
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.candidates] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.candidateStats] });
    },
  });
};

// Hook to update an existing candidate
export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, candidateData }: { id: string; candidateData: CreateCandidateDto }) => 
      candidatesService.updateCandidate(id, candidateData),
    onSuccess: () => {
      // Invalidate and refetch candidates and stats
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.candidates] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.candidateStats] });
    },
  });
};
