import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Upload, Edit3, Eye, Trash2, MapPin, Calendar, DollarSign, Star, Loader } from 'lucide-react';
import { candidateApiService, type Candidate } from '../services/candidateApiService';

const CandidateProfilesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');

  // Edit and delete states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load candidates
  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await candidateApiService.getAllCandidates();
      setCandidates(response.candidates);
    } catch (err) {
      setError('Failed to load candidates. Please try again.');
      console.error('Error loading candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for CRUD operations
  const handleEditCandidate = (candidate: Candidate) => {
    // Navigate to edit candidate page or open edit modal
    console.log('Edit candidate:', candidate.id);
    // TODO: Implement edit functionality
  };

  const handleDeleteCandidate = (candidate: Candidate) => {
    setCandidateToDelete(candidate);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!candidateToDelete) return;

    setDeleteLoading(true);
    try {
      await candidateApiService.deleteCandidate(candidateToDelete.id);
      // Remove candidate from local state
      setCandidates(prev => prev.filter(candidate => candidate.id !== candidateToDelete.id));
      setShowDeleteDialog(false);
      setCandidateToDelete(null);
    } catch (error) {
      console.error('Error deleting candidate:', error);
      setError('Failed to delete candidate. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setCandidateToDelete(null);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'hired':
        return 'bg-primary-100 text-primary-800';
      case 'interviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (candidate.currentPosition && candidate.currentPosition.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (candidate.skills && candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    const matchesPosition = positionFilter === 'all' || (candidate.currentPosition && candidate.currentPosition.includes(positionFilter));
    
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const stats = {
    total: candidates.length,
    active: candidates.filter(c => c.status === 'active').length,
    interviewing: candidates.filter(c => c.status === 'interviewing').length,
    hired: candidates.filter(c => c.status === 'hired').length,
    rejected: candidates.filter(c => c.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader className="h-6 w-6 animate-spin" />
          <span>Loading candidates...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button
            onClick={loadCandidates}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, position, or skills..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="interviewing">Interviewing</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="all">All Positions</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Manager">Manager</option>
              <option value="Engineer">Engineer</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Candidates</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{stats.interviewing}</div>
          <div className="text-sm text-gray-600">Interviewing</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-primary-600">{stats.hired}</div>
          <div className="text-sm text-gray-600">Hired</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>      {/* Candidates Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position & Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location & Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{candidate.fullName}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                      <div className="text-sm text-gray-500">{candidate.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{candidate.currentPosition || 'Not specified'}</div>
                      <div className="text-sm text-gray-500">{candidate.experience?.length ? `${candidate.experience.length} roles` : 'No experience listed'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 mr-1" />
                        {candidate.location || 'Not specified'}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {candidate.salaryExpectation || 'Not specified'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(candidate.status)}`}>
                        {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                      </span>
                      <div className="flex items-center">
                        {renderStarRating(candidate.rating)}
                        <span className="ml-2 text-sm text-gray-600">({candidate.rating})</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {candidate.skills && candidate.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills && candidate.skills.length > 3 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{candidate.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1" />
                        {candidate.appliedDate ? new Date(candidate.appliedDate).toLocaleDateString() : new Date(candidate.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last: {candidate.lastActivity ? new Date(candidate.lastActivity).toLocaleDateString() : new Date(candidate.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-primary-600 hover:text-primary-900"
                        title="View candidate details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditCandidate(candidate)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit candidate"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCandidate(candidate)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete candidate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {filteredCandidates.length} of {candidates.length} candidates
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 bg-primary-700 text-white rounded">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && candidateToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{candidateToDelete.fullName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleDeleteCancel}
                className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                disabled={deleteLoading}
              >
                {deleteLoading && <Loader className="h-4 w-4 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateProfilesPage;
