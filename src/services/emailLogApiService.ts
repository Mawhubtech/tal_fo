import apiClient from './api';

export interface EmailProvider {
  id: string;
  name: string;
  type: 'gmail' | 'outlook' | 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
  status: 'active' | 'inactive' | 'error' | 'expired';
  isDefault: boolean;
  fromEmail?: string;
  createdAt: string;
}

export interface EmailLog {
  id: string;
  subject: string;
  recipient?: string;
  sender?: string;
  from?: string;  // Gmail format
  to?: string;    // Gmail format
  cc?: string;    // Gmail format
  date?: string;  // Gmail format
  status?: 'sent' | 'delivered' | 'failed' | 'pending';
  type: 'outbound' | 'inbound' | 'sent' | 'received';
  body: string;
  htmlBody?: string;
  textBody?: string;
  snippet?: string;  // Gmail preview text
  sentAt?: string;
  deliveredAt?: string;
  failedReason?: string;
  metadata?: Record<string, any>;
  userId?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  isRead?: boolean;  // Gmail read status
  hasAttachments?: boolean;  // Gmail attachments
  labelIds?: string[];  // Gmail labels
  threadId?: string;  // Gmail thread
  internalDate?: string;  // Gmail internal date
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailLogFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: 'outbound' | 'inbound' | 'all' | 'sent' | 'inbox';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  userId?: string;
}

export interface PaginatedEmailLogs {
  data: EmailLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class EmailLogApiService {
  /**
   * Get all email logs with filtering and pagination
   */
  async getEmailLogs(filters: EmailLogFilters = {}): Promise<PaginatedEmailLogs> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/email/logs?${params.toString()}`);

      return {
        data: response.data.logs || response.data.data || response.data,
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 20,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || 0) / (response.data.limit || 20)),
      };
    } catch (error) {
      console.error('Error fetching email logs:', error);
      throw error;
    }
  }

  /**
   * Get email log by ID
   */
  async getEmailLogById(id: string): Promise<EmailLog> {
    try {
      const response = await apiClient.get(`/email/logs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching email log:', error);
      throw error;
    }
  }

  /**
   * Get email logs for current user
   */
  async getMyEmailLogs(filters: EmailLogFilters = {}): Promise<PaginatedEmailLogs> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/email/logs/my-emails?${params.toString()}`);

      return {
        data: response.data.logs || response.data.data || response.data,
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 20,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || 0) / (response.data.limit || 20)),
      };
    } catch (error) {
      console.error('Error fetching my email logs:', error);
      throw error;
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStats(): Promise<{
    sent: number;
    received: number;
    delivered: number;
    failed: number;
    pending: number;
  }> {
    try {
      const response = await apiClient.get('/email/logs/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching email stats:', error);
      throw error;
    }
  }

  /**
   * Get actual Gmail messages (from user's Gmail account)
   */
  async getGmailMessages(filters: EmailLogFilters = {}): Promise<PaginatedEmailLogs> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/email/gmail/messages?${params.toString()}`);

      return {
        data: response.data.data || response.data,
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 20,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || 0) / (response.data.limit || 20)),
      };
    } catch (error) {
      console.error('Error fetching Gmail messages:', error);
      throw error;
    }
  }

  /**
   * Get Gmail statistics
   */
  async getGmailStats(): Promise<{
    sent: number;
    received: number;
    unread: number;
    total: number;
  }> {
    try {
      const response = await apiClient.get('/email/gmail/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching Gmail stats:', error);
      throw error;
    }
  }

  /**
   * Get single Gmail message by ID
   */
  async getGmailMessageById(messageId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/email/gmail/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Gmail message:', error);
      throw error;
    }
  }

  /**
   * Get all connected email providers
   */
  async getConnectedProviders(): Promise<EmailProvider[]> {
    try {
      const response = await apiClient.get('/email/providers');
      return response.data;
    } catch (error) {
      console.error('Error fetching email providers:', error);
      throw error;
    }
  }

  /**
   * Get messages from a specific email provider
   */
  async getProviderMessages(providerId: string, filters: EmailLogFilters = {}): Promise<PaginatedEmailLogs> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/email/providers/${providerId}/messages?${params.toString()}`);

      return {
        data: response.data.data || response.data,
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 20,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || 0) / (response.data.limit || 20)),
      };
    } catch (error) {
      console.error('Error fetching provider messages:', error);
      throw error;
    }
  }

  /**
   * Get unified statistics across all providers
   */
  async getUnifiedStats(): Promise<{
    byProvider: Array<{
      providerId: string;
      providerName: string;
      providerType: string;
      stats: {
        sent: number;
        received: number;
        unread?: number;
        total: number;
      };
    }>;
    overall: {
      sent: number;
      received: number;
      unread: number;
      total: number;
    };
  }> {
    try {
      const response = await apiClient.get('/email/stats/unified');
      return response.data;
    } catch (error) {
      console.error('Error fetching unified stats:', error);
      throw error;
    }
  }
}

export const emailLogApiService = new EmailLogApiService();
