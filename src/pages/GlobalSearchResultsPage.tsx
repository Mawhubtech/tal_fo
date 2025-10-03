import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Eye, Plus, Loader2, CheckCircle, MapPin, Building, Code, Search, Sparkles, Filter, X, ChevronDown, ChevronUp, Layers, KeySquare, GraduationCap, Zap, Command, Briefcase, Globe, User, Settings } from 'lucide-react';
import { useSearch, useExternalSourceSearch, useCombinedSearch } from '../hooks/useSearch';
import { useAddProspectsToProject } from '../hooks/useSourcingProjects';
import { useShortlistExternalCandidate } from '../hooks/useShortlistExternal';
import { useProfileAnalysis } from '../hooks/useProfileAnalysis';
import { useAuthContext } from '../contexts/AuthContext';
import type { SearchFilters } from '../services/searchService';
import { searchEnhanced, searchCandidatesExternalDirect, searchCandidatesExternalEnhanced, fetchCachedEnhancedResults, fetchCachedAdvancedFiltersResults, searchCandidatesWithAdvancedFilters } from '../services/searchService';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ProjectSelectionModal from '../components/ProjectSelectionModal';
import SourcingProfileSidePanel, { type PanelState } from '../sourcing/outreach/components/SourcingProfileSidePanel';
import type { UserStructuredData } from '../components/ProfileSidePanel';

import AdvancedFilterPanel, { type AdvancedFilters } from '../components/AdvancedFilterPanel';
import { convertAdvancedFiltersToQuery, generateFilterSummary } from '../services/advancedFilterService';
import AISearchCriteriaDisplay from '../components/AISearchCriteriaDisplay';
import { convertAIQueryToAdvancedFilters } from '../utils/aiQueryParser';

