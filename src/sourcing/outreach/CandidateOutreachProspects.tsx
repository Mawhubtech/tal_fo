import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Plus, LayoutGrid, List, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useSourcingProspects, useProjectProspects, useSourcingDefaultPipeline, useMoveSourcingProspectStage, useDeleteSourcingProspect } from '../../hooks/useSourcingProspects';
import { useCandidate } from '../../hooks/useCandidates';
import { useAuthContext } from '../../contexts/AuthContext';
import { SourcingKanbanView } from '../components/pipeline/SourcingKanbanView';
import { SourcingListView } from '../components/pipeline/SourcingListView';
import { SourcingProspect } from '../../services/sourcingApiService';
import SourcingProfileSidePanel, { type PanelState, type UserStructuredData } from './components/SourcingProfileSidePanel';
import AddCandidateModal from './components/AddCandidateModal';

interface SourcingCandidate {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  stage: string;
  score: number;
  lastUpdated: string;
  tags: string[];
  source: string;
  appliedDate: string;
  candidateRating?: number;
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
  education: string;
  degreeType: string;
  position: string;
  company: string;
  interests: string[];
  certifications: string[];
  awards: string[];
  languages: string[];
  _timestamp?: number;
}

const CANDIDATE_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'responded', label: 'Responded' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'closed', label: 'Closed' },
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

interface CandidateOutreachProspectsProps {
  projectId?: string;
}

