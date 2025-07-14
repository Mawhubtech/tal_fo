import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Plus, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCandidates } from '../../../hooks/useCandidates';
import { useCreateSourcingProspect, useSourcingDefaultPipeline } from '../../../hooks/useSourcingProspects';
import { CandidateQueryParams } from '../../../services/candidatesService';
import SourcingProfileSidePanel, { type PanelState, type UserStructuredData } from './SourcingProfileSidePanel';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FilterState {
  search: string;
  status: string;
  source: string;
  location: string;
  skills: string[];
  minRating: number | undefined;
  maxRating: number | undefined;
  minExperience: number | undefined;
  maxExperience: number | undefined;
  appliedAfter: string;
  appliedBefore: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

const CANDIDATE_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'hired', label: 'Hired' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'rejected', label: 'Rejected' },
];

const CANDIDATE_SOURCES = [
  { value: '', label: 'All Sources' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'linkedin_chrome_extension', label: 'LinkedIn Extension' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'referral', label: 'Referral' },
  { value: 'direct_application', label: 'Direct Application' },
  { value: 'recruitment_agency', label: 'Recruitment Agency' },
  { value: 'other', label: 'Other' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Added' },
  { value: 'fullName', label: 'Name' },
  { value: 'rating', label: 'Rating' },
  { value: 'lastActivity', label: 'Last Activity' },
  { value: 'experience', label: 'Experience' },
];

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [activeQueryParams, setActiveQueryParams] = useState<CandidateQueryParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  // Profile side panel state
  const [selectedCandidateForProfile, setSelectedCandidateForProfile] = useState<any>(null);
  const [panelState, setPanelState] = useState<PanelState>('closed');
  const sidePanelRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    source: '',
    location: '',
    skills: [],
    minRating: undefined,
    maxRating: undefined,
    minExperience: undefined,
    maxExperience: undefined,
    appliedAfter: '',
    appliedBefore: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const [skillInput, setSkillInput] = useState('');

  const { data: candidatesData, isLoading, error, refetch } = useCandidates(activeQueryParams);
  const createProspectMutation = useCreateSourcingProspect();
  const { data: defaultPipeline } = useSourcingDefaultPipeline();

  const candidates = candidatesData?.items || [];
  const totalCandidates = candidatesData?.total || 0;
  const totalPages = candidatesData?.totalPages || 1;

  // Clear selections when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCandidates(new Set());
      setCurrentPage(1);
      setPanelState('closed');
      setSelectedCandidateForProfile(null);
      setSearchTriggered(false);
      // Reset to initial empty state when modal closes
      setActiveQueryParams({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
    }
  }, [isOpen]);

  // Handle click outside panel to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidePanelRef.current && !sidePanelRef.current.contains(event.target as Node)) {
        setPanelState('closed');
        setSelectedCandidateForProfile(null);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && panelState !== 'closed') {
        setPanelState('closed');
        setSelectedCandidateForProfile(null);
      }
    };

    if (panelState !== 'closed') {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [panelState]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const newQueryParams: CandidateQueryParams = {
      page: 1, // Reset to first page on new search
      limit: 20,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.source && { source: filters.source }),
      ...(filters.location && { location: filters.location }),
      ...(filters.skills.length > 0 && { skills: filters.skills }),
      ...(filters.minRating !== undefined && { minRating: filters.minRating }),
      ...(filters.maxRating !== undefined && { maxRating: filters.maxRating }),
      ...(filters.minExperience !== undefined && { minExperience: filters.minExperience }),
      ...(filters.maxExperience !== undefined && { maxExperience: filters.maxExperience }),
      ...(filters.appliedAfter && { appliedAfter: filters.appliedAfter }),
      ...(filters.appliedBefore && { appliedBefore: filters.appliedBefore }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
    
    setCurrentPage(1);
    setActiveQueryParams(newQueryParams);
    setSearchTriggered(true);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      source: '',
      location: '',
      skills: [],
      minRating: undefined,
      maxRating: undefined,
      minExperience: undefined,
      maxExperience: undefined,
      appliedAfter: '',
      appliedBefore: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
    setSkillInput('');
    setCurrentPage(1);
    
    // Reset the search results to initial state
    const initialParams: CandidateQueryParams = {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };
    setActiveQueryParams(initialParams);
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !filters.skills.includes(skillInput.trim())) {
      handleFilterChange('skills', [...filters.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    handleFilterChange('skills', filters.skills.filter(skill => skill !== skillToRemove));
  };

  const handleCandidateSelect = (candidateId: string) => {
    const newSelected = new Set(selectedCandidates);
    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId);
    } else {
      newSelected.add(candidateId);
    }
    setSelectedCandidates(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCandidates.size === candidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(candidates.map(c => c.id)));
    }
  };

  const handleAddCandidates = async () => {
    if (selectedCandidates.size === 0) return;

    try {
      // Get the default pipeline and first stage
      if (!defaultPipeline) {
        throw new Error('No default pipeline found. Please configure a sourcing pipeline first.');
      }

      const firstStage = defaultPipeline.stages?.[0];
      if (!firstStage) {
        throw new Error('No stages found in the default pipeline.');
      }

      // Add each selected candidate as a prospect with proper pipeline info
      const promises = Array.from(selectedCandidates).map(candidateId =>
        createProspectMutation.mutateAsync({
          candidateId,
          status: 'new',
          source: 'other', // Indicating manually added from database
          rating: 0,
          pipelineId: defaultPipeline.id,
          currentStageId: firstStage.id,
          notes: 'Added manually from candidate database',
        })
      );

      await Promise.all(promises);
      
      setSelectedCandidates(new Set());
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to add candidates:', error);
      // You could add a toast notification here
    }
  };

  // Handle opening profile panel
  const handleOpenProfilePanel = (candidateData: any, candidateId: string) => {
    setSelectedCandidateForProfile(candidateData);
    setPanelState('expanded');
  };

  // Handle panel state change
  const handlePanelStateChange = (newState: PanelState) => {
    setPanelState(newState);
    if (newState === 'closed') {
      setSelectedCandidateForProfile(null);
    }
  };

  // Transform candidate data to UserStructuredData format
  const transformCandidateToUserStructuredData = (candidate: any): UserStructuredData | null => {
    if (!candidate) return null;

    return {
      personalInfo: {
        fullName: candidate.fullName || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        location: candidate.location || '',
        website: candidate.website || '',
        linkedIn: candidate.linkedIn || '',
        github: candidate.github || '',
        avatar: candidate.avatar || ''
      },
      summary: candidate.summary || '',
      experience: candidate.experience || [],
      education: candidate.education || [],
      skills: candidate.skills || [],
      projects: candidate.projects || [],
      certifications: candidate.certifications || [],
      awards: candidate.awards || [],
      interests: candidate.interests || [],
      languages: candidate.languages || [],
      references: candidate.references || [],
      customFields: candidate.customFields || []
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Add Candidates to Prospects</h2>
            <p className="text-gray-600 text-sm mt-1">
              Select candidates from the database to add to your prospect pipeline
            </p>
          </div>
          
          {/* Candidate Selection in Header */}
          <div className="flex items-center space-x-4 mr-4">
            {selectedCandidates.size > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedCandidates.size} candidate{selectedCandidates.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {selectedCandidates.size === candidates.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleAddCandidates}
                  disabled={createProspectMutation.isPending}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {createProspectMutation.isPending && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <UserPlus className="w-4 h-4" />
                  <span>Add Selected ({selectedCandidates.size})</span>
                </button>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content - Split Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Search & Filters */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
            {/* Search Section */}
            <div className="p-4 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Candidates
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, skills..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Basic Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    {CANDIDATE_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source
                  </label>
                  <select
                    value={filters.source}
                    onChange={(e) => handleFilterChange('source', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    {CANDIDATE_SOURCES.map(source => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, State, Country"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Rating Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      placeholder="Min"
                      value={filters.minRating || ''}
                      onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      placeholder="Max"
                      value={filters.maxRating || ''}
                      onChange={(e) => handleFilterChange('maxRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Experience Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (years)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={filters.minExperience || ''}
                      onChange={(e) => handleFilterChange('minExperience', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={filters.maxExperience || ''}
                      onChange={(e) => handleFilterChange('maxExperience', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      placeholder="From"
                      value={filters.appliedAfter}
                      onChange={(e) => handleFilterChange('appliedAfter', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="date"
                      placeholder="To"
                      value={filters.appliedBefore}
                      onChange={(e) => handleFilterChange('appliedBefore', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Skills Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={handleAddSkill}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {filters.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {filters.skills.map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800"
                        >
                          {skill}
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm mb-2"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'ASC' | 'DESC')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="DESC">Descending</option>
                    <option value="ASC">Ascending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center space-x-2 text-sm transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search Candidates</span>
                  </>
                )}
              </button>
              <button
                onClick={handleResetFilters}
                disabled={isLoading}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Right Panel - Candidates List */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${
            panelState === 'expanded' ? 'mr-[66.666667%]' : 
            panelState === 'collapsed' ? 'mr-[33.333333%]' : 
            ''
          }`}>
            {/* Results Header with Active Filters */}
            <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">
                  {isLoading ? 'Loading...' : `${totalCandidates} candidates found`}
                </p>
                {candidates.length > 0 && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.size === candidates.length && candidates.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-gray-600">Select all on page</span>
                  </label>
                )}
              </div>

              {/* Active Filters Display */}
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                    Search: "{filters.search}"
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.status && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                    Status: {CANDIDATE_STATUSES.find(s => s.value === filters.status)?.label}
                    <button
                      onClick={() => handleFilterChange('status', '')}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.source && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                    Source: {CANDIDATE_SOURCES.find(s => s.value === filters.source)?.label}
                    <button
                      onClick={() => handleFilterChange('source', '')}
                      className="ml-1 text-yellow-600 hover:text-yellow-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.location && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                    Location: {filters.location}
                    <button
                      onClick={() => handleFilterChange('location', '')}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(filters.minRating !== undefined || filters.maxRating !== undefined) && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800">
                    Rating: {filters.minRating || 0} - {filters.maxRating || 5}
                    <button
                      onClick={() => {
                        handleFilterChange('minRating', undefined);
                        handleFilterChange('maxRating', undefined);
                      }}
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(filters.minExperience !== undefined || filters.maxExperience !== undefined) && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-pink-100 text-pink-800">
                    Experience: {
                      filters.minExperience !== undefined && filters.maxExperience !== undefined
                        ? `${filters.minExperience}-${filters.maxExperience} years`
                        : filters.minExperience !== undefined
                        ? `${filters.minExperience}+ years`
                        : `≤${filters.maxExperience} years`
                    }
                    <button
                      onClick={() => {
                        handleFilterChange('minExperience', undefined);
                        handleFilterChange('maxExperience', undefined);
                      }}
                      className="ml-1 text-pink-600 hover:text-pink-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-teal-100 text-teal-800"
                  >
                    Skill: {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 text-teal-600 hover:text-teal-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(filters.appliedAfter || filters.appliedBefore) && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                    Date: {filters.appliedAfter} to {filters.appliedBefore || 'now'}
                    <button
                      onClick={() => {
                        handleFilterChange('appliedAfter', '');
                        handleFilterChange('appliedBefore', '');
                      }}
                      className="ml-1 text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.sortBy !== 'createdAt' && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
                    Sort: {SORT_OPTIONS.find(s => s.value === filters.sortBy)?.label} ({filters.sortOrder})
                    <button
                      onClick={() => {
                        handleFilterChange('sortBy', 'createdAt');
                        handleFilterChange('sortOrder', 'DESC');
                      }}
                      className="ml-1 text-orange-600 hover:text-orange-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
            {/* Candidates List - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {!searchTriggered ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Ready to find candidates</p>
                    <p className="text-sm text-gray-400">Use the search and filters on the left, then click "Search Candidates"</p>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading candidates...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-red-500">Error loading candidates. Please try again.</div>
                </div>
              ) : candidates.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">No candidates found</p>
                    <p className="text-sm text-gray-400">Try adjusting your filters</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 p-4">
                  {candidates.map((candidate, index) => {
                    // Map candidate structure similar to search results
                    const personalInfo = {
                      fullName: candidate.fullName || 'Unknown',
                      email: candidate.email || '',
                      location: candidate.location || 'Location not specified',
                      linkedIn: candidate.linkedIn || '',
                      github: candidate.github || ''
                    };

                    const experience = candidate.experience || [];
                    const skills = candidate.skills || [];

                    return (
                      <div
                        key={candidate.id}
                        className={`border rounded-lg p-3 transition-all cursor-pointer ${
                          selectedCandidates.has(candidate.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => handleCandidateSelect(candidate.id)}
                      >
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start space-x-2 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedCandidates.has(candidate.id)}
                              onChange={() => handleCandidateSelect(candidate.id)}
                              className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 min-w-0">
                              <h3
                                className="font-medium text-gray-900 truncate cursor-pointer hover:text-purple-600 transition-colors text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenProfilePanel({
                                    personalInfo,
                                    experience,
                                    skills,
                                    summary: candidate.summary || '',
                                    education: candidate.education || [],
                                    certifications: candidate.certifications || [],
                                    awards: candidate.awards || [],
                                    projects: candidate.projects || [],
                                    languages: candidate.languages || [],
                                    interests: candidate.interests || [],
                                    references: candidate.references || []
                                  }, candidate.id);
                                }}
                                title={personalInfo.fullName}
                              >
                                {personalInfo.fullName}
                              </h3>
                              <p className="text-xs text-gray-600 truncate" title={personalInfo.email}>
                                {personalInfo.email}
                              </p>
                            </div>
                          </div>
                          
                          {/* Status and Rating */}
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {candidate.rating && candidate.rating > 0 && (
                              <span className="flex items-center">
                                ★ {candidate.rating}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Current Position */}
                        {experience && experience.length > 0 && (
                          <div className="text-xs text-gray-500 mb-2 truncate" title={`${experience[0].position} at ${experience[0].company}`}>
                            <span className="font-medium">{experience[0].position}</span> at {experience[0].company}
                          </div>
                        )}

                        {/* Location */}
                        {personalInfo.location && (
                          <div className="text-xs text-gray-500 mb-2 truncate" title={personalInfo.location}>
                            📍 {personalInfo.location}
                          </div>
                        )}

                        {/* Skills */}
                        {skills && skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {skills.slice(0, 3).map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded truncate"
                                title={skill}
                              >
                                {skill}
                              </span>
                            ))}
                            {skills.length > 3 && (
                              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                +{skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Social Links */}
                        {(personalInfo.linkedIn || personalInfo.github) && (
                          <div className="flex items-center space-x-2 mt-2">
                            {personalInfo.linkedIn && (
                              <a 
                                href={personalInfo.linkedIn.startsWith('http') ? personalInfo.linkedIn : `https://${personalInfo.linkedIn}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-400 hover:text-blue-600 transition-colors" 
                                title="LinkedIn"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                              </a>
                            )}
                            {personalInfo.github && (
                              <a 
                                href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-400 hover:text-gray-600 transition-colors" 
                                title="GitHub"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCandidates)} of {totalCandidates} candidates
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const newPage = Math.max(1, currentPage - 1);
                        setCurrentPage(newPage);
                        setActiveQueryParams({...activeQueryParams, page: newPage});
                      }}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              setActiveQueryParams({...activeQueryParams, page: pageNum});
                            }}
                            className={`px-3 py-2 text-sm rounded ${
                              currentPage === pageNum
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => {
                        const newPage = Math.min(totalPages, currentPage + 1);
                        setCurrentPage(newPage);
                        setActiveQueryParams({...activeQueryParams, page: newPage});
                      }}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Side Panel */}
      {panelState !== 'closed' && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            aria-hidden="true"
          />
          
          {/* Side Panel */}
          <div 
            ref={sidePanelRef}
            className="fixed right-0 top-0 h-full bg-white border-l border-gray-200 overflow-hidden z-50"
          >
            {/* Close button for expanded panel */}
            {panelState === 'expanded' && (
              <button
                className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-md"
                onClick={() => handlePanelStateChange('closed')}
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <SourcingProfileSidePanel
              userData={transformCandidateToUserStructuredData(selectedCandidateForProfile)}
              panelState={panelState}
              onStateChange={handlePanelStateChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AddCandidateModal;
