import React from 'react';
import { Calendar, Clock, MapPin, Video, Users, Phone } from 'lucide-react';
import type { CalendarEvent } from '../services/calendarApiService';

interface InterviewCalendarEventProps {
  event: CalendarEvent;
  onClick?: () => void;
  isCompact?: boolean;
}

/**
 * Component for displaying interview events in the calendar
 * Shows interview-specific information like candidate, type, and participants
 */
export const InterviewCalendarEvent: React.FC<InterviewCalendarEventProps> = ({
  event,
  onClick,
  isCompact = false
}) => {
  const formatEventTime = (event: CalendarEvent) => {
    if (event.isAllDay) return 'All day';
    
    const startTime = new Date(event.startDate).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const endTime = new Date(event.endDate).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return `${startTime} - ${endTime}`;
  };

  const getInterviewModeIcon = () => {
    const location = event.location?.toLowerCase() || '';
    const meetingLink = event.meetingLink;
    
    if (meetingLink) {
      return <Video className="w-3 h-3 text-blue-500" />;
    } else if (location.includes('phone') || location.includes('call')) {
      return <Phone className="w-3 h-3 text-green-500" />;
    } else if (location) {
      return <MapPin className="w-3 h-3 text-gray-500" />;
    }
    
    return <Calendar className="w-3 h-3 text-purple-500" />;
  };

  const getStatusColor = () => {
    switch (event.status) {
      case 'confirmed':
        return 'border-l-green-500 bg-green-50';
      case 'cancelled':
        return 'border-l-red-500 bg-red-50';
      case 'completed':
        return 'border-l-blue-500 bg-blue-50';
      case 'no_show':
        return 'border-l-orange-500 bg-orange-50';
      default:
        return 'border-l-purple-500 bg-purple-50';
    }
  };

  const getPriorityIndicator = () => {
    switch (event.priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '';
    }
  };

  // Extract candidate and job info from metadata
  const candidateName = event.metadata?.candidateName || 'Unknown Candidate';
  const jobTitle = event.metadata?.jobTitle || '';
  const interviewType = event.title.includes('Interview') 
    ? event.title.split(' Interview')[0].split(' - ')[0] || 'Interview'
    : 'Interview';

  if (isCompact) {
    return (
      <div
        onClick={onClick}
        className={`p-1 rounded text-xs cursor-pointer border-l-4 ${getStatusColor()} hover:shadow-md transition-shadow`}
      >
        <div className="flex items-center gap-1">
          {getInterviewModeIcon()}
          <span className="font-medium truncate">{interviewType}</span>
          {getPriorityIndicator()}
        </div>
        <div className="text-gray-600 truncate">{candidateName}</div>
        <div className="text-gray-500 text-xs">{formatEventTime(event)}</div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border-l-4 ${getStatusColor()} cursor-pointer hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getInterviewModeIcon()}
          <span className="font-semibold text-gray-900">{interviewType}</span>
          {getPriorityIndicator()}
        </div>
        <span className="text-xs text-gray-500 capitalize">{event.status}</span>
      </div>
      
      <div className="space-y-1">
        <div className="font-medium text-gray-800">{candidateName}</div>
        {jobTitle && (
          <div className="text-sm text-gray-600">{jobTitle}</div>
        )}
        
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock className="w-3 h-3" />
          {formatEventTime(event)}
        </div>
        
        {event.location && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        
        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="w-3 h-3" />
            <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
      
      {event.notes && (
        <div className="mt-2 text-xs text-gray-600 line-clamp-2">
          {event.notes}
        </div>
      )}
    </div>
  );
};

export default InterviewCalendarEvent;
