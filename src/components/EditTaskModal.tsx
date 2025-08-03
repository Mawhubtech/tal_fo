import React, { useState, useMemo } from 'react';
import { X, Briefcase, User, Search, Users } from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { useAssignableUsers } from '../hooks/useUsers';
import { useUpdateTask } from '../hooks/useTasks';
import MultiUserSelect from './MultiUserSelect';
import type { UpdateTaskData, Task } from '../recruitment/organizations/services/taskApiService';

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
  onTaskUpdated
}) => {
  const [formData, setFormData] = useState<UpdateTaskData>({
    title: task.title,
    description: task.description || '',
    dueDate: task.dueDate || '',
    priority: task.priority || 'Medium',
    type: task.type || 'General',
    category: task.category || 'General',
    entityType: task.entityType || 'none',
    entityId: task.entityId || '',
    entityName: task.entityName || '',
    assignedTo: task.assignedTo || '',
    candidateId: task.candidateId || '',
    candidateName: task.candidateName || '',
    tags: task.tags || [],
    metadata: task.metadata || {}
  });

  const [error, setError] = useState<string | null>(null);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  
  // Multiple assignees state
  const [assignmentMode, setAssignmentMode] = useState<'single' | 'multiple'>(
    task.hasMultipleAssignees || (task.assignments && task.assignments.length > 1) ? 'multiple' : 'single'
  );
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    task.assignments && task.assignments.length > 0 
      ? task.assignments.filter(a => a.isActive).map(a => a.userId)
      : task.assignedTo ? [task.assignedTo] : []
  );

  const { data: jobsResponse, isLoading: jobsLoading } = useJobs({ 
    page: 1, 
    limit: 50 
  });
  const { data: users = [], isLoading: usersLoading } = useAssignableUsers();
  const updateTaskMutation = useUpdateTask();

  const jobs = jobsResponse?.data || [];

  const filteredJobs = useMemo(() => {
    return jobs.filter(job =>
      job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.department.toLowerCase().includes(jobSearch.toLowerCase())
    );
  }, [jobs, jobSearch]);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.firstName.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.lastName.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  const getSelectedJobName = () => {
    if (!formData.entityId || formData.entityType !== 'job') return 'Select Job (Optional)';
    const job = jobs.find(j => j.id === formData.entityId);
    return job ? `${job.title} - ${job.department}` : 'Select Job (Optional)';
  };

  const getSelectedUserName = () => {
    if (!formData.assignedTo) return 'Assign to myself';
    const user = users.find(u => u.id === formData.assignedTo);
    return user ? `${user.firstName} ${user.lastName} (${user.email})` : 'Assign to myself';
  };

  const handleInputChange = (field: keyof UpdateTaskData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getDefaultDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Entity types from API interface
  const entityTypes = [
    'none', 'job', 'candidate', 'client', 'project', 'sourcing_project', 'sequence',
    'team', 'user', 'company', 'organization'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title?.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      const taskData: UpdateTaskData = {
        ...formData,
        title: formData.title!.trim(),
        description: formData.description?.trim() || undefined,
        // Set entityId based on entity type
        entityId: formData.entityType === 'job' ? formData.entityId : 
                  formData.entityType === 'candidate' ? formData.candidateId :
                  formData.entityId,
        // Ensure backward compatibility
        candidateId: formData.entityType === 'candidate' ? formData.candidateId : undefined,
        candidateName: formData.entityType === 'candidate' ? formData.candidateName : undefined
      };

      // Handle assignment mode
      if (assignmentMode === 'multiple' && selectedUserIds.length > 0) {
        taskData.assignedToUsers = selectedUserIds;
        taskData.assignedTo = selectedUserIds[0]; // Keep first user as primary for backward compatibility
      } else if (assignmentMode === 'single') {
        taskData.assignedTo = formData.assignedTo;
        taskData.assignedToUsers = formData.assignedTo ? [formData.assignedTo] : [];
      }

      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        taskData
      });
      onClose();
      
      // Call the callback if provided
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
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
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter task description (optional)"
            />
          </div>

          {/* Priority and Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority || 'Medium'}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type || 'General'}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="General">General</option>
                <option value="Reminder">Reminder</option>
                <option value="Meeting">Meeting</option>
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Research">Research</option>
                <option value="Review">Review</option>
                <option value="Schedule">Schedule</option>
                <option value="Offer">Offer</option>
                <option value="Interview">Interview</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Assessment">Assessment</option>
                <option value="Reference Check">Reference Check</option>
                <option value="Candidate Search">Candidate Search</option>
                <option value="Outreach">Outreach</option>
                <option value="Profile Review">Profile Review</option>
                <option value="Client Meeting">Client Meeting</option>
                <option value="Proposal">Proposal</option>
                <option value="Contract Review">Contract Review</option>
                <option value="Admin">Admin</option>
                <option value="Personal">Personal</option>
                <option value="Training">Training</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="datetime-local"
              value={formData.dueDate || ''}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              min={getDefaultDateTime()}
            />
          </div>

          {/* Assignment Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Mode
            </label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="single"
                  checked={assignmentMode === 'single'}
                  onChange={(e) => setAssignmentMode(e.target.value as 'single')}
                  className="mr-2"
                />
                <User className="w-4 h-4 mr-1" />
                Single Assignee
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="multiple"
                  checked={assignmentMode === 'multiple'}
                  onChange={(e) => setAssignmentMode(e.target.value as 'multiple')}
                  className="mr-2"
                />
                <Users className="w-4 h-4 mr-1" />
                Multiple Assignees
              </label>
            </div>
          </div>

          {/* Assignment Selection */}
          {assignmentMode === 'single' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Leave blank to assign to yourself
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-left flex items-center justify-between"
                >
                  <span className={`${!formData.assignedTo ? 'text-gray-500' : 'text-gray-900'}`}>
                    {getSelectedUserName()}
                  </span>
                  <User className="h-4 w-4 text-gray-400" />
                </button>
                
                {showUserDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {/* Option to assign to self */}
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange('assignedTo', '');
                          setShowUserDropdown(false);
                          setUserSearch('');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100"
                      >
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-purple-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-purple-600">Assign to myself</div>
                            <div className="text-xs text-gray-500">Task will be auto-assigned to you</div>
                          </div>
                        </div>
                      </button>
                      
                      {filteredUsers.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500 text-center">
                          No users found
                        </div>
                      ) : (
                        filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              handleInputChange('assignedTo', user.id);
                              setShowUserDropdown(false);
                              setUserSearch('');
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50"
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To Multiple Users
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Select multiple users to assign this task to
              </p>
              <MultiUserSelect
                users={users}
                selectedUserIds={selectedUserIds}
                onSelectionChange={setSelectedUserIds}
                placeholder="Select users..."
                isLoading={usersLoading}
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateTaskMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
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
