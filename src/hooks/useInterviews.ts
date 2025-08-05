import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import InterviewService from '../services/interviewService';
import InterviewCalendarIntegration from '../services/interviewCalendarIntegration';
import type {
  Interview,
  InterviewsResponse,
  InterviewStats,
  CreateInterviewRequest,
  UpdateInterviewRequest,
  RescheduleInterviewRequest,
  CancelInterviewRequest,
  CreateInterviewFeedbackRequest,
  UpdateParticipantStatusRequest,
  InterviewFilters,
  InterviewStatus,
  InterviewType,
} from '../types/interview.types';

// Query Keys
export const INTERVIEW_QUERY_KEYS = {
  all: ['interviews'] as const,
  lists: () => [...INTERVIEW_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: InterviewFilters) => [...INTERVIEW_QUERY_KEYS.lists(), filters] as const,
  details: () => [...INTERVIEW_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...INTERVIEW_QUERY_KEYS.details(), id] as const,
  stats: () => [...INTERVIEW_QUERY_KEYS.all, 'stats'] as const,
  upcoming: (days?: number) => [...INTERVIEW_QUERY_KEYS.all, 'upcoming', days] as const,
  byJobApplication: (id: string) => [...INTERVIEW_QUERY_KEYS.all, 'jobApplication', id] as const,
} as const;

/**
 * Hook for fetching interviews with filters
 */
export const useInterviews = (filters?: InterviewFilters) => {
  return useQuery({
    queryKey: INTERVIEW_QUERY_KEYS.list(filters),
    queryFn: () => InterviewService.getInterviews(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for fetching a single interview
 */
export const useInterview = (id: string) => {
  return useQuery({
    queryKey: INTERVIEW_QUERY_KEYS.detail(id),
    queryFn: () => InterviewService.getInterview(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for fetching interview statistics
 */
export const useInterviewStats = () => {
  return useQuery({
    queryKey: INTERVIEW_QUERY_KEYS.stats(),
    queryFn: () => InterviewService.getInterviewStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching upcoming interviews
 */
export const useUpcomingInterviews = (days: number = 7) => {
  return useQuery({
    queryKey: INTERVIEW_QUERY_KEYS.upcoming(days),
    queryFn: () => InterviewService.getUpcomingInterviews(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for fetching interviews by job application
 */
export const useInterviewsByJobApplication = (jobApplicationId: string) => {
  return useQuery({
    queryKey: INTERVIEW_QUERY_KEYS.byJobApplication(jobApplicationId),
    queryFn: () => InterviewService.getInterviewsByJobApplication(jobApplicationId),
    enabled: !!jobApplicationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for creating interviews
 */
export const useCreateInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInterviewRequest) => InterviewService.createInterview(data),
    onSuccess: async (newInterview) => {
      // Invalidate and refetch interview lists
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.upcoming() });
      
      // Add the new interview to relevant query caches
      queryClient.setQueryData(
        INTERVIEW_QUERY_KEYS.detail(newInterview.id),
        newInterview
      );
      
      // Create corresponding calendar event
      try {
        await InterviewCalendarIntegration.createCalendarEventForInterview(newInterview);
        // Invalidate calendar queries to show the new event
        queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      } catch (error) {
        console.warn('Failed to create calendar event for interview:', error);
        // Don't throw - interview creation should succeed even if calendar fails
      }
    },
  });
};

/**
 * Hook for updating interviews
 */
export const useUpdateInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInterviewRequest }) =>
      InterviewService.updateInterview(id, data),
    onSuccess: async (updatedInterview) => {
      // Update the specific interview cache
      queryClient.setQueryData(
        INTERVIEW_QUERY_KEYS.detail(updatedInterview.id),
        updatedInterview
      );
      
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.stats() });
      
      // Update corresponding calendar event
      try {
        await InterviewCalendarIntegration.updateCalendarEventForInterview(updatedInterview);
        // Invalidate calendar queries to show the updated event
        queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      } catch (error) {
        console.warn('Failed to update calendar event for interview:', error);
        // Don't throw - interview update should succeed even if calendar fails
      }
    },
  });
};

/**
 * Hook for rescheduling interviews
 */
export const useRescheduleInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RescheduleInterviewRequest }) =>
      InterviewService.rescheduleInterview(id, data),
    onSuccess: async (updatedInterview) => {
      queryClient.setQueryData(
        INTERVIEW_QUERY_KEYS.detail(updatedInterview.id),
        updatedInterview
      );
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.upcoming() });
      
      // Update corresponding calendar event with new schedule
      try {
        await InterviewCalendarIntegration.updateCalendarEventForInterview(updatedInterview);
        queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      } catch (error) {
        console.warn('Failed to update calendar event for rescheduled interview:', error);
      }
    },
  });
};

