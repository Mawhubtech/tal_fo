import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  User, 
  Filter, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Check, 
  X, 
  CalendarDays,
  Search,
  ArrowLeft,
  Briefcase,
  Target
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import type { Task } from '../recruitment/organizations/services/taskApiService';
import { toast } from '../components/ToastContainer';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskStatusDropdown from '../components/TaskStatusDropdown';
import EditTaskModal from '../components/EditTaskModal';
import TaskActionsDropdown from '../components/TaskActionsDropdown';
import TaskCalendar from '../components/TaskCalendar';
import TaskViewModal from '../components/TaskViewModal';

const TasksPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'High' | 'Medium' | 'Low' | 'Urgent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch all tasks using the hook
  const { 
    data: tasks = [], 
    isLoading, 
    error, 
    refetch 
  } = useTasks({
    status: filterStatus !== 'all' ? filterStatus : undefined,
    priority: filterPriority !== 'all' ? filterPriority : undefined,
  });

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.candidateName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group tasks by status for statistics
  const taskStats = {
    total: filteredTasks.length,
    pending: filteredTasks.filter(t => t.status === 'Pending').length,
    inProgress: filteredTasks.filter(t => t.status === 'In Progress').length,
    completed: filteredTasks.filter(t => t.status === 'Completed').length,
    overdue: filteredTasks.filter(t => {
      if (!t.dueDate || t.status === 'Completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length,
  };

  // Helper functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-purple-100 text-purple-800 border-purple-200';
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
      case 'On Hold': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Interview': return Target;
      case 'Review': return CheckSquare;
      case 'Schedule': return Calendar;
      case 'Follow-up': return Clock;
      default: return Briefcase;
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
    
    return date.toLocaleDateString();
  };

  const isOverdue = (dueDate?: string, status?: string) => {
    if (!dueDate || status === 'Completed') return false;
    return new Date(dueDate) < new Date();
  };

  const handleTaskCreated = () => {
    refetch();
    setShowCreateModal(false);
    toast.success('Task created successfully!');
  };

  const handleTaskUpdated = () => {
    refetch();
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedTask(null);
    toast.success('Task updated successfully!');
  };

  const handleTaskDeleted = () => {
    refetch();
    toast.success('Task deleted successfully!');
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setShowViewModal(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading tasks</h3>
              <p className="text-sm text-red-700 mt-1">
                There was an error loading your tasks. Please try again.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => refetch()}
              className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/dashboard" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
            <p className="text-gray-600">Manage and track your tasks across all projects</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                view === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckSquare className="h-4 w-4 mr-2 inline" />
              List
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                view === 'calendar' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2 inline" />
              Calendar
            </button>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <CheckSquare className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.pending}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-900">{taskStats.inProgress}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-900">{taskStats.completed}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-900">{taskStats.overdue}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="On Hold">On Hold</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Priority</option>
              <option value="Urgent">Urgent Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List/Calendar */}
      <div className="bg-white rounded-lg border border-gray-200">
        {view === 'calendar' ? (
          <TaskCalendar 
            tasks={filteredTasks}
            onTaskClick={handleViewTask}
            onStatusChanged={handleTaskCreated}
          />
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Get started by creating your first task.'
              }
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Task
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map((task) => {
              const TypeIcon = getTypeIcon(task.type);
              return (
                <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex items-start space-x-3 flex-1 cursor-pointer"
                      onClick={() => handleViewTask(task)}
                    >
                      <div className={`p-2 rounded-lg ${
                        task.type === 'Interview' ? 'bg-orange-100' :
                        task.type === 'Review' ? 'bg-purple-100' :
                        task.type === 'Schedule' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        <TypeIcon className={`h-4 w-4 ${
                          task.type === 'Interview' ? 'text-orange-600' :
                          task.type === 'Review' ? 'text-purple-600' :
                          task.type === 'Schedule' ? 'text-blue-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`text-sm font-medium ${
                            task.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <div onClick={(e) => e.stopPropagation()}>
                            <TaskStatusDropdown 
                              task={task} 
                              onStatusChanged={handleTaskCreated}
                            />
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {task.candidateName && (
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {task.candidateName}
                            </span>
                          )}
                          
                          {task.dueDate && (
                            <span className={`flex items-center ${
                              isOverdue(task.dueDate, task.status) ? 'text-red-600' : ''
                            }`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDueDate(task.dueDate)}
                            </span>
                          )}
                          
                          <span className="flex items-center">
                            <span className="capitalize">{task.type}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Edit task"
                      >
                        <Edit className="h-4 w-4 text-gray-400" />
                      </button>
                      <div onClick={(e) => e.stopPropagation()}>
                        <TaskActionsDropdown 
                          task={task}
                          onEdit={handleEditTask}
                          onTaskDeleted={handleTaskDeleted}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* View Task Modal */}
      {selectedTask && (
        <TaskViewModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onStatusChanged={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      {/* Edit Task Modal */}
      {selectedTask && (
        <EditTaskModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
};

export default TasksPage;
