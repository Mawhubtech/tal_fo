import React from 'react';
import type { Interview } from '../../../data/mock';
import { getCalendarDays, getItemsForDate, getStatusColor } from '../shared';
import { CalendarHeader } from '../shared';

interface InterviewsCalendarViewProps {
  interviews: Interview[];
  currentDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onToday: () => void;
}

export const InterviewsCalendarView: React.FC<InterviewsCalendarViewProps> = ({
  interviews,
  currentDate,
  onNavigateMonth,
  onToday
}) => {
  const calendarDays = getCalendarDays(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <CalendarHeader 
        currentDate={currentDate}
        onNavigateMonth={onNavigateMonth}
        onToday={onToday}
      />
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="p-2 h-24"></div>;
          }
          
          const dayInterviews = getItemsForDate(day, interviews);
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              className={`p-2 h-24 border border-gray-100 hover:bg-gray-50 ${
                isToday ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayInterviews.slice(0, 2).map(interview => (
                  <div
                    key={interview.id}
                    className={`text-xs p-1 rounded truncate ${getStatusColor(interview.status)}`}
                    title={`${interview.candidateName} - ${interview.interviewType}`}
                  >
                    {new Date(interview.date).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })} {interview.candidateName}
                  </div>
                ))}
                {dayInterviews.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayInterviews.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
