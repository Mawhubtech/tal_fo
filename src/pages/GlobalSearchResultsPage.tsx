import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Eye, Plus, Loader2, CheckCircle, MapPin, Building, Code, Search, Sparkles, Filter, X, ChevronDown, ChevronUp, Layers, KeySquare, GraduationCap, Zap, Command, Briefcase, Globe } from 'lucide-react';
import { useSearch, useExternalSourceSearch, useCombinedSearch } from '../hooks/useSearch';
import { useAddProspectsToProject } from '../hooks/useSourcingProjects';
import { useShortlistExternalCandidate } from '../hooks/useShortlistExternal';
import { useAuthContext } from '../contexts/AuthContext';
import type { SearchFilters } from '../services/searchService';
import { searchEnhanced, searchCandidatesExternalDirect } from '../services/searchService';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ProjectSelectionModal from '../components/ProjectSelectionModal';
import SourcingProfileSidePanel, { type PanelState } from '../sourcing/outreach/components/SourcingProfileSidePanel';
import type { UserStructuredData } from '../components/ProfileSidePanel';
import { FilterState } from '../components/FilterDialog';

// Helper function to create default FilterState
const createDefaultFilterState = (): FilterState => ({
  general: { minExperience: '0', maxExperience: '', requiredContactInfo: '', hideViewedProfiles: '', onlyConnections: '' },
  location: { currentLocations: [], pastLocations: [], radius: '25', timezone: false },
  job: { titles: [], skills: [] },
  company: { names: [], industries: [], size: '' },
  funding: {},
  skillsKeywords: { items: [], requirements: [] },
  power: { isOpenToRemote: false, hasEmail: false, hasPhone: false },
  likelyToSwitch: { likelihood: '', recentActivity: '' },
  education: { schools: [], degrees: [], majors: [] },
  languages: { items: [] },
  boolean: { fullName: '', booleanString: '' },
});

// Helper function to parse enhanced filters structure
const parseEnhancedFilters = (filtersData: any): SearchFilters => {
  // If filters is a string, parse it
  let parsedFilters = filtersData;
  if (typeof filtersData === 'string') {
    try {
      parsedFilters = JSON.parse(filtersData);
    } catch (e) {
      console.warn('Failed to parse filters string:', e);
      return {};
    }
  }

  // If it has the enhanced structure (mustFilters, shouldFilters), transform it
  if (parsedFilters.mustFilters || parsedFilters.shouldFilters) {
    const result: SearchFilters = {
      general: { minExperience: '0', maxExperience: '', requiredContactInfo: '', hideViewedProfiles: '', onlyConnections: '' },
      location: { currentLocations: [], pastLocations: [], radius: '25', timezone: false },
      job: { titles: [], skills: [] },
      company: { names: [], industries: [], size: '' },
      funding: {},
      skillsKeywords: { items: [], requirements: [] },
      power: { isOpenToRemote: false, hasEmail: false, hasPhone: false },
      likelyToSwitch: { likelihood: '', recentActivity: '' },
      education: { schools: [], degrees: [], majors: [] },
      languages: { items: [] },
      boolean: { fullName: '', booleanString: '' },
    };

    // Extract from mustFilters
    if (parsedFilters.mustFilters) {
      const must = parsedFilters.mustFilters;
      if (must.job?.titles) result.job!.titles = must.job.titles.filter(Boolean);
      if (must.job?.skills) result.job!.skills = must.job.skills.filter(Boolean);
      if (must.skillsKeywords?.items) result.skillsKeywords!.items = must.skillsKeywords.items.filter(Boolean);
      if (must.location?.currentLocations) result.location!.currentLocations = must.location.currentLocations.filter(Boolean);
      if (must.company?.names) result.company!.names = must.company.names.filter(Boolean);
      if (must.company?.industries) result.company!.industries = must.company.industries.filter(Boolean);
    }

    // Extract from shouldFilters (merge with must filters)
    if (parsedFilters.shouldFilters) {
      const should = parsedFilters.shouldFilters;
      if (should.job?.titles) result.job!.titles = [...(result.job!.titles || []), ...should.job.titles.filter(Boolean)];
      if (should.job?.skills) result.job!.skills = [...(result.job!.skills || []), ...should.job.skills.filter(Boolean)];
      if (should.skillsKeywords?.items) result.skillsKeywords!.items = [...(result.skillsKeywords!.items || []), ...should.skillsKeywords.items.filter(Boolean)];
      if (should.location?.currentLocations) result.location!.currentLocations = [...(result.location!.currentLocations || []), ...should.location.currentLocations.filter(Boolean)];
      if (should.company?.names) result.company!.names = [...(result.company!.names || []), ...should.company.names.filter(Boolean)];
      if (should.company?.industries) result.company!.industries = [...(result.company!.industries || []), ...should.company.industries.filter(Boolean)];
    }

    // Remove duplicates
    if (result.job?.titles) result.job.titles = [...new Set(result.job.titles)];
    if (result.job?.skills) result.job.skills = [...new Set(result.job.skills)];
    if (result.skillsKeywords?.items) result.skillsKeywords.items = [...new Set(result.skillsKeywords.items)];
    if (result.location?.currentLocations) result.location.currentLocations = [...new Set(result.location.currentLocations)];
    if (result.company?.names) result.company.names = [...new Set(result.company.names)];
    if (result.company?.industries) result.company.industries = [...new Set(result.company.industries)];

    return result;
  }

  // If it's already in the expected format, return as is
  return parsedFilters;
};

// Helper function to convert SearchFilters to FilterState
const convertSearchFiltersToFilterState = (searchFilters: SearchFilters): FilterState => {
  const defaultState = createDefaultFilterState();
  
  return {
    general: {
      minExperience: searchFilters.general?.minExperience || defaultState.general.minExperience,
      maxExperience: searchFilters.general?.maxExperience || defaultState.general.maxExperience,
      requiredContactInfo: searchFilters.general?.requiredContactInfo || defaultState.general.requiredContactInfo,
      hideViewedProfiles: searchFilters.general?.hideViewedProfiles || defaultState.general.hideViewedProfiles,
      onlyConnections: searchFilters.general?.onlyConnections || defaultState.general.onlyConnections,
    },
    location: {
      currentLocations: searchFilters.location?.currentLocations || defaultState.location.currentLocations,
      pastLocations: searchFilters.location?.pastLocations || defaultState.location.pastLocations,
      radius: searchFilters.location?.radius || defaultState.location.radius,
      timezone: searchFilters.location?.timezone || defaultState.location.timezone,
    },
    job: {
      titles: searchFilters.job?.titles || defaultState.job.titles,
      skills: searchFilters.job?.skills || defaultState.job.skills,
    },
    company: {
      names: searchFilters.company?.names || defaultState.company.names,
      industries: searchFilters.company?.industries || defaultState.company.industries,
      size: searchFilters.company?.size || defaultState.company.size,
    },
    funding: searchFilters.funding || defaultState.funding,
    skillsKeywords: {
      items: searchFilters.skillsKeywords?.items || defaultState.skillsKeywords.items,
      requirements: searchFilters.skillsKeywords?.requirements || defaultState.skillsKeywords.requirements,
    },
    power: {
      isOpenToRemote: searchFilters.power?.isOpenToRemote || defaultState.power.isOpenToRemote,
      hasEmail: searchFilters.power?.hasEmail || defaultState.power.hasEmail,
      hasPhone: searchFilters.power?.hasPhone || defaultState.power.hasPhone,
    },
    likelyToSwitch: {
      likelihood: searchFilters.likelyToSwitch?.likelihood || defaultState.likelyToSwitch.likelihood,
      recentActivity: searchFilters.likelyToSwitch?.recentActivity || defaultState.likelyToSwitch.recentActivity,
    },
    education: {
      schools: searchFilters.education?.schools || defaultState.education.schools,
      degrees: searchFilters.education?.degrees || defaultState.education.degrees,
      majors: searchFilters.education?.majors || defaultState.education.majors,
    },
    languages: {
      items: searchFilters.languages?.items || defaultState.languages.items,
    },
    boolean: {
      fullName: searchFilters.boolean?.fullName || defaultState.boolean.fullName,
      booleanString: searchFilters.boolean?.booleanString || defaultState.boolean.booleanString,
    },
  };
};

// Helper function to convert FilterState back to SearchFilters
const convertFilterStateToSearchFilters = (filterState: FilterState): SearchFilters => {
  return {
    general: filterState.general,
    location: filterState.location,
    job: filterState.job,
    company: filterState.company,
    funding: filterState.funding,
    skillsKeywords: filterState.skillsKeywords,
    power: filterState.power,
    likelyToSwitch: filterState.likelyToSwitch,
    education: filterState.education,
    languages: filterState.languages,
    boolean: filterState.boolean,
  };
};

