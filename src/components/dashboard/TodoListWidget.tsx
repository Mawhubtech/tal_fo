import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckSquare, Clock, AlertCircle, User, Calendar, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApiService } from '../../services/dashboardApiService';
import type { Task } from '../../recruitment/organizations/services/taskApiService';
import TaskStatusDropdown from '../TaskStatusDropdown';
import TaskViewModal from '../TaskViewModal';

interface TodoListWidgetProps {
  className?: string;
  onAddTaskClick?: () => void; // Add callback for "Add Task" button
}

const TodoListWidget: React.FC<TodoListWidgetProps> = ({ className = '', onAddTaskClick }) => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch dashboard tasks
  const { 
    data: tasks = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard', 'tasks'],
    queryFn: () => dashboardApiService.getDashboardTasks(5),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });

  // Sort tasks to show newest first (by creation date or ID)
  const sortedTasks = [...tasks].sort((a, b) => {
    // If tasks have createdAt, use that; otherwise use ID as proxy for creation order
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // Fallback to ID sorting (assuming higher ID = newer)
    return Number(b.id) - Number(a.id);
  });

  const handleTaskStatusChanged = () => {
    refetch();
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setShowViewModal(true);
  };

  const handleTaskUpdated = () => {
    refetch();
    setShowViewModal(false);
    setSelectedTask(null);
  };

  // Helper functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return 'No due date';
    
    const date = new Date(dueDate);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays === -1) return 'Due yesterday';
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 h-full ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">To-Do List</h3>
        <button 
          onClick={onAddTaskClick}
          className="p-1 rounded-lg hover:bg-gray-100 flex-shrink-0"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Failed to load tasks</p>
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <CheckSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No pending tasks</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <div key={task.id} className="flex items-start space-x-3">
              <div 
                className="flex-1 min-w-0 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => handleViewTask(task)}
              >
                <div className="flex items-start justify-between">
                  <p className={`text-sm ${
                    task.status === 'Completed'
                      ? 'text-gray-500 line-through' 
                      : 'text-gray-900'
                  }`}>
                    {task.title}
                  </p>
                  <div onClick={(e) => e.stopPropagation()}>
                    <TaskStatusDropdown 
                      task={task}
                      onStatusChanged={handleTaskStatusChanged}
                    />
                  </div>
                </div>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span className={`text-xs flex items-center ${
                      isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDueDate(task.dueDate)}
                    </span>
                  )}
                  {task.candidateName && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {task.candidateName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Link 
        to="/dashboard/tasks" 
        className="mt-4 block text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
      >
        View All Tasks →
      </Link>

      {/* Task View Modal */}
      {selectedTask && (
        <TaskViewModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onStatusChanged={handleTaskStatusChanged}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
};

export default TodoListWidget;
