import { CalendarEvent, CreateCalendarEventRequest, calendarApiService } from './calendarApiService';
import type { Interview, CreateInterviewRequest } from '../types/interview.types';

/**
 * Service for integrating interviews with calendar events
 * Automatically creates, updates, and deletes calendar events when interviews are managed
 */
export class InterviewCalendarIntegration {
  
  /**
   * Convert interview data to calendar event data
   */
  static convertInterviewToCalendarEvent(interview: Interview | CreateInterviewRequest): CreateCalendarEventRequest {
    const isExistingInterview = 'id' in interview;
    
    // Calculate end time based on duration
    const startDate = new Date(interview.scheduledAt);
    const endDate = new Date(startDate.getTime() + (interview.durationMinutes || 60) * 60 * 1000);
    
    // Build event title with fallbacks for new interviews
    let candidateName = 'Candidate';
    let jobTitle = 'Position';
    
    if (isExistingInterview) {
      candidateName = interview.jobApplication?.candidate?.fullName || 
                    interview.jobApplication?.candidate?.firstName + ' ' + interview.jobApplication?.candidate?.lastName ||
                    'Unknown Candidate';
      jobTitle = interview.jobApplication?.job?.title || 'Unknown Position';
    }
    
    const title = `${interview.type} Interview - ${candidateName} (${jobTitle})`;
    
    // Build description
    const descriptionParts = [
      `Type: ${interview.type}`,
      `Mode: ${interview.mode}`,
      `Stage: ${interview.stage}`,
    ];
    
    if (interview.agenda) descriptionParts.push(`Agenda: ${interview.agenda}`);
    if (interview.notes) descriptionParts.push(`Notes: ${interview.notes}`);
    if (interview.location) descriptionParts.push(`Location: ${interview.location}`);
    if (interview.meetingLink) descriptionParts.push(`Meeting Link: ${interview.meetingLink}`);
    
    const description = descriptionParts.join('\n');
    
    // Build metadata for linking back to interview
    const metadata = {
      interviewId: isExistingInterview ? interview.id : undefined,
      candidateId: isExistingInterview ? interview.jobApplication?.candidate?.id : undefined,
      jobId: isExistingInterview ? interview.jobApplication?.job?.id : undefined,
      jobApplicationId: interview.jobApplicationId,
      candidateName,
      jobTitle,
      interviewType: interview.type,
      interviewMode: interview.mode,
      interviewStage: interview.stage,
      type: 'interview'
    };
    
    return {
      title,
      description,
      type: 'interview',
      priority: this.mapInterviewStageToPriority(interview.stage),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      location: interview.location,
      meetingLink: interview.meetingLink,
      notes: interview.preparationNotes,
      isAllDay: false,
      isRecurring: false,
      metadata
    };
  }
  
  /**
   * Create a calendar event for a new interview
   */
  static async createCalendarEventForInterview(interview: Interview): Promise<CalendarEvent | null> {
    try {
      const eventData = this.convertInterviewToCalendarEvent(interview);
      const calendarEvent = await calendarApiService.createEvent(eventData);
      console.log('Calendar event created for interview:', interview.id, 'Event ID:', calendarEvent.id);
      return calendarEvent;
    } catch (error) {
      console.error('Failed to create calendar event for interview:', error);
      // Don't throw - we don't want calendar failures to break interview creation
      return null;
    }
  }
  
  /**
   * Update calendar event when interview is updated
   */
  static async updateCalendarEventForInterview(interview: Interview): Promise<CalendarEvent | null> {
    try {
      // First, try to find the existing calendar event
      const existingEvent = await this.findCalendarEventForInterview(interview.id);
      
      if (!existingEvent) {
        // If no event exists, create one
        return await this.createCalendarEventForInterview(interview);
      }
      
      // Update the existing event
      const eventData = this.convertInterviewToCalendarEvent(interview);
      const updatedEvent = await calendarApiService.updateEvent(existingEvent.id, {
        ...eventData,
        status: this.mapInterviewStatusToCalendarStatus(interview.status)
      });
      
      console.log('Calendar event updated for interview:', interview.id, 'Event ID:', updatedEvent.id);
      return updatedEvent;
    } catch (error) {
      console.error('Failed to update calendar event for interview:', error);
      return null;
    }
  }
  
  /**
   * Delete calendar event when interview is deleted
   */
  static async deleteCalendarEventForInterview(interviewId: string): Promise<boolean> {
    try {
      const existingEvent = await this.findCalendarEventForInterview(interviewId);
      
      if (existingEvent) {
        await calendarApiService.deleteEvent(existingEvent.id);
        console.log('Calendar event deleted for interview:', interviewId, 'Event ID:', existingEvent.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to delete calendar event for interview:', error);
      return false;
    }
  }
  
  /**
   * Find calendar event associated with an interview
   */
  static async findCalendarEventForInterview(interviewId: string): Promise<CalendarEvent | null> {
    try {
      // Query calendar events with interview metadata
      const eventsResponse = await calendarApiService.getEvents({
        type: 'interview',
        limit: 100 // Should be enough to find the specific interview
      });
      
      const events = Array.isArray(eventsResponse) ? eventsResponse : eventsResponse.events || [];
      
      // Find event with matching interview ID in metadata
      const matchingEvent = events.find(event => 
        event.metadata?.interviewId === interviewId ||
        event.metadata?.type === 'interview'
      );
      
      return matchingEvent || null;
    } catch (error) {
      console.error('Failed to find calendar event for interview:', error);
      return null;
    }
  }
  
  /**
   * Map interview status to calendar event status
   */
  static mapInterviewStatusToCalendarStatus(interviewStatus: string): CalendarEvent['status'] {
    const statusMap: Record<string, CalendarEvent['status']> = {
      'Scheduled': 'scheduled',
      'Confirmed': 'confirmed',
      'In Progress': 'confirmed',
      'Completed': 'completed',
      'Cancelled': 'cancelled',
      'No Show': 'no_show',
      'Rescheduled': 'scheduled'
    };
    
    return statusMap[interviewStatus] || 'scheduled';
  }
  
  /**
   * Map interview stage to calendar event priority
   */
  static mapInterviewStageToPriority(interviewStage: string): CalendarEvent['priority'] {
    const stagePriorityMap: Record<string, CalendarEvent['priority']> = {
      'Final Round': 'high',
      'Final': 'high',
      'Third Round': 'high',
      'Second Round': 'medium',
      'First Round': 'medium',
      'Initial Screening': 'medium',
      'Follow Up': 'low'
    };
    
    return stagePriorityMap[interviewStage] || 'medium';
  }
  
  /**
   * Sync all interviews to calendar (bulk operation)
   * Useful for initial setup or data migration
   */
  static async syncAllInterviewsToCalendar(interviews: Interview[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    for (const interview of interviews) {
      try {
        await this.createCalendarEventForInterview(interview);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to sync interview ${interview.id}: ${error}`);
      }
    }
    
    return results;
  }
}

export default InterviewCalendarIntegration;
