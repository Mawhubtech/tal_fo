import api from './api';
import {
  IntakeMeetingTemplate,
  CreateIntakeMeetingTemplateRequest,
  UpdateIntakeMeetingTemplateRequest,
  IntakeMeetingTemplateFilters,
  IntakeMeetingTemplatesResponse,
  IntakeMeetingSession,
  CreateIntakeMeetingSessionRequest,
  UpdateIntakeMeetingSessionRequest,
  SendInvitationsRequest,
  AIIntakeMeetingTemplateRequest,
  AIIntakeMeetingTemplateResponse
} from '../types/intakeMeetingTemplate.types';

export class IntakeMeetingTemplateService {
  private static readonly BASE_PATH = '/intake-meeting-templates';
  private static readonly SESSIONS_PATH = '/intake-meeting-sessions';

  /**
   * Get intake meeting templates with optional filters
   */
  static async getTemplates(filters: IntakeMeetingTemplateFilters = {}): Promise<IntakeMeetingTemplate[]> {
    const params = new URLSearchParams();
    
    if (filters.organizationId) params.append('organizationId', filters.organizationId);
    if (filters.isDefault !== undefined) params.append('isDefault', filters.isDefault.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`${this.BASE_PATH}?${params.toString()}`);
    return response.data.templates || [];
  }

  /**
   * Get a specific intake meeting template
   */
  static async getTemplate(id: string): Promise<IntakeMeetingTemplate> {
    const response = await api.get(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Create a new intake meeting template
   */
  static async createTemplate(data: CreateIntakeMeetingTemplateRequest): Promise<IntakeMeetingTemplate> {
    const response = await api.post(this.BASE_PATH, data);
    return response.data;
  }

  /**
   * Update an existing intake meeting template
   */
  static async updateTemplate(data: UpdateIntakeMeetingTemplateRequest): Promise<IntakeMeetingTemplate> {
    const response = await api.put(`${this.BASE_PATH}/${data.id}`, data);
    return response.data;
  }

  /**
   * Delete an intake meeting template
   */
  static async deleteTemplate(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Clone an intake meeting template
   */
  static async cloneTemplate(id: string, newName: string): Promise<IntakeMeetingTemplate> {
    const response = await api.post(`${this.BASE_PATH}/${id}/clone`, { name: newName });
    return response.data;
  }

  /**
   * Generate an intake meeting template using AI
   */
  static async generateAITemplate(data: AIIntakeMeetingTemplateRequest): Promise<AIIntakeMeetingTemplateResponse> {
    const response = await api.post(`${this.BASE_PATH}/generate-ai`, data);
    return response.data;
  }

  // Session Management

  /**
   * Get intake meeting sessions
   */
  static async getSessions(clientId?: string): Promise<IntakeMeetingSession[]> {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    
    const response = await api.get(`${this.SESSIONS_PATH}?${params.toString()}`);
    console.log('Sessions API response:', response.data); // Debug log
    return response.data.sessions || [];
  }

  /**
   * Get a specific intake meeting session
   */
  static async getSession(id: string): Promise<IntakeMeetingSession> {
    const response = await api.get(`${this.SESSIONS_PATH}/${id}`);
    return response.data;
  }

  /**
   * Create a new intake meeting session
   */
  static async createSession(data: CreateIntakeMeetingSessionRequest): Promise<IntakeMeetingSession> {
    const response = await api.post(this.SESSIONS_PATH, data);
    return response.data;
  }

  /**
   * Update an intake meeting session
   */
  static async updateSession(id: string, data: UpdateIntakeMeetingSessionRequest): Promise<IntakeMeetingSession> {
    const response = await api.put(`${this.SESSIONS_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Delete an intake meeting session
   */
  static async deleteSession(id: string): Promise<void> {
    await api.delete(`${this.SESSIONS_PATH}/${id}`);
  }

  /**
   * Send invitations for an intake meeting session
   */
  static async sendInvitations(sessionId: string, data: SendInvitationsRequest): Promise<{ message: string }> {
    const response = await api.post(`${this.SESSIONS_PATH}/${sessionId}/send-invitations`, data);
    return response.data;
  }

  /**
   * Generate job description from intake session
   */
  static async generateJobDescription(sessionId: string): Promise<{ jobDescription: string; title: string; requirements: string[]; responsibilities: string[] }> {
    const response = await api.post(`${this.SESSIONS_PATH}/${sessionId}/generate-job-description`);
    return response.data;
  }

  /**
   * Generate interview template from intake session
   */
  static async generateInterviewTemplate(sessionId: string, interviewType: string): Promise<any> {
    const response = await api.post(`${this.SESSIONS_PATH}/${sessionId}/generate-interview-template`, {
      interviewType
    });
    return response.data;
  }
}
