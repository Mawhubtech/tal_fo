import { useQuery } from '@tanstack/react-query';
import { userAssignmentApiService, type UserAssignment } from '../services/userAssignmentApiService';

// Query keys
export const userAssignmentKeys = {
  all: ['userAssignments'] as const,
  myAssignment: () => [...userAssignmentKeys.all, 'my'] as const,
  userAssignment: (userId: string) => [...userAssignmentKeys.all, 'user', userId] as const,
};

/**
 * Hook to get the current user's organization assignment
 * This is specifically for internal recruiters who are assigned to a single organization by admin
 */
export function useMyAssignment() {
  return useQuery({
    queryKey: userAssignmentKeys.myAssignment(),
    queryFn: () => userAssignmentApiService.getMyAssignment(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry if user has no assignment
  });
}

/**
 * Hook to get a specific user's organization assignment (admin use)
 */
export function useUserAssignment(userId: string) {
  return useQuery({
    queryKey: userAssignmentKeys.userAssignment(userId),
    queryFn: () => userAssignmentApiService.getUserAssignment(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}
