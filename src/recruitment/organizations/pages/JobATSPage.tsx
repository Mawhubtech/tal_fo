import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Briefcase, Users, MoreHorizontal, Search, Filter, Plus,
  Calendar, Mail, Phone, Target, Eye, UserPlus, MessageSquare,
  Clock, CheckCircle, BarChart3, Video, MapPin, AlertCircle,
  TrendingUp, PieChart, Download, ChevronLeft, ChevronRight
} from 'lucide-react';
import { JobService } from '../data';
import type { Job as JobType } from '../data';

interface Candidate {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  stage: string;
  score: number;
  lastUpdated: string;
  tags: string[];
  source: string;
  appliedDate: string;
}

const mockCandidatesByJob: Record<string, Candidate[]> = {
  'job-101': [
    {
      id: '1',
      name: 'John Smith',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      stage: 'Applied',
      score: 4.8,
      lastUpdated: '2025-01-30T14:30:00',
      tags: ['React', 'TypeScript', 'Senior'],
      source: 'LinkedIn',
      appliedDate: '2025-01-28'
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      email: 'sarah.wilson@example.com',
      phone: '(555) 234-5678',
      stage: 'Phone Screen',
      score: 4.6,
      lastUpdated: '2025-01-29T10:15:00',
      tags: ['JavaScript', 'Vue.js', 'Frontend'],
      source: 'Indeed',
      appliedDate: '2025-01-25'
    },
    {
      id: '3',
      name: 'Michael Davis',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      email: 'michael.davis@example.com',
      phone: '(555) 345-6789',
      stage: 'Technical Interview',
      score: 4.9,
      lastUpdated: '2025-01-28T16:45:00',
      tags: ['React', 'Node.js', 'Full Stack'],
      source: 'Referral',
      appliedDate: '2025-01-22'
    },
    {
      id: '4',
      name: 'Emily Chen',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      email: 'emily.chen@example.com',
      phone: '(555) 456-7890',
      stage: 'Final Interview',
      score: 4.7,
      lastUpdated: '2025-01-27T11:20:00',
      tags: ['Angular', 'CSS', 'UI/UX'],
      source: 'Career Page',
      appliedDate: '2025-01-20'
    },
    {
      id: '5',
      name: 'David Lee',
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      email: 'david.lee@example.com',
      phone: '(555) 567-8901',
      stage: 'Offer',
      score: 4.8,
      lastUpdated: '2025-01-26T09:00:00',
      tags: ['React', 'TypeScript', 'Leadership'],
      source: 'AngelList',
      appliedDate: '2025-01-18'
    },
    {
      id: '6',
      name: 'Lisa Rodriguez',
      avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
      email: 'lisa.rodriguez@example.com',
      phone: '(555) 678-9012',
      stage: 'Hired',
      score: 4.9,
      lastUpdated: '2025-01-25T14:00:00',
      tags: ['React', 'TypeScript', 'Mentor'],
      source: 'LinkedIn',
      appliedDate: '2025-01-15'
    }
  ],
  'job-201': [
    {
      id: '7',
      name: 'Alex Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
      email: 'alex.johnson@example.com',
      phone: '(555) 789-0123',
      stage: 'Applied',
      score: 4.5,
      lastUpdated: '2025-01-30T09:30:00',
      tags: ['Product Strategy', 'Mobile', 'Analytics'],
      source: 'Indeed',
      appliedDate: '2025-01-29'
    },
    {
      id: '8',
      name: 'Maria Garcia',
      avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
      email: 'maria.garcia@example.com',
      phone: '(555) 890-1234',
      stage: 'Phone Screen',
      score: 4.7,
      lastUpdated: '2025-01-29T15:45:00',
      tags: ['Product Management', 'iOS', 'Android'],
      source: 'Referral',
      appliedDate: '2025-01-26'
    }
  ]
};

