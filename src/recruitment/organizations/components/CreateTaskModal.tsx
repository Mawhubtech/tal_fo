import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Flag, Folder, Search } from 'lucide-react';
import { useCreateTask, useUpdateTask } from '../../../hooks/useTasks';
import { useAssignableUsers } from '../../../hooks/useUsers';
import { CreateTaskData, UpdateTaskData, Task } from '../services/taskApiService';
import { jobApplicationApiService } from '../../jobs/services/jobApplicationApiService';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  onTaskCreated: () => void;
  prefilledCandidateId?: string;
  prefilledCandidateName?: string;
  editTask?: Task; // Add this for edit mode
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  jobId,
  onTaskCreated,
  prefilledCandidateId,
  prefilledCandidateName,
  editTask
}) => {
  const isEditMode = !!editTask;
  
  const [formData, setFormData] = useState<CreateTaskData & { status?: string }>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    type: 'Review',
    jobId,
    assignedTo: '',
    candidateId: prefilledCandidateId || '',
    candidateName: prefilledCandidateName || '',
    status: 'Pending',
    metadata: {}
  });
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Array<{ id: string; name: string }>>([]);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Use React Query hooks
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const { data: assignableUsers = [], isLoading: usersLoading } = useAssignableUsers();

  // Filter candidates based on search
  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  // Filter users based on search
  const filteredUsers = assignableUsers.filter(user =>
    `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Get selected candidate name
  const selectedCandidateName = candidates.find(c => c.id === formData.candidateId)?.name || '';
  
  // Get selected user name
  const getSelectedUserName = () => {
    if (!formData.assignedTo) return 'Select assignee (optional)';
    const user = assignableUsers.find(u => u.id === formData.assignedTo);
    return user ? `${user.firstName} ${user.lastName} (${user.email})` : 'Select assignee (optional)';
  };

  // Helper function to format date for datetime-local input
  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // Format as YYYY-MM-DDTHH:mm for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCandidates();
      
      if (isEditMode && editTask) {
        // Populate form with edit task data
        setFormData({
          title: editTask.title,
          description: editTask.description || '',
          dueDate: formatDateForInput(editTask.dueDate),
          priority: editTask.priority,
          type: editTask.type,
          jobId: editTask.jobId,
          assignedTo: editTask.assignedTo || '',
          candidateId: editTask.candidateId || '',
          candidateName: editTask.candidateName || '',
          status: editTask.status,
          metadata: editTask.metadata || {}
        });
      } else {
        // Reset form when modal opens for create mode
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          priority: 'Medium',
          type: 'Review',
          jobId,
          assignedTo: '',
          candidateId: prefilledCandidateId || '',
          candidateName: prefilledCandidateName || '',
          status: 'Pending',
          metadata: {}
        });
      }
      
      setError(null);
      setCandidateSearch('');
      setUserSearch('');
      setShowCandidateDropdown(false);
      setShowUserDropdown(false);
    }
  }, [isOpen, jobId, prefilledCandidateId, prefilledCandidateName, isEditMode, editTask]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowCandidateDropdown(false);
        setShowUserDropdown(false);
      }
    };

    if (showCandidateDropdown || showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCandidateDropdown, showUserDropdown]);

  const loadCandidates = async () => {
    try {
      const { applications } = await jobApplicationApiService.getJobApplicationsByJobId(jobId);
      const candidateList = applications.map(app => ({
        id: app.candidate?.id || app.candidateId,
        name: app.candidate?.fullName || 'Unknown Candidate'
      }));
      setCandidates(candidateList);
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setError(null);

    try {
      if (isEditMode && editTask) {
        // Handle edit mode
        const updateData: UpdateTaskData = {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate || undefined,
          priority: formData.priority,
          type: formData.type,
          status: formData.status as any,
          assignedTo: formData.assignedTo || null,
          candidateId: formData.candidateId || null,
          candidateName: formData.candidateName || null,
          metadata: formData.metadata
        };
        
        await updateTaskMutation.mutateAsync({ taskId: editTask.id, taskData: updateData });
      } else {
        // Handle create mode
        const submitData = { ...formData };
        
        // Convert empty string to null for optional fields
        if (formData.assignedTo === '') {
          submitData.assignedTo = null;
        }

        // Handle candidateId - convert empty strings to null
        if (submitData.candidateId === '') {
          submitData.candidateId = null;
        }

        // Handle candidateName - convert empty strings to null
        if (submitData.candidateName === '') {
          submitData.candidateName = null;
        }

        await createTaskMutation.mutateAsync(submitData);
      }
      
      onTaskCreated();
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} task. Please try again.`);
    }
  };

  const handleCandidateChange = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    setFormData(prev => ({
      ...prev,
      candidateId,
      candidateName: candidate?.name || ''
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter task description"
            />
          </div>

          {/* Row 1: Type and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Folder className="w-4 h-4 inline mr-1" />
                Task Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Review">Review</option>
                <option value="Schedule">Schedule</option>
                <option value="Interview">Interview</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Offer">Offer</option>
                <option value="Document">Document</option>
                <option value="Assessment">Assessment</option>
                <option value="Reference Check">Reference Check</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Flag className="w-4 h-4 inline mr-1" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Status field - only show in edit mode */}
          {isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Flag className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {/* Row 2: Due Date and Candidate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Due Date
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Related Candidate
              </label>
              <div className="relative">
                <div
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer bg-white flex items-center justify-between"
                  onClick={() => setShowCandidateDropdown(!showCandidateDropdown)}
                >
                  <span className={selectedCandidateName ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedCandidateName || 'No specific candidate'}
                  </span>
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                
                {showCandidateDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search candidates..."
                        value={candidateSearch}
                        onChange={(e) => setCandidateSearch(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      <div
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          handleCandidateChange('');
                          setShowCandidateDropdown(false);
                          setCandidateSearch('');
                        }}
                      >
                        No specific candidate
                      </div>
                      {filteredCandidates.map(candidate => (
                        <div
                          key={candidate.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => {
                            handleCandidateChange(candidate.id);
                            setShowCandidateDropdown(false);
                            setCandidateSearch('');
                          }}
                        >
                          {candidate.name}
                        </div>
                      ))}
                      {filteredCandidates.length === 0 && candidateSearch && (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          No candidates found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 3: Assigned To */}
          <div className="relative dropdown-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Assigned To
            </label>
            <div className="relative">
              <div
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer bg-white flex items-center justify-between"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                <span className={formData.assignedTo ? 'text-gray-900' : 'text-gray-500'}>
                  {getSelectedUserName()}
                </span>
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              
              {showUserDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    <div
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, assignedTo: '' }));
                        setShowUserDropdown(false);
                        setUserSearch('');
                      }}
                    >
                      Select assignee (optional)
                    </div>
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, assignedTo: user.id }));
                          setShowUserDropdown(false);
                          setUserSearch('');
                        }}
                      >
                        {user.firstName} {user.lastName} ({user.email})
                      </div>
                    ))}
                    {filteredUsers.length === 0 && userSearch && (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No users found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {usersLoading && (
              <p className="text-sm text-gray-500 mt-1">Loading users...</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {(createTaskMutation.isPending || updateTaskMutation.isPending) ? 
                (isEditMode ? 'Updating...' : 'Creating...') : 
                (isEditMode ? 'Update Task' : 'Create Task')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