// Helper function to convert frontend AdvancedFilters to backend AdvancedFiltersDto format
const convertAdvancedFiltersForAPI = (filters: AdvancedFilters): any => {
  const converted: any = { ...filters };
  
  // Convert array fields to strings where backend expects strings
  if (Array.isArray(converted.jobTitle)) {
    converted.jobTitle = converted.jobTitle.join(', '); // Convert array to comma-separated string
  }
  
  // For location fields, use "OR" logic format that AI can understand
  if (Array.isArray(converted.locationRawAddress)) {
    converted.locationRawAddress = converted.locationRawAddress.join(' OR '); // Use OR for multiple locations
  }
  
  if (Array.isArray(converted.locationCountry)) {
    converted.locationCountry = converted.locationCountry.join(' OR ');
  }
  
  if (Array.isArray(converted.locationRegions)) {
    converted.locationRegions = converted.locationRegions.join(' OR ');
  }
  
  if (Array.isArray(converted.experienceCompany)) {
    converted.experienceCompany = converted.experienceCompany.join(' OR '); // Use OR for multiple companies
  }
  
  if (Array.isArray(converted.experienceLocation)) {
    converted.experienceLocation = converted.experienceLocation.join(' OR '); // Use OR for multiple experience locations
  }
  
  if (Array.isArray(converted.companyHqLocation)) {
    converted.companyHqLocation = converted.companyHqLocation.join(' OR '); // Use OR for multiple HQ locations
  }
  
  if (Array.isArray(converted.companyHqCountry)) {
    converted.companyHqCountry = converted.companyHqCountry.join(' OR ');
  }
  
  if (Array.isArray(converted.companyHqRegions)) {
    converted.companyHqRegions = converted.companyHqRegions.join(' OR ');
  }
  
  if (Array.isArray(converted.companyHqCity)) {
    converted.companyHqCity = converted.companyHqCity.join(' OR ');
  }
  
  // Convert skills to array if it's a string (backend expects array)
  if (typeof converted.skills === 'string') {
    converted.skills = converted.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  
  // Convert languages to array if it's a string (backend expects array)  
  if (typeof converted.languages === 'string') {
    converted.languages = converted.languages.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  
  // Remove empty or undefined fields
  Object.keys(converted).forEach(key => {
    const value = converted[key];
    if (value === undefined || value === null || value === '' || 
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length === 0)) {
      delete converted[key];
    }
  });
  
  return converted;
};

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
      general: { minExperience: '', maxExperience: '', requiredContactInfo: '', hideViewedProfiles: '', onlyConnections: '' },
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

// Filter Section Component (Legacy - keeping for compatibility)
interface FilterSectionProps {
  title: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}


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
  const [queryHash, setQueryHash] = useState<string | null>(null); // Store query hash for cache-based pagination
  
  // Advanced Filter State
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [isAdvancedFilterVisible, setIsAdvancedFilterVisible] = useState(false);
  const [useAdvancedFilters, setUseAdvancedFilters] = useState(false);
  
  // Query visualization state
  const [generatedQuery, setGeneratedQuery] = useState<any>(null);
  const [isAICriteriaExpanded, setIsAICriteriaExpanded] = useState(false);
  const [lastSearchMetadata, setLastSearchMetadata] = useState<any>(null);







  // Helper function to highlight keywords in text with improved relevance
  const highlightKeywords = (text: string, keywords: string[] = [], candidate?: any) => {
    if (!text || keywords.length === 0) return text;
    
    // Expanded stop words to exclude from highlighting
    const stopWords = new Set([
      'the', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'can', 'shall', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 
      'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'between', 'among', 'under', 'over', 'out', 'off', 'down', 'during', 'against',
      'and', 'or', 'but', 'so', 'yet', 'nor', 'if', 'then', 'else', 'when', 'where',
      'how', 'why', 'what', 'who', 'which', 'that', 'this', 'these', 'those', 'i',
      'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my',
      'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'ours', 'theirs', 'a', 'an',
      'as', 'an', 'all', 'any', 'each', 'every', 'some', 'many', 'most', 'few', 'both',
      'either', 'neither', 'more', 'less', 'much', 'little', 'very', 'too', 'quite',
      'rather', 'just', 'only', 'also', 'even', 'still', 'already', 'yet', 'again',
      'once', 'twice', 'here', 'there', 'everywhere', 'anywhere', 'somewhere', 'nowhere',
      'now', 'then', 'today', 'tomorrow', 'yesterday', 'always', 'never', 'sometimes',
      'often', 'usually', 'rarely', 'seldom', 'frequently', 'occasionally'
    ]);
    
    // Get more intelligent highlighting keywords
    const getRelevantKeywords = () => {
      const relevantKeywords = new Set<string>();
      
      // Add explicit search keywords (filter out stop words)
      if (searchQuery) {
        searchQuery.split(/[\s,]+/).forEach(word => {
          const cleanWord = word.toLowerCase().trim().replace(/[^\w]/g, '');
          if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
            relevantKeywords.add(cleanWord);
          }
        });
      }
      
      // Add job titles from search filters
      if (filters?.job?.titles) {
        filters.job.titles.forEach(title => {
          // Add the full title if it's a meaningful phrase
          const cleanTitle = title.toLowerCase().trim();
          if (cleanTitle.length > 3 && cleanTitle.split(' ').length <= 4) {
            relevantKeywords.add(cleanTitle);
          }
          
          // Also add individual significant words
          title.split(/[\s,]+/).forEach(word => {
            const cleanWord = word.toLowerCase().trim().replace(/[^\w]/g, '');
            if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
              relevantKeywords.add(cleanWord);
            }
          });
        });
      }
      
      // Add skills from search filters
      if (filters?.job?.skills) {
        filters.job.skills.forEach(skill => {
          // Add the full skill if it's a meaningful phrase
          const cleanSkill = skill.toLowerCase().trim();
          if (cleanSkill.length > 2) {
            relevantKeywords.add(cleanSkill);
          }
          
          // Also add individual significant words for compound skills
          skill.split(/[\s,]+/).forEach(word => {
            const cleanWord = word.toLowerCase().trim().replace(/[^\w]/g, '');
            if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
              relevantKeywords.add(cleanWord);
            }
          });
        });
      }
      
      // Add skills keywords from search filters
      if (filters?.skillsKeywords?.items) {
        filters.skillsKeywords.items.forEach(keyword => {
          keyword.split(/[\s,]+/).forEach(word => {
            const cleanWord = word.toLowerCase().trim().replace(/[^\w]/g, '');
            if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
              relevantKeywords.add(cleanWord);
            }
          });
        });
      }
      
      // Add company names from search filters
      if (filters?.company?.names) {
        filters.company.names.forEach(company => {
          company.split(/[\s,]+/).forEach(word => {
            const cleanWord = word.toLowerCase().trim().replace(/[^\w]/g, '');
            if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
              relevantKeywords.add(cleanWord);
            }
          });
        });
      }
      
      // Add candidate's own skills if available for context-aware highlighting
      if (candidate?.skillMappings) {
        candidate.skillMappings.forEach((skillMapping: any) => {
          if (skillMapping.skill?.name) {
            const skill = skillMapping.skill.name.toLowerCase().trim();
            if (skill.length > 2 && !stopWords.has(skill)) {
              // Only add skills that are also in search context
              const contextText = (searchQuery || '').toLowerCase();
              const filterSkills = [
                ...(filters?.job?.skills || []),
                ...(filters?.skillsKeywords?.items || [])
              ].map(s => s.toLowerCase());
              
              if (contextText.includes(skill) || 
                  filterSkills.some(fs => fs.includes(skill) || skill.includes(fs))) {
                relevantKeywords.add(skill);
              }
            }
          }
        });
      }
      
      // Add current position keywords if relevant to search
      if (candidate?.currentPosition) {
        const positionWords = candidate.currentPosition.split(/[\s,]+/);
        positionWords.forEach(word => {
          const cleanWord = word.toLowerCase().trim().replace(/[^\w]/g, '');
          if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
            const contextText = (searchQuery || '').toLowerCase();
            const filterTitles = (filters?.job?.titles || []).map(t => t.toLowerCase());
            
            if (contextText.includes(cleanWord) || 
                filterTitles.some(title => title.includes(cleanWord))) {
              relevantKeywords.add(cleanWord);
            }
          }
        });
      }
      
      // Add technology/technical keywords that are commonly relevant
      const techKeywords = [
        'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'typescript',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'api', 'microservices', 'devops',
        'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'kafka',
        'machine', 'learning', 'artificial', 'intelligence', 'blockchain', 'cloud',
        'frontend', 'backend', 'fullstack', 'mobile', 'ios', 'android', 'flutter',
        'fintech', 'healthcare', 'e-commerce', 'saas', 'startup', 'enterprise',
        'finance', 'financial', 'cfo', 'director', 'manager', 'analyst', 'consultant',
        'leadership', 'management', 'strategy', 'operations', 'technology', 'digital'
      ];
      
      // Only add tech keywords if they appear in the search context or text
      const contextText = (searchQuery || '').toLowerCase();
      techKeywords.forEach(keyword => {
        if (contextText.includes(keyword) || text.toLowerCase().includes(keyword)) {
          relevantKeywords.add(keyword);
        }
      });
      
      return Array.from(relevantKeywords);
    };
    
    const allKeywords = [...keywords, ...getRelevantKeywords()]
      .filter(keyword => keyword && keyword.length > 2)
      .map(k => k.toLowerCase().trim());
    
    if (allKeywords.length === 0) return text;
    
    // Create regex pattern for all keywords with word boundaries
    // Sort keywords by length (longest first) to prioritize longer matches
    const sortedKeywords = allKeywords.sort((a, b) => b.length - a.length);
    const escapedKeywords = sortedKeywords.map(keyword => 
      keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const pattern = new RegExp(`\\b(${escapedKeywords.join('|')})\\b`, 'gi');
    
    // Split text and highlight matches
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Add highlighted match
      parts.push(
        <span key={`highlight-${match.index}`} className="bg-purple-200 text-purple-900 font-semibold px-1 rounded">
          {match[0]}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length > 1 ? parts : text;
  };


  // Track active shortlist calls to prevent duplicates (use ref to avoid React state delays)
  const activeShortlistCallsRef = useRef<Set<string>>(new Set());
  
  // State for the profile side panel
  const [selectedUserDataForPanel, setSelectedUserDataForPanel] = useState<UserStructuredData | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [panelState, setPanelState] = useState<PanelState>('closed');
  

  
  // State for search criteria card expansion
  const [isSearchCriteriaExpanded, setIsSearchCriteriaExpanded] = useState(false);
  
  // State for AI profile analysis
  const [candidateAnalyses, setCandidateAnalyses] = useState<Record<string, { summary: string; keyHighlights: string[] }>>({});
  const [loadingAnalyses, setLoadingAnalyses] = useState<Set<string>>(new Set());
  
  // Search hooks for different modes
  const { executeSearch } = useSearch();
  const { executeSearch: executeExternalSourceSearch } = useExternalSourceSearch();
  const { executeSearch: executeCombinedSearch } = useCombinedSearch();
  const addProspectsToProjectMutation = useAddProspectsToProject();
  const shortlistExternalMutation = useShortlistExternalCandidate();
  const profileAnalysis = useProfileAnalysis();
  
  // Get current user context
  const { user } = useAuthContext();

  // Handle state from search page
  useEffect(() => {
 
    
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

          
          const resultsToSet = preloadedResults.results || [];

          setResults(resultsToSet);
          setIsLoading(false);
          
          // Extract queryHash from preloaded results for future pagination

          
          const preloadedQueryHash = preloadedResults?.metadata?.queryHash || 
                                   preloadedResults?.queryHash || 
                                   preloadedResults?.data?.metadata?.queryHash;
          
          if (preloadedQueryHash) {

            setQueryHash(preloadedQueryHash);

          } else {
            console.warn('⚠️ No queryHash found in preloaded results!');
            console.warn('Available keys in preloadedResults:', Object.keys(preloadedResults || {}));
            console.warn('Available keys in preloaded metadata:', Object.keys(preloadedResults?.metadata || {}));
          }
          
          // Extract generated query and metadata from preloaded results
          let extractedQuery = null;
          let extractedFilters = null;
          
          if (preloadedResults.generatedFilters) {
            extractedQuery = preloadedResults.generatedFilters;
          } else if (preloadedResults.generatedQuery) {
            extractedQuery = preloadedResults.generatedQuery;
          } else if (preloadedResults.metadata?.generatedFilters) {
            extractedQuery = preloadedResults.metadata.generatedFilters;
          } else if (preloadedResults.metadata?.generatedQuery) {
            extractedQuery = preloadedResults.metadata.generatedQuery;
          } else if (preloadedResults.metadata?.aiMetadata?.generatedFilters) {
            extractedQuery = preloadedResults.metadata.aiMetadata.generatedFilters;
          } else if (preloadedResults.metadata?.aiMetadata?.generatedQuery) {
            extractedQuery = preloadedResults.metadata.aiMetadata.generatedQuery;
          }
          
          // Extract converted filters
          if (preloadedResults.convertedFilters) {
            extractedFilters = preloadedResults.convertedFilters;
          } else if (preloadedResults.metadata?.convertedFilters) {
            extractedFilters = preloadedResults.metadata.convertedFilters;
          }
          
          // Store the query if we found one
          if (extractedQuery) {
            setGeneratedQuery(extractedQuery);

          }
          

          
          // Store complete search metadata with AI information from preloaded results
          if (preloadedResults.metadata) {
            const metadata = {
              aiModel: preloadedResults.metadata?.aiModel || preloadedResults.metadata?.aiMetadata?.model || preloadedResults.aiModel,
              queryProcessingTime: preloadedResults.metadata?.queryProcessingTime || preloadedResults.queryProcessingTime,
              confidence: preloadedResults.metadata?.confidence || preloadedResults.metadata?.aiMetadata?.confidence || preloadedResults.confidence,
              explanation: preloadedResults.metadata?.aiMetadata?.explanation,
              optimizations: preloadedResults.metadata?.aiMetadata?.optimizations,
              originalQuery: query,
              timestamp: new Date().toISOString(),
              searchMode: searchMode,
              useEnhanced: isEnhanced,
              useAdvancedFilters: false, // preloaded results are from regular searches
              queryGenerated: preloadedResults.metadata?.aiMetadata?.queryGenerated,
              schemaAware: preloadedResults.metadata?.aiMetadata?.schemaAware,
              searchType: 'preloaded-enhanced'
            };
            setLastSearchMetadata(metadata);

          }

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
            
            setHasNextPage(hasMorePages);
            setNextCursor(hasMorePages ? (currentPageNum + 1).toString() : undefined);
            setCurrentPage(currentPageNum);
            
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



  // Check if advanced filters have values
  const hasAdvancedFilters = useMemo(() => {
    return Object.keys(advancedFilters).some(key => {
      const value = advancedFilters[key as keyof AdvancedFilters];
      if (Array.isArray(value)) {
        return value.length > 0;
      } else if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => {
          if (typeof v === 'number') return v !== 0;
          if (typeof v === 'string') return v !== '';
          return v !== undefined && v !== null;
        });
      } else {
        return value !== undefined && value !== '' && value !== null && value !== false;
      }
    });
  }, [advancedFilters]);

  // Memoized check for active filters (includes both regular and advanced filters)


  // Memoized filter badges for expandable display
 

  // Show limited badges when collapsed (first 4), all when expanded


  // Advanced Filter Handlers
  const handleAdvancedFiltersChange = React.useCallback((newFilters: AdvancedFilters) => {
    console.log('🔧 AdvancedFilterPanel called handleAdvancedFiltersChange with:', newFilters);
    
    // Always allow direct updates from the AdvancedFilterPanel
    // This includes removing location filters when user clears them
    setAdvancedFilters(newFilters);
  }, []);

  const handleApplyAdvancedFilters = () => {
    console.log('🎯 Applying Advanced Filters:', advancedFilters, 'with search query:', searchQuery);
    setUseAdvancedFilters(true);
    setIsAdvancedFilterVisible(false);
    
    // Reset pagination for new search
    setCurrentPage(1);
    setCurrentCursor(undefined);
    setNextCursor(undefined);
    setQueryHash(null);
    
    // Start fresh search with advanced filters and current search query
    fetchResults({}, searchQuery, 'external', false, undefined, true);
  };

  const handleSearchQueryChange = (newQuery: string) => {
    console.log('🔍 Search Query Changed from Advanced Filters:', newQuery);
    setSearchQuery(newQuery);
  };

  const handleClearAdvancedFilters = () => {
    console.log('🧹 Clearing Advanced Filters (intentional)');
    // Force clear the advanced filters (bypass protection)
    setAdvancedFilters({});
    setUseAdvancedFilters(false);
    
    // Optionally restart search with cleared filters
    if (searchQuery || Object.keys(filters).length > 0) {
      // Reset pagination for new search
      setCurrentPage(1);
      setCurrentCursor(undefined);
      setNextCursor(undefined);
      setQueryHash(null);
      
      // Return to regular search
      fetchResults(filters, searchQuery, searchMode, isEnhanced, undefined, true);
    } else {
      // Clear results if no other search criteria
      setResults([]);
    }
  };

  const toggleAdvancedFilters = () => {
    setIsAdvancedFilterVisible(!isAdvancedFilterVisible);
  };

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
      setQueryHash(null); // Reset queryHash for new search
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const searchMode = mode || 'database';
      let searchResults: any;
      let apiRequestPayload: any = null; // Store API request payload for later use
      
      // Check if we should use advanced filters instead of regular search
      // Use advanced filters API if hasAdvancedFilters is true (automatically detects when filters are applied)
      if (hasAdvancedFilters && Object.keys(advancedFilters).some(key => advancedFilters[key as keyof AdvancedFilters] !== undefined)) {
        try {
        
          
          const pageNumber = cursor ? parseInt(cursor) : 1;
          
          
          
          // Check if this is a pagination request and we have a queryHash
          if (pageNumber > 1 && queryHash && !resetResults) {
            console.log('✅ Using ADVANCED FILTERS CACHE endpoint for page', pageNumber, 'with queryHash:', queryHash);
            searchResults = await fetchCachedAdvancedFiltersResults(queryHash, { 
              page: pageNumber, 
              limit: 3 
            });
          } else {
            console.log('✅ Using NEW ADVANCED FILTERS SEARCH endpoint for page', pageNumber, 'reasons:', {
              isFirstPage: pageNumber === 1,
              noQueryHash: !queryHash,
              isReset: resetResults
            });
            
    
            
            // Convert frontend filters to backend format
            const convertedFilters = convertAdvancedFiltersForAPI(advancedFilters);
          
            
            // Store the actual API request payload for later use in populating filters
            apiRequestPayload = { filters: convertedFilters, searchText: query || '' };
            
            searchResults = await searchCandidatesWithAdvancedFilters(convertedFilters, query || '', { 
              page: pageNumber, 
              limit: 3 
            });
            
            // Store queryHash from initial search for future pagination
          
            
            // Try multiple possible locations for queryHash
            const possibleQueryHash = searchResults?.metadata?.queryHash || 
                                    searchResults?.queryHash || 
                                    searchResults?.data?.metadata?.queryHash;
            
            if (possibleQueryHash) {
              
              setQueryHash(possibleQueryHash);
             
            } else {
              console.warn('⚠️ No queryHash found in advanced filters response!');
              console.warn('Available keys in searchResults:', Object.keys(searchResults || {}));
              console.warn('Available keys in metadata:', Object.keys(searchResults?.metadata || {}));
            }
          }
          
     
          
          
        } catch (advancedError) {
          console.error('❌ Advanced filters search failed:', advancedError);
          console.error('❌ Advanced filters error details:', advancedError.response?.data);
          addToast({
            type: 'error',
            title: 'Advanced Search Failed',
            message: 'There was an error with the advanced search. Please try again or use regular search.'
          });
          // Don't fall back to regular search if advanced filters failed
          setIsLoading(false);
          setIsLoadingMore(false);
          return;
        }
      }
      
      // For external or combined search, try enhanced search first if available (if not using advanced filters)
      if (!hasAdvancedFilters && useEnhanced && (searchMode === 'external' || searchMode === 'combined') && query) {
        try {
          const pageNumber = cursor ? parseInt(cursor) : 1;
          
      
          
          // Check if this is a pagination request and we have a queryHash
          if (pageNumber > 1 && queryHash && !resetResults) {
            
            searchResults = await fetchCachedEnhancedResults(queryHash, { 
              page: pageNumber, 
              limit: 3 
            });
          } else {
            
            searchResults = await searchCandidatesExternalEnhanced(filters, query, { 
              page: pageNumber, 
              limit: 3 
            });
            
      
            
            // Try multiple possible locations for queryHash
            const possibleQueryHash = searchResults?.metadata?.queryHash || 
                                    searchResults?.queryHash || 
                                    searchResults?.data?.metadata?.queryHash;
            
            if (possibleQueryHash) {
             
              setQueryHash(possibleQueryHash);
             
            } else {
              console.warn('⚠️ No queryHash found in any expected location!');
              console.warn('Available keys in searchResults:', Object.keys(searchResults || {}));
              console.warn('Available keys in metadata:', Object.keys(searchResults?.metadata || {}));
            }
          }
        } catch (enhancedError) {
          console.warn('GlobalSearchResults: Enhanced external search failed, using fallback:', enhancedError);
          // Fallback to standard search methods
          useEnhanced = false;
        }
      }
      
      // If enhanced search wasn't used or failed, use standard search methods (but only if not using advanced filters)
      if (!hasAdvancedFilters && (!useEnhanced || !searchResults)) {
      
        
        // For external search, prefer our direct external search for richer data
        if (searchMode === 'external') {
          try {
          
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
        
        setHasNextPage(hasMorePages);
        setNextCursor(hasMorePages ? (currentPageNum + 1).toString() : undefined);
        
      } else {
        setNextCursor(undefined);
        setHasNextPage(false);
      }

      // Store generated query and metadata for visualization (from any search with AI data)
      if (resetResults && searchResults) {
        // Store generatedFilters/generatedQuery if available - try multiple locations
        let extractedQuery = null;
        let extractedFilters = null;
        
        if (searchResults.generatedFilters) {
          extractedQuery = searchResults.generatedFilters;
        } else if (searchResults.generatedQuery) {
          extractedQuery = searchResults.generatedQuery;
        } else if (searchResults.metadata?.generatedFilters) {
          extractedQuery = searchResults.metadata.generatedFilters;
        } else if (searchResults.metadata?.generatedQuery) {
          extractedQuery = searchResults.metadata.generatedQuery;
        } else if (searchResults.metadata?.aiMetadata?.generatedFilters) {
          extractedQuery = searchResults.metadata.aiMetadata.generatedFilters;
        } else if (searchResults.metadata?.aiMetadata?.generatedQuery) {
          extractedQuery = searchResults.metadata.aiMetadata.generatedQuery;
        }
        
        // Extract converted filters
        if (searchResults.convertedFilters) {
          extractedFilters = searchResults.convertedFilters;
        } else if (searchResults.metadata?.convertedFilters) {
          extractedFilters = searchResults.metadata.convertedFilters;
        }
        
        // Always store the query if we found one, regardless of search type
        if (extractedQuery) {
          setGeneratedQuery(extractedQuery);
         
        }
        
        // Store the extracted filters for potential use
        if (extractedFilters) {
         
          
          // Update main filters state to show the converted filters for ANY search that returns them
          if (resetResults && extractedFilters) {
            const searchType = hasAdvancedFilters ? 'advanced search' : 'external AI direct search';
         
            
            // Clear old filters and build new ones from converted filters
            const newFilters: SearchFilters = {
              general: { minExperience: '', maxExperience: '', requiredContactInfo: '', hideViewedProfiles: '', onlyConnections: '' },
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
            
            // Map converted filters to the main filters structure
            if (extractedFilters.jobTitle) {
              newFilters.job!.titles = Array.isArray(extractedFilters.jobTitle) ? extractedFilters.jobTitle : [extractedFilters.jobTitle];
            }
            
            if (extractedFilters.skills) {
              newFilters.job!.skills = Array.isArray(extractedFilters.skills) ? extractedFilters.skills : [extractedFilters.skills];
            }
            
            // Handle location information differently based on search type
            if (hasAdvancedFilters) {
              // For advanced filters, extract location information from multiple sources
              let apiAdvancedFilters = searchResults.metadata?.advancedFilters || {};
              let requestFilters = apiRequestPayload?.filters || {};
              
            
              
              // Check multiple sources for location information (in order of preference)
              const locationSources = [
                apiAdvancedFilters.locationRawAddress,
                requestFilters.locationRawAddress,
                advancedFilters.locationRawAddress
              ].filter(Boolean);
              
              if (locationSources.length > 0) {
                const sourceLocation = locationSources[0]; // Use the first available source
                const locations = Array.isArray(sourceLocation) 
                  ? sourceLocation 
                  : sourceLocation.split(' OR ').map(loc => loc.trim());
                newFilters.location!.currentLocations = locations;
        
              }
              
              // Handle country information
              const countrySources = [
                apiAdvancedFilters.locationCountry,
                requestFilters.locationCountry,
                advancedFilters.locationCountry
              ].filter(Boolean);
              
              if (countrySources.length > 0) {
                const sourceCountry = countrySources[0];
                const countries = Array.isArray(sourceCountry) 
                  ? sourceCountry 
                  : sourceCountry.split(' OR ').map(loc => loc.trim());
                // Add to current locations if not already there
                newFilters.location!.currentLocations = [...(newFilters.location!.currentLocations || []), ...countries];
              
              }
              
              // Handle regions information
              const regionSources = [
                apiAdvancedFilters.locationRegions,
                requestFilters.locationRegions,
                advancedFilters.locationRegions
              ].filter(Boolean);
              
              if (regionSources.length > 0) {
                const sourceRegions = regionSources[0];
                const regions = Array.isArray(sourceRegions) 
                  ? sourceRegions 
                  : sourceRegions.split(' OR ').map(loc => loc.trim());
                // Add to current locations if not already there
                newFilters.location!.currentLocations = [...(newFilters.location!.currentLocations || []), ...regions];
             
              }
            } else {
              // For regular external AI direct search, extract location from convertedFilters or original filters
              if (extractedFilters.location) {
                const locations = Array.isArray(extractedFilters.location) 
                  ? extractedFilters.location 
                  : [extractedFilters.location];
                newFilters.location!.currentLocations = locations;
              }
              
              // Also check original filters for location information
              if (filters.location?.currentLocations && filters.location.currentLocations.length > 0) {
                newFilters.location!.currentLocations = [...(newFilters.location!.currentLocations || []), ...filters.location.currentLocations];
              }
            }
            
            // Add other filter types from extracted filters
            if (extractedFilters.company) {
              newFilters.company!.names = Array.isArray(extractedFilters.company) ? extractedFilters.company : [extractedFilters.company];
            }
            
            if (extractedFilters.industries) {
              newFilters.company!.industries = Array.isArray(extractedFilters.industries) ? extractedFilters.industries : [extractedFilters.industries];
            }
            
            // Remove duplicates from all arrays
            if (newFilters.location!.currentLocations) {
              newFilters.location!.currentLocations = Array.from(new Set(newFilters.location!.currentLocations));
            }
            if (newFilters.job!.titles) {
              newFilters.job!.titles = Array.from(new Set(newFilters.job!.titles));
            }
            if (newFilters.job!.skills) {
              newFilters.job!.skills = Array.from(new Set(newFilters.job!.skills));
            }
            if (newFilters.company!.names) {
              newFilters.company!.names = Array.from(new Set(newFilters.company!.names));
            }
            if (newFilters.company!.industries) {
              newFilters.company!.industries = Array.from(new Set(newFilters.company!.industries));
            }
            
         
            setFilters(newFilters);
          }
        }
        
        // CRITICAL: Always update main filters state from advancedFilters when using advanced search
        // This ensures the filters sidebar shows the applied filters regardless of convertedFilters availability
        if (hasAdvancedFilters && resetResults) {
          
          // Create new filters state based on current advancedFilters
          const sidebarFilters: SearchFilters = {
            general: { minExperience: '', maxExperience: '', requiredContactInfo: '', hideViewedProfiles: '', onlyConnections: '' },
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
          
          // Map advancedFilters to main filters structure for sidebar display
          if (advancedFilters.jobTitle) {
            sidebarFilters.job!.titles = Array.isArray(advancedFilters.jobTitle) ? advancedFilters.jobTitle : [advancedFilters.jobTitle];
          }
          
          if (advancedFilters.skills) {
            sidebarFilters.job!.skills = Array.isArray(advancedFilters.skills) ? advancedFilters.skills : [advancedFilters.skills];
          }
          
          // CRITICAL: Map location fields from advancedFilters to sidebar
          const locationParts = [];
          if (advancedFilters.locationRawAddress) {
            locationParts.push(advancedFilters.locationRawAddress);
          }
          if (advancedFilters.locationCountry) {
            locationParts.push(advancedFilters.locationCountry);
          }
          if (advancedFilters.locationRegions) {
            if (Array.isArray(advancedFilters.locationRegions)) {
              locationParts.push(...advancedFilters.locationRegions);
            } else {
              locationParts.push(advancedFilters.locationRegions);
            }
          }
          
          if (locationParts.length > 0) {
            // Flatten and deduplicate location parts
            const flattenedLocations = locationParts.flatMap(part => 
              typeof part === 'string' ? part.split(/[,|]/).map(s => s.trim()) : [part]
            ).filter(Boolean);
            
            sidebarFilters.location!.currentLocations = Array.from(new Set(flattenedLocations));
           
          }
          
          // Map other fields
          if (advancedFilters.experienceCompany) {
            sidebarFilters.company!.names = Array.isArray(advancedFilters.experienceCompany) 
              ? advancedFilters.experienceCompany 
              : [advancedFilters.experienceCompany];
          }
          

          setFilters(sidebarFilters);
        }
        
        // Update advanced filters state with data from API request/response (for advanced search)
        // Priority: 1. API response advancedFilters (PREFERRED - contains complete data from backend AI), 2. Original API request filters, 3. convertedFilters mapping
   
        
        if (hasAdvancedFilters) {
          let filtersToSet: AdvancedFilters | null = null;
          
          // HIGHEST PRIORITY: Use AI Query Parser to convert generatedQuery directly to AdvancedFilters
          // This bypasses the legacy convertedFilters system and directly parses the AI-generated Elasticsearch query
          if (extractedQuery) {
  
            
            const aiParsedFilters = convertAIQueryToAdvancedFilters(extractedQuery);
          
            
            // Merge with any existing advanced filters to preserve user input
            filtersToSet = {
              ...advancedFilters, // Preserve existing user input
              ...aiParsedFilters  // Override with AI-parsed data
            };
            
            
          }
          // Second priority: ALWAYS use advancedFilters from API response metadata when available
          // This contains the complete, processed filter data from the backend AI including location information
          else if (searchResults.metadata?.advancedFilters) {

            filtersToSet = { ...searchResults.metadata.advancedFilters }; // Create a copy to avoid mutations
          }
          // Third priority: Use the original API request filters (what was actually sent)
          // This is the most reliable source when metadata.advancedFilters is missing
          else if (apiRequestPayload?.filters) {

            
            const requestFilters: AdvancedFilters = {};
            
            // Map the API request payload back to AdvancedFilters format
            const reqFilters = apiRequestPayload.filters;
            if (reqFilters.jobTitle) {
              requestFilters.jobTitle = reqFilters.jobTitle;
            }
            if (reqFilters.skills) {
              requestFilters.skills = reqFilters.skills;
            }
            if (reqFilters.experienceTitle) {
              requestFilters.experienceTitle = reqFilters.experienceTitle;
            }
            if (reqFilters.experienceDescription) {
              requestFilters.experienceDescription = reqFilters.experienceDescription;
            }
            if (reqFilters.experienceCompany) {
              requestFilters.experienceCompany = reqFilters.experienceCompany;
            }
            if (reqFilters.isWorking !== undefined) {
              requestFilters.isWorking = reqFilters.isWorking;
            }
            if (reqFilters.fullName) {
              requestFilters.fullName = reqFilters.fullName;
            }
            
            // CRITICAL: Enhanced location handling - ALWAYS preserve original advanced filter location info
            // The API request payload should contain the exact location data that was sent
            if (reqFilters.locationRawAddress) {
              requestFilters.locationRawAddress = reqFilters.locationRawAddress;
            } else if (advancedFilters.locationRawAddress) {
              requestFilters.locationRawAddress = advancedFilters.locationRawAddress;
            }
            
            if (reqFilters.locationCountry) {
              requestFilters.locationCountry = reqFilters.locationCountry;
            } else if (advancedFilters.locationCountry) {
              requestFilters.locationCountry = advancedFilters.locationCountry;
            }
            
            if (reqFilters.locationRegions) {
              requestFilters.locationRegions = reqFilters.locationRegions;
            } else if (advancedFilters.locationRegions) {
              requestFilters.locationRegions = advancedFilters.locationRegions;
            }
            filtersToSet = requestFilters;
          }
          // Fourth priority: If we still don't have filter data, use original advancedFilters (USER INPUT PRESERVATION)
          else {

            filtersToSet = { ...advancedFilters }; // Preserve original user input
          }
          
          // Update the advancedFilters state if we have something to set
          if (filtersToSet && Object.keys(filtersToSet).length > 0) {
   
            // Final fallback: ensure location is preserved from original advancedFilters if missing
            if (!filtersToSet.locationRawAddress && !filtersToSet.locationCountry && !filtersToSet.locationRegions) {
              if (advancedFilters.locationRawAddress || advancedFilters.locationCountry || advancedFilters.locationRegions) {
                console.log('🔧 Final fallback: adding missing location from original advancedFilters');
                filtersToSet = {
                  ...filtersToSet,
                  locationRawAddress: filtersToSet.locationRawAddress || advancedFilters.locationRawAddress,
                  locationCountry: filtersToSet.locationCountry || advancedFilters.locationCountry,
                  locationRegions: filtersToSet.locationRegions || advancedFilters.locationRegions
                };
                console.log('🔧 Enhanced filtersToSet with location fallback:', filtersToSet);
              }
            }
            
            // 🚨 EMERGENCY FIX: If we still don't have location in filtersToSet but main filters has it, copy it over
            const mainFiltersHasLocation = filters?.location?.currentLocations && filters.location.currentLocations.length > 0;
            const advFiltersHasLocation = filtersToSet.locationRawAddress || filtersToSet.locationCountry || filtersToSet.locationRegions;
            
            if (mainFiltersHasLocation && !advFiltersHasLocation) {
              filtersToSet = {
                ...filtersToSet,
                locationRawAddress: filters.location.currentLocations[0] // Take the first location
              };
            }
            
      
            setAdvancedFilters(filtersToSet);
      
          } else {
            console.log('⚠️ WARNING: No filters to set from priority system - this might be why location is missing');
            
            // 🚨 LAST RESORT: If no filtersToSet but we have main filters location, create minimal filtersToSet
            const mainFiltersHasLocation = filters?.location?.currentLocations && filters.location.currentLocations.length > 0;
            if (mainFiltersHasLocation) {

              const emergencyFilters = {
                ...advancedFilters, // Keep existing advanced filters
                locationRawAddress: filters.location.currentLocations[0]
              };
              
              setAdvancedFilters(emergencyFilters);
            }
          }
        } else {
          console.log('⚠️ WARNING: Priority system not running because hasAdvancedFilters is false');
        }
        
        // Store complete search metadata with AI information
        const metadata = {
          aiModel: searchResults.metadata?.aiModel || searchResults.metadata?.aiMetadata?.model || searchResults.aiModel,
          queryProcessingTime: searchResults.metadata?.queryProcessingTime || searchResults.queryProcessingTime,
          confidence: searchResults.metadata?.confidence || searchResults.metadata?.aiMetadata?.confidence || searchResults.confidence,
          explanation: searchResults.metadata?.aiMetadata?.explanation,
          optimizations: searchResults.metadata?.aiMetadata?.optimizations,
          originalQuery: query,
          timestamp: new Date().toISOString(),
          searchMode: searchMode,
          useEnhanced: useEnhanced,
          useAdvancedFilters: useAdvancedFilters,
          queryGenerated: searchResults.metadata?.aiMetadata?.queryGenerated,
          schemaAware: searchResults.metadata?.aiMetadata?.schemaAware,
          searchType: useAdvancedFilters ? 'advanced-filters' : 'enhanced-external'
        };
        setLastSearchMetadata(metadata);
        
    
      }

      if (resetResults) {
        // For new search, replace all results
       
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

    
    // Mark this call as active
    activeShortlistCallsRef.current.add(callKey);
    
    try {
      setShortlistingCandidates(prev => ({ ...prev, [candidate.id]: true }));

      // Determine if this is an external source candidate
      const isExternalSourceCandidate = searchMode === 'external' || (searchMode === 'combined' && candidate.source === 'coresignal') || candidate.coreSignalId;
      let candidateIdForProspects = candidate.id;

      // Step 1: If external source candidate, save to database first
      if (isExternalSourceCandidate && (candidate.coreSignalId || candidate.id)) {
       
        try {
          const coreSignalId = candidate.coreSignalId || candidate.id;
          const shortlistResult = await shortlistExternalMutation.mutateAsync({
            coreSignalId: coreSignalId,
            candidateData: candidate,
            createdBy: user?.id || ''
          });

      

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
  
      
      try {
        const prospectResult = await addProspectsToProjectMutation.mutateAsync({
          projectId: projectId,
          candidateIds: [candidateIdForProspects],
          searchId: undefined, // No search ID for auto-shortlisting from project creation
        });
        
        

        addToast({
          type: 'success',
          title: 'Candidate Shortlisted Successfully',
          message: `${candidate.fullName || candidate.candidateName || 'Candidate'} has been ${isExternalSourceCandidate ? 'saved to your database and ' : ''}added to your project!`
        });
        
  
        
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

      return;
    }



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

      
      try {
        const prospectResult = await addProspectsToProjectMutation.mutateAsync({
          projectId,
          candidateIds: [candidateIdForProspects],
          searchId: undefined // No search ID for global search
        });
        
      

        addToast({
          type: 'success',
          title: 'Candidate Shortlisted',
          message: `${selectedCandidate.fullName || 'Candidate'} has been ${isExternalSourceCandidate ? 'saved to your database and ' : ''}added to the project successfully.`
        });

    

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



  // AI Profile Analysis Handler
  const handleGenerateAnalysis = async (candidate: any) => {
    const candidateId = candidate.id;
    
    // Don't regenerate if already exists or is loading
    if (candidateAnalyses[candidateId] || loadingAnalyses.has(candidateId)) {
      return;
    }
    
    try {
      // Mark as loading
      setLoadingAnalyses(prev => new Set(prev).add(candidateId));
      
      // Prepare search context for AI analysis
      const searchContext = {
        query: searchQuery,
        filters: filters
      };
      
      // Generate analysis with search context
      const analysis = await profileAnalysis.generateAnalysis(candidate, searchContext);
      
      if (analysis) {
        setCandidateAnalyses(prev => ({
          ...prev,
          [candidateId]: analysis
        }));
      }
    } catch (error) {
      console.error('Error generating candidate analysis:', error);
      addToast({
        type: 'error',
        title: 'Analysis Failed',
        message: 'Failed to generate AI analysis for this candidate.',
        duration: 5000
      });
    } finally {
      // Remove from loading set
      setLoadingAnalyses(prev => {
        const newSet = new Set(prev);
        newSet.delete(candidateId);
        return newSet;
      });
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // � REAL-TIME EMERGENCY FIX: Ensure location data is present before rendering AdvancedFilterPanel
  const getFixedAdvancedFilters = (): AdvancedFilters => {
    const mainFiltersHasLocation = filters?.location?.currentLocations && filters.location.currentLocations.length > 0;
    const advFiltersHasLocation = advancedFilters.locationRawAddress || advancedFilters.locationCountry || advancedFilters.locationRegions;
    
    // Only auto-fix if we have minimal filters (initial state), not when user has actively managed filters
    const hasMinimalFilters = Object.keys(advancedFilters).length <= 3;
    
    if (mainFiltersHasLocation && !advFiltersHasLocation && hasAdvancedFilters && hasMinimalFilters) {
      const fixedFilters = {
        ...advancedFilters,
        locationRawAddress: filters.location.currentLocations[0]
      };
      
      // Update state for future renders
      setAdvancedFilters(fixedFilters);
      return fixedFilters;
    }
    
    return advancedFilters;
  };
  
  const fixedAdvancedFilters = getFixedAdvancedFilters();

  // �🔍 DEBUG: Log what props are being passed to AdvancedFilterPanel


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Filters Sidebar */}
      <AdvancedFilterPanel
        filters={fixedAdvancedFilters}
        onFiltersChange={handleAdvancedFiltersChange}
        onApplyFilters={handleApplyAdvancedFilters}
        onClearFilters={handleClearAdvancedFilters}
        isVisible={isAdvancedFilterVisible}
        onToggle={toggleAdvancedFilters}
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
        generatedQuery={generatedQuery}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        panelState === 'expanded' ? 'mr-[66.666667%] overflow-hidden' : 
        panelState === 'collapsed' ? 'mr-[33.333333%] overflow-hidden' : 
        ''
      } ${isAdvancedFilterVisible ? 'ml-80' : ''}`}>
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
                {useAdvancedFilters && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    <Settings className="w-3 h-3 mr-1" />
                    Advanced Filters Active
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAdvancedFilters}
              className={`inline-flex items-center px-4 py-2 text-sm border rounded-lg transition-colors ${
                isAdvancedFilterVisible
                  ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                  : 'bg-white text-purple-600 border-purple-600 hover:bg-purple-50'
              }`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Filters
            </button>
          </div>
        </div>

 

        {/* AI Generated Search Criteria Display */}
        {generatedQuery && (
          <AISearchCriteriaDisplay
            generatedQuery={generatedQuery}
            searchText={searchQuery}
            className="mb-6"
            collapsible={true}
            defaultExpanded={true}
            onClick={toggleAdvancedFilters}
          />
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
                  <div key={candidate.id || index} className={`px-4 py-4 hover:bg-gray-50 transition-colors duration-200 ${index !== results.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none" />
                      <div className="flex-1">
                        
                        {/* Header with name and actions */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              {personalInfo.avatar ? (
                                <img
                                  src={personalInfo.avatar}
                                  alt={`${personalInfo.fullName} avatar`}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
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
                                className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm ${personalInfo.avatar ? 'hidden' : 'flex'}`}
                                style={{ display: personalInfo.avatar ? 'none' : 'flex' }}
                              >
                                {personalInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                            </div>
                            
                            <div>
                              <h3
                                className="text-base font-semibold cursor-pointer hover:text-purple-600 transition-colors duration-200 flex items-center gap-1"
                                onClick={() => {
                                  const userData = convertCandidateToUserData(result);
                                  handleOpenProfilePanel(userData, candidate.id);
                                }}
                              >
                                {personalInfo.fullName}
                                {/* Icon indicates clickable, panel will open */}
                                <svg className="h-3 w-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </h3>
                            </div>
                            
                            {/* Social Links */}
                            <div className="flex items-center gap-1">
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
                          </div>
                          <div className="flex items-center gap-2">
                            {/* AI Analysis Button */}
                            {candidateAnalyses[candidate.id] ? (
                              <button
                                onClick={() => {
                                  setCandidateAnalyses(prev => {
                                    const newAnalyses = { ...prev };
                                    delete newAnalyses[candidate.id];
                                    return newAnalyses;
                                  });
                                }}
                                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors flex items-center gap-1 text-xs font-medium"
                                title="Clear AI Analysis"
                              >
                                <Sparkles className="h-3 w-3" />
                                Clear Analysis
                              </button>
                            ) : loadingAnalyses.has(candidate.id) ? (
                              <button
                                disabled
                                className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded transition-colors flex items-center gap-1 text-xs font-medium cursor-not-allowed"
                              >
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Analyzing...
                              </button>
                            ) : (
                              <button
                                onClick={() => handleGenerateAnalysis(candidate)}
                                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors flex items-center gap-1 text-xs font-medium"
                              >
                                <Sparkles className="h-3 w-3" />
                                AI Analysis
                              </button>
                            )}
                            
                            {/* Shortlist Button */}
                            <button
                              onClick={() => handleShortlistCandidate(candidate)}
                              disabled={shortlistingCandidates[candidate.id]}
                              className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center gap-1 text-xs font-medium"
                            >
                              {shortlistingCandidates[candidate.id] ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Adding...
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

                        {/* Current Position & Location */}
                        <div className="mb-2">
                          {experience && experience.length > 0 && (
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1 flex-wrap">
                                <Building className="h-3 w-3 text-purple-600 flex-shrink-0" />
                                <span className="font-medium">{experience[0].position}</span>
                                <span className="text-gray-400">at</span>
                                <span>{experience[0].company}</span>
                                
                                {/* Company URLs */}
                                {(experience[0].companyWebsite || experience[0].companyLinkedinUrl || experience[0].companyFacebookUrl || experience[0].companyTwitterUrl) && (
                                  <span className="flex items-center gap-1 ml-1">
                                    {experience[0].companyLinkedinUrl && (
                                      <a 
                                        href={experience[0].companyLinkedinUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                        title="Company LinkedIn"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                        </svg>
                                      </a>
                                    )}
                                    {experience[0].companyWebsite && (
                                      <a 
                                        href={experience[0].companyWebsite} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-gray-500 hover:text-purple-600 transition-colors"
                                        title="Company Website"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                      </a>
                                    )}
                                    {experience[0].companyFacebookUrl && (
                                      <a 
                                        href={Array.isArray(experience[0].companyFacebookUrl) ? experience[0].companyFacebookUrl[0] : experience[0].companyFacebookUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                        title="Company Facebook"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                      </a>
                                    )}
                                    {experience[0].companyTwitterUrl && (
                                      <a 
                                        href={Array.isArray(experience[0].companyTwitterUrl) ? experience[0].companyTwitterUrl[0] : experience[0].companyTwitterUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sky-500 hover:text-sky-700 transition-colors"
                                        title="Company Twitter"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                        </svg>
                                      </a>
                                    )}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <MapPin className="h-3 w-3" />
                                {personalInfo.location}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Professional Summary */}
                        <div className="mt-2">
                          {candidate.summary ? (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {highlightKeywords(
                                candidate.summary.length > 280 
                                  ? candidate.summary.substring(0, 280) + '...' 
                                  : candidate.summary,
                                matchedCriteria || [],
                                candidate
                              )}
                              {candidate.summary.length > 280 && (
                                <button
                                  onClick={() => {
                                    const userData = convertCandidateToUserData(result);
                                    handleOpenProfilePanel(userData, candidate.id);
                                  }}
                                  className="text-purple-600 hover:text-purple-800 font-medium ml-1"
                                >
                                  Read more
                                </button>
                              )}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              No summary available. Click to view full profile.
                            </p>
                          )}
                        </div>

                        {/* AI Analysis Display (only when analysis exists) */}
                        {candidateAnalyses[candidate.id] && (
                          <div className="mt-3">
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-200">
                              <div className="flex items-center gap-1 mb-2">
                                <Sparkles className="h-4 w-4 text-purple-600" />
                                <span className="text-xs font-semibold text-purple-700">AI Analysis</span>
                                {(searchQuery || (filters && Object.keys(filters).some(key => filters[key] && typeof filters[key] === 'object' && Object.keys(filters[key]).length > 0))) && (
                                  <span className="text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full ml-1">
                                    Search-Aware
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-purple-800 mb-2 leading-relaxed">
                                {candidateAnalyses[candidate.id].summary}
                              </p>
                              {candidateAnalyses[candidate.id].keyHighlights.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {candidateAnalyses[candidate.id].keyHighlights.map((highlight, i) => (
                                    <span 
                                      key={i}
                                      className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full"
                                    >
                                      {highlight}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}



                        {/* Skills */}
                        <div className="mt-3">
                          {skills && skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {skills.slice(0, 8).map((skill: string, i: number) => {
                                // Check if this skill is in matched criteria for highlighting
                                const isMatched = matchedCriteria?.some(criteria => 
                                  criteria.toLowerCase().includes(skill.toLowerCase()) ||
                                  skill.toLowerCase().includes(criteria.toLowerCase())
                                );
                                
                                return (
                                  <span 
                                    key={i} 
                                    className={`inline-block px-2 py-1 text-xs font-medium rounded transition-colors ${
                                      isMatched 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-purple-100 text-purple-800'
                                    }`}
                                  >
                                    {skill}
                                  </span>
                                );
                              })}
                              {skills.length > 8 && (
                                <button
                                  onClick={() => {
                                    const userData = convertCandidateToUserData(result);
                                    handleOpenProfilePanel(userData, candidate.id);
                                  }}
                                  className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                >
                                  +{skills.length - 8}
                                </button>
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
    </div>
  );
};

export default GlobalSearchResultsPage;
