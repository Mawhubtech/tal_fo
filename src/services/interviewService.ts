import apiClient from './api';
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
  InterviewFeedback,
  InterviewParticipant,
} from '../types/interview.types';

export class InterviewService {
  private static readonly BASE_PATH = '/interviews';

  /**
   * Create a new interview
   */
  static async createInterview(data: CreateInterviewRequest): Promise<Interview> {
    const response = await apiClient.post(this.BASE_PATH, data);
    return response.data;
  }

  /**
   * Get all interviews with optional filters
   */
  static async getInterviews(filters?: InterviewFilters): Promise<InterviewsResponse> {
    const response = await apiClient.get(this.BASE_PATH, { params: filters });
    return response.data;
  }

  /**
   * Get a specific interview by ID
   */
  static async getInterview(id: string): Promise<Interview> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Update an interview
   */
  static async updateInterview(id: string, data: UpdateInterviewRequest): Promise<Interview> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Reschedule an interview
   */
  static async rescheduleInterview(
    id: string,
    data: RescheduleInterviewRequest
  ): Promise<Interview> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}/reschedule`, data);
    return response.data;
  }

  /**
   * Cancel an interview
   */
  static async cancelInterview(id: string, data: CancelInterviewRequest): Promise<Interview> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}/cancel`, data);
    return response.data;
  }

  /**
   * Start an interview
   */
  static async startInterview(id: string): Promise<Interview> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}/start`);
    return response.data;
  }

  /**
   * Complete an interview
   */
  static async completeInterview(id: string): Promise<Interview> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}/complete`);
    return response.data;
  }

  /**
   * Add feedback to an interview
   */
  static async addInterviewFeedback(
    id: string,
    data: CreateInterviewFeedbackRequest
  ): Promise<InterviewFeedback> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/feedback`, data);
    return response.data;
  }

  /**
   * Update participant status
   */
  static async updateParticipantStatus(
    interviewId: string,
    participantId: string,
    data: UpdateParticipantStatusRequest
  ): Promise<InterviewParticipant> {
    const response = await apiClient.patch(
      `${this.BASE_PATH}/${interviewId}/participants/${participantId}/status`,
      data
    );
    return response.data;
  }

  /**
   * Get upcoming interviews for the current user
   */
  static async getUpcomingInterviews(days: number = 7): Promise<Interview[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/upcoming`, {
      params: { days },
    });
    return response.data;
  }

  /**
   * Get interview statistics
   */
  static async getInterviewStats(): Promise<InterviewStats> {
    const response = await apiClient.get(`${this.BASE_PATH}/stats`);
    return response.data;
  }

  /**
   * Get interviews by job application
   */
  static async getInterviewsByJobApplication(jobApplicationId: string): Promise<Interview[]> {
    const response = await apiClient.get(this.BASE_PATH, {
      params: { jobApplicationId },
    });
    return response.data.interviews;
  }

  /**
   * Get interviews for a specific date range
   */
  static async getInterviewsByDateRange(
    startDate: string,
    endDate: string,
    filters?: Partial<InterviewFilters>
  ): Promise<InterviewsResponse> {
    const response = await apiClient.get(this.BASE_PATH, {
      params: {
        startDate,
        endDate,
        ...filters,
      },
    });
    return response.data;
  }

  /**
   * Get interviews where the current user is a participant
   */
  static async getMyInterviews(filters?: Partial<InterviewFilters>): Promise<InterviewsResponse> {
    const response = await apiClient.get(this.BASE_PATH, {
      params: filters,
    });
    return response.data;
  }

  /**
   * Search interviews by candidate name or job title
   */
  static async searchInterviews(
    query: string,
    filters?: Partial<InterviewFilters>
  ): Promise<InterviewsResponse> {
    const response = await apiClient.get(this.BASE_PATH, {
      params: {
        search: query,
        ...filters,
      },
    });
    return response.data;
  }

  /**
   * Get available time slots for scheduling
   */
  static async getAvailableTimeSlots(
    participantIds: string[],
    date: string,
    duration: number = 60
  ): Promise<{ startTime: string; endTime: string }[]> {
    const response = await apiClient.post(`${this.BASE_PATH}/availability`, {
      participantIds,
      date,
      duration,
    });
    return response.data;
  }

  /**
   * Send interview reminders
   */
  static async sendInterviewReminder(id: string): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/${id}/reminder`);
  }

  /**
   * Generate interview calendar invite
   */
  static async generateCalendarInvite(id: string): Promise<{ icsContent: string }> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/calendar-invite`);
    return response.data;
  }

  /**
   * Bulk update interview statuses
   */
  static async bulkUpdateInterviews(
    interviewIds: string[],
    updates: Partial<UpdateInterviewRequest>
  ): Promise<Interview[]> {
    const response = await apiClient.patch(`${this.BASE_PATH}/bulk`, {
      interviewIds,
      updates,
    });
    return response.data;
  }

  /**
   * Export interviews to CSV
   */
  static async exportInterviews(filters?: InterviewFilters): Promise<Blob> {
    const response = await apiClient.get(`${this.BASE_PATH}/export`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }
}

export default InterviewService;
