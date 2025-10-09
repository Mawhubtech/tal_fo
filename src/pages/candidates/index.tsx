import React, { useState, useEffect } from 'react';
import { Search, MapPin, Mail, Phone, Download, Plus, Upload, MessageSquare, UserCheck, Eye, ChevronDown, FileText, Home, ChevronRight, SearchCheckIcon, CheckCircle, XCircle, Clock, Edit, Trash2, Loader2, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileSidePanel, { type PanelState, type UserStructuredData } from '../../components/ProfileSidePanel';
import AddCandidateModal from '../../components/AddCandidateModal';
import BulkImportModal from '../../components/BulkImportModal';
import JobSelectionModal from '../../components/JobSelectionModal';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { CreateCandidateDto } from '../../types/candidate.types';
import { useCandidates, useCandidate, useCandidateStats, useUpdateCandidateStatus, useCreateCandidate, useUpdateCandidate, useDeleteCandidate } from '../../hooks/useCandidates';
import { useCreateJobApplicationWithPipeline } from '../../hooks/useJobApplications';
import { useQueryClient } from '@tanstack/react-query';
import { getAvatarUrl } from '../../utils/fileUtils';
import { useAuthContext } from '../../contexts/AuthContext';
import { isSuperAdmin } from '../../utils/roleUtils';

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
  languages?: any[]; // Languages from API
  interests?: any[]; // Interests from API
  references?: any[]; // References from API
  customFields?: any[]; // Custom fields from API
  company?: {
    id: string;
    name: string;
  };
}

const CandidatesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const isUserSuperAdmin = isSuperAdmin(user);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [includeJobseekers, setIncludeJobseekers] = useState(false);
  // State for the profile side panel
  const [selectedUserDataForPanel, setSelectedUserDataForPanel] = useState<UserStructuredData | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
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

  // State for shortlisting
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // React Query hooks for data fetching
  const candidatesQuery = useCandidates({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    experienceLevel: experienceFilter !== 'all' ? experienceFilter : undefined,
    includeJobseekers: isUserSuperAdmin ? includeJobseekers : false, // Only super admins can control this
  });

  const statsQuery = useCandidateStats(isUserSuperAdmin ? includeJobseekers : false);
  
  // Hook for fetching individual candidate details
  const selectedCandidateQuery = useCandidate(selectedCandidateId || '');
  
  // Mutations for data updates
  const updateStatusMutation = useUpdateCandidateStatus();
  const createCandidateMutation = useCreateCandidate();
  const updateCandidateMutation = useUpdateCandidate();
  const deleteCandidateMutation = useDeleteCandidate();
  const createJobApplicationMutation = useCreateJobApplicationWithPipeline();
  
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
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  // Disable body scrolling when profile panel is open
  useEffect(() => {
    if (panelState !== 'closed') {
      // Save the current scroll position
      const scrollY = window.scrollY;
      
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Re-enable scrolling
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [panelState]);
  
  // Effect to transform complete candidate data when fetched
  useEffect(() => {
    if (selectedCandidateQuery.data && selectedCandidateId) {
      const userData = selectedCandidateQuery.data;
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
              technologies: exp.technologies || [],
              metadata: exp.metadata || undefined, // Include CoreSignal metadata
            }))
          : [],
        // Transform skillMappings to skills array
        skills: Array.isArray(userData.skillMappings) 
          ? userData.skillMappings.map((sm: any) => sm.skill?.name || '').filter(Boolean)
          : [],
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
          date: proj.startDate || '',
          description: proj.description || '',
          technologies: proj.technologies || [],
          url: proj.url || '',
        })) || [],
        certifications: userData.certifications?.map((cert: any) => ({
          name: cert.name || '',
          issuer: cert.issuer || '',
          date: cert.dateIssued || '',
          credentialUrl: cert.credentialUrl || '',
          description: cert.description || '',
        })) || [],
        awards: userData.awards?.map((award: any) => ({
          name: award.name || '',
          issuer: award.issuer || '',
          date: award.date || '',
          description: award.description || '',
          category: award.category || '',
          recognitionLevel: award.recognitionLevel || '',
        })) || [],
        interests: userData.interests?.map((interest: any) => ({
          name: interest.name || '',
          category: interest.category || '',
          level: interest.level || '',
          description: interest.description || '',
          yearsOfExperience: interest.yearsOfExperience || 0,
          isActive: interest.isActive || false,
        })) || [],
        languages: userData.languages?.map((lang: any) => ({
          language: lang.language || '',
          proficiency: lang.proficiency || '',
          isNative: lang.isNative || false,
          certificationName: lang.certificationName || '',
          certificationScore: lang.certificationScore || '',
          certificationDate: lang.certificationDate || '',
        })) || [],
        references: userData.references?.map((ref: any) => ({
          name: ref.name || '',
          position: ref.position || '',
          company: ref.company || '',
          email: ref.email || '',
          phone: ref.phone || '',
          relationship: ref.relationship || '',
          yearsKnown: ref.yearsKnown || '',
          status: ref.status || '',
        })) || [],
        customFields: userData.customFields?.map((field: any) => ({
          fieldName: field.fieldName || '',
          fieldType: field.fieldType || '',
          fieldValue: field.fieldValue || '',
          fieldDescription: field.fieldDescription || '',
          isRequired: field.isRequired || false,
        })) || [],
      } as UserStructuredData;
      
      setSelectedUserDataForPanel(userDataForPanel);
    } else if (selectedCandidateId && selectedCandidateQuery.isLoading) {
      // Clear data when loading new candidate to show loading state
      setSelectedUserDataForPanel(null);
    }
  }, [selectedCandidateQuery.data, selectedCandidateId, selectedCandidateQuery.isLoading]);
  
  // Handlers for the profile side panel  
  const handleOpenProfilePanel = (userData: any) => {
    // Clear previous data and show loading immediately
    setSelectedUserDataForPanel(null);
    // Set the candidate ID to trigger fetching complete data
    setSelectedCandidateId(userData.id);
    setPanelState('collapsed');
    // Don't prevent background scroll since only the table area is affected
  };

  const handlePanelStateChange = (newState: PanelState) => {
    setPanelState(newState);
    if (newState === 'closed') {
      setSelectedUserDataForPanel(null);
      setSelectedCandidateId(null);
    }
  };

  // Function to handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
    } catch (error) {
      console.error('Error updating candidate status:', error);
      // Display some error notification here
    }
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

  // Handler for shortlisting candidate
  const handleShortlistCandidate = () => {
    if (!selectedCandidateId) return;
    setShowProjectModal(true);
  };

  // Handler for adding candidate to a job
  const handleJobSelected = async (jobId: string) => {
    if (!selectedCandidateId) {
      throw new Error('No candidate selected');
    }

    try {
      setIsShortlisting(true);
      
      // Create job application for the existing candidate
      await createJobApplicationMutation.mutateAsync({
        candidateId: selectedCandidateId,
        jobId: jobId,
      });

      // Close modal on success
      setShowProjectModal(false);
      
      // Show success notification (you can add toast here if you have a toast system)
      console.log('Candidate successfully added to job');
    } catch (error) {
      console.error('Error adding candidate to job:', error);
      throw error; // Re-throw to let JobSelectionModal handle the error
    } finally {
      setIsShortlisting(false);
    }
  };

  // Handler for "Add to Database" button (not needed for existing candidates)
  // This is here for compatibility with JobSelectionModal
  const handleAddToDatabase = () => {
    console.log('Candidate is already in database');
    setShowProjectModal(false);
  };

  // Function to cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, candidate: null });
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
  }, [searchTerm, statusFilter, experienceFilter, includeJobseekers]);  // Get stats from React Query or provide fallback values
  const stats = statsQuery.data || {
    total: totalItems || 0, // Use total from pagination, not just current page
    active: 0, // Use 0 as fallback when real stats are loading
    interviewing: 0,
    hired: 0,
    rejected: 0,
    inactive: 0
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
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 max-w-full overflow-hidden">
        <div className="space-y-4 sm:space-y-6">
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
        <div className="bg-white rounded-lg border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isUserSuperAdmin 
                  ? (includeJobseekers ? 'All Candidates + Job Seekers' : 'Company Candidates') 
                  : 'Candidate Management'
                }
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                {isUserSuperAdmin 
                  ? (includeJobseekers 
                      ? 'Manage candidates from companies and independent job seekers' 
                      : 'Manage candidates from all companies'
                    )
                  : 'Manage and review candidate applications efficiently'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <div className="text-right">
                <div className="text-xl font-bold text-purple-600">{totalItems}</div>
                <div className="text-xs text-gray-500">Total Candidates</div>
              </div>
              <div className="w-px h-10 bg-gray-300 hidden sm:block"></div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">{stats.active}</div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">         
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="text-xl font-bold text-purple-600 mb-1">{stats.total}</div>
            <div className="text-xs font-medium text-gray-600">Total</div>
            <div className="text-xs text-gray-500 mt-1 hidden sm:block">All applications</div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="text-xl font-bold text-green-600 mb-1">{stats.active}</div>
            <div className="text-xs font-medium text-gray-600">Active</div>
            <div className="text-xs text-gray-500 mt-1 hidden sm:block">Ready to interview</div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="text-xl font-bold text-yellow-600 mb-1">{stats.interviewing}</div>
            <div className="text-xs font-medium text-gray-600">Interviewing</div>
            <div className="text-xs text-gray-500 mt-1 hidden sm:block">In process</div>
          </div>          
          <div className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="text-xl font-bold text-purple-600 mb-1">{stats.hired}</div>
            <div className="text-xs font-medium text-gray-600">Hired</div>
            <div className="text-xs text-gray-500 mt-1 hidden sm:block">Successfully placed</div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm sm:col-span-1 col-span-2">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mb-1">{stats.rejected}</div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Rejected</div>
            <div className="text-xs text-gray-500 mt-1 hidden sm:block">Not suitable</div>
          </div>
        </div>
        
        {/* Action Bar */}
        <div className="bg-white rounded-lg border p-3 sm:p-4 overflow-hidden">
          <div className="flex flex-col gap-3">
            {/* Search and filters section */}
            <div className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or skills..."
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filters and Actions in a row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <select
                  className="px-2 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
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
                  className="px-2 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                >
                  <option value="all">All Experience</option>
                  <option value="junior">Junior (0-2 years)</option>
                  <option value="mid">Mid (3-5 years)</option>
                  <option value="senior">Senior (5+ years)</option>
                </select>
                
                {isUserSuperAdmin && (
                  <div className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      id="includeJobseekers"
                      checked={includeJobseekers}
                      onChange={(e) => setIncludeJobseekers(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 border-gray-300 rounded"
                    />
                    <label htmlFor="includeJobseekers" className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                      Job Seekers
                    </label>
                  </div>
                )}
              </div>
              
              {/* Action buttons section - always in a row */}
              <div className="flex flex-nowrap gap-1 sm:gap-2">
                {isUserSuperAdmin && (
                  <button
                    title="Export candidates to CSV" 
                    className="flex items-center justify-center px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-xs sm:text-sm">
                    <Download className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                )}
                <button 
                  title="Import candidates from CSV"
                  className="flex items-center justify-center px-2 sm:px-3 py-2 bg-white border border-purple-600 rounded-lg hover:bg-purple-100 text-purple-700 text-xs sm:text-sm"
                  onClick={() => setIsBulkImportModalOpen(true)}
                >
                  <Upload className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Import</span>
                </button>
                <Link to="/dashboard/resume-processing" title="Process CV/Resume" className="flex items-center justify-center px-2 sm:px-3 py-2 bg-white border border-purple-600 rounded-lg hover:bg-gray-50 text-purple-700 text-xs sm:text-sm">
                  <FileText className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">CV</span>
                </Link>
                <Link to="/dashboard/sourcing/projects" title="Candidate Sourcing Projects" className="flex items-center justify-center px-2 sm:px-3 py-2 bg-purple-200 text-purple-600 rounded-lg hover:bg-purple-700 hover:text-white shadow-sm transition-colors text-xs sm:text-sm">
                  <SearchCheckIcon className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Source</span>
                </Link>              
                <button 
                  title="Add New Candidate"
                  className="flex items-center justify-center px-2 sm:px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm text-xs sm:text-sm"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>        {/* Candidates Table - This section will be affected by the panel */}
        <div className={`transition-all duration-300 ${
          panelState === 'expanded' ? 'mr-[66.666667%]' : 
          panelState === 'collapsed' ? 'mr-[33.333333%]' : 
          ''
        }`}>
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" style={{minWidth: '750px', tableLayout: 'fixed'}}>
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[150px]">
                      Candidate
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[110px]">
                      Position & Company
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[110px]">
                      Location
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[80px]">
                      Status
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[100px]">
                      Skills
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-[90px]">
                      Actions
                    </th>
                  </tr>
                </thead><tbody className="bg-white divide-y divide-gray-100">
                  {candidates && Array.isArray(candidates) ? candidates.map((candidate: EnhancedCandidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">                      
                      <td className="px-3 sm:px-4 lg:px-6 py-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                            {candidate.avatar ? (
                              <img 
                                src={getAvatarUrl(candidate.avatar) || ''} 
                                alt={`${candidate.firstName} ${candidate.lastName}`}
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
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
                              className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center ${candidate.avatar ? 'hidden' : ''}`}
                            >
                              <span className="text-xs sm:text-sm font-medium text-purple-600">
                                {`${candidate.firstName?.charAt(0) || ''}${candidate.lastName?.charAt(0) || ''}`}
                              </span>
                            </div>
                          </div>
                          <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                            <button 
                              className="text-xs sm:text-sm font-semibold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer transition-colors text-left flex items-center truncate w-full"
                              onClick={() => handleOpenProfilePanel(candidate)}
                              title="Click to view full profile"
                              disabled={selectedCandidateQuery.isLoading && selectedCandidateId === candidate.id}
                            >
                              {selectedCandidateQuery.isLoading && selectedCandidateId === candidate.id && (
                                <div className="w-3 h-3 border border-purple-300 border-t-purple-600 rounded-full animate-spin mr-1 flex-shrink-0"></div>
                              )}
                              <span className="truncate">
                                {candidate.fullName || (candidate.firstName && candidate.lastName ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown')}
                              </span>
                            </button>
                            <div className="text-xs sm:text-sm text-gray-500 flex items-center truncate">
                              <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{candidate.email || 'No email'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs sm:text-sm text-gray-500 flex items-center truncate">
                                <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{candidate.phone || 'No phone'}</span>
                              </div>
                              {candidate.linkedIn && (
                                <a
                                  href={candidate.linkedIn.startsWith('http') ? candidate.linkedIn : `https://${candidate.linkedIn}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
                                  title="View LinkedIn Profile"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Linkedin className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>                      
					  <td className="px-3 sm:px-4 lg:px-6 py-3">
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate" title={candidate.currentPosition || 
                             (candidate.experience && Array.isArray(candidate.experience) && candidate.experience.length > 0 
                              ? candidate.experience[0].position 
                              : 'No position data')}>
                            {candidate.currentPosition || 
                             (candidate.experience && Array.isArray(candidate.experience) && candidate.experience.length > 0 
                              ? candidate.experience[0].position 
                              : 'No position data')}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate" title={
                            candidate.experience && Array.isArray(candidate.experience) && candidate.experience.length > 0 
                              ? candidate.experience[0].company 
                              : 'No company data'
                          }>
                            {candidate.experience && Array.isArray(candidate.experience) && candidate.experience.length > 0 
                              ? candidate.experience[0].company 
                              : 'No company data'}
                          </div>
                        </div>
                      </td>                      
                      <td className="px-3 sm:px-4 lg:px-6 py-3">
                        <div className="text-xs sm:text-sm text-gray-900 flex items-center truncate">
                          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate" title={candidate.location}>{candidate.location}</span>
                        </div>
                      </td>
                      
                      <td className="px-3 sm:px-4 lg:px-6 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(candidate.status)}`}>
                          {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                        </span>
                      </td>                      
					  <td className="px-3 sm:px-4 lg:px-6 py-3">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills && Array.isArray(candidate.skills) && candidate.skills.slice(0, 2).map((skill: string, index: number) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded truncate max-w-16 sm:max-w-20" title={skill}>
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
                      </td>                      
					  {/* <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900 truncate">{candidate.appliedDate ? formatDate(candidate.appliedDate) : 'N/A'}</div>
                          <div className="text-sm text-gray-500 truncate">Last: {candidate.lastActivity ? formatDate(candidate.lastActivity) : 'N/A'}</div>
                        </div>
                      </td>                       */}
					  <td className="px-3 sm:px-4 lg:px-6 py-3 text-xs sm:text-sm font-medium text-center">
                        <div className="relative dropdown-container inline-block">
                          <button 
                            className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md border border-purple-200 hover:border-purple-300 transition-colors"
                            onClick={() => setOpenDropdownId(openDropdownId === candidate.id ? null : candidate.id)}
                          >
                            <span className="hidden sm:inline">Actions</span>
                            <span className="sm:hidden">Act</span>
                            <ChevronDown className={`w-3 h-3 ml-0.5 transition-transform ${openDropdownId === candidate.id ? 'rotate-180' : ''}`} />
                          </button>{openDropdownId === candidate.id && (
                            <div className="absolute right-0 mt-1 w-36 sm:w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50 dropdown-menu" style={{maxWidth: "180px"}}>
                              <div className="py-1">                                <button 
                                  className="flex items-center w-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                                  onClick={() => {
                                    handleOpenProfilePanel(candidate);
                                    setOpenDropdownId(null);
                                  }}
                                  disabled={selectedCandidateQuery.isLoading && selectedCandidateId === candidate.id}
                                >
                                  {selectedCandidateQuery.isLoading && selectedCandidateId === candidate.id ? (
                                    <div className="w-3 h-3 border border-purple-300 border-t-purple-600 rounded-full animate-spin mr-1 sm:mr-2 flex-shrink-0"></div>
                                  ) : (
                                    <Eye className="w-3 h-3 mr-1 sm:mr-2 flex-shrink-0" />
                                  )}
                                  <span className="truncate">View Profile</span>
                                </button>
                                <button 
                                  className="flex items-center w-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                                  onClick={() => {
                                    handleEditCandidate(candidate);
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <Edit className="w-3 h-3 mr-1 sm:mr-2 flex-shrink-0" />
                                  <span className="truncate">Edit Profile</span>
                                </button>

                                <div className="border-t border-gray-100 my-1"></div>
                                <div className="px-2 sm:px-3 py-1 text-xs font-semibold text-gray-500">Status</div>
                                <button 
                                  className="flex items-center w-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-green-700 hover:bg-green-50 transition-colors"
                                  onClick={() => {
                                    handleStatusChange(candidate.id, 'active');
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1 sm:mr-2 flex-shrink-0" />
                                  <span className="truncate">Active</span>
                                </button>
                                <button 
                                  className="flex items-center w-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-yellow-700 hover:bg-yellow-50 transition-colors"
                                  onClick={() => {
                                    handleStatusChange(candidate.id, 'interviewing');
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <Clock className="w-3 h-3 mr-1 sm:mr-2 flex-shrink-0" />
                                  <span className="truncate">Interviewing</span>
                                </button>
                                <button 
                                  className="flex items-center w-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                                  onClick={() => {
                                    handleStatusChange(candidate.id, 'hired');
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <UserCheck className="w-3 h-3 mr-1 sm:mr-2 flex-shrink-0" />
                                  <span className="truncate">Hired</span>
                                </button>
                                <button 
                                  className="flex items-center w-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-red-700 hover:bg-red-50 transition-colors"
                                  onClick={() => {
                                    handleStatusChange(candidate.id, 'rejected');
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <XCircle className="w-3 h-3 mr-1 sm:mr-2 flex-shrink-0" />
                                  <span className="truncate">Rejected</span>
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>

                                <div className="border-t border-gray-100 my-1"></div>
                                <button 
                                  className="flex items-center w-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-red-700 hover:bg-red-50 transition-colors"
                                  onClick={() => {
                                    handleDeleteCandidate(candidate);
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3 mr-1 sm:mr-2 flex-shrink-0" />
                                  <span className="truncate">Delete</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>                  
					)) : (
                    <tr>
                      <td colSpan={isUserSuperAdmin ? 7 : 6} className="px-6 py-4 text-center text-gray-500">
                        No candidates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>            
			  </div>
          </div>
        </div> {/* End of table container that gets affected by panel */}        
        
        {/* Pagination - This stays fixed and doesn't move with the panel */}
        <div className="bg-white rounded-lg border p-3 sm:p-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
              Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{totalItems}</span> candidates
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-3">
              {/* Items per page selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-gray-700">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-xs sm:text-sm text-gray-700">per page</span>
              </div>
              
              {/* Pagination controls */}
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-2 py-1 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Prev</span>
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(totalPages <= 3 ? totalPages : 3, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 2) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNumber = totalPages - 2 + i;
                    } else {
                      pageNumber = currentPage - 1 + i;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'bg-purple-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  {totalPages > 3 && currentPage < totalPages - 1 && (
                    <span className="flex items-center justify-center px-1 text-xs sm:text-sm">...</span>
                  )}
                  {totalPages > 3 && currentPage < totalPages - 1 && (
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium border border-gray-300 hover:bg-gray-50 text-gray-700"
                    >
                      {totalPages}
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-2 py-1 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                </button>              
				      </div>
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
            isLoading={selectedCandidateQuery.isLoading}
            candidateId={selectedCandidateId}
            onShortlist={handleShortlistCandidate}
            isShortlisting={isShortlisting}
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

      {/* Job Selection Modal */}
      <JobSelectionModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
        }}
        candidate={selectedCandidateQuery.data}
        onJobSelected={handleJobSelected}
        onAddToDatabase={handleAddToDatabase}
        isLoading={isShortlisting || createJobApplicationMutation.isPending}
        showAddToDatabase={false}
      />
    </React.Fragment>
  );
};

export default CandidatesPage;
