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
  SaveInterviewProgressRequest,
  CreateInterviewResponseRequest,
  UpdateInterviewResponseRequest,
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
      
      // Invalidate all interview-specific queries to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(updatedInterview.id), 'responses'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(updatedInterview.id), 'progress'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(updatedInterview.id), 'stats'] 
      });
      
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
      
      // Invalidate interview-specific queries to reflect schedule changes
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(updatedInterview.id), 'progress'] 
      });
      
      // Invalidate lists and schedule-related queries
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.upcoming() });
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.stats() });
      
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
      
      // Invalidate interview-specific queries to reflect cancellation
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(updatedInterview.id), 'progress'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(updatedInterview.id), 'responses'] 
      });
      
      // Invalidate lists and schedule-related queries
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.upcoming() });
      
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
 * Hook for deleting interviews
 */
export const useDeleteInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InterviewService.deleteInterview(id),
    onSuccess: async (_, interviewId) => {
      // Remove the interview from cache
      queryClient.removeQueries({ queryKey: INTERVIEW_QUERY_KEYS.detail(interviewId) });
      
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.upcoming() });
      
      // Remove corresponding calendar event
      try {
        await InterviewCalendarIntegration.deleteCalendarEventForInterview(interviewId);
        queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      } catch (error) {
        console.warn('Failed to delete calendar event for interview:', error);
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
      
      // Invalidate interview-specific queries to reflect started status
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(updatedInterview.id), 'progress'] 
      });
      
      // Invalidate lists to show updated status
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.lists() });
      
      // Invalidate global stats to reflect status change
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.stats() });
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
      
      // Invalidate interview-specific queries that might show feedback
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(id), 'responses'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(id), 'progress'] 
      });
      
      // Invalidate lists to show updated status/feedback
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.lists() });
      
      // Invalidate global stats to reflect feedback changes
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.stats() });
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
      // Invalidate the specific interview
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.detail(interviewId) });
      
      // Invalidate lists to show updated participant status
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.lists() });
      
      // Invalidate global stats if participant status affects overall metrics
      queryClient.invalidateQueries({ queryKey: INTERVIEW_QUERY_KEYS.stats() });
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

// Interview Progress and Response Hooks

/**
 * Hook for fetching interview progress
 */
export const useInterviewProgress = (interviewId: string) => {
  return useQuery({
    queryKey: [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'progress'],
    queryFn: () => InterviewService.getInterviewProgress(interviewId),
    enabled: !!interviewId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for saving interview progress
 */
export const useSaveInterviewProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ interviewId, progressData }: { 
      interviewId: string; 
      progressData: SaveInterviewProgressRequest;
    }) => InterviewService.saveInterviewProgress(interviewId, progressData),
    onSuccess: (savedProgress, { interviewId }) => {
      // Update progress cache
      queryClient.setQueryData(
        [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'progress'],
        savedProgress
      );
      
      // Invalidate specific interview detail to refresh status/data
      queryClient.invalidateQueries({ 
        queryKey: INTERVIEW_QUERY_KEYS.detail(interviewId) 
      });
      
      // Invalidate related queries for the specific interview
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'responses'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'stats'] 
      });
      
      // Invalidate interview lists to show updated progress/status
      queryClient.invalidateQueries({ 
        queryKey: INTERVIEW_QUERY_KEYS.lists() 
      });
      
      // Invalidate global stats to reflect progress changes
      queryClient.invalidateQueries({ 
        queryKey: INTERVIEW_QUERY_KEYS.stats() 
      });
    },
  });
};

/**
 * Hook for fetching interview responses
 */
export const useInterviewResponses = (interviewId: string) => {
  return useQuery({
    queryKey: [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'responses'],
    queryFn: () => InterviewService.getInterviewResponses(interviewId),
    enabled: !!interviewId,
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook for creating interview response
 */
export const useCreateInterviewResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ interviewId, responseData }: { 
      interviewId: string; 
      responseData: CreateInterviewResponseRequest;
    }) => InterviewService.createInterviewResponse(interviewId, responseData),
    onSuccess: (newResponse, { interviewId }) => {
      // Invalidate specific interview detail to refresh status/data
      queryClient.invalidateQueries({ 
        queryKey: INTERVIEW_QUERY_KEYS.detail(interviewId) 
      });
      
      // Invalidate specific interview-related queries
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'responses'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'progress'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'stats'] 
      });
      
      // Invalidate interview lists to show updated status
      queryClient.invalidateQueries({ 
        queryKey: INTERVIEW_QUERY_KEYS.lists() 
      });
      
      // Invalidate global stats to reflect new responses
      queryClient.invalidateQueries({ 
        queryKey: INTERVIEW_QUERY_KEYS.stats() 
      });
    },
  });
};

