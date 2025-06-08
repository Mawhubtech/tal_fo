import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Calendar, Clock, CheckCircle, ChevronDown, MoreHorizontal, AlertCircle, CalendarClock, CheckSquare, User, Briefcase } from 'lucide-react';

// Mock data for tasks
const mockTasks = [
  {
    id: '1',
    title: 'Review Sarah Johnson\'s application',
    description: 'Review resume and portfolio before phone screening',
    dueDate: '2025-06-02T10:00:00',
    priority: 'High',
    status: 'Pending',
    assignedTo: '201', // Alex Johnson
    candidateId: '1',
    candidateName: 'Sarah Johnson',
    candidateAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    jobId: '101',
    jobTitle: 'Senior Software Engineer - Frontend',
    type: 'Review',
    createdAt: '2025-05-31T09:30:00'
  },
  {
    id: '2',
    title: 'Schedule technical interview for Michael Chen',
    description: 'Coordinate with the engineering team for technical interview',
    dueDate: '2025-06-03T15:00:00',
    priority: 'Medium',
    status: 'Completed',
    assignedTo: '202', // Maria Garcia
    candidateId: '2',
    candidateName: 'Michael Chen',
    candidateAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    jobId: '102',
    jobTitle: 'Product Manager - Mobile Apps',
    type: 'Schedule',
    createdAt: '2025-05-30T14:45:00'
  },
  {
    id: '3',
    title: 'Prepare offer for Jessica Taylor',
    description: 'Draft offer letter and get approval from HR',
    dueDate: '2025-06-01T12:00:00',
    priority: 'High',
    status: 'Overdue',
    assignedTo: '203', // Ryan Miller
    candidateId: '3',
    candidateName: 'Jessica Taylor',
    candidateAvatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    jobId: '103',
    jobTitle: 'Senior UX Designer',
    type: 'Offer',
    createdAt: '2025-05-29T11:20:00'
  },
  {
    id: '4',
    title: 'Follow up with David Rodriguez',
    description: 'Send follow-up email after interview',
    dueDate: '2025-06-04T09:00:00',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: '204', // Priya Patel
    candidateId: '4',
    candidateName: 'David Rodriguez',
    candidateAvatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    jobId: '104',
    jobTitle: 'DevOps Engineer - Cloud Infrastructure',
    type: 'Follow-up',
    createdAt: '2025-05-28T16:30:00'
  },
  {
    id: '5',
    title: 'Complete reference check for Emma Wilson',
    description: 'Call provided references and document feedback',
    dueDate: '2025-06-05T14:30:00',
    priority: 'Low',
    status: 'Pending',
    assignedTo: '201', // Alex Johnson
    candidateId: '5',
    candidateName: 'Emma Wilson',
    candidateAvatar: 'https://randomuser.me/api/portraits/women/63.jpg',
    jobId: '105',
    jobTitle: 'Marketing Manager - Growth',
    type: 'Reference Check',
    createdAt: '2025-05-27T13:15:00'
  },
  {
    id: '6',
    title: 'Onboarding preparation for James Brown',
    description: 'Prepare onboarding documents and schedule orientation',
    dueDate: '2025-06-10T11:00:00',
    priority: 'High',
    status: 'Pending',
    assignedTo: '202', // Maria Garcia
    candidateId: '6',
    candidateName: 'James Brown',
    candidateAvatar: 'https://randomuser.me/api/portraits/men/15.jpg',
    jobId: '106',
    jobTitle: 'Senior Data Scientist',
    type: 'Onboarding',
    createdAt: '2025-05-26T10:45:00'
  },
  {
    id: '7',
    title: 'Send rejection email to Daniel Lee',
    description: 'Send personalized rejection email with feedback',
    dueDate: '2025-06-01T16:00:00',
    priority: 'Medium',
    status: 'Completed',
    assignedTo: '203', // Ryan Miller
    candidateId: '8',
    candidateName: 'Daniel Lee',
    candidateAvatar: 'https://randomuser.me/api/portraits/men/43.jpg',
    jobId: '107',
    jobTitle: 'Technical Project Manager',
    type: 'Rejection',
    createdAt: '2025-05-24T15:30:00'
  },
  {
    id: '8',
    title: 'Phone screen with Sophia Martinez',
    description: 'Conduct initial 30-minute phone screening',
    dueDate: '2025-06-06T13:00:00',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: '204', // Priya Patel
    candidateId: '9',
    candidateName: 'Sophia Martinez',
    candidateAvatar: 'https://randomuser.me/api/portraits/women/26.jpg',
    jobId: '108',
    jobTitle: 'Backend Developer - Node.js',
    type: 'Interview',
    createdAt: '2025-05-23T09:15:00'
  },
  {
    id: '9',
    title: 'Source candidates for Lead Product Designer role',
    description: 'Find at least 5 potential candidates on LinkedIn',
    dueDate: '2025-06-08T17:00:00',
    priority: 'High',
    status: 'Pending',
    assignedTo: '201', // Alex Johnson
    candidateId: null,
    candidateName: null,
    candidateAvatar: null,
    jobId: '109',
    jobTitle: 'Lead Product Designer',
    type: 'Sourcing',
    createdAt: '2025-05-22T14:20:00'
  }
];

// Mock data for recruiters (reusing from PipelinesPage)
const mockRecruiters = [
  { id: '201', name: 'Alex Johnson' },
  { id: '202', name: 'Maria Garcia' },
  { id: '203', name: 'Ryan Miller' },
  { id: '204', name: 'Priya Patel' }
];

