import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SearchResults from '../components/SearchResults';
import Button from '../components/Button';
import { searchUsers } from '../services/searchService';
import type { SearchFilters } from '../services/searchService';

const SearchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  
  // State from the URL search params
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>({});

  useEffect(() => {
    // Parse state from location
    if (location.state) {
      const { query, filters } = location.state;
      setSearchQuery(query || '');
      setFilters(filters || {});
      
      // Fetch results on component mount
      fetchResults(filters, query);
    } else {
      // If no state is passed, redirect back to search page
      navigate('/');
    }
  }, [location.state]);

  const fetchResults = async (filters: SearchFilters, query?: string) => {
    setIsLoading(true);
    try {
      const results = await searchUsers(filters, query);
      setResults(results);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleViewProfile = (userId: string) => {
    console.log('View profile:', userId);
    // TODO: Implement profile view
  };

  const handleContactCandidate = (userId: string) => {
    console.log('Contact candidate:', userId);
    // TODO: Implement contact functionality
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Button
          variant="secondary"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Button>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Results</h1>
        {searchQuery && (
          <p className="text-gray-600">
            Results for: <span className="font-medium">"{searchQuery}"</span>
          </p>
        )}
        
        {Object.keys(filters).length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-500">Applied filters:</p>
            {/* We could show filter badges here */}
          </div>
        )}
      </div>
      
      <SearchResults 
        results={results}
        isLoading={isLoading}
        searchQuery={searchQuery}
        appliedFilters={filters}
        onViewProfile={handleViewProfile}
        onContactCandidate={handleContactCandidate}
      />
    </div>
  );
};

export default SearchResultsPage;