// Mock data for tasks by job
const mockTasksByJob: Record<string, any[]> = {
  'job-101': [
    {
      id: 't1',
      title: 'Review John Smith\'s portfolio',
      description: 'Assess technical skills and project experience',
      dueDate: '2025-06-10T10:00:00',
      priority: 'High',
      status: 'Pending',
      assignedTo: 'Sarah Johnson',
      candidateId: '1',
      candidateName: 'John Smith',
      type: 'Review'
    },
    {
      id: 't2',
      title: 'Schedule technical interview for Sarah Wilson',
      description: 'Coordinate with engineering team for technical assessment',
      dueDate: '2025-06-08T14:00:00',
      priority: 'Medium',
      status: 'In Progress',
      assignedTo: 'Alex Chen',
      candidateId: '2',
      candidateName: 'Sarah Wilson',
      type: 'Schedule'
    },
    {
      id: 't3',
      title: 'Prepare offer for David Lee',
      description: 'Draft offer letter and compensation package',
      dueDate: '2025-06-12T09:00:00',
      priority: 'High',
      status: 'Pending',
      assignedTo: 'HR Team',
      candidateId: '5',
      candidateName: 'David Lee',
      type: 'Offer'
    }
  ],
  'job-201': [
    {
      id: 't4',
      title: 'Review Alex Johnson\'s product portfolio',
      description: 'Evaluate product management experience and case studies',
      dueDate: '2025-06-09T11:00:00',
      priority: 'Medium',
      status: 'Pending',
      assignedTo: 'Michael Chen',
      candidateId: '7',
      candidateName: 'Alex Johnson',
      type: 'Review'
    }
  ]
};

// Mock data for interviews by job
const mockInterviewsByJob: Record<string, any[]> = {
  'job-101': [
    {
      id: 'i1',
      candidateId: '2',
      candidateName: 'Sarah Wilson',
      candidateAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      interviewers: ['Sarah Johnson', 'Alex Chen'],
      interviewType: 'Technical',
      date: '2025-06-10T14:00:00',
      duration: 60,
      format: 'Video',
      location: 'Google Meet',
      status: 'Scheduled',
      notes: 'Focus on React and JavaScript fundamentals'
    },
    {
      id: 'i2',
      candidateId: '3',
      candidateName: 'Michael Davis',
      candidateAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      interviewers: ['Sarah Johnson', 'Tech Lead'],
      interviewType: 'Final',
      date: '2025-06-12T10:00:00',
      duration: 45,
      format: 'In-person',
      location: 'San Francisco Office',
      status: 'Scheduled',
      notes: 'Culture fit and leadership discussion'
    },
    {
      id: 'i3',
      candidateId: '1',
      candidateName: 'John Smith',
      candidateAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      interviewers: ['Sarah Johnson'],
      interviewType: 'Phone Screen',
      date: '2025-06-08T15:00:00',
      duration: 30,
      format: 'Phone',
      location: '+1 (555) 123-4567',
      status: 'Completed',
      notes: 'Strong technical background, proceed to technical interview'
    }
  ],
  'job-201': [
    {
      id: 'i4',
      candidateId: '7',
      candidateName: 'Alex Johnson',
      candidateAvatar: 'https://randomuser.me/api/portraits/men/7.jpg',
      interviewers: ['Michael Chen'],
      interviewType: 'Product',
      date: '2025-06-11T13:00:00',
      duration: 60,
      format: 'Video',
      location: 'Zoom',
      status: 'Scheduled',
      notes: 'Product strategy and mobile experience discussion'
    }
  ]
};

// Mock data for reports by job
const mockReportsByJob: Record<string, any> = {
  'job-101': {
    metrics: {
      totalCandidates: 6,
      activeInPipeline: 5,
      hired: 1,
      averageTimeToHire: 28,
      offerAcceptanceRate: 100,
      sourceBreakdown: [
        { source: 'LinkedIn', count: 2, percentage: 33.3 },
        { source: 'Referral', count: 1, percentage: 16.7 },
        { source: 'Indeed', count: 1, percentage: 16.7 },
        { source: 'Career Page', count: 1, percentage: 16.7 },
        { source: 'AngelList', count: 1, percentage: 16.7 }
      ]
    }
  },
  'job-201': {
    metrics: {
      totalCandidates: 2,
      activeInPipeline: 2,
      hired: 0,
      averageTimeToHire: 0,
      offerAcceptanceRate: 0,
      sourceBreakdown: [
        { source: 'Indeed', count: 1, percentage: 50 },
        { source: 'Referral', count: 1, percentage: 50 }
      ]
    }
  }
};

const stages = ['Applied', 'Phone Screen', 'Technical Interview', 'Final Interview', 'Offer', 'Hired', 'Rejected'];

