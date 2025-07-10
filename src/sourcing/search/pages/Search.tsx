import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  ToggleRight,
  Search as SearchIcon,
  Filter,
  Sparkles,
  Edit,
  X
} from 'lucide-react';
import Button from '../../../components/Button';
import FilterDialog from '../../../components/FilterDialog';
import BooleanSearchDialog from '../components/BooleanSearchDialog';
import JobDescriptionDialog from '../../../recruitment/components/JobDescriptionDialog';
import { useAIQuery } from '../../../hooks/ai';
import { extractKeywords, convertKeywordsToFilters } from '../../../services/searchService';
import type { SearchFilters } from '../../../services/searchService';

// Component for displaying detailed AI filters with full keywords
const DetailedFiltersDisplay: React.FC<{
  filters: SearchFilters;
  onEditFilters: () => void;
  onClearFilters: () => void;
  onSearch: () => void;
  isSearching: boolean;
}> = ({ filters, onEditFilters, onClearFilters, onSearch, isSearching }) => {
  const hasFilters = Object.keys(filters).length > 0;
  
  if (!hasFilters) return null;

  return (
    <div className="w-full p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-700" />
          <h3 className="text-lg font-medium text-blue-700">AI Extracted Keywords & Filters</h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onEditFilters}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-md transition-colors flex items-center gap-2"
            title="Edit filters"
          >
            <Edit className="w-4 h-4" />
            Edit Filters
          </button>
          <button 
            onClick={onClearFilters}
            className="text-blue-500 hover:text-blue-700 px-3 py-2 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        {/* Job Titles */}
        {filters.job?.titles && filters.job.titles.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Job Titles</h4>
            <div className="flex flex-wrap gap-2">
              {filters.job.titles.map((title, index) => (
                <span 
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-md"
                >
                  {title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {filters.job?.skills && filters.job.skills.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {filters.job.skills.map((skill, index) => (
                <span 
                  key={index}
                  className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Locations */}
        {filters.location?.currentLocations && filters.location.currentLocations.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Locations</h4>
            <div className="flex flex-wrap gap-2">
              {filters.location.currentLocations.map((location, index) => (
                <span 
                  key={index}
                  className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded-md"
                >
                  {location}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Companies */}
        {filters.company?.names && filters.company.names.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Companies</h4>
            <div className="flex flex-wrap gap-2">
              {filters.company.names.map((company, index) => (
                <span 
                  key={index}
                  className="bg-orange-100 text-orange-800 px-2 py-1 text-xs rounded-md"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {(filters.general?.minExperience || filters.general?.maxExperience) && (
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Experience</h4>
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded-md">
                {filters.general.minExperience || '0'} - {filters.general.maxExperience || '∞'} years
              </span>
            </div>
          </div>
        )}

        {/* Keywords */}
        {filters.skillsKeywords?.items && filters.skillsKeywords.items.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-blue-200 xl:col-span-2">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {filters.skillsKeywords.items.map((keyword, index) => (
                <span 
                  key={index}
                  className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-md"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Requirements */}
        {filters.skillsKeywords?.requirements && filters.skillsKeywords.requirements.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-blue-200 xl:col-span-2">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Requirements</h4>
            <div className="flex flex-wrap gap-2">
              {filters.skillsKeywords.requirements.map((requirement, index) => (
                <span 
                  key={index}
                  className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-md"
                >
                  {requirement}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onSearch}
          disabled={isSearching}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-md text-sm flex items-center gap-2 font-medium"
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <SearchIcon className="w-4 h-4" />
              Search with these keywords
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const Search: React.FC = () => {  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');  
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isBooleanDialogOpen, setIsBooleanDialogOpen] = useState(false);
  const [isJobDescriptionDialogOpen, setIsJobDescriptionDialogOpen] = useState(false);
  const [showAIEnhancement, setShowAIEnhancement] = useState(false);
  // Search filters state
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});
  const [isSearching, setIsSearching] = useState(false);
  const [showAIFilters, setShowAIFilters] = useState(false);

  // Handle state from SearchResults page
  useEffect(() => {
    if (location.state) {
      const { editFilters, query } = location.state;
      if (editFilters) {
        setCurrentFilters(editFilters);
        setShowAIFilters(true);
      }
      if (query) {
        setSearchQuery(query);
      }
    }
  }, [location.state]);

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
  };  // Main function for AI keyword extraction (without automatic search)
  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Extract keywords using AI
      const keywords = await extractKeywords(searchQuery);
      
      // Convert to filters
      const filters = convertKeywordsToFilters(keywords);
      
      console.log("AI extracted filters:", filters);
      // Set filters and show them before searching
      setCurrentFilters(filters);
      
      // Check if we have any non-empty filters to display
      const hasFilters = Object.keys(filters).length > 0;
      console.log("Has filters to display:", hasFilters);
      setShowAIFilters(hasFilters); 
      
      // Don't automatically run search - just show the filters
    } catch (error) {
      console.error('Error in AI search:', error);
    } finally {
      setIsSearching(false);
    }
  };
  // Execute search with current filters - now navigates to results page
  const runSearch = (filters: SearchFilters) => {
    setIsSearching(true);
    try {
      // Navigate to search results page with state
      navigate('/dashboard/search-results', {
        state: {
          query: searchQuery,
          filters: filters
        }
      });
    } catch (error) {
      console.error('Error with search navigation:', error);
      setIsSearching(false);
    }
  };  // Handle filter application from dialog
  const handleApplyFilters = (filters: SearchFilters) => {
    setCurrentFilters(filters);
    setShowAIFilters(true);
    // Don't automatically search - let user review filters first
  };
  // Clear filters
  const handleClearFilters = () => {
    setCurrentFilters({});
    setShowAIFilters(false);
  };

  // Effect to handle state from SearchResults page
  useEffect(() => {
    // Check if we have state from navigation
    const state = location.state as { query?: string; filters?: SearchFilters };
    if (state?.query) {
      setSearchQuery(state.query);
    }
    if (state?.filters) {
      setCurrentFilters(state.filters);
      setShowAIFilters(Object.keys(state.filters).length > 0);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* PART 1: Search Section - Left Column */}
        <div className="lg:w-1/3 xl:w-2/5 bg-white border-r border-gray-200 flex flex-col">
          <div className="flex flex-col items-center justify-center w-full px-6 py-8 flex-1">
            {/* Logo and title */}
            <div className="text-center mb-8">
              <p className="text-gray-500 text-sm mt-1">
                Find exactly who you're looking for, in seconds.
                <a href="#" className="ml-1 text-purple-700 hover:text-purple-800 hover:underline transition-colors">
                  See how it works.
                </a>
              </p>
            </div>
            
            {/* Who are you looking for section */}
            <div className="w-full max-w-md mb-6">
              <div className="flex items-center gap-2 mb-2">
                <SearchIcon className="w-4 h-4 text-gray-500" />
                <h2 className="text-base font-medium text-gray-700">Who are you looking for?</h2>
              </div>
              
              <div className="relative">
                <div className="bg-white p-3 rounded-lg flex items-center gap-2 border border-gray-200 shadow-sm hover:shadow transition-shadow">
                  <SearchIcon className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Software Engineers with 5+ yrs of experience at fintech companies..."
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
                    </div>
                  )}
                  <button 
                    onClick={handleAISearch}
                    disabled={!searchQuery.trim() || isSearching}
                    className="bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400 text-white p-1.5 rounded-md transition-colors"
                    title="Extract keywords from search query"
                  >
                    {isSearching ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <SearchIcon className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Enhancement Display */}
            {showAIEnhancement && aiQuery.data && (
              <div className="w-full max-w-md mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
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
              <div className="w-full max-w-md mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">Error enhancing search: {aiQuery.error}</p>
                <button 
                  onClick={aiQuery.reset}
                  className="mt-1 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Action buttons */}
            <div className="w-full max-w-md space-y-3 mt-6">
              <Button
                variant="primary"
                className="w-full gap-2 text-sm bg-purple-700 hover:bg-purple-800 text-white px-4 py-3 rounded-md"
                onClick={() => setIsJobDescriptionDialogOpen(true)}
              >
                <FileText className="w-4 h-4 text-white" />
                Search by Job Description
              </Button>

              <Button
                variant="primary"
                className="w-full gap-2 text-sm bg-purple-700 hover:bg-purple-800 text-white px-4 py-3 rounded-md"
                onClick={() => setIsBooleanDialogOpen(true)}
              >
                <ToggleRight className="w-4 h-4 text-white" />
                Boolean Search
              </Button>
              
              <Button
                variant="primary"
                className="w-full gap-2 text-sm bg-purple-700 hover:bg-purple-800 text-white px-4 py-3 rounded-md"
                onClick={() => setIsFilterDialogOpen(true)}
              >
                <Filter className="w-4 h-4 text-white" />
                Manual Filter Selection
              </Button>
            </div>
          </div>
        </div>

        {/* PART 2: Keywords Display Section - Right Column */}
        <div className="lg:w-2/3 xl:w-3/5 bg-gray-50 flex flex-col">
          {showAIFilters && Object.keys(currentFilters).length > 0 ? (
            <div className="p-6 flex-1 overflow-y-auto">
              <DetailedFiltersDisplay 
                filters={currentFilters}
                onEditFilters={() => setIsFilterDialogOpen(true)}
                onClearFilters={handleClearFilters}
                onSearch={() => runSearch(currentFilters)}
                isSearching={isSearching}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Keywords Yet</h3>
                <p className="text-gray-500 text-sm">
                  Enter a search query in the left panel and click the search button to extract AI-powered keywords and filters.
                </p>
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
        initialFilters={currentFilters}
      />
      
      {/* Boolean Search Dialog */}
      <BooleanSearchDialog
        isOpen={isBooleanDialogOpen}
        onClose={() => setIsBooleanDialogOpen(false)}
      />

      {/* Job Description Dialog */}
      <JobDescriptionDialog
        isOpen={isJobDescriptionDialogOpen}
        onClose={() => setIsJobDescriptionDialogOpen(false)}
      />
    </div>
  );
};

export default Search;
