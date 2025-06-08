import React, { useState, useEffect } from 'react';
import { Search, MapPin, Mail, Phone, Star, Download, Plus, Upload, MessageSquare, UserCheck, Eye, ChevronDown } from 'lucide-react';
import ProfileSidePanel, { type PanelState, type UserStructuredData } from '../components/ProfileSidePanel';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedIn?: string;
  github?: string;
}

interface Experience {
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  technologies?: string[];
}

interface CandidateData {
  fileName: string;
  fileSize: number;
  extractedText: string;
  structuredData: {
    personalInfo: PersonalInfo;
    summary: string;
    experience: Experience[];
    skills: string[];
    education?: any[];
    certifications?: any[];
    awards?: any[];
  };
}

// Enhanced candidate interface with additional professional fields
interface EnhancedCandidate extends CandidateData {
  id: string;
  status: 'active' | 'inactive' | 'hired' | 'interviewing' | 'rejected';
  rating: number;
  appliedDate: string;
  lastActivity: string;
  currentPosition?: string;
  salaryExpectation?: string;
}

const CandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<EnhancedCandidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for the profile side panel
  const [selectedUserDataForPanel, setSelectedUserDataForPanel] = useState<UserStructuredData | null>(null);
  const [panelState, setPanelState] = useState<PanelState>('closed');

  // State for dropdown menus
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const candidatePromises = [];
        for (let i = 1; i <= 10; i++) {
          candidatePromises.push(
            import(`../data/user${i}.json`).then(module => module.default)
          );
        }
        const loadedCandidates = await Promise.all(candidatePromises);
        
        // Enhance candidates with professional data
        const enhancedCandidates: EnhancedCandidate[] = loadedCandidates.map((candidate, index) => ({
          ...candidate,
          id: (index + 1).toString(),
          status: ['active', 'interviewing', 'hired', 'rejected', 'inactive'][Math.floor(Math.random() * 5)] as any,
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Rating between 3.0-5.0
          appliedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          currentPosition: candidate.structuredData.experience[0]?.position,
          salaryExpectation: `$${Math.floor(Math.random() * 100 + 80)}k - $${Math.floor(Math.random() * 100 + 120)}k`
        }));
        
        setCandidates(enhancedCandidates);
      } catch (error) {
        console.error('Error loading candidates:', error);
      } finally {
        setLoading(false);
      }
    };    loadCandidates();
  }, []);

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

  // Handlers for the profile side panel
  const handleOpenProfilePanel = (userData: UserStructuredData) => {
    setSelectedUserDataForPanel(userData);
    setPanelState('expanded');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
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
  };
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.structuredData.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.structuredData.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.structuredData.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    const matchesExperience = experienceFilter === 'all' || 
                             (experienceFilter === 'junior' && candidate.structuredData.experience.length <= 2) ||
                             (experienceFilter === 'mid' && candidate.structuredData.experience.length >= 3 && candidate.structuredData.experience.length <= 5) ||
                             (experienceFilter === 'senior' && candidate.structuredData.experience.length > 5);
    
    return matchesSearch && matchesStatus && matchesExperience;
  });
  // Pagination calculations
  const totalItems = filteredCandidates.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

  // Debug pagination
  console.log('Pagination Debug:', {
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    startIndex,
    endIndex,
    paginatedCandidatesLength: paginatedCandidates.length,
    filteredCandidatesLength: filteredCandidates.length
  });

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, experienceFilter]);

  const stats = {
    total: candidates.length,
    active: candidates.filter(c => c.status === 'active').length,
    interviewing: candidates.filter(c => c.status === 'interviewing').length,
    hired: candidates.filter(c => c.status === 'hired').length,
    rejected: candidates.filter(c => c.status === 'rejected').length
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'Present') return 'Present';
    return new Date(dateString).toLocaleDateString();
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
  return (
    <React.Fragment>
      <div className={`min-h-screen bg-gray-50 p-6 transition-all duration-300 ${
        panelState === 'expanded' ? 'mr-[66.666667%] overflow-hidden' : 
        panelState === 'collapsed' ? 'mr-[33.333333%] overflow-hidden' : 
        ''
      }`}>
        <div className="space-y-6">
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
            </div>
            <div className="flex gap-3">
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>              <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </button>
            </div>
          </div>
        </div>        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">          <div className="bg-white p-6 rounded-lg border shadow-sm">
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
                  {paginatedCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600">
                                {candidate.structuredData.personalInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          </div>                          <div className="ml-4">
                            <button 
                              className="text-sm font-semibold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer transition-colors text-left"
                              onClick={() => handleOpenProfilePanel(candidate.structuredData)}
                              title="Click to view full profile"
                            >
                              {candidate.structuredData.personalInfo.fullName}
                            </button>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {candidate.structuredData.personalInfo.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {candidate.structuredData.personalInfo.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{candidate.currentPosition}</div>
                          <div className="text-sm text-gray-500">{candidate.structuredData.experience.length} years experience</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {candidate.structuredData.personalInfo.location}
                          </div>
                          <div className="text-sm text-gray-500">{candidate.salaryExpectation}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(candidate.status)}`}>
                            {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                          </span>
                          <div className="flex items-center space-x-1">
                            {renderStarRating(candidate.rating)}
                            <span className="text-xs text-gray-500">({candidate.rating})</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {candidate.structuredData.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                              {skill}
                            </span>
                          ))}
                          {candidate.structuredData.skills.length > 3 && (
                            <span className="text-xs text-gray-500">+{candidate.structuredData.skills.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{formatDate(candidate.appliedDate)}</div>
                          <div className="text-sm text-gray-500">Last: {formatDate(candidate.lastActivity)}</div>
                        </div>
                      </td>                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="relative dropdown-container">
                          <button 
                            className="flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md border border-purple-200 hover:border-purple-300 transition-colors"
                            onClick={() => setOpenDropdownId(openDropdownId === candidate.id ? null : candidate.id)}
                          >
                            Actions
                            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${openDropdownId === candidate.id ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {openDropdownId === candidate.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                              <div className="py-1">
                                <button 
                                  className="flex items-center w-full px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                                  onClick={() => {
                                    handleOpenProfilePanel(candidate.structuredData);
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-3" />
                                  View Profile
                                </button>
                                <button 
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                                  onClick={() => setOpenDropdownId(null)}
                                >
                                  <MessageSquare className="w-4 h-4 mr-3" />
                                  Send Message
                                </button>
                                <button 
                                  className="flex items-center w-full px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                                  onClick={() => setOpenDropdownId(null)}
                                >
                                  <UserCheck className="w-4 h-4 mr-3" />
                                  Mark as Hired
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
                    </tr>
                  ))}
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
      )}
    </React.Fragment>
  );
};

export default CandidatesPage;