// Task type options
const taskTypes = ['All Types', 'Review', 'Schedule', 'Interview', 'Follow-up', 'Offer', 'Onboarding', 'Reference Check', 'Rejection', 'Sourcing'];

// Priority options
const priorities = ['All Priorities', 'High', 'Medium', 'Low'];

// Status options
const statuses = ['All Statuses', 'Pending', 'Completed', 'Overdue'];

const TasksPage: React.FC = () => {
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All Types');
  const [selectedPriority, setSelectedPriority] = useState<string>('All Priorities');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [view, setView] = useState<'all' | 'my-tasks'>('all');
  
  // Format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Format time to display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Calculate days until due
  const getDaysUntilDue = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    
    // Reset time components to compare just dates
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `${diffDays} days`;
    }
  };
  
  // Function to get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Filter tasks based on selected filters
  const filteredTasks = mockTasks.filter(task => {
    // Filter by recruiter
    if (selectedRecruiter && task.assignedTo !== selectedRecruiter) return false;
    
    // Filter by type
    if (selectedType !== 'All Types' && task.type !== selectedType) return false;
    
    // Filter by priority
    if (selectedPriority !== 'All Priorities' && task.priority !== selectedPriority) return false;
    
    // Filter by status
    if (selectedStatus !== 'All Statuses' && task.status !== selectedStatus) return false;
    
    // Filter by search query (task title, candidate name, or job title)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(query);
      const candidateMatch = task.candidateName ? task.candidateName.toLowerCase().includes(query) : false;
      const jobMatch = task.jobTitle.toLowerCase().includes(query);
      
      if (!titleMatch && !candidateMatch && !jobMatch) return false;
    }
    
    // Filter by view (all or my tasks)
    if (view === 'my-tasks') {
      // Assuming current user is Alex Johnson for demo purposes
      if (task.assignedTo !== '201') return false;
    }
    
    return true;
  });
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/dashboard/ats" className="hover:text-gray-700">ATS</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Tasks</span>
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recruitment Tasks</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center transition-colors">
          <Plus size={18} className="mr-1" />
          Add Task
        </button>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              view === 'all' 
                ? 'border-purple-500 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setView('all')}
          >
            All Tasks
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              view === 'my-tasks' 
                ? 'border-purple-500 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setView('my-tasks')}
          >
            My Tasks
          </button>
        </div>
      </div>
      
      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Recruiter Filter */}
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={selectedRecruiter}
              onChange={(e) => setSelectedRecruiter(e.target.value)}
            >
              <option value="">All Recruiters</option>
              {mockRecruiters.map(recruiter => (
                <option key={recruiter.id} value={recruiter.id}>{recruiter.name}</option>
              ))}
            </select>
          </div>
          
          {/* Task Type Filter */}
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {taskTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Priority Filter */}
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
          
          {/* Status Filter */}
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Task List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredTasks.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Task Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-md mr-3 ${
                        task.status === 'Completed' 
                          ? 'bg-green-100' 
                          : task.status === 'Overdue'
                            ? 'bg-red-100'
                            : 'bg-blue-100'
                      }`}>
                        {task.status === 'Completed' ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : task.status === 'Overdue' ? (
                          <AlertCircle size={20} className="text-red-600" />
                        ) : (
                          <CheckSquare size={20} className="text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                        
                        {/* Task Metadata */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {/* Due Date */}
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar size={12} className="mr-1" />
                            <span>Due: {formatDate(task.dueDate)} at {formatTime(task.dueDate)}</span>
                          </div>
                          
                          {/* Priority Badge */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          
                          {/* Status Badge */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Candidate & Job Info */}
                  <div>
                    {task.candidateName && (
                      <div className="flex items-center mb-2">
                        <img 
                          src={task.candidateAvatar} 
                          alt={task.candidateName} 
                          className="h-6 w-6 rounded-full mr-2"
                        />
                        <span className="text-sm font-medium text-gray-900">{task.candidateName}</span>
                      </div>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <Briefcase size={12} className="mr-1" />
                      <span>{task.jobTitle}</span>
                    </div>
                  </div>
                  
                  {/* Assigned To & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User size={14} className="text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {mockRecruiters.find(r => r.id === task.assignedTo)?.name}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {task.status !== 'Completed' && (
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <CalendarClock size={18} />
                      </button>
                      <button className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
              <CheckSquare size={24} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500">No tasks match your current filters.</p>
            <div className="mt-6">
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                onClick={() => {
                  setSelectedRecruiter('');
                  setSelectedType('All Types');
                  setSelectedPriority('All Priorities');
                  setSelectedStatus('All Statuses');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Task Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Task Summary</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Tasks</span>
              <span className="text-sm font-medium">{mockTasks.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Completed</span>
              <span className="text-sm font-medium">{mockTasks.filter(t => t.status === 'Completed').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Pending</span>
              <span className="text-sm font-medium">{mockTasks.filter(t => t.status === 'Pending').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Overdue</span>
              <span className="text-sm font-medium text-red-600">{mockTasks.filter(t => t.status === 'Overdue').length}</span>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Due Soon</h3>
          <div className="mt-4 space-y-4">
            {mockTasks
              .filter(task => task.status !== 'Completed')
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 3)
              .map(task => (
                <div key={task.id} className="flex items-start">
                  <div className={`p-1.5 rounded-md mr-3 ${task.status === 'Overdue' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                    <Clock size={16} className={task.status === 'Overdue' ? 'text-red-600' : 'text-yellow-600'} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                    <div className="flex items-center mt-1">
                      <Calendar size={12} className="text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        Due {formatDate(task.dueDate)} ({getDaysUntilDue(task.dueDate)})
                      </span>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
