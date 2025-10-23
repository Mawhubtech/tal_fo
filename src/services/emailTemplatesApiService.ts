import apiClient from '../lib/api';

export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  scope: 'global' | 'organization' | 'team' | 'personal';
  subject: string;
  body: string;  // Changed from 'content' to 'body' to match backend API
  htmlBody?: string;  // Changed from 'htmlContent' to 'htmlBody' to match backend API
  variables?: string[];
  metadata?: Record<string, any>;
  isActive: boolean;
  isDefault?: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdById?: string;
  clientId?: string;
  teamId?: string;
}

export interface EmailTemplatesListResponse {
  templates: EmailTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class EmailTemplatesApiService {
  private static readonly baseUrl = '/email-templates';

  static async getTemplates(params?: {
    category?: string;
    type?: string;
    scope?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<EmailTemplatesListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.category) searchParams.append('category', params.category);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.scope) searchParams.append('scope', params.scope);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`${this.baseUrl}?${searchParams.toString()}`);
    return response.data;
  }

  static async getTemplate(id: string): Promise<EmailTemplate> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  static async getRecruitmentTemplates(): Promise<EmailTemplate[]> {
    const response = await apiClient.get(`${this.baseUrl}/recruitment`);
    return response.data;
  }

  static async createTemplate(templateData: any): Promise<EmailTemplate> {
    const response = await apiClient.post(this.baseUrl, templateData);
    return response.data;
  }

  static async updateTemplate(id: string, templateData: any): Promise<EmailTemplate> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, templateData);
    return response.data;
  }

  static async incrementUsage(id: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/increment-usage`);
  }
}
