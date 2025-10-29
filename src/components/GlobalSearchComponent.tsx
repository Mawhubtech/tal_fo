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
import Threads from './animations/Threads';

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
    <div className="min-h-screen bg-gray-50 relative">
      {/* Prism Background */}
      {/* <div className="absolute inset-0 z-0">
        <Prism
          height={3.5}
          baseWidth={6}
          animationType="3drotate"
          glow={1.2}
          offset={{ x: 0, y: 0 }}
          noise={0}
          transparent={true}
          scale={3}
          hueShift={.1}
          colorFrequency={1.5}
          hoverStrength={0.3}
          inertia={0.7}
          bloom={0.2}
          suspendWhenOffscreen={false}
          timeScale={1.2}
        />
      </div> */}
      {/* Threads Background */}
      <div className="absolute opacity-50 w-full inset-0 z-10">
        <Threads 
            amplitude={1.5}
            distance={0.15}
            enableMouseInteraction={true}
        />
      </div>
      
      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `
      }} />
      
      <div className="relative z-10 flex justify-center items-center min-h-[90vh] px-3 sm:px-4 md:px-6">
        {/* Centered Search Section */}
        <div className="w-full max-w-5xl !py-[5rem] bg-white/30 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 md:p-8 relative overflow-hidden">
          {/* Inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-2xl"></div>
          {/* Logo and title */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8 relative">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex-1"></div> {/* Spacer */}
              <div className="flex-1 flex items-center justify-center">
                <h1 className="text-lg w-[200px] sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent text-center">
                  AI Talent Search
                </h1>
                {/* AI Icon */}
                <div className="ml-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-spin" style={{animationDuration: '3s'}}>
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              {<div className="flex-1"></div>} {/* Spacer when no clear button */}
            </div>
            <p className="text-gray-600 text-xs sm:text-sm px-2 sm:px-0 font-medium">
              Powered by AI • Search across all talent databases and discover top talent
            </p>
          </div>
          
          {/* Who are you looking for section */}
          <div className="w-full mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <SearchIcon className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm sm:text-base md:text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Who are you looking for?
              </h2>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
              <div className="relative bg-gradient-to-r from-white to-gray-50/80 p-2.5 sm:p-4 md:p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 border border-purple-200/50 hover:border-purple-300/70 focus-within:border-purple-400/80 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <input
                    type="text"
                    placeholder="e.g. Software Engineers with 5+ years experience..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none flex-1 text-sm sm:text-base md:text-lg text-gray-800 placeholder-gray-500 min-w-0 py-0.5 sm:py-1 font-medium"
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
                      className="text-gray-400 hover:text-red-500 active:text-red-600 p-1 rounded-md transition-colors flex-shrink-0 sm:hidden hover:bg-red-50"
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
                  className="bg-purple-500 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 active:from-purple-800 active:via-pink-800 active:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-3 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-2.5 rounded-lg text-sm sm:text-base md:text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 flex-shrink-0 w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
                  title="Search candidates with AI"
                >
                  <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>AI Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Loading Status Display */}
          <div className="w-full mb-2 sm:mb-3">
            {isSearching ? (
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  {/* AI Brain Loading Animation */}
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute inset-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                    {searchLoadingMessage || 'AI is thinking...'}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full animate-pulse" style={{
                    width: '100%',
                    animation: 'progress 2.5s ease-in-out infinite'
                  }}></div>
                </div>
                {/* AI Processing Dots */}
                <div className="flex justify-center gap-1 mt-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Action buttons */}
          <div className="w-full">
            <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 sm:mb-4 px-2 font-medium">
              Or use advanced AI-powered search options:
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-5">
              <button
                className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-white to-gray-50 hover:from-purple-50 hover:to-pink-50 active:from-purple-100 active:to-pink-100 text-purple-700 hover:text-purple-800 border border-purple-200 hover:border-purple-300 px-4 sm:px-5 py-3 rounded-xl transition-all duration-300 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                onClick={() => setIsJobDescriptionDialogOpen(true)}
                title="AI-powered Job Description Search"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:animate-pulse">
                  <FileText className="w-3 h-3 text-white" />
                </div>
                <span className="truncate relative">Job Description</span>
              </button>

              <button
                className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 active:from-blue-100 active:to-indigo-100 text-blue-700 hover:text-blue-800 border border-blue-200 hover:border-blue-300 px-4 sm:px-5 py-3 rounded-xl transition-all duration-300 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                onClick={() => setIsBooleanDialogOpen(true)}
                title="Advanced Boolean Search with AI"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center group-hover:animate-pulse">
                  <ToggleRight className="w-3 h-3 text-white" />
                </div>
                <span className="truncate relative">Boolean Search</span>
              </button>
              
              <button
                className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-white to-gray-50 hover:from-emerald-50 hover:to-teal-50 active:from-emerald-100 active:to-teal-100 text-emerald-700 hover:text-emerald-800 border border-emerald-200 hover:border-emerald-300 px-4 sm:px-5 py-3 rounded-xl transition-all duration-300 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                onClick={toggleAdvancedFilters}
                title="AI-Enhanced Advanced Filters"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center group-hover:animate-pulse">
                  <Filter className="w-3 h-3 text-white" />
                </div>
                <span className="truncate relative">Advanced Filters</span>
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
