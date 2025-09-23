import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Save, Globe, Eye, Settings, Plus, Edit3, Trash2, AlertCircle, CheckCircle, XCircle, RefreshCw, ExternalLink, Monitor, ToggleLeft, ToggleRight } from 'lucide-react';
import { jobBoardApiService, type JobBoard } from '../../services/jobBoardApiService';
import { useAvailableJobBoards } from '../../hooks/useJobBoards';

interface JobBoardStats {
  totalBoards: number;
  activeBoards: number;
  availableBoards: number;
  setupRequired: number;
}

const JobBoardConfigPage: React.FC = () => {
  const { data: jobBoardsResponse, isLoading, error, refetch } = useAvailableJobBoards();
  const [activeTab, setActiveTab] = useState<'boards' | 'analytics' | 'settings'>('boards');
  const [selectedBoard, setSelectedBoard] = useState<JobBoard | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'inactive'>('all');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const jobBoards = jobBoardsResponse?.data || [];

  // Filter job boards based on view mode
  const filteredJobBoards = jobBoards.filter(board => {
    switch (viewMode) {
      case 'active':
        return board.isAvailable;
      case 'inactive':
        return !board.isAvailable;
      default:
        return true;
    }
  });

  const getJobBoardStats = (): JobBoardStats => {
    if (!jobBoards.length) {
      return { totalBoards: 0, activeBoards: 0, availableBoards: 0, setupRequired: 0 };
    }

    return {
      totalBoards: jobBoards.length,
      activeBoards: jobBoards.filter(board => board.status === 'active').length,
      availableBoards: jobBoards.filter(board => board.isAvailable).length,
      setupRequired: jobBoards.filter(board => board.status === 'setup_required').length
    };
  };

  const stats = getJobBoardStats();

  // Handle body scroll and ESC key for modals
  useEffect(() => {
    if (isViewModalOpen || isEditModalOpen || isAddModalOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Add ESC key handler
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsViewModalOpen(false);
          setIsEditModalOpen(false);
          setIsAddModalOpen(false);
          setSelectedBoard(null);
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        // Restore body scroll when modal closes
        document.body.style.overflow = 'unset';
      };
    }
  }, [isViewModalOpen, isEditModalOpen, isAddModalOpen]);

  const getStatusIcon = (status: JobBoard['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-5 w-5 text-gray-400" />;
      case 'setup_required':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: JobBoard['status']) => {
    const baseClass = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'active':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClass} bg-gray-100 text-gray-800`;
      case 'setup_required':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'error':
        return `${baseClass} bg-red-100 text-red-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  const handleEditBoard = (board: JobBoard) => {
    setSelectedBoard(board);
    setIsEditModalOpen(true);
  };

  const handleViewBoard = (board: JobBoard) => {
    setSelectedBoard(board);
    setIsViewModalOpen(true);
  };

  const handleAddBoard = () => {
    setSelectedBoard(null);
    setIsAddModalOpen(true);
  };

  const handleToggleActive = async (board: JobBoard) => {
    try {
      // TODO: Add API method to update job board availability
      console.log('Toggle board availability:', board.id, !board.isAvailable);
      // For now, just refresh to see if there are changes
      refetch();
    } catch (error) {
      console.error('Failed to toggle job board status:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  // Handle overlay click for modals
  const handleViewModalOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsViewModalOpen(false);
      setSelectedBoard(null);
    }
  };

  const handleEditModalOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsEditModalOpen(false);
      setSelectedBoard(null);
    }
  };

  const handleAddModalOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsAddModalOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading job boards...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load job boards</h3>
            <p className="text-gray-600 mb-4">There was an error loading the job board configuration.</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link to="/dashboard/admin" className="hover:text-gray-700">Admin</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Job Board Management</span>
        </div>
        <button
          onClick={handleRefresh}
          className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4 inline mr-1" />
          Refresh
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Board Management</h1>
        <p className="text-gray-600 mt-1">Manage and configure job board integrations across the platform</p>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-900">{stats.totalBoards}</div>
            <div className="text-sm text-gray-600">Total Job Boards</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{stats.activeBoards}</div>
            <div className="text-sm text-gray-600">Active Boards</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-primary-600">{stats.availableBoards}</div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">{stats.setupRequired}</div>
            <div className="text-sm text-gray-600">Setup Required</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'boards'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('boards')}
            >
              Job Boards
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              Global Settings
            </button>
          </nav>
        </div>

        {/* Job Boards Tab */}
        {activeTab === 'boards' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">System Job Board Integrations</h2>
                <div className="text-sm text-gray-500">
                  Configure which job boards are available for client connections
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* View Mode Filter */}
                <div className="flex rounded-lg border border-gray-300">
                  <button
                    onClick={() => setViewMode('all')}
                    className={`px-3 py-1 text-sm font-medium rounded-l-lg ${
                      viewMode === 'all'
                        ? 'bg-primary-100 text-primary-700 border-primary-300'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All ({jobBoards.length})
                  </button>
                  <button
                    onClick={() => setViewMode('active')}
                    className={`px-3 py-1 text-sm font-medium border-l ${
                      viewMode === 'active'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Active ({jobBoards.filter(b => b.isAvailable).length})
                  </button>
                  <button
                    onClick={() => setViewMode('inactive')}
                    className={`px-3 py-1 text-sm font-medium rounded-r-lg border-l ${
                      viewMode === 'inactive'
                        ? 'bg-gray-100 text-gray-700 border-gray-300'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Inactive ({jobBoards.filter(b => !b.isAvailable).length})
                  </button>
                </div>
                
                <button
                  onClick={handleAddBoard}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job Board
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
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
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Features
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredJobBoards.map((board) => (
                      <tr key={board.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Globe className="h-6 w-6 text-primary-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{board.metadata.name}</div>
                              <div className="text-sm text-gray-500">{board.metadata.website}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(board.status)}
                            <span className={getStatusBadge(board.status)}>
                              {board.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <button
                              onClick={() => handleToggleActive(board)}
                              className="flex items-center text-xs"
                              title={board.isAvailable ? 'Click to make inactive' : 'Click to make active'}
                            >
                              {board.isAvailable ? (
                                <>
                                  <ToggleRight className="h-4 w-4 text-green-500 mr-1" />
                                  <span className="text-green-600">Available for clients</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="h-4 w-4 text-gray-400 mr-1" />
                                  <span className="text-gray-500">Not available</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 capitalize">{board.type}</div>
                          <div className="text-sm text-gray-500">Order: {board.sortOrder}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {board.metadata.supportedFeatures.autoPost && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Auto Post
                              </span>
                            )}
                            {board.metadata.supportedFeatures.applicationTracking && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Tracking
                              </span>
                            )}
                            {board.metadata.supportedFeatures.analytics && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Analytics
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(board.updatedAt)}</div>
                          <div className="text-sm text-gray-500">Created: {formatDate(board.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewBoard(board)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditBoard(board)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Edit board"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <a
                              href={board.metadata.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-gray-600"
                              title="Visit website"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Monitor className="h-12 w-12 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Total Connections</div>
                </div>
                <div className="text-center">
                  <Globe className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Jobs Posted</div>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Active Integrations</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Job Board Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Sync Frequency
                  </label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                    <option>Real-time</option>
                    <option>Every 15 minutes</option>
                    <option>Hourly</option>
                    <option>Daily</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Connections Per Client
                  </label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto-enable"
                    defaultChecked
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto-enable" className="ml-2 block text-sm text-gray-900">
                    Auto-enable new job boards for all clients
                  </label>
                </div>
              </div>
              <div className="mt-6">
                <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Job Board Modal */}
      {isViewModalOpen && selectedBoard && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={handleViewModalOverlayClick}
        >
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Job Board Details</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBoard.metadata.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedBoard.type}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBoard.metadata.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <a href={selectedBoard.metadata.website} target="_blank" rel="noopener noreferrer" 
                   className="mt-1 text-sm text-primary-600 hover:text-primary-800">
                  {selectedBoard.metadata.website}
                </a>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1 flex items-center space-x-2">
                  {getStatusIcon(selectedBoard.status)}
                  <span className={getStatusBadge(selectedBoard.status)}>
                    {selectedBoard.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Supported Features</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedBoard.metadata.supportedFeatures.autoPost && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Auto Post
                    </span>
                  )}
                  {selectedBoard.metadata.supportedFeatures.applicationTracking && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Application Tracking
                    </span>
                  )}
                  {selectedBoard.metadata.supportedFeatures.analytics && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Analytics
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedBoard.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedBoard.updatedAt)}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Board Modal */}
      {isEditModalOpen && selectedBoard && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={handleEditModalOverlayClick}
        >
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Job Board</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    defaultValue={selectedBoard.metadata.name}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    defaultValue={selectedBoard.type}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="indeed">Indeed</option>
                    <option value="glassdoor">Glassdoor</option>
                    <option value="monster">Monster</option>
                    <option value="ziprecruiter">ZipRecruiter</option>
                    <option value="dice">Dice</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  defaultValue={selectedBoard.metadata.description}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Website URL</label>
                <input
                  type="url"
                  defaultValue={selectedBoard.metadata.website}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                <input
                  type="number"
                  defaultValue={selectedBoard.sortOrder}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supported Features</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={selectedBoard.metadata.supportedFeatures.autoPost}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Auto Post</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={selectedBoard.metadata.supportedFeatures.applicationTracking}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Application Tracking</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={selectedBoard.metadata.supportedFeatures.analytics}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Analytics</span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  defaultChecked={selectedBoard.isAvailable}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                  Available for client connections
                </label>
              </div>
            </form>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement save functionality
                  console.log('Save job board changes');
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Job Board Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={handleAddModalOverlayClick}
        >
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Job Board</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., LinkedIn Jobs"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type *</label>
                  <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Select a type</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="indeed">Indeed</option>
                    <option value="glassdoor">Glassdoor</option>
                    <option value="monster">Monster</option>
                    <option value="ziprecruiter">ZipRecruiter</option>
                    <option value="dice">Dice</option>
                    <option value="careerbuilder">CareerBuilder</option>
                    <option value="stackoverflow">Stack Overflow</option>
                    <option value="angellist">AngelList</option>
                    <option value="behance">Behance</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe this job board and its target audience..."
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Website URL *</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                <input
                  type="number"
                  defaultValue={jobBoards.length + 1}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supported Features</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Auto Post</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Application Tracking</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Analytics</span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newIsAvailable"
                  defaultChecked={true}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="newIsAvailable" className="ml-2 text-sm text-gray-700">
                  Available for client connections
                </label>
              </div>
            </form>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement add functionality
                  console.log('Add new job board');
                  setIsAddModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Add Job Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoardConfigPage;
