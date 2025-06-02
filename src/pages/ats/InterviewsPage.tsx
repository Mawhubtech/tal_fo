import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Calendar, List, ChevronDown, Clock, User, VideoIcon, Phone, MapPin, MoreHorizontal, CheckCircle, X, FileText, Edit, Trash2, CalendarDays, ArrowRight, CalendarClock } from 'lucide-react';

// Mock data for interviews
const mockInterviews = [
  {
    id: '1',
    candidateId: '3',
    candidateName: 'Jessica Taylor',
    candidateAvatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    jobId: '103',
    jobTitle: 'Senior UX Designer',
    interviewers: ['Alex Johnson', 'Priya Patel'],
    interviewType: 'Technical',
    date: '2025-06-02T13:00:00',
    duration: 60,
    format: 'Video',
    location: 'Google Meet',
    status: 'Scheduled',
    stage: 'Phone Screen',
    notes: 'Focus on portfolio review and design process questions',
    createdBy: 'Ryan Miller'
  },
  {
    id: '2',
    candidateId: '1',
    candidateName: 'Sarah Johnson',
    candidateAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    jobId: '101',
    jobTitle: 'Senior Software Engineer - Frontend',
    interviewers: ['Maria Garcia'],
    interviewType: 'Phone Screening',
    date: '2025-06-01T10:30:00',
    duration: 30,
    format: 'Phone',
    location: '+1 (555) 123-4567',
    status: 'Scheduled',
    stage: 'Sourced',
    notes: 'Initial screening to gauge interest and technical background',
    createdBy: 'Alex Johnson'
  },
  {
    id: '3',
    candidateId: '4',
    candidateName: 'David Rodriguez',
    candidateAvatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    jobId: '104',
    jobTitle: 'DevOps Engineer - Cloud Infrastructure',
    interviewers: ['Ryan Miller', 'James Wilson'],
    interviewType: 'Technical',
    date: '2025-06-03T15:00:00',
    duration: 90,
    format: 'In-person',
    location: 'HQ - Meeting Room 3B',
    status: 'Scheduled',
    stage: 'Interview',
    notes: 'Deep dive on AWS experience and Kubernetes expertise',
    createdBy: 'Priya Patel'
  },
  {
    id: '4',
    candidateId: '2',
    candidateName: 'Michael Chen',
    candidateAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    jobId: '102',
    jobTitle: 'Product Manager - Mobile Apps',
    interviewers: ['Sophia Lee', 'Alex Johnson'],
    interviewType: 'Cultural Fit',
    date: '2025-06-04T11:00:00',
    duration: 45,
    format: 'Video',
    location: 'Zoom',
    status: 'Scheduled',
    stage: 'Applied',
    notes: 'Assess team fit and communication skills',
    createdBy: 'Maria Garcia'
  },
  {
    id: '5',
    candidateId: '9',
    candidateName: 'Sophia Martinez',
    candidateAvatar: 'https://randomuser.me/api/portraits/women/26.jpg',
    jobId: '108',
    jobTitle: 'Backend Developer - Node.js',
    interviewers: ['Ryan Miller'],
    interviewType: 'Technical',
    date: '2025-05-28T14:00:00',
    duration: 60,
    format: 'Video',
    location: 'Microsoft Teams',
    status: 'Completed',
    stage: 'Phone Screen',
    notes: 'Coding assessment and system design discussion',
    createdBy: 'Priya Patel',
    feedback: 'Strong technical skills. Proceed to next round.',
    rating: 4
  },
  {
    id: '6',
    candidateId: '7',
    candidateName: 'Olivia Parker',
    candidateAvatar: 'https://randomuser.me/api/portraits/women/35.jpg',
    jobId: '101',
    jobTitle: 'Senior Software Engineer - Frontend',
    interviewers: ['Alex Johnson', 'James Wilson'],
    interviewType: 'Technical',
    date: '2025-05-30T09:00:00',
    duration: 60,
    format: 'Video',
    location: 'Google Meet',
    status: 'Completed',
    stage: 'Applied',
    notes: 'Focus on React and state management experience',
    createdBy: 'Maria Garcia',
    feedback: 'Good React knowledge but limited experience with complex state management. Consider for junior role.',
    rating: 3
  },
  {
    id: '7',
    candidateId: '10',
    candidateName: 'Ethan Thompson',
    candidateAvatar: 'https://randomuser.me/api/portraits/men/76.jpg',
    jobId: '109',
    jobTitle: 'Lead Product Designer',
    interviewers: ['Priya Patel'],
    interviewType: 'Phone Screening',
    date: '2025-05-29T11:30:00',
    duration: 30,
    format: 'Phone',
    location: '+1 (555) 987-6543',
    status: 'Canceled',
    stage: 'Sourced',
    notes: 'Initial conversation about the role and expectations',
    createdBy: 'Alex Johnson',
    cancellationReason: 'Candidate found another position'
  },
  {
    id: '8',
    candidateId: '5',
    candidateName: 'Emma Wilson',
    candidateAvatar: 'https://randomuser.me/api/portraits/women/63.jpg',
    jobId: '105',
    jobTitle: 'Marketing Manager - Growth',
    interviewers: ['Ryan Miller', 'Sophia Lee', 'Alex Johnson'],
    interviewType: 'Final Round',
    date: '2025-06-05T13:30:00',
    duration: 120,
    format: 'In-person',
    location: 'HQ - Conference Room A',
    status: 'Scheduled',
    stage: 'Offer',
    notes: 'Final interview with leadership team',
    createdBy: 'Maria Garcia'
  }
];

