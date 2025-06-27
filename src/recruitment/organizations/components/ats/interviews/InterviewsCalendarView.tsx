import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Interview } from '../../../../../types/interview.types';
import { DayInterviewsModal } from './DayInterviewsModal';

interface InterviewsCalendarViewProps {
  interviews: Interview[];
  currentDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onToday: () => void;
  onInterviewClick?: (interview: Interview) => void;
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    case 'Rescheduled':
      return 'bg-orange-100 text-orange-800';
    case 'No Show':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getCalendarDays = (currentDate: Date) => {
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startCalendar = new Date(firstDay);
  startCalendar.setDate(startCalendar.getDate() - firstDay.getDay());
  
  const days = [];
  const endCalendar = new Date(lastDay);
  endCalendar.setDate(endCalendar.getDate() + (6 - lastDay.getDay()));
  
  for (let day = new Date(startCalendar); day <= endCalendar; day.setDate(day.getDate() + 1)) {
    if (day.getMonth() === currentDate.getMonth()) {
      days.push(new Date(day));
    } else {
      days.push(null);
    }
  }
  
  return days;
};

const getInterviewsForDate = (date: Date, interviews: Interview[]) => {
  return interviews.filter(interview => {
    const interviewDate = new Date(interview.scheduledAt);
    return interviewDate.toDateString() === date.toDateString();
  });
};

export const InterviewsCalendarView: React.FC<InterviewsCalendarViewProps> = ({
  interviews,
  currentDate,
  onNavigateMonth,
  onToday,
  onInterviewClick,
  isLoading = false
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  
  const calendarDays = getCalendarDays(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate monthly stats
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const monthlyInterviews = interviews.filter(interview => {
    const interviewDate = new Date(interview.scheduledAt);
    return interviewDate >= monthStart && interviewDate <= monthEnd;
  });

  const scheduledCount = monthlyInterviews.filter(i => i.status === 'Scheduled').length;
  const completedCount = monthlyInterviews.filter(i => i.status === 'Completed').length;

  const handleDayClick = (day: Date, dayInterviews: Interview[]) => {
    if (dayInterviews.length === 1) {
      // If only one interview, open it directly
      onInterviewClick?.(dayInterviews[0]);
    } else if (dayInterviews.length > 1) {
      // If multiple interviews, show day modal
      setSelectedDate(day);
      setDayModalOpen(true);
    }
  };

  const handleInterviewClickFromModal = (interview: Interview) => {
    setDayModalOpen(false);
    setSelectedDate(null);
    onInterviewClick?.(interview);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
            <span>{monthlyInterviews.length} interviews this month</span>
            <span>•</span>
            <span>{scheduledCount} scheduled</span>
            <span>•</span>
            <span>{completedCount} completed</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onNavigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Today
          </button>
          <button
            onClick={() => onNavigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Calendar Grid */}
      {!isLoading && (
        <>
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={index} className="p-2 h-32"></div>;
              }
              
              const dayInterviews = getInterviewsForDate(day, interviews);
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`p-2 h-32 border border-gray-100 hover:bg-gray-50 overflow-hidden cursor-pointer ${
                    isToday ? 'bg-blue-50 border-blue-200' : ''
                  } ${dayInterviews.length > 0 ? 'hover:border-purple-300' : ''}`}
                  onClick={() => handleDayClick(day, dayInterviews)}
                >
                  <div className={`text-sm font-medium mb-1 flex items-center justify-between ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    <span>{day.getDate()}</span>
                    {dayInterviews.length > 0 && (
                      <span className="bg-purple-100 text-purple-800 text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {dayInterviews.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayInterviews.slice(0, 3).map(interview => {
                      const candidateName = interview.jobApplication?.candidate?.fullName || 'Unknown';
                      const jobTitle = interview.jobApplication?.job?.title || '';
                      const time = new Date(interview.scheduledAt).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      });
                      
                      return (
                        <div
                          key={interview.id}
                          className={`text-xs p-1 rounded hover:opacity-80 transition-opacity ${getStatusColor(interview.status)}`}
                          title={`${time} - ${candidateName}\n${interview.type} Interview\n${jobTitle}\nStatus: ${interview.status}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onInterviewClick?.(interview);
                          }}
                        >
                          <div className="truncate font-medium">
                            {time}
                          </div>
                          <div className="truncate">
                            {candidateName}
                          </div>
                          <div className="truncate text-xs opacity-75">
                            {interview.type}
                          </div>
                        </div>
                      );
                    })}
                    {dayInterviews.length > 3 && (
                      <div 
                        className="text-xs text-gray-500 p-1 hover:text-gray-700 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDayClick(day, dayInterviews);
                        }}
                      >
                        +{dayInterviews.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Day Interviews Modal */}
      <DayInterviewsModal
        isOpen={dayModalOpen}
        onClose={() => {
          setDayModalOpen(false);
          setSelectedDate(null);
        }}
        date={selectedDate}
        interviews={selectedDate ? getInterviewsForDate(selectedDate, interviews) : []}
        onInterviewClick={handleInterviewClickFromModal}
      />
    </div>
  );
};
