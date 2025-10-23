import React, { useState } from 'react';
import { ChevronDown, Check, Clock, AlertCircle, X, Pause } from 'lucide-react';
import { useUpdateTask } from '../hooks/useTasks';
import { Task } from '../recruitment/organizations/services/taskApiService';

interface TaskStatusDropdownProps {
  task: Task;
  onStatusChanged: () => void;
}

const TaskStatusDropdown: React.FC<TaskStatusDropdownProps> = ({ task, onStatusChanged }) => {
  const [isOpen, setIsOpen] = useState(false);
  const updateTaskMutation = useUpdateTask();

  const statusOptions = [
    { 
      value: 'Pending', 
      label: 'Pending', 
      icon: Clock, 
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200'
    },
    { 
      value: 'In Progress', 
      label: 'In Progress', 
      icon: AlertCircle, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    { 
      value: 'Completed', 
      label: 'Completed', 
      icon: Check, 
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    { 
      value: 'On Hold', 
      label: 'On Hold', 
      icon: Pause, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200'
    },
    { 
      value: 'Cancelled', 
      label: 'Cancelled', 
      icon: X, 
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200'
    }
  ];

  const currentStatus = statusOptions.find(option => option.value === task.status);
  const CurrentIcon = currentStatus?.icon || Clock;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        taskData: { status: newStatus as any }
      });
      onStatusChanged();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={updateTaskMutation.isPending}
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-colors ${
          currentStatus?.bgColor || 'bg-gray-100'
        } ${
          currentStatus?.color || 'text-gray-600'
        } ${
          currentStatus?.borderColor || 'border-gray-200'
        } hover:opacity-80 disabled:opacity-50`}
      >
        <CurrentIcon className="h-3 w-3 mr-1" />
        {task.status}
        <ChevronDown className="h-3 w-3 ml-1" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = option.value === task.status;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={updateTaskMutation.isPending || isSelected}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center hover:bg-gray-50 transition-colors disabled:opacity-50 ${
                      isSelected ? 'bg-gray-50 cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <Icon className={`h-3 w-3 mr-2 ${option.color}`} />
                    <span className={isSelected ? 'font-medium' : ''}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <Check className="h-3 w-3 ml-auto text-gray-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskStatusDropdown;
