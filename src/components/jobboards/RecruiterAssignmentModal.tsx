import React, { useState } from 'react';
import { X, Users, Shield, Plus, Trash2, Search, Filter, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useRecruiterJobBoardAccess, useAssignRecruiterToJobBoard, useRemoveRecruiterJobBoardAccess } from '../../hooks/useJobBoards';
import type { RecruiterJobBoardAccess } from '../../services/jobBoardApiService';

// Extended type for display purposes
interface RecruiterJobBoardAccessWithDetails extends RecruiterJobBoardAccess {
  recruiter: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  status: 'active' | 'pending' | 'inactive';
  budgetUsed?: number;
  budgetLimit?: number;
  postingsCount: number;
  postingLimit?: number;
  responsesCount: number;
  lastActivity?: string;
}

interface RecruiterAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  jobBoardId: string;
  jobBoardName: string;
}

const RecruiterAssignmentModal: React.FC<RecruiterAssignmentModalProps> = ({
  isOpen,
  onClose,
  organizationId,
  jobBoardId,
  jobBoardName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    recruiterId: '',
    permissions: {
      canPost: true,
      canViewResponses: true,
      canManageCredentials: false,
      canViewAnalytics: false,
      canManageBudget: false
    },
    budgetLimit: '',
    postingLimit: ''
  });

  // Mock data - in real implementation, this would be populated from API
  const [assignments, setAssignments] = useState<RecruiterJobBoardAccessWithDetails[]>([]);
  const isLoading = false;
  const refetch = () => Promise.resolve();

  const assignRecruiter = useAssignRecruiterToJobBoard();
  const removeRecruiter = useRemoveRecruiterJobBoardAccess();

  // Mock recruiter data - in real implementation, this would come from a useRecruiters hook
  const availableRecruiters = [
    { id: '1', name: 'John Smith', email: 'john@company.com', role: 'Senior Recruiter' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Recruiter' },
    { id: '3', name: 'Mike Wilson', email: 'mike@company.com', role: 'Junior Recruiter' },
    { id: '4', name: 'Emily Davis', email: 'emily@company.com', role: 'Lead Recruiter' }
  ];

  const getStatusIcon = (status: RecruiterJobBoardAccessWithDetails['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: RecruiterJobBoardAccessWithDetails['status']) => {
    const classes = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${classes[status]}`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.recruiter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.recruiter.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const assignedRecruiterIds = new Set(assignments.map(a => a.recruiter.id));
  const unassignedRecruiters = availableRecruiters.filter(r => !assignedRecruiterIds.has(r.id));

  const handleAssignRecruiter = async () => {
    if (!newAssignment.recruiterId) return;

    try {
      await assignRecruiter.mutateAsync({
        organizationId,
        organizationJobBoardId: jobBoardId,
        recruiterId: newAssignment.recruiterId,
        permissions: newAssignment.permissions
      });

      setNewAssignment({
        recruiterId: '',
        permissions: {
          canPost: true,
          canViewResponses: true,
          canManageCredentials: false,
          canViewAnalytics: false,
          canManageBudget: false
        },
        budgetLimit: '',
        postingLimit: ''
      });
      setShowAddForm(false);
      refetch();
    } catch (error) {
      console.error('Failed to assign recruiter:', error);
    }
  };

  const handleRemoveRecruiter = async (accessId: string) => {
    if (!confirm('Are you sure you want to remove this recruiter\'s access to this job board?')) return;

    try {
      await removeRecruiter.mutateAsync(accessId);
      refetch();
    } catch (error) {
      console.error('Failed to remove recruiter:', error);
    }
  };

  const handlePermissionChange = (permission: keyof typeof newAssignment.permissions, value: boolean) => {
    setNewAssignment(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-purple-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recruiter Access</h2>
              <p className="text-sm text-gray-500">{jobBoardName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recruiters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                />
              </div>
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              disabled={unassignedRecruiters.length === 0}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Recruiter
            </button>
          </div>

          {/* Add Recruiter Form */}
          {showAddForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assign New Recruiter</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Recruiter
                    </label>
                    <select
                      value={newAssignment.recruiterId}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, recruiterId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    >
                      <option value="">Choose a recruiter...</option>
                      {unassignedRecruiters.map(recruiter => (
                        <option key={recruiter.id} value={recruiter.id}>
                          {recruiter.name} - {recruiter.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Budget Limit ($)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        value={newAssignment.budgetLimit}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, budgetLimit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Posting Limit
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={newAssignment.postingLimit}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, postingLimit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Permissions
                  </label>
                  <div className="space-y-3">
                    {Object.entries(newAssignment.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 capitalize">
                          {key.replace(/can/g, '').replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <button
                          onClick={() => handlePermissionChange(key as any, !value)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            value ? 'bg-purple-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignRecruiter}
                  disabled={!newAssignment.recruiterId || assignRecruiter.isPending}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Assign Recruiter
                </button>
              </div>
            </div>
          )}

          {/* Assignments List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading assignments...</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recruiters assigned to this job board</p>
              </div>
            ) : (
              filteredAssignments.map(assignment => (
                <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium">
                          {assignment.recruiter.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900">
                            {assignment.recruiter.name}
                          </h3>
                          <span className="ml-2">{getStatusBadge(assignment.status)}</span>
                        </div>
                        <p className="text-sm text-gray-500">{assignment.recruiter.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveRecruiter(assignment.id)}
                      disabled={removeRecruiter.isPending}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Budget Used:</span>
                      <div className="font-medium">
                        ${assignment.budgetUsed?.toLocaleString() || 0} / ${assignment.budgetLimit?.toLocaleString() || '∞'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Posts:</span>
                      <div className="font-medium">
                        {assignment.postingsCount} / {assignment.postingLimit || '∞'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Responses:</span>
                      <div className="font-medium">{assignment.responsesCount}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Activity:</span>
                      <div className="font-medium">
                        {assignment.lastActivity ? new Date(assignment.lastActivity).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(assignment.permissions).map(([key, value]) => {
                      if (!value) return null;
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecruiterAssignmentModal;
