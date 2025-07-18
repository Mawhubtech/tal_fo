import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Globe, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Eye,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Building,
  ArrowLeft,
  X,
  Briefcase,
  Linkedin,
  Search
} from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';

interface OrganizationJobBoard {
  id: string;
  jobBoardId: string;
  jobBoardName: string;
  jobBoardUrl: string;
  isActive: boolean;
  organizationId: string;
  departmentId?: string; // Optional for department-specific boards
  assignedRecruiters: string[]; // Array of recruiter IDs
  credentials: {
    isConfigured: boolean;
    configuredBy: string;
    configuredAt: string;
  };
  posting: {
    autoPost: boolean;
    requireApproval: boolean;
    defaultTemplate?: string;
  };
  analytics: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    lastSync: string;
    syncFrequency: string;
  };
  responses: {
    totalResponses: number;
    responseRate: number;
    avgTimeToResponse: number; // in hours
    qualityScore: number; // 1-5 rating
  };
}

interface RecruiterJobBoardAccess {
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
  jobBoards: {
    jobBoardId: string;
    canPost: boolean;
    canViewResponses: boolean;
    canManageCredentials: boolean;
    assignedAt: string;
    assignedBy: string;
  }[];
  performance: {
    totalPostings: number;
    totalResponses: number;
    responseRate: number;
    avgQualityScore: number;
  };
}

// Available job board platforms for integration
const availableJobBoards = [
  {
    id: 'linkedin',
    name: 'LinkedIn Jobs',
    icon: Linkedin,
    url: 'https://linkedin.com/jobs',
    description: 'Post jobs to LinkedIn and reach over 800 million professionals',
    requiredFields: ['clientId', 'clientSecret', 'companyId'],
    optionalFields: ['redirectUri'],
    popular: true,
  },
  {
    id: 'indeed',
    name: 'Indeed',
    icon: Briefcase,
    url: 'https://indeed.com',
    description: 'Connect with Indeed to post jobs and receive applications',
    requiredFields: ['apiKey', 'employerId'],
    optionalFields: ['publisherId'],
    popular: true,
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    icon: Globe,
    url: 'https://glassdoor.com',
    description: 'Post jobs on Glassdoor and reach quality candidates',
    requiredFields: ['partnerKey', 'employerId'],
    optionalFields: [],
    popular: false,
  },
];

// Type definition for the form data when adding a job board
interface JobBoardFormData {
  jobBoardId: string;
  organizationId: string;
  credentials: Record<string, string>;
  isActive: boolean;
  posting: {
    autoPost: boolean;
    requireApproval: boolean;
    defaultTemplate?: string;
  };
}

