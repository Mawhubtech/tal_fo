import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Filter, FileText, ToggleRight } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { extractEnhancedKeywords, convertEnhancedKeywordsToFilters, extractKeywords, convertKeywordsToFilters, searchCandidatesExternalDirect } from '../services/searchService';
import BooleanSearchParser from '../services/booleanSearchParser';

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
    console.log('QuickSearch: Starting search with query:', searchQuery);
    
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
      // Check if this is a boolean search query
      const isBooleanQuery = searchQuery.includes('+Keywords:') || 
                           searchQuery.includes('+Job title:') || 
                           searchQuery.includes('+Location:');
      
      let keywords, filters, searchResults;
      
      if (isBooleanQuery) {
        console.log('QuickSearch: Detected boolean search query');
        
        // Validate boolean query
        const validation = BooleanSearchParser.validateQuery(searchQuery);
        if (!validation.isValid) {
          addToast({
            type: 'error',
            title: 'Invalid Boolean Query',
            message: validation.errors.join(', ')
          });
          return;
        }
        
        // Parse boolean query
        const parsedQuery = BooleanSearchParser.parseQuery(searchQuery);
        filters = BooleanSearchParser.convertToSearchFilters(parsedQuery);
        
        console.log('QuickSearch: Parsed boolean query filters:', filters);
        
        // Use the direct external search with boolean filters
        try {
          searchResults = await searchCandidatesExternalDirect(filters, searchQuery, { page: 1, limit: 10 });
          console.log('QuickSearch: Got boolean search results:', searchResults);
        } catch (searchError) {
          console.warn('QuickSearch: Boolean search failed:', searchError);
        }
        
        // Navigate with boolean search results
        navigate('/dashboard/search-results', {
          state: {
            query: searchQuery,
            filters: filters,
            searchMode: 'external',
            isGlobalSearch: true,
            fromQuickSearch: true,
            isBooleanSearch: true,
            preloadedResults: searchResults
          }
        });
      } else {
        // Handle regular search queries
        try {
          // Extract enhanced keywords with priority classification
          keywords = await extractEnhancedKeywords(searchQuery);
          
          // Convert enhanced keywords to filters with must/should logic
          filters = await convertEnhancedKeywordsToFilters(keywords);
          
          console.log("QuickSearch: Using enhanced keyword extraction with filters:", filters);
          
          // Now use the direct external search to get rich candidate data
          searchResults = await searchCandidatesExternalDirect(filters, searchQuery, { page: 1, limit: 10 });
          
          console.log("QuickSearch: Got rich search results:", searchResults);
          
          // Navigate to global search results with the actual search results
          navigate('/dashboard/search-results', {
            state: {
              query: searchQuery,
              filters: filters,
              searchMode: 'external',
              isGlobalSearch: true,
              fromQuickSearch: true,
              isEnhanced: true,
              criticalRequirements: keywords.criticalRequirements,
              preferredCriteria: keywords.preferredCriteria,
              contextualHints: keywords.contextualHints,
              preloadedResults: searchResults // Pass the actual results
            }
          });
        } catch (enhancedError) {
          console.warn('QuickSearch: Enhanced search failed, using fallback:', enhancedError);
          
          // Fallback to regular keyword extraction
          keywords = await extractKeywords(searchQuery);
          filters = await convertKeywordsToFilters(keywords);
          
          console.log("QuickSearch: Using fallback search with filters:", filters);
          
          try {
            // Try to get search results with fallback filters
            searchResults = await searchCandidatesExternalDirect(filters, searchQuery, { page: 1, limit: 10 });
            
            // Navigate to global search results with fallback results
            navigate('/dashboard/search-results', {
              state: {
                query: searchQuery,
                filters: filters,
                searchMode: 'external',
                isGlobalSearch: true,
                fromQuickSearch: true,
                preloadedResults: searchResults
              }
            });
          } catch (fallbackError) {
            console.error('QuickSearch: Fallback search also failed:', fallbackError);
            
            // Final fallback - navigate without preloaded results
            navigate('/dashboard/search-results', {
              state: {
                query: searchQuery,
                filters: filters,
                searchMode: 'external',
                isGlobalSearch: true,
                fromQuickSearch: true
              }
            });
          }
        }
      }
      
      if (onSearchClick) {
        onSearchClick();
      }
    } catch (error) {
      console.error('QuickSearch: Search failed:', error);
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
          Search instantly with AI-enhanced filters across external talent databases. Results will appear immediately, and you'll be prompted to create a project when shortlisting candidates.
        </p>
      </div>
    </div>
  );
};

export default QuickSearch;
