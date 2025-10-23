import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api';
import { toast } from '../components/ToastContainer';

interface TrackResponseData {
  type: 'email_reply' | 'email_open' | 'linkedin_accept' | 'linkedin_message' | 'phone_answer';
  data?: any;
  timestamp?: string;
}

interface TrackResponseResponse {
  message: string;
  actionTaken: string;
}

// Track candidate response to a sequence execution
export const useTrackCandidateResponse = (sequenceId?: string) => {
  const queryClient = useQueryClient();

  return useMutation<TrackResponseResponse, Error, { executionId: string; responseData: TrackResponseData }>({
    mutationFn: async ({ executionId, responseData }) => {
      const response = await apiClient.post(
        `/sourcing/sequences/executions/${executionId}/track-response`,
        responseData
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Response Tracked', data.message);
      
      // Invalidate relevant queries for response tracking and candidates tabs
      // This will refresh both the candidates tab and response tracking tab data
      queryClient.invalidateQueries({ queryKey: ['sourcing-sequences'] });
      queryClient.invalidateQueries({ queryKey: ['sequence-executions'] });
      queryClient.invalidateQueries({ queryKey: ['sequence-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['sequence-analytics'] });
      
      // If we have a specific sequenceId, invalidate its enrollments and steps more specifically
      if (sequenceId) {
        // Invalidate sequence-specific enrollments (candidates tab data)
        queryClient.invalidateQueries({ 
          queryKey: ['sourcing-sequences', 'detail', sequenceId, 'enrollments']
        });
        // Invalidate sequence detail (might affect sequence metrics)
        queryClient.invalidateQueries({ 
          queryKey: ['sourcing-sequences', 'detail', sequenceId]
        });
        // Invalidate sequence steps (response tracking might affect step metrics)
        queryClient.invalidateQueries({ 
          queryKey: ['sourcing-sequences', 'detail', sequenceId, 'steps']
        });
        // Invalidate sequence performance data
        queryClient.invalidateQueries({ 
          queryKey: ['sourcing-sequences', 'detail', sequenceId, 'performance']
        });
      }
    },
    onError: (error: any) => {
      console.error('Error tracking response:', error);
      toast.error('Tracking Failed', error.response?.data?.message || 'Failed to track response');
    },
  });
};

// Process response-based actions for a sequence
export const useProcessResponseActions = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; actionsProcessed: number }, Error, string>({
    mutationFn: async (sequenceId: string) => {
      const response = await apiClient.post(
        `/sourcing/sequences/${sequenceId}/process-responses`
      );
      return response.data;
    },
    onSuccess: (data, sequenceId) => {
      toast.success('Responses Processed', `${data.actionsProcessed} actions processed`);
      
      // Invalidate relevant queries for response tracking and candidates tabs
      // This will refresh both the candidates tab and response tracking tab data
      queryClient.invalidateQueries({ queryKey: ['sourcing-sequences'] });
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      queryClient.invalidateQueries({ queryKey: ['sequence-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['sequence-analytics'] });
      
      // Invalidate specific sequence data
      if (sequenceId) {
        queryClient.invalidateQueries({ 
          queryKey: ['sourcing-sequences', 'detail', sequenceId, 'enrollments']
        });
        queryClient.invalidateQueries({ 
          queryKey: ['sourcing-sequences', 'detail', sequenceId]
        });
        queryClient.invalidateQueries({ 
          queryKey: ['sourcing-sequences', 'detail', sequenceId, 'steps']
        });
        queryClient.invalidateQueries({ 
          queryKey: ['sourcing-sequences', 'detail', sequenceId, 'performance']
        });
      }
    },
    onError: (error: any) => {
      console.error('Error processing responses:', error);
      toast.error('Processing Failed', error.response?.data?.message || 'Failed to process responses');
    },
  });
};

// Utility function to track email opens (can be called from email tracking pixels)
export const trackEmailOpen = (executionId: string) => {
  return apiClient.post(`/sourcing/sequences/executions/${executionId}/track-response`, {
    type: 'email_open',
    timestamp: new Date().toISOString()
  });
};

// Utility function to track email replies (can be called from email webhook handlers)
export const trackEmailReply = (executionId: string, replyData?: any) => {
  return apiClient.post(`/sourcing/sequences/executions/${executionId}/track-response`, {
    type: 'email_reply',
    data: replyData,
    timestamp: new Date().toISOString()
  });
};
