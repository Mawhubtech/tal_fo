import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Mail, Tag, ChevronDown, Calendar, Star, ArrowDownUp, CheckCircle, XCircle, CalendarClock, FileText, Eye, Edit, Trash2 } from 'lucide-react';

// Mock data for candidates (reusing and extending from PipelinesPage)
const mockCandidates = [
  { 
    id: '1', 
    name: 'Sarah Johnson', 
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg', 
    role: 'Senior Software Engineer', 
    jobId: '101',
    job: 'Senior Software Engineer - Frontend',
    email: 'sarah.johnson@example.com',
    phone: '(555) 123-4567',
    stage: 'Sourced', 
    tags: ['Urgent', 'React', 'Backend'], 
    lastUpdated: '2025-05-31T14:30:00',
    lastAction: 'Profile viewed',
    score: 4.8,
    recruiter: 'Alex Johnson',
    source: 'LinkedIn'
  },
  { 
    id: '2', 
    name: 'Michael Chen', 
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg', 
    role: 'Product Manager', 
    jobId: '102',
    job: 'Product Manager - Mobile Apps',
    email: 'michael.chen@example.com',
    phone: '(555) 987-6543',
    stage: 'Applied', 
    tags: ['PM Experience', 'Strong Fit'], 
    lastUpdated: '2025-05-30T09:15:00',
    lastAction: 'Application submitted',
    score: 4.5,
    recruiter: 'Maria Garcia',
    source: 'Indeed'
  },
  { 
    id: '3', 
    name: 'Jessica Taylor', 
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg', 
    role: 'UX Designer', 
    jobId: '103',
    job: 'Senior UX Designer',
    email: 'jessica.taylor@example.com',
    phone: '(555) 456-7890',
    stage: 'Phone Screen', 
    tags: ['Creative', 'UI/UX'], 
    lastUpdated: '2025-05-29T16:45:00',
    lastAction: 'Phone screen scheduled',
    score: 4.7,
    recruiter: 'Ryan Miller',
    source: 'Referral'
  },
  { 
    id: '4', 
    name: 'David Rodriguez', 
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg', 
    role: 'DevOps Engineer', 
    jobId: '104',
    job: 'DevOps Engineer - Cloud Infrastructure',
    email: 'david.rodriguez@example.com',
    phone: '(555) 234-5678',
    stage: 'Interview', 
    tags: ['AWS', 'Kubernetes'], 
    lastUpdated: '2025-05-28T11:20:00',
    lastAction: 'Technical interview completed',
    score: 4.4,
    recruiter: 'Priya Patel',
    source: 'Career Page'
  },
  { 
    id: '5', 
    name: 'Emma Wilson', 
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg', 
    role: 'Marketing Manager', 
    jobId: '105',
    job: 'Marketing Manager - Growth',
    email: 'emma.wilson@example.com',
    phone: '(555) 876-5432',
    stage: 'Offer', 
    tags: ['Growth', 'Digital Marketing'], 
    lastUpdated: '2025-05-27T15:10:00',
    lastAction: 'Offer sent',
    score: 4.9,
    recruiter: 'Alex Johnson',
    source: 'LinkedIn'
  },
  { 
    id: '6', 
    name: 'James Brown', 
    avatar: 'https://randomuser.me/api/portraits/men/15.jpg', 
    role: 'Data Scientist', 
    jobId: '106',
    job: 'Senior Data Scientist',
    email: 'james.brown@example.com',
    phone: '(555) 345-6789',
    stage: 'Hired', 
    tags: ['Machine Learning', 'Python'], 
    lastUpdated: '2025-05-26T10:05:00',
    lastAction: 'Offer accepted',
    score: 5.0,
    recruiter: 'Maria Garcia',
    source: 'Indeed'
  },
  { 
    id: '7', 
    name: 'Olivia Parker', 
    avatar: 'https://randomuser.me/api/portraits/women/35.jpg', 
    role: 'Frontend Developer', 
    jobId: '101',
    job: 'Senior Software Engineer - Frontend',
    email: 'olivia.parker@example.com',
    phone: '(555) 789-0123',
    stage: 'Applied', 
    tags: ['React', 'Vue'], 
    lastUpdated: '2025-05-25T14:40:00',
    lastAction: 'Resume reviewed',
    score: 4.3,
    recruiter: 'Ryan Miller',
    source: 'AngelList'
  },
  { 
    id: '8', 
    name: 'Daniel Lee', 
    avatar: 'https://randomuser.me/api/portraits/men/43.jpg', 
    role: 'Project Manager', 
    jobId: '107',
    job: 'Technical Project Manager',
    email: 'daniel.lee@example.com',
    phone: '(555) 567-8901',
    stage: 'Rejected', 
    tags: ['Agile', 'Scrum'], 
    lastUpdated: '2025-05-24T09:30:00',
    lastAction: 'Rejected after interview',
    score: 3.8,
    recruiter: 'Priya Patel',
    source: 'Career Page'
  },
  { 
    id: '9', 
    name: 'Sophia Martinez', 
    avatar: 'https://randomuser.me/api/portraits/women/26.jpg', 
    role: 'Backend Developer', 
    jobId: '108',
    job: 'Backend Developer - Node.js',
    email: 'sophia.martinez@example.com',
    phone: '(555) 890-1234',
    stage: 'Phone Screen', 
    tags: ['Node.js', 'MongoDB'], 
    lastUpdated: '2025-05-23T16:55:00',
    lastAction: 'Phone screen completed',
    score: 4.6,
    recruiter: 'Alex Johnson',
    source: 'Referral'
  },
  { 
    id: '10', 
    name: 'Ethan Thompson', 
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg', 
    role: 'Product Designer', 
    jobId: '109',
    job: 'Lead Product Designer',
    email: 'ethan.thompson@example.com',
    phone: '(555) 678-9012',
    stage: 'Sourced', 
    tags: ['Figma', 'User Research'], 
    lastUpdated: '2025-05-22T11:25:00',
    lastAction: 'Initial outreach sent',
    score: 4.2,
    recruiter: 'Maria Garcia',
    source: 'Dribbble'
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

const stages = ['All Stages', 'Sourced', 'Applied', 'Phone Screen', 'Interview', 'Offer', 'Hired', 'Rejected'];
const sources = ['All Sources', 'LinkedIn', 'Indeed', 'Career Page', 'Referral', 'AngelList', 'Dribbble', 'Other'];
const tags = ['All Tags', 'React', 'Vue', 'Node.js', 'MongoDB', 'AWS', 'Kubernetes', 'UI/UX', 'Figma', 'Python', 'Machine Learning', 'Agile', 'Scrum', 'Growth', 'Digital Marketing', 'PM Experience', 'Strong Fit', 'Urgent', 'Creative', 'User Research'];

const AllCandidatesPage: React.FC = () => {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('All Stages');
  const [selectedTag, setSelectedTag] = useState<string>('All Tags');
  const [selectedSource, setSelectedSource] = useState<string>('All Sources');
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter candidates based on search and filters
  const filteredCandidates = mockCandidates.filter(candidate => {
    // Search by name or email
    if (searchQuery && !candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !candidate.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by job
    if (selectedJob && candidate.jobId !== selectedJob) {
      return false;
    }
    
    // Filter by stage
    if (selectedStage !== 'All Stages' && candidate.stage !== selectedStage) {
      return false;
    }
    
    // Filter by tag
    if (selectedTag !== 'All Tags' && !candidate.tags.includes(selectedTag)) {
      return false;
    }
    
    // Filter by source
    if (selectedSource !== 'All Sources' && candidate.source !== selectedSource) {
      return false;
    }
    
    // Filter by recruiter
    if (selectedRecruiter && candidate.recruiter !== mockRecruiters.find(r => r.id === selectedRecruiter)?.name) {
      return false;
    }
    
    // Filter by rating
    if (minRating > 0 && candidate.score < minRating) {
      return false;
    }
    
    return true;
  });
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Function to toggle select all candidates
  const toggleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map(candidate => candidate.id));
    }
  };
  
  // Function to toggle select a single candidate
  const toggleSelectCandidate = (id: string) => {
    if (selectedCandidates.includes(id)) {
      setSelectedCandidates(selectedCandidates.filter(candidateId => candidateId !== id));
    } else {
      setSelectedCandidates([...selectedCandidates, id]);
    }
  };
  
  // Function to render star rating
  const renderStarRating = (score: number) => {
    const roundedScore = Math.round(score);
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < roundedScore ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{score.toFixed(1)}</span>
      </div>
    );
  };
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/dashboard/ats" className="hover:text-gray-700">ATS</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">All Candidates</span>
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Candidates</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center transition-colors">
          <Plus size={18} className="mr-1" />
          Add Candidate
        </button>
      </div>
      
      {/* Search and Basic Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Job Filter */}
          <div className="md:w-64">
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
          
          {/* Stage Filter */}
          <div className="md:w-48">
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          
          {/* Show More Filters */}
          <button
            className="flex items-center text-purple-600 hover:text-purple-800 font-medium"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="mr-1" />
            {showFilters ? 'Hide Filters' : 'More Filters'}
            <ChevronDown size={16} className={`ml-1 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Tag</label>
              <select
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                {tags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            
            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Source</label>
              <select
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
              >
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            
            {/* Recruiter Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Recruiter</label>
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
            
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
              <select
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
              >
                <option value="0">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
            
            {/* Date Range Filter - not fully implemented */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  className="flex-1 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
                <span className="flex items-center text-gray-500">to</span>
                <input
                  type="date"
                  className="flex-1 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
            </div>
            
            {/* Reset Filters */}
            <div className="md:col-span-2 flex items-end">
              <button
                className="text-purple-600 hover:text-purple-800 font-medium"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedJob('');
                  setSelectedStage('All Stages');
                  setSelectedTag('All Tags');
                  setSelectedSource('All Sources');
                  setSelectedRecruiter('');
                  setDateRange({ start: '', end: '' });
                  setMinRating(0);
                }}
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Bulk Actions (visible when candidates are selected) */}
      {selectedCandidates.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg mb-4 flex items-center justify-between">
          <div className="text-sm text-purple-800">
            <span className="font-medium">{selectedCandidates.length}</span> candidates selected
          </div>
          <div className="flex space-x-3">
            <button className="text-sm text-purple-700 hover:text-purple-900 flex items-center">
              <Mail size={16} className="mr-1" />
              Email
            </button>
            <button className="text-sm text-purple-700 hover:text-purple-900 flex items-center">
              <Tag size={16} className="mr-1" />
              Add Tags
            </button>
            <button className="text-sm text-purple-700 hover:text-purple-900 flex items-center">
              <ArrowDownUp size={16} className="mr-1" />
              Move Stage
            </button>
            <button className="text-sm text-red-600 hover:text-red-800 flex items-center">
              <XCircle size={16} className="mr-1" />
              Reject
            </button>
          </div>
        </div>
      )}
        {/* Candidates Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                    checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                    onChange={toggleSelectAll}
                  />
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied Job
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Action
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recruiter
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => toggleSelectCandidate(candidate.id)}
                    />
                  </td><td className="px-4 py-4">
                    <div className="flex items-center">
                      <img src={candidate.avatar} alt={candidate.name} className="h-10 w-10 rounded-full mr-3 flex-shrink-0" />
                      <div className="truncate max-w-[150px]">
                        <div className="text-sm font-medium text-gray-900 truncate">{candidate.name}</div>
                        <div className="text-xs text-gray-500 truncate">{candidate.source}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-[180px]">{candidate.job}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {candidate.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {candidate.tags.length > 2 && (
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                          +{candidate.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-[150px]">{candidate.email}</div>
                    <div className="text-sm text-gray-500">{candidate.phone}</div>
                  </td>                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      candidate.stage === 'Sourced' ? 'bg-blue-100 text-blue-800' :
                      candidate.stage === 'Applied' ? 'bg-indigo-100 text-indigo-800' :
                      candidate.stage === 'Phone Screen' ? 'bg-purple-100 text-purple-800' :
                      candidate.stage === 'Interview' ? 'bg-pink-100 text-pink-800' :
                      candidate.stage === 'Offer' ? 'bg-orange-100 text-orange-800' :
                      candidate.stage === 'Hired' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800' // Rejected
                    }`}>
                      {candidate.stage}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {renderStarRating(candidate.score)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-[150px]">{candidate.lastAction}</div>
                    <div className="text-xs text-gray-500">{formatDate(candidate.lastUpdated)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-[100px]">{candidate.recruiter}</div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-gray-400 hover:text-gray-600" title="View Profile">
                        <Eye size={18} />
                      </button>
                      <button className="text-gray-400 hover:text-blue-600" title="Send Email">
                        <Mail size={18} />
                      </button>
                      <button className="text-gray-400 hover:text-purple-600" title="Schedule Interview">
                        <CalendarClock size={18} />
                      </button>
                      <button className="text-gray-400 hover:text-yellow-600" title="View Resume">
                        <FileText size={18} />
                      </button>
                      <button className="text-gray-400 hover:text-indigo-600" title="Edit">
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center">
                  <div className="text-gray-500">
                    <p className="mb-2">No candidates found matching your filters.</p>
                    <button className="text-purple-600 hover:text-purple-800 flex items-center mx-auto">
                      <Plus size={16} className="mr-1" />
                      Add a new candidate
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination - can be implemented later */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow-sm">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCandidates.length}</span> of{" "}
              <span className="font-medium">{filteredCandidates.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronDown className="h-5 w-5 rotate-90" aria-hidden="true" />
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                1
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                2
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <ChevronDown className="h-5 w-5 -rotate-90" aria-hidden="true" />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCandidatesPage;
