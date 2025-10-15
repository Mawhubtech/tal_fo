import React, { useState, useEffect } from 'react';
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
import { useJobBoardConnections, useAvailableJobBoards, useCreateJobBoardConnection, useDeleteJobBoardConnection, useUpdateJobBoardConnection } from '../../../hooks/useJobBoards';
import { JobBoard } from '../../../services/jobBoardApiService';

// Helper function to get display data for job boards
const getJobBoardDisplayData = (board: JobBoard) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    linkedin: Linkedin,
    indeed: Briefcase,
    glassdoor: Building,
    monster: Building,
    ziprecruiter: Briefcase,
    careerbuilder: Building,
    dice: Building,
    stackoverflow: Building,
    angellist: Building,
    behance: Building,
  };

  return {
    icon: iconMap[board.type] || Globe,
    name: board.metadata.name,
    url: board.metadata.website,
    description: board.metadata.description,
    popular: ['linkedin', 'indeed', 'glassdoor'].includes(board.type), // Define popular boards
    requiredFields: board.metadata.requiredFields,
    optionalFields: board.metadata.optionalFields,
  };
};

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

// Note: Job boards are now fetched from the API using useAvailableJobBoards hook

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

  // Use actual API data instead of mock data
  const { data: jobBoardConnections, isLoading: connectionsLoading, error: connectionsError } = useJobBoardConnections(organizationId || '');
  const { data: availableJobBoards, isLoading: availableLoading, error: availableError } = useAvailableJobBoards();
  const createConnectionMutation = useCreateJobBoardConnection();
  const updateConnectionMutation = useUpdateJobBoardConnection();
  const deleteConnectionMutation = useDeleteJobBoardConnection();

  // Handle body scroll and ESC key for modal
  useEffect(() => {
    if (isAddModalOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add ESC key handler
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsAddModalOpen(false);
          setSelectedJobBoard(null);
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        // Restore body scroll when modal closes
        document.body.style.overflow = 'unset';
      };
    }
  }, [isAddModalOpen]);

  // Transform API data to match component interface
  const mockJobBoards: OrganizationJobBoard[] = (jobBoardConnections?.data || []).map(connection => ({
    id: connection.id,
    jobBoardId: connection.jobBoardId,
    jobBoardName: connection.jobBoardType, // Use type as name fallback
    jobBoardUrl: '#', // TODO: Get from job board metadata when available
    isActive: connection.status === 'active',
    organizationId: connection.clientId,
    assignedRecruiters: [], // TODO: Add recruiter assignments from backend
    credentials: {
      isConfigured: connection.status !== 'pending_verification',
      configuredBy: 'system', // TODO: Get actual configured by user
      configuredAt: connection.createdAt
    },
    posting: {
      autoPost: connection.postingSettings?.autoPost || false,
      requireApproval: connection.postingSettings?.requireApproval || true,
      defaultTemplate: connection.postingSettings?.defaultTemplate || ''
    },
    analytics: {
      totalJobs: connection.analyticsData?.totalJobs || 0,
      activeJobs: connection.analyticsData?.activeJobs || 0,
      totalApplications: connection.analyticsData?.totalApplications || 0,
      lastSync: connection.lastSyncAt || connection.updatedAt,
      syncFrequency: 'Manual' // TODO: Add sync frequency to backend
    },
    responses: {
      totalResponses: connection.analyticsData?.totalApplications || 0,
      responseRate: 0, // TODO: Calculate from analytics data
      avgTimeToResponse: 0, // TODO: Calculate from analytics data
      qualityScore: 0 // TODO: Calculate from analytics data
    }
  }));

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
  const filteredJobBoards = (availableJobBoards?.data || []).filter(board => {
    const displayData = getJobBoardDisplayData(board);
    return displayData.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           displayData.description.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Handle job board selection
  const handleJobBoardSelect = (boardId: string) => {
    setSelectedJobBoard(boardId);
    const selectedBoard = (availableJobBoards?.data || []).find(board => board.id === boardId);
    
    // Initialize credentials object with empty values for all required fields
    if (selectedBoard) {
      const credentials: Record<string, string> = {};
      [...(selectedBoard.metadata.requiredFields || []), ...(selectedBoard.metadata.optionalFields || [])].forEach(field => {
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
  const handleConnectJobBoard = async () => {
    if (!selectedJobBoard || !organizationId) return;

    const selectedBoard = (availableJobBoards?.data || []).find(board => board.id === selectedJobBoard);
    if (!selectedBoard) return;

    try {
      const connectionData = {
        jobBoardType: selectedBoard.type,
        clientId: organizationId,
        credentials: jobBoardFormData.credentials,
        postingSettings: {
          autoPost: jobBoardFormData.posting.autoPost,
          requireApproval: jobBoardFormData.posting.requireApproval,
          defaultTemplate: jobBoardFormData.posting.defaultTemplate,
        }
      };

      await createConnectionMutation.mutateAsync(connectionData);
      
      // Reset form and close modal
      setIsAddModalOpen(false);
      setSelectedJobBoard(null);
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
    } catch (error) {
      console.error('Failed to connect job board:', error);
      // TODO: Show error message to user
    }
  };

  // Handle toggling job board active status
  const handleToggleJobBoard = async (connectionId: string, currentStatus: boolean) => {
    try {
      await updateConnectionMutation.mutateAsync({
        id: connectionId,
        data: {
          isActive: !currentStatus
        }
      });
    } catch (error) {
      console.error('Failed to toggle job board status:', error);
    }
  };

  // Handle deleting job board connection
  const handleDeleteJobBoard = async (connectionId: string) => {
    if (!window.confirm('Are you sure you want to disconnect this job board? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteConnectionMutation.mutateAsync(connectionId);
    } catch (error) {
      console.error('Failed to delete job board connection:', error);
    }
  };

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsAddModalOpen(false);
      setSelectedJobBoard(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/my-jobs" className="hover:text-gray-700">Jobs</Link>
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
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm"
            disabled={createConnectionMutation.isPending}
          >
            {createConnectionMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {mockJobBoards.length === 0 ? 'Connect Job Board' : 'Add Job Board'}
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {(connectionsLoading || availableLoading) && (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading job board data...</div>
        </div>
      )}

      {(connectionsError || availableError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">
              Error loading job board data. Please try again.
            </span>
          </div>
        </div>
      )}

      {/* Show mutation loading states */}
      {(createConnectionMutation.isPending || updateConnectionMutation.isPending || deleteConnectionMutation.isPending) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-700">
              Updating job board connection...
            </span>
          </div>
        </div>
      )}

      {/* Show mutation error states */}
      {(createConnectionMutation.error || updateConnectionMutation.error || deleteConnectionMutation.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">
              Failed to update job board connection. Please try again.
            </span>
          </div>
        </div>
      )}

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
              {mockJobBoards.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Globe className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Job Boards Connected</h3>
                  <p className="text-gray-500 mb-6">Connect to job boards to start posting jobs and receiving applications.</p>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Connect Your First Job Board
                  </button>
                </div>
              ) : (
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
                          {/* Toggle Active/Inactive */}
                          <button 
                            onClick={() => handleToggleJobBoard(board.id, board.isActive)}
                            className={`p-1 rounded ${
                              board.isActive 
                                ? 'text-green-600 hover:text-green-900 hover:bg-green-50' 
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                            title={board.isActive ? 'Disable job board' : 'Enable job board'}
                          >
                            {board.isActive ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                          
                          {/* Settings/Edit */}
                          <button 
                            className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                            title="Edit job board settings"
                            onClick={() => {
                              // TODO: Open edit modal
                              console.log('Edit job board:', board.id);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                          
                          {/* View Details */}
                          <button 
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View job board details"
                            onClick={() => {
                              // TODO: Open details modal
                              console.log('View job board details:', board.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {/* Delete */}
                          <button 
                            onClick={() => handleDeleteJobBoard(board.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Disconnect job board"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleOverlayClick}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Connect Job Board</h2>
                {!availableLoading && !availableError && (
                  <p className="text-sm text-gray-500 mt-1">
                    {(availableJobBoards?.data || []).length} job boards available
                  </p>
                )}
              </div>
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
                {/* Loading state for job boards */}
                {availableLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-600">Loading job boards...</span>
                  </div>
                )}

                {/* Error state for job boards */}
                {availableError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-red-700">
                          Failed to load job boards. Please try again.
                        </span>
                      </div>
                      <button
                        onClick={() => window.location.reload()}
                        className="text-red-600 hover:text-red-700 text-sm underline"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}

                {/* Job boards content */}
                {!availableLoading && !availableError && (
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

                  {/* Show message if no job boards available */}
                  {filteredJobBoards.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-500 mb-2">
                        {searchTerm ? 'No job boards match your search.' : 'No job boards available.'}
                      </div>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="text-purple-600 hover:text-purple-700 text-sm"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )}

                  {/* Popular Job Boards */}
                  {filteredJobBoards.filter(board => getJobBoardDisplayData(board).popular).length > 0 && (
                    <>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Job Boards</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {filteredJobBoards
                      .filter(board => getJobBoardDisplayData(board).popular)
                      .map(board => {
                        const displayData = getJobBoardDisplayData(board);
                        const IconComponent = displayData.icon;
                        return (
                        <div
                          key={board.id}
                          onClick={() => handleJobBoardSelect(board.id)}
                          className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center mb-2">
                            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                              <IconComponent className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{displayData.name}</h4>
                              <span className="text-sm text-gray-500">{displayData.url}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{displayData.description}</p>
                        </div>
                        );
                      })}
                  </div>
                  
                  {/* Other Job Boards */}
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Other Job Boards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredJobBoards
                      .filter(board => !getJobBoardDisplayData(board).popular)
                      .map(board => {
                        const displayData = getJobBoardDisplayData(board);
                        const IconComponent = displayData.icon;
                        return (
                        <div
                          key={board.id}
                          onClick={() => handleJobBoardSelect(board.id)}
                          className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center mb-2">
                            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                              <IconComponent className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{displayData.name}</h4>
                              <span className="text-sm text-gray-500">{displayData.url}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{displayData.description}</p>
                        </div>
                        );
                      })}
                  </div>
                  </>
                  )}
                </div>
                )}
              </div>
            ) : (
              <div className="p-6">
                {/* Job Board Configuration */}
                {(() => {
                  const selectedBoard = (availableJobBoards?.data || []).find(board => board.id === selectedJobBoard);
                  if (!selectedBoard) return null;
                  
                  const selectedDisplayData = getJobBoardDisplayData(selectedBoard);
                  const SelectedIconComponent = selectedDisplayData.icon;
                  
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
                            <SelectedIconComponent className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{selectedDisplayData.name}</h3>
                            <span className="text-sm text-gray-500">{selectedDisplayData.url}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* API Credentials */}
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">API Credentials</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          {selectedBoard.id === 'linkedin' 
                            ? 'Enter your LinkedIn Developer credentials to connect. You can find these in your LinkedIn Developer Console.'
                            : `Enter your ${selectedDisplayData.name} API credentials to connect.`
                          }
                        </p>
                        
                        <div className="space-y-4">
                          {selectedDisplayData.requiredFields.map(field => (
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
                          
                          {selectedDisplayData.optionalFields.map(field => (
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
                          disabled={selectedDisplayData.requiredFields.some(field => !jobBoardFormData.credentials[field])}
                        >
                          Connect {selectedDisplayData.name}
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
