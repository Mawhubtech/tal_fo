import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Plus, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCandidates, useCandidate } from '../../../hooks/useCandidates';
import { useCreateSourcingProspect, useAddProspectsToProject, useSourcingDefaultPipeline, useSourcingProspectsByPipeline } from '../../../hooks/useSourcingProspects';
import { CandidateQueryParams } from '../../../services/candidatesService';
import SourcingProfileSidePanel, { type PanelState, type UserStructuredData } from './SourcingProfileSidePanel';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectId?: string; // Optional for backward compatibility
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
  // New filters
  education: string;
  degreeType: string;
  position: string;
  company: string;
  interests: string[];
  certifications: string[];
  awards: string[];
  languages: string[];
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

const DEGREE_TYPES = [
  { value: '', label: 'All Degrees' },
  { value: 'associate', label: 'Associate' },
  { value: 'bachelor', label: 'Bachelor' },
  { value: 'master', label: 'Master' },
  { value: 'phd', label: 'PhD' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'other', label: 'Other' },
];

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ isOpen, onClose, onSuccess, projectId }) => {
  const queryClient = useQueryClient();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeQueryParams, setActiveQueryParams] = useState<CandidateQueryParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  // Profile side panel state
  const [selectedCandidateForProfile, setSelectedCandidateForProfile] = useState<any>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
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
    // New filters
    education: '',
    degreeType: '',
    position: '',
    company: '',
    interests: [],
    certifications: [],
    awards: [],
    languages: [],
  });

  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [certificationInput, setCertificationInput] = useState('');
  const [awardInput, setAwardInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  const { data: candidatesData, isLoading, error, refetch } = useCandidates(activeQueryParams);
  const createProspectMutation = useCreateSourcingProspect();
  const addProspectsToProjectMutation = useAddProspectsToProject();
  const { data: defaultPipeline } = useSourcingDefaultPipeline();
  const { data: currentProspects } = useSourcingProspectsByPipeline(defaultPipeline?.id || '');
  
  // Load candidate data for side panel (similar to CandidateOutreachProspects.tsx)
  const { data: selectedCandidateData, isLoading: candidateLoading } = useCandidate(selectedCandidateId || '');

  const candidates = candidatesData?.items || [];
  const totalCandidates = candidatesData?.total || 0;
  const totalPages = candidatesData?.totalPages || 1;

  // Create a set of candidate IDs already in the pipeline
  const candidatesInPipeline = new Set(
    currentProspects?.map((prospect: any) => prospect.candidateId) || []
  );

  // Combined loading state
  const isLoadingCandidates = isLoading || isSearching;

  // State for individual candidate additions
  const [addingCandidateId, setAddingCandidateId] = useState<string | null>(null);
  const [showStageDropdown, setShowStageDropdown] = useState<string | null>(null);

  // Clear selections when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCandidates(new Set());
      setCurrentPage(1);
      setPanelState('closed');
      setSelectedCandidateForProfile(null);
      setSelectedCandidateId(null);
      setSearchTriggered(false);
      setIsSearching(false);
      // Reset to initial empty state when modal closes
      setActiveQueryParams({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
    } else {
      // When modal opens, automatically load all candidates
      setSearchTriggered(true);
      setActiveQueryParams({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
    }
  }, [isOpen]);

  // Watch for loading state changes to update local loading state
  useEffect(() => {
    if (!isLoading && searchTriggered) {
      setIsSearching(false);
    }
  }, [isLoading, searchTriggered]);

  // Also watch for data/error changes to ensure loading stops
  useEffect(() => {
    if (searchTriggered && (candidatesData || error)) {
      setIsSearching(false);
    }
  }, [candidatesData, error, searchTriggered]);

  // Clear selected candidates when prospects data changes to avoid selecting already added candidates
  useEffect(() => {
    if (currentProspects) {
      setSelectedCandidates(prev => {
        const newSelected = new Set(prev);
        currentProspects.forEach((prospect: any) => {
          newSelected.delete(prospect.candidateId);
        });
        return newSelected;
      });
    }
  }, [currentProspects]);

  // Handle click outside panel to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidePanelRef.current && !sidePanelRef.current.contains(event.target as Node)) {
        setPanelState('closed');
        setSelectedCandidateForProfile(null);
        setSelectedCandidateId(null);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && panelState !== 'closed') {
        setPanelState('closed');
        setSelectedCandidateForProfile(null);
        setSelectedCandidateId(null);
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

  // Modal-level ESC key handler and body scroll prevention
  useEffect(() => {
    if (isOpen) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
      
      // ESC key handler for closing the modal
      const handleModalEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleModalEsc);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleModalEsc);
      };
    }
  }, [isOpen, onClose]);

  // Overlay click handler
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // Build query params with all supported filters
    const queryParams: CandidateQueryParams = {
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
      // New comprehensive filters - now fully supported!
      ...(filters.education && { education: filters.education }),
      ...(filters.degreeType && { degreeType: filters.degreeType }),
      ...(filters.position && { position: filters.position }),
      ...(filters.company && { company: filters.company }),
      ...(filters.interests.length > 0 && { interests: filters.interests }),
      ...(filters.certifications.length > 0 && { certifications: filters.certifications }),
      ...(filters.awards.length > 0 && { awards: filters.awards }),
      ...(filters.languages.length > 0 && { languages: filters.languages }),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
    
    setCurrentPage(1);
    setSearchTriggered(true);
    setIsSearching(true); // Start local loading state
    setActiveQueryParams(queryParams);
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
      // New filters
      education: '',
      degreeType: '',
      position: '',
      company: '',
      interests: [],
      certifications: [],
      awards: [],
      languages: [],
    });
    setSkillInput('');
    setInterestInput('');
    setCertificationInput('');
    setAwardInput('');
    setLanguageInput('');
    setCurrentPage(1);
    
    // Reset to show all candidates (no filters applied)
    const initialParams: CandidateQueryParams = {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };
    setSearchTriggered(true);
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

  const handleAddInterest = () => {
    if (interestInput.trim() && !filters.interests.includes(interestInput.trim())) {
      handleFilterChange('interests', [...filters.interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    handleFilterChange('interests', filters.interests.filter(interest => interest !== interestToRemove));
  };

  const handleAddCertification = () => {
    if (certificationInput.trim() && !filters.certifications.includes(certificationInput.trim())) {
      handleFilterChange('certifications', [...filters.certifications, certificationInput.trim()]);
      setCertificationInput('');
    }
  };

  const handleRemoveCertification = (certToRemove: string) => {
    handleFilterChange('certifications', filters.certifications.filter(cert => cert !== certToRemove));
  };

  const handleAddAward = () => {
    if (awardInput.trim() && !filters.awards.includes(awardInput.trim())) {
      handleFilterChange('awards', [...filters.awards, awardInput.trim()]);
      setAwardInput('');
    }
  };

  const handleRemoveAward = (awardToRemove: string) => {
    handleFilterChange('awards', filters.awards.filter(award => award !== awardToRemove));
  };

  const handleAddLanguage = () => {
    if (languageInput.trim() && !filters.languages.includes(languageInput.trim())) {
      handleFilterChange('languages', [...filters.languages, languageInput.trim()]);
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    handleFilterChange('languages', filters.languages.filter(lang => lang !== langToRemove));
  };

  const handleCandidateSelect = (candidateId: string) => {
    // Don't allow selecting candidates already in pipeline
    if (candidatesInPipeline.has(candidateId)) return;
    
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

      if (projectId) {
        // Use project-specific API when projectId is provided
        await addProspectsToProjectMutation.mutateAsync({
          projectId,
          data: {
            candidateIds: Array.from(selectedCandidates),
            stageId: firstStage.id,
          },
        });
      } else {
        // Use general prospect creation for backward compatibility
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
      }
      
      setSelectedCandidates(new Set());
      onSuccess?.();
      
      // Invalidate prospects cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ['sourcing_prospects'] });
      onClose();
    } catch (error) {
      console.error('Failed to add candidates:', error);
      // You could add a toast notification here
    }
  };

  // Handle adding individual candidate with stage selection
  const handleAddSingleCandidate = async (candidateId: string, stageId: string) => {
    if (!defaultPipeline) {
      console.error('No default pipeline found');
      return;
    }

    try {
      setAddingCandidateId(candidateId);
      
      if (projectId) {
        // Use project-specific API when projectId is provided
        await addProspectsToProjectMutation.mutateAsync({
          projectId,
          data: {
            candidateIds: [candidateId],
            stageId: stageId,
          },
        });
      } else {
        // Use general prospect creation for backward compatibility
        await createProspectMutation.mutateAsync({
          candidateId,
          status: 'new',
          source: 'other',
          rating: 0,
          pipelineId: defaultPipeline.id,
          currentStageId: stageId,
          notes: 'Added manually from candidate database',
        });
      }

      // Remove from selected if it was selected
      if (selectedCandidates.has(candidateId)) {
        const newSelected = new Set(selectedCandidates);
        newSelected.delete(candidateId);
        setSelectedCandidates(newSelected);
      }

      setShowStageDropdown(null);
      onSuccess?.();
      
      // Invalidate prospects cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ['sourcing_prospects'] });
    } catch (error) {
      console.error('Failed to add candidate:', error);
    } finally {
      setAddingCandidateId(null);
    }
  };

  // Close stage dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStageDropdown && !(event.target as Element).closest('.stage-dropdown')) {
        setShowStageDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStageDropdown]);

  // Handle opening profile panel
  const handleOpenProfilePanel = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setPanelState('expanded');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  // Handle panel state change
  const handlePanelStateChange = (newState: PanelState) => {
    setPanelState(newState);
    if (newState === 'closed') {
      setSelectedCandidateForProfile(null);
      setSelectedCandidateId(null);
      document.body.style.overflow = 'auto'; // Restore background scroll
    }
  };

  // Transform candidate data to UserStructuredData format (same as CandidateOutreachProspects.tsx)
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
      skills: candidate.skillMappings?.map((mapping: any) => mapping.skill?.name || mapping).filter(Boolean) || 
               candidate.skills || [],
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
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
                  onClick={() => {
                    const availableCandidates = candidates.filter(c => !candidatesInPipeline.has(c.id));
                    if (selectedCandidates.size === availableCandidates.length) {
                      setSelectedCandidates(new Set());
                    } else {
                      setSelectedCandidates(new Set(availableCandidates.map(c => c.id)));
                    }
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {selectedCandidates.size === candidates.filter(c => !candidatesInPipeline.has(c.id)).length ? 'Deselect All' : 'Select All Available'}
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
          <div className="w-96 border-r border-gray-200 bg-gray-50 flex flex-col">
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
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
                  />
                </div>

                {/* Work Experience Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Position
                  </label>
                  <input
                    type="text"
                    placeholder="Job title..."
                    value={filters.position}
                    onChange={(e) => handleFilterChange('position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    placeholder="Company name..."
                    value={filters.company}
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
                  />
                </div>

                {/* Education Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education
                  </label>
                  <input
                    type="text"
                    placeholder="School or university..."
                    value={filters.education}
                    onChange={(e) => handleFilterChange('education', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Degree Type
                  </label>
                  <select
                    value={filters.degreeType}
                    onChange={(e) => handleFilterChange('degreeType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
                  >
                    {DEGREE_TYPES.map(degree => (
                      <option key={degree.value} value={degree.value}>
                        {degree.label}
                      </option>
                    ))}
                  </select>
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
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      placeholder="Max"
                      value={filters.maxRating || ''}
                      onChange={(e) => handleFilterChange('maxRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
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
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={filters.maxExperience || ''}
                      onChange={(e) => handleFilterChange('maxExperience', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
                    />
                    <input
                      type="date"
                      placeholder="To"
                      value={filters.appliedBefore}
                      onChange={(e) => handleFilterChange('appliedBefore', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
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

                {/* Interests Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interests
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add interest..."
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
                    />
                    <button
                      onClick={handleAddInterest}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {filters.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {filters.interests.map(interest => (
                        <span
                          key={interest}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                        >
                          {interest}
                          <button
                            onClick={() => handleRemoveInterest(interest)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certifications Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certifications
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add certification..."
                      value={certificationInput}
                      onChange={(e) => setCertificationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCertification()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
                    />
                    <button
                      onClick={handleAddCertification}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {filters.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {filters.certifications.map(cert => (
                        <span
                          key={cert}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800"
                        >
                          {cert}
                          <button
                            onClick={() => handleRemoveCertification(cert)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Awards Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Awards
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add award..."
                      value={awardInput}
                      onChange={(e) => setAwardInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddAward()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
                    />
                    <button
                      onClick={handleAddAward}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {filters.awards.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {filters.awards.map(award => (
                        <span
                          key={award}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800"
                        >
                          {award}
                          <button
                            onClick={() => handleRemoveAward(award)}
                            className="ml-1 text-yellow-600 hover:text-yellow-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Languages Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add language..."
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
                    />
                    <button
                      onClick={handleAddLanguage}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {filters.languages.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {filters.languages.map(lang => (
                        <span
                          key={lang}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800"
                        >
                          {lang}
                          <button
                            onClick={() => handleRemoveLanguage(lang)}
                            className="ml-1 text-indigo-600 hover:text-indigo-800"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm mb-2"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm"
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
                disabled={isLoadingCandidates}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center space-x-2 text-sm transition-colors"
              >
                {isLoadingCandidates ? (
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
                disabled={isLoadingCandidates}
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
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-600">
                    {isLoadingCandidates ? 'Loading...' : `${totalCandidates} candidates found`}
                  </p>
                  {candidatesInPipeline.size > 0 && (
                    <span className="text-sm text-green-600">
                      {candidatesInPipeline.size} already in pipeline
                    </span>
                  )}
                </div>
                {candidates.length > 0 && !isLoadingCandidates && (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.size === candidates.filter(c => !candidatesInPipeline.has(c.id)).length && candidates.filter(c => !candidatesInPipeline.has(c.id)).length > 0}
                      onChange={() => {
                        const availableCandidates = candidates.filter(c => !candidatesInPipeline.has(c.id));
                        if (selectedCandidates.size === availableCandidates.length) {
                          setSelectedCandidates(new Set());
                        } else {
                          setSelectedCandidates(new Set(availableCandidates.map(c => c.id)));
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
                    />
                    <span className="text-xs text-gray-600">Select all available</span>
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
                {filters.education && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-800">
                    Education: {filters.education}
                    <button
                      onClick={() => handleFilterChange('education', '')}
                      className="ml-1 text-emerald-600 hover:text-emerald-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.degreeType && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-lime-100 text-lime-800">
                    Degree: {DEGREE_TYPES.find(d => d.value === filters.degreeType)?.label}
                    <button
                      onClick={() => handleFilterChange('degreeType', '')}
                      className="ml-1 text-lime-600 hover:text-lime-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.position && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-cyan-100 text-cyan-800">
                    Position: {filters.position}
                    <button
                      onClick={() => handleFilterChange('position', '')}
                      className="ml-1 text-cyan-600 hover:text-cyan-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.company && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-sky-100 text-sky-800">
                    Company: {filters.company}
                    <button
                      onClick={() => handleFilterChange('company', '')}
                      className="ml-1 text-sky-600 hover:text-sky-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.interests.map(interest => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                  >
                    Interest: {interest}
                    <button
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.certifications.map(cert => (
                  <span
                    key={cert}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800"
                  >
                    Cert: {cert}
                    <button
                      onClick={() => handleRemoveCertification(cert)}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.awards.map(award => (
                  <span
                    key={award}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800"
                  >
                    Award: {award}
                    <button
                      onClick={() => handleRemoveAward(award)}
                      className="ml-1 text-yellow-600 hover:text-yellow-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.languages.map(lang => (
                  <span
                    key={lang}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800"
                  >
                    Language: {lang}
                    <button
                      onClick={() => handleRemoveLanguage(lang)}
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
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
              {isLoadingCandidates ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Searching candidates...</p>
                  </div>
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
                <div className="space-y-3 p-4">
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
                        className={`border rounded-lg p-4 transition-all cursor-pointer ${
                          selectedCandidates.has(candidate.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => handleCandidateSelect(candidate.id)}
                      >
                        <div className="flex items-start space-x-4">
                          {/* Checkbox and Add button */}
                          <div className="flex flex-col items-center space-y-2 mt-1">
                            <input
                              type="checkbox"
                              checked={selectedCandidates.has(candidate.id)}
                              onChange={() => handleCandidateSelect(candidate.id)}
                              disabled={candidatesInPipeline.has(candidate.id)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={(e) => e.stopPropagation()}
                            />
                            
                            {/* Individual Add button with stage selection */}
                            <div className="relative">
                              {candidatesInPipeline.has(candidate.id) ? (
                                <div className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded flex items-center gap-1 min-w-[60px] justify-center">
                                  <span>✓ Added</span>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (showStageDropdown === candidate.id) {
                                      setShowStageDropdown(null);
                                    } else {
                                      setShowStageDropdown(candidate.id);
                                    }
                                  }}
                                  disabled={addingCandidateId === candidate.id}
                                  className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 min-w-[60px] justify-center"
                                  title="Add to pipeline"
                                >
                                  {addingCandidateId === candidate.id ? (
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <>
                                      <Plus size={12} />
                                      <span>Add</span>
                                    </>
                                  )}
                                </button>
                              )}
                              
                              {/* Stage selection dropdown */}
                              {showStageDropdown === candidate.id && defaultPipeline?.stages && !candidatesInPipeline.has(candidate.id) && (
                                <div className="stage-dropdown absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[160px]">
                                  <div className="py-1">
                                    <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                                      Select Stage
                                    </div>
                                    {defaultPipeline.stages.map((stage) => {
                                      // Check if stage orders start from 0, if so display +1
                                      const minOrder = Math.min(...defaultPipeline.stages.map(s => s.order));
                                      const displayOrder = minOrder === 0 ? stage.order + 1 : stage.order;
                                      
                                      return (
                                        <button
                                          key={stage.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddSingleCandidate(candidate.id, stage.id);
                                          }}
                                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                                          disabled={addingCandidateId === candidate.id}
                                        >
                                          <span>{stage.name}</span>
                                          <span className="text-xs text-gray-400">#{displayOrder}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Avatar placeholder */}
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-600 font-medium text-sm">
                              {personalInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                          
                          {/* Main content */}
                          <div className="flex-1 min-w-0">
                            {/* Header row */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3
                                    className="text-base font-medium text-gray-900 truncate cursor-pointer hover:text-purple-600 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenProfilePanel(candidate.id);
                                    }}
                                    title={personalInfo.fullName}
                                  >
                                    {personalInfo.fullName}
                                  </h3>
                                  {candidatesInPipeline.has(candidate.id) && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                      In Pipeline
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 truncate" title={personalInfo.email}>
                                  {personalInfo.email}
                                </p>
                              </div>
                              
                              {/* Rating and actions */}
                              <div className="flex items-center space-x-3 ml-4">
                                {candidate.rating && candidate.rating > 0 && (
                                  <span className="flex items-center text-sm text-gray-500">
                                    <span className="text-yellow-400 mr-1">★</span>
                                    {candidate.rating}
                                  </span>
                                )}
                                
                                {/* Social links */}
                                <div className="flex items-center space-x-2">
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
                              </div>
                            </div>
                            
                            {/* Current position and location */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 mb-3">
                              {experience && experience.length > 0 && (
                                <div className="text-sm text-gray-700">
                                  <span className="font-medium">{experience[0].position}</span>
                                  {experience[0].company && (
                                    <span> at <span className="font-medium">{experience[0].company}</span></span>
                                  )}
                                </div>
                              )}
                              
                              {personalInfo.location && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <span className="mr-1">📍</span>
                                  {personalInfo.location}
                                </div>
                              )}
                            </div>
                            
                            {/* Skills */}
                            {skills && skills.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {skills.slice(0, 5).map((skill, skillIndex) => (
                                  <span
                                    key={skillIndex}
                                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                    title={skill}
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {skills.length > 5 && (
                                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                    +{skills.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
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
            className="fixed inset-0 bg-black bg-opacity-50 z-[65]"
            aria-hidden="true"
          />
          
          {/* Side Panel */}
          <div 
            ref={sidePanelRef}
            className="fixed right-0 top-0 h-full bg-white border-l border-gray-200 overflow-hidden z-[70]"
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
              userData={transformCandidateToUserStructuredData(selectedCandidateData)}
              panelState={panelState}
              onStateChange={handlePanelStateChange}
              candidateId={selectedCandidateId || undefined}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AddCandidateModal;
