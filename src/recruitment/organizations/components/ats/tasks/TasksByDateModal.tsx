import React, { useEffect } from 'react';
import { X, Calendar, CheckSquare, Clock, AlertCircle, User, Edit, Trash2, Check } from 'lucide-react';
import { Task } from '../../../services/taskApiService';

interface TasksByDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: string) => void;
}

export const TasksByDateModal: React.FC<TasksByDateModalProps> = ({
  isOpen,
  onClose,
  date,
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange
}) => {
  // Handle body scroll and ESC key
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add ESC key handler
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        // Restore body scroll when modal closes
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !date) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'Cancelled': return <X className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Tasks for {formatDate(date)}
              </h2>
              <p className="text-sm text-gray-500">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} due on this date
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {tasks.length === 0 ? (
            // No tasks state
            <div className="py-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tasks due on this date
              </h3>
              <p className="text-gray-500">
                This date doesn't have any scheduled tasks.
              </p>
            </div>
          ) : (
            // Tasks list
            <div className="space-y-4">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Due: {new Date(task.dueDate).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                        
                        {task.assignedUser && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Assigned to: {task.assignedUser.firstName} {task.assignedUser.lastName}
                          </div>
                        )}
                        
                        {task.candidateName && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Candidate: {task.candidateName}
                          </div>
                        )}
                        
                        <span className="capitalize">{task.type}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Status Badge */}
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        task.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {task.status}
                      </span>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {/* Quick Complete Button */}
                        {task.status !== 'Completed' && (
                          <button
                            onClick={() => onStatusChange(task.id, 'Completed')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Mark as completed"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Edit Button */}
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit task"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
