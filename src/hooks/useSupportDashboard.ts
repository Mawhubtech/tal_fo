import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import apiClient from '../services/api';

// Types
interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface SupportMessage {
  id: string;
  content: string;
  sender: 'user' | 'admin' | 'system' | 'ai';
  isInternal: boolean;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SupportStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  averageResponseTime: number;
  averageResolutionTime: number;
}

// Query Keys
export const SUPPORT_QUERY_KEYS = {
  tickets: (status?: string, priority?: string, search?: string) => 
    ['admin-support-tickets', status, priority, search],
  stats: () => ['admin-support-stats'],
  messages: (ticketId?: string) => ['support-ticket-messages', ticketId],
  adminUsers: () => ['admin-users'],
} as const;

export const useSupportDashboard = () => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isManaging, setIsManaging] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [newAssignee, setNewAssignee] = useState('');

  const queryClient = useQueryClient();

  // Queries
  const useTickets = (selectedStatus: string, selectedPriority: string, searchTerm: string) => {
    return useQuery({
      queryKey: SUPPORT_QUERY_KEYS.tickets(selectedStatus, selectedPriority, searchTerm),
      queryFn: () => apiClient.get('/support/admin/tickets', {
        params: {
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          priority: selectedPriority !== 'all' ? selectedPriority : undefined,
          search: searchTerm || undefined
        }
      }),
    });
  };

  const useStats = () => {
    return useQuery({
      queryKey: SUPPORT_QUERY_KEYS.stats(),
      queryFn: () => apiClient.get('/support/admin/stats'),
    });
  };

  const useMessages = () => {
    return useQuery({
      queryKey: SUPPORT_QUERY_KEYS.messages(selectedTicket?.id),
      queryFn: async () => {
        console.log('Fetching messages for ticket:', selectedTicket?.id);
        const response = await apiClient.get(`/support/tickets/${selectedTicket?.id}/messages`);
        console.log('Messages response:', response);
        return response;
      },
      enabled: !!selectedTicket && isManaging,
    });
  };

  const useAdminUsers = () => {
    return useQuery({
      queryKey: SUPPORT_QUERY_KEYS.adminUsers(),
      queryFn: async () => {
        console.log('Fetching admin users');
        const response = await apiClient.get('/users/admins');
        console.log('Admin users response:', response);
        return response;
      },
    });
  };

  // Mutations
  const addMessageMutation = useMutation({
    mutationFn: ({ ticketId, content, isInternal }: { ticketId: string; content: string; isInternal: boolean }) =>
      apiClient.post(`/support/tickets/${ticketId}/messages`, { 
        content, 
        isInternal, 
        sender: 'admin' 
      }),
    onSuccess: () => {
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.messages(selectedTicket?.id) });
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] }); // Invalidate all ticket queries
      queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.stats() });
      setNewMessage('');
      setIsInternal(false);
    },
  });

  const assignTicketMutation = useMutation({
    mutationFn: async ({ ticketId, assigneeId }: { ticketId: string; assigneeId: string }) => {
      console.log('Assigning ticket:', ticketId, 'to assignee:', assigneeId);
      const response = await apiClient.patch(`/support/admin/tickets/${ticketId}/assign`, { 
        assigneeId: assigneeId || null 
      });
      console.log('Assignment response:', response.data);
      return response;
    },
    onSuccess: (response, variables) => {
      console.log('Assignment successful, invalidating queries...');
      
      // Invalidate all related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] }); // Invalidate all ticket queries
      queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.messages(selectedTicket?.id) });
      
      // Update the local ticket state with the response data
      if (selectedTicket && response?.data) {
        const updatedTicket = response.data;
        console.log('Updated ticket assignee:', updatedTicket.assignee);
        
        setSelectedTicket({ 
          ...selectedTicket, 
          assignee: updatedTicket.assignee || undefined,
          updatedAt: updatedTicket.updatedAt || selectedTicket.updatedAt
        });
        
        // Update the newAssignee state to match what was actually saved
        setNewAssignee(updatedTicket.assigneeId || '');
      }
    },
    onError: (error) => {
      console.error('Failed to assign ticket:', error);
      // Reset the assignee selection to the original value on error
      if (selectedTicket) {
        setNewAssignee(selectedTicket.assignee?.id || '');
      }
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) =>
      apiClient.patch(`/support/admin/tickets/${ticketId}/status`, { status }),
    onSuccess: (response, variables) => {
      // Invalidate all related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] }); // Invalidate all ticket queries
      queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.messages(selectedTicket?.id) });
      
      // Update local state with fresh data from response
      if (selectedTicket && response?.data) {
        const updatedTicket = response.data;
        setSelectedTicket({ 
          ...selectedTicket, 
          status: updatedTicket.status || variables.status,
          updatedAt: updatedTicket.updatedAt || selectedTicket.updatedAt
        });
        setNewStatus(updatedTicket.status || variables.status);
      } else if (selectedTicket) {
        // Fallback to using the variables if response doesn't contain data
        setSelectedTicket({ ...selectedTicket, status: variables.status });
        setNewStatus(variables.status);
      }
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: ({ ticketId, priority }: { ticketId: string; priority: string }) =>
      apiClient.patch(`/support/admin/tickets/${ticketId}/priority`, { priority }),
    onSuccess: (response, variables) => {
      // Invalidate all related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] }); // Invalidate all ticket queries
      queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.messages(selectedTicket?.id) });
      
      // Update local state with fresh data from response
      if (selectedTicket && response?.data) {
        const updatedTicket = response.data;
        setSelectedTicket({ 
          ...selectedTicket, 
          priority: updatedTicket.priority || variables.priority,
          updatedAt: updatedTicket.updatedAt || selectedTicket.updatedAt
        });
        setNewPriority(updatedTicket.priority || variables.priority);
      } else if (selectedTicket) {
        // Fallback to using the variables if response doesn't contain data
        setSelectedTicket({ ...selectedTicket, priority: variables.priority });
        setNewPriority(variables.priority);
      }
    },
  });

  // Helper functions
  const openManageTicket = (ticket: SupportTicket) => {
    console.log('Opening manage ticket for:', ticket.ticketNumber);
    console.log('Current assignee:', ticket.assignee);
    
    setSelectedTicket(ticket);
    setIsManaging(true);
    setNewStatus(ticket.status);
    setNewPriority(ticket.priority);
    setNewAssignee(ticket.assignee?.id || '');
    
    console.log('Set newAssignee to:', ticket.assignee?.id || '');
  };

  const closeManageTicket = () => {
    setSelectedTicket(null);
    setIsManaging(false);
    setNewMessage('');
    setIsInternal(false);
    setNewStatus('');
    setNewPriority('');
    setNewAssignee('');
  };

  const retryMessages = () => {
    queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.messages(selectedTicket?.id) });
  };

  return {
    // State
    selectedTicket,
    setSelectedTicket,
    isManaging,
    setIsManaging,
    newMessage,
    setNewMessage,
    isInternal,
    setIsInternal,
    newStatus,
    setNewStatus,
    newPriority,
    setNewPriority,
    newAssignee,
    setNewAssignee,
    
    // Query hooks
    useTickets,
    useStats,
    useMessages,
    useAdminUsers,
    
    // Mutations
    addMessageMutation,
    assignTicketMutation,
    updateStatusMutation,
    updatePriorityMutation,
    
    // Helper functions
    openManageTicket,
    closeManageTicket,
    retryMessages,
    
    // Query client for direct access if needed
    queryClient,
  };
};

export type { SupportTicket, SupportMessage, AdminUser, SupportStats };
