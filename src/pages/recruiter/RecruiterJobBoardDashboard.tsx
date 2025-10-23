import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  TrendingUp, 
  Eye,
  Calendar,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Filter,
  Download
} from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

interface JobBoardResponse {
  id: string;
  jobId: string;
  jobTitle: string;
  jobBoardName: string;
  candidateName: string;
  candidateEmail: string;
  responseType: 'application' | 'inquiry' | 'referral';
  responseDate: string;
  responseQuality: number; // 1-5 rating
  status: 'new' | 'reviewed' | 'contacted' | 'rejected' | 'hired';
  recruiterNotes?: string;
  lastActionDate?: string;
  source: {
    jobBoardId: string;
    postingId: string;
    campaignId?: string;
  };
}

interface JobBoardPosting {
  id: string;
  jobId: string;
  jobTitle: string;
  jobBoardName: string;
  jobBoardId: string;
  status: 'active' | 'paused' | 'expired' | 'draft';
  postedDate: string;
  expiryDate: string;
  views: number;
  applications: number;
  responses: number;
  responseRate: number;
  budget?: {
    spent: number;
    total: number;
    currency: string;
  };
}

const RecruiterJobBoardDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'postings' | 'responses'>('overview');
  const [selectedJobBoard, setSelectedJobBoard] = useState<string>('all');
  const [responseFilter, setResponseFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('7d');

  // Mock data - would come from APIs in real implementation
  const mockPostings: JobBoardPosting[] = [
    {
      id: '1',
      jobId: 'job-1',
      jobTitle: 'Senior React Developer',
      jobBoardName: 'Indeed',
      jobBoardId: 'indeed',
      status: 'active',
      postedDate: '2024-01-15T10:30:00Z',
      expiryDate: '2024-02-15T10:30:00Z',
      views: 1250,
      applications: 87,
      responses: 23,
      responseRate: 26.4,
      budget: {
        spent: 245.50,
        total: 500,
        currency: 'USD'
      }
    },
    {
      id: '2',
      jobId: 'job-2',
      jobTitle: 'Product Manager',
      jobBoardName: 'LinkedIn Jobs',
      jobBoardId: 'linkedin',
      status: 'active',
      postedDate: '2024-01-18T14:20:00Z',
      expiryDate: '2024-02-18T14:20:00Z',
      views: 892,
      applications: 45,
      responses: 18,
      responseRate: 40.0,
      budget: {
        spent: 180.00,
        total: 300,
        currency: 'USD'
      }
    },
    {
      id: '3',
      jobId: 'job-3',
      jobTitle: 'UX Designer',
      jobBoardName: 'Glassdoor',
      jobBoardId: 'glassdoor',
      status: 'paused',
      postedDate: '2024-01-10T09:15:00Z',
      expiryDate: '2024-02-10T09:15:00Z',
      views: 456,
      applications: 12,
      responses: 3,
      responseRate: 25.0
    }
  ];

  const mockResponses: JobBoardResponse[] = [
    {
      id: '1',
      jobId: 'job-1',
      jobTitle: 'Senior React Developer',
      jobBoardName: 'Indeed',
      candidateName: 'Alex Johnson',
      candidateEmail: 'alex.johnson@email.com',
      responseType: 'application',
      responseDate: '2024-01-22T15:30:00Z',
      responseQuality: 4,
      status: 'new',
      source: {
        jobBoardId: 'indeed',
        postingId: '1'
      }
    },
    {
      id: '2',
      jobId: 'job-1',
      jobTitle: 'Senior React Developer',
      jobBoardName: 'Indeed',
      candidateName: 'Sarah Chen',
      candidateEmail: 'sarah.chen@email.com',
      responseType: 'application',
      responseDate: '2024-01-22T11:15:00Z',
      responseQuality: 5,
      status: 'reviewed',
      recruiterNotes: 'Strong React experience, good portfolio',
      lastActionDate: '2024-01-22T16:45:00Z',
      source: {
        jobBoardId: 'indeed',
        postingId: '1'
      }
    },
    {
      id: '3',
      jobId: 'job-2',
      jobTitle: 'Product Manager',
      jobBoardName: 'LinkedIn Jobs',
      candidateName: 'Michael Rodriguez',
      candidateEmail: 'michael.r@email.com',
      responseType: 'inquiry',
      responseDate: '2024-01-22T09:20:00Z',
      responseQuality: 3,
      status: 'contacted',
      recruiterNotes: 'Interested but needs more info about role',
      lastActionDate: '2024-01-22T14:30:00Z',
      source: {
        jobBoardId: 'linkedin',
        postingId: '2'
      }
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'paused': 'bg-yellow-100 text-yellow-800',
      'expired': 'bg-red-100 text-red-800',
      'draft': 'bg-gray-100 text-gray-800',
      'new': 'bg-blue-100 text-blue-800',
      'reviewed': 'bg-purple-100 text-purple-800',
      'contacted': 'bg-orange-100 text-orange-800',
      'rejected': 'bg-red-100 text-red-800',
      'hired': 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getResponseTypeIcon = (type: string) => {
    switch (type) {
      case 'application': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inquiry': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'referral': return <Star className="w-4 h-4 text-purple-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const totalViews = mockPostings.reduce((sum, posting) => sum + posting.views, 0);
  const totalApplications = mockPostings.reduce((sum, posting) => sum + posting.applications, 0);
  const totalResponses = mockPostings.reduce((sum, posting) => sum + posting.responses, 0);
  const avgResponseRate = mockPostings.length > 0 
    ? mockPostings.reduce((sum, posting) => sum + posting.responseRate, 0) / mockPostings.length 
    : 0;

  const filteredResponses = mockResponses.filter(response => {
    if (selectedJobBoard !== 'all' && response.source.jobBoardId !== selectedJobBoard) return false;
    if (responseFilter !== 'all' && response.status !== responseFilter) return false;
    return true;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/my-jobs" className="hover:text-gray-700">My Jobs</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Job Board Dashboard</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Board Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor your job postings and track responses across all job boards</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalApplications}</div>
              <div className="text-sm text-gray-600">Applications</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <MessageCircle className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalResponses}</div>
              <div className="text-sm text-gray-600">Responses</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{avgResponseRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Avg Response Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'postings'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('postings')}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            My Postings
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'responses'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('responses')}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Responses ({filteredResponses.length})
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {mockResponses.slice(0, 5).map((response) => (
                <div key={response.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getResponseTypeIcon(response.responseType)}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{response.candidateName}</div>
                    <div className="text-sm text-gray-500">
                      Applied to {response.jobTitle} via {response.jobBoardName}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{formatTimeAgo(response.responseDate)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Job Board</h3>
            <div className="space-y-4">
              {mockPostings.map((posting) => (
                <div key={posting.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{posting.jobBoardName}</div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(posting.status)}`}>
                      {posting.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Views</div>
                      <div className="font-medium">{posting.views}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Applications</div>
                      <div className="font-medium">{posting.applications}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Response Rate</div>
                      <div className="font-medium">{posting.responseRate.toFixed(1)}%</div>
                    </div>
                  </div>
                  {posting.budget && (
                    <div className="mt-2 text-sm">
                      <div className="text-gray-500">Budget: ${posting.budget.spent} / ${posting.budget.total}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(posting.budget.spent / posting.budget.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Postings Tab */}
      {activeTab === 'postings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">My Job Postings</h2>
                <div className="flex gap-2">
                  <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job / Board
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockPostings.map((posting) => (
                    <tr key={posting.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{posting.jobTitle}</div>
                          <div className="text-sm text-gray-500">{posting.jobBoardName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(posting.status)}`}>
                          {posting.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {posting.views} views • {posting.applications} applications
                        </div>
                        <div className="text-sm text-gray-500">
                          {posting.responseRate.toFixed(1)}% response rate
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {posting.budget ? (
                          <div className="text-sm">
                            <div className="text-gray-900">${posting.budget.spent} / ${posting.budget.total}</div>
                            <div className="text-gray-500">
                              {((posting.budget.spent / posting.budget.total) * 100).toFixed(0)}% used
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(posting.postedDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expires: {new Date(posting.expiryDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-purple-600 hover:text-purple-900">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Responses Tab */}
      {activeTab === 'responses' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              <select 
                value={selectedJobBoard} 
                onChange={(e) => setSelectedJobBoard(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              >
                <option value="all">All Job Boards</option>
                <option value="indeed">Indeed</option>
                <option value="linkedin">LinkedIn Jobs</option>
                <option value="glassdoor">Glassdoor</option>
              </select>
              <select 
                value={responseFilter} 
                onChange={(e) => setResponseFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="contacted">Contacted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Responses List */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Responses ({filteredResponses.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredResponses.map((response) => (
                <div key={response.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getResponseTypeIcon(response.responseType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">{response.candidateName}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(response.status)}`}>
                            {response.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{response.candidateEmail}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{response.responseType}</span> for{' '}
                            <span className="font-medium">{response.jobTitle}</span> via{' '}
                            <span className="font-medium">{response.jobBoardName}</span>
                          </p>
                          {response.recruiterNotes && (
                            <p className="text-sm text-gray-600 italic">{response.recruiterNotes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < response.responseQuality ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatTimeAgo(response.responseDate)}
                      </p>
                      {response.lastActionDate && (
                        <p className="text-xs text-gray-400">
                          Last action: {formatTimeAgo(response.lastActionDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterJobBoardDashboard;
