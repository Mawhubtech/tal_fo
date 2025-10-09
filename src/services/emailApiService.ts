import apiClient from '../lib/api';

export interface SendCandidateEmailDto {
  candidateId: string;
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  templateId?: string;
  variables?: Record<string, any>;
  providerId?: string;
}

export interface SendEmailDto {
  emailType: string;
  recipients: string[];
  subject: string;
  body: string;
}

export interface EmailResponse {
  message: string;
  emailId?: string;
}

export interface EmailLogEntry {
  id: string;
  candidateId?: string;
  subject: string;
  body: string;
  recipients: string[];
  fromEmail?: string;
  fromName?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'rejected';
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  template?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: Date;
}

export interface EmailSettings {
  isGmailConnected: boolean;
  gmailEmail?: string;
  hasRequiredScopes: boolean;
  lastConnected?: string;
}

export interface EmailHistoryResponse {
  emails: EmailLogEntry[];
  total: number;
  page: number;
  limit: number;
}

class EmailApiService {
  private baseUrl = '/email';

  /**
   * Send an email to a candidate using the general email endpoint
   */
  async sendCandidateEmail(emailData: SendCandidateEmailDto): Promise<EmailResponse> {
    // Try the enhanced candidate email endpoint first (if available)
    try {
      const response = await apiClient.post('/email-management/send-candidate-email', emailData);
      return response.data;
    } catch (error: any) {
      // Check if this is a Gmail reconnection error - don't use fallback, re-throw it
      if (error?.response?.status === 401) {
        const errorMessage = error.response?.data?.message || '';
        if (errorMessage.includes('Gmail') || errorMessage.includes('reconnect')) {
          // Re-throw Gmail errors so they can be handled by the UI
          throw error;
        }
      }
      
      // Fallback to general email endpoint for other errors
      console.warn('Enhanced candidate email endpoint not available, using fallback');
      
      const backendEmailData: SendEmailDto = {
        emailType: 'candidate_outreach',
        recipients: [emailData.to],
        subject: emailData.subject,
        body: emailData.htmlBody || emailData.body,
      };

      const response = await apiClient.post(`${this.baseUrl}/send`, backendEmailData);
      return response.data;
    }
  }

  /**
   * Get email history for a specific candidate
   */
  async getCandidateEmailHistory(
    candidateId: string,
    options?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<EmailHistoryResponse> {
    try {
      const params = new URLSearchParams();
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.status) params.append('status', options.status);
      
      const response = await apiClient.get(`/email-management/candidates/${candidateId}/email-history?${params.toString()}`);
      return response.data;
    } catch (error) {
      // Fallback: return empty result if endpoint doesn't exist yet
      console.warn('Email history endpoint not available yet');
      return {
        emails: [],
        total: 0,
        page: 1,
        limit: 10
      };
    }
  }

  /**
   * Get email history for current user (all emails sent by this user)
   */
  async getUserEmailHistory(options?: {
    page?: number;
    limit?: number;
    candidateId?: string;
    status?: string;
  }): Promise<EmailHistoryResponse> {
    try {
      const params = new URLSearchParams();
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.candidateId) params.append('candidateId', options.candidateId);
      if (options?.status) params.append('status', options.status);
      
      const response = await apiClient.get(`/email-management/email-history?${params.toString()}`);
      return response.data;
    } catch (error) {
      // Fallback: return empty result if endpoint doesn't exist yet
      console.warn('User email history endpoint not available yet');
      return {
        emails: [],
        total: 0,
        page: 1,
        limit: 10
      };
    }
  }

  /**
   * Get a specific email log entry
   */
  async getEmailLog(emailId: string): Promise<EmailLogEntry | null> {
    try {
      const response = await apiClient.get(`/email-management/email-logs/${emailId}`);
      return response.data;
    } catch (error) {
      console.warn('Email log endpoint not available yet');
      return null;
    }
  }

  /**
   * Get email templates
   */
  async getEmailTemplates(category?: string) {
    const params = category ? { category } : {};
    const response = await apiClient.get(`${this.baseUrl}/templates`, { params });
    return response.data;
  }

  /**
   * Get Gmail connection settings
   */
  async getGmailSettings(): Promise<{
    isGmailConnected: boolean;
    gmailEmail?: string;
    hasRequiredScopes: boolean;
    lastConnected?: string;
  }> {
    const response = await apiClient.get('/email/settings');
    return response.data;
  }

  /**
   * Connect Gmail account
   */
  async connectGmail(): Promise<{ authUrl: string }> {
    const response = await apiClient.post('/email/connect-gmail');
    return response.data;
  }

  /**
   * Reconnect Gmail account (forces re-authentication with all scopes)
   */
  async reconnectGmail(): Promise<{ authUrl: string }> {
    const response = await apiClient.post('/email/reconnect-gmail');
    return response.data;
  }

  /**
   * Force reauthorization with updated scopes
   */
  async forceReauthorization(): Promise<{ authUrl: string }> {
    const response = await apiClient.post('/email/force-reauthorization');
    return response.data;
  }

  /**
   * Get Gmail authorization URL for initial connection or reauthorization
   */
  async getGmailAuthUrl(): Promise<{ authUrl: string }> {
    const response = await apiClient.post('/email/connect-gmail');
    return response.data;
  }

  /**
   * Disconnect Gmail account
   */
  async disconnectGmail(): Promise<{ message: string }> {
    const response = await apiClient.delete('/email/disconnect-gmail');
    return response.data;
  }
}

export const emailApiService = new EmailApiService();
