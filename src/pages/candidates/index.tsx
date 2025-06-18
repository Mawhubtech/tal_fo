import React, { useState, useEffect } from 'react';
import { Search, MapPin, Mail, Phone, Star, Download, Plus, Upload, MessageSquare, UserCheck, Eye, ChevronDown, FileText, Home, ChevronRight, SearchCheckIcon, User, File, Calendar, Edit, Trash, CheckCircle, XCircle, Clock, MoreVertical, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileSidePanel, { type PanelState, type UserStructuredData } from '../../components/ProfileSidePanel';
import { CandidateQueryParams } from '../../services/candidatesService';
import { useCandidates, useCandidateStats, useUpdateCandidateStatus, useUpdateCandidateRating } from '../../hooks/useCandidates';

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

  // State for debug panel
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);

  // React Query hooks for data fetching
  const candidatesQuery = useCandidates({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    experienceLevel: experienceFilter !== 'all' ? experienceFilter : undefined,
  });

  const statsQuery = useCandidateStats();
    // Mutations for data updates
  const updateStatusMutation = useUpdateCandidateStatus();
  const updateRatingMutation = useUpdateCandidateRating();
  
  // Use items instead of data.items for compatibility with the transformed response
  const candidates = Array.isArray(candidatesQuery.data?.items) ? candidatesQuery.data.items : [];
  const totalItems = candidatesQuery.data?.total || 0;
  const loading = candidatesQuery.isLoading;

  // Debug log the candidate data
  useEffect(() => {
    console.log('Candidate data:', candidates);
  }, [candidates]);

  // Store raw API response
  useEffect(() => {
    if (candidatesQuery.data) {
      setRawApiResponse(candidatesQuery.data);
    }
  }, [candidatesQuery.data]);

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
  }, [openDropdownId]);  // Handlers for the profile side panel
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
      experience: userData.experience?.map((exp: any) => ({
        position: exp.position || '',
        company: exp.company || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        location: exp.location || '',
        description: exp.description || '',
        responsibilities: exp.responsibilities || [],
        achievements: exp.achievements || [],
      })) || [],
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
      })) || [],
      interests: userData.interests || [],
    } as UserStructuredData;

    setSelectedUserDataForPanel(userDataForPanel);
    setPanelState('expanded');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  // Function to handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
    } catch (error) {
      console.error('Error updating candidate status:', error);
      // Display some error notification here
    }
  };
  // Function to handle rating change that will be used in the future
  const handleRatingChange = (id: string, rating: number) => {
    // Create a star rating component here in the future
    updateRatingMutation.mutate({ id, rating });
  };

  const handlePanelStateChange = (newState: PanelState) => {
    setPanelState(newState);
    if (newState === 'closed') {
      setSelectedUserDataForPanel(null);
      document.body.style.overflow = 'auto'; // Restore background scroll
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
  
  // Debug pagination
  console.log('Pagination Debug:', {
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    startIndex,
    endIndex,
    candidatesLength: candidates?.length || 0,
    queryState: candidatesQuery.status
  });
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
    hired: candidates && Array.isArray(candidates) ? candidates.filter((c: EnhancedCandidate) => c.status === 'hired').length : 0,
    rejected: candidates && Array.isArray(candidates) ? candidates.filter((c: EnhancedCandidate) => c.status === 'rejected').length : 0,
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
  };if (loading) {
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
  }
  return (
    <React.Fragment>      <div className={`min-h-screen bg-gray-50 p-6 transition-all duration-300 ${
        panelState === 'expanded' ? 'mr-[66.666667%] overflow-hidden' : 
        panelState === 'collapsed' ? 'mr-[33.333333%] overflow-hidden' : 
        ''
      }`}>
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
              </div>
            </div>            <div className="flex gap-3">
              <button 
                className={`flex items-center px-4 py-2 ${showDebugPanel ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border border-purple-300'} rounded-lg hover:bg-purple-500 hover:text-white transition-colors`}
                onClick={() => setShowDebugPanel(!showDebugPanel)}
              >
                <Code className="h-4 w-4 mr-2" />
                {showDebugPanel ? 'Hide API Debug' : 'Show API Debug'}
              </button>
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
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
			</Link>
              <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm">
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
        </div>        {/* Candidates Table */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Position & Experience
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location & Salary
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status & Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Skills
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>                <tbody className="bg-white divide-y divide-gray-100">
                  {candidates && Array.isArray(candidates) ? candidates.map((candidate: EnhancedCandidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">                          <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {candidate.avatar ? (
                              <img 
                                src={candidate.avatar} 
                                alt={`${candidate.firstName} ${candidate.lastName}`}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-purple-600">
                                  {`${candidate.firstName?.charAt(0) || ''}${candidate.lastName?.charAt(0) || ''}`}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">                            <button 
                              className="text-sm font-semibold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer transition-colors text-left"
                              onClick={() => handleOpenProfilePanel(candidate)}
                              title="Click to view full profile"
                            >
                              {candidate.fullName || (candidate.firstName && candidate.lastName ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown')}
                            </button>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {candidate.email || 'No email'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {candidate.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {candidate.location}
                          </div>
                          <div className="text-sm text-gray-500">{candidate.salaryExpectation}</div>
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
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {candidate.skills && Array.isArray(candidate.skills) && candidate.skills.slice(0, 3).map((skill: string, index: number) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                              {skill}
                            </span>
                          ))}
                          {candidate.skills && Array.isArray(candidate.skills) && candidate.skills.length > 3 && (
                            <span className="text-xs text-gray-500">+{candidate.skills.length - 3} more</span>
                          )}
                          {(!candidate.skills || !Array.isArray(candidate.skills) || candidate.skills.length === 0) && (
                            <span className="text-xs text-gray-500">No skills listed</span>
                          )}
                        </div>
                      </td><td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{candidate.appliedDate ? formatDate(candidate.appliedDate) : 'N/A'}</div>
                          <div className="text-sm text-gray-500">Last: {candidate.lastActivity ? formatDate(candidate.lastActivity) : 'N/A'}</div>
                        </div>
                      </td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="relative dropdown-container">
                          <button 
                            className="flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md border border-purple-200 hover:border-purple-300 transition-colors"
                            onClick={() => setOpenDropdownId(openDropdownId === candidate.id ? null : candidate.id)}
                          >
                            Actions
                            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${openDropdownId === candidate.id ? 'rotate-180' : ''}`} />
                          </button>                          {openDropdownId === candidate.id && (
                            <div className="absolute right-0 mt-1 w-52 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                              <div className="py-1">
                                <button 
                                  className="flex items-center w-full px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                                  onClick={() => {
                                    handleOpenProfilePanel(candidate);
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-3" />
                                  View Profile
                                </button>                                <a 
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

        {/* Pagination */}
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
        </div>
      </div>

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
          />
        </>
      )}      {/* Debug Panel - Raw API Data View */}
      <DebugPanel
        data={{
          rawApiResponse,
          transformedCandidates: candidates,
          queryState: candidatesQuery.status,
          queryFetchStatus: candidatesQuery.fetchStatus,
          pagination: {
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems
          }
        }}
        isVisible={showDebugPanel}
        onClose={() => setShowDebugPanel(false)}
      />
    </React.Fragment>
  );
};

// Debug Panel Component
interface DebugPanelProps {
  data: any;
  isVisible: boolean;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ data, isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'raw' | 'transformed' | 'query'>('raw');
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-0 right-0 w-1/2 h-2/3 bg-white border-l border-t border-gray-200 shadow-lg z-50 overflow-hidden flex flex-col">
      <div className="sticky top-0 bg-gray-100 p-3 border-b flex justify-between items-center">
        <h3 className="font-semibold">API Data Debug View</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-full"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b bg-gray-50">
        <button 
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'raw' ? 'bg-white border-b-2 border-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setActiveTab('raw')}
        >
          Raw API Response
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'transformed' ? 'bg-white border-b-2 border-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setActiveTab('transformed')}
        >
          Transformed Data
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'query' ? 'bg-white border-b-2 border-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setActiveTab('query')}
        >
          Query State
        </button>
      </div>
      
      {/* Content */}      <div className="p-4 overflow-auto flex-grow">
        {activeTab === 'raw' && (
          <>
            <div className="mb-2 text-sm font-semibold text-gray-700">Raw API Response:</div>
            <div className="mb-3 flex gap-2 items-center">
              <span className="text-xs text-gray-600">Response Format:</span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {data.rawApiResponse?.responseFormat || 'Unknown'}
              </span>
              <span className="text-xs text-gray-600 ml-4">Total Items:</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {data.rawApiResponse?.total || 0}
              </span>
            </div>
            <pre className="text-xs overflow-auto max-h-full whitespace-pre-wrap bg-gray-50 p-3 rounded border">
              {JSON.stringify(data.rawApiResponse?.originalResponse || data.rawApiResponse, null, 2)}
            </pre>
          </>
        )}
        
        {activeTab === 'transformed' && (
          <>
            <div className="mb-2 text-sm font-semibold text-gray-700">Transformed Candidates:</div>
            {Array.isArray(data.transformedCandidates) && data.transformedCandidates.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-gray-600 mb-1">Select candidate to inspect:</div>
                <div className="flex flex-wrap gap-2">
                  {data.transformedCandidates.map((candidate: any, index: number) => (
                    <button 
                      key={candidate.id || index}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded"                      onClick={() => {
                        console.log('Candidate details:', candidate);
                        // Show a more sophisticated inspection modal in the future
                        alert(`Candidate ID: ${candidate.id}\n\nCheck browser console for full details`);
                      }}
                    >
                      {candidate.fullName || `${candidate.firstName || ''} ${candidate.lastName || ''}` || `Candidate ${index + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <pre className="text-xs overflow-auto max-h-full whitespace-pre-wrap bg-gray-50 p-3 rounded border">
              {JSON.stringify(data.transformedCandidates, null, 2)}
            </pre>
          </>
        )}
        
        {activeTab === 'query' && (
          <>
            <div className="mb-2 text-sm font-semibold text-gray-700">Query Information:</div>
            <pre className="text-xs overflow-auto max-h-full whitespace-pre-wrap bg-gray-50 p-3 rounded border">
              {JSON.stringify({
                queryState: data.queryState,
                queryFetchStatus: data.queryFetchStatus,
                pagination: data.pagination
              }, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
};

export default CandidatesPage;
