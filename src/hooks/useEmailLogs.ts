import { useQuery } from '@tanstack/react-query';
import { emailLogApiService, type EmailLogFilters, type EmailProvider } from '../services/emailLogApiService';

// Query keys
export const emailLogKeys = {
  all: ['emailLogs'] as const,
  lists: () => [...emailLogKeys.all, 'list'] as const,
  list: (filters: EmailLogFilters) => [...emailLogKeys.lists(), { filters }] as const,
  details: () => [...emailLogKeys.all, 'detail'] as const,
  detail: (id: string) => [...emailLogKeys.details(), id] as const,
  myEmails: (filters: EmailLogFilters) => [...emailLogKeys.all, 'myEmails', { filters }] as const,
  stats: () => [...emailLogKeys.all, 'stats'] as const,
};

/**
 * Hook to fetch all email logs with filters
 */
export function useEmailLogs(
  filters: EmailLogFilters = {}, 
  options: { enabled?: boolean; refetchInterval?: number | false } = {}
) {
  return useQuery({
    queryKey: emailLogKeys.list(filters),
    queryFn: () => emailLogApiService.getEmailLogs(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval,
  });
}

/**
 * Hook to fetch email log by ID
 */
export function useEmailLog(id: string) {
  return useQuery({
    queryKey: emailLogKeys.detail(id),
    queryFn: () => emailLogApiService.getEmailLogById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch current user's email logs
 */
export function useMyEmailLogs(
  filters: EmailLogFilters = {},
  options: { enabled?: boolean; refetchInterval?: number | false } = {}
) {
  return useQuery({
    queryKey: emailLogKeys.myEmails(filters),
    queryFn: () => emailLogApiService.getMyEmailLogs(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval,
  });
}

/**
 * Hook to fetch email statistics
 */
export function useEmailStats(options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: emailLogKeys.stats(),
    queryFn: () => emailLogApiService.getEmailStats(),
    staleTime: 1000 * 60 * 3, // 3 minutes
    ...options,
  });
}

/**
 * Hook to fetch Gmail messages (from actual Gmail account)
 */
export function useGmailMessages(
  filters: EmailLogFilters = {},
  options?: { refetchInterval?: number | false }
) {
  return useQuery({
    queryKey: ['gmailMessages', filters],
    queryFn: () => emailLogApiService.getGmailMessages(filters),
    ...options,
  });
}

/**
 * Hook to fetch Gmail statistics
 */
export function useGmailStats(options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: ['gmailStats'],
    queryFn: () => emailLogApiService.getGmailStats(),
    ...options,
  });
}

/**
 * Hook to fetch single Gmail message by ID
 */
export function useGmailMessage(messageId: string) {
  return useQuery({
    queryKey: ['gmailMessage', messageId],
    queryFn: () => emailLogApiService.getGmailMessageById(messageId),
    enabled: !!messageId,
  });
}

/**
 * Hook to fetch connected email providers
 */
export function useEmailProviders() {
  return useQuery({
    queryKey: ['emailProviders'],
    queryFn: () => emailLogApiService.getConnectedProviders(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch messages from a specific provider
 */
export function useProviderMessages(
  providerId: string,
  filters: EmailLogFilters = {},
  options?: { refetchInterval?: number | false }
) {
  return useQuery({
    queryKey: ['providerMessages', providerId, filters],
    queryFn: () => emailLogApiService.getProviderMessages(providerId, filters),
    enabled: !!providerId,
    ...options,
  });
}

/**
 * Hook to fetch unified statistics across all providers
 */
export function useUnifiedStats(options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: ['unifiedStats'],
    queryFn: () => emailLogApiService.getUnifiedStats(),
    ...options,
  });
}
