import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Copy, Archive, Flag } from 'lucide-react';
import { useDeleteTask } from '../hooks/useTasks';
import type { Task } from '../recruitment/organizations/services/taskApiService';

interface TaskActionsDropdownProps {
  task: Task;
  onEdit: (task: Task) => void;
  onTaskDeleted: () => void;
}

const TaskActionsDropdown: React.FC<TaskActionsDropdownProps> = ({ 
  task, 
  onEdit, 
  onTaskDeleted 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteTaskMutation = useDeleteTask();

  const handleEdit = () => {
    onEdit(task);
    setIsOpen(false);
  };

  const handleDelete = async () => {
    try {
      await deleteTaskMutation.mutateAsync(task.id);
      onTaskDeleted();
      setShowDeleteConfirm(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleDuplicate = () => {
    // TODO: Implement task duplication
    console.log('Duplicate task:', task.id);
    setIsOpen(false);
  };

  const handleArchive = () => {
    // TODO: Implement task archiving
    console.log('Archive task:', task.id);
    setIsOpen(false);
  };

  const handleMarkPriority = () => {
    // TODO: Implement priority marking
    console.log('Mark as high priority:', task.id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-200 rounded transition-colors"
      >
        <MoreVertical className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left text-sm flex items-center hover:bg-gray-50 transition-colors"
              >
                <Edit className="h-4 w-4 mr-3 text-gray-400" />
                Edit Task
              </button>
              
              <button
                onClick={handleDuplicate}
                className="w-full px-4 py-2 text-left text-sm flex items-center hover:bg-gray-50 transition-colors"
              >
                <Copy className="h-4 w-4 mr-3 text-gray-400" />
                Duplicate Task
              </button>
              
              <button
                onClick={handleMarkPriority}
                className="w-full px-4 py-2 text-left text-sm flex items-center hover:bg-gray-50 transition-colors"
              >
                <Flag className="h-4 w-4 mr-3 text-gray-400" />
                Mark as Priority
              </button>
              
              <button
                onClick={handleArchive}
                className="w-full px-4 py-2 text-left text-sm flex items-center hover:bg-gray-50 transition-colors"
              >
                <Archive className="h-4 w-4 mr-3 text-gray-400" />
                Archive Task
              </button>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteTaskMutation.isPending}
                className="w-full px-4 py-2 text-left text-sm flex items-center hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-3" />
                Delete Task
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Task
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete "{task.title}"? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteTaskMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskActionsDropdown;
