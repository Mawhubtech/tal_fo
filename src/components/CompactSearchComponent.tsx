import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  ToggleRight,
  Search as SearchIcon,
  Filter,
  X,
  Plus,
  ChevronDown
} from 'lucide-react';
import FilterDialog, { FilterState } from './FilterDialog';
import BooleanSearchDialog from '../sourcing/search/components/BooleanSearchDialog';
import JobDescriptionDialog from '../recruitment/components/JobDescriptionDialog';
import { extractEnhancedKeywords, convertEnhancedKeywordsToFilters, extractKeywords, convertKeywordsToFilters, searchCandidatesExternalEnhanced, searchCandidatesDirectAI } from '../services/searchService';
import BooleanSearchParser from '../services/booleanSearchParser';
import type { SearchFilters } from '../services/searchService';
import { useToast } from '../contexts/ToastContext';

export interface CompactSearchRef {
  clearSearch: () => void;
}

interface CompactSearchComponentProps {
  className?: string;
  showTitle?: boolean;
  placeholder?: string;
}

const CompactSearchComponent = forwardRef<CompactSearchRef, CompactSearchComponentProps>(({ 
  className = '', 
  showTitle = false,
  placeholder = "Search for candidates..."
}, ref) => {  
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');  
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isBooleanDialogOpen, setIsBooleanDialogOpen] = useState(false);
  const [isJobDescriptionDialogOpen, setIsJobDescriptionDialogOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'database' | 'external' | 'combined'>('external');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useImperativeHandle(ref, () => ({
    clearSearch: () => {
      setSearchQuery('');
    }
  }));

  // Handle state from other pages
  useEffect(() => {
    if (location.state) {
      const { query, fromQuickSearch } = location.state;
      if (query) {
        setSearchQuery(query);
      }
      // Clear the state after using it
      if (fromQuickSearch) {
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state]);

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
        console.log('CompactSearch: Detected boolean search query');
        
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
        
        console.log('CompactSearch: Parsed boolean query filters:', filters);
        
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
        navigate('/dashboard/search-results', {
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
        let singleAICallSucceeded = false;
        try {
          // Single AI call - combines keyword extraction, filter conversion, and query generation
          if (searchMode === 'external' || searchMode === 'combined') {
            try {
              console.log("🚀 Using optimized single AI call for search");
              searchResults = await searchCandidatesDirectAI(searchQuery, {
                urgency: 'medium',
                flexibility: 'moderate', 
                primaryFocus: 'balanced',
                isLocationAgnostic: false, // Location is important when specified
                balanceMode: 'recall_optimized' // Prioritize finding results
              }, { page: 1, limit: 3 });
              console.log("✅ Got search results from single AI call:", searchResults);
              
              // Create mock filters and keywords for navigation compatibility (since we bypassed filter extraction)
              filters = {
                mustFilters: {},
                shouldFilters: {},
                searchText: searchQuery
              };
              
              // Create mock keywords to prevent navigation errors
              keywords = {
                criticalRequirements: [], // AI handled this internally
                preferredCriteria: [], // AI handled this internally
                contextualHints: {
                  urgency: 'medium',
                  flexibility: 'moderate',
                  primaryFocus: 'balanced'
                },
                isEnhanced: true,
                singleAICall: true // Flag to indicate this was optimized
              };
              
              singleAICallSucceeded = true;
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
          
          // Navigate to global search results only if single AI call succeeded
          if (singleAICallSucceeded) {
            console.log("🎯 Single AI call succeeded - navigating with optimized results");
            navigate('/dashboard/search-results', {
              state: {
                query: searchQuery,
                filters: filters,
                searchMode: searchMode,
                isGlobalSearch: true,
                isEnhanced: true,
                singleAIOptimized: true, // Flag for optimized search
                criticalRequirements: keywords.criticalRequirements,
                preferredCriteria: keywords.preferredCriteria,
                contextualHints: keywords.contextualHints,
                preloadedResults: searchResults
              }
            });
            return; // Exit early to prevent fallback execution
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
          navigate('/dashboard/search-results', {
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

  // Convert FilterState to SearchFilters format
  const convertFilterStateToSearchFilters = (filterState: FilterState): SearchFilters => {
    const searchFilters: SearchFilters = {};

    // Convert location
    if (filterState.location.currentLocations.length > 0) {
      searchFilters.location = {
        currentLocations: filterState.location.currentLocations
      };
    }

    // Convert job
    if (filterState.job.titles.length > 0 || filterState.job.skills.length > 0) {
      searchFilters.job = {};
      if (filterState.job.titles.length > 0) {
        searchFilters.job.titles = filterState.job.titles;
      }
      if (filterState.job.skills.length > 0) {
        searchFilters.job.skills = filterState.job.skills;
      }
    }

    // Convert company
    if (filterState.company.names.length > 0 || filterState.company.industries.length > 0) {
      searchFilters.company = {};
      if (filterState.company.names.length > 0) {
        searchFilters.company.names = filterState.company.names;
      }
      if (filterState.company.industries.length > 0) {
        searchFilters.company.industries = filterState.company.industries;
      }
    }

    // Convert skills/keywords
    if (filterState.skillsKeywords.items.length > 0) {
      searchFilters.skillsKeywords = {
        items: filterState.skillsKeywords.items
      };
    }

    // Convert education
    if (filterState.education.schools.length > 0) {
      searchFilters.education = {
        schools: filterState.education.schools
      };
    }

    // Convert general filters
    const generalFilters: any = {};
    if (filterState.general.minExperience && filterState.general.minExperience !== 'any') {
      generalFilters.minExperience = parseInt(filterState.general.minExperience);
    }
    if (filterState.general.maxExperience && filterState.general.maxExperience !== 'any') {
      generalFilters.maxExperience = parseInt(filterState.general.maxExperience);
    }
    if (Object.keys(generalFilters).length > 0) {
      searchFilters.general = generalFilters;
    }

    return searchFilters;
  };

  // Handle filter application from dialog
  const handleApplyFilters = async (filterState: FilterState) => {
    setIsSearching(true);
    setIsFilterDialogOpen(false);
    
    try {
      // Convert FilterState to SearchFilters format
      const filters = convertFilterStateToSearchFilters(filterState);
      console.log('CompactSearch: Converted filters:', filters);
      
      let searchResults;
      
      // Perform the actual search based on search mode
      if (searchMode === 'external' || searchMode === 'combined') {
        try {
          // Use external enhanced search with the applied filters
          searchResults = await searchCandidatesExternalEnhanced(filters, searchQuery || '', { page: 1, limit: 3 });
          console.log("CompactSearch: Got filtered search results:", searchResults);
          console.log("CompactSearch: Results count:", searchResults?.results?.length || 0);
        } catch (searchError) {
          console.warn("Filter search failed, will navigate without preloaded results:", searchError);
        }
      }
      
      // Navigate to global search results with preloaded data
      navigate('/dashboard/search-results', {
        state: {
          query: searchQuery,
          filters: filters,
          searchMode: searchMode,
          isGlobalSearch: true,
          isFilterSearch: true,
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

  // Handle boolean search from dialog
  const handleBooleanSearch = async (query: string, filters: SearchFilters) => {
    setIsSearching(true);
    setIsBooleanDialogOpen(false);
    
    try {
      let searchResults;
      
      // Perform the actual search based on search mode
      if (searchMode === 'external' || searchMode === 'combined') {
        try {
          // Use external enhanced search with the boolean query and filters
          searchResults = await searchCandidatesExternalEnhanced(filters, query, { page: 1, limit: 3 });
          console.log("Got boolean search results:", searchResults);
        } catch (searchError) {
          console.warn("Boolean search failed, will navigate without preloaded results:", searchError);
        }
      }
      
      // Navigate to global search results with preloaded data
      navigate('/dashboard/search-results', {
        state: {
          query: query,
          filters: filters,
          searchMode: searchMode,
          isGlobalSearch: true,
          isBooleanSearch: true,
          preloadedResults: searchResults
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

  // Handle job description search
  const handleJobDescriptionSearch = async (query: string, filters: SearchFilters) => {
    console.log('handleJobDescriptionSearch called with:', { query, filters });
    setIsSearching(true);
    setIsJobDescriptionDialogOpen(false);
    
    try {
      let searchResults;
      
      // Perform the actual search based on search mode
      if (searchMode === 'external' || searchMode === 'combined') {
        try {
          // Use external enhanced search with the job description query and filters
          searchResults = await searchCandidatesExternalEnhanced(filters, query, { page: 1, limit: 3 });
          console.log("Got job description search results:", searchResults);
        } catch (searchError) {
          console.warn("Job description search failed, will navigate without preloaded results:", searchError);
        }
      }
      
      // Navigate to global search results with preloaded data
      navigate('/dashboard/search-results', {
        state: {
          query: query,
          filters: filters,
          searchMode: searchMode,
          isGlobalSearch: true,
          isJobDescriptionSearch: true,
          preloadedResults: searchResults
        }
      });
    } catch (error) {
      console.error('Error with job description search:', error);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Failed to process job description search. Please try again.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        {/* Title */}
        {showTitle && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Global Talent Search</h2>
            <p className="text-sm text-gray-600">Search across all talent databases</p>
          </div>
        )}
        
        {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3 border border-gray-200 hover:border-purple-300 transition-colors">
              <SearchIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-gray-800 placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim() && !isSearching) {
                    handleAISearch();
                  }
                }}
              />
              {searchQuery.trim() && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors flex-shrink-0"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Main Search Button */}
          <button 
            onClick={handleAISearch}
            disabled={!searchQuery.trim() || isSearching}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </>
            ) : (
              <>
                <SearchIcon className="w-4 h-4" />
                Search Candidates
              </>
            )}
          </button>

          {/* Advanced Options Toggle */}
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
          >
            Advanced Options
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
          </button>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div className="pt-2 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition-colors text-sm"
                  onClick={() => setIsJobDescriptionDialogOpen(true)}
                  title="Search from Job Description"
                >
                  <FileText className="w-4 h-4" />
                  Job Description
                </button>

                <button
                  className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition-colors text-sm"
                  onClick={() => setIsBooleanDialogOpen(true)}
                  title="Boolean Search"
                >
                  <ToggleRight className="w-4 h-4" />
                  Boolean Search
                </button>
                
                <button
                  className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition-colors text-sm"
                  onClick={() => setIsFilterDialogOpen(true)}
                  title="Advanced Filters"
                >
                  <Filter className="w-4 h-4" />
                  Advanced Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        onApplyFilters={handleApplyFilters}
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

export default CompactSearchComponent;