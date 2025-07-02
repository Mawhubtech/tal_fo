import React, { useState, useEffect } from 'react';
import { Plus, Calendar, CheckSquare, Clock, AlertCircle, User, Filter, Edit, Trash2, MoreVertical, Check, X, CalendarDays } from 'lucide-react';
import { useTasksByJobId, useDeleteTask, useUpdateTask } from '../../../../../hooks/useTasks';
import { useStageMovement } from '../../../../../hooks/useStageMovement';
import { useJobApplicationsByJob } from '../../../../../hooks/useJobApplications';
import { usePipeline } from '../../../../../hooks/usePipelines';
import { StageChangeReason } from '../../../../../types/stageMovement.types';
import CreateTaskModal from '../../CreateTaskModal';
import { Task } from '../../../services/taskApiService';
import { TasksCalendarView } from './TasksCalendarView';
import { TasksByDateModal } from './TasksByDateModal';
import { toast } from '../../../../../components/ToastContainer';

interface TasksTabProps {
  jobId: string;
  tasksView: 'list' | 'calendar';
  onTasksViewChange: (view: 'list' | 'calendar') => void;
  currentDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onToday: () => void;
  pipelineId?: string; // Add pipeline ID for stage movement
}

export const TasksTab: React.FC<TasksTabProps> = ({ 
  jobId, 
  tasksView, 
  onTasksViewChange,
  currentDate,
  onNavigateMonth,
  onToday,
  pipelineId
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'inprogress' | 'completed' | 'cancelled'>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'thisweek' | 'thismonth' | 'thisyear' | 'custom'>('all');
  const [customDateFrom, setCustomDateFrom] = useState<string>('');
  const [customDateTo, setCustomDateTo] = useState<string>('');
  const [showTaskActions, setShowTaskActions] = useState<string | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);
  
  const { data: tasks, isLoading, error, refetch } = useTasksByJobId(jobId);
  const deleteTaskMutation = useDeleteTask();
  const updateTaskMutation = useUpdateTask();
  
  // Stage movement integration
  const stageMovement = useStageMovement();
  const { data: jobApplicationsData } = useJobApplicationsByJob(jobId);
  const { data: pipeline } = usePipeline(pipelineId || '');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-menu')) {
        setShowTaskActions(null);
      }
    };

    if (showTaskActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTaskActions]);

  // Check if error is a 404 (no tasks found) - treat as empty array instead of error
  const is404Error = error && (
    (error as any)?.response?.status === 404 || 
    (error as any)?.status === 404 ||
    (error instanceof Error && error.message.includes('404'))
  );

  // If 404, treat as empty tasks array
  const actualTasks = is404Error ? [] : (tasks || []);
  const actualError = is404Error ? null : error;

  const handleTaskCreated = () => {
    refetch();
    // If date modal is open, refresh the tasks for that date
    if (showDateModal && selectedDate) {
      // We'll need to wait for the refetch to complete and then update
      // For now, we'll close the modal and let the user reopen it to see updates
      handleCloseDateModal();
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowCreateModal(true);
    // Close date modal if it's open
    if (showDateModal) {
      setShowDateModal(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        refetch();
        // Close date modal if it's open
        if (showDateModal) {
          setShowDateModal(false);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        taskData: { status: newStatus as any }
      });
      
      // Check if task was completed and handle potential stage advancement
      if (newStatus === 'Completed') {
        await handleTaskCompletion(taskId);
      }
      
      refetch();
      // Update the selected date tasks if the modal is open
      if (showDateModal && selectedDate) {
        const updatedTasks = selectedDateTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus as any } : task
        );
        setSelectedDateTasks(updatedTasks);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Update Failed', 'Failed to update task status. Please try again.');
    }
  };

  const handleTaskCompletion = async (taskId: string) => {
    const task = actualTasks?.find(t => t.id === taskId);
    
    if (!task || !task.candidateId || !pipeline) {
      return; // No candidate associated or no pipeline
    }

    // Find the job application for this candidate
    const jobApplications = jobApplicationsData?.applications || [];
    const application = jobApplications.find(app => 
      app.candidateId === task.candidateId || 
      app.candidate?.id === task.candidateId
    );

    if (!application) {
      console.log('No job application found for candidate:', task.candidateId);
      return;
    }

    // Check if this task completion should trigger stage advancement
    const shouldAdvance = await checkIfShouldAdvanceStage(task, application);
    
    if (shouldAdvance) {
      try {
        // Find the next stage in the pipeline
        // Map the application stage to pipeline stage
        const currentPipelineStage = pipeline.stages?.find(s => 
          s.name.toLowerCase().includes(application.stage.toLowerCase()) ||
          application.stage.toLowerCase().includes(s.name.toLowerCase())
        );
        
        const sortedStages = pipeline.stages?.sort((a, b) => a.order - b.order) || [];
        const currentIndex = sortedStages.findIndex(s => s.id === currentPipelineStage?.id);
        
        if (currentIndex !== -1 && currentIndex < sortedStages.length - 1) {
          const nextStage = sortedStages[currentIndex + 1];
          
          await stageMovement.moveWithDefaults(
            application.id,
            nextStage.id,
            {
              reason: StageChangeReason.TASK_COMPLETED,
              notes: `Automatically moved to ${nextStage.name} after completing task: ${task.title}`,
              metadata: {
                moveType: 'automated',
                trigger: 'task_completion',
                taskId: task.id,
                taskTitle: task.title,
                taskType: task.type,
                fromStage: currentPipelineStage?.name,
                toStage: nextStage.name,
              }
            }
          );

          toast.success(
            'Stage Advanced', 
            `Candidate automatically moved to ${nextStage.name} after task completion`
          );
        }
      } catch (error) {
        console.error('Error advancing stage after task completion:', error);
        // Don't show error toast for stage advancement failures
        // as the task was still completed successfully
      }
    }
  };

  const checkIfShouldAdvanceStage = async (task: Task, application: any): Promise<boolean> => {
    // Define logic for when task completion should trigger stage advancement
    
    // For example, advance stage if:
    // 1. Task is marked as "stage-critical" or has a specific type
    // 2. All required tasks for current stage are completed
    // 3. Task is explicitly configured to advance stage
    
    // For now, let's advance for these task types:
    const advancingTaskTypes = [
      'screening_review',
      'technical_assessment',
      'background_check',
      'reference_check',
      'interview_preparation'
    ];

    return advancingTaskTypes.includes(task.type?.toLowerCase() || '');
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingTask(null);
  };

  const handleDateClick = (date: Date, tasks: Task[]) => {
    setSelectedDate(date);
    setSelectedDateTasks(tasks);
    setShowDateModal(true);
  };

  const handleCloseDateModal = () => {
    setShowDateModal(false);
    setSelectedDate(null);
    setSelectedDateTasks([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'Cancelled': return <X className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredTasks = actualTasks?.filter(task => {
    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'pending' && task.status !== 'Pending') return false;
      if (filterStatus === 'inprogress' && task.status !== 'In Progress') return false;
      if (filterStatus === 'completed' && task.status !== 'Completed') return false;
      if (filterStatus === 'cancelled' && task.status !== 'Cancelled') return false;
    }

    // Date filter
    if (filterDate !== 'all' && task.dueDate) {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      
      switch (filterDate) {
        case 'today':
          if (taskDate.toDateString() !== today.toDateString()) return false;
          break;
        case 'thisweek':
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
          endOfWeek.setHours(23, 59, 59, 999);
          if (taskDate < startOfWeek || taskDate > endOfWeek) return false;
          break;
        case 'thismonth':
          if (taskDate.getMonth() !== today.getMonth() || taskDate.getFullYear() !== today.getFullYear()) return false;
          break;
        case 'thisyear':
          if (taskDate.getFullYear() !== today.getFullYear()) return false;
          break;
        case 'custom':
          if (customDateFrom || customDateTo) {
            const fromDate = customDateFrom ? new Date(customDateFrom) : null;
            const toDate = customDateTo ? new Date(customDateTo) : null;
            
            if (fromDate) {
              fromDate.setHours(0, 0, 0, 0);
              if (taskDate < fromDate) return false;
            }
            
            if (toDate) {
              toDate.setHours(23, 59, 59, 999);
              if (taskDate > toDate) return false;
            }
          }
          break;
      }
    }

    return true;
  }) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (actualError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading tasks</h3>
              <p className="text-sm text-red-600 mt-1">
                {actualError instanceof Error ? actualError.message : 'An unexpected error occurred'}
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="text-gray-600">
            {filteredTasks.length !== actualTasks.length ? (
              <>
                Showing {filteredTasks.length} of {actualTasks?.length || 0} task{actualTasks?.length !== 1 ? 's' : ''} for this job
              </>
            ) : (
              <>
                {actualTasks?.length || 0} task{actualTasks?.length !== 1 ? 's' : ''} for this job
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => onTasksViewChange('list')}
              className={`px-3 py-2 text-sm font-medium ${
                tasksView === 'list'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              List
            </button>
            <button
              onClick={() => onTasksViewChange('calendar')}
              className={`px-3 py-2 text-sm font-medium ${
                tasksView === 'calendar'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Calendar
            </button>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Status Filters */}
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'inprogress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filterStatus === filter.key
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-4">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Due Date:</span>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Time' },
              { key: 'today', label: 'Today' },
              { key: 'thisweek', label: 'This Week' },
              { key: 'thismonth', label: 'This Month' },
              { key: 'thisyear', label: 'This Year' },
              { key: 'custom', label: 'Custom Range' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setFilterDate(filter.key as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                  filterDate === filter.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.key === 'custom' && <CalendarDays className="w-3 h-3" />}
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {filterDate === 'custom' && (
          <div className="flex items-center gap-4 ml-8">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {(customDateFrom || customDateTo) && (
              <button
                onClick={() => {
                  setCustomDateFrom('');
                  setCustomDateTo('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear dates
              </button>
            )}
          </div>
        )}

        {/* Clear Filters */}
        {(filterStatus !== 'all' || filterDate !== 'all') && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterDate('all');
                setCustomDateFrom('');
                setCustomDateTo('');
              }}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              Clear all filters
            </button>
            <span className="text-sm text-gray-500">
              ({filteredTasks.length} of {actualTasks.length} tasks shown)
            </span>
          </div>
        )}
      </div>

      {/* Tasks List or Calendar */}
      {tasksView === 'calendar' ? (
        <TasksCalendarView
          tasks={filteredTasks}
          currentDate={currentDate}
          onNavigateMonth={onNavigateMonth}
          onToday={onToday}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onDateClick={handleDateClick}
        />
      ) : (
        // List View
        filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {actualTasks?.length === 0 ? 'No tasks yet' : 'No matching tasks'}
              </h3>
              <p className="text-gray-500 mb-6">
                {actualTasks?.length === 0 
                  ? 'Create your first task to get started with tracking progress.'
                  : 'Try adjusting your filters to see more tasks.'
                }
              </p>
              {actualTasks?.length === 0 && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create First Task
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="divide-y divide-gray-200">
              {filteredTasks.map(task => (
                <div key={task.id} className="p-6 hover:bg-gray-50 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
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
                            <Calendar className="w-4 h-4" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
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
                      
                      {/* Quick Actions */}
                      <div className="flex items-center gap-1">
                        {/* Quick Complete Button */}
                        {task.status !== 'Completed' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'Completed')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Mark as completed"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit task"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete task"
                          disabled={deleteTaskMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        {/* More Actions Dropdown */}
                        <div className="relative dropdown-menu">
                          <button
                            onClick={() => setShowTaskActions(showTaskActions === task.id ? null : task.id)}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                            title="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {showTaskActions === task.id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[140px]">
                              <div className="py-1">
                                <div className="px-3 py-1 text-xs font-medium text-gray-500 border-b border-gray-100">
                                  Change Status
                                </div>
                                {['Pending', 'In Progress', 'Completed', 'Cancelled'].map(status => (
                                  <button
                                    key={status}
                                    onClick={() => {
                                      handleStatusChange(task.id, status);
                                      setShowTaskActions(null);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                                      task.status === status ? 'font-medium text-purple-600' : 'text-gray-700'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 ml-2">
                        Created {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Create/Edit Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        jobId={jobId}
        onTaskCreated={handleTaskCreated}
        editTask={editingTask || undefined}
      />

      {/* Tasks by Date Modal */}
      <TasksByDateModal
        isOpen={showDateModal}
        onClose={handleCloseDateModal}
        date={selectedDate}
        tasks={selectedDateTasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
