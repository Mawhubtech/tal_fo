import React from 'react';
import { Clock, User, AlertCircle } from 'lucide-react';
import type { Task } from '../../../services/taskApiService';
import { getPriorityColor, getStatusColor } from '../shared';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
  
  return (
    <div 
      className="px-6 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-2">
            <h4 className="text-sm font-medium text-gray-900 truncate mr-2">
              {task.title}
            </h4>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {isOverdue && (
              <AlertCircle className="w-4 h-4 text-red-500 ml-2" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{task.description || 'No description'}</p>
          
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            {task.candidateName && (
              <div className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                <span>{task.candidateName}</span>
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                  {new Date(task.dueDate).toLocaleDateString()} at {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end ml-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} mb-2`}>
            {task.status}
          </span>
          <span className="text-xs text-gray-500">
            {task.assignedUser ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}` : 'Unassigned'}
          </span>
        </div>
      </div>
    </div>
  );
};
