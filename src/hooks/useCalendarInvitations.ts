import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarApiService, EventInvitation, InviteToEventRequest, EventInvitationResponse } from '../services/calendarApiService';

// Query Keys
export const calendarInvitationKeys = {
  all: ['calendar', 'invitations'] as const,
  eventInvitations: (eventId: string) => ['calendar', 'invitations', 'event', eventId] as const,
  myPendingInvitations: () => ['calendar', 'invitations', 'pending'] as const,
  companyUsers: () => ['users', 'company-members'] as const,
};

// Get invitations for a specific event
export const useEventInvitations = (eventId: string) => {
  return useQuery({
    queryKey: calendarInvitationKeys.eventInvitations(eventId),
    queryFn: () => calendarApiService.getEventInvitations(eventId),
    enabled: !!eventId,
  });
};

// Get user's pending event invitations
export const useMyPendingEventInvitations = () => {
  return useQuery({
    queryKey: calendarInvitationKeys.myPendingInvitations(),
    queryFn: () => calendarApiService.getMyPendingEventInvitations(),
    staleTime: 30000, // 30 seconds
  });
};

// Get company users for invitation purposes
export const useCompanyUsers = () => {
  return useQuery({
    queryKey: calendarInvitationKeys.companyUsers(),
    queryFn: () => calendarApiService.getCompanyUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Invite users to an event
export const useInviteToEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteToEventRequest) => calendarApiService.inviteToEvent(data),
    onSuccess: (_, variables) => {
      // Invalidate event invitations for the specific event
      queryClient.invalidateQueries({
        queryKey: calendarInvitationKeys.eventInvitations(variables.eventId)
      });
      
      // Invalidate pending invitations for all affected users
      queryClient.invalidateQueries({
        queryKey: calendarInvitationKeys.myPendingInvitations()
      });
      
      // Invalidate calendar events to update attendee list
      queryClient.invalidateQueries({
        queryKey: ['calendar', 'events']
      });
    },
  });
};

// Respond to an event invitation
export const useRespondToEventInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId, response }: { invitationId: string; response: EventInvitationResponse }) => 
      calendarApiService.respondToEventInvitation(invitationId, response),
    onSuccess: (data) => {
      // Invalidate pending invitations
      queryClient.invalidateQueries({
        queryKey: calendarInvitationKeys.myPendingInvitations()
      });
      
      // Invalidate event invitations for the specific event
      if (data.invitation.eventId) {
        queryClient.invalidateQueries({
          queryKey: calendarInvitationKeys.eventInvitations(data.invitation.eventId)
        });
      }
      
      // Invalidate calendar events to update attendee list
      queryClient.invalidateQueries({
        queryKey: ['calendar', 'events']
      });
    },
  });
};

// Resend an event invitation
export const useResendEventInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => calendarApiService.resendEventInvitation(invitationId),
    onSuccess: (data) => {
      // Invalidate event invitations for the specific event
      if (data.invitation.eventId) {
        queryClient.invalidateQueries({
          queryKey: calendarInvitationKeys.eventInvitations(data.invitation.eventId)
        });
      }
    },
  });
};

// Cancel an event invitation
export const useCancelEventInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => calendarApiService.cancelEventInvitation(invitationId),
    onSuccess: () => {
      // Invalidate all invitation queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: calendarInvitationKeys.all
      });
      
      // Invalidate calendar events to update attendee list
      queryClient.invalidateQueries({
        queryKey: ['calendar', 'events']
      });
    },
  });
};
