import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ToggleRight,
  Search as SearchIcon,
  Filter,
  Sparkles,
  User
} from 'lucide-react';
import Button from '../components/Button';
import FilterDialog from '../components/FilterDialog';
import BooleanSearchDialog from '../components/BooleanSearchDialog';
import JobDescriptionDialog from '../components/JobDescriptionDialog';
import SearchResults from '../components/SearchResults';
import { useAIQuery } from '../hooks/ai';
import { extractKeywords, convertKeywordsToFilters, searchUsers } from '../services/searchService';
import type { SearchFilters } from '../services/searchService';

const Search: React.FC = () => {  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');  
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isBooleanDialogOpen, setIsBooleanDialogOpen] = useState(false);
  const [isJobDescriptionDialogOpen, setIsJobDescriptionDialogOpen] = useState(false);
  const [showAIEnhancement, setShowAIEnhancement] = useState(false);
  
  // Search results and filters state
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // AI hook for search enhancement
  const aiQuery = useAIQuery();
  // Function to enhance search with AI
  const enhanceSearchWithAI = async () => {
    if (!searchQuery.trim()) return;

    await aiQuery.query({
      prompt: `Enhance this job search query to be more specific and effective: "${searchQuery}"`,
      systemPrompt: "You are a recruitment specialist. Help enhance job search queries to be more effective and specific.",
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
    });
    setShowAIEnhancement(true);
  };

  // Main search function with AI keyword extraction
  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Extract keywords using AI
      const keywords = await extractKeywords(searchQuery);
      
      // Convert to filters
      const filters = convertKeywordsToFilters(keywords);
      setCurrentFilters(filters);
      
      // Open filter dialog for user to review/edit
      setIsFilterDialogOpen(true);
    } catch (error) {
      console.error('Error in AI search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Execute search with current filters
  const runSearch = async (filters: SearchFilters) => {
    setIsSearching(true);
    try {
      const results = await searchUsers(filters, searchQuery);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle filter application from dialog
  const handleApplyFilters = (filters: SearchFilters) => {
    setCurrentFilters(filters);
    runSearch(filters);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-6">
      {/* Logo and title */}
      <div className="text-center mb-8">
        <img src="/TALL.png" alt="PeopleGPT" className="h-12 mx-auto mb-2" />
         <p className="text-gray-500 text-sm mt-1">
          Find exactly who you're looking for, in seconds.
          <a href="#" className="ml-1 text-purple-700 hover:text-purple-800 hover:underline transition-colors">
            See how it works.
          </a>
        </p>
      </div>
      
      {/* Who are you looking for section */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex items-center gap-2 mb-2">
          <SearchIcon className="w-4 h-4 text-gray-500" />
          <h2 className="text-base font-medium text-gray-700">Who are you looking for?</h2>
        </div>
        
        <div className="relative">
          <div className="bg-white p-3 rounded-lg flex items-center gap-2 border border-gray-200 shadow-sm hover:shadow transition-shadow">
            <SearchIcon className="w-4 h-4 text-gray-400" />            <input
              type="text"
              placeholder="Software Engineers with 5+ yrs of experience at fintech companies in the Bay Area"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-gray-800 placeholder-gray-400 text-sm"
            />
            {searchQuery.trim() && !aiQuery.loading && (
              <button 
                onClick={enhanceSearchWithAI}
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-1.5 rounded-md transition-colors mr-1"
                title="Enhance with AI"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
            {aiQuery.loading && (
              <div className="mr-1 p-1.5">
                <div className="w-3.5 h-3.5 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
              </div>            )}
            <button 
              onClick={handleAISearch}
              disabled={!searchQuery.trim() || isSearching}
              className="bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400 text-white p-1.5 rounded-md transition-colors"
              title="Extract keywords and search"
            >
              {isSearching ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                '→'
              )}
            </button>
          </div>
        </div>
          {/* Search filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="flex items-center bg-purple-50 rounded-full px-3 py-0.5 border border-purple-100 shadow-sm">
            <input type="checkbox" checked className="mr-1.5 h-3 w-3 accent-purple-700" readOnly />
            <span className="text-xs text-purple-700">Location</span>
          </div>
          <div className="flex items-center bg-purple-50 rounded-full px-3 py-0.5 border border-purple-100 shadow-sm">
            <input type="checkbox" checked className="mr-1.5 h-3 w-3 accent-purple-700" readOnly />
            <span className="text-xs text-purple-700">Job Title</span>
          </div>
          <div className="flex items-center bg-purple-50 rounded-full px-3 py-0.5 border border-purple-100 shadow-sm">
            <input type="checkbox" checked className="mr-1.5 h-3 w-3 accent-purple-700" readOnly />
            <span className="text-xs text-purple-700">Years of Experience</span>
          </div>
          <div className="flex items-center bg-purple-50 rounded-full px-3 py-0.5 border border-purple-100 shadow-sm">
            <input type="checkbox" checked className="mr-1.5 h-3 w-3 accent-purple-700" readOnly />
            <span className="text-xs text-purple-700">Industry</span>
          </div>
          <div className="flex items-center bg-purple-50 rounded-full px-3 py-0.5 border border-purple-100 shadow-sm">
            <input type="checkbox" checked className="mr-1.5 h-3 w-3 accent-purple-700" readOnly />
            <span className="text-xs text-purple-700">Skills</span>
          </div>        </div>
      </div>

      {/* AI Enhancement Display */}
      {showAIEnhancement && aiQuery.data && (
        <div className="w-full max-w-lg mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <h3 className="text-sm font-medium text-purple-700">AI Enhanced Search</h3>
            <button 
              onClick={() => setShowAIEnhancement(false)}
              className="ml-auto text-purple-500 hover:text-purple-700"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-purple-800 leading-relaxed">{aiQuery.data.content}</p>
          <button 
            onClick={() => setSearchQuery(aiQuery.data?.content || '')}
            className="mt-2 text-xs text-purple-700 hover:text-purple-800 underline"
          >
            Use this enhanced search
          </button>
        </div>
      )}

      {/* AI Error Display */}
      {aiQuery.error && (
        <div className="w-full max-w-lg mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">Error enhancing search: {aiQuery.error}</p>
          <button 
            onClick={aiQuery.reset}
            className="mt-1 text-xs text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}      {/* Action buttons */}
      <div className="flex gap-3 mt-6 flex-wrap justify-center">
        {Object.keys(currentFilters).length > 0 && (
          <Button
            variant="primary"
            className="gap-2 text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
            onClick={() => runSearch(currentFilters)}
            disabled={isSearching}
          >
            {isSearching ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <SearchIcon className="w-3.5 h-3.5 text-white" />
                Run Search
              </>
            )}
          </Button>
        )}
        
        <Button
          variant="primary"
          className="gap-2 text-xs bg-purple-700 hover:bg-purple-800 text-white px-3 py-1 rounded-md"
          onClick={() => setIsJobDescriptionDialogOpen(true)}
        >
          <FileText className="w-3.5 h-3.5 text-white" />
          Job Description
        </Button><Button
          variant="primary"
          className="gap-2 text-xs bg-purple-700 hover:bg-purple-800 text-white px-3 py-1 rounded-md"
          onClick={() => navigate('/dashboard/resume-processing')}
        >
          <User className="w-3.5 h-3.5 text-white" />
          Resume
        </Button>
        <Button
          variant="primary"
          className="gap-2 text-xs bg-purple-700 hover:bg-purple-800 text-white px-3 py-1 rounded-md"
          onClick={() => setIsBooleanDialogOpen(true)}
        >
          <ToggleRight className="w-3.5 h-3.5 text-white" />
          Boolean
        </Button>
        <Button
          variant="primary"
          className="gap-2 text-xs bg-purple-700 hover:bg-purple-800 text-white px-3 py-1 rounded-md"
          onClick={() => setIsFilterDialogOpen(true)}
        >
          <Filter className="w-3.5 h-3.5 text-white" />
          Select Manually
        </Button>
       
      </div>      {/* Filter Dialog */}
      <FilterDialog 
        isOpen={isFilterDialogOpen} 
        onClose={() => setIsFilterDialogOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
      
      {/* Boolean Search Dialog */}
      <BooleanSearchDialog
        isOpen={isBooleanDialogOpen}
        onClose={() => setIsBooleanDialogOpen(false)}
      />      {/* Job Description Dialog */}
      <JobDescriptionDialog
        isOpen={isJobDescriptionDialogOpen}
        onClose={() => setIsJobDescriptionDialogOpen(false)}
      />      {/* Search Results */}
      {showResults && (
        <div className="mt-8 w-full max-w-6xl mx-auto">
          <SearchResults 
            results={searchResults}
            isLoading={isSearching}
            searchQuery={searchQuery}
            appliedFilters={currentFilters}
            onViewProfile={(userId: string) => {
              console.log('View profile:', userId);
              // TODO: Implement profile view
            }}
            onContactCandidate={(userId: string) => {
              console.log('Contact candidate:', userId);
              // TODO: Implement contact functionality
            }}
          />
        </div>
      )}

    </div>
  );
};

export default Search;
