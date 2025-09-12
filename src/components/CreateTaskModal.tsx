import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Briefcase, User, Search, Users } from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { useAssignableUsers } from '../hooks/useUsers';
import { useCreateTask } from '../hooks/useTasks';
import MultiUserSelect from './MultiUserSelect';
import type { CreateTaskData } from '../recruitment/organizations/services/taskApiService';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
  jobId?: string;
  onTaskCreated?: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  candidateName = '',
  jobId = '',
  onTaskCreated
}) => {
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    type: 'General',
    category: 'General',
    entityType: 'none',
    entityId: '',
    entityName: '',
    jobId: jobId,
    assignedTo: '',
    candidateId: '',
    candidateName: candidateName,
    tags: [],
    metadata: {}
  });

  const [error, setError] = useState<string | null>(null);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  
  // Multiple assignees state
  const [assignmentMode, setAssignmentMode] = useState<'single' | 'multiple'>('single');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const { data: jobsResponse, isLoading: jobsLoading } = useJobs();
  const { data: users = [], isLoading: usersLoading } = useAssignableUsers();
  const createTaskMutation = useCreateTask();

  // Extract jobs array from response
  const jobs = jobsResponse?.data || [];

  // Filter jobs based on search
  const filteredJobs = useMemo(() => {
    if (!jobSearch.trim()) return jobs.slice(0, 20);
    return jobs.filter(job => 
      job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      job.department?.toLowerCase().includes(jobSearch.toLowerCase())
    ).slice(0, 20);
  }, [jobs, jobSearch]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users.slice(0, 20);
    return users.filter(user => 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
    ).slice(0, 20);
  }, [users, userSearch]);

  const getSelectedJobTitle = () => {
    if (!formData.jobId) return 'Select Job (Optional)';
    const job = jobs.find(j => j.id === formData.jobId);
    return job ? `${job.title} - ${job.department}` : 'Select Job (Optional)';
  };

  const getSelectedUserName = () => {
    if (!formData.assignedTo) return 'Assign to myself';
    const user = users.find(u => u.id === formData.assignedTo);
    return user ? `${user.firstName} ${user.lastName} (${user.email})` : 'Assign to myself';
  };

  const handleInputChange = (field: keyof CreateTaskData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEntityTypeChange = (entityType: string) => {
    setFormData(prev => ({
      ...prev,
      entityType: entityType as any,
      entityId: '',
      entityName: '',
      // Clear entity-specific fields when changing type
      jobId: entityType === 'job' ? prev.jobId : '',
      candidateId: entityType === 'candidate' ? prev.candidateId : '',
      candidateName: entityType === 'candidate' ? prev.candidateName : ''
    }));
  };

  // Task types from API interface
  const taskTypes = [
    'General', 'Reminder', 'Meeting', 'Call', 'Email', 'Document', 'Research',
    'Review', 'Schedule', 'Offer', 'Interview', 'Follow-up', 'Assessment', 'Reference Check',
    'Candidate Search', 'Outreach', 'Profile Review', 'Client Meeting', 'Proposal', 
    'Contract Review', 'Admin', 'Personal', 'Training'
  ];

  // Task categories from API interface
  const taskCategories = [
    'Recruitment', 'Sourcing', 'Client Management', 'Business Development',
    'Personal', 'Admin', 'Team Management', 'Outreach', 'Marketing', 'General'
  ];

  // Priority levels
  const priorities = ['High', 'Medium', 'Low', 'Urgent'];

  // Entity types from API interface
  const entityTypes = [
    'none', 'job', 'candidate', 'client', 'project', 'sourcing_project', 'sequence',
    'team', 'user', 'company', 'organization'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      const taskData: CreateTaskData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        // Set entityId based on entity type
        entityId: formData.entityType === 'job' ? formData.jobId : 
                  formData.entityType === 'candidate' ? formData.candidateId :
                  formData.entityId,
        // Ensure backward compatibility
        jobId: formData.entityType === 'job' ? formData.jobId : undefined,
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

      await createTaskMutation.mutateAsync(taskData);
      onClose();
      
      // Call the callback if provided
      if (onTaskCreated) {
        onTaskCreated();
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        type: 'General',
        category: 'General',
        entityType: 'none',
        entityId: '',
        entityName: '',
        jobId: '',
        assignedTo: '',
        candidateId: '',
        candidateName: '',
        tags: [],
        metadata: {}
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    }
  };

  // Format current date as default
  const getDefaultDateTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Set to 9 AM tomorrow
    
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Handle escape key press
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Add and remove event listener for escape key
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // Handler for overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the click was directly on the overlay, not on its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter task title..."
              required
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter task description..."
            />
          </div>

          {/* Two-column layout for Type and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                {taskTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                {taskCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Two-column layout for Priority and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                min={getDefaultDateTime()}
              />
            </div>
          </div>

          {/* Entity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related To
            </label>
            <select
              value={formData.entityType}
              onChange={(e) => handleEntityTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="none">General Task (No specific entity)</option>
              <option value="job">Job</option>
              <option value="candidate">Candidate</option>
              <option value="client">Client</option>
              <option value="project">Project</option>
              <option value="sourcing_project">Sourcing Project</option>
              <option value="sequence">Sequence</option>
              <option value="team">Team</option>
              <option value="user">User</option>
              <option value="company">Company</option>
              <option value="organization">Organization</option>
            </select>
          </div>

          {/* Entity-specific fields */}
          {formData.entityType === 'job' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Associated Job
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowJobDropdown(!showJobDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-left flex items-center justify-between"
                >
                  <span className={`${!formData.jobId ? 'text-gray-500' : 'text-gray-900'}`}>
                    {getSelectedJobTitle()}
                  </span>
                  <Briefcase className="h-4 w-4 text-gray-400" />
                </button>
                
                {showJobDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    <div className="p-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search jobs..."
                          value={jobSearch}
                          onChange={(e) => setJobSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <div className="max-h-32 overflow-y-auto">
                      {filteredJobs.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          No jobs found
                        </div>
                      ) : (
                        filteredJobs.map((job) => (
                          <button
                            key={job.id}
                            type="button"
                            onClick={() => {
                              handleInputChange('jobId', job.id);
                              handleInputChange('entityId', job.id);
                              handleInputChange('entityName', job.title);
                              setShowJobDropdown(false);
                              setJobSearch('');
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-sm text-gray-900">{job.title}</div>
                            <div className="text-xs text-gray-500">{job.department}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {formData.entityType === 'candidate' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Candidate Name
              </label>
              <input
                type="text"
                value={formData.candidateName}
                onChange={(e) => {
                  handleInputChange('candidateName', e.target.value);
                  handleInputChange('entityName', e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter candidate name"
              />
            </div>
          )}

          {formData.entityType !== 'none' && formData.entityType !== 'job' && formData.entityType !== 'candidate' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.entityType.charAt(0).toUpperCase() + formData.entityType.slice(1).replace('_', ' ')} Name
              </label>
              <input
                type="text"
                value={formData.entityName}
                onChange={(e) => handleInputChange('entityName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder={`Enter ${formData.entityType.replace('_', ' ')} name`}
              />
            </div>
          )}

          {/* Assignment Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignment Mode
            </label>
            <div className="flex gap-4 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To <span className="text-xs text-gray-500">(Leave blank to assign to yourself)</span>
              </label>
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
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    <div className="p-2">
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
                    <div className="max-h-32 overflow-y-auto">
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
                          </div>
                        </div>
                      </button>
                      
                      {filteredUsers.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500 text-center">
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
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-sm text-gray-900">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To Multiple Users
              </label>
              <MultiUserSelect
                users={users}
                selectedUserIds={selectedUserIds}
                onSelectionChange={setSelectedUserIds}
                placeholder="Select users..."
                isLoading={usersLoading}
              />
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 mt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateTaskModal;