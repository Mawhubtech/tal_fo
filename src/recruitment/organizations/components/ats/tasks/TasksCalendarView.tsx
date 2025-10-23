import React from 'react';
import { Calendar, CheckSquare, Clock, AlertCircle, X, Edit, Trash2, User, Check } from 'lucide-react';
import type { Task } from '../../../services/taskApiService';
import { CalendarHeader } from '../shared';

interface TasksCalendarViewProps {
  tasks: Task[];
  currentDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onToday: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: string) => void;
  onDateClick: (date: Date, tasks: Task[]) => void;
}

export const TasksCalendarView: React.FC<TasksCalendarViewProps> = ({
  tasks,
  currentDate,
  onNavigateMonth,
  onToday,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onDateClick
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckSquare className="w-3 h-3 text-green-500" />;
      case 'In Progress': return <Clock className="w-3 h-3 text-blue-500" />;
      case 'Pending': return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      case 'Cancelled': return <X className="w-3 h-3 text-red-500" />;
      default: return <Clock className="w-3 h-3 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'border-l-red-500 bg-red-50';
      case 'Medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'Low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End on Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === dateStr;
    });
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6">
        <CalendarHeader
          currentDate={currentDate}
          onNavigateMonth={onNavigateMonth}
          onToday={onToday}
        />
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 border-b">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isToday = date.toDateString() === today.toDateString();
            const dayTasks = getTasksForDate(date);
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors group ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' : ''}`}
                onClick={() => onDateClick(date, dayTasks)}
              >
                <div className={`text-sm font-medium mb-2 flex items-center justify-between ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'text-blue-600' : ''}`}>
                  <span>{date.getDate()}</span>
                  {dayTasks.length > 0 && (
                    <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to view
                    </span>
                  )}
                </div>
                
                {/* Tasks for this day */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className={`p-1 rounded text-xs border-l-2 ${getPriorityColor(task.priority)} group relative cursor-pointer hover:shadow-sm transition-shadow`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {getStatusIcon(task.status)}
                        <span className="truncate font-medium text-gray-800 flex-1">
                          {task.title}
                        </span>
                      </div>
                      
                      {task.assignedUser && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <User className="w-2 h-2" />
                          <span className="truncate text-[10px]">
                            {task.assignedUser.firstName} {task.assignedUser.lastName}
                          </span>
                        </div>
                      )}
                      
                      {/* Hover actions */}
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded shadow-md p-1 flex gap-1 z-10 border">
                        {task.status !== 'Completed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(task.id, 'Completed');
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Mark as completed"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit task"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete task"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show +N more if there are more tasks */}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-l-2 border-l-red-500 bg-red-50 rounded"></div>
                <span className="text-gray-600">High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-l-2 border-l-yellow-500 bg-yellow-50 rounded"></div>
                <span className="text-gray-600">Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-l-2 border-l-green-500 bg-green-50 rounded"></div>
                <span className="text-gray-600">Low Priority</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3 h-3 text-green-500" />
                <span className="text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-blue-500" />
                <span className="text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-yellow-500" />
                <span className="text-gray-600">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-3 h-3 text-red-500" />
                <span className="text-gray-600">Cancelled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
