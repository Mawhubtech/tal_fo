import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Plus, UserPlus, ChevronLeft, ChevronRight, Briefcase, Upload, FileText, CheckCircle, Users } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCandidates, useCandidate } from '../hooks/useCandidates';
import { useCreateJobApplicationWithPipeline } from '../hooks/useJobApplications';
import { useCVProcessing } from '../hooks/useCVProcessing';
import { CandidateQueryParams } from '../services/candidatesService';
import CandidatePreviewPanel, { type PanelState } from './CandidatePreviewPanel';
import { getAvatarUrl } from '../utils/fileUtils';

interface AddCandidateToJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  jobId: string;
  jobTitle?: string;
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

const AddCandidateToJobModal: React.FC<AddCandidateToJobModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  jobId,
  jobTitle 
}) => {
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
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [panelState, setPanelState] = useState<PanelState>('closed');
  const sidePanelRef = useRef<HTMLDivElement>(null);

  // Tab state for switching between browse and upload
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');
  
  // CV Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { processAndAddToJob, loading: cvProcessing, error: cvError } = useCVProcessing();

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
  const createJobApplicationMutation = useCreateJobApplicationWithPipeline();

  const candidates = candidatesData?.items || [];
  const totalCandidates = candidatesData?.total || 0;
  const totalPages = candidatesData?.totalPages || 1;

  // Combined loading state
  const isLoadingCandidates = isLoading || isSearching;

  // State for individual candidate additions
  const [addingCandidateId, setAddingCandidateId] = useState<string | null>(null);
  const [addedCandidateIds, setAddedCandidateIds] = useState<Set<string>>(new Set());

  // Clear selections when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCandidates(new Set());
      setCurrentPage(1);
      setPanelState('closed');
      setSelectedCandidateId(null);
      setSearchTriggered(false);
      setIsSearching(false);
      setAddedCandidateIds(new Set());
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

  // Watch for loading state changes
  useEffect(() => {
    if (!isLoading && searchTriggered) {
      setIsSearching(false);
    }
  }, [isLoading, searchTriggered]);

  useEffect(() => {
    if (searchTriggered && (candidatesData || error)) {
      setIsSearching(false);
    }
  }, [candidatesData, error, searchTriggered]);

  // Handle click outside panel to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidePanelRef.current && !sidePanelRef.current.contains(event.target as Node)) {
        setPanelState('closed');
        setSelectedCandidateId(null);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && panelState !== 'closed') {
        setPanelState('closed');
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
      document.body.style.overflow = 'hidden';
      
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

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const queryParams: CandidateQueryParams = {
      page: 1,
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

    setIsSearching(true);
    setSearchTriggered(true);
    setActiveQueryParams(queryParams);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
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
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setActiveQueryParams(prev => ({ ...prev, page }));
  };

  const handleToggleCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCandidates.size === candidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(candidates.map((c: any) => c.id)));
    }
  };

  const handleAddSingleCandidate = async (candidateId: string) => {
    if (addedCandidateIds.has(candidateId)) return;

    setAddingCandidateId(candidateId);
    try {
      await createJobApplicationMutation.mutateAsync({
        jobId,
        candidateId,
      });
      
      setAddedCandidateIds(prev => new Set(prev).add(candidateId));
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    } catch (error) {
      console.error('Error adding candidate to job:', error);
    } finally {
      setAddingCandidateId(null);
    }
  };

  const handleAddSelectedCandidates = async () => {
    if (selectedCandidates.size === 0) return;

    try {
      const promises = Array.from(selectedCandidates).map(candidateId =>
        createJobApplicationMutation.mutateAsync({
          jobId,
          candidateId,
        })
      );

      await Promise.all(promises);
      
      setAddedCandidateIds(prev => {
        const newSet = new Set(prev);
        selectedCandidates.forEach(id => newSet.add(id));
        return newSet;
      });

      setSelectedCandidates(new Set());
      
      // Notify parent component of success - parent will handle query invalidation
      // IMPORTANT: await the callback since parent's onSuccess is async
      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error('Error adding candidates to job:', error);
    }
  };

  const handleCandidateClick = (candidate: any) => {
    setSelectedCandidateId(candidate.id);
    setPanelState('expanded');
  };

  // Array manipulation handlers
  const addSkill = () => {
    if (skillInput.trim() && !filters.skills.includes(skillInput.trim())) {
      handleFilterChange('skills', [...filters.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    handleFilterChange('skills', filters.skills.filter(s => s !== skill));
  };

  const addInterest = () => {
    if (interestInput.trim() && !filters.interests.includes(interestInput.trim())) {
      handleFilterChange('interests', [...filters.interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    handleFilterChange('interests', filters.interests.filter(i => i !== interest));
  };

  const addCertification = () => {
    if (certificationInput.trim() && !filters.certifications.includes(certificationInput.trim())) {
      handleFilterChange('certifications', [...filters.certifications, certificationInput.trim()]);
      setCertificationInput('');
    }
  };

  const removeCertification = (cert: string) => {
    handleFilterChange('certifications', filters.certifications.filter(c => c !== cert));
  };

  const addAward = () => {
    if (awardInput.trim() && !filters.awards.includes(awardInput.trim())) {
      handleFilterChange('awards', [...filters.awards, awardInput.trim()]);
      setAwardInput('');
    }
  };

  const removeAward = (award: string) => {
    handleFilterChange('awards', filters.awards.filter(a => a !== award));
  };

  const addLanguage = () => {
    if (languageInput.trim() && !filters.languages.includes(languageInput.trim())) {
      handleFilterChange('languages', [...filters.languages, languageInput.trim()]);
      setLanguageInput('');
    }
  };

  const removeLanguage = (lang: string) => {
    handleFilterChange('languages', filters.languages.filter(l => l !== lang));
  };

  // CV Upload handlers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  };

  const handleProcessAndAddToJob = async () => {
    if (!selectedFile || !jobId) return;

    try {
      // Reset processing step
      setProcessingStep(0);
      
      // Step 1: Uploading & Extracting (0-2 seconds)
      setProcessingStep(1);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 2: AI analyzing content (2-8 seconds) - Main work
      setProcessingStep(2);
      
      // Start actual processing
      const result = await processAndAddToJob(selectedFile, jobId);
      
      if (result) {
        // Step 3: Finalizing (8-9 seconds)
        setProcessingStep(3);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('[CV Upload] Processing complete, setting success state');
        setUploadSuccess(true);
        setSelectedFile(null);
        setProcessingStep(0);
        
        // Notify parent component of success - parent will handle query invalidation
        // IMPORTANT: await the callback since parent's onSuccess is async
        if (onSuccess) {
          console.log('[CV Upload] Calling onSuccess callback...');
          await onSuccess();
          console.log('[CV Upload] onSuccess callback completed');
        } else {
          console.warn('[CV Upload] No onSuccess callback provided!');
        }
        
        // Keep modal open so user can upload more CVs or view the newly added candidate
      }
    } catch (err) {
      console.error('Error processing CV and adding to job:', err);
      setProcessingStep(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-[95vw] max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-purple-600" />
                Add Candidates to Job
              </h2>
              {jobTitle && (
                <p className="text-sm text-gray-600 mt-1">Job: {jobTitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-200">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <UserPlus className="w-4 h-4 inline-block mr-2" />
              Browse Existing Candidates
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Upload className="w-4 h-4 inline-block mr-2" />
              Upload New CV
            </button>
          </div>
        </div>

        {/* Browse Tab Content */}
        {activeTab === 'browse' && (
          <>
        {/* Filters Section */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, skills..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {CANDIDATE_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {CANDIDATE_SOURCES.map(source => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              <Filter className="w-4 h-4" />
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear Filters
              </button>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-medium flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="e.g. New York, USA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  value={filters.position}
                  onChange={(e) => handleFilterChange('position', e.target.value)}
                  placeholder="e.g. Senior Developer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={filters.company}
                  onChange={(e) => handleFilterChange('company', e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <input
                  type="text"
                  value={filters.education}
                  onChange={(e) => handleFilterChange('education', e.target.value)}
                  placeholder="e.g. MIT"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Degree Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree Type
                </label>
                <select
                  value={filters.degreeType}
                  onChange={(e) => handleFilterChange('degreeType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {DEGREE_TYPES.map(degree => (
                    <option key={degree.value} value={degree.value}>
                      {degree.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Range */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Experience (years)
                  </label>
                  <input
                    type="number"
                    value={filters.minExperience ?? ''}
                    onChange={(e) => handleFilterChange('minExperience', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Experience (years)
                  </label>
                  <input
                    type="number"
                    value={filters.maxExperience ?? ''}
                    onChange={(e) => handleFilterChange('maxExperience', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add skill and press Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {filters.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filters.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button onClick={() => removeSkill(skill)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Languages */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Languages
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    placeholder="Add language and press Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={addLanguage}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {filters.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filters.languages.map(lang => (
                      <span
                        key={lang}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {lang}
                        <button onClick={() => removeLanguage(lang)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Selection Header */}
            {candidates.length > 0 && (
              <div className="flex items-center justify-between mb-4 p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.size === candidates.length && candidates.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({selectedCandidates.size} of {totalCandidates} selected)
                    </span>
                  </label>
                </div>
                {selectedCandidates.size > 0 && (
                  <button
                    onClick={handleAddSelectedCandidates}
                    disabled={createJobApplicationMutation.isPending}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add {selectedCandidates.size} Candidate{selectedCandidates.size !== 1 ? 's' : ''} to Job
                  </button>
                )}
              </div>
            )}

            {/* Loading State */}
            {isLoadingCandidates && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Searching candidates...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoadingCandidates && (
              <div className="text-center py-12">
                <p className="text-red-600">Error loading candidates. Please try again.</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingCandidates && !error && candidates.length === 0 && searchTriggered && (
              <div className="text-center py-12">
                <p className="text-gray-600">No candidates found matching your criteria.</p>
              </div>
            )}

            {/* Candidates Grid */}
            {!isLoadingCandidates && !error && candidates.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {candidates.map((candidate: any) => {
                  const isAdded = addedCandidateIds.has(candidate.id);
                  const isAdding = addingCandidateId === candidate.id;

                  return (
                    <div
                      key={candidate.id}
                      className={`p-4 border rounded-lg hover:border-purple-300 transition-all ${
                        selectedCandidates.has(candidate.id) ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      } ${isAdded ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedCandidates.has(candidate.id)}
                          onChange={() => handleToggleCandidate(candidate.id)}
                          disabled={isAdded}
                          className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />

                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {candidate.avatar ? (
                            <img
                              src={getAvatarUrl(candidate.avatar) || ''}
                              alt={candidate.fullName}
                              className="h-12 w-12 rounded-full object-cover"
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
                            className={`h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center ${
                              candidate.avatar ? 'hidden' : ''
                            }`}
                          >
                            <span className="text-sm font-medium text-purple-600">
                              {candidate.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                            </span>
                          </div>
                        </div>

                        {/* Candidate Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3
                                className="font-semibold text-gray-900 hover:text-purple-600 cursor-pointer"
                                onClick={() => handleCandidateClick(candidate)}
                              >
                                {candidate.fullName}
                              </h3>
                              <p className="text-sm text-gray-600">{candidate.currentPosition || 'No position specified'}</p>
                              {candidate.location && (
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <span className="w-4 h-4">📍</span>
                                  {candidate.location}
                                </p>
                              )}
                            </div>

                            {/* Add Button */}
                            <button
                              onClick={() => handleAddSingleCandidate(candidate.id)}
                              disabled={isAdded || isAdding}
                              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                                isAdded
                                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              {isAdding ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Adding...
                                </>
                              ) : isAdded ? (
                                <>
                                  <UserPlus className="w-4 h-4" />
                                  Added
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-4 h-4" />
                                  Add to Job
                                </>
                              )}
                            </button>
                          </div>

                          {/* Skills */}
                          {candidate.skills && candidate.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {candidate.skills.slice(0, 5).map((skill: string) => (
                                <span
                                  key={skill}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                              {candidate.skills.length > 5 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                                  +{candidate.skills.length - 5} more
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

            {/* Pagination */}
            {!isLoadingCandidates && candidates.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing page {currentPage} of {totalPages} ({totalCandidates} total candidates)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Candidate Preview Panel */}
          {panelState !== 'closed' && selectedCandidateId && (
            <div ref={sidePanelRef}>
              <CandidatePreviewPanel
                candidateId={selectedCandidateId}
                state={panelState}
                onStateChange={setPanelState}
                onClose={() => {
                  setPanelState('closed');
                  setSelectedCandidateId(null);
                }}
              />
            </div>
          )}
        </div>
          </>
        )}

        {/* Upload Tab Content */}
        {activeTab === 'upload' && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Upload Candidate CV
                </h3>
                <p className="text-gray-600">
                  Upload a resume and we'll automatically process it, create the candidate, and add them to this job
                </p>
              </div>

              {uploadSuccess ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8">
                  <div className="text-center mb-6">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      Success!
                    </h4>
                    <p className="text-gray-600">
                      CV processed, candidate created, and added to job successfully
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadSuccess(false);
                        setSelectedFile(null);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Another CV
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setActiveTab('browse')}
                      className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-xl font-semibold transition-all duration-200"
                    >
                      <Users className="w-5 h-5" />
                      View All Candidates
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-2 border-dashed border-gray-300 hover:border-purple-400 rounded-2xl p-12 text-center bg-white transition-all duration-200 mb-6">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-purple-100 rounded-2xl mb-6">
                        <FileText className="w-12 h-12 text-purple-600" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Candidate CV</h3>
                      <p className="text-sm text-gray-600 mb-6 max-w-md">
                        Drag and drop your file here, or click below to browse.
                        <br />
                        <span className="text-xs text-gray-500">Supports PDF, DOCX, DOC, and TXT • Maximum 10MB</span>
                      </p>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.docx,.doc,.txt"
                      />
                      
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        <Upload className="w-5 h-5" />
                        Select File to Upload
                      </button>
                      
                      {selectedFile && (
                        <div className="w-full max-w-md mt-8 p-5 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-800 truncate">{selectedFile.name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {(selectedFile.size / 1024).toFixed(1)} KB • Ready to process
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedFile && !cvProcessing && (
                    <div className="flex justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleProcessAndAddToJob}
                        className="px-8 py-3 rounded-xl font-semibold shadow-lg transition-all bg-purple-600 hover:bg-purple-700 text-white hover:shadow-xl hover:scale-105"
                      >
                        Process CV & Add to Job
                      </button>
                    </div>
                  )}

                  {/* Processing Status - Simple inline indicator */}
                  {cvProcessing && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
                        <span className="text-sm font-medium">
                          {processingStep === 1 && 'Uploading and extracting content...'}
                          {processingStep === 2 && 'AI analyzing CV content...'}
                          {processingStep === 3 && 'Finalizing candidate profile...'}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled
                        className="px-8 py-3 rounded-xl font-semibold shadow-lg bg-gray-300 text-gray-500 cursor-not-allowed"
                      >
                        Processing...
                      </button>
                    </div>
                  )}

                  {cvError && (
                    <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <X className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-red-700 font-medium">Error processing CV</p>
                          <p className="text-xs text-red-600 mt-1">{cvError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCandidateToJobModal;
