import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Filter, FileText, ToggleRight } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { extractKeywords, convertKeywordsToFilters } from '../services/searchService';

interface QuickSearchProps {
  onSearchClick?: () => void;
  className?: string;
}

const QuickSearch: React.FC<QuickSearchProps> = ({ onSearchClick, className = '' }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      addToast({
        type: 'info',
        title: 'Search Query Required',
        message: 'Please enter a search query to continue.'
      });
      return;
    }

    setIsSearching(true);
    
    try {
      // Extract keywords using AI and convert to filters
      const keywords = await extractKeywords(searchQuery);
      const filters = await convertKeywordsToFilters(keywords);
      
      console.log("AI extracted filters for quick search:", filters);
      
      // Navigate directly to global search results
      navigate('/dashboard/search-results', {
        state: {
          query: searchQuery,
          filters: filters,
          searchMode: 'external', // Default to external search for quick search
          isGlobalSearch: true,
          fromQuickSearch: true
        }
      });
      
      if (onSearchClick) {
        onSearchClick();
      }
    } catch (error) {
      console.error('Error in quick search:', error);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Failed to process search. Please try again.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdvancedSearch = () => {
    navigate('/dashboard/search');
    if (onSearchClick) {
      onSearchClick();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Search className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quick Talent Search</h3>
          <p className="text-sm text-gray-600">Find candidates without creating a project</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3 border border-gray-200 hover:border-purple-300 transition-colors">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="e.g., Senior Software Engineers with React experience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-gray-800 placeholder-gray-400"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && searchQuery.trim() && !isSearching) {
                handleSearch();
              }
            }}
          />
          {searchQuery.trim() && (
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleAdvancedSearch}
          className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          <Filter className="w-4 h-4" />
          Advanced Search
        </button>
        
        <button
          onClick={handleAdvancedSearch}
          className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          <FileText className="w-4 h-4" />
          Job Description
        </button>
        
        <button
          onClick={handleAdvancedSearch}
          className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg transition-colors text-sm"
        >
          <ToggleRight className="w-4 h-4" />
          Boolean Search
        </button>
      </div>

      {/* Info Text */}
      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm text-purple-700">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Search instantly across external talent databases. Results will appear immediately, and you'll be prompted to create a project when shortlisting candidates.
        </p>
      </div>
    </div>
  );
};

export default QuickSearch;
