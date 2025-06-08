import React from 'react';
import { Plus, Filter, Users, Calendar } from 'lucide-react';
import type { Task } from '../../../data/mock';
import { TasksListView } from './TasksListView';
import { TasksCalendarView } from './TasksCalendarView';

interface TasksTabProps {
  tasks: Task[];
  tasksView: 'list' | 'calendar';
  onTasksViewChange: (view: 'list' | 'calendar') => void;
  currentDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onToday: () => void;
  onTaskClick?: (task: Task) => void;
  onNewTask?: () => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  tasksView,
  onTasksViewChange,
  currentDate,
  onNavigateMonth,
  onToday,
  onTaskClick,
  onNewTask
}) => {
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

  return (
    <div className="space-y-6">
      {/* Task Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
        <div className="flex space-x-3">
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            onClick={onNewTask}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onTasksViewChange('list')}
              className={`px-3 py-2 text-sm flex items-center ${
                tasksView === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 mr-1" />
              List
            </button>
            <button
              onClick={() => onTasksViewChange('calendar')}
              className={`px-3 py-2 text-sm flex items-center ${
                tasksView === 'calendar' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Calendar
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {pendingTasks} pending • {inProgressTasks} in progress
        </div>
      </div>

      {/* Tasks Content */}
      {tasksView === 'list' ? (
        <TasksListView
          tasks={tasks}
          onTaskClick={onTaskClick}
        />
      ) : (
        <TasksCalendarView
          tasks={tasks}
          currentDate={currentDate}
          onNavigateMonth={onNavigateMonth}
          onToday={onToday}
        />
      )}
    </div>
  );
};