/**
 * Hook for cancelling interviews
 */
export const useCancelInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelInterviewRequest }) =>
      InterviewService.cancelInterview(id, data),
    onSuccess: async (updatedInterview) => {
      queryClient.setQueryData(
        INTERVIEW_QUERY_KEYS.detail(updatedInterview.id),
        updatedInterview
      );
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.stats() });
      
      // Update calendar event status to cancelled
      try {
        await InterviewCalendarIntegration.updateCalendarEventForInterview(updatedInterview);
        queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      } catch (error) {
        console.warn('Failed to update calendar event for cancelled interview:', error);
      }
    },
  });
};

/**
 * Hook for starting interviews
 */
export const useStartInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InterviewService.startInterview(id),
    onSuccess: (updatedInterview) => {
      queryClient.setQueryData(
        INTERVIEW_QUERY_KEYS.detail(updatedInterview.id),
        updatedInterview
      );
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.lists() });
    },
  });
};

/**
 * Hook for completing interviews
 */
export const useCompleteInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InterviewService.completeInterview(id),
    onSuccess: (updatedInterview) => {
      queryClient.setQueryData(
        INTERVIEW_QUERY_KEYS.detail(updatedInterview.id),
        updatedInterview
      );
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.stats() });
    },
  });
};

/**
 * Hook for adding interview feedback
 */
export const useAddInterviewFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateInterviewFeedbackRequest }) =>
      InterviewService.addInterviewFeedback(id, data),
    onSuccess: (_, { id }) => {
      // Refetch the interview to include new feedback
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.detail(id) });
    },
  });
};

/**
 * Hook for updating participant status
 */
export const useUpdateParticipantStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      interviewId,
      participantId,
      data,
    }: {
      interviewId: string;
      participantId: string;
      data: UpdateParticipantStatusRequest;
    }) => InterviewService.updateParticipantStatus(interviewId, participantId, data),
    onSuccess: (_, { interviewId }) => {
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.detail(interviewId) });
    },
  });
};

/**
 * Custom hook for interview management with common operations
 */
export const useInterviewManager = () => {
  const queryClient = useQueryClient();

  const invalidateInterviewQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.all });
  }, [queryClient]);

  const refreshInterviewData = useCallback((interviewId?: string) => {
    if (interviewId) {
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.detail(interviewId) });
    } else {
      invalidateInterviewQueries();
    }
  }, [queryClient, invalidateInterviewQueries]);

  return {
    invalidateInterviewQueries,
    refreshInterviewData,
  };
};

/**
 * Hook for filtering and searching interviews
 */
export const useInterviewFilters = (initialFilters?: InterviewFilters) => {
  const [filters, setFilters] = useState<InterviewFilters>(initialFilters || {});
  const [searchQuery, setSearchQuery] = useState('');

  const updateFilter = useCallback((key: keyof InterviewFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  const resetPagination = useCallback(() => {
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  return {
    filters,
    searchQuery,
    setFilters,
    setSearchQuery,
    updateFilter,
    clearFilters,
    resetPagination,
  };
};

/**
 * Hook for interview calendar functionality
 */
export const useInterviewCalendar = (initialDate?: Date) => {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const startOfMonth = useMemo(() => {
    const date = new Date(currentDate);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [currentDate]);

  const endOfMonth = useMemo(() => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    date.setHours(23, 59, 59, 999);
    return date;
  }, [currentDate]);

  const monthInterviews = useInterviews({
    startDate: startOfMonth.toISOString(),
    endDate: endOfMonth.toISOString(),
  });

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }, []);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  }, []);

  return {
    currentDate,
    selectedDate,
    monthInterviews,
    navigateMonth,
    goToToday,
    goToDate,
    setSelectedDate,
  };
};

/**
 * Hook for interview dashboard data
 */
export const useInterviewDashboard = () => {
  const stats = useInterviewStats();
  const upcomingInterviews = useUpcomingInterviews(7);
  const todayInterviews = useInterviews({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const isLoading = stats.isLoading || upcomingInterviews.isLoading || todayInterviews.isLoading;
  const error = stats.error || upcomingInterviews.error || todayInterviews.error;

  return {
    stats: stats.data,
    upcomingInterviews: upcomingInterviews.data || [],
    todayInterviews: todayInterviews.data?.interviews || [],
    isLoading,
    error,
    refetch: () => {
      stats.refetch();
      upcomingInterviews.refetch();
      todayInterviews.refetch();
    },
  };
};