const OrganizationJobBoardsPage: React.FC = () => {
  const { organizationId } = useParams();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'boards' | 'recruiters' | 'analytics'>('boards');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedJobBoard, setSelectedJobBoard] = useState<string | null>(null);
  const [jobBoardFormData, setJobBoardFormData] = useState<JobBoardFormData>({
    jobBoardId: '',
    organizationId: organizationId || '',
    credentials: {},
    isActive: true,
    posting: {
      autoPost: false,
      requireApproval: true,
      defaultTemplate: '',
    },
  });
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Mock data - in real implementation, these would come from APIs
  const mockJobBoards: OrganizationJobBoard[] = [
    {
      id: '1',
      jobBoardId: 'indeed',
      jobBoardName: 'Indeed',
      jobBoardUrl: 'https://indeed.com',
      isActive: true,
      organizationId: organizationId || '',
      assignedRecruiters: ['recruiter-1', 'recruiter-2'],
      credentials: {
        isConfigured: true,
        configuredBy: 'admin-user',
        configuredAt: '2024-01-15T10:30:00Z'
      },
      posting: {
        autoPost: false,
        requireApproval: true,
        defaultTemplate: 'template-1'
      },
      analytics: {
        totalJobs: 25,
        activeJobs: 15,
        totalApplications: 340,
        lastSync: '2024-01-22T10:30:00Z',
        syncFrequency: 'Daily'
      },
      responses: {
        totalResponses: 89,
        responseRate: 26.2,
        avgTimeToResponse: 18,
        qualityScore: 4.2
      }
    },
    {
      id: '2',
      jobBoardId: 'linkedin',
      jobBoardName: 'LinkedIn Jobs',
      jobBoardUrl: 'https://linkedin.com/jobs',
      isActive: true,
      organizationId: organizationId || '',
      assignedRecruiters: ['recruiter-1', 'recruiter-3'],
      credentials: {
        isConfigured: true,
        configuredBy: 'admin-user',
        configuredAt: '2024-01-10T14:20:00Z'
      },
      posting: {
        autoPost: true,
        requireApproval: false,
        defaultTemplate: 'template-2'
      },
      analytics: {
        totalJobs: 18,
        activeJobs: 12,
        totalApplications: 456,
        lastSync: '2024-01-22T09:15:00Z',
        syncFrequency: 'Real-time'
      },
      responses: {
        totalResponses: 134,
        responseRate: 29.4,
        avgTimeToResponse: 12,
        qualityScore: 4.5
      }
    },
    {
      id: '3',
      jobBoardId: 'glassdoor',
      jobBoardName: 'Glassdoor',
      jobBoardUrl: 'https://glassdoor.com',
      isActive: false,
      organizationId: organizationId || '',
      assignedRecruiters: [],
      credentials: {
        isConfigured: false,
        configuredBy: '',
        configuredAt: ''
      },
      posting: {
        autoPost: false,
        requireApproval: true
      },
      analytics: {
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        lastSync: '',
        syncFrequency: 'Weekly'
      },
      responses: {
        totalResponses: 0,
        responseRate: 0,
        avgTimeToResponse: 0,
        qualityScore: 0
      }
    }
  ];

  const mockRecruiters: RecruiterJobBoardAccess[] = [
    {
      recruiterId: 'recruiter-1',
      recruiterName: 'Sarah Johnson',
      recruiterEmail: 'sarah.johnson@company.com',
      jobBoards: [
        {
          jobBoardId: 'indeed',
          canPost: true,
          canViewResponses: true,
          canManageCredentials: false,
          assignedAt: '2024-01-15T10:30:00Z',
          assignedBy: 'admin-user'
        },
        {
          jobBoardId: 'linkedin',
          canPost: true,
          canViewResponses: true,
          canManageCredentials: true,
          assignedAt: '2024-01-10T14:20:00Z',
          assignedBy: 'admin-user'
        }
      ],
      performance: {
        totalPostings: 15,
        totalResponses: 98,
        responseRate: 28.5,
        avgQualityScore: 4.3
      }
    },
    {
      recruiterId: 'recruiter-2',
      recruiterName: 'Mike Chen',
      recruiterEmail: 'mike.chen@company.com',
      jobBoards: [
        {
          jobBoardId: 'indeed',
          canPost: true,
          canViewResponses: true,
          canManageCredentials: false,
          assignedAt: '2024-01-18T09:15:00Z',
          assignedBy: 'admin-user'
        }
      ],
      performance: {
        totalPostings: 8,
        totalResponses: 34,
        responseRate: 22.1,
        avgQualityScore: 3.9
      }
    }
  ];

  const formatLastSync = (timestamp: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (isActive: boolean, isConfigured: boolean) => {
    if (!isConfigured) return 'bg-yellow-100 text-yellow-800';
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (isActive: boolean, isConfigured: boolean) => {
    if (!isConfigured) return 'Setup Required';
    return isActive ? 'Active' : 'Inactive';
  };

  const activeJobBoards = mockJobBoards.filter(board => board.isActive);
  const totalJobs = activeJobBoards.reduce((sum, board) => sum + board.analytics.totalJobs, 0);
  const totalApplications = activeJobBoards.reduce((sum, board) => sum + board.analytics.totalApplications, 0);
  const avgResponseRate = activeJobBoards.length > 0 
    ? activeJobBoards.reduce((sum, board) => sum + board.responses.responseRate, 0) / activeJobBoards.length 
    : 0;
    
  // Filter available job boards based on search term
  const filteredJobBoards = availableJobBoards.filter(board => 
    board.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    board.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle job board selection
  const handleJobBoardSelect = (boardId: string) => {
    setSelectedJobBoard(boardId);
    const selectedBoard = availableJobBoards.find(board => board.id === boardId);
    
    // Initialize credentials object with empty values for all required fields
    if (selectedBoard) {
      const credentials: Record<string, string> = {};
      [...selectedBoard.requiredFields, ...selectedBoard.optionalFields].forEach(field => {
        credentials[field] = '';
      });
      
      setJobBoardFormData({
        ...jobBoardFormData,
        jobBoardId: boardId,
        credentials,
      });
    }
  };
  
  // Handle input changes for job board credentials
  const handleCredentialChange = (field: string, value: string) => {
    setJobBoardFormData({
      ...jobBoardFormData,
      credentials: {
        ...jobBoardFormData.credentials,
        [field]: value
      }
    });
  };
  
  // Handle posting settings changes
  const handlePostingChange = (field: keyof typeof jobBoardFormData.posting, value: boolean | string) => {
    setJobBoardFormData({
      ...jobBoardFormData,
      posting: {
        ...jobBoardFormData.posting,
        [field]: value
      }
    });
  };
  
  // Handle job board connection submission
  const handleConnectJobBoard = () => {
    // In a real implementation, this would make an API call to save the connection
    console.log("Connecting job board with data:", jobBoardFormData);
    
    // Simulate successful connection
    const selectedBoard = availableJobBoards.find(board => board.id === selectedJobBoard);
    if (selectedBoard) {
      const newJobBoard: OrganizationJobBoard = {
        id: `new-${Date.now()}`,
        jobBoardId: selectedBoard.id,
        jobBoardName: selectedBoard.name,
        jobBoardUrl: selectedBoard.url,
        isActive: jobBoardFormData.isActive,
        organizationId: organizationId || '',
        assignedRecruiters: [],
        credentials: {
          isConfigured: true,
          configuredBy: user?.id || '',
          configuredAt: new Date().toISOString()
        },
        posting: jobBoardFormData.posting,
        analytics: {
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          lastSync: '',
          syncFrequency: 'Daily'
        },
        responses: {
          totalResponses: 0,
          responseRate: 0,
          avgTimeToResponse: 0,
          qualityScore: 0
        }
      };
      
      // Here you would update the job boards list with the new board
      // For now, we'll just close the modal
      setIsAddModalOpen(false);
      setSelectedJobBoard(null);
      // Reset form data
      setJobBoardFormData({
        jobBoardId: '',
        organizationId: organizationId || '',
        credentials: {},
        isActive: true,
        posting: {
          autoPost: false,
          requireApproval: true,
          defaultTemplate: '',
        },
      });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/dashboard/organizations" className="hover:text-gray-700">Organizations</Link>
        <span className="mx-2">/</span>
        <Link to={`/dashboard/organizations/${organizationId}`} className="hover:text-gray-700">
          Organization
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Job Boards</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            to={`/dashboard/organizations/${organizationId}`}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Board Management</h1>
            <p className="text-gray-600 mt-1">Configure job boards and manage recruiter access for this organization</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Job Board
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">{mockJobBoards.length}</div>
          <div className="text-sm text-gray-600">Total Job Boards</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{activeJobBoards.length}</div>
          <div className="text-sm text-gray-600">Active Boards</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{totalJobs}</div>
          <div className="text-sm text-gray-600">Posted Jobs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{avgResponseRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Avg Response Rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'boards'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('boards')}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            Job Boards
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recruiters'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('recruiters')}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Recruiter Access
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Analytics
          </button>
        </nav>
      </div>

      {/* Job Boards Tab */}
      {activeTab === 'boards' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Organization Job Boards</h2>
              <p className="text-sm text-gray-600 mt-1">Configure and manage job board integrations for this organization</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Board
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Recruiters
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Sync
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockJobBoards.map((board) => (
                    <tr key={board.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Globe className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{board.jobBoardName}</div>
                            <div className="text-sm text-gray-500">{board.jobBoardUrl}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(board.isActive, board.credentials.isConfigured)}`}>
                            {getStatusText(board.isActive, board.credentials.isConfigured)}
                          </span>
                          {board.posting.autoPost && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              Auto-Post
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{board.assignedRecruiters.length} recruiters</div>
                        <div className="text-sm text-gray-500">
                          {board.assignedRecruiters.length > 0 ? 'Active assignments' : 'No assignments'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {board.analytics.totalJobs} jobs • {board.responses.responseRate.toFixed(1)}% response rate
                        </div>
                        <div className="text-sm text-gray-500">
                          Quality: {board.responses.qualityScore.toFixed(1)}/5.0
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatLastSync(board.analytics.lastSync)}</div>
                        <div className="text-sm text-gray-500">{board.analytics.syncFrequency}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-purple-600 hover:text-purple-900">
                            <Settings className="h-4 w-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit3 className="h-4 w-4" />
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

      {/* Recruiters Tab */}
      {activeTab === 'recruiters' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recruiter Job Board Access</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage which recruiters can access specific job boards</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Access
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {mockRecruiters.map((recruiter) => (
                  <div key={recruiter.recruiterId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{recruiter.recruiterName}</div>
                          <div className="text-sm text-gray-500">{recruiter.recruiterEmail}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {recruiter.performance.responseRate.toFixed(1)}% response rate
                        </div>
                        <div className="text-sm text-gray-500">
                          {recruiter.performance.totalPostings} postings • Quality: {recruiter.performance.avgQualityScore.toFixed(1)}/5
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recruiter.jobBoards.map((access) => {
                        const jobBoard = mockJobBoards.find(board => board.jobBoardId === access.jobBoardId);
                        return (
                          <div key={access.jobBoardId} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium text-gray-900">
                                {jobBoard?.jobBoardName || access.jobBoardId}
                              </div>
                              <button className="text-gray-400 hover:text-gray-600">
                                <Settings className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Can Post:</span>
                                {access.canPost ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                )}
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">View Responses:</span>
                                {access.canViewResponses ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                )}
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Manage Credentials:</span>
                                {access.canManageCredentials ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                )}
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Assigned: {new Date(access.assignedAt).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Board Performance */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Board Performance</h3>
              <div className="space-y-4">
                {activeJobBoards.map((board) => (
                  <div key={board.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-gray-900">{board.jobBoardName}</div>
                      <div className="text-sm text-gray-500">{board.responses.responseRate.toFixed(1)}%</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Total Jobs</div>
                        <div className="font-medium">{board.analytics.totalJobs}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Applications</div>
                        <div className="font-medium">{board.analytics.totalApplications}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Responses</div>
                        <div className="font-medium">{board.responses.totalResponses}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Quality Score</div>
                        <div className="font-medium">{board.responses.qualityScore.toFixed(1)}/5</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Tracking */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Tracking</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {activeJobBoards.reduce((sum, board) => sum + board.responses.totalResponses, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Responses</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {avgResponseRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Response Rate</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Recent Response Activity</h4>
                  <div className="space-y-2">
                    {activeJobBoards.map((board) => (
                      <div key={board.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{board.jobBoardName}</div>
                          <div className="text-xs text-gray-500">
                            Avg response time: {board.responses.avgTimeToResponse}h
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{board.responses.totalResponses}</div>
                          <div className="text-xs text-gray-500">responses</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Job Board Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Connect Job Board</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedJobBoard(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Job Board Selection */}
            {!selectedJobBoard ? (
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Connect your organization to job board platforms to post jobs and receive applications.
                  </p>
                  
                  {/* Search */}
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search job boards..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {/* Popular Job Boards */}
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Job Boards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {filteredJobBoards
                      .filter(board => board.popular)
                      .map(board => (
                        <div
                          key={board.id}
                          onClick={() => handleJobBoardSelect(board.id)}
                          className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center mb-2">
                            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                              <board.icon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{board.name}</h4>
                              <span className="text-sm text-gray-500">{board.url}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{board.description}</p>
                        </div>
                      ))}
                  </div>
                  
                  {/* Other Job Boards */}
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Other Job Boards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredJobBoards
                      .filter(board => !board.popular)
                      .map(board => (
                        <div
                          key={board.id}
                          onClick={() => handleJobBoardSelect(board.id)}
                          className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center mb-2">
                            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                              <board.icon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{board.name}</h4>
                              <span className="text-sm text-gray-500">{board.url}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{board.description}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                {/* Job Board Configuration */}
                {(() => {
                  const selectedBoard = availableJobBoards.find(board => board.id === selectedJobBoard);
                  if (!selectedBoard) return null;
                  
                  return (
                    <div>
                      <div className="flex items-center mb-6">
                        <button
                          onClick={() => setSelectedJobBoard(null)}
                          className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <selectedBoard.icon className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{selectedBoard.name}</h3>
                            <span className="text-sm text-gray-500">{selectedBoard.url}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* API Credentials */}
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">API Credentials</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          {selectedBoard.id === 'linkedin' 
                            ? 'Enter your LinkedIn Developer credentials to connect. You can find these in your LinkedIn Developer Console.'
                            : `Enter your ${selectedBoard.name} API credentials to connect.`
                          }
                        </p>
                        
                        <div className="space-y-4">
                          {selectedBoard.requiredFields.map(field => (
                            <div key={field}>
                              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('key') ? 'password' : 'text'}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={jobBoardFormData.credentials[field] || ''}
                                onChange={e => handleCredentialChange(field, e.target.value)}
                                required
                              />
                            </div>
                          ))}
                          
                          {selectedBoard.optionalFields.map(field => (
                            <div key={field}>
                              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} (Optional)
                              </label>
                              <input
                                type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('key') ? 'password' : 'text'}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={jobBoardFormData.credentials[field] || ''}
                                onChange={e => handleCredentialChange(field, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Posting Settings */}
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Posting Settings</h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Active Status</label>
                              <p className="text-xs text-gray-500">Enable or disable this job board connection</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setJobBoardFormData({
                                ...jobBoardFormData,
                                isActive: !jobBoardFormData.isActive
                              })}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                jobBoardFormData.isActive ? 'bg-purple-600' : 'bg-gray-200'
                              }`}
                            >
                              <span className="sr-only">Use setting</span>
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  jobBoardFormData.isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              ></span>
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Auto-Post Jobs</label>
                              <p className="text-xs text-gray-500">Automatically post jobs to this board when created</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePostingChange('autoPost', !jobBoardFormData.posting.autoPost)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                jobBoardFormData.posting.autoPost ? 'bg-purple-600' : 'bg-gray-200'
                              }`}
                            >
                              <span className="sr-only">Use setting</span>
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  jobBoardFormData.posting.autoPost ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              ></span>
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Require Approval</label>
                              <p className="text-xs text-gray-500">Require admin approval before posting jobs</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePostingChange('requireApproval', !jobBoardFormData.posting.requireApproval)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                jobBoardFormData.posting.requireApproval ? 'bg-purple-600' : 'bg-gray-200'
                              }`}
                            >
                              <span className="sr-only">Use setting</span>
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  jobBoardFormData.posting.requireApproval ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              ></span>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                          onClick={() => {
                            setIsAddModalOpen(false);
                            setSelectedJobBoard(null);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleConnectJobBoard}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          disabled={selectedBoard.requiredFields.some(field => !jobBoardFormData.credentials[field])}
                        >
                          Connect {selectedBoard.name}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationJobBoardsPage;
