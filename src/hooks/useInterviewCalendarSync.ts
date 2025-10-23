import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import InterviewCalendarIntegration from '../services/interviewCalendarIntegration';
import { useInterviews, INTERVIEW_QUERY_KEYS } from './useInterviews';
import type { Interview } from '../types/interview.types';

/**
 * Hook for managing interview-calendar synchronization
 */
export const useInterviewCalendarSync = () => {
  const queryClient = useQueryClient();

  /**
   * Sync a single interview to calendar
   */
  const syncSingleInterview = useMutation({
    mutationFn: async (interview: Interview) => {
      return await InterviewCalendarIntegration.createCalendarEventForInterview(interview);
    },
    onSuccess: () => {
      // Invalidate calendar queries to refresh the view
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
    },
    onError: (error) => {
      console.error('Failed to sync interview to calendar:', error);
    }
  });

  /**
   * Sync all interviews to calendar (bulk operation)
   */
  const syncAllInterviews = useMutation({
    mutationFn: async (interviews: Interview[]) => {
      return await InterviewCalendarIntegration.syncAllInterviewsToCalendar(interviews);
    },
    onSuccess: (result) => {
      // Invalidate calendar queries to refresh the view
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      console.log('Bulk sync results:', result);
    },
    onError: (error) => {
      console.error('Failed to bulk sync interviews to calendar:', error);
    }
  });

  /**
   * Remove calendar event for an interview
   */
  const removeCalendarEvent = useMutation({
    mutationFn: async (interviewId: string) => {
      return await InterviewCalendarIntegration.deleteCalendarEventForInterview(interviewId);
    },
    onSuccess: () => {
      // Invalidate calendar queries to refresh the view
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
    },
    onError: (error) => {
      console.error('Failed to remove calendar event for interview:', error);
    }
  });

  /**
   * Check sync status for interviews
   */
  const checkSyncStatus = useQuery({
    queryKey: ['interview-calendar-sync', 'status'],
    queryFn: async () => {
      // This could be implemented to check which interviews have calendar events
      // For now, we'll return a placeholder
      return {
        synced: 0,
        unsynced: 0,
        total: 0
      };
    },
    enabled: false, // Only run when explicitly requested
  });

  return {
    syncSingleInterview,
    syncAllInterviews,
    removeCalendarEvent,
    checkSyncStatus,
    
    // Status flags
    isSyncingSingle: syncSingleInterview.isPending,
    isSyncingAll: syncAllInterviews.isPending,
    isRemoving: removeCalendarEvent.isPending,
    
    // Error states
    syncError: syncSingleInterview.error || syncAllInterviews.error || removeCalendarEvent.error,
  };
};

/**
 * Hook to automatically sync interviews when they change
 * This can be used in components that need real-time sync
 */
export const useAutoInterviewCalendarSync = (interviews: Interview[] = []) => {
  const { syncSingleInterview } = useInterviewCalendarSync();
  
  // Auto-sync any interviews that don't have calendar events
  // This would need additional logic to check if an interview already has a calendar event
  // For now, it's a placeholder for future enhancement
  
  return {
    triggerAutoSync: () => {
      // Implementation would go here
      console.log('Auto-sync triggered for', interviews.length, 'interviews');
    }
  };
};

export default useInterviewCalendarSync;
