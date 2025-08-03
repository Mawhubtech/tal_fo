import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight,
  Target,
  Building,
  BarChart3
} from 'lucide-react';
import { CalendarEvent } from '../../services/calendarApiService';

interface CalendarWidgetProps {
  className?: string;
  events?: CalendarEvent[];
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ className = '', events = [] }) => {
  const [showCalendarView, setShowCalendarView] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

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
  const calendarDays = getDaysInMonth(currentDate);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-full ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {showCalendarView ? 'Calendar' : 'Upcoming Events'}
        </h3>
        <div className="flex items-center space-x-2">
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
        <div className="space-y-2">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-0.5 rounded hover:bg-purple-50 transition-colors"
            >
              <ChevronLeft className="w-3 h-3 text-purple-600" />
            </button>
            <h4 className="text-xs font-medium text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            <button
              onClick={() => navigateMonth('next')}
              className="p-0.5 rounded hover:bg-purple-50 transition-colors"
            >
              <ChevronRight className="w-3 h-3 text-purple-600" />
            </button>
          </div>

          {/* Calendar Grid - Compact */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Day headers */}
            {dayNames.map((day) => (
              <div key={day} className="text-xs font-medium text-gray-400 text-center py-0.5">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  w-6 h-6 flex items-center justify-center text-xs rounded cursor-pointer transition-colors
                  ${day === null ? 'invisible' : ''}
                  ${isToday(day) 
                    ? 'bg-purple-600 text-white font-semibold' 
                    : hasEvent(day)
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : 'hover:bg-purple-50 text-gray-700'
                  }
                `}
              >
                {day && (
                  <div className="relative">
                    <span className="text-xs">{day}</span>
                    {hasEvent(day) && !isToday(day) && (
                      <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-purple-500 rounded-full"></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legend - Compact */}
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <div className="flex items-center space-x-0.5">
              <div className="w-1 h-1 bg-purple-600 rounded-full"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center space-x-0.5">
              <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
              <span>Events</span>
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

      <Link 
        to="/dashboard/calendar" 
        className="mt-3 block text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
      >
        {showCalendarView ? 'View Full Calendar' : 'View Full Events'} →
      </Link>
    </div>
  );
};

export default CalendarWidget;