const CandidateOutreachProspects: React.FC<CandidateOutreachProspectsProps> = ({ projectId }) => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Filter state
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
    education: '',
    degreeType: '',
    position: '',
    company: '',
    interests: [],
    certifications: [],
    awards: [],
    languages: [],
  });

  // Applied filters state (what's actually used for filtering)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    search: '',
    status: '',
    source: '',
    location: '',
    skills: [],
    minRating: undefined,
    maxRating: undefined,
    minExperience: undefined,
    maxExperience: undefined,
    education: '',
    degreeType: '',
    position: '',
    company: '',
    interests: [],
    certifications: [],
    awards: [],
    languages: [],
  });

  // Loading state for filtering
  const [isFiltering, setIsFiltering] = useState(false);

  // Input states for array filters
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [certificationInput, setCertificationInput] = useState('');
  const [awardInput, setAwardInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  
  // Panel and modal state
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [panelState, setPanelState] = useState<PanelState>('closed');
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const sidePanelRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthContext();

  // Handle click outside and escape key to close panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidePanelRef.current && !sidePanelRef.current.contains(event.target as Node)) {
        handlePanelStateChange('closed');
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && panelState !== 'closed') {
        handlePanelStateChange('closed');
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

  // Cleanup effect to ensure scrolling is restored when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Debug effect to track applied filters changes
  useEffect(() => {
    console.log('Applied filters changed:', appliedFilters);
  }, [appliedFilters]);

  // Filter handlers
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    console.log('Filter changed:', key, '=', value);
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      console.log('New filters state:', newFilters);
      return newFilters;
    });
  };

  const handleApplyFilters = async () => {
    console.log('Search button clicked. Current filters:', filters);
    setIsFiltering(true);
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    // Force a new object reference to ensure React Query detects the change
    const newAppliedFilters = { ...filters, _timestamp: Date.now() };
    console.log('Setting applied filters to:', newAppliedFilters);
    setAppliedFilters(newAppliedFilters);
    setIsFiltering(false);
  };

  const handleAddArrayItem = (key: 'skills' | 'interests' | 'certifications' | 'awards' | 'languages', value: string, inputSetter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim() && !filters[key].includes(value.trim())) {
      setFilters(prev => ({
        ...prev,
        [key]: [...prev[key], value.trim()]
      }));
      inputSetter('');
    }
  };

  const handleRemoveArrayItem = (key: 'skills' | 'interests' | 'certifications' | 'awards' | 'languages', index: number) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }));
  };

  const handleResetFilters = async () => {
    setIsFiltering(true);
    const resetFilters = {
      search: '',
      status: '',
      source: '',
      location: '',
      skills: [],
      minRating: undefined,
      maxRating: undefined,
      minExperience: undefined,
      maxExperience: undefined,
      education: '',
      degreeType: '',
      position: '',
      company: '',
      interests: [],
      certifications: [],
      awards: [],
      languages: [],
      _timestamp: Date.now(),
    };
    setFilters(resetFilters);
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    setAppliedFilters(resetFilters);
    setSkillInput('');
    setInterestInput('');
    setCertificationInput('');
    setAwardInput('');
    setLanguageInput('');
    setIsFiltering(false);
  };

  // Load sourcing prospects with filters
  const queryParams = useMemo(() => ({
    search: appliedFilters.search || undefined,
    status: appliedFilters.status || undefined,
    source: appliedFilters.source || undefined,
    location: appliedFilters.location || undefined,
    skills: appliedFilters.skills.length > 0 ? appliedFilters.skills : undefined,
    minRating: appliedFilters.minRating,
    createdBy: user?.id,
    // Note: minExperience and maxExperience are handled by client-side filtering
    // Exclude _timestamp from API params
  }), [appliedFilters.search, appliedFilters.status, appliedFilters.source, appliedFilters.location, appliedFilters.skills, appliedFilters.minRating, user?.id]);
  
  // Use project-specific prospects when projectId is provided, otherwise use global prospects
  const { data: globalSourcingData, isLoading: globalProspectsLoading, error: globalProspectsError } = useSourcingProspects(
    projectId ? {} : queryParams // Only fetch global prospects if no projectId
  );
  const { data: projectSourcingData, isLoading: projectProspectsLoading, error: projectProspectsError } = useProjectProspects(
    projectId || '' // Only fetch project prospects if projectId is provided
  );
  
  // Use the appropriate data source based on whether we have a projectId
  const sourcingData = projectId 
    ? { prospects: projectSourcingData || [], total: (projectSourcingData || []).length }
    : globalSourcingData;
  const prospectsLoading = projectId ? projectProspectsLoading : globalProspectsLoading;
  const prospectsError = projectId ? projectProspectsError : globalProspectsError;
  
  // Debug effect to track query params changes
  useEffect(() => {
    console.log('Query params changed:', queryParams);
  }, [queryParams]);
  
  const { data: defaultPipeline, isLoading: pipelineLoading } = useSourcingDefaultPipeline();
  const { data: selectedCandidateData, isLoading: candidateLoading } = useCandidate(selectedCandidateId || '');
  
  // Mutations
  const moveProspectMutation = useMoveSourcingProspectStage();
  const deleteProspectMutation = useDeleteSourcingProspect();

  const prospects = sourcingData?.prospects || [];
  const activePipeline = defaultPipeline;

  // Debug prospects data
  useEffect(() => {
    console.log('Prospects data updated:', {
      sourcingData,
      prospects: prospects.length,
      isLoading: prospectsLoading,
      error: prospectsError
    });
  }, [sourcingData, prospects.length, prospectsLoading, prospectsError]);

  // Transform prospects to match sourcing candidate interface
  const transformProspectToSourcingCandidate = (prospect: SourcingProspect): SourcingCandidate => {
    const candidate = prospect.candidate;
    const candidateName = candidate?.fullName || `Candidate ${prospect.candidateId}`;
    const candidateEmail = candidate?.email || '';
    const candidatePhone = candidate?.phone || '';
    
    const candidateSkills = candidate?.skillMappings 
      ? candidate.skillMappings.map((mapping: any) => mapping.skill?.name).filter(Boolean)
      : (candidate?.skills ? candidate.skills.map((skill: any) => skill.name || skill) : []);

    const prospectRating = typeof prospect.rating === 'number' ? prospect.rating : 0;
    const candidateRating = candidate?.rating;
    
    let validCandidateRating: number | undefined = undefined;
    if (candidateRating !== undefined && candidateRating !== null) {
      if (typeof candidateRating === 'string') {
        const parsed = parseFloat(candidateRating);
        if (!isNaN(parsed) && parsed >= 0) {
          validCandidateRating = parsed;
        }
      } else if (typeof candidateRating === 'number' && candidateRating >= 0) {
        validCandidateRating = candidateRating;
      }
    }

    return {
      id: prospect.id,
      name: candidateName,
      avatar: candidate?.avatar || '',
      email: candidateEmail,
      phone: candidatePhone,
      stage: prospect.currentStage?.name || prospect.status,
      score: prospectRating,
      lastUpdated: prospect.lastContact || prospect.updatedAt,
      tags: [prospect.source, ...(candidateSkills.slice(0, 2) || [])],
      source: prospect.source,
      appliedDate: prospect.createdAt,
      candidateRating: validCandidateRating,
    };
  };

  // Apply client-side filtering for advanced filters not supported by API
  const filteredProspects = prospects.filter(prospect => {
    const candidate = prospect.candidate;
    
    // Rating filters (max rating is not supported by backend, only minRating)
    if (appliedFilters.maxRating !== undefined && prospect.rating > appliedFilters.maxRating) {
      return false;
    }

    // Experience filters (not supported by backend)
    if (appliedFilters.minExperience !== undefined || appliedFilters.maxExperience !== undefined) {
      const candidateExperience = candidate?.yearsOfExperience || 0;
      console.log('Checking experience filter for candidate:', candidate?.fullName, 'Experience:', candidateExperience, 'Min required:', appliedFilters.minExperience);
      if (appliedFilters.minExperience !== undefined && candidateExperience < appliedFilters.minExperience) {
        console.log('Candidate filtered out due to min experience');
        return false;
      }
      if (appliedFilters.maxExperience !== undefined && candidateExperience > appliedFilters.maxExperience) {
        console.log('Candidate filtered out due to max experience');
        return false;
      }
    }

    // Education filters (not supported by backend)
    if (appliedFilters.education && candidate?.education) {
      const hasEducation = candidate.education.some((edu: any) => 
        edu.institution && edu.institution.toLowerCase().includes(appliedFilters.education.toLowerCase())
      );
      if (!hasEducation) return false;
    }

    // Degree type filter (not supported by backend)
    if (appliedFilters.degreeType && candidate?.education) {
      const hasDegreeType = candidate.education.some((edu: any) => 
        edu.degree && edu.degree.toLowerCase().includes(appliedFilters.degreeType.toLowerCase())
      );
      if (!hasDegreeType) return false;
    }

    // Position filter (not supported by backend)
    if (appliedFilters.position && candidate) {
      const hasPosition = (candidate.currentPosition && candidate.currentPosition.toLowerCase().includes(appliedFilters.position.toLowerCase())) ||
        (candidate.experience && candidate.experience.some((exp: any) => 
          exp.position && exp.position.toLowerCase().includes(appliedFilters.position.toLowerCase())
        ));
      if (!hasPosition) return false;
    }

    // Company filter (not supported by backend)
    if (appliedFilters.company && candidate?.experience) {
      const hasCompany = candidate.experience.some((exp: any) => 
        exp.company && exp.company.toLowerCase().includes(appliedFilters.company.toLowerCase())
      );
      if (!hasCompany) return false;
    }

    // Interests filter (not supported by backend)
    if (appliedFilters.interests.length > 0 && candidate?.interests) {
      const candidateInterests = candidate.interests.map((interest: any) => 
        (interest.name || interest).toLowerCase()
      );
      const hasInterest = appliedFilters.interests.some(interest => 
        candidateInterests.some((candidateInterest: string) => 
          candidateInterest.includes(interest.toLowerCase())
        )
      );
      if (!hasInterest) return false;
    }

    // Certifications filter (not supported by backend)
    if (appliedFilters.certifications.length > 0 && candidate?.certifications) {
      const candidateCertifications = candidate.certifications.map((cert: any) => 
        (cert.name || cert).toLowerCase()
      );
      const hasCertification = appliedFilters.certifications.some(cert => 
        candidateCertifications.some((candidateCert: string) => 
          candidateCert.includes(cert.toLowerCase())
        )
      );
      if (!hasCertification) return false;
    }

    // Awards filter (not supported by backend)
    if (appliedFilters.awards.length > 0 && candidate?.awards) {
      const candidateAwards = candidate.awards.map((award: any) => 
        (award.name || award).toLowerCase()
      );
      const hasAward = appliedFilters.awards.some(award => 
        candidateAwards.some((candidateAward: string) => 
          candidateAward.includes(award.toLowerCase())
        )
      );
      if (!hasAward) return false;
    }

    // Languages filter (not supported by backend)
    if (appliedFilters.languages.length > 0 && candidate?.languages) {
      const candidateLanguages = candidate.languages.map((lang: any) => 
        (lang.language || lang).toLowerCase()
      );
      const hasLanguage = appliedFilters.languages.some(lang => 
        candidateLanguages.some((candidateLang: string) => 
          candidateLang.includes(lang.toLowerCase())
        )
      );
      if (!hasLanguage) return false;
    }

    return true;
  });

  // Transform filtered prospects to sourcing candidates
  const sourcingCandidates = filteredProspects.map(transformProspectToSourcingCandidate);

  // Debug filtered results
  useEffect(() => {
    console.log('Client-side filtering results:', {
      totalProspects: prospects.length,
      filteredProspects: filteredProspects.length,
      hasMinExperience: appliedFilters.minExperience !== undefined,
      minExperience: appliedFilters.minExperience
    });
  }, [prospects.length, filteredProspects.length, appliedFilters.minExperience]);

  // Get all unique skills from prospects for filter options
  const allSkills = Array.from(new Set(prospects.flatMap(p => {
    const candidate = p.candidate;
    const candidateSkills = candidate?.skillMappings 
      ? candidate.skillMappings.map((mapping: any) => mapping.skill?.name).filter(Boolean)
      : (candidate?.skills ? candidate.skills.map((skill: any) => skill.name || skill) : []);
    return candidateSkills;
  })));

  // Pipeline handlers
  const handleCandidateClick = (candidate: SourcingCandidate) => {
    const prospect = prospects.find(p => p.id === candidate.id);
    if (prospect && prospect.candidateId) {
      setSelectedCandidateId(prospect.candidateId);
      setPanelState('expanded');
      // Only prevent background scroll when side panel is opened
      document.body.style.overflow = 'hidden';
    }
  };

  const handlePanelStateChange = (newState: PanelState) => {
    setPanelState(newState);
    if (newState === 'closed') {
      setSelectedCandidateId(null);
      // Restore normal scrolling when panel is closed
      document.body.style.overflow = 'auto';
    }
  };

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

  const handleCandidateStageChange = async (candidateId: string, newStageName: string) => {
    const stage = activePipeline?.stages?.find(s => s.name === newStageName);
    if (!stage) {
      console.error('Stage not found:', newStageName);
      return;
    }

    try {
      await moveProspectMutation.mutateAsync({
        id: candidateId,
        data: { stageId: stage.id }
      });
    } catch (error) {
      console.error('Failed to move prospect:', error);
    }
  };

  const handleCandidateRemove = async (candidate: SourcingCandidate) => {
    try {
      await deleteProspectMutation.mutateAsync(candidate.id);
    } catch (error) {
      console.error('Failed to delete prospect:', error);
    }
  };

  // Show loading state
  if (prospectsLoading || pipelineLoading || isFiltering) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">
            {isFiltering ? 'Filtering prospects...' : 'Loading prospects...'}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (prospectsError) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error loading prospects. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`w-full transition-all duration-300 ${
        panelState === 'expanded' ? 'mr-[66.666667%]' : 
        panelState === 'collapsed' ? 'mr-[33.333333%]' : 
        ''
      }`}>
        <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsAddCandidateModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Candidate</span>
            </button>
            <div className="border-l border-gray-300 h-8"></div>
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
                view === 'kanban' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
                view === 'list' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(appliedFilters.search || appliedFilters.status || appliedFilters.source || appliedFilters.location || appliedFilters.skills.length > 0 || 
          appliedFilters.minRating !== undefined || appliedFilters.maxRating !== undefined || appliedFilters.minExperience !== undefined || 
          appliedFilters.maxExperience !== undefined || appliedFilters.education || appliedFilters.degreeType || appliedFilters.position || 
          appliedFilters.company || appliedFilters.interests.length > 0 || appliedFilters.certifications.length > 0 || 
          appliedFilters.awards.length > 0 || appliedFilters.languages.length > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-900">Active Filters</h3>
              <button
                onClick={handleResetFilters}
                className="text-xs text-blue-600 hover:text-blue-800"
                disabled={isFiltering}
              >
                {isFiltering ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {appliedFilters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Search: {appliedFilters.search}
                </span>
              )}
              {appliedFilters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Status: {CANDIDATE_STATUSES.find(s => s.value === appliedFilters.status)?.label}
                </span>
              )}
              {appliedFilters.source && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Source: {CANDIDATE_SOURCES.find(s => s.value === appliedFilters.source)?.label}
                </span>
              )}
              {appliedFilters.location && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Location: {appliedFilters.location}
                </span>
              )}
              {appliedFilters.minRating !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                  Min Rating: {appliedFilters.minRating}
                </span>
              )}
              {appliedFilters.maxRating !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                  Max Rating: {appliedFilters.maxRating}
                </span>
              )}
              {appliedFilters.minExperience !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                  Min Experience: {appliedFilters.minExperience} years
                </span>
              )}
              {appliedFilters.maxExperience !== undefined && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                  Max Experience: {appliedFilters.maxExperience} years
                </span>
              )}
              {appliedFilters.skills.map((skill, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Skill: {skill}
                </span>
              ))}
              {appliedFilters.education && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Education: {appliedFilters.education}
                </span>
              )}
              {appliedFilters.degreeType && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Degree: {DEGREE_TYPES.find(d => d.value === appliedFilters.degreeType)?.label}
                </span>
              )}
              {appliedFilters.position && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                  Position: {appliedFilters.position}
                </span>
              )}
              {appliedFilters.company && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                  Company: {appliedFilters.company}
                </span>
              )}
              {appliedFilters.interests.map((interest, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-800">
                  Interest: {interest}
                </span>
              ))}
              {appliedFilters.certifications.map((cert, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Certification: {cert}
                </span>
              ))}
              {appliedFilters.awards.map((award, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                  Award: {award}
                </span>
              ))}
              {appliedFilters.languages.map((language, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                  Language: {language}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          {/* Basic Filters Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search prospects..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyFilters();
                    }
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {CANDIDATE_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {CANDIDATE_SOURCES.map(source => (
                  <option key={source.value} value={source.value}>{source.label}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  console.log('Search button clicked!');
                  handleApplyFilters();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                disabled={isFiltering}
              >
                {isFiltering ? 'Searching...' : 'Search'}
              </button>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                disabled={isFiltering}
              >
                {isFiltering ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
                  showAdvancedFilters ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Advanced Filters</span>
                {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Advanced Filters Section */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              {/* Location and Skills Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., New York, Remote"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddArrayItem('skills', skillInput, setSkillInput)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleAddArrayItem('skills', skillInput, setSkillInput)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                  {filters.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filters.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                        >
                          {skill}
                          <button
                            onClick={() => handleRemoveArrayItem('skills', index)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Rating and Experience Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={filters.minRating || ''}
                    onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Rating</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={filters.maxRating || ''}
                    onChange={(e) => handleFilterChange('maxRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Experience (years)</label>
                  <input
                    type="number"
                    min="0"
                    value={filters.minExperience || ''}
                    onChange={(e) => handleFilterChange('minExperience', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Experience (years)</label>
                  <input
                    type="number"
                    min="0"
                    value={filters.maxExperience || ''}
                    onChange={(e) => handleFilterChange('maxExperience', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Education Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education Institution</label>
                  <input
                    type="text"
                    placeholder="e.g., Harvard University"
                    value={filters.education}
                    onChange={(e) => handleFilterChange('education', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Degree Type</label>
                  <select
                    value={filters.degreeType}
                    onChange={(e) => handleFilterChange('degreeType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {DEGREE_TYPES.map(degree => (
                      <option key={degree.value} value={degree.value}>{degree.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Work Experience Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineer"
                    value={filters.position}
                    onChange={(e) => handleFilterChange('position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    placeholder="e.g., Google"
                    value={filters.company}
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Additional Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add interest..."
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddArrayItem('interests', interestInput, setInterestInput)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleAddArrayItem('interests', interestInput, setInterestInput)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                  {filters.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filters.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-800"
                        >
                          {interest}
                          <button
                            onClick={() => handleRemoveArrayItem('interests', index)}
                            className="ml-1 text-pink-600 hover:text-pink-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add certification..."
                      value={certificationInput}
                      onChange={(e) => setCertificationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddArrayItem('certifications', certificationInput, setCertificationInput)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleAddArrayItem('certifications', certificationInput, setCertificationInput)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                  {filters.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filters.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"
                        >
                          {cert}
                          <button
                            onClick={() => handleRemoveArrayItem('certifications', index)}
                            className="ml-1 text-yellow-600 hover:text-yellow-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Awards and Languages Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Awards</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add award..."
                      value={awardInput}
                      onChange={(e) => setAwardInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddArrayItem('awards', awardInput, setAwardInput)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleAddArrayItem('awards', awardInput, setAwardInput)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                  {filters.awards.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filters.awards.map((award, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800"
                        >
                          {award}
                          <button
                            onClick={() => handleRemoveArrayItem('awards', index)}
                            className="ml-1 text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add language..."
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddArrayItem('languages', languageInput, setLanguageInput)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleAddArrayItem('languages', languageInput, setLanguageInput)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                  {filters.languages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filters.languages.map((language, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800"
                        >
                          {language}
                          <button
                            onClick={() => handleRemoveArrayItem('languages', index)}
                            className="ml-1 text-indigo-600 hover:text-indigo-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pipeline Views */}
        {activePipeline ? (
          <>
            {view === 'kanban' && (
              <SourcingKanbanView
                candidates={sourcingCandidates}
                pipeline={activePipeline}
                onCandidateClick={handleCandidateClick}
                onCandidateStageChange={handleCandidateStageChange}
                onCandidateRemove={handleCandidateRemove}
              />
            )}

            {view === 'list' && (
              <SourcingListView
                candidates={sourcingCandidates}
                pipeline={activePipeline}
                onCandidateClick={handleCandidateClick}
                onCandidateStageChange={handleCandidateStageChange}
                onCandidateRemove={handleCandidateRemove}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No pipeline available for outreach candidates.</p>
            <p className="text-sm text-gray-400">Please configure a default pipeline in your settings.</p>
          </div>
        )}
        </div>
      </div>

      {/* Side Panel */}
      {panelState !== 'closed' && (
        <>
          {/* Overlay for click outside detection */}
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
              userData={transformCandidateToUserStructuredData(selectedCandidateData)}
              panelState={panelState}
              onStateChange={handlePanelStateChange}
              candidateId={selectedCandidateId || undefined}
            />
          </div>
        </>
      )}
      
      {/* Add Candidate Modal */}
      <AddCandidateModal
        isOpen={isAddCandidateModalOpen}
        onClose={() => setIsAddCandidateModalOpen(false)}
        onSuccess={() => {
          // The useSourcingProspects query will automatically refetch due to React Query invalidation
        }}
        projectId={projectId}
      />
    </>
  );
};

export default CandidateOutreachProspects;
