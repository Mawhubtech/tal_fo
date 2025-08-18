import api from '../lib/api';
import {
  InterviewTemplate,
  CreateInterviewTemplateRequest,
  UpdateInterviewTemplateRequest,
  InterviewTemplateFilters,
  InterviewTemplatesResponse,
  AIInterviewTemplateRequest,
  AIInterviewTemplateResponse
} from '../types/interviewTemplate.types';

export class InterviewTemplateService {
  private static readonly BASE_PATH = '/interview-templates';

  /**
   * Get interview templates with filters
   */
  static async getTemplates(filters?: InterviewTemplateFilters): Promise<InterviewTemplatesResponse> {
    const response = await api.get(this.BASE_PATH, { params: filters });
    return response.data;
  }

  /**
   * Get a specific interview template by ID
   */
  static async getTemplate(id: string): Promise<InterviewTemplate> {
    const response = await api.get(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Create a new interview template
   */
  static async createTemplate(data: CreateInterviewTemplateRequest): Promise<InterviewTemplate> {
    const response = await api.post(this.BASE_PATH, data);
    return response.data;
  }

  /**
   * Update an interview template
   */
  static async updateTemplate(data: UpdateInterviewTemplateRequest): Promise<InterviewTemplate> {
    const { id, ...updateData } = data;
    const response = await api.patch(`${this.BASE_PATH}/${id}`, updateData);
    return response.data;
  }

  /**
   * Delete an interview template
   */
  static async deleteTemplate(id: string): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Generate an interview template using AI
   */
  static async generateAITemplate(data: AIInterviewTemplateRequest): Promise<AIInterviewTemplateResponse> {
    const response = await api.post(`${this.BASE_PATH}/generate-ai`, data);
    return response.data;
  }

  /**
   * Clone an existing template
   */
  static async cloneTemplate(id: string, newName?: string): Promise<InterviewTemplate> {
    const response = await api.post(`${this.BASE_PATH}/${id}/clone`, { name: newName });
    return response.data;
  }

  /**
   * Mark template as used (increments usage count)
   */
  static async markTemplateUsed(id: string): Promise<void> {
    await api.post(`${this.BASE_PATH}/${id}/use`);
  }

  /**
   * Get default templates for a specific interview type
   */
  static async getDefaultTemplates(interviewType?: string): Promise<InterviewTemplate[]> {
    const response = await api.get(`${this.BASE_PATH}/defaults`, {
      params: { interviewType }
    });
    return response.data;
  }

  /**
   * Get templates for a specific job
   */
  static async getJobTemplates(jobId: string): Promise<InterviewTemplate[]> {
    const response = await api.get(`${this.BASE_PATH}/job/${jobId}`);
    return response.data;
  }
}