/**
 * Hook for updating interview response
 */
export const useUpdateInterviewResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ responseId, responseData }: { 
      responseId: string; 
      responseData: UpdateInterviewResponseRequest;
    }) => InterviewService.updateInterviewResponse(responseId, responseData),
    onSuccess: (updatedResponse) => {
      // Invalidate specific interview detail to refresh status/data
      queryClient.invalidateQueries({ 
        queryKey: INTERVIEW_QUERY_KEYS.detail(updatedResponse.interviewId) 
      });
      
      // Invalidate related queries - we need to get interview ID from response
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(updatedResponse.interviewId), 'responses'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(updatedResponse.interviewId), 'progress'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(updatedResponse.interviewId), 'stats'] 
      });
      
      // Invalidate interview lists to show updated status
      queryClient.invalidateQueries({ 
        queryKey: INTERVIEW_QUERY_KEYS.lists() 
      });
      
      // Invalidate global stats to reflect updated responses
      queryClient.invalidateQueries({ 
        queryKey: INTERVIEW_QUERY_KEYS.stats() 
      });
    },
  });
};

/**
 * Hook for deleting interview response
 */
export const useDeleteInterviewResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ responseId, interviewId }: { 
      responseId: string; 
      interviewId: string;
    }) => InterviewService.deleteInterviewResponse(responseId),
    onSuccess: (_, { interviewId }) => {
      // Invalidate specific interview detail to refresh status/data
      queryClient.invalidateQueries({ 
        queryKey: INTERVIEW_QUERY_KEYS.detail(interviewId) 
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'responses'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'progress'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'stats'] 
      });
      
      // Invalidate interview lists to show updated status
      queryClient.invalidateQueries({ 
        queryKey: INTERVIEW_QUERY_KEYS.lists() 
      });
      
      // Invalidate global stats to reflect deleted responses
      queryClient.invalidateQueries({ 
        queryKey: INTERVIEW_QUERY_KEYS.stats() 
      });
    },
  });
};

/**
 * Hook for fetching interview statistics
 */
export const useInterviewStatsForInterview = (interviewId: string) => {
  return useQuery({
    queryKey: [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'stats'],
    queryFn: () => InterviewService.getInterviewStatsForInterview(interviewId),
    enabled: !!interviewId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Utility hook for centralized query invalidation
 * Use this to ensure comprehensive data refresh across all interview components
 */
export const useInterviewQueryInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateInterviewData = useCallback((interviewId: string) => {
    // Invalidate the specific interview
    queryClient.invalidateQueries({ 
      queryKey: INTERVIEW_QUERY_KEYS.detail(interviewId) 
    });
    
    // Invalidate all interview-specific sub-queries
    queryClient.invalidateQueries({ 
      queryKey: [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'responses'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'progress'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: [...INTERVIEW_QUERY_KEYS.detail(interviewId), 'stats'] 
    });
    
    // Invalidate lists and global queries
    queryClient.invalidateQueries({ 
      queryKey: INTERVIEW_QUERY_KEYS.lists() 
    });
    queryClient.invalidateQueries({ 
      queryKey: INTERVIEW_QUERY_KEYS.stats() 
    });
    queryClient.invalidateQueries({ 
      queryKey: INTERVIEW_QUERY_KEYS.upcoming() 
    });
  }, [queryClient]);

  const invalidateAllInterviewQueries = useCallback(() => {
    // Invalidate all interview-related queries
    queryClient.invalidateQueries({ 
      queryKey: INTERVIEW_QUERY_KEYS.all 
    });
  }, [queryClient]);

  const refreshInterviewData = useCallback((interviewId?: string) => {
    if (interviewId) {
      invalidateInterviewData(interviewId);
    } else {
      invalidateAllInterviewQueries();
    }
  }, [invalidateInterviewData, invalidateAllInterviewQueries]);

  return {
    invalidateInterviewData,
    invalidateAllInterviewQueries,
    refreshInterviewData,
  };
};
