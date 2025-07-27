import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { dashboardApiService, DashboardStats, DashboardMetrics, DashboardActivity } from '../services/dashboardApiService';

/**
 * Hook to fetch dashboard statistics
 */
export const useDashboardStats = (): UseQueryResult<DashboardStats, Error> => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApiService.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

/**
 * Hook to fetch dashboard metrics (transformed stats)
 */
export const useDashboardMetrics = (): UseQueryResult<DashboardMetrics, Error> => {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => dashboardApiService.getDashboardMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

/**
 * Hook to fetch recent activity
 */
export const useRecentActivity = (limit: number = 10): UseQueryResult<DashboardActivity[], Error> => {
  return useQuery({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: () => dashboardApiService.getRecentActivity(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });
};
