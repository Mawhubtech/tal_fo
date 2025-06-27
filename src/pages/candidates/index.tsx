import React, { useState, useEffect } from 'react';
import { Search, MapPin, Mail, Phone, Star, Download, Plus, Upload, MessageSquare, UserCheck, Eye, ChevronDown, FileText, Home, ChevronRight, SearchCheckIcon, CheckCircle, XCircle, Clock, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileSidePanel, { type PanelState, type UserStructuredData } from '../../components/ProfileSidePanel';
import AddCandidateModal from '../../components/AddCandidateModal';
import BulkImportModal from '../../components/BulkImportModal';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { CreateCandidateDto } from '../../types/candidate.types';
import { useCandidates, useCandidateStats, useUpdateCandidateStatus, useUpdateCandidateRating, useCreateCandidate, useUpdateCandidate, useDeleteCandidate } from '../../hooks/useCandidates';
import { useQueryClient } from '@tanstack/react-query';
import { getAvatarUrl } from '../../utils/fileUtils';

// Enhanced candidate interface with additional professional fields
interface EnhancedCandidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  location: string;
  currentPosition: string | null;
  salaryExpectation?: string | null;
  linkedIn?: string;
  github?: string;
  website?: string;
  avatar?: string | null;
  summary?: string | null;
  status: 'active' | 'inactive' | 'hired' | 'interviewing' | 'rejected';
  rating: string | number; // API returns rating as string
  appliedDate: string | null;
  lastActivity: string | null;
  source?: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  documents?: any[];
  experience?: any[];
  education?: any[];
  certifications?: any[];
  awards?: any[];
  projects?: any[];
  skillMappings?: any[]; // Original API field
  skills?: string[]; // Transformed field from the hook
}

const CandidatesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // State for the profile side panel
  const [selectedUserDataForPanel, setSelectedUserDataForPanel] = useState<UserStructuredData | null>(null);
  const [panelState, setPanelState] = useState<PanelState>('closed');
  // State for dropdown menus
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  // State for add candidate modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<EnhancedCandidate | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // State for bulk import modal
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    candidate: EnhancedCandidate | null;
  }>({ isOpen: false, candidate: null });

  // React Query hooks for data fetching
  const candidatesQuery = useCandidates({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    experienceLevel: experienceFilter !== 'all' ? experienceFilter : undefined,
  });

  const statsQuery = useCandidateStats();    // Mutations for data updates
  const updateStatusMutation = useUpdateCandidateStatus();
  const updateRatingMutation = useUpdateCandidateRating();
  const createCandidateMutation = useCreateCandidate();
  const updateCandidateMutation = useUpdateCandidate();
  const deleteCandidateMutation = useDeleteCandidate();
    // Use items instead of data.items for compatibility with the transformed response
  const candidates = Array.isArray(candidatesQuery.data?.items) ? candidatesQuery.data.items : [];
  const totalItems = candidatesQuery.data?.total || 0;
  const loading = candidatesQuery.isLoading;

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };    document.addEventListener('mousedown', handleClickOutside);
    return () => {      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);
  
  // Handlers for the profile side panel  
  const handleOpenProfilePanel = (userData: any) => {
    // Transform API response data to match the panel's expected structure
    // Note: The useCandidates hook already transforms skillMappings to skills
    const userDataForPanel = {
      personalInfo: {
        fullName: userData.fullName || (userData.firstName && userData.lastName ? 
          `${userData.firstName} ${userData.lastName}` : 'Unknown'),
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        linkedIn: userData.linkedIn || '',
        github: userData.github || '',
        website: userData.website || '',
        avatar: userData.avatar || undefined,
      },
      summary: userData.summary || '',     
	   experience: Array.isArray(userData.experience) 
        ? userData.experience.map((exp: any) => ({
            position: exp.position || '',
            company: exp.company || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            location: exp.location || '',
            description: exp.description || '',
            responsibilities: exp.responsibilities || [],
            achievements: exp.achievements || [],
          }))
        : [], // Handle case where experience is a number (years) instead of array
      // Use the already transformed skills array from the hook
      skills: userData.skills || [],
      education: userData.education?.map((edu: any) => ({
        degree: edu.degree || '',
        institution: edu.institution || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        graduationDate: edu.graduationDate || '',
        location: edu.location || '',
        description: edu.description || '',
        major: edu.major || '',
        courses: edu.courses || [],
        honors: edu.honors || [],
      })) || [],
      projects: userData.projects?.map((proj: any) => ({
        name: proj.name || '',
        date: proj.date || '',
        description: proj.description || '',
        technologies: proj.technologies || [],
        url: proj.url || '',
      })) || [],
      certifications: userData.certifications?.map((cert: any) => ({
        name: cert.name || '',
        issuer: cert.issuer || '',
        dateIssued: cert.dateIssued || '',
        expirationDate: cert.expirationDate || '',
      })) || [],
      awards: userData.awards?.map((award: any) => ({
        name: award.name || '',
        issuer: award.issuer || '',
        date: award.date || '',
        description: award.description || '',
      })) || [],      interests: userData.interests || [],    } as UserStructuredData;    setSelectedUserDataForPanel(userDataForPanel);
    setPanelState('expanded');
    // Don't prevent background scroll since only the table area is affected
  };

  // Function to handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
    } catch (error) {
      console.error('Error updating candidate status:', error);
      // Display some error notification here
    }
  };  // Function to handle rating change that will be used in the future
  const handleRatingChange = (id: string, rating: number) => {
    // Create a star rating component here in the future
    updateRatingMutation.mutate({ id, rating });
  };  // Function to handle adding a new candidate
  const handleAddCandidate = async (candidateData: CreateCandidateDto & { avatarFile?: File | null }) => {
    try {
      await createCandidateMutation.mutateAsync(candidateData);
      setIsAddModalOpen(false);
      // Show success notification here if you have a notification system
    } catch (error) {
      console.error('Error creating candidate:', error);
      // Display error notification here
    }
  };

  // Function to handle editing a candidate
  const handleEditCandidate = (candidate: EnhancedCandidate) => {
    setEditingCandidate(candidate);
    setIsEditModalOpen(true);
  };

  // Function to handle updating a candidate
  const handleUpdateCandidate = async (candidateData: CreateCandidateDto & { avatarFile?: File | null }) => {
    if (!editingCandidate) return;
    
    try {
      await updateCandidateMutation.mutateAsync({ 
        id: editingCandidate.id, 
        candidateData 
      });
      setIsEditModalOpen(false);
      setEditingCandidate(null);
      // Show success notification here if you have a notification system
    } catch (error) {
      console.error('Error updating candidate:', error);
      // Display error notification here
    }
  };

  // Function to handle delete confirmation
  const handleDeleteCandidate = (candidate: EnhancedCandidate) => {
    setDeleteConfirmation({
      isOpen: true,
      candidate
    });
  };

  // Function to confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.candidate) return;
    
    try {
      await deleteCandidateMutation.mutateAsync(deleteConfirmation.candidate.id);
      setDeleteConfirmation({ isOpen: false, candidate: null });
      // Show success notification here if you have a notification system
      console.log('Candidate deleted successfully');
    } catch (error: any) {
      console.error('Error deleting candidate:', error);
      
      // Check for specific error types
      if (error?.response?.status === 409) {
        alert('Cannot delete candidate: This candidate has active job applications. Please remove job applications first.');
      } else if (error?.response?.status === 403) {
        alert('You do not have permission to delete this candidate.');
      } else {
        alert('Failed to delete candidate. Please try again or contact support if the issue persists.');
      }
      
      // Keep the modal open on error
      // setDeleteConfirmation({ isOpen: false, candidate: null });
    }
  };

  // Function to cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, candidate: null });
  };
  const handlePanelStateChange = (newState: PanelState) => {
    setPanelState(newState);
    if (newState === 'closed') {
      setSelectedUserDataForPanel(null);
      // No need to restore scroll since we didn't disable it
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'hired':
        return 'bg-blue-100 text-blue-800';
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
      stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-yellow-200 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
    }

    return <div className="flex items-center space-x-1">{stars}</div>;
  };  // We're now using server-side filtering, so this is just a fallback  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // No need to fetch data here - useEffect will handle it when currentPage changes
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
    // No need to fetch data here - useEffect will handle it when itemsPerPage changes
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, experienceFilter]);  // Get stats from React Query or provide fallback values
  const stats = statsQuery.data || {
    total: candidates?.length || 0,
    active: candidates && Array.isArray(candidates) ? candidates.filter((c: EnhancedCandidate) => c.status === 'active').length : 0,
    interviewing: candidates && Array.isArray(candidates) ? candidates.filter((c: EnhancedCandidate) => c.status === 'interviewing').length : 0,
    hired: candidates && Array.isArray(candidates) ? candidates.filter((c: EnhancedCandidate) => c.status === 'hired').length : 0,    rejected: candidates && Array.isArray(candidates) ? candidates.filter((c: EnhancedCandidate) => c.status === 'rejected').length : 0,
    inactive: candidates && Array.isArray(candidates) ? candidates.filter((c: EnhancedCandidate) => c.status === 'inactive').length : 0
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    if (dateString === 'Present') return 'Present';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading candidates...</div>
        </div>
      </div>
    );
  }
  
  if (candidatesQuery.error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Error loading candidates. Please try again later.</div>
        </div>
      </div>
    );
  }  return (
    <React.Fragment>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/dashboard" className="flex items-center hover:text-purple-600 transition-colors">
            <Home className="w-4 h-4 mr-1" />
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium">Candidate Management</span>
        </div>
        
        {/* Header */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Candidate Management</h1>
              <p className="text-gray-600 mt-1">Manage and review candidate applications efficiently</p>
            </div>            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{candidates.length}</div>
                <div className="text-sm text-gray-500">Total Candidates</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </div>
          </div>
        </div>{/* Action Bar */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or skills..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                >
                  <option value="all">All Experience</option>
                  <option value="junior">Junior (0-2 years)</option>
                  <option value="mid">Mid (3-5 years)</option>
                  <option value="senior">Senior (5+ years)</option>
                </select>
              </div>            </div>            <div className="flex gap-3">
              <button 
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                onClick={() => setIsBulkImportModalOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
			   <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>              <Link to="/dashboard/resume-processing" className="flex items-center px-4 py-2 bg-white border border-purple-600 rounded-lg hover:bg-gray-50 text-purple-700">
                <FileText className="h-4 w-4 mr-2" />
                Process CV
              </Link>
			<Link to="/dashboard/search" className="flex items-center px-4 py-2 bg-purple-200 text-purple-600 rounded-lg hover:bg-purple-700 hover:text-white shadow-sm transition-colors">
				<SearchCheckIcon className="h-4 w-4 mr-2" />
				Search Talents
			</Link>              <button 
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </button>
            </div>
          </div>
        </div>       
		 {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">         
			 <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600 font-medium">Total Candidates</div>
            <div className="text-xs text-gray-500 mt-1">All applications</div>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.active}</div>
            <div className="text-sm text-gray-600 font-medium">Active</div>
            <div className="text-xs text-gray-500 mt-1">Ready to interview</div>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.interviewing}</div>
            <div className="text-sm text-gray-600 font-medium">Interviewing</div>
            <div className="text-xs text-gray-500 mt-1">In process</div>
          </div>          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-1">{stats.hired}</div>
            <div className="text-sm text-gray-600 font-medium">Hired</div>
            <div className="text-xs text-gray-500 mt-1">Successfully placed</div>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-3xl font-bold text-red-600 mb-1">{stats.rejected}</div>
            <div className="text-sm text-gray-600 font-medium">Rejected</div>
            <div className="text-xs text-gray-500 mt-1">Not suitable</div>
          </div>
        </div>        {/* Candidates Table - This section will be affected by the panel */}
        <div className={`transition-all duration-300 ${
          panelState === 'expanded' ? 'mr-[66.666667%]' : 
          panelState === 'collapsed' ? 'mr-[33.333333%]' : 
          ''
        }`}>
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-64 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="w-56 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Position & Experience
                    </th>
                    <th className="w-44 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location & Salary
                    </th>
                    <th className="w-36 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status & Rating
                    </th>
                    <th className="w-48 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Skills
                    </th>
                    <th className="w-32 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="w-28 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead><tbody className="bg-white divide-y divide-gray-100">
                  {candidates && Array.isArray(candidates) ? candidates.map((candidate: EnhancedCandidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {candidate.avatar ? (
                              <img 
                                src={getAvatarUrl(candidate.avatar) || ''} 
                                alt={`${candidate.firstName} ${candidate.lastName}`}
                                className="h-10 w-10 rounded-full object-cover"
                                onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center ${candidate.avatar ? 'hidden' : ''}`}
                            >
                              <span className="text-sm font-medium text-purple-600">
                                {`${candidate.firstName?.charAt(0) || ''}${candidate.lastName?.charAt(0) || ''}`}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 min-w-0 flex-1">
                            <button 
                              className="text-sm font-semibold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer transition-colors text-left block truncate"
                              onClick={() => handleOpenProfilePanel(candidate)}
                              title="Click to view full profile"
                            >
                              {candidate.fullName || (candidate.firstName && candidate.lastName ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown')}
                            </button>
                            <div className="text-sm text-gray-500 flex items-center truncate">
                              <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{candidate.email || 'No email'}</span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center truncate">
                              <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{candidate.phone || 'No phone'}</span>
                            </div>
                          </div>
                        </div>
                      </td>                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate" title={candidate.currentPosition || 
                             (candidate.experience && Array.isArray(candidate.experience) && candidate.experience.length > 0 
                              ? candidate.experience[0].position 
                              : 'No position data')}>
                            {candidate.currentPosition || 
                             (candidate.experience && Array.isArray(candidate.experience) && candidate.experience.length > 0 
                              ? candidate.experience[0].position 
                              : 'No position data')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {Array.isArray(candidate.experience) && candidate.experience.length > 0 
                              ? `${candidate.experience.length} position(s)`
                              : 'No experience data'}
                          </div>
                        </div>
                      </td>                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900 flex items-center truncate">
                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate" title={candidate.location}>{candidate.location}</span>
                          </div>
                          <div className="text-sm text-gray-500 truncate" title={candidate.salaryExpectation || 'No salary data'}>
                            {candidate.salaryExpectation || 'No salary data'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(candidate.status)}`}>
                            {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                          </span>                          <div className="flex items-center space-x-1">
                            {renderStarRating(typeof candidate.rating === 'string' ? parseFloat(candidate.rating) : candidate.rating)}
                            <span className="text-xs text-gray-500">({candidate.rating})</span>
                          </div>
                        </div>
                      </td>                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills && Array.isArray(candidate.skills) && candidate.skills.slice(0, 2).map((skill: string, index: number) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded truncate max-w-20" title={skill}>
                              {skill}
                            </span>
                          ))}
                          {candidate.skills && Array.isArray(candidate.skills) && candidate.skills.length > 2 && (
                            <span className="text-xs text-gray-500 whitespace-nowrap">+{candidate.skills.length - 2}</span>
                          )}
                          {(!candidate.skills || !Array.isArray(candidate.skills) || candidate.skills.length === 0) && (
                            <span className="text-xs text-gray-500">No skills</span>
                          )}
                        </div>
                      </td>                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900 truncate">{candidate.appliedDate ? formatDate(candidate.appliedDate) : 'N/A'}</div>
                          <div className="text-sm text-gray-500 truncate">Last: {candidate.lastActivity ? formatDate(candidate.lastActivity) : 'N/A'}</div>
                        </div>
                      </td>                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="relative dropdown-container">
                          <button 
                            className="flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md border border-purple-200 hover:border-purple-300 transition-colors"
                            onClick={() => setOpenDropdownId(openDropdownId === candidate.id ? null : candidate.id)}
                          >
                            Actions
                            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${openDropdownId === candidate.id ? 'rotate-180' : ''}`} />
                          </button>{openDropdownId === candidate.id && (
                            <div className="absolute right-0 mt-1 w-52 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                              <div className="py-1">                                <button 
                                  className="flex items-center w-full px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                                  onClick={() => {
                                    handleOpenProfilePanel(candidate);
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-3" />
                                  View Profile
                                </button>
                                <button 
                                  className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                                  onClick={() => {
                                    handleEditCandidate(candidate);
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-3" />
                                  Edit Profile
                                </button><a 
                                  href={candidate.documents && candidate.documents.length > 0 ? candidate.documents[0].url : '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  onClick={() => setOpenDropdownId(null)}
                                >
                                  <FileText className="w-4 h-4 mr-3" />
                                  View Resume
                                </a>
                                <button 
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                                  onClick={() => {
                                    // Add messaging functionality here
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <MessageSquare className="w-4 h-4 mr-3" />
                                  Send Message
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <div className="px-4 py-1 text-xs font-semibold text-gray-500">Status</div>
                                <button 
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                                  onClick={() => {
                                    handleStatusChange(candidate.id, 'active');
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 mr-3" />
                                  Active
                                </button>
                                <button 
                                  className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 transition-colors"
                                  onClick={() => {
                                    handleStatusChange(candidate.id, 'interviewing');
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <Clock className="w-4 h-4 mr-3" />
                                  Interviewing
                                </button>
                                <button 
                                  className="flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                                  onClick={() => {
                                    handleStatusChange(candidate.id, 'hired');
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <UserCheck className="w-4 h-4 mr-3" />
                                  Hired
                                </button>
                                <button 
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                                  onClick={() => {
                                    handleStatusChange(candidate.id, 'rejected');
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-3" />
                                  Rejected
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button 
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  onClick={() => setOpenDropdownId(null)}
                                >
                                  <Download className="w-4 h-4 mr-3" />
                                  Download Resume
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button 
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                                  onClick={() => {
                                    handleDeleteCandidate(candidate);
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-3" />
                                  Delete Candidate
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>                  )) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No candidates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>            </div>
          </div>
        </div> {/* End of table container that gets affected by panel */}        {/* Pagination - This stays fixed and doesn't move with the panel */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{totalItems}</span> candidates
            </div>
            <div className="flex items-center space-x-4">
              {/* Items per page selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-700">per page</span>
              </div>
              
              {/* Pagination controls */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'bg-purple-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>              </div>
            </div>
          </div>
        </div>
        </div> {/* End of space-y-6 */}
      </div> {/* End of main content */}

      {/* Side Panel and Overlay */}
      {panelState !== 'closed' && (
        <>
          {/* Overlay - only show for expanded state */}
          {panelState === 'expanded' && (
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300 ease-in-out"
              onClick={() => handlePanelStateChange('closed')}
              aria-hidden="true"
            ></div>
          )}
          {/* Panel */}
          <ProfileSidePanel
            userData={selectedUserDataForPanel}
            panelState={panelState}
            onStateChange={handlePanelStateChange}
          />        </>
      )}      {/* Add Candidate Modal */}
      <AddCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCandidate}
        isLoading={createCandidateMutation.isPending}
      />

      {/* Edit Candidate Modal */}
      <AddCandidateModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCandidate(null);
        }}
        onSubmit={handleUpdateCandidate}
        isLoading={updateCandidateMutation.isPending}
        editingCandidate={editingCandidate}
        isEditing={true}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Candidate"
        message={`Are you sure you want to delete ${deleteConfirmation.candidate?.fullName || 'this candidate'}? This action cannot be undone and all associated data will be permanently removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteCandidateMutation.isPending}
        variant="danger"
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onImportComplete={() => {
          // Refresh the candidates list and stats after successful import
          queryClient.invalidateQueries({ queryKey: ['candidates'] });
          queryClient.invalidateQueries({ queryKey: ['candidateStats'] });
          setIsBulkImportModalOpen(false);
        }}
      />
    </React.Fragment>
  );
};

export default CandidatesPage;
