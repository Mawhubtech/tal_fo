import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  ToggleRight,
  Search as SearchIcon,
  Filter,
  X
} from 'lucide-react';
import AdvancedFilterPanel, { type AdvancedFilters } from '../components/AdvancedFilterPanel';
import BooleanSearchDialog from '../sourcing/search/components/BooleanSearchDialog';
import JobDescriptionDialog from '../recruitment/components/JobDescriptionDialog';
import { extractEnhancedKeywords, convertEnhancedKeywordsToFilters, extractKeywords, convertKeywordsToFilters, searchCandidatesExternalDirect, searchCandidatesExternalEnhanced, searchCandidatesDirectAI, searchCandidatesFromJobDescription, searchCandidatesFromBooleanQuery, searchCandidatesWithAdvancedFilters } from '../services/searchService';
import BooleanSearchParser from '../services/booleanSearchParser';
import type { SearchFilters } from '../services/searchService';
import { useToast } from '../contexts/ToastContext';
import { useSearch, useExternalSourceSearch, useCombinedSearch } from '../hooks/useSearch';

export interface GlobalSearchRef {
  clearSearch: () => void;
}

const GlobalSearchComponent = forwardRef<GlobalSearchRef>((props, ref) => {  
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  
  // Search hooks for different modes
  const databaseSearch = useSearch();
  const externalSourceSearch = useExternalSourceSearch();
  const combinedSearch = useCombinedSearch();
  
  const [searchQuery, setSearchQuery] = useState('');  
  const [isAdvancedFilterPanelVisible, setIsAdvancedFilterPanelVisible] = useState(false);
  const [isBooleanDialogOpen, setIsBooleanDialogOpen] = useState(false);
  const [isJobDescriptionDialogOpen, setIsJobDescriptionDialogOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoadingMessage, setSearchLoadingMessage] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [searchMode, setSearchMode] = useState<'database' | 'external' | 'combined'>('external'); // Default to external search
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});

  // Loading messages to cycle through
  const loadingMessages = [
    'Analyzing query with AI...',
    'Generating intelligent filters...',
    'Searching candidate databases...',
    'Processing results...',
    'Matching profiles...',
    'Ranking candidates...',
  ];

  // Cycle through loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSearching) {
      setCurrentMessageIndex(0);
      setSearchLoadingMessage(loadingMessages[0]);
      
      interval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % loadingMessages.length;
          setSearchLoadingMessage(loadingMessages[nextIndex]);
          return nextIndex;
        });
      }, 2500); // Change message every 2.5 seconds
    } else {
      setSearchLoadingMessage('');
      setCurrentMessageIndex(0);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isSearching]);

  // Handle state from other pages
  useEffect(() => {
    if (location.state) {
      const { query, fromQuickSearch } = location.state;
      if (query) {
        setSearchQuery(query);
        if (fromQuickSearch) {
          // Auto-trigger search if coming from quick search
          setTimeout(() => handleAISearch(), 100);
        }
      }
    }
  }, [location.state]);

  // Expose clear functionality through ref
  useImperativeHandle(ref, () => ({
    clearSearch: () => {
      setSearchQuery('');
    }
  }));

  // Main function for AI keyword extraction and direct search
  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Check if this is a boolean search query
      const isBooleanQuery = searchQuery.includes('+Keywords:') || 
                           searchQuery.includes('+Job title:') || 
                           searchQuery.includes('+Location:');
      
      let keywords, filters, searchResults;
      
      if (isBooleanQuery) {
        console.log('GlobalSearch: Detected boolean search query');
        
        // Validate boolean query
        const validation = BooleanSearchParser.validateQuery(searchQuery);
        if (!validation.isValid) {
          addToast({
            type: 'error',
            title: 'Invalid Boolean Query',
            message: validation.errors.join(', ')
          });
          setIsSearching(false);
          return;
        }
        
        // Parse boolean query
        const parsedQuery = BooleanSearchParser.parseQuery(searchQuery);
        filters = BooleanSearchParser.convertToSearchFilters(parsedQuery);
        
        console.log('GlobalSearch: Parsed boolean query filters:', filters);
        
        // Get rich search results using external enhanced search
        if (searchMode === 'external' || searchMode === 'combined') {
          try {
            searchResults = await searchCandidatesExternalEnhanced(filters, searchQuery, { page: 1, limit: 3 });
            console.log("Got boolean search results:", searchResults);
          } catch (searchError) {
            console.warn("Boolean search failed, will navigate without preloaded results:", searchError);
          }
        }
        
        // Navigate to global search results with boolean search data
        navigate('/search-results', {
          state: {
            query: searchQuery,
            filters: filters,
            searchMode: searchMode,
            isGlobalSearch: true,
            isBooleanSearch: true,
            preloadedResults: searchResults
          }
        });
      } else {
        // Handle regular search queries with SINGLE AI call (optimized)
        try {
          let usedSingleAICall = false;
          
          // Single AI call - combines keyword extraction, filter conversion, and query generation
          if (searchMode === 'external' || searchMode === 'combined') {
            try {
              console.log("🚀 Using optimized single AI call for search");
              searchResults = await searchCandidatesDirectAI(searchQuery, {
                urgency: 'medium',
                flexibility: 'moderate', 
                primaryFocus: 'balanced',
                isLocationAgnostic: false,
                balanceMode: 'recall_optimized'
              }, { page: 1, limit: 3 }, true); // disableCache: true for fresh results
              console.log("✅ Got search results from single AI call:", searchResults);
              
              // Create mock filters for navigation compatibility
              filters = {
                mustFilters: {},
                shouldFilters: {},
                searchText: searchQuery
              };
              
              usedSingleAICall = true;
            } catch (searchError) {
              console.warn("❌ Single AI search failed, falling back to 3-step process:", searchError);
              
              // Fallback to original 3-step process if single AI call fails
              keywords = await extractEnhancedKeywords(searchQuery);
              
              filters = await convertEnhancedKeywordsToFilters(keywords);
              console.log("🔄 Fallback - AI extracted enhanced filters:", filters);
              
              searchResults = await searchCandidatesExternalEnhanced(filters, searchQuery, { page: 1, limit: 3 });
              console.log("🔄 Fallback - Got results from 3-step process:", searchResults);
            }
          }
          
          // Navigate to global search results with enhanced data and search results
          if (usedSingleAICall) {
            // Navigation for single AI call (no keywords object)
            navigate('/search-results', {
              state: {
                query: searchQuery,
                filters: filters,
                searchMode: searchMode,
                isGlobalSearch: true,
                isEnhanced: true,
                singleCallOptimized: true,
                preloadedResults: searchResults
              }
            });
          } else {
            // Navigation for 3-step fallback (has keywords object)
            navigate('/search-results', {
              state: {
                query: searchQuery,
                filters: filters,
                searchMode: searchMode,
                isGlobalSearch: true,
                isEnhanced: true,
                criticalRequirements: keywords?.criticalRequirements,
                preferredCriteria: keywords?.preferredCriteria,
                contextualHints: keywords?.contextualHints,
                preloadedResults: searchResults
              }
            });
          }
        } catch (enhancedError) {
          console.warn('Enhanced search failed, falling back to standard search:', enhancedError);
          
          // Fallback to regular keyword extraction
          keywords = await extractKeywords(searchQuery);
          filters = await convertKeywordsToFilters(keywords);
          
          console.log("AI extracted filters (fallback):", filters);
          
          // Try to get search results with fallback filters
          if (searchMode === 'external' || searchMode === 'combined') {
            try {
              searchResults = await searchCandidatesExternalEnhanced(filters, searchQuery, { page: 1, limit: 3 });
              console.log("Got fallback search results:", searchResults);
            } catch (searchError) {
              console.warn("Fallback search also failed, will navigate without preloaded results:", searchError);
            }
          }
          
          // Navigate to global search results with standard data
          navigate('/search-results', {
            state: {
              query: searchQuery,
              filters: filters,
              searchMode: searchMode,
              isGlobalSearch: true,
              preloadedResults: searchResults
            }
          });
        }
      }
    } catch (error) {
      console.error('Error in AI search:', error);
      setIsSearching(false);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Failed to process search. Please try again.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Execute search with current filters
  const runSearch = async (filters: SearchFilters) => {
    setIsSearching(true);
    try {
      // Navigate to global search results
      navigate('/search-results', {
        state: {
          query: searchQuery,
          filters: filters,
          searchMode: searchMode,
          isGlobalSearch: true
        }
      });
    } catch (error) {
      console.error('Error with search navigation:', error);
      setIsSearching(false);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Failed to process search. Please try again.'
      });
    }
  };

  // Helper function to convert frontend AdvancedFilters to backend format
  const convertAdvancedFiltersForAPI = (filters: AdvancedFilters): any => {
    const converted: any = { ...filters };
    
    // Convert array fields to strings where backend expects strings
    if (Array.isArray(converted.jobTitle)) {
      converted.jobTitle = converted.jobTitle.join(', ');
    }
    
    // For location fields, use "OR" logic format that AI can understand
    if (Array.isArray(converted.locationRawAddress)) {
      converted.locationRawAddress = converted.locationRawAddress.join(' OR ');
    }
    
    if (Array.isArray(converted.locationCountry)) {
      converted.locationCountry = converted.locationCountry.join(' OR ');
    }
    
    if (Array.isArray(converted.locationRegions)) {
      converted.locationRegions = converted.locationRegions.join(' OR ');
    }
    
    if (Array.isArray(converted.experienceCompany)) {
      converted.experienceCompany = converted.experienceCompany.join(' OR ');
    }
    
    if (Array.isArray(converted.experienceLocation)) {
      converted.experienceLocation = converted.experienceLocation.join(' OR ');
    }
    
    if (Array.isArray(converted.companyHqLocation)) {
      converted.companyHqLocation = converted.companyHqLocation.join(' OR ');
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
    
    // Convert skills to array if it's a string
    if (typeof converted.skills === 'string') {
      converted.skills = converted.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    
    // Convert languages to array if it's a string
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

  // Handle filter changes from advanced filter panel
  const handleAdvancedFiltersChange = (newFilters: AdvancedFilters) => {
    console.log('🔧 AdvancedFilterPanel called handleAdvancedFiltersChange with:', newFilters);
    setAdvancedFilters(newFilters);
  };

  // Handle applying advanced filters
  const handleApplyFilters = async () => {
    console.log('🎯 Applying Advanced Filters:', advancedFilters, 'with search query:', searchQuery);
    setIsAdvancedFilterPanelVisible(false);
    setIsSearching(true);
    
    try {
      // Convert filters for API
      const convertedFilters = convertAdvancedFiltersForAPI(advancedFilters);
      console.log('GlobalSearchComponent: Converted advanced filters for API:', convertedFilters);
      
      let searchResults;
      
      // Use advanced filters search endpoint
      try {
        searchResults = await searchCandidatesWithAdvancedFilters(convertedFilters, searchQuery || '', { page: 1, limit: 3 });
        console.log("GlobalSearchComponent: Got advanced filter search results:", searchResults);
        console.log("GlobalSearchComponent: Results count:", searchResults?.results?.length || 0);
      } catch (searchError) {
        console.warn("Advanced filter search failed, will navigate without preloaded results:", searchError);
      }
      
      // Navigate to global search results with preloaded data
      navigate('/search-results', {
        state: {
          query: searchQuery,
          advancedFilters: advancedFilters, // Pass the original filters
          searchMode: searchMode,
          isGlobalSearch: true,
          isAdvancedFilterSearch: true,
          preloadedResults: searchResults
        }
      });
    } catch (error) {
      console.error('Error applying filters:', error);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Failed to apply filters. Please try again.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle clearing advanced filters
  const handleClearAdvancedFilters = () => {
    console.log('🧹 Clearing Advanced Filters');
    setAdvancedFilters({});
  };

  // Toggle advanced filter panel visibility
  const toggleAdvancedFilters = () => {
    setIsAdvancedFilterPanelVisible(!isAdvancedFilterPanelVisible);
  };

  // Handle boolean search using single-step AI direct approach
  const handleBooleanSearch = async (booleanQuery: string) => {
    console.log('handleBooleanSearch called with Boolean query');
    setIsSearching(true);
    setIsBooleanDialogOpen(false);
    
    try {
      // Extract a concise summary from the Boolean query for display
      const querySummary = extractBooleanQuerySummary(booleanQuery);
      console.log('📝 Boolean Query Summary:', querySummary);
      
      // Use the new single-step Boolean AI search
      const searchResults = await searchCandidatesFromBooleanQuery(booleanQuery, {
        urgency: 'high',
        flexibility: 'strict', // Boolean searches are precise
        primaryFocus: 'precision',
        searchType: 'boolean_query'
      }, { page: 1, limit: 3 });
      
      console.log('🎯 Boolean AI search results:', searchResults);
      
      // Navigate to search results with Boolean query data
      navigate('/search-results', {
        state: {
          query: querySummary, // Display concise summary
          originalQuery: booleanQuery, // Keep original for reference
          searchMode: searchMode,
          isGlobalSearch: true,
          isBooleanSearch: true,
          singleCallOptimized: true,
          preloadedResults: searchResults,
          metadata: searchResults.metadata
        }
      });
    } catch (error) {
      console.error('Error with boolean search:', error);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Failed to process boolean search. Please try again.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Extract concise summary from Boolean query for UI display
  const extractBooleanQuerySummary = (booleanQuery: string): string => {
    try {
      // Remove parentheses and operators for cleaner display
      const cleanQuery = booleanQuery
        .replace(/[()]/g, '') // Remove parentheses
        .replace(/\s+(AND|OR|NOT)\s+/gi, ', ') // Replace operators with commas
        .replace(/\s*-\s*/g, ' NOT ') // Keep NOT for clarity
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // Limit length for display
      if (cleanQuery.length > 100) {
        return cleanQuery.substring(0, 97) + '...';
      }
      
      return cleanQuery;
    } catch (error) {
      console.error('Error extracting Boolean query summary:', error);
      return booleanQuery; // Fallback to original
    }
  };

  // Handle job description search using single-step AI direct approach
  const handleJobDescriptionSearch = async (jobDescription: string) => {
    console.log('handleJobDescriptionSearch called with job description');
    setIsSearching(true);
    setIsJobDescriptionDialogOpen(false);
    
    try {
      // Use the new single-step job description AI direct search
      const searchResults = await searchCandidatesFromJobDescription(
        jobDescription,
        {
          urgency: 'medium',
          flexibility: 'highly_flexible',
          primaryFocus: 'comprehensive',
          isLocationAgnostic: false,
          balanceMode: 'recall_optimized',
          searchType: 'job_description',
          skillMatchingMode: 'flexible',
          useSkillVariations: true
        },
        { page: 1, limit: 3 },
        true // disable cache
      );

      console.log("✅ Got job description search results (single-step):", searchResults);
      
      // Create a concise summary of the job description for display
      const jobDescriptionSummary = extractJobDescriptionSummary(jobDescription);
      
      // Navigate to global search results with preloaded data
      navigate('/search-results', {
        state: {
          query: jobDescriptionSummary, // Use summary instead of full description
          fullJobDescription: jobDescription, // Store full description for reference
          filters: searchResults.convertedFilters || {},
          searchMode: 'external',
          isGlobalSearch: true,
          isJobDescriptionSearch: true,
          preloadedResults: searchResults,
          generatedFilters: searchResults.generatedFilters
        }
      });
    } catch (error) {
      console.error('❌ Error with job description search:', error);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Failed to process job description search. Please try again.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Helper function to extract a concise summary from job description
  const extractJobDescriptionSummary = (jobDescription: string): string => {
    // Try to extract the job title from markdown format
    const titleMatch = jobDescription.match(/\*\*Job Title:\s*(.+?)\*\*/);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      
      // Try to extract location
      const locationMatch = jobDescription.match(/\*\*Location:\*\*\s*(.+?)[\n*]/);
      const location = locationMatch ? locationMatch[1].trim() : '';
      
      // Try to extract key skills from the description
      const skillMatches = jobDescription.match(/\b(React|Node\.js|JavaScript|TypeScript|Python|Java|\.NET|AWS|Azure|GCP)\b/gi);
      const uniqueSkills = skillMatches ? [...new Set(skillMatches.slice(0, 3))] : [];
      
      // Build summary
      let summary = title;
      if (uniqueSkills.length > 0) {
        summary += ` with ${uniqueSkills.join(', ')}`;
      }
      if (location) {
        summary += ` in ${location}`;
      }
      
      return summary;
    }
    
    // Fallback: Extract first meaningful line or first 150 characters
    const lines = jobDescription.split('\n').filter(line => line.trim().length > 0);
    const firstLine = lines[0] || '';
    
    // Remove markdown formatting
    const cleanLine = firstLine.replace(/\*\*/g, '').replace(/\*/g, '').trim();
    
    if (cleanLine.length > 150) {
      return cleanLine.substring(0, 147) + '...';
    }
    
    return cleanLine || 'Job Description Search';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-center items-start pt-6 sm:pt-12 md:pt-20 min-h-screen px-3 sm:px-4 md:px-6">
        {/* Centered Search Section */}
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg sm:shadow-xl md:shadow-2xl border sm:border-2 border-purple-300 sm:border-purple-400 p-4 sm:p-6 md:p-8">
          {/* Logo and title */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex-1"></div> {/* Spacer */}
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center flex-1">Talent Search</h1>
              {searchQuery.trim() && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-md sm:rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors flex-shrink-0"
                  title="Clear search and start fresh"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
              {!searchQuery.trim() && <div className="flex-1"></div>} {/* Spacer when no clear button */}
            </div>
            <p className="text-gray-500 text-xs sm:text-sm px-2 sm:px-0">
              Search across all talent databases and discover top talent.
            </p>
          </div>
          
          {/* Who are you looking for section */}
          <div className="w-full mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
              <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-700">Who are you looking for?</h2>
            </div>
            
            <div className="relative">
              <div className="bg-gray-50 p-2.5 sm:p-4 md:p-4 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 border border-gray-200 hover:border-purple-300 focus-within:border-purple-400 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. Software Engineers with 5+ years..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none flex-1 text-sm sm:text-base md:text-lg text-gray-800 placeholder-gray-400 min-w-0 py-0.5 sm:py-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim() && !isSearching) {
                        handleAISearch();
                      }
                    }}
                    disabled={isSearching}
                  />
                  {searchQuery.trim() && !isSearching && (
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                      }}
                      className="text-gray-400 hover:text-gray-600 active:text-gray-700 p-1 rounded-md transition-colors flex-shrink-0 sm:hidden"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {/* Search button */}
                <button 
                  onClick={handleAISearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-gray-400 text-white px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-2.5 rounded-md text-sm sm:text-base md:text-base font-medium transition-colors flex items-center justify-center gap-2 flex-shrink-0 w-full sm:w-auto"
                  title="Search candidates"
                >
                  <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Loading Status Display */}
          <div className="w-full mb-2 sm:mb-3">
            {isSearching ? (
              <div className="text-center py-2">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base md:text-lg font-bold text-purple-600">
                    {searchLoadingMessage || 'Searching...'}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Action buttons */}
          <div className="w-full">
            <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 sm:mb-4 px-2">Or use advanced search options:</p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 md:gap-4">
              <button
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-purple-700 border border-purple-300 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                onClick={() => setIsJobDescriptionDialogOpen(true)}
                title="Search from Job Description"
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Job Description</span>
              </button>

              <button
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-purple-700 border border-purple-300 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                onClick={() => setIsBooleanDialogOpen(true)}
                title="Boolean Search"
              >
                <ToggleRight className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Boolean Search</span>
              </button>
              
              <button
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-purple-700 border border-purple-300 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                onClick={toggleAdvancedFilters}
                title="Advanced Filters"
              >
                <Filter className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Advanced Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        filters={advancedFilters}
        onFiltersChange={handleAdvancedFiltersChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearAdvancedFilters}
        isVisible={isAdvancedFilterPanelVisible}
        onToggle={toggleAdvancedFilters}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
      
      {/* Boolean Search Dialog */}
      <BooleanSearchDialog
        isOpen={isBooleanDialogOpen}
        onClose={() => setIsBooleanDialogOpen(false)}
        onSearch={handleBooleanSearch}
      />

      {/* Job Description Dialog */}
      <JobDescriptionDialog
        isOpen={isJobDescriptionDialogOpen}
        onClose={() => setIsJobDescriptionDialogOpen(false)}
        onSearch={handleJobDescriptionSearch}
      />

    </div>
  );
});

export default GlobalSearchComponent;
