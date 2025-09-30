import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  ToggleRight,
  Search as SearchIcon,
  Filter,
  X,
  AlertTriangle,
  Plus
} from 'lucide-react';
import FilterDialog, { FilterState } from '../components/FilterDialog';
import BooleanSearchDialog from '../sourcing/search/components/BooleanSearchDialog';
import JobDescriptionDialog from '../recruitment/components/JobDescriptionDialog';
import { extractEnhancedKeywords, convertEnhancedKeywordsToFilters, extractKeywords, convertKeywordsToFilters, searchCandidatesExternalDirect, searchCandidatesExternalEnhanced, searchCandidatesDirectAI } from '../services/searchService';
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
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isBooleanDialogOpen, setIsBooleanDialogOpen] = useState(false);
  const [isJobDescriptionDialogOpen, setIsJobDescriptionDialogOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'database' | 'external' | 'combined'>('external'); // Default to external search

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

  // Function to enhance search with AI
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
              }, { page: 1, limit: 3 });
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
            navigate('/dashboard/search-results', {
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
            navigate('/dashboard/search-results', {
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

  // Execute search with current filters
  const runSearch = async (filters: SearchFilters) => {
    setIsSearching(true);
    try {
      // Navigate to global search results
      navigate('/dashboard/search-results', {
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
      console.log('GlobalSearchComponent: Converted filters:', filters);
      
      let searchResults;
      
      // Perform the actual search based on search mode
      if (searchMode === 'external' || searchMode === 'combined') {
        try {
          // Use external enhanced search with the applied filters
          searchResults = await searchCandidatesExternalEnhanced(filters, searchQuery || '', { page: 1, limit: 3 });
          console.log("GlobalSearchComponent: Got filtered search results:", searchResults);
          console.log("GlobalSearchComponent: Results count:", searchResults?.results?.length || 0);
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
          console.log("Got boolean search results from enhanced search:", searchResults);
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
          console.log("Got job description search results from enhanced search:", searchResults);
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-center items-start pt-20 min-h-screen">
        {/* Centered Search Section */}
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div></div> {/* Spacer */}
              <h1 className="text-2xl font-bold text-gray-900">Global Talent Search</h1>
              {searchQuery.trim() && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Clear search and start fresh"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </button>
              )}
              {!searchQuery.trim() && <div></div>} {/* Spacer when no clear button */}
            </div>
            <p className="text-gray-500 text-sm">
              Search across all talent databases without creating a project.
            </p>
          </div>

          {/* Project Notice */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-amber-800 mb-1">Project Required for Shortlisting</h4>
                <p className="text-sm text-amber-700 mb-3">
                  You can search and view candidate profiles globally. When you find candidates to shortlist, 
                  you'll be prompted to create or select a project to organize your prospects.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/dashboard/sourcing/projects/create')}
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Project Now
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/sourcing/projects')}
                    className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-purple-700 border border-purple-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View My Projects
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Who are you looking for section */}
          <div className="w-full mb-6">
            <div className="flex items-center gap-2 mb-4">
              <SearchIcon className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-medium text-gray-700">Who are you looking for?</h2>
            </div>
            
            <div className="relative">
              <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 border border-gray-200 hover:border-purple-300 transition-colors">
                <SearchIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Software Engineers with 5+ yrs of experience at fintech companies..."
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
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="w-full mb-6">
            <button 
              onClick={handleAISearch}
              disabled={!searchQuery.trim() || isSearching}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-center gap-3"
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </>
              ) : (
                <>
                  <SearchIcon className="w-5 h-5" />
                  Search Candidates
                </>
              )}
            </button>
          </div>

          {/* Action buttons */}
          <div className="w-full">
            <p className="text-sm text-gray-600 text-center mb-4">Or use advanced search options:</p>
            <div className="flex justify-center space-x-4">
              <button
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-purple-700 border border-purple-300 px-4 py-2 rounded-lg transition-colors"
                onClick={() => setIsJobDescriptionDialogOpen(true)}
                title="Search from Job Description"
              >
                <FileText className="w-4 h-4" />
                Job Description
              </button>

              <button
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-purple-700 border border-purple-300 px-4 py-2 rounded-lg transition-colors"
                onClick={() => setIsBooleanDialogOpen(true)}
                title="Boolean Search"
              >
                <ToggleRight className="w-4 h-4" />
                Boolean Search
              </button>
              
              <button
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-purple-700 border border-purple-300 px-4 py-2 rounded-lg transition-colors"
                onClick={() => setIsFilterDialogOpen(true)}
                title="Advanced Filters"
              >
                <Filter className="w-4 h-4" />
                Advanced Filters
              </button>
            </div>
          </div>
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

export default GlobalSearchComponent;
