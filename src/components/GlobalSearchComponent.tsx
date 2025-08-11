import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  ToggleRight,
  Search as SearchIcon,
  Filter,
  Sparkles,
  X,
  AlertTriangle
} from 'lucide-react';
import FilterDialog from '../components/FilterDialog';
import BooleanSearchDialog from '../sourcing/search/components/BooleanSearchDialog';
import JobDescriptionDialog from '../recruitment/components/JobDescriptionDialog';
import AIEnhancementModal from '../components/AIEnhancementModal';
import { useAIQuery } from '../hooks/ai';
import { extractKeywords, convertKeywordsToFilters } from '../services/searchService';
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
  const [isAIEnhancementModalOpen, setIsAIEnhancementModalOpen] = useState(false);
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

  // AI hook for search enhancement
  const aiQuery = useAIQuery();

  // Expose clear functionality through ref
  useImperativeHandle(ref, () => ({
    clearSearch: () => {
      setSearchQuery('');
      aiQuery.reset();
    }
  }));

  // Function to enhance search with AI
  const enhanceSearchWithAI = async () => {
    if (!searchQuery.trim()) return;

    try {
      await aiQuery.query({
        prompt: `Enhance this job search query to be more specific and effective: "${searchQuery}"`,
        systemPrompt: "You are a recruitment specialist. Help enhance job search queries to be more effective and specific.",
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        max_tokens: 500
      });
    } catch (error) {
      console.error('Error enhancing search with AI:', error);
    }
  };

  // Effect to open modal when AI enhancement completes successfully
  useEffect(() => {
    if (aiQuery.data?.content && !aiQuery.loading && !aiQuery.error) {
      setIsAIEnhancementModalOpen(true);
    }
  }, [aiQuery.data, aiQuery.loading, aiQuery.error]);

  // Main function for AI keyword extraction and direct search
  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Extract keywords using AI
      const keywords = await extractKeywords(searchQuery);
      
      // Convert to filters
      const filters = await convertKeywordsToFilters(keywords);
      
      console.log("AI extracted filters:", filters);
      
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
      console.error('Error in AI search:', error);
      setIsSearching(false);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Failed to process search. Please try again.'
      });
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

  // Handle filter application from dialog
  const handleApplyFilters = async (filters: SearchFilters) => {
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
      console.error('Error applying filters:', error);
      setIsSearching(false);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Failed to apply filters. Please try again.'
      });
    }
  };

  // Handle boolean search from dialog
  const handleBooleanSearch = async (query: string, filters: SearchFilters) => {
    setIsSearching(true);
    try {
      // Navigate to global search results
      navigate('/dashboard/search-results', {
        state: {
          query: query,
          filters: filters,
          searchMode: searchMode,
          isGlobalSearch: true
        }
      });
    } catch (error) {
      console.error('Error with boolean search:', error);
      setIsSearching(false);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Failed to process boolean search. Please try again.'
      });
    }
  };

  // Handle job description search
  const handleJobDescriptionSearch = async (query: string, filters: SearchFilters) => {
    console.log('handleJobDescriptionSearch called with:', { query, filters });
    setIsSearching(true);
    try {
      // Navigate to global search results
      navigate('/dashboard/search-results', {
        state: {
          query: query,
          filters: filters,
          searchMode: searchMode,
          isGlobalSearch: true
        }
      });
    } catch (error) {
      console.error('Error with job description search:', error);
      setIsSearching(false);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Failed to process job description search. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-center items-start pt-20 min-h-screen">
        {/* Centered Search Section */}
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          {/* AI Error Display */}
          {aiQuery.error && (
            <div className="w-full mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">Error enhancing search: {aiQuery.error}</p>
              <button 
                onClick={aiQuery.reset}
                className="mt-1 text-xs text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div></div> {/* Spacer */}
              <h1 className="text-2xl font-bold text-gray-900">Global Talent Search</h1>
              <button
                onClick={() => {
                  setSearchQuery('');
                  aiQuery.reset();
                }}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Clear search and start fresh"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </button>
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
                <p className="text-sm text-amber-700">
                  You can search and view candidate profiles globally. When you find candidates to shortlist, 
                  you'll be prompted to create or select a project to organize your prospects.
                </p>
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
                      aiQuery.reset();
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {searchQuery.trim() && !aiQuery.loading && (
                  <button 
                    onClick={enhanceSearchWithAI}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-md transition-colors"
                    title="Enhance with AI"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
                {aiQuery.loading && (
                  <div className="p-2">
                    <div className="w-4 h-4 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
                  </div>
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

      {/* AI Enhancement Modal */}
      <AIEnhancementModal
        isOpen={isAIEnhancementModalOpen}
        onClose={() => {
          setIsAIEnhancementModalOpen(false);
          aiQuery.reset(); // Reset AI query state when modal is closed/cancelled
        }}
        content={aiQuery.data?.content || ''}
        onUseEnhancedQuery={(enhancedQuery) => {
          setSearchQuery(enhancedQuery);
          setIsAIEnhancementModalOpen(false);
          aiQuery.reset(); // Reset AI query state after using enhanced query
        }}
      />
    </div>
  );
});

export default GlobalSearchComponent;