const JobATSPage: React.FC = () => {
  const { organizationId, departmentId, jobId } = useParams<{ 
    organizationId: string; 
    departmentId: string; 
    jobId: string; 
  }>();
  
  const [activeTab, setActiveTab] = useState<'pipeline' | 'tasks' | 'interviews' | 'reports'>('pipeline');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [job, setJob] = useState<JobType | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Calendar view states
  const [tasksView, setTasksView] = useState<'list' | 'calendar'>('list');
  const [interviewsView, setInterviewsView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());

  const jobService = new JobService();

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId || !organizationId || !departmentId) {
        setLoading(false);
        return;
      }      try {
        setLoading(true);
        // Get all jobs for the organization and filter by department and job ID
        const jobs = await jobService.getJobsByOrganization(organizationId);
        const foundJob = jobs.find(j => j.id === jobId && j.departmentId === departmentId);
        setJob(foundJob || null);
      } catch (error) {
        console.error('Error loading job:', error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId, organizationId, departmentId]);
  // For now, we'll use the existing mock data for candidates, tasks, etc.
  // In a real application, these would also be loaded from the backend
  // Map job IDs to mock data keys - for jobs 1,2,3,4 we'll use job-101, job-201, etc.
  const getMockJobKey = (id: string): string => {
    const jobIdMap: Record<string, string> = {
      '1': 'job-101',  // Senior Frontend Developer -> Frontend Engineer mock data
      '2': 'job-201',  // Product Manager -> Product Manager mock data  
      '3': 'job-101',  // UX Designer -> use Frontend Engineer data as fallback
      '4': 'job-101',  // DevOps Engineer -> use Frontend Engineer data as fallback
    };
    return jobIdMap[id] || 'job-101';
  };
  
  const mockJobKey = jobId ? getMockJobKey(jobId) : '';
  const allCandidates = mockJobKey && mockCandidatesByJob[mockJobKey] ? mockCandidatesByJob[mockJobKey] : [];
  const allTasks = mockJobKey && mockTasksByJob[mockJobKey] ? mockTasksByJob[mockJobKey] : [];
  const allInterviews = mockJobKey && mockInterviewsByJob[mockJobKey] ? mockInterviewsByJob[mockJobKey] : [];
  const reportData = mockJobKey && mockReportsByJob[mockJobKey] ? mockReportsByJob[mockJobKey] : null;

  const filteredCandidates = allCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStage = selectedStage === 'all' || candidate.stage === selectedStage;
    
    return matchesSearch && matchesStage;
  });

  const getCandidatesByStage = (stage: string) => {
    return filteredCandidates.filter(candidate => candidate.stage === stage);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Applied': return 'border-blue-500';
      case 'Phone Screen': return 'border-indigo-500';
      case 'Technical Interview': return 'border-purple-500';
      case 'Final Interview': return 'border-pink-500';
      case 'Offer': return 'border-orange-500';
      case 'Hired': return 'border-green-500';
      case 'Rejected': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Calendar helper functions
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getItemsForDate = (date: Date, items: any[]) => {
    return items.filter(item => {
      const itemDate = new Date(item.dueDate || item.date);
      return itemDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const CalendarHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </h3>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Today
        </button>
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const TasksCalendarView = () => {
    const calendarDays = getCalendarDays(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <CalendarHeader />
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2 h-24"></div>;
            }
            
            const dayTasks = getItemsForDate(day, allTasks);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`p-2 h-24 border border-gray-100 hover:bg-gray-50 ${
                  isToday ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      className={`text-xs p-1 rounded truncate ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const InterviewsCalendarView = () => {
    const calendarDays = getCalendarDays(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <CalendarHeader />
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2 h-24"></div>;
            }
            
            const dayInterviews = getItemsForDate(day, allInterviews);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`p-2 h-24 border border-gray-100 hover:bg-gray-50 ${
                  isToday ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayInterviews.slice(0, 2).map(interview => (
                    <div
                      key={interview.id}
                      className={`text-xs p-1 rounded truncate ${
                        interview.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        interview.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                      title={`${interview.candidateName} - ${interview.interviewType}`}
                    >
                      {new Date(interview.date).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })} {interview.candidateName}
                    </div>
                  ))}
                  {dayInterviews.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayInterviews.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
          <p className="text-gray-500 mb-4">The job you're looking for doesn't exist.</p>
          <Link 
            to="/dashboard/organizations" 
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/dashboard/organizations" className="hover:text-gray-700">Organizations</Link>
        <span className="mx-2">/</span>        <Link to={`/dashboard/organizations/${organizationId}`} className="hover:text-gray-700">
          Organization
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs`} className="hover:text-gray-700">
          {job.department}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">ATS - {job.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs`}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ATS Pipeline</h1>
            <p className="text-gray-600 mt-1">Managing candidates for this specific job</p>
          </div>
        </div>
        
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add Candidate
        </button>
      </div>

      {/* Job Info Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
              <p className="text-gray-600">{job.department} • {job.location} • {job.employmentType}</p>
              <p className="text-gray-500 text-sm">Status: {job.status} • Experience Level: {job.experience}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{allCandidates.length}</p>
            <p className="text-sm text-gray-500">Total Candidates</p>
          </div>        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex space-x-0 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-6 py-3 text-sm font-medium flex items-center ${
              activeTab === 'pipeline'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Pipeline ({allCandidates.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-3 text-sm font-medium flex items-center ${
              activeTab === 'tasks'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Tasks ({allTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`px-6 py-3 text-sm font-medium flex items-center ${
              activeTab === 'interviews'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Interviews ({allInterviews.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 text-sm font-medium flex items-center ${
              activeTab === 'reports'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'pipeline' && (
        <>
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search candidates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Stage Filter */}
          <div className="md:w-48">
            <select
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
            >
              <option value="all">All Stages</option>
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:w-48">
            <select
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4 mb-6 overflow-x-auto min-h-[calc(100vh-400px)]">
        {stages.map((stage) => (
          <div key={stage} className="bg-white rounded-lg shadow-sm min-w-[280px]">
            {/* Stage Header */}
            <div className={`px-4 py-3 border-t-4 rounded-t-lg flex justify-between items-center ${getStageColor(stage)}`}>
              <div>
                <h2 className="font-semibold text-gray-800">{stage}</h2>
                <p className="text-xs text-gray-500">{getCandidatesByStage(stage).length} candidates</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            
            {/* Candidates in this stage */}
            <div className="p-2 overflow-y-auto max-h-[calc(100vh-450px)]">
              {getCandidatesByStage(stage).map((candidate) => (
                <div key={candidate.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-md transition-shadow cursor-pointer">
                  {/* Candidate Info */}
                  <div className="flex items-center mb-2">
                    <img src={candidate.avatar} alt={candidate.name} className="w-8 h-8 rounded-full mr-2" />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-gray-800">{candidate.name}</h3>
                      <p className="text-xs text-gray-500">{candidate.source}</p>
                    </div>
                    <div className={`text-xs font-medium ${getScoreColor(candidate.score)}`}>
                      ★ {candidate.score}
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="text-xs text-gray-500 mb-2">
                    <div className="flex items-center mb-1">
                      <Mail className="w-3 h-3 mr-1" />
                      <span className="truncate">{candidate.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      <span>{candidate.phone}</span>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {candidate.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {candidate.tags.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{candidate.tags.length - 2}
                      </span>
                    )}
                  </div>
                  
                  {/* Applied Date */}
                  <div className="flex items-center text-xs text-gray-400 mb-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    Applied {new Date(candidate.appliedDate).toLocaleDateString()}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div className="flex space-x-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Eye className="w-3 h-3" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded">
                        <Mail className="w-3 h-3" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded">
                        <MessageSquare className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(candidate.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Empty State for Stage */}
              {getCandidatesByStage(stage).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No candidates</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <p className="text-2xl font-bold text-blue-600">{getCandidatesByStage('Applied').length}</p>
              <p className="text-sm text-gray-500">New Applications</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <p className="text-2xl font-bold text-purple-600">{getCandidatesByStage('Technical Interview').length + getCandidatesByStage('Final Interview').length}</p>
              <p className="text-sm text-gray-500">In Interview</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <p className="text-2xl font-bold text-orange-600">{getCandidatesByStage('Offer').length}</p>
              <p className="text-sm text-gray-500">Pending Offers</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <p className="text-2xl font-bold text-green-600">{getCandidatesByStage('Hired').length}</p>
              <p className="text-sm text-gray-500">Hired</p>
            </div>
          </div>
        </>
      )}      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Task Actions */}
          <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setTasksView('list')}
                  className={`px-3 py-2 text-sm flex items-center ${
                    tasksView === 'list' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4 mr-1" />
                  List
                </button>
                <button
                  onClick={() => setTasksView('calendar')}
                  className={`px-3 py-2 text-sm flex items-center ${
                    tasksView === 'calendar' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Calendar
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {allTasks.filter(t => t.status === 'Pending').length} pending • {allTasks.filter(t => t.status === 'In Progress').length} in progress
            </div>
          </div>

          {/* Tasks Content */}
          {tasksView === 'list' ? (
            /* Tasks List */
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Tasks & Action Items</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {allTasks.map((task) => (
                  <div key={task.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.priority === 'High' ? 'bg-red-100 text-red-800' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span>Assigned to {task.assignedTo}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                          {task.candidateName && (
                            <div className="flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              <span>For {task.candidateName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Tasks Calendar */
            <TasksCalendarView />
          )}
        </div>
      )}      {/* Interviews Tab */}
      {activeTab === 'interviews' && (
        <div className="space-y-6">
          {/* Interview Actions */}
          <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Interview
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setInterviewsView('list')}
                  className={`px-3 py-2 text-sm flex items-center ${
                    interviewsView === 'list' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4 mr-1" />
                  List
                </button>
                <button
                  onClick={() => setInterviewsView('calendar')}
                  className={`px-3 py-2 text-sm flex items-center ${
                    interviewsView === 'calendar' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Calendar
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {allInterviews.filter(i => i.status === 'Scheduled').length} scheduled • {allInterviews.filter(i => i.status === 'Completed').length} completed
            </div>
          </div>

          {/* Interviews Content */}
          {interviewsView === 'list' ? (
            /* Interviews List */
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Interview Schedule</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {allInterviews.map((interview) => (
                  <div key={interview.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <img 
                          src={interview.candidateAvatar} 
                          alt={interview.candidateName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{interview.candidateName}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              interview.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                              interview.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {interview.status}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              interview.format === 'Video' ? 'bg-purple-100 text-purple-800' :
                              interview.format === 'Phone' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {interview.format}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{interview.interviewType} Interview</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{new Date(interview.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{new Date(interview.date).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              <span>with {interview.interviewers.join(', ')}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{interview.duration} min</span>
                            </div>
                            {interview.location && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{interview.location}</span>
                              </div>
                            )}
                          </div>
                          {interview.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">{interview.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {interview.format === 'Video' && (
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <Video className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Interviews Calendar */
            <InterviewsCalendarView />
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && reportData && (
        <div className="space-y-6">
          {/* Report Actions */}
          <div className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{reportData.metrics.totalCandidates}</p>
              <p className="text-sm text-gray-500">Total Candidates</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{reportData.metrics.activeInPipeline}</p>
              <p className="text-sm text-gray-500">Active in Pipeline</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{reportData.metrics.hired}</p>
              <p className="text-sm text-gray-500">Hired</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{reportData.metrics.averageTimeToHire}</p>
              <p className="text-sm text-gray-500">Avg. Days to Hire</p>
            </div>
          </div>

          {/* Source Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Candidate Sources
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {reportData.metrics.sourceBreakdown.map((source: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded mr-3 ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-purple-500' :
                        index === 2 ? 'bg-green-500' :
                        index === 3 ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="font-medium text-gray-900">{source.source}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600">{source.count} candidates</span>
                      <span className="font-medium text-gray-900">{source.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Pipeline Health</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Offer Acceptance Rate</span>
                    <span className="font-semibold text-green-600">{reportData.metrics.offerAcceptanceRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Time in Pipeline</span>
                    <span className="font-semibold text-gray-900">{reportData.metrics.averageTimeToHire} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Interview-to-Offer Rate</span>
                    <span className="font-semibold text-blue-600">75%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-gray-600">Lisa Rodriguez hired</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <UserPlus className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-gray-600">2 new applications received</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-purple-500 mr-2" />
                    <span className="text-gray-600">3 interviews scheduled</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="text-gray-600">1 task overdue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobATSPage;
