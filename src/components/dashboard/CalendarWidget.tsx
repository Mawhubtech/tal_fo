import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight,
  Target,
  Building,
  BarChart3,
  Clock,
  MapPin,
  Video,
  Plus
} from 'lucide-react';
import { CalendarEvent } from '../../services/calendarApiService';

interface CalendarWidgetProps {
  className?: string;
  events?: CalendarEvent[];
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ className = '', events = [] }) => {
  const [showCalendarView, setShowCalendarView] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDateEventsModal, setShowDateEventsModal] = useState(false);

  // Use provided events (no fallback to mock data)
  const upcomingEvents: CalendarEvent[] = events;

  // Helper function to format event date for display
  const formatEventDate = (event: CalendarEvent): string => {
    const eventDate = new Date(event.startDate);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (eventDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) {
        return eventDate.toLocaleDateString([], { weekday: 'long' });
      } else {
        return eventDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    }
  };

  // Helper function to format event time for display
  const formatEventTime = (event: CalendarEvent): string => {
    if (event.isAllDay) return 'All day';
    
    const startDate = new Date(event.startDate);
    return startDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Handle date click to show events modal
  const handleDateClick = (day: number | null) => {
    if (!day) return;
    
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setShowDateEventsModal(true);
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return upcomingEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Format event time for modal display
  const formatEventTimeForModal = (event: CalendarEvent) => {
    if (event.isAllDay) return 'All day';
    
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    const startTime = startDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const endTime = endDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return `${startTime} - ${endTime}`;
  };

  // Get event type color
  const getEventTypeColor = (type: string) => {
    const colors = {
      interview: 'bg-purple-500',
      meeting: 'bg-purple-600',
      call: 'bg-purple-400',
      review: 'bg-purple-700',
      deadline: 'bg-red-500',
      follow_up: 'bg-purple-300',
      other: 'bg-gray-500'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const hasEvent = (day: number | null) => {
    if (!day) return false;
    
    // Check if any events exist on this day
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return upcomingEvents.some(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === targetDate.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Shorter day names for compact view
  const dayNamesWithIndex = dayNames.map((day, index) => ({ day, index })); // Make keys unique
  const calendarDays = getDaysInMonth(currentDate);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-full ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {showCalendarView ? 'Calendar' : 'Upcoming Events'}
        </h3>
        <div className="flex items-center space-x-2">
          <Link 
            to="/dashboard/calendar" 
            className="px-2 py-1 text-xs text-purple-600 hover:text-purple-800 font-medium border border-purple-200 rounded-md hover:bg-purple-50 transition-colors"
          >
            View Full
          </Link>
          <button
            onClick={() => setShowCalendarView(!showCalendarView)}
            className="p-1 rounded-lg hover:bg-purple-50 transition-colors"
            title={showCalendarView ? 'Show Upcoming Events' : 'Show Calendar'}
          >
            {showCalendarView ? (
              <CalendarDays className="w-4 h-4 text-purple-600" />
            ) : (
              <Calendar className="w-4 h-4 text-purple-600" />
            )}
          </button>
        </div>
      </div>

      {showCalendarView ? (
        <div className="flex-1 flex flex-col">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 rounded hover:bg-purple-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-purple-600" />
            </button>
            <h4 className="text-sm font-medium text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 rounded hover:bg-purple-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-purple-600" />
            </button>
          </div>

          {/* Calendar Grid - Full Size */}
          <div className="flex-1">
            <div className="grid grid-cols-7 gap-1 h-full">
              {/* Day headers */}
              {dayNamesWithIndex.map(({ day, index }) => (
                <div key={`day-header-${index}`} className="text-xs font-medium text-gray-400 text-center py-2 border-b border-gray-100">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day, index) => (
                <div
                  key={`calendar-day-${index}`}
                  onClick={() => handleDateClick(day)}
                  className={`
                    min-h-[32px] flex items-center justify-center text-sm rounded cursor-pointer transition-colors relative
                    ${day === null ? 'invisible pointer-events-none' : ''}
                    ${isToday(day) 
                      ? 'bg-purple-600 text-white font-semibold' 
                      : hasEvent(day)
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      : 'hover:bg-purple-50 text-gray-700'
                    }
                  `}
                >
                  {day && (
                    <>
                      <span className="text-sm">{day}</span>
                      {hasEvent(day) && !isToday(day) && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full"></div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {upcomingEvents.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-purple-50">
              <div className={`p-1 rounded flex-shrink-0 ${
                event.type === 'interview' ? 'bg-purple-100' :
                event.type === 'meeting' ? 'bg-purple-100' :
                'bg-purple-100'
              }`}>
                {event.type === 'interview' && <Target className="w-3 h-3 text-purple-600" />}
                {event.type === 'meeting' && <Building className="w-3 h-3 text-purple-600" />}
                {event.type === 'review' && <BarChart3 className="w-3 h-3 text-purple-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{event.title}</p>
                <p className="text-xs text-gray-500">{formatEventDate(event)} at {formatEventTime(event)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Date Events Modal */}
      {showDateEventsModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Events for {selectedDate.toLocaleDateString([], { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric' 
                  })}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {getEventsForDate(selectedDate).length} event(s)
                </p>
              </div>
              <button
                onClick={() => setShowDateEventsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {getEventsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No events scheduled for this date</p>
                </div>
              ) : (
                getEventsForDate(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getEventTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatEventTimeForModal(event)}
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[100px]">{event.location}</span>
                            </div>
                          )}
                          
                          {event.meetingLink && (
                            <div className="flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              <span>Online</span>
                            </div>
                          )}
                        </div>

                        {/* Event actions */}
                        <div className="flex gap-2">
                          <Link
                            to="/dashboard/calendar"
                            className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'completed' ? 'bg-green-100 text-green-800' :
                          event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          event.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'no_show' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDateEventsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              >
                Close
              </button>
              <Link
                to="/dashboard/calendar"
                onClick={() => setShowDateEventsModal(false)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                View Full Calendar
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;
