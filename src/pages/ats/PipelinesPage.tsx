import React, { useState } from 'react';
import { Search, Filter, ChevronDown, Plus, MoreHorizontal, Clock, Tag, CalendarClock, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for candidates
const mockCandidates = [
  { 
    id: '1', 
    name: 'Sarah Johnson', 
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg', 
    role: 'Senior Software Engineer', 
    jobId: '101',
    stage: 'Sourced', 
    tags: ['Urgent', 'React', 'Backend'], 
    lastUpdated: '2025-05-31T14:30:00', 
    score: 95,
    job: 'Senior Software Engineer - Frontend'
  },
  { 
    id: '2', 
    name: 'Michael Chen', 
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg', 
    role: 'Product Manager', 
    jobId: '102',
    stage: 'Applied', 
    tags: ['PM Experience', 'Strong Fit'], 
    lastUpdated: '2025-05-30T09:15:00', 
    score: 89,
    job: 'Product Manager - Mobile Apps'
  },
  { 
    id: '3', 
    name: 'Jessica Taylor', 
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg', 
    role: 'UX Designer', 
    jobId: '103',
    stage: 'Phone Screen', 
    tags: ['Creative', 'UI/UX'], 
    lastUpdated: '2025-05-29T16:45:00', 
    score: 92,
    job: 'Senior UX Designer'
  },
  { 
    id: '4', 
    name: 'David Rodriguez', 
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg', 
    role: 'DevOps Engineer', 
    jobId: '104',
    stage: 'Interview', 
    tags: ['AWS', 'Kubernetes'], 
    lastUpdated: '2025-05-28T11:20:00', 
    score: 88,
    job: 'DevOps Engineer - Cloud Infrastructure'
  },
  { 
    id: '5', 
    name: 'Emma Wilson', 
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg', 
    role: 'Marketing Manager', 
    jobId: '105',
    stage: 'Offer', 
    tags: ['Growth', 'Digital Marketing'], 
    lastUpdated: '2025-05-27T15:10:00', 
    score: 94,
    job: 'Marketing Manager - Growth'
  },
  { 
    id: '6', 
    name: 'James Brown', 
    avatar: 'https://randomuser.me/api/portraits/men/15.jpg', 
    role: 'Data Scientist', 
    jobId: '106',
    stage: 'Hired', 
    tags: ['Machine Learning', 'Python'], 
    lastUpdated: '2025-05-26T10:05:00', 
    score: 96,
    job: 'Senior Data Scientist'
  },
  { 
    id: '7', 
    name: 'Olivia Parker', 
    avatar: 'https://randomuser.me/api/portraits/women/35.jpg', 
    role: 'Frontend Developer', 
    jobId: '101',
    stage: 'Applied', 
    tags: ['React', 'Vue'], 
    lastUpdated: '2025-05-25T14:40:00', 
    score: 85,
    job: 'Senior Software Engineer - Frontend'
  },
  { 
    id: '8', 
    name: 'Daniel Lee', 
    avatar: 'https://randomuser.me/api/portraits/men/43.jpg', 
    role: 'Project Manager', 
    jobId: '107',
    stage: 'Rejected', 
    tags: ['Agile', 'Scrum'], 
    lastUpdated: '2025-05-24T09:30:00', 
    score: 75,
    job: 'Technical Project Manager'
  },
  { 
    id: '9', 
    name: 'Sophia Martinez', 
    avatar: 'https://randomuser.me/api/portraits/women/26.jpg', 
    role: 'Backend Developer', 
    jobId: '108',
    stage: 'Phone Screen', 
    tags: ['Node.js', 'MongoDB'], 
    lastUpdated: '2025-05-23T16:55:00', 
    score: 91,
    job: 'Backend Developer - Node.js'
  },
  { 
    id: '10', 
    name: 'Ethan Thompson', 
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg', 
    role: 'Product Designer', 
    jobId: '109',
    stage: 'Sourced', 
    tags: ['Figma', 'User Research'], 
    lastUpdated: '2025-05-22T11:25:00', 
    score: 87,
    job: 'Lead Product Designer'
  }
];

// Mock data for jobs
const mockJobs = [
  { id: '101', title: 'Senior Software Engineer - Frontend' },
  { id: '102', title: 'Product Manager - Mobile Apps' },
  { id: '103', title: 'Senior UX Designer' },
  { id: '104', title: 'DevOps Engineer - Cloud Infrastructure' },
  { id: '105', title: 'Marketing Manager - Growth' },
  { id: '106', title: 'Senior Data Scientist' },
  { id: '107', title: 'Technical Project Manager' },
  { id: '108', title: 'Backend Developer - Node.js' },
  { id: '109', title: 'Lead Product Designer' }
];

// Mock data for recruiters
const mockRecruiters = [
  { id: '201', name: 'Alex Johnson' },
  { id: '202', name: 'Maria Garcia' },
  { id: '203', name: 'Ryan Miller' },
  { id: '204', name: 'Priya Patel' }
];

const stages = ['Sourced', 'Applied', 'Phone Screen', 'Interview', 'Offer', 'Hired', 'Rejected'];

const PipelinesPage: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  
  // Function to get candidates by stage
  const getCandidatesByStage = (stage: string) => {
    return mockCandidates
      .filter(candidate => {
        // Filter by job if selected
        if (selectedJob && candidate.jobId !== selectedJob) return false;
        
        // Filter by search query
        if (searchQuery && !candidate.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        
        return candidate.stage === stage;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        } else {
          return b.score - a.score;
        }
      });
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/dashboard/ats" className="hover:text-gray-700">ATS</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Pipelines</span>
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Candidate Pipelines</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center transition-colors">
          <Plus size={18} className="mr-1" />
          Add Candidate
        </button>
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
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Job Filter */}
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <option value="">All Jobs</option>
              {mockJobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
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
          
          {/* Sort By */}
          <div>
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
            >
              <option value="date">Sort by Date Updated</option>
              <option value="score">Sort by Score</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4 mb-6 overflow-x-auto min-h-[calc(100vh-280px)]">
        {stages.map((stage) => (
          <div key={stage} className="bg-white rounded-lg shadow-sm min-w-[280px]">
            {/* Stage Header */}
            <div className={`px-4 py-3 border-t-4 rounded-t-lg flex justify-between items-center ${
              stage === 'Sourced' ? 'border-blue-500' :
              stage === 'Applied' ? 'border-indigo-500' :
              stage === 'Phone Screen' ? 'border-purple-500' :
              stage === 'Interview' ? 'border-pink-500' :
              stage === 'Offer' ? 'border-orange-500' :
              stage === 'Hired' ? 'border-green-500' :
              'border-red-500' // Rejected
            }`}>
              <div>
                <h2 className="font-semibold text-gray-800">{stage}</h2>
                <p className="text-xs text-gray-500">{getCandidatesByStage(stage).length} candidates</p>
              </div>
              
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={16} />
              </button>
            </div>
            
            {/* Candidates in this stage */}
            <div className="p-2 overflow-y-auto max-h-[calc(100vh-350px)]">
              {getCandidatesByStage(stage).map((candidate) => (
                <div key={candidate.id} className="bg-white border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-md transition-shadow cursor-pointer">
                  {/* Candidate Info */}
                  <div className="flex items-center mb-2">
                    <img src={candidate.avatar} alt={candidate.name} className="w-8 h-8 rounded-full mr-2" />
                    <div>
                      <h3 className="font-medium text-sm text-gray-800">{candidate.name}</h3>
                      <p className="text-xs text-gray-500">{candidate.job}</p>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {candidate.tags.map((tag, index) => (
                      <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Last Updated */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <div className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      {formatDate(candidate.lastUpdated)}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded" title="Add Note">
                        <Edit size={14} className="text-gray-400 hover:text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Schedule Interview">
                        <CalendarClock size={14} className="text-gray-400 hover:text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Add Tag">
                        <Tag size={14} className="text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Empty state */}
              {getCandidatesByStage(stage).length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400">
                  <p className="text-sm">No candidates in this stage</p>
                  <button className="mt-2 text-xs text-purple-600 hover:text-purple-800 flex items-center">
                    <Plus size={12} className="mr-1" />
                    Add candidate
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelinesPage;