// Enhanced Filter Components
interface ArrayFilterInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}

const ArrayFilterInput: React.FC<ArrayFilterInputProps> = ({ label, values, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !values.includes(trimmedValue)) {
      onChange([...values, trimmedValue]);
      setInputValue('');
    }
  };

  const handleRemove = (valueToRemove: string) => {
    onChange(values.filter(value => value !== valueToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <div key={`${value}-${index}`} className="flex items-center bg-purple-50 border border-purple-200 rounded-md px-3 py-1.5 text-sm">
              <span className="text-purple-800">{value}</span>
              <button
                onClick={() => handleRemove(value)}
                className="ml-2 text-purple-600 hover:text-purple-800 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ComprehensiveFilterSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  isExpanded: boolean;
  children: React.ReactNode;
  hasActiveFilters?: boolean;
}

const ComprehensiveFilterSection: React.FC<ComprehensiveFilterSectionProps> = ({ 
  title, 
  icon: Icon, 
  isExpanded: defaultExpanded = true, 
  children,
  hasActiveFilters = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border rounded-lg overflow-hidden ${
      hasActiveFilters ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200'
    }`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-3 transition-colors ${
          hasActiveFilters 
            ? 'bg-purple-50 hover:bg-purple-100' 
            : 'bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 ${
            hasActiveFilters ? 'text-purple-600' : 'text-gray-600'
          }`} />
          <span className={`text-sm font-medium ${
            hasActiveFilters ? 'text-purple-700' : 'text-gray-700'
          }`}>
            {title}
          </span>
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          )}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {isExpanded && (
        <div className={`p-4 border-t ${
          hasActiveFilters ? 'border-purple-200' : 'border-gray-200'
        }`}>
          {children}
        </div>
      )}
    </div>
  );
};

