import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import emailTrackingApiService, {
  TrackingAnalytics,
  EngagementInsights,
  EmailTrackingEvent,
  TrackEmailEventRequest,
} from '../services/emailTrackingApiService';

// Query Keys
export const trackingKeys = {
  all: ['tracking'] as const,
  analytics: () => [...trackingKeys.all, 'analytics'] as const,
  stepAnalytics: (stepId: string) => [...trackingKeys.analytics(), 'step', stepId] as const,
  sequenceAnalytics: (sequenceId: string) => [...trackingKeys.analytics(), 'sequence', sequenceId] as const,
  insights: () => [...trackingKeys.all, 'insights'] as const,
  sequenceInsights: (sequenceId: string) => [...trackingKeys.insights(), sequenceId] as const,
  events: () => [...trackingKeys.all, 'events'] as const,
  executionEvents: (executionId: string) => [...trackingKeys.events(), 'execution', executionId] as const,
  recentEvents: (params?: any) => [...trackingKeys.events(), 'recent', params] as const,
  deviceAnalytics: (sequenceId?: string) => [...trackingKeys.analytics(), 'devices', sequenceId] as const,
  geographicAnalytics: (sequenceId?: string) => [...trackingKeys.analytics(), 'geographic', sequenceId] as const,
  timingAnalytics: (sequenceId?: string) => [...trackingKeys.analytics(), 'timing', sequenceId] as const,
};

/**
 * Hook to get analytics for a specific sequence step
 */
export function useStepAnalytics(stepId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: trackingKeys.stepAnalytics(stepId),
    queryFn: () => emailTrackingApiService.getStepAnalytics(stepId),
    enabled: options?.enabled !== false && !!stepId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to get analytics for an entire sequence
 */
export function useSequenceAnalytics(sequenceId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: trackingKeys.sequenceAnalytics(sequenceId),
    queryFn: () => emailTrackingApiService.getSequenceAnalytics(sequenceId),
    enabled: options?.enabled !== false && !!sequenceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to get engagement insights
 */
export function useEngagementInsights(sequenceId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: trackingKeys.sequenceInsights(sequenceId || 'global'),
    queryFn: () => emailTrackingApiService.getEngagementInsights(sequenceId),
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to get tracking events for a specific execution
 */
export function useExecutionEvents(executionId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: trackingKeys.executionEvents(executionId),
    queryFn: () => emailTrackingApiService.getExecutionEvents(executionId),
    enabled: options?.enabled !== false && !!executionId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook to get recent tracking events with pagination
 */
export function useRecentTrackingEvents(
  params?: {
    limit?: number;
    offset?: number;
    eventType?: EmailTrackingEvent['eventType'];
    sequenceId?: string;
  },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: trackingKeys.recentEvents(params),
    queryFn: () => emailTrackingApiService.getRecentEvents(params),
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to get device analytics
 */
export function useDeviceAnalytics(sequenceId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: trackingKeys.deviceAnalytics(sequenceId),
    queryFn: () => emailTrackingApiService.getDeviceAnalytics(sequenceId),
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to get geographic analytics
 */
export function useGeographicAnalytics(sequenceId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: trackingKeys.geographicAnalytics(sequenceId),
    queryFn: () => emailTrackingApiService.getGeographicAnalytics(sequenceId),
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to get timing analytics
 */
export function useTimingAnalytics(sequenceId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: trackingKeys.timingAnalytics(sequenceId),
    queryFn: () => emailTrackingApiService.getTimingAnalytics(sequenceId),
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Mutation hook to track email events
 */
export function useTrackEmailEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TrackEmailEventRequest) => 
      emailTrackingApiService.trackEmailEvent(data),
    onSuccess: (data) => {
      // Invalidate related queries to refresh analytics
      queryClient.invalidateQueries({ queryKey: trackingKeys.analytics() });
      queryClient.invalidateQueries({ queryKey: trackingKeys.events() });
      
      // Invalidate specific execution events
      queryClient.invalidateQueries({ 
        queryKey: trackingKeys.executionEvents(data.executionId) 
      });
    },
  });
}

/**
 * Mutation hook to track email clicks
 */
export function useTrackEmailClick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TrackEmailEventRequest) => 
      emailTrackingApiService.trackEmailClick(data),
    onSuccess: (data) => {
      // Invalidate related queries to refresh analytics
      queryClient.invalidateQueries({ queryKey: trackingKeys.analytics() });
      queryClient.invalidateQueries({ queryKey: trackingKeys.events() });
      
      // Invalidate specific execution events
      queryClient.invalidateQueries({ 
        queryKey: trackingKeys.executionEvents(data.executionId) 
      });
    },
  });
}

/**
 * Mutation hook to track manual events
 */
export function useTrackManualEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TrackEmailEventRequest) => 
      emailTrackingApiService.trackManualEvent(data),
    onSuccess: (data) => {
      // Invalidate related queries to refresh analytics
      queryClient.invalidateQueries({ queryKey: trackingKeys.analytics() });
      queryClient.invalidateQueries({ queryKey: trackingKeys.events() });
      
      // Invalidate specific execution events
      queryClient.invalidateQueries({ 
        queryKey: trackingKeys.executionEvents(data.executionId) 
      });
    },
  });
}

/**
 * Hook to refresh all tracking analytics
 */
export function useRefreshTrackingAnalytics() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: trackingKeys.analytics() });
    queryClient.invalidateQueries({ queryKey: trackingKeys.insights() });
    queryClient.invalidateQueries({ queryKey: trackingKeys.events() });
  };
}

/**
 * Combined hook for comprehensive tracking analytics
 */
export function useTrackingAnalytics(sequenceId: string, options?: { enabled?: boolean }) {
  const sequenceAnalytics = useSequenceAnalytics(sequenceId, options);
  const insights = useEngagementInsights(sequenceId, options);
  const deviceAnalytics = useDeviceAnalytics(sequenceId, options);
  const geographicAnalytics = useGeographicAnalytics(sequenceId, options);
  const timingAnalytics = useTimingAnalytics(sequenceId, options);

  return {
    analytics: sequenceAnalytics.data,
    insights: insights.data,
    devices: deviceAnalytics.data,
    geographic: geographicAnalytics.data,
    timing: timingAnalytics.data,
    isLoading: 
      sequenceAnalytics.isLoading ||
      insights.isLoading ||
      deviceAnalytics.isLoading ||
      geographicAnalytics.isLoading ||
      timingAnalytics.isLoading,
    isError:
      sequenceAnalytics.isError ||
      insights.isError ||
      deviceAnalytics.isError ||
      geographicAnalytics.isError ||
      timingAnalytics.isError,
    error:
      sequenceAnalytics.error ||
      insights.error ||
      deviceAnalytics.error ||
      geographicAnalytics.error ||
      timingAnalytics.error,
    refetch: () => {
      sequenceAnalytics.refetch();
      insights.refetch();
      deviceAnalytics.refetch();
      geographicAnalytics.refetch();
      timingAnalytics.refetch();
    },
  };
}
