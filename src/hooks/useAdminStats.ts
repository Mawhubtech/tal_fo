import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { adminApiService, AdminStats, AdminActivity, SystemComponent } from '../services/adminApiService';

/**
 * Hook to fetch admin dashboard statistics
 */
export const useAdminStats = (): UseQueryResult<AdminStats, Error> => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApiService.getAdminStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

/**
 * Hook to fetch recent admin activity
 */
export const useAdminActivity = (limit: number = 20): UseQueryResult<AdminActivity[], Error> => {
  return useQuery({
    queryKey: ['admin', 'activity', limit],
    queryFn: () => adminApiService.getRecentActivity(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

/**
 * Hook to fetch system component status
 */
export const useSystemComponents = (): UseQueryResult<SystemComponent[], Error> => {
  return useQuery({
    queryKey: ['admin', 'system', 'components'],
    queryFn: () => adminApiService.getSystemComponents(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 1 * 60 * 1000, // Refetch every minute for system monitoring
  });
};
