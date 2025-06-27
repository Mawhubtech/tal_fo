import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import { useUpdateTask } from '../../../hooks/useTasks';
import { useAssignableUsers } from '../../../hooks/useUsers';
import { useCandidates } from '../../../hooks/useCandidates';
import { Task, UpdateTaskData } from '../services/taskApiService';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onTaskUpdated?: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onTaskUpdated,
}) => {
  const [formData, setFormData] = useState<UpdateTaskData>({
    title: task.title,
    description: task.description || '',
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    priority: task.priority,
    status: task.status,
    type: task.type,
    assignedTo: task.assignedTo || '',
    candidateId: task.candidateId || '',
    candidateName: task.candidateName || '',
  });

  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState('');
  const [candidateSearchTerm, setCandidateSearchTerm] = useState('');

  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  const candidateDropdownRef = useRef<HTMLDivElement>(null);

  const updateTaskMutation = useUpdateTask();
  const { data: assignableUsers, isLoading: isLoadingUsers } = useAssignableUsers();
  const { data: candidates, isLoading: isLoadingCandidates } = useCandidatesByJobId(task.jobId);

  // Set initial assignee name from task data
  useEffect(() => {
    if (task.assignedUser) {
      setAssigneeSearchTerm(`${task.assignedUser.firstName} ${task.assignedUser.lastName}`);
    } else {
      setAssigneeSearchTerm('');
    }
  }, [task.assignedUser]);

  // Set initial candidate name from task data
  useEffect(() => {
    if (task.candidateName) {
      setCandidateSearchTerm(task.candidateName);
    } else {
      setCandidateSearchTerm('');
    }
  }, [task.candidateName]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
        setShowAssigneeDropdown(false);
      }
      if (candidateDropdownRef.current && !candidateDropdownRef.current.contains(event.target as Node)) {
        setShowCandidateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = assignableUsers?.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(assigneeSearchTerm.toLowerCase())
  ) || [];

  const filteredCandidates = candidates?.filter(candidate =>
    candidate.name.toLowerCase().includes(candidateSearchTerm.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: UpdateTaskData = {
      ...formData,
      // Convert empty strings to null for optional fields
      assignedTo: formData.assignedTo === '' ? null : formData.assignedTo,
      candidateId: formData.candidateId === '' ? null : formData.candidateId,
      candidateName: formData.candidateName === '' ? null : formData.candidateName,
      dueDate: formData.dueDate === '' ? null : formData.dueDate,
    };

    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        taskData: updateData,
      });
      onTaskUpdated?.();
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleAssigneeSelect = (user: { id: string; firstName: string; lastName: string } | null) => {
    if (user) {
      setFormData(prev => ({ ...prev, assignedTo: user.id }));
      setAssigneeSearchTerm(`${user.firstName} ${user.lastName}`);
    } else {
      setFormData(prev => ({ ...prev, assignedTo: '' }));
      setAssigneeSearchTerm('');
    }
    setShowAssigneeDropdown(false);
  };

  const handleCandidateSelect = (candidate: { id: string; name: string } | null) => {
    if (candidate) {
      setFormData(prev => ({ 
        ...prev, 
        candidateId: candidate.id,
        candidateName: candidate.name 
      }));
      setCandidateSearchTerm(candidate.name);
    } else {
      setFormData(prev => ({ 
        ...prev, 
        candidateId: '',
        candidateName: '' 
      }));
      setCandidateSearchTerm('');
    }
    setShowCandidateDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter task description"
            />
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="Review">Review</option>
              <option value="Schedule">Schedule</option>
              <option value="Offer">Offer</option>
              <option value="Interview">Interview</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Document">Document</option>
              <option value="Assessment">Assessment</option>
              <option value="Reference Check">Reference Check</option>
            </select>
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to
            </label>
            <div className="relative" ref={assigneeDropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  value={assigneeSearchTerm}
                  onChange={(e) => {
                    setAssigneeSearchTerm(e.target.value);
                    setShowAssigneeDropdown(true);
                  }}
                  onFocus={() => setShowAssigneeDropdown(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                  placeholder="Search for team member or leave empty"
                />
                <User className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                <ChevronDown className="absolute right-8 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {showAssigneeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <div 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    onClick={() => handleAssigneeSelect(null)}
                  >
                    <div className="text-gray-500 italic">No assignee</div>
                  </div>
                  {isLoadingUsers ? (
                    <div className="px-3 py-2 text-gray-500">Loading...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">No team members found</div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleAssigneeSelect(user)}
                      >
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Candidate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Candidate
            </label>
            <div className="relative" ref={candidateDropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  value={candidateSearchTerm}
                  onChange={(e) => {
                    setCandidateSearchTerm(e.target.value);
                    setShowCandidateDropdown(true);
                  }}
                  onFocus={() => setShowCandidateDropdown(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                  placeholder="Search for candidate or leave empty"
                />
                <FileText className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                <ChevronDown className="absolute right-8 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {showCandidateDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <div 
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    onClick={() => handleCandidateSelect(null)}
                  >
                    <div className="text-gray-500 italic">No candidate</div>
                  </div>
                  {isLoadingCandidates ? (
                    <div className="px-3 py-2 text-gray-500">Loading...</div>
                  ) : filteredCandidates.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500">No candidates found</div>
                  ) : (
                    filteredCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleCandidateSelect(candidate)}
                      >
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-gray-500">{candidate.email}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {updateTaskMutation.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">
                {updateTaskMutation.error instanceof Error 
                  ? updateTaskMutation.error.message 
                  : 'Failed to update task'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateTaskMutation.isPending}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateTaskMutation.isPending ? 'Updating...' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
