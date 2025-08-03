import React, { useState } from 'react';
import { X, Edit, Calendar, Clock, User, Target, CheckSquare, Briefcase, AlertCircle } from 'lucide-react';
import type { Task } from '../recruitment/organizations/services/taskApiService';
import TaskStatusDropdown from './TaskStatusDropdown';
import EditTaskModal from './EditTaskModal';

interface TaskViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onStatusChanged: () => void;
  onTaskUpdated?: () => void;
}

const TaskViewModal: React.FC<TaskViewModalProps> = ({
  isOpen,
  onClose,
  task,
  onStatusChanged,
  onTaskUpdated = () => {}
}) => {
  const [showEditModal, setShowEditModal] = useState(false);

  if (!isOpen) return null;

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
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
  };

  const isOverdue = (dueDate?: string, status?: string) => {
    if (!dueDate || status === 'Completed') return false;
    return new Date(dueDate) < new Date();
  };

  const TypeIcon = getTypeIcon(task.type);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditComplete = () => {
    setShowEditModal(false);
    onTaskUpdated();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                task.type === 'Interview' ? 'bg-orange-100' :
                task.type === 'Review' ? 'bg-purple-100' :
                task.type === 'Schedule' ? 'bg-blue-100' :
                'bg-gray-100'
              }`}>
                <TypeIcon className={`h-5 w-5 ${
                  task.type === 'Interview' ? 'text-orange-600' :
                  task.type === 'Review' ? 'text-purple-600' :
                  task.type === 'Schedule' ? 'text-blue-600' :
                  'text-gray-600'
                }`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
                <p className="text-sm text-gray-500 capitalize">{task.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit task"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <div className={`text-lg font-medium ${
                task.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.title}
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                  {task.description}
                </div>
              </div>
            )}

            {/* Status and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <TaskStatusDropdown 
                  task={task}
                  onStatusChanged={onStatusChanged}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <div className={`flex items-center space-x-2 ${
                  isOverdue(task.dueDate, task.status) ? 'text-red-600' : 'text-gray-900'
                }`}>
                  <Calendar className="h-4 w-4" />
                  <span>{formatDueDate(task.dueDate)}</span>
                  {isOverdue(task.dueDate, task.status) && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            )}

            {/* Candidate */}
            {task.candidateName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Candidate
                </label>
                <div className="flex items-center space-x-2 text-gray-900">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{task.candidateName}</span>
                </div>
              </div>
            )}

            {/* Assigned User */}
            {task.assignedUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <div className="flex items-center space-x-2 text-gray-900">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{task.assignedUser.firstName} {task.assignedUser.lastName}</span>
                  <span className="text-sm text-gray-500">({task.assignedUser.email})</span>
                </div>
              </div>
            )}

            {/* Created By */}
            {task.createdBy && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created By
                </label>
                <div className="flex items-center space-x-2 text-gray-900">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{task.createdBy.firstName} {task.createdBy.lastName}</span>
                  <span className="text-sm text-gray-500">({task.createdBy.email})</span>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created At
                </label>
                <div className="text-sm text-gray-900">
                  {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>
              {task.completedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completed At
                  </label>
                  <div className="text-sm text-gray-900">
                    {new Date(task.completedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditTaskModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          task={task}
          onTaskUpdated={handleEditComplete}
        />
      )}
    </>
  );
};

export default TaskViewModal;
