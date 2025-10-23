import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Target, CheckSquare, Briefcase } from 'lucide-react';
import type { Task } from '../recruitment/organizations/services/taskApiService';
import TaskStatusDropdown from './TaskStatusDropdown';

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onStatusChanged?: () => void;
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({ 
  tasks, 
  onTaskClick, 
  onStatusChanged = () => {} 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get first day of the month and last day
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Get first day of the calendar grid (might be from previous month)
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  // Get last day of the calendar grid (might be from next month)
  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

  // Generate array of dates for the calendar grid
  const calendarDates: Date[] = [];
  const currentCalendarDate = new Date(startDate);
  while (currentCalendarDate <= endDate) {
    calendarDates.push(new Date(currentCalendarDate));
    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
  }

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    if (task.dueDate) {
      const dateKey = new Date(task.dueDate).toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
    }
    return acc;
  }, {} as Record<string, Task[]>);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Helper functions
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Interview': return Target;
      case 'Review': return CheckSquare;
      case 'Schedule': return Calendar;
      case 'Follow-up': return Clock;
      default: return Briefcase;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'border-l-gray-400';
      case 'In Progress': return 'border-l-blue-500';
      case 'Completed': return 'border-l-green-500';
      case 'Cancelled': return 'border-l-red-500';
      default: return 'border-l-gray-400';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'Completed') return false;
    return new Date(dueDate) < new Date();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
            >
              Today
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Dates */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDates.map((date, index) => {
            const dateKey = date.toDateString();
            const dayTasks = tasksByDate[dateKey] || [];
            const isCurrentMonthDate = isCurrentMonth(date);
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border border-gray-100 rounded-lg ${
                  isCurrentMonthDate ? 'bg-white' : 'bg-gray-50'
                } ${isTodayDate ? 'ring-2 ring-purple-500 bg-purple-50' : ''}`}
              >
                {/* Date Number */}
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonthDate ? 'text-gray-900' : 'text-gray-400'
                } ${isTodayDate ? 'text-purple-700' : ''}`}>
                  {date.getDate()}
                </div>

                {/* Tasks for this date */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => {
                    const TypeIcon = getTypeIcon(task.type);
                    const isTaskOverdue = isOverdue(task.dueDate!, task.status);
                    
                    return (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick?.(task)}
                        className={`p-1 rounded text-xs cursor-pointer hover:shadow-sm transition-all border-l-2 ${getStatusColor(task.status)} ${
                          isTaskOverdue ? 'bg-red-50 border-red-200' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-1 mb-1">
                          <TypeIcon className="h-3 w-3 text-gray-600 flex-shrink-0" />
                          <span className={`font-medium truncate ${
                            task.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                            {task.candidateName && (
                              <span className="text-gray-500 truncate max-w-[60px]">
                                {task.candidateName}
                              </span>
                            )}
                          </div>
                          
                          <TaskStatusDropdown 
                            task={task}
                            onStatusChanged={onStatusChanged}
                          />
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Show "more" indicator if there are additional tasks */}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Medium Priority</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Low Priority</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border-l-2 border-blue-500 bg-gray-50"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border-l-2 border-green-500 bg-gray-50"></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCalendar;