// Filter Section Component (Legacy - keeping for compatibility)
interface FilterSectionProps {
  title: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, items, onAdd, onRemove, placeholder }) => {
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left mb-2"
      >
        <label className="block text-sm font-medium text-gray-700">{title}</label>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {isExpanded && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleAdd}
              className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {items.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {items.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-sm"
                >
                  {item}
                  <button
                    onClick={() => onRemove(index)}
                    className="ml-1 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// We'll need to create a simplified version of the search results for global use
const GlobalSearchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  
  const [results, setResults] = useState<any[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMode, setSearchMode] = useState<'database' | 'external' | 'combined'>('external');
  const [isLoading, setIsLoading] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [fromQuickSearch, setFromQuickSearch] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isBooleanSearch, setIsBooleanSearch] = useState(false);
  const [criticalRequirements, setCriticalRequirements] = useState<any>(null);
  const [preferredCriteria, setPreferredCriteria] = useState<any>(null);
  const [contextualHints, setContextualHints] = useState<any>(null);
  const [shortlistingCandidates, setShortlistingCandidates] = useState<{ [key: string]: boolean }>({});
  
  // Pagination state
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Track active shortlist calls to prevent duplicates (use ref to avoid React state delays)
  const activeShortlistCallsRef = useRef<Set<string>>(new Set());
  
  // State for the profile side panel
  const [selectedUserDataForPanel, setSelectedUserDataForPanel] = useState<UserStructuredData | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [panelState, setPanelState] = useState<PanelState>('closed');
  
  // State for filters sidebar
  const [showFiltersSidebar, setShowFiltersSidebar] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterState>(createDefaultFilterState());
  const [tempSearchQuery, setTempSearchQuery] = useState<string>('');
  
  // State for search criteria card expansion
  const [isSearchCriteriaExpanded, setIsSearchCriteriaExpanded] = useState(false);
  
  // Search hooks for different modes
  const { executeSearch } = useSearch();
  const { executeSearch: executeExternalSourceSearch } = useExternalSourceSearch();
  const { executeSearch: executeCombinedSearch } = useCombinedSearch();
  const addProspectsToProjectMutation = useAddProspectsToProject();
  const shortlistExternalMutation = useShortlistExternalCandidate();
  
  // Get current user context
  const { user } = useAuthContext();

  // Handle state from search page
  useEffect(() => {
    console.log('GlobalSearchResults: Loading with state:', location.state);
    
    if (location.state) {
      const { 
        query, 
        filters, 
        searchMode: stateSearchMode, 
        isGlobalSearch, 
        fromQuickSearch,
        isEnhanced,
        isBooleanSearch,
        criticalRequirements,
        preferredCriteria,
        contextualHints,
        newProjectId,
        candidateToShortlist,
        shouldAutoShortlist,
        preloadedResults
      } = location.state;
      
      setSearchQuery(query || '');
      setFilters(parseEnhancedFilters(filters || {}));
      setSearchMode(stateSearchMode || 'external');
      setFromQuickSearch(!!fromQuickSearch);
      setIsEnhanced(!!isEnhanced);
      setIsBooleanSearch(!!isBooleanSearch);
      setCriticalRequirements(criticalRequirements || null);
      setPreferredCriteria(preferredCriteria || null);
      setContextualHints(contextualHints || null);
      
      if (isGlobalSearch && (query || preloadedResults)) {
        console.log('GlobalSearchResults: Executing search for:', query || 'filter search');
        // Reset pagination state for new search
        setCurrentCursor(undefined);
        setNextCursor(undefined);
        setHasNextPage(false);
        setCurrentPage(1);
        
        // If we have preloaded results from QuickSearch, use them directly
        if (preloadedResults) {
          console.log('GlobalSearchResults: Using preloaded results:', preloadedResults);
          console.log('GlobalSearchResults: Preloaded results type:', typeof preloadedResults);
          console.log('GlobalSearchResults: Preloaded results.results:', preloadedResults.results);
          console.log('GlobalSearchResults: Preloaded results.results length:', preloadedResults.results?.length || 0);
          
          const resultsToSet = preloadedResults.results || [];
          console.log('GlobalSearchResults: Setting results array:', resultsToSet);
          setResults(resultsToSet);
          setIsLoading(false);
          
          // Set pagination info if available
          if (preloadedResults.externalPagination) {
            setNextCursor(preloadedResults.externalPagination.nextCursor);
            setHasNextPage(preloadedResults.externalPagination.hasNextPage);
            setCurrentPage(preloadedResults.externalPagination.currentPage || 1);
          } else if (preloadedResults && typeof preloadedResults.page === 'number' && typeof preloadedResults.totalPages === 'number') {
            // Handle standard pagination format from external direct search
            const currentPageNum = preloadedResults.page || 1;
            const totalPagesNum = preloadedResults.totalPages || 1;
            const hasMorePages = currentPageNum < totalPagesNum;
            console.log('GlobalSearchResults: Preloaded standard pagination - page:', currentPageNum, 'of', totalPagesNum, 'hasMore:', hasMorePages);
            setHasNextPage(hasMorePages);
            setNextCursor(hasMorePages ? (currentPageNum + 1).toString() : undefined);
            setCurrentPage(currentPageNum);
            console.log('GlobalSearchResults: Preloaded set hasNextPage:', hasMorePages, 'nextCursor:', hasMorePages ? (currentPageNum + 1).toString() : undefined);
          }
        } else if (query) {
          // Only fetch results if we have a query and no preloaded results
          fetchResults(filters || {}, query, stateSearchMode || 'external', !!isEnhanced, undefined, true);
        }
      }
      
      // Handle auto-shortlisting after project creation
      if (shouldAutoShortlist && newProjectId && candidateToShortlist) {
        // Show a loading toast while auto-shortlisting
        addToast({
          type: 'info',
          title: 'Shortlisting Candidate',
          message: 'Adding candidate to your newly created project...'
        });
        
        // Auto-shortlist the candidate to the newly created project
        setTimeout(() => {
          handleAutoShortlist(candidateToShortlist, newProjectId);
        }, 1000); // Small delay to ensure UI state is ready
      }
    } else {
      console.log('GlobalSearchResults: No state found, redirecting to search');
      // Navigate back to global search if no state
      navigate('/dashboard/search');
    }
  }, [location.state, navigate]);

  // Cleanup active shortlist calls on unmount
  useEffect(() => {
    return () => {
      activeShortlistCallsRef.current.clear();
    };
  }, []);

  // Sync tempFilters with current filters when filters change
  useEffect(() => {
    setTempFilters(convertSearchFiltersToFilterState(filters));
  }, [filters]);

  // Sync tempSearchQuery with current searchQuery when it changes
  useEffect(() => {
    setTempSearchQuery(searchQuery);
  }, [searchQuery]);

  // Memoized check for active filters
  const hasActiveFilters = useMemo(() => {
    return !!(
      searchQuery ||
      (filters.job?.titles && filters.job.titles.length > 0) ||
      (filters.job?.skills && filters.job.skills.length > 0) ||
      (filters.skillsKeywords?.items && filters.skillsKeywords.items.length > 0) ||
      (filters.location?.currentLocations && filters.location.currentLocations.length > 0) ||
      (filters.location?.pastLocations && filters.location.pastLocations.length > 0) ||
      (filters.company?.names && filters.company.names.length > 0) ||
      (filters.company?.industries && filters.company.industries.length > 0) ||
      (filters.general?.minExperience && filters.general.minExperience !== '0') ||
      (filters.general?.maxExperience && filters.general.maxExperience !== '') ||
      (filters.education?.schools && filters.education.schools.length > 0) ||
      (filters.education?.degrees && filters.education.degrees.length > 0) ||
      (filters.education?.majors && filters.education.majors.length > 0) ||
      (filters.languages?.items && filters.languages.items.length > 0) ||
      (filters.company?.size && filters.company.size.trim() !== '') ||
      (filters.power?.isOpenToRemote || filters.power?.hasEmail || filters.power?.hasPhone) ||
      (filters.likelyToSwitch?.likelihood && filters.likelyToSwitch.likelihood.trim() !== '') ||
      (filters.boolean?.booleanString && filters.boolean.booleanString.trim() !== '')
    );
  }, [searchQuery, filters]);

  // Memoized filter badges for expandable display
  const allFilterBadges = useMemo(() => {
    const badges = [];
    
    // Search Query
    if (searchQuery) {
      badges.push(
        <div key="search-query" className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          <span className="font-medium mr-2">Keywords:</span>
          <span>"{searchQuery}"</span>
        </div>
      );
    }

    // Job Titles Filter
    if (filters.job?.titles && filters.job.titles.length > 0) {
      if (isSearchCriteriaExpanded) {
        // Show each job title as individual badge
        filters.job.titles.forEach((title, index) => {
          badges.push(
            <div key={`job-title-${index}`} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              <span className="font-medium mr-2">Job Title:</span>
              <span>{title}</span>
            </div>
          );
        });
      } else {
        // Collapsed view - show combined
        badges.push(
          <div key="job-titles" className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
            <span className="font-medium mr-2">Job Titles:</span>
            <span>{filters.job.titles.slice(0, 2).join(', ')}</span>
            {filters.job.titles.length > 2 && (
              <span className="ml-1">+{filters.job.titles.length - 2} more</span>
            )}
          </div>
        );
      }
    }

    // Skills Filter
    if (filters.job?.skills && filters.job.skills.length > 0) {
      if (isSearchCriteriaExpanded) {
        // Show each skill as individual badge
        filters.job.skills.forEach((skill, index) => {
          badges.push(
            <div key={`job-skill-${index}`} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <Code className="w-3 h-3 mr-1" />
              <span className="font-medium mr-2">Skill:</span>
              <span>{skill}</span>
            </div>
          );
        });
      } else {
        // Collapsed view - show combined
        badges.push(
          <div key="job-skills" className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <Code className="w-3 h-3 mr-1" />
            <span className="font-medium mr-2">Skills:</span>
            <span>{filters.job.skills.slice(0, 2).join(', ')}</span>
            {filters.job.skills.length > 2 && (
              <span className="ml-1">+{filters.job.skills.length - 2} more</span>
            )}
          </div>
        );
      }
    }

    // Skills Keywords Filter
    if (filters.skillsKeywords?.items && filters.skillsKeywords.items.length > 0) {
      if (isSearchCriteriaExpanded) {
        // Show each keyword as individual badge
        filters.skillsKeywords.items.forEach((keyword, index) => {
          badges.push(
            <div key={`skill-keyword-${index}`} className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
              <Code className="w-3 h-3 mr-1" />
              <span className="font-medium mr-2">Keyword:</span>
              <span>{keyword}</span>
            </div>
          );
        });
      } else {
        // Collapsed view - show combined
        badges.push(
          <div key="skill-keywords" className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
            <Code className="w-3 h-3 mr-1" />
            <span className="font-medium mr-2">Skill Keywords:</span>
            <span>{filters.skillsKeywords.items.slice(0, 2).join(', ')}</span>
            {filters.skillsKeywords.items.length > 2 && (
              <span className="ml-1">+{filters.skillsKeywords.items.length - 2} more</span>
            )}
          </div>
        );
      }
    }

    // Location Filter
    if (filters.location?.currentLocations && filters.location.currentLocations.length > 0) {
      if (isSearchCriteriaExpanded) {
        // Show each location as individual badge
        filters.location.currentLocations.forEach((location, index) => {
          badges.push(
            <div key={`current-location-${index}`} className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="font-medium mr-2">Location:</span>
              <span>{location}</span>
            </div>
          );
        });
      } else {
        // Collapsed view - show combined
        badges.push(
          <div key="current-locations" className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="font-medium mr-2">Current Location:</span>
            <span>{filters.location.currentLocations.slice(0, 2).join(', ')}</span>
            {filters.location.currentLocations.length > 2 && (
              <span className="ml-1">+{filters.location.currentLocations.length - 2} more</span>
            )}
          </div>
        );
      }
    }

    // Past Locations Filter
    if (filters.location?.pastLocations && filters.location.pastLocations.length > 0) {
      if (isSearchCriteriaExpanded) {
        // Show each past location as individual badge
        filters.location.pastLocations.forEach((location, index) => {
          badges.push(
            <div key={`past-location-${index}`} className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="font-medium mr-2">Past Location:</span>
              <span>{location}</span>
            </div>
          );
        });
      } else {
        // Collapsed view - show combined
        badges.push(
          <div key="past-locations" className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="font-medium mr-2">Past Location:</span>
            <span>{filters.location.pastLocations.slice(0, 2).join(', ')}</span>
            {filters.location.pastLocations.length > 2 && (
              <span className="ml-1">+{filters.location.pastLocations.length - 2} more</span>
            )}
          </div>
        );
      }
    }

    // Company Filter
    if (filters.company?.names && filters.company.names.length > 0) {
      if (isSearchCriteriaExpanded) {
        // Show each company as individual badge
        filters.company.names.forEach((company, index) => {
          badges.push(
            <div key={`company-name-${index}`} className="inline-flex items-center px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm">
              <Building className="w-3 h-3 mr-1" />
              <span className="font-medium mr-2">Company:</span>
              <span>{company}</span>
            </div>
          );
        });
      } else {
        // Collapsed view - show combined
        badges.push(
          <div key="company-names" className="inline-flex items-center px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm">
            <Building className="w-3 h-3 mr-1" />
            <span className="font-medium mr-2">Companies:</span>
            <span>{filters.company.names.slice(0, 2).join(', ')}</span>
            {filters.company.names.length > 2 && (
              <span className="ml-1">+{filters.company.names.length - 2} more</span>
            )}
          </div>
        );
      }
    }

    // Industries Filter
    if (filters.company?.industries && filters.company.industries.length > 0) {
      if (isSearchCriteriaExpanded) {
        // Show each industry as individual badge
        filters.company.industries.forEach((industry, index) => {
          badges.push(
            <div key={`company-industry-${index}`} className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
              <Building className="w-3 h-3 mr-1" />
              <span className="font-medium mr-2">Industry:</span>
              <span>{industry}</span>
            </div>
          );
        });
      } else {
        // Collapsed view - show combined
        badges.push(
          <div key="company-industries" className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
            <Building className="w-3 h-3 mr-1" />
            <span className="font-medium mr-2">Industries:</span>
            <span>{filters.company.industries.slice(0, 2).join(', ')}</span>
            {filters.company.industries.length > 2 && (
              <span className="ml-1">+{filters.company.industries.length - 2} more</span>
            )}
          </div>
        );
      }
    }

    // Experience Filter
    if ((filters.general?.minExperience && filters.general.minExperience !== '0') || filters.general?.maxExperience) {
      badges.push(
        <div key="experience" className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
          <span className="font-medium mr-2">Experience:</span>
          <span>
            {filters.general.minExperience && filters.general.minExperience !== '0' && `${filters.general.minExperience}+ years`}
            {filters.general.minExperience && filters.general.minExperience !== '0' && filters.general.maxExperience && ' - '}
            {filters.general.maxExperience && `max ${filters.general.maxExperience} years`}
          </span>
        </div>
      );
    }

    // Education - Schools Filter
    if (filters.education?.schools && filters.education.schools.length > 0) {
      if (isSearchCriteriaExpanded) {
        // Show each school as individual badge
        filters.education.schools.forEach((school, index) => {
          badges.push(
            <div key={`education-school-${index}`} className="inline-flex items-center px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
              <GraduationCap className="w-3 h-3 mr-1" />
              <span className="font-medium mr-2">School:</span>
              <span>{school}</span>
            </div>
          );
        });
      } else {
        // Collapsed view - show combined
        badges.push(
          <div key="education-schools" className="inline-flex items-center px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
            <GraduationCap className="w-3 h-3 mr-1" />
            <span className="font-medium mr-2">Schools:</span>
            <span>{filters.education.schools.slice(0, 2).join(', ')}</span>
            {filters.education.schools.length > 2 && (
              <span className="ml-1">+{filters.education.schools.length - 2} more</span>
            )}
          </div>
        );
      }
    }

    // Education - Degrees Filter
    if (filters.education?.degrees && filters.education.degrees.length > 0) {
      if (isSearchCriteriaExpanded) {
        // Show each degree as individual badge
        filters.education.degrees.forEach((degree, index) => {
          badges.push(
            <div key={`education-degree-${index}`} className="inline-flex items-center px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm">
              <GraduationCap className="w-3 h-3 mr-1" />
              <span className="font-medium mr-2">Degree:</span>
              <span>{degree}</span>
            </div>
          );
        });
      } else {
        // Collapsed view - show combined
        badges.push(
          <div key="education-degrees" className="inline-flex items-center px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm">
            <GraduationCap className="w-3 h-3 mr-1" />
            <span className="font-medium mr-2">Degrees:</span>
            <span>{filters.education.degrees.slice(0, 2).join(', ')}</span>
            {filters.education.degrees.length > 2 && (
              <span className="ml-1">+{filters.education.degrees.length - 2} more</span>
            )}
          </div>
        );
      }
    }

    // Education - Majors Filter
    if (filters.education?.majors && filters.education.majors.length > 0) {
      if (isSearchCriteriaExpanded) {
        // Show each major as individual badge
        filters.education.majors.forEach((major, index) => {
          badges.push(
            <div key={`education-major-${index}`} className="inline-flex items-center px-3 py-1 bg-fuchsia-100 text-fuchsia-800 rounded-full text-sm">
              <GraduationCap className="w-3 h-3 mr-1" />
              <span className="font-medium mr-2">Major:</span>
              <span>{major}</span>
            </div>
          );
        });
      } else {
        // Collapsed view - show combined
        badges.push(
          <div key="education-majors" className="inline-flex items-center px-3 py-1 bg-fuchsia-100 text-fuchsia-800 rounded-full text-sm">
            <GraduationCap className="w-3 h-3 mr-1" />
            <span className="font-medium mr-2">Majors:</span>
            <span>{filters.education.majors.slice(0, 2).join(', ')}</span>
            {filters.education.majors.length > 2 && (
              <span className="ml-1">+{filters.education.majors.length - 2} more</span>
            )}
          </div>
        );
      }
    }

    // Languages Filter
    if (filters.languages?.items && filters.languages.items.length > 0) {
      if (isSearchCriteriaExpanded) {
        // Show each language as individual badge
        filters.languages.items.forEach((language, index) => {
          badges.push(
            <div key={`language-${index}`} className="inline-flex items-center px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm">
              <Globe className="w-3 h-3 mr-1" />
              <span className="font-medium mr-2">Language:</span>
              <span>{language}</span>
            </div>
          );
        });
      } else {
        // Collapsed view - show combined
        badges.push(
          <div key="languages" className="inline-flex items-center px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm">
            <Globe className="w-3 h-3 mr-1" />
            <span className="font-medium mr-2">Languages:</span>
            <span>{filters.languages.items.slice(0, 2).join(', ')}</span>
            {filters.languages.items.length > 2 && (
              <span className="ml-1">+{filters.languages.items.length - 2} more</span>
            )}
          </div>
        );
      }
    }

    // Company Size Filter
    if (filters.company?.size && filters.company.size.trim() !== '') {
      badges.push(
        <div key="company-size" className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm">
          <Building className="w-3 h-3 mr-1" />
          <span className="font-medium mr-2">Company Size:</span>
          <span>{filters.company.size}</span>
        </div>
      );
    }

    // Power Filters
    if (filters.power?.isOpenToRemote || filters.power?.hasEmail || filters.power?.hasPhone) {
      badges.push(
        <div key="power-requirements" className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
          <Zap className="w-3 h-3 mr-1" />
          <span className="font-medium mr-2">Requirements:</span>
          <span>
            {[
              filters.power.isOpenToRemote && 'Remote',
              filters.power.hasEmail && 'Email',
              filters.power.hasPhone && 'Phone'
            ].filter(Boolean).join(', ')}
          </span>
        </div>
      );
    }

    // Likely to Switch Filter
    if (filters.likelyToSwitch?.likelihood && filters.likelyToSwitch.likelihood.trim() !== '') {
      badges.push(
        <div key="switch-likelihood" className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
          <span className="font-medium mr-2">Switch Likelihood:</span>
          <span>{filters.likelyToSwitch.likelihood}</span>
        </div>
      );
    }

    // Boolean Search Filter
    if (filters.boolean?.booleanString && filters.boolean.booleanString.trim() !== '') {
      badges.push(
        <div key="boolean-search" className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
          <Command className="w-3 h-3 mr-1" />
          <span className="font-medium mr-2">Boolean:</span>
          <span>"{filters.boolean.booleanString.slice(0, 30)}{filters.boolean.booleanString.length > 30 ? '...' : ''}"</span>
        </div>
      );
    }

    return badges;
  }, [searchQuery, filters, isSearchCriteriaExpanded]);

  // Show limited badges when collapsed (first 4), all when expanded
  const visibleFilterBadges = useMemo(() => {
    const maxCollapsed = 4;
    if (isSearchCriteriaExpanded) {
      return allFilterBadges;
    }
    
    const visible = allFilterBadges.slice(0, maxCollapsed);
    const remaining = allFilterBadges.length - maxCollapsed;
    
    if (remaining > 0) {
      visible.push(
        <div key="more-filters" className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
          <span>+{remaining} more filter{remaining !== 1 ? 's' : ''}</span>
        </div>
      );
    }
    
    return visible;
  }, [allFilterBadges, isSearchCriteriaExpanded]);

  const fetchResults = async (
    filters: SearchFilters, 
    query?: string, 
    mode?: 'database' | 'external' | 'combined', 
    useEnhanced?: boolean,
    cursor?: string,
    resetResults?: boolean
  ) => {
    console.log('GlobalSearchResults: Fetching results for:', { query, mode, enhanced: useEnhanced, cursor, reset: resetResults });
    
    if (resetResults) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const searchMode = mode || 'database';
      let searchResults: any;
      
      // For external or combined search, try enhanced search first if available
      if (useEnhanced && (searchMode === 'external' || searchMode === 'combined') && query) {
        try {
          console.log('GlobalSearchResults: Using enhanced search...');
          searchResults = await searchEnhanced(query, searchMode === 'external' || searchMode === 'combined', { page: 1, limit: 10 });
        } catch (enhancedError) {
          console.warn('GlobalSearchResults: Enhanced search failed, using fallback:', enhancedError);
          // Fallback to standard search methods
          useEnhanced = false;
        }
      }
      
      // If enhanced search wasn't used or failed, use standard search methods
      if (!useEnhanced || !searchResults) {
        console.log('GlobalSearchResults: Using standard search...');
        
        // For external search, prefer our direct external search for richer data
        if (searchMode === 'external') {
          try {
            console.log('GlobalSearchResults: Using direct external search for richer data...');
            // Calculate page number from cursor or use 1 for initial search
            const pageNumber = cursor ? parseInt(cursor) : 1;
            searchResults = await searchCandidatesExternalDirect(filters, query, { 
              page: pageNumber, 
              limit: 10 
            });
          } catch (externalError) {
            console.warn('GlobalSearchResults: Direct external search failed, using hook fallback:', externalError);
            // Fallback to the existing hook method
            const searchParams = {
              filters,
              searchText: query,
              pagination: { page: 1, limit: 10 },
              after: cursor
            };
            searchResults = await executeExternalSourceSearch(searchParams);
          }
        } else {
          // For other search modes, use existing methods
          const searchParams = {
            filters,
            searchText: query,
            pagination: { page: 1, limit: 10 },
            after: cursor
          };
          
          if (searchMode === 'combined') {
            searchResults = await executeCombinedSearch(searchParams, true);
          } else {
            searchResults = await executeSearch(searchParams);
          }
        }
      }
      
      console.log('🔍 GlobalSearchResults: Raw searchResults:', searchResults);
      console.log('🔍 GlobalSearchResults: Type of searchResults:', typeof searchResults);
      
      // Handle the response structure from backend
      let newResults: any[] = [];
      if (searchResults && typeof searchResults === 'object') {
        if ('results' in searchResults) {
          newResults = (searchResults as any).results || [];
        } else if ('candidates' in searchResults) {
          newResults = (searchResults as any).candidates || [];
        } else if (Array.isArray(searchResults)) {
          newResults = searchResults;
        }
      } else if (Array.isArray(searchResults)) {
        newResults = searchResults;
      }

      // Handle pagination metadata for external sources
      if (searchResults && searchResults.externalPagination) {
        setNextCursor(searchResults.externalPagination.nextCursor);
        setHasNextPage(searchResults.externalPagination.hasNextPage);
      } else if (searchResults && typeof searchResults.page === 'number' && typeof searchResults.totalPages === 'number') {
        // Handle standard pagination format from external direct search
        const currentPageNum = searchResults.page || 1;
        const totalPagesNum = searchResults.totalPages || 1;
        const hasMorePages = currentPageNum < totalPagesNum;
        console.log('GlobalSearchResults: Standard pagination - page:', currentPageNum, 'of', totalPagesNum, 'hasMore:', hasMorePages);
        setHasNextPage(hasMorePages);
        setNextCursor(hasMorePages ? (currentPageNum + 1).toString() : undefined);
        console.log('GlobalSearchResults: Set hasNextPage:', hasMorePages, 'nextCursor:', hasMorePages ? (currentPageNum + 1).toString() : undefined);
      } else {
        setNextCursor(undefined);
        setHasNextPage(false);
      }

      if (resetResults) {
        // For new search, replace all results
        console.log('GlobalSearchResults: Setting new results:', newResults.length);
        setResults(newResults);
        setCurrentPage(1);
      } else {
        // For pagination, append new results but avoid duplicates
        setResults(prev => {
          const existingIds = new Set(prev.map(r => r.candidate?.id || r.id).filter(Boolean));
          const uniqueNewResults = newResults.filter(r => {
            const id = r.candidate?.id || r.id;
            return id && !existingIds.has(id);
          });
          console.log(`GlobalSearchResults: Appending ${uniqueNewResults.length} new results (${newResults.length - uniqueNewResults.length} duplicates filtered)`);
          return [...prev, ...uniqueNewResults];
        });
        setCurrentPage(prev => prev + 1);
      }

      setCurrentCursor(cursor);
    } catch (error) {
      console.error('GlobalSearchResults: Search failed:', error);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Failed to fetch search results. Please try again.'
      });
      if (resetResults) {
        setResults([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Handle pagination - load more results
  const handleNextPage = () => {
    if (hasNextPage && nextCursor && !isLoadingMore) {
      console.log('GlobalSearchResults: Loading next page:', nextCursor, 'hasNextPage:', hasNextPage);
      setIsLoadingMore(true);
      fetchResults(filters, searchQuery, searchMode, isEnhanced, nextCursor, false);
    } else {
      console.log('GlobalSearchResults: Cannot load more - hasNextPage:', hasNextPage, 'nextCursor:', nextCursor, 'isLoadingMore:', isLoadingMore);
    }
  };

  // Handlers for the profile side panel
  const handleOpenProfilePanel = (userData: UserStructuredData, candidateId?: string) => {
    setSelectedUserDataForPanel(userData);
    setSelectedCandidateId(candidateId || null);
    setPanelState('expanded');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  const handlePanelStateChange = (newState: PanelState) => {
    setPanelState(newState);
    if (newState === 'closed') {
      setSelectedUserDataForPanel(null);
      setSelectedCandidateId(null);
      document.body.style.overflow = 'auto'; // Restore background scroll
    }
  };

  // Function to convert candidate data to UserStructuredData format
  const convertCandidateToUserData = (candidate: any): UserStructuredData => {
    const candidateData = candidate.candidate || candidate;
    
    // Convert skillMappings to skills array
    const skills = candidateData.skillMappings 
      ? candidateData.skillMappings.map((mapping: any) => ({
          id: mapping.skill?.id || mapping.skillId,
          name: mapping.skill?.name || mapping.name || 'Unknown Skill',
          category: mapping.skill?.category || 'other',
          level: mapping.level || 'intermediate',
          yearsOfExperience: mapping.yearsOfExperience || 0,
          isHighlighted: mapping.isHighlighted || false
        }))
      : (candidateData.skills ? candidateData.skills.map((skill: any) => 
          typeof skill === 'string' ? { name: skill, category: 'other' } : skill
        ) : []);

    // Convert interests to proper format
    const interests = candidateData.interests 
      ? candidateData.interests.map((interest: any) => ({
          id: interest.id || Math.random().toString(),
          name: interest.name || interest,
          category: interest.category || 'personal',
          description: interest.description || null
        }))
      : [];

    // Convert languages to proper format  
    const languages = candidateData.languages 
      ? candidateData.languages.map((lang: any) => ({
          language: lang.language || lang.name || lang,
          proficiency: lang.proficiency || 'unknown'
        }))
      : [];

    // Convert certifications to proper format
    const certifications = candidateData.certifications 
      ? candidateData.certifications.map((cert: any) => ({
          name: cert.name || cert.title || 'Unknown Certification',
          issuer: cert.issuer || cert.organization || 'Unknown Issuer',
          dateIssued: cert.dateIssued || cert.date || cert.startDate || '',
          expirationDate: cert.expirationDate || cert.endDate
        }))
      : [];

    // Convert awards to proper format
    const awards = candidateData.awards 
      ? candidateData.awards.map((award: any) => ({
          name: award.name || award.title || 'Unknown Award',
          issuer: award.issuer || award.organization || 'Unknown Issuer',
          date: award.date || award.dateReceived || '',
          description: award.description || ''
        }))
      : [];

    // Convert references to proper format
    const references = candidateData.references 
      ? candidateData.references.map((ref: any) => ({
          name: ref.name || 'Unknown Reference',
          position: ref.position || ref.title || 'Unknown Position',
          company: ref.company || ref.organization || 'Unknown Company',
          email: ref.email || '',
          phone: ref.phone || '',
          relationship: ref.relationship || 'colleague'
        }))
      : [];

    return {
      personalInfo: {
        fullName: candidateData.fullName || 'Unknown',
        email: typeof candidateData.email === 'boolean' ? '' : (candidateData.email || ''),
        phone: candidateData.phone || '',
        location: typeof candidateData.location === 'boolean' ? 'Location Available' : (candidateData.location || 'Not specified'),
        website: candidateData.website || '',
        linkedIn: candidateData.linkedIn || candidateData.linkedinUrl || '',
        github: candidateData.github || '',
        facebook: candidateData.facebook || candidateData.facebookUrl || candidateData.facebook_url || '',
        twitter: candidateData.twitter || candidateData.twitterUrl || candidateData.twitter_url || '',
        avatar: candidateData.avatar || ''
      },
      summary: candidateData.summary || candidateData.profileSummary || '',
      experience: candidateData.experience || candidateData.workExperience || [],
      education: candidateData.education || [],
      skills: skills,
      projects: candidateData.projects || [],
      certifications: certifications,
      awards: awards,
      interests: interests,
      languages: languages,
      references: references,
      customFields: []
    };
  };

  // Auto-shortlist a candidate to a specific project (used after project creation)
  const handleAutoShortlist = async (candidate: any, projectId: string) => {
    const callKey = `${candidate.id}-${projectId}`;
    
    // Prevent duplicate calls for the same candidate-project combination
    if (activeShortlistCallsRef.current.has(callKey)) {
      console.log('🚫 AUTO-SHORTLIST BLOCKED: Duplicate call detected for', callKey);
      return;
    }
    
    console.log('🔄 AUTO-SHORTLIST START:', {
      candidateId: candidate.id,
      candidateName: candidate.fullName || candidate.candidateName,
      projectId,
      callKey,
      searchMode,
      coreSignalId: candidate.coreSignalId,
      source: candidate.source
    });
    
    // Mark this call as active
    activeShortlistCallsRef.current.add(callKey);
    
    try {
      setShortlistingCandidates(prev => ({ ...prev, [candidate.id]: true }));

      // Determine if this is an external source candidate
      const isExternalSourceCandidate = searchMode === 'external' || (searchMode === 'combined' && candidate.source === 'coresignal') || candidate.coreSignalId;
      let candidateIdForProspects = candidate.id;

      // Step 1: If external source candidate, save to database first
      if (isExternalSourceCandidate && (candidate.coreSignalId || candidate.id)) {
        console.log('💾 AUTO-SHORTLIST: Saving external candidate to database...');
        try {
          const coreSignalId = candidate.coreSignalId || candidate.id;
          const shortlistResult = await shortlistExternalMutation.mutateAsync({
            coreSignalId: coreSignalId,
            candidateData: candidate,
            createdBy: user?.id || ''
          });

          console.log('💾 AUTO-SHORTLIST: External candidate save result:', shortlistResult);

          // Extract candidate ID regardless of success status (for existing candidates)
          candidateIdForProspects = shortlistResult.candidateId || shortlistResult.existingCandidateId || candidate.id;

          if (shortlistResult.success) {
            addToast({
              type: 'success',
              title: 'Candidate Saved',
              message: shortlistResult.message,
              duration: 3000
            });
          } else if (shortlistResult.existingCandidateId) {
            // Candidate already exists, show info message
            addToast({
              type: 'info', 
              title: 'Candidate Already Exists',
              message: shortlistResult.message,
              duration: 3000
            });
          } else {
            // Other error
            throw new Error(shortlistResult.message);
          }
        } catch (shortlistError) {
          console.error('Error saving external candidate:', shortlistError);
          addToast({
            type: 'error',
            title: 'Failed to Save Candidate',
            message: shortlistError instanceof Error ? shortlistError.message : 'Failed to save candidate to database. Please try again.',
            duration: 7000
          });
          return; // Exit early if we can't save the candidate
        }
      }

      // Step 2: Add candidate to prospects
      console.log('📋 AUTO-SHORTLIST: Adding candidate to project prospects...', {
        projectId,
        candidateIdForProspects,
        searchId: undefined
      });
      
      try {
        const prospectResult = await addProspectsToProjectMutation.mutateAsync({
          projectId: projectId,
          candidateIds: [candidateIdForProspects],
          searchId: undefined, // No search ID for auto-shortlisting from project creation
        });
        
        console.log('📋 AUTO-SHORTLIST: Project prospect addition result:', prospectResult);

        addToast({
          type: 'success',
          title: 'Candidate Shortlisted Successfully',
          message: `${candidate.fullName || candidate.candidateName || 'Candidate'} has been ${isExternalSourceCandidate ? 'saved to your database and ' : ''}added to your project!`
        });
        
        console.log('✅ AUTO-SHORTLIST: Successfully completed for candidate:', candidate.id);
        
        // Close the project modal if it was open
        setShowProjectModal(false);
        setSelectedCandidate(null);
        
      } catch (prospectError: any) {
        console.error('❌ AUTO-SHORTLIST: Error adding candidate to prospects:', prospectError);
        // Handle duplicate shortlisting specifically
        if (prospectError?.response?.status === 409 || prospectError?.message?.includes('already exist as prospects')) {
          addToast({
            type: 'info',
            title: 'Already Shortlisted',
            message: `${candidate.fullName || candidate.candidateName || 'Candidate'} is already shortlisted for this project.`,
            duration: 5000
          });
        } else {
          console.error('Error adding candidate to prospects:', prospectError);
          addToast({
            type: 'error',
            title: 'Shortlisting Failed',
            message: 'Failed to shortlist candidate to the project. Please try again.',
            duration: 7000
          });
        }
        return;
      }
      
    } catch (error) {
      console.error('❌ AUTO-SHORTLIST: General error during auto-shortlist:', error);
      addToast({
        type: 'error',
        title: 'Shortlisting Failed',
        message: 'Failed to shortlist candidate to the project. Please try again.'
      });
    } finally {
      setShortlistingCandidates(prev => ({ ...prev, [candidate.id]: false }));
      // Remove the call from active calls
      activeShortlistCallsRef.current.delete(callKey);
    }
  };

  const handleBackToSearch = () => {
    if (fromQuickSearch) {
      // If came from quick search, go back to projects page
      navigate('/dashboard/sourcing/projects');
    } else {
      // Otherwise go back to global search page
      navigate('/dashboard/search', {
        state: {
          query: searchQuery
        }
      });
    }
  };

  const handleShortlistCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowProjectModal(true);
  };

  const handleProjectSelected = async (projectId: string) => {
    if (!selectedCandidate) return;
    
    const callKey = `${selectedCandidate.id}-${projectId}`;
    
    // Prevent duplicate calls for the same candidate-project combination
    if (activeShortlistCallsRef.current.has(callKey)) {
      console.log('🚫 MANUAL-SHORTLIST BLOCKED: Duplicate call detected for', callKey);
      return;
    }

    console.log('🔄 MANUAL-SHORTLIST START:', {
      candidateId: selectedCandidate.id,
      candidateName: selectedCandidate.fullName || selectedCandidate.candidateName,
      projectId,
      callKey,
      searchMode,
      coreSignalId: selectedCandidate.coreSignalId,
      source: selectedCandidate.source
    });

    // Mark this call as active
    activeShortlistCallsRef.current.add(callKey);

    try {
      setShortlistingCandidates(prev => ({ ...prev, [selectedCandidate.id]: true }));

      // Determine if this is an external source candidate
      const isExternalSourceCandidate = searchMode === 'external' || (searchMode === 'combined' && selectedCandidate.source === 'coresignal') || selectedCandidate.coreSignalId;
      let candidateIdForProspects = selectedCandidate.id;

      // Step 1: If external source candidate, save to database first
      if (isExternalSourceCandidate && (selectedCandidate.coreSignalId || selectedCandidate.id)) {
        console.log('💾 MANUAL-SHORTLIST: Saving external candidate to database...');
        try {
          const coreSignalId = selectedCandidate.coreSignalId || selectedCandidate.id;
          const shortlistResult = await shortlistExternalMutation.mutateAsync({
            coreSignalId: coreSignalId,
            candidateData: selectedCandidate,
            createdBy: user?.id || ''
          });

          console.log('💾 MANUAL-SHORTLIST: External candidate save result:', shortlistResult);

          // Extract candidate ID regardless of success status (for existing candidates)
          candidateIdForProspects = shortlistResult.candidateId || shortlistResult.existingCandidateId || selectedCandidate.id;

          if (shortlistResult.success) {
            addToast({
              type: 'success',
              title: 'Candidate Saved',
              message: shortlistResult.message,
              duration: 3000
            });
          } else if (shortlistResult.existingCandidateId) {
            // Candidate already exists, show info message
            addToast({
              type: 'info',
              title: 'Candidate Already Exists', 
              message: shortlistResult.message,
              duration: 3000
            });
          } else {
            // Other error
            throw new Error(shortlistResult.message);
          }
        } catch (shortlistError) {
          console.error('Error saving external candidate:', shortlistError);
          addToast({
            type: 'error',
            title: 'Failed to Save Candidate',
            message: shortlistError instanceof Error ? shortlistError.message : 'Failed to save candidate to database. Please try again.',
            duration: 7000
          });
          return; // Exit early if we can't save the candidate
        }
      }

      // Step 2: Add candidate to the selected project
      console.log('📋 MANUAL-SHORTLIST: Adding candidate to project prospects...', {
        projectId,
        candidateIdForProspects,
        searchId: undefined
      });
      
      try {
        const prospectResult = await addProspectsToProjectMutation.mutateAsync({
          projectId,
          candidateIds: [candidateIdForProspects],
          searchId: undefined // No search ID for global search
        });
        
        console.log('📋 MANUAL-SHORTLIST: Project prospect addition result:', prospectResult);

        addToast({
          type: 'success',
          title: 'Candidate Shortlisted',
          message: `${selectedCandidate.fullName || 'Candidate'} has been ${isExternalSourceCandidate ? 'saved to your database and ' : ''}added to the project successfully.`
        });

        console.log('✅ MANUAL-SHORTLIST: Successfully completed for candidate:', selectedCandidate.id);

        setShowProjectModal(false);
        setSelectedCandidate(null);
        
      } catch (prospectError: any) {
        console.error('❌ MANUAL-SHORTLIST: Error adding candidate to prospects:', prospectError);
        // Handle duplicate shortlisting specifically
        if (prospectError?.response?.status === 409 || prospectError?.message?.includes('already exist as prospects')) {
          addToast({
            type: 'info',
            title: 'Already Shortlisted',
            message: `${selectedCandidate.fullName || 'Candidate'} is already shortlisted for this project.`,
            duration: 5000
          });
          setShowProjectModal(false);
          setSelectedCandidate(null);
        } else {
          console.error('Error adding candidate to prospects:', prospectError);
          addToast({
            type: 'error',
            title: 'Shortlisting Failed',
            message: 'Failed to shortlist candidate to the project. Please try again.',
            duration: 7000
          });
        }
        return;
      }
    } finally {
      setShortlistingCandidates(prev => ({ ...prev, [selectedCandidate.id]: false }));
      // Remove the call from active calls
      activeShortlistCallsRef.current.delete(callKey);
    }
  };

  // Filters sidebar handlers
  const handleOpenFilters = () => {
    setTempFilters(convertSearchFiltersToFilterState(filters));
    setTempSearchQuery(searchQuery);
    setShowFiltersSidebar(true);
  };

  const handleCloseFilters = () => {
    setShowFiltersSidebar(false);
    setTempFilters(createDefaultFilterState());
    setTempSearchQuery('');
  };

  const handleApplyFilters = async () => {
    const convertedFilters = convertFilterStateToSearchFilters(tempFilters);
    setFilters(convertedFilters);
    setSearchQuery(tempSearchQuery);
    setShowFiltersSidebar(false);
    
    // Reset pagination and fetch new results
    setCurrentCursor(undefined);
    setNextCursor(undefined);
    setHasNextPage(false);
    setCurrentPage(1);
    
    // Fetch results with new filters - always use external direct search for filter applications
    await fetchResults(convertedFilters, tempSearchQuery, searchMode, false, undefined, true);
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <> {/* Added React.Fragment to wrap main content and panel */}
      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${
        showFiltersSidebar ? 'ml-80' : ''
      } ${
        panelState === 'expanded' ? 'mr-[66.666667%] overflow-hidden' : 
        panelState === 'collapsed' ? 'mr-[33.333333%] overflow-hidden' : 
        ''
      }`}>
        <div className="container mx-auto px-6 py-4">
          {/* Header */}
        <div className="flex items-center justify-between py-6 mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToSearch}
              className="inline-flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {fromQuickSearch ? 'Back to Projects' : 'Back to Search'}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Global Search Results</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-gray-600">
                  Showing {results.length} candidates
                  {searchQuery ? ` for "${searchQuery}"` : ' for your filter criteria'}
                </p>
                {isBooleanSearch && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Boolean Search
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenFilters}
              className="inline-flex items-center px-4 py-2 text-sm bg-purple-600 text-white border border-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Edit Filters
            </button>
          </div>
        </div>

        {/* Search Keywords and Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-500" />
                <h4 className="text-sm font-medium text-gray-900">Search Criteria</h4>
              </div>
              <button
                onClick={() => setIsSearchCriteriaExpanded(!isSearchCriteriaExpanded)}
                className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                {isSearchCriteriaExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show All
                  </>
                )}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {visibleFilterBadges}
            </div>

          </div>
        )}

        {/* Project Requirement Notice */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-800 mb-1">Project Required for Shortlisting</h4>
              <p className="text-sm text-amber-700">
                To shortlist candidates, you'll need to create or select a sourcing project. This helps organize your prospects and manage your recruitment pipeline.
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {results.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search query or filters to find more candidates.
              </p>
              <button
                onClick={handleBackToSearch}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Modify Search
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {results.map((result, index) => {
                const { candidate, matchCriteria, matchedCriteria } = result; // Backend returns CandidateMatchDto with candidate property and match criteria
                // Ensure candidate exists
                if (!candidate) {
                    console.warn("Candidate data is missing for result:", result);
                    return null; // Skip rendering this item
                }
                
                // Map backend candidate structure to frontend expected structure
                const personalInfo = {
                  fullName: candidate.fullName || 'Unknown',
                  email: candidate.email || '',
                  location: candidate.location || 'Location not specified',
                  linkedIn: candidate.linkedIn || candidate.linkedinUrl || '',
                  github: candidate.github || '',
                  facebook: candidate.facebook || candidate.facebookUrl || candidate.facebook_url || '',
                  twitter: candidate.twitter || candidate.twitterUrl || candidate.twitter_url || '',
                  avatar: candidate.avatar || ''
                };
                
                const experience = candidate.experience || [];
                // Extract skills from skillMappings structure
                const skills = candidate.skillMappings 
                  ? candidate.skillMappings.map(mapping => mapping.skill?.name).filter(Boolean)
                  : (candidate.skills ? candidate.skills.map(skill => skill.name || skill) : []);
                
                return (
                  <div key={candidate.id || index} className={`px-6 py-6 hover:bg-gray-50 transition-colors duration-200 ${index !== results.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-start">
                      <input type="checkbox" className="mt-2 mr-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none" />
                      <div className="flex-1">
                        
                        {/* Header with name and actions */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              {personalInfo.avatar ? (
                                <img
                                  src={personalInfo.avatar}
                                  alt={`${personalInfo.fullName} avatar`}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                  onError={(e) => {
                                    // If image fails to load, hide it and show initials fallback
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              {/* Fallback initials avatar */}
                              <div 
                                className={`w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm ${personalInfo.avatar ? 'hidden' : 'flex'}`}
                                style={{ display: personalInfo.avatar ? 'none' : 'flex' }}
                              >
                                {personalInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                            </div>
                            
                            <h3
                              className="text-lg font-semibold cursor-pointer hover:text-purple-600 transition-colors duration-200 flex items-center gap-2"
                              onClick={() => {
                                const userData = convertCandidateToUserData(result);
                                handleOpenProfilePanel(userData, candidate.id);
                              }}
                            >
                              {personalInfo.fullName}
                              {/* Icon indicates clickable, panel will open */}
                              <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </h3>
                            
                            {/* Social Links */}
                            {personalInfo.linkedIn && (
                                <a href={personalInfo.linkedIn.startsWith('http') ? personalInfo.linkedIn : `https://${personalInfo.linkedIn}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-600 transition-colors duration-200" title="LinkedIn">
                                <span className="sr-only">LinkedIn</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </a>
                            )}
                            {personalInfo.github && (
                                <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-600 transition-colors duration-200" title="GitHub">
                                <span className="sr-only">GitHub</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                </a>
                            )}
                            {personalInfo.facebook && (
                                <a href={personalInfo.facebook.startsWith('http') ? personalInfo.facebook : `https://${personalInfo.facebook}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors duration-200" title="Facebook">
                                <span className="sr-only">Facebook</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </a>
                            )}
                            {personalInfo.twitter && (
                                <a href={personalInfo.twitter.startsWith('http') ? personalInfo.twitter : `https://${personalInfo.twitter}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-600 transition-colors duration-200" title="Twitter">
                                <span className="sr-only">Twitter</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                                </a>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleShortlistCandidate(candidate)}
                              disabled={shortlistingCandidates[candidate.id]}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center gap-2 text-sm"
                            >
                              {shortlistingCandidates[candidate.id] ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Shortlisting...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  Shortlist
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Current Position */}
                        <div className="text-sm text-gray-500 mb-3">
                          {experience && experience.length > 0 && (
                            <p className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {experience[0].position} at {experience[0].company}
                              <span className="mx-1.5">•</span>
                              <MapPin className="h-4 w-4" />
                              {personalInfo.location}
                            </p>
                          )}
                        </div>

                        {/* Match Criteria */}
                        {(matchCriteria || matchedCriteria) && (
                          <div className="mb-3 p-3 bg-purple-100 rounded-lg border border-purple-200">
                            <h4 className="text-sm font-medium text-purple-900 mb-2 flex items-center gap-1">
                              <Search className="h-4 w-4" />
                              Match Criteria
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {matchCriteria?.titleMatch && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                  ✓ Job Title Match
                                </span>
                              )}
                              {matchCriteria?.locationMatch && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                  ✓ Location Match
                                </span>
                              )}
                              {matchCriteria?.skillsMatch && matchCriteria.skillsMatch.length > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                  <Code className="h-3 w-3 mr-1" />
                                  {matchCriteria.skillsMatch.length} Skills: {matchCriteria.skillsMatch.slice(0, 2).join(', ')}
                                  {matchCriteria.skillsMatch.length > 2 && ` +${matchCriteria.skillsMatch.length - 2} more`}
                                </span>
                              )}
                              {matchedCriteria && Array.isArray(matchedCriteria) && matchedCriteria.length > 0 && (
                                <>
                                  {matchedCriteria.slice(0, 3).map((criteria, i) => (
                                    <span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                      ✓ {criteria}
                                    </span>
                                  ))}
                                  {matchedCriteria.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                      +{matchedCriteria.length - 3} more matches
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Experience Summary */}
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span
                              className="font-medium cursor-pointer hover:text-purple-600 transition-colors"
                              onClick={() => {
                                const userData = convertCandidateToUserData(result);
                                handleOpenProfilePanel(userData, candidate.id);
                              }}
                            >
                              {personalInfo.fullName.split(' ')[0]}
                            </span>
                            {experience?.[0]?.company ? ` has been a ${experience[0].position} at ${experience[0].company}` : ' has relevant experience'}
                            {experience?.[0]?.startDate && ` since ${new Date(experience[0].startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                            {experience && experience.length > 1 && experience[1].position && `, with prior experience as a ${experience[1].position}`}.
                          </p>
                        </div>

                        {/* Skills */}
                        <div className="mt-3">
                          {skills && skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {skills.slice(0, 4).map((skill: string, i: number) => (
                                <span key={i} className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                                  {skill}
                                </span>
                              ))}
                              {skills.length > 4 && (
                                <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                                  +{skills.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Load More Button */}
              {hasNextPage && (
                <div className="flex justify-center py-8 border-t border-gray-200">
                  <button
                    onClick={handleNextPage}
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Load More Results
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div> {/* Close main container with panel state classes */}
      
      {/* Side Panel and Overlay */}
      {panelState !== 'closed' && (
        <>
          {/* Overlay */}
          {panelState === 'expanded' && (
            <div className="fixed inset-0 bg-black bg-opacity-25 z-40"></div>
          )}
          {/* Panel */}
          <SourcingProfileSidePanel
            userData={selectedUserDataForPanel}
            panelState={panelState}
            onStateChange={handlePanelStateChange}
            candidateId={selectedCandidateId || undefined}
            projectId={undefined} // No project context in global search
          />
        </>
      )}

      {/* Filters Sidebar */}
      {showFiltersSidebar && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleCloseFilters}></div>
          
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Search Filters</h2>
                <p className="text-sm text-gray-500">Customize your search criteria</p>
              </div>
              <button
                onClick={handleCloseFilters}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Search Query */}
              <div className="mb-6 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  Search Keywords
                </label>
                <input
                  type="text"
                  value={tempSearchQuery}
                  onChange={(e) => setTempSearchQuery(e.target.value)}
                  placeholder="Enter keywords..."
                  className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Filter Sections */}
              <div className="space-y-4">
                
                {/* General Filters */}
                <ComprehensiveFilterSection
                  title="Experience & General"
                  icon={Layers}
                  isExpanded={true}
                  hasActiveFilters={
                    (filters.general?.minExperience && filters.general.minExperience !== '0') ||
                    (filters.general?.maxExperience && filters.general.maxExperience !== '') ||
                    (filters.general?.requiredContactInfo && filters.general.requiredContactInfo !== '') ||
                    (filters.general?.hideViewedProfiles && filters.general.hideViewedProfiles !== '') ||
                    (filters.general?.onlyConnections && filters.general.onlyConnections !== '')
                  }
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={tempFilters.general.minExperience}
                          onChange={(e) => setTempFilters(prev => ({
                            ...prev,
                            general: { ...prev.general, minExperience: e.target.value }
                          }))}
                          placeholder="Min"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          value={tempFilters.general.maxExperience}
                          onChange={(e) => setTempFilters(prev => ({
                            ...prev,
                            general: { ...prev.general, maxExperience: e.target.value }
                          }))}
                          placeholder="Max"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </ComprehensiveFilterSection>

                {/* Job & Skills */}
                <ComprehensiveFilterSection
                  title="Job & Skills"
                  icon={Briefcase}
                  isExpanded={true}
                  hasActiveFilters={
                    (filters.job?.titles && filters.job.titles.length > 0) ||
                    (filters.job?.skills && filters.job.skills.length > 0)
                  }
                >
                  <div className="space-y-4">
                    <ArrayFilterInput
                      label="Job Titles"
                      values={tempFilters.job.titles}
                      onChange={(values) => setTempFilters(prev => ({
                        ...prev,
                        job: { ...prev.job, titles: values }
                      }))}
                      placeholder="Add job title..."
                    />
                    <ArrayFilterInput
                      label="Skills & Technologies"
                      values={tempFilters.job.skills}
                      onChange={(values) => setTempFilters(prev => ({
                        ...prev,
                        job: { ...prev.job, skills: values }
                      }))}
                      placeholder="Add skill..."
                    />
                  </div>
                </ComprehensiveFilterSection>

                {/* Location */}
                <ComprehensiveFilterSection
                  title="Location"
                  icon={MapPin}
                  isExpanded={true}
                  hasActiveFilters={
                    (filters.location?.currentLocations && filters.location.currentLocations.length > 0) ||
                    (filters.location?.pastLocations && filters.location.pastLocations.length > 0)
                  }
                >
                  <div className="space-y-4">
                    <ArrayFilterInput
                      label="Current Locations"
                      values={tempFilters.location.currentLocations}
                      onChange={(values) => setTempFilters(prev => ({
                        ...prev,
                        location: { ...prev.location, currentLocations: values }
                      }))}
                      placeholder="Add location..."
                    />
                    <ArrayFilterInput
                      label="Past Locations"
                      values={tempFilters.location.pastLocations}
                      onChange={(values) => setTempFilters(prev => ({
                        ...prev,
                        location: { ...prev.location, pastLocations: values }
                      }))}
                      placeholder="Add past location..."
                    />
                  </div>
                </ComprehensiveFilterSection>

                {/* Company & Industry */}
                <ComprehensiveFilterSection
                  title="Company & Industry"
                  icon={Building}
                  isExpanded={true}
                  hasActiveFilters={
                    (filters.company?.names && filters.company.names.length > 0) ||
                    (filters.company?.industries && filters.company.industries.length > 0)
                  }
                >
                  <div className="space-y-4">
                    <ArrayFilterInput
                      label="Company Names"
                      values={tempFilters.company.names}
                      onChange={(values) => setTempFilters(prev => ({
                        ...prev,
                        company: { ...prev.company, names: values }
                      }))}
                      placeholder="Add company..."
                    />
                    <ArrayFilterInput
                      label="Industries"
                      values={tempFilters.company.industries}
                      onChange={(values) => setTempFilters(prev => ({
                        ...prev,
                        company: { ...prev.company, industries: values }
                      }))}
                      placeholder="Add industry..."
                    />
                  </div>
                </ComprehensiveFilterSection>

                {/* Skills & Keywords */}
                <ComprehensiveFilterSection
                  title="Additional Skills"
                  icon={KeySquare}
                  isExpanded={false}
                >
                  <div className="space-y-4">
                    <ArrayFilterInput
                      label="Skills & Keywords"
                      values={tempFilters.skillsKeywords.items}
                      onChange={(values) => setTempFilters(prev => ({
                        ...prev,
                        skillsKeywords: { ...prev.skillsKeywords, items: values }
                      }))}
                      placeholder="Add keyword..."
                    />
                  </div>
                </ComprehensiveFilterSection>

                {/* Education */}
                <ComprehensiveFilterSection
                  title="Education"
                  icon={GraduationCap}
                  isExpanded={false}
                >
                  <div className="space-y-4">
                    <ArrayFilterInput
                      label="Schools & Universities"
                      values={tempFilters.education.schools}
                      onChange={(values) => setTempFilters(prev => ({
                        ...prev,
                        education: { ...prev.education, schools: values }
                      }))}
                      placeholder="Add school..."
                    />
                    <ArrayFilterInput
                      label="Degrees"
                      values={tempFilters.education.degrees}
                      onChange={(values) => setTempFilters(prev => ({
                        ...prev,
                        education: { ...prev.education, degrees: values }
                      }))}
                      placeholder="Add degree..."
                    />
                    <ArrayFilterInput
                      label="Fields of Study"
                      values={tempFilters.education.majors}
                      onChange={(values) => setTempFilters(prev => ({
                        ...prev,
                        education: { ...prev.education, majors: values }
                      }))}
                      placeholder="Add field..."
                    />
                  </div>
                </ComprehensiveFilterSection>

                {/* Languages */}
                <ComprehensiveFilterSection
                  title="Languages"
                  icon={Globe}
                  isExpanded={false}
                >
                  <div className="space-y-4">
                    <ArrayFilterInput
                      label="Languages"
                      values={tempFilters.languages.items}
                      onChange={(values) => setTempFilters(prev => ({
                        ...prev,
                        languages: { ...prev.languages, items: values }
                      }))}
                      placeholder="Add language..."
                    />
                  </div>
                </ComprehensiveFilterSection>

                {/* Power Filters */}
                <ComprehensiveFilterSection
                  title="Power Filters"
                  icon={Zap}
                  isExpanded={false}
                >
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={tempFilters.power.isOpenToRemote}
                        onChange={(e) => setTempFilters(prev => ({
                          ...prev,
                          power: { ...prev.power, isOpenToRemote: e.target.checked }
                        }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Open to Remote Work
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={tempFilters.power.hasEmail}
                        onChange={(e) => setTempFilters(prev => ({
                          ...prev,
                          power: { ...prev.power, hasEmail: e.target.checked }
                        }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Has Email Address
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={tempFilters.power.hasPhone}
                        onChange={(e) => setTempFilters(prev => ({
                          ...prev,
                          power: { ...prev.power, hasPhone: e.target.checked }
                        }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        Has Phone Number
                      </label>
                    </div>
                  </div>
                </ComprehensiveFilterSection>

              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={handleCloseFilters}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}

      {/* Project Selection Modal */}
      <ProjectSelectionModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setSelectedCandidate(null);
        }}
        candidate={selectedCandidate}
        onProjectSelected={handleProjectSelected}
        searchState={{
          query: searchQuery,
          filters: filters,
          searchMode: searchMode,
          isGlobalSearch: true,
          fromQuickSearch: fromQuickSearch
        }}
      />
    </>
  );
};

export default GlobalSearchResultsPage;
