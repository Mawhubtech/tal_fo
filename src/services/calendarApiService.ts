import apiClient from '../lib/api';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: 'interview' | 'meeting' | 'call' | 'review' | 'deadline' | 'follow_up' | 'other';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: string;
  reminderSettings?: {
    enabled: boolean;
    reminderTimes: number[];
  };
  metadata?: {
    candidateId?: string;
    jobId?: string;
    companyId?: string;
    applicationId?: string;
    [key: string]: any;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  attendees: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  type: CalendarEvent['type'];
  priority?: CalendarEvent['priority'];
  startDate: string;
  endDate: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: string;
  reminderSettings?: {
    enabled: boolean;
    reminderTimes: number[];
  };
  attendeeIds?: string[];
  metadata?: CalendarEvent['metadata'];
}

export interface UpdateCalendarEventRequest extends Partial<CreateCalendarEventRequest> {
  status?: CalendarEvent['status'];
}

export interface CalendarEventsQuery {
  startDate?: string;
  endDate?: string;
  type?: CalendarEvent['type'];
  status?: CalendarEvent['status'];
  search?: string;
  limit?: number;
  offset?: number;
  includeAttendees?: boolean;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
  total: number;
}

export interface CalendarStats {
  totalEvents: number;
  upcomingEvents: number;
  todayEvents: number;
  overdue: number;
}

class CalendarApiService {
  private readonly baseUrl = '/calendar';

  /**
   * Create a new calendar event
   */
  async createEvent(eventData: CreateCalendarEventRequest): Promise<CalendarEvent> {
    const response = await apiClient.post(`${this.baseUrl}/events`, eventData);
    return response.data;
  }

  /**
   * Get calendar events with optional filters
   */
  async getEvents(query: CalendarEventsQuery = {}): Promise<CalendarEventsResponse> {
    const response = await apiClient.get(`${this.baseUrl}/events`, { params: query });
    return response.data;
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 5): Promise<CalendarEvent[]> {
    const response = await apiClient.get(`${this.baseUrl}/events/upcoming`, {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Get calendar statistics
   */
  async getCalendarStats(): Promise<CalendarStats> {
    const response = await apiClient.get(`${this.baseUrl}/events/stats`);
    return response.data;
  }

  /**
   * Get a specific event by ID
   */
  async getEventById(eventId: string): Promise<CalendarEvent> {
    const response = await apiClient.get(`${this.baseUrl}/events/${eventId}`);
    return response.data;
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventId: string, eventData: UpdateCalendarEventRequest): Promise<CalendarEvent> {
    const response = await apiClient.patch(`${this.baseUrl}/events/${eventId}`, eventData);
    return response.data;
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/events/${eventId}`);
  }

  /**
   * Get events for a specific date range (for calendar view)
   */
  async getEventsForDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const response = await this.getEvents({
      startDate,
      endDate,
      includeAttendees: true
    });
    return response.events;
  }

  /**
   * Get today's events
   */
  async getTodayEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return this.getEventsForDateRange(
      startOfDay.toISOString(),
      endOfDay.toISOString()
    );
  }

  /**
   * Get events for current month (for calendar widget)
   */
  async getMonthEvents(year: number, month: number): Promise<CalendarEvent[]> {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

    return this.getEventsForDateRange(
      startOfMonth.toISOString(),
      endOfMonth.toISOString()
    );
  }

  /**
   * Quick create interview event
   */
  async createInterviewEvent(data: {
    title: string;
    candidateId: string;
    jobId?: string;
    startDate: string;
    endDate: string;
    location?: string;
    meetingLink?: string;
    attendeeIds?: string[];
  }): Promise<CalendarEvent> {
    return this.createEvent({
      ...data,
      type: 'interview',
      priority: 'high',
      metadata: {
        candidateId: data.candidateId,
        jobId: data.jobId,
      },
      reminderSettings: {
        enabled: true,
        reminderTimes: [15, 60], // 15 minutes and 1 hour before
      }
    });
  }

  /**
   * Quick create meeting event
   */
  async createMeetingEvent(data: {
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    meetingLink?: string;
    attendeeIds?: string[];
    companyId?: string;
  }): Promise<CalendarEvent> {
    return this.createEvent({
      ...data,
      type: 'meeting',
      priority: 'medium',
      metadata: {
        companyId: data.companyId,
      },
      reminderSettings: {
        enabled: true,
        reminderTimes: [15], // 15 minutes before
      }
    });
  }

  /**
   * Format event for display
   */
  formatEventTime(event: CalendarEvent): string {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    if (event.isAllDay) {
      return 'All day';
    }

    const startTime = startDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const endTime = endDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // If same day, show time range
    if (startDate.toDateString() === endDate.toDateString()) {
      return `${startTime} - ${endTime}`;
    }

    // If different days, show full date and time
    return `${startDate.toLocaleDateString()} ${startTime} - ${endDate.toLocaleDateString()} ${endTime}`;
  }

  /**
   * Get event type color/icon mapping
   */
  getEventTypeStyles(type: CalendarEvent['type']): {
    color: string;
    bgColor: string;
    icon: string;
  } {
    const typeStyles = {
      interview: { color: 'text-purple-600', bgColor: 'bg-purple-100', icon: 'Target' },
      meeting: { color: 'text-purple-700', bgColor: 'bg-purple-100', icon: 'Building' },
      call: { color: 'text-purple-500', bgColor: 'bg-purple-100', icon: 'Phone' },
      review: { color: 'text-purple-800', bgColor: 'bg-purple-100', icon: 'BarChart3' },
      deadline: { color: 'text-red-600', bgColor: 'bg-red-100', icon: 'Clock' },
      follow_up: { color: 'text-purple-400', bgColor: 'bg-purple-100', icon: 'MessageSquare' },
      other: { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: 'Calendar' },
    };

    return typeStyles[type] || typeStyles.other;
  }
}

export const calendarApiService = new CalendarApiService();
