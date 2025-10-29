import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import categoryApiService from '../services/categoryApiService';
import {
  CandidateCategory,
  CreateCandidateCategoryDto,
  UpdateCandidateCategoryDto,
  AssignCandidateCategoriesDto,
  CategoryStats,
} from '../types/candidate.types';

// Query keys
export const CATEGORY_KEYS = {
  all: ['categories'] as const,
  lists: () => [...CATEGORY_KEYS.all, 'list'] as const,
  list: (filters?: { isActive?: boolean; search?: string }) =>
    [...CATEGORY_KEYS.lists(), filters] as const,
  stats: () => [...CATEGORY_KEYS.all, 'stats'] as const,
  detail: (id: string) => [...CATEGORY_KEYS.all, 'detail', id] as const,
  candidateCategories: (candidateId: string) =>
    [...CATEGORY_KEYS.all, 'candidate', candidateId] as const,
};

/**
 * Hook to fetch all categories
 */
export function useCategories(
  params?: { isActive?: boolean; search?: string },
  options?: Omit<UseQueryOptions<{ categories: CandidateCategory[] }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(params),
    queryFn: () => categoryApiService.getCategories(params),
    ...options,
  });
}

/**
 * Hook to fetch category statistics
 */
export function useCategoryStats(
  options?: Omit<UseQueryOptions<{ stats: CategoryStats[] }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: CATEGORY_KEYS.stats(),
    queryFn: () => categoryApiService.getCategoryStats(),
    ...options,
  });
}

/**
 * Hook to fetch a single category
 */
export function useCategory(
  id: string,
  options?: Omit<UseQueryOptions<{ category: CandidateCategory }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: CATEGORY_KEYS.detail(id),
    queryFn: () => categoryApiService.getCategory(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to fetch categories for a specific candidate
 */
export function useCandidateCategories(
  candidateId: string,
  options?: Omit<UseQueryOptions<{ categories: CandidateCategory[] }>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: CATEGORY_KEYS.candidateCategories(candidateId),
    queryFn: () => categoryApiService.getCandidateCategories(candidateId),
    enabled: !!candidateId,
    ...options,
  });
}

/**
 * Hook to create a new category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCandidateCategoryDto) =>
      categoryApiService.createCategory(data),
    onSuccess: () => {
      // Invalidate all category lists
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.stats() });
    },
  });
}

/**
 * Hook to update a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCandidateCategoryDto }) =>
      categoryApiService.updateCategory(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate the specific category detail
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.detail(variables.id) });
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.stats() });
    },
  });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApiService.deleteCategory(id),
    onSuccess: () => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
}

/**
 * Hook to assign categories to a candidate
 */
export function useAssignCategoriesToCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      candidateId,
      data,
    }: {
      candidateId: string;
      data: AssignCandidateCategoriesDto;
    }) => categoryApiService.assignCategoriesToCandidate(candidateId, data),
    onSuccess: (_data, variables) => {
      // Invalidate candidate categories
      queryClient.invalidateQueries({
        queryKey: CATEGORY_KEYS.candidateCategories(variables.candidateId),
      });
      // Invalidate category stats (candidate counts have changed)
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.stats() });
      // Invalidate candidates list to refresh category badges
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}