// Interview types
const interviewTypes = ['All Types', 'Phone Screening', 'Technical', 'Cultural Fit', 'Final Round'];

// Interview formats
const interviewFormats = ['All Formats', 'Video', 'Phone', 'In-person'];

// Interview statuses
const interviewStatuses = ['All Statuses', 'Scheduled', 'Completed', 'Canceled'];

const InterviewsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('All Types');
  const [selectedFormat, setSelectedFormat] = useState<string>('All Formats');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Calendar view - get the week dates
  const getWeekDates = () => {
    const dates = [];
    // Start with Monday of the current week
    const startDate = new Date(currentDate);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startDate.setDate(diff);
    
    // Get dates for Monday to Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  // Get hours for the calendar view
  const getCalendarHours = () => {
    const hours = [];
    for (let i = 9; i <= 17; i++) { // 9 AM to 5 PM
      hours.push(i);
    }
    return hours;
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Check if an interview falls on a specific date
  const isInterviewOnDate = (interview: any, date: Date) => {
    const interviewDate = new Date(interview.date);
    return (
      interviewDate.getDate() === date.getDate() &&
      interviewDate.getMonth() === date.getMonth() &&
      interviewDate.getFullYear() === date.getFullYear()
    );
  };
  
  // Check if an interview falls within a specific hour
  const isInterviewAtHour = (interview: any, date: Date, hour: number) => {
    const interviewDate = new Date(interview.date);
    return (
      isInterviewOnDate(interview, date) &&
      interviewDate.getHours() === hour
    );
  };
  
  // Get interviews for a specific date and hour
  const getInterviewsForDateAndHour = (date: Date, hour: number) => {
    return filteredInterviews.filter(interview => isInterviewAtHour(interview, date, hour));
  };
  
  // Function to get interview format icon
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'Video':
        return <VideoIcon size={16} className="text-blue-500" />;
      case 'Phone':
        return <Phone size={16} className="text-green-500" />;
      case 'In-person':
        return <MapPin size={16} className="text-purple-500" />;
      default:
        return <Calendar size={16} className="text-gray-500" />;
    }
  };
  
  // Function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Filter interviews based on selected filters
  const filteredInterviews = mockInterviews.filter(interview => {
    // Filter by type
    if (selectedType !== 'All Types' && interview.interviewType !== selectedType) return false;
    
    // Filter by format
    if (selectedFormat !== 'All Formats' && interview.format !== selectedFormat) return false;
    
    // Filter by status
    if (selectedStatus !== 'All Statuses' && interview.status !== selectedStatus) return false;
    
    // Filter by search query (candidate name, job title, or location)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = interview.candidateName.toLowerCase().includes(query);
      const jobMatch = interview.jobTitle.toLowerCase().includes(query);
      const locationMatch = interview.location.toLowerCase().includes(query);
      
      if (!nameMatch && !jobMatch && !locationMatch) return false;
    }
    
    return true;
  });
  
  // Sort interviews by date (most recent first for list view)
  const sortedInterviews = [...filteredInterviews].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  // Get upcoming interviews (scheduled interviews in the future)
  const upcomingInterviews = sortedInterviews.filter(
    interview => interview.status === 'Scheduled' && new Date(interview.date) > new Date()
  );
  
  // Get today's interviews
  const todayInterviews = sortedInterviews.filter(interview => {
    const interviewDate = new Date(interview.date);
    const today = new Date();
    return (
      interviewDate.getDate() === today.getDate() &&
      interviewDate.getMonth() === today.getMonth() &&
      interviewDate.getFullYear() === today.getFullYear() &&
      interview.status === 'Scheduled'
    );
  });
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/dashboard/ats" className="hover:text-gray-700">ATS</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Interviews</span>
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Interview Schedule</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center transition-colors">
          <Plus size={18} className="mr-1" />
          Schedule Interview
        </button>
      </div>
      
      {/* View Switcher */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2 bg-white border border-gray-200 rounded-md">
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              view === 'calendar' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setView('calendar')}
          >
            <Calendar size={16} className="inline-block mr-1" />
            Calendar
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              view === 'list' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setView('list')}
          >
            <List size={16} className="inline-block mr-1" />
            List
          </button>
        </div>
        
        {view === 'calendar' && (
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() - 7);
                setCurrentDate(newDate);
              }}
            >
              <ChevronDown size={18} className="rotate-90 text-gray-600" />
            </button>
            <span className="text-sm font-medium">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() + 7);
                setCurrentDate(newDate);
              }}
            >
              <ChevronDown size={18} className="-rotate-90 text-gray-600" />
            </button>
            <button 
              className="ml-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </button>
          </div>
        )}
      </div>
      
      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Search interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Interview Type Filter */}
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {interviewTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Format Filter */}
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              {interviewFormats.map(format => (
                <option key={format} value={format}>{format}</option>
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
              {interviewStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden">
          {/* Calendar Header - Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {getWeekDates().map((date, index) => (
              <div 
                key={index}
                className={`p-2 text-center ${
                  date.getDate() === new Date().getDate() &&
                  date.getMonth() === new Date().getMonth() &&
                  date.getFullYear() === new Date().getFullYear()
                    ? 'bg-purple-100 rounded-md'
                    : ''
                }`}
              >
                <div className="text-xs text-gray-500 font-medium">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-sm font-bold mt-1">
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="border rounded-md">
            {getCalendarHours().map((hour, hourIndex) => (
              <div key={hourIndex} className="grid grid-cols-7 gap-2 border-b last:border-b-0">
                {/* Time Label */}
                <div className="col-span-7 border-b px-2 py-1 bg-gray-50">
                  <span className="text-xs text-gray-600 font-medium">
                    {hour === 12 ? '12:00 PM' : hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}
                  </span>
                </div>
                
                {/* Days Cells */}
                {getWeekDates().map((date, dateIndex) => (
                  <div key={dateIndex} className="min-h-[100px] p-1 border-r last:border-r-0">
                    {getInterviewsForDateAndHour(date, hour).map((interview, interviewIndex) => (
                      <div 
                        key={interviewIndex}
                        className={`p-2 mb-1 rounded text-xs ${
                          interview.format === 'Video' ? 'bg-blue-100 border-l-4 border-blue-500' :
                          interview.format === 'Phone' ? 'bg-green-100 border-l-4 border-green-500' :
                          'bg-purple-100 border-l-4 border-purple-500'
                        }`}
                      >
                        <div className="font-medium truncate">{interview.candidateName}</div>
                        <div className="flex items-center mt-1">
                          {getFormatIcon(interview.format)}
                          <span className="ml-1 truncate">{formatTime(interview.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {sortedInterviews.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {sortedInterviews.map((interview) => (
                <div key={interview.id} className="p-4 hover:bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between">
                  {/* Interview Info */}
                  <div className="flex items-start mb-3 md:mb-0">
                    <img 
                      src={interview.candidateAvatar} 
                      alt={interview.candidateName} 
                      className="h-10 w-10 rounded-full mr-3"
                    />
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900">{interview.candidateName}</h3>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(interview.status)}`}>
                          {interview.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{interview.jobTitle}</p>
                      
                      {/* Interview Details */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          <span>{formatDate(interview.date)}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock size={12} className="mr-1" />
                          <span>{formatTime(interview.date)} ({interview.duration} min)</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          {getFormatIcon(interview.format)}
                          <span className="ml-1">{interview.location}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <User size={12} className="mr-1" />
                          <span>{interview.interviewers.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 self-end md:self-center">
                    {interview.status === 'Scheduled' && (
                      <>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Mark as completed">
                          <CheckCircle size={18} />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Cancel interview">
                          <X size={18} />
                        </button>
                      </>
                    )}
                    {interview.status === 'Completed' && (
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View feedback">
                        <FileText size={18} />
                      </button>
                    )}
                    <button className="p-1 text-gray-600 hover:bg-gray-100 rounded" title="Edit">
                      <Edit size={18} />
                    </button>
                    <button className="p-1 text-gray-600 hover:bg-gray-100 rounded" title="More options">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                <Calendar size={24} className="text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">No interviews found</h3>
              <p className="mt-1 text-sm text-gray-500">No interviews match your current filters.</p>
              <div className="mt-6">
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                  onClick={() => {
                    setSelectedType('All Types');
                    setSelectedFormat('All Formats');
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
      )}
      
      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Interviews */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CalendarDays size={18} className="mr-2 text-purple-600" />
            Today's Interviews
          </h3>
          
          {todayInterviews.length > 0 ? (
            <div className="mt-3 space-y-3">
              {todayInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center">
                  <img 
                    src={interview.candidateAvatar} 
                    alt={interview.candidateName} 
                    className="h-8 w-8 rounded-full mr-2"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {interview.candidateName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {formatTime(interview.date)} • {interview.format}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <button className="p-1 text-purple-600 hover:bg-purple-50 rounded">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">No interviews scheduled for today.</p>
          )}
        </div>
        
        {/* Upcoming Interviews */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CalendarClock size={18} className="mr-2 text-purple-600" />
            Upcoming Interviews
          </h3>
          
          {upcomingInterviews.length > 0 ? (
            <div className="mt-3 space-y-3">
              {upcomingInterviews.slice(0, 3).map((interview) => (
                <div key={interview.id} className="flex items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {interview.candidateName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {formatDate(interview.date)} • {interview.interviewType}
                    </p>
                  </div>
                </div>
              ))}
              
              {upcomingInterviews.length > 3 && (
                <div className="text-center pt-2">
                  <button className="text-xs text-purple-600 hover:text-purple-800">
                    View all ({upcomingInterviews.length}) interviews
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">No upcoming interviews scheduled.</p>
          )}
        </div>
        
        {/* Statistics */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Interview Statistics</h3>
          <div className="mt-3 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Interviews</span>
              <span className="text-sm font-medium">{mockInterviews.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Scheduled</span>
              <span className="text-sm font-medium">{mockInterviews.filter(i => i.status === 'Scheduled').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Completed</span>
              <span className="text-sm font-medium">{mockInterviews.filter(i => i.status === 'Completed').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Canceled</span>
              <span className="text-sm font-medium">{mockInterviews.filter(i => i.status === 'Canceled').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">This Week</span>
              <span className="text-sm font-medium">
                {mockInterviews.filter(interview => {
                  const interviewDate = new Date(interview.date);
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
                  startOfWeek.setHours(0, 0, 0, 0);
                  
                  const endOfWeek = new Date(startOfWeek);
                  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
                  endOfWeek.setHours(23, 59, 59, 999);
                  
                  return interviewDate >= startOfWeek && interviewDate <= endOfWeek;
                }).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewsPage;
