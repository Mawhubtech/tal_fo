import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Search as SearchIcon,
  Sparkles,
  X,
  Filter,
  Building,
  Play,
  ArrowRight
} from 'lucide-react';
import { useAIQuery } from '../../hooks/ai';
import { useToast } from '../../contexts/ToastContext';
import ManualSearchForm from '../../components/ManualSearchForm';
import { 
  extractClientSearchKeywords, 
  convertToClientSearchFilters, 
  convertToCoreSignalQuery,
  executeCompanySearch,
  convertToCompanyResult,
  cleanExtractedKeywords,
  type ClientSearchFilters,
  type ExtractedKeywords,
  type CoreSignalQuery,
  type ClientSearchResult
} from '../../services/clientOutreachSearchService';

export interface ClientSearchRef {
  clearSearch: () => void;
}

interface ClientSearchProps {
  onSearchResults?: (results: any, filters: ClientSearchFilters) => void;
}

const ClientSearch = forwardRef<ClientSearchRef, ClientSearchProps>(({ onSearchResults }, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isExecutingSearch, setIsExecutingSearch] = useState(false);
  const [extractedFilters, setExtractedFilters] = useState<ClientSearchFilters | null>(null);
  const [coreSignalQuery, setCoreSignalQuery] = useState<CoreSignalQuery | null>(null);
  const [searchResults, setSearchResults] = useState<ClientSearchResult | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'ai' | 'manual'>('ai');
  const [manualFilters, setManualFilters] = useState<ClientSearchFilters>({
    industries: [],
    locations: [],
    technologies: [],
    keywords: [],
    companySize: [],
    fundingStage: [],
    employees: {},
    revenue: {},
    excludeCompanies: [],
    excludeDomains: []
  });

  // AI hook for search enhancement
  const aiQuery = useAIQuery();

  // Expose clear functionality through ref
  useImperativeHandle(ref, () => ({
    clearSearch: () => {
      setSearchQuery('');
      setExtractedFilters(null);
      setCoreSignalQuery(null);
      setSearchResults(null);
      setShowFilters(false);
      aiQuery.reset();
    }
  }));

  // Handle state from navigation
  useEffect(() => {
    if (location.state) {
      const { query, extractedFilters: navExtractedFilters, shouldRestoreSearch } = location.state;
      if (query) {
        setSearchQuery(query);
      }
      if (navExtractedFilters) {
        setExtractedFilters(navExtractedFilters);
        setShowFilters(true);
        
        // Convert extracted filters to CoreSignal query
        const coreSignalQuery: CoreSignalQuery = convertToCoreSignalQuery(navExtractedFilters);
        setCoreSignalQuery(coreSignalQuery);
      }
      
      // Clear the navigation state to prevent re-triggering on subsequent renders
      if (shouldRestoreSearch) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [location.state]);

  // Function to enhance search with AI
  const enhanceSearchWithAI = async () => {
    if (!searchQuery.trim()) return;

    try {
      await aiQuery.query({
        prompt: `Enhance this company search query to be more specific and effective for finding potential business clients: "${searchQuery}"`,
        systemPrompt: "You are a business development specialist. Help enhance company search queries to find the best potential clients.",
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        max_tokens: 500
      });
    } catch (error) {
      console.error('Error enhancing search with AI:', error);
      addToast({
        type: 'error',
        title: 'Enhancement Failed',
        message: 'Failed to enhance search query. Please try again.'
      });
    }
  };

  // Main function for AI keyword extraction and filter generation
  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Extract keywords using AI
      console.log('Extracting keywords from query:', searchQuery);
      const rawKeywords: ExtractedKeywords = await extractClientSearchKeywords(searchQuery);
      console.log('Raw extracted keywords:', rawKeywords);
      
      // Clean the extracted keywords
      const keywords: ExtractedKeywords = cleanExtractedKeywords(rawKeywords);
      console.log('Cleaned keywords:', keywords);
      
      // Convert to filters
      const filters: ClientSearchFilters = convertToClientSearchFilters(keywords);
      console.log('Converted filters:', filters);
      
      // Convert to CoreSignal query
      const coreSignalQuery: CoreSignalQuery = convertToCoreSignalQuery(filters);
      console.log('CoreSignal query:', coreSignalQuery);

      // Update state to show the generated filters
      setExtractedFilters(filters);
      setCoreSignalQuery(coreSignalQuery);
      setShowFilters(true);

      addToast({
        type: 'success',
        title: 'Filters Generated',
        message: 'AI has extracted search criteria from your query. Review the filters below.'
      });

      // If callback is provided, call it with the results
      if (onSearchResults) {
        // For now, just pass the filters - actual search execution will be implemented later
        onSearchResults(null, filters);
      }

    } catch (error) {
      console.error('Error in AI search:', error);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: error instanceof Error ? error.message : 'Failed to process search. Please try again.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setExtractedFilters(null);
    setCoreSignalQuery(null);
    setSearchResults(null);
    setShowFilters(false);
    setManualFilters({
      industries: [],
      locations: [],
      technologies: [],
      keywords: [],
      companySize: [],
      fundingStage: [],
      employees: {},
      revenue: {},
      excludeCompanies: [],
      excludeDomains: []
    });
  };

  // Execute the actual company search using the generated filters
  const executeSearch = async () => {
    if (!extractedFilters) {
      addToast({
        type: 'error',
        title: 'No Filters',
        message: 'Please generate search filters first by clicking "Generate Search Filters".'
      });
      return;
    }

    setIsExecutingSearch(true);
    try {
      console.log('Executing company search with filters:', extractedFilters);
      
      // Execute the backend search
      const result: ClientSearchResult = await executeCompanySearch(
        extractedFilters,
        searchQuery // Use original search query as search text
      );

      console.log('Search completed:', result);
      setSearchResults(result);

      addToast({
        type: 'success',
        title: 'Search Completed',
        message: `Found ${result.companies.length} companies in ${result.executionTime}ms. API cost: 6 credits.`
      });

      // Navigate to results page with search data
      navigate('/dashboard/client-outreach/search-results', {
        state: {
          searchResults: result,
          searchQuery,
          extractedFilters,
          coreSignalQuery
        }
      });

      // If callback is provided, call it with the actual results
      if (onSearchResults) {
        const companyResults = result.companies.map(convertToCompanyResult);
        onSearchResults(companyResults, extractedFilters);
      }

    } catch (error) {
      console.error('Error executing search:', error);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: error instanceof Error ? error.message : 'Failed to execute search. Please try again.'
      });
    } finally {
      setIsExecutingSearch(false);
    }
  };

  // Execute manual search using manually configured filters
  const executeManualSearch = async () => {
    // Check if any meaningful filters are set
    const hasFilters = manualFilters.industries?.length > 0 ||
                      manualFilters.locations?.length > 0 ||
                      manualFilters.technologies?.length > 0 ||
                      manualFilters.keywords?.length > 0 ||
                      manualFilters.companySize?.length > 0 ||
                      manualFilters.fundingStage?.length > 0 ||
                      (manualFilters.employees?.min !== undefined && manualFilters.employees?.min > 0) ||
                      (manualFilters.employees?.max !== undefined && manualFilters.employees?.max > 0) ||
                      (manualFilters.revenue?.min !== undefined && manualFilters.revenue?.min > 0) ||
                      (manualFilters.revenue?.max !== undefined && manualFilters.revenue?.max > 0) ||
                      manualFilters.excludeCompanies?.length > 0 ||
                      manualFilters.excludeDomains?.length > 0;

    if (!hasFilters) {
      addToast({
        type: 'error',
        title: 'No Filters',
        message: 'Please configure at least one search filter before executing the search.'
      });
      return;
    }

    setIsExecutingSearch(true);
    try {
      console.log('Executing manual company search with filters:', manualFilters);
      
      // Execute the backend search with manual filters
      const result: ClientSearchResult = await executeCompanySearch(
        manualFilters,
        generateSearchQueryFromFilters(manualFilters)
      );

      console.log('Manual search completed:', result);
      setSearchResults(result);

      addToast({
        type: 'success',
        title: 'Search Completed',
        message: `Found ${result.companies.length} companies in ${result.executionTime}ms. API cost: 6 credits.`
      });

      // Navigate to results page with manual search data
      navigate('/dashboard/client-outreach/search-results', {
        state: {
          searchResults: result,
          searchQuery: generateSearchQueryFromFilters(manualFilters),
          extractedFilters: manualFilters,
          coreSignalQuery: null, // Manual search doesn't use AI-generated query
          searchMode: 'manual'
        }
      });

      // If callback is provided, call it with the actual results
      if (onSearchResults) {
        const companyResults = result.companies.map(convertToCompanyResult);
        onSearchResults(companyResults, manualFilters);
      }

    } catch (error) {
      console.error('Error executing manual search:', error);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: error instanceof Error ? error.message : 'Failed to execute manual search. Please try again.'
      });
    } finally {
      setIsExecutingSearch(false);
    }
  };

  // Generate a readable search query from manual filters for display purposes
  const generateSearchQueryFromFilters = (filters: ClientSearchFilters): string => {
    const queryParts: string[] = [];
    
    if (filters.industries?.length > 0) {
      queryParts.push(`Industries: ${filters.industries.join(', ')}`);
    }
    
    if (filters.locations?.length > 0) {
      queryParts.push(`Locations: ${filters.locations.join(', ')}`);
    }
    
    if (filters.technologies?.length > 0) {
      queryParts.push(`Technologies: ${filters.technologies.join(', ')}`);
    }
    
    if (filters.keywords?.length > 0) {
      queryParts.push(`Keywords: ${filters.keywords.join(', ')}`);
    }
    
    if (filters.companySize?.length > 0) {
      queryParts.push(`Company Size: ${filters.companySize.join(', ')}`);
    }
    
    if (filters.fundingStage?.length > 0) {
      queryParts.push(`Funding Stage: ${filters.fundingStage.join(', ')}`);
    }
    
    if (filters.employees?.min !== undefined || filters.employees?.max !== undefined) {
      const empRange = [];
      if (filters.employees.min !== undefined) empRange.push(`min: ${filters.employees.min}`);
      if (filters.employees.max !== undefined) empRange.push(`max: ${filters.employees.max}`);
      queryParts.push(`Employees: ${empRange.join(', ')}`);
    }
    
    if (filters.revenue?.min !== undefined || filters.revenue?.max !== undefined) {
      const revRange = [];
      if (filters.revenue.min !== undefined) revRange.push(`min: $${filters.revenue.min}M`);
      if (filters.revenue.max !== undefined) revRange.push(`max: $${filters.revenue.max}M`);
      queryParts.push(`Revenue: ${revRange.join(', ')}`);
    }
    
    return queryParts.length > 0 ? queryParts.join(' | ') : 'Manual Search';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
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

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Search Mode Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setSearchMode('ai')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  searchMode === 'ai'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                AI Search
              </button>
              <button
                onClick={() => setSearchMode('manual')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  searchMode === 'manual'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Filter className="w-4 h-4 inline mr-2" />
                Manual Search
              </button>
            </div>
          </div>
        </div>

        {searchMode === 'ai' ? (
          // AI Search Interface
          <>
            <div className="text-center mb-6">
              <div className="flex items-center justify-between mb-4">
                <div></div> {/* Spacer */}
                <h2 className="text-xl font-bold text-gray-900">Find Your Ideal Clients with AI</h2>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    clearFilters();
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
                Describe your ideal client company and AI will find matching prospects.
              </p>
            </div>
            
            {/* Search Input */}
            <div className="w-full mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-700">What companies are you looking for?</h3>
              </div>
              
              <div className="relative">
                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 border border-gray-200 hover:border-purple-300 transition-colors">
                  <SearchIcon className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tech companies in Germany with 50-200 employees, SaaS platforms, AI startups..."
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
                        clearFilters();
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

            {/* AI Search Button */}
            <div className="w-full">
              <button 
                onClick={handleAISearch}
                disabled={!searchQuery.trim() || isSearching}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-center gap-3"
              >
                {isSearching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing Query...
                  </>
                ) : (
                  <>
                    <SearchIcon className="w-5 h-5" />
                    Generate Search Filters
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          // Manual Search Interface
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Manual Search Filters</h2>
              <p className="text-gray-500 text-sm">
                Build your search query using specific filters based on CoreSignal database schema.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AI Generated Filters Display */}
      {searchMode === 'ai' && showFilters && extractedFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-purple-600" />
              Generated Search Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Industries */}
            {extractedFilters.industries && extractedFilters.industries.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Industries</h4>
                <div className="flex flex-wrap gap-2">
                  {extractedFilters.industries.map((industry, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company Size */}
            {extractedFilters.companySize && extractedFilters.companySize.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Company Size</h4>
                <div className="flex flex-wrap gap-2">
                  {extractedFilters.companySize.map((size, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Locations */}
            {extractedFilters.locations && extractedFilters.locations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Locations</h4>
                <div className="flex flex-wrap gap-2">
                  {extractedFilters.locations.map((location, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Technologies */}
            {extractedFilters.technologies && extractedFilters.technologies.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {extractedFilters.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {extractedFilters.keywords && extractedFilters.keywords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {extractedFilters.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Funding Stage */}
            {extractedFilters.fundingStage && extractedFilters.fundingStage.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Funding Stage</h4>
                <div className="flex flex-wrap gap-2">
                  {extractedFilters.fundingStage.map((stage, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Employee and Revenue Ranges */}
          {((extractedFilters.employees?.min || extractedFilters.employees?.max) || 
            (extractedFilters.revenue?.min || extractedFilters.revenue?.max)) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Ranges</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {(extractedFilters.employees?.min || extractedFilters.employees?.max) && (
                  <div>
                    <span className="text-gray-500">Employees:</span>
                    <span className="ml-2 text-gray-900">
                      {extractedFilters.employees?.min || 0} - {extractedFilters.employees?.max || '∞'}
                    </span>
                  </div>
                )}
                {(extractedFilters.revenue?.min || extractedFilters.revenue?.max) && (
                  <div>
                    <span className="text-gray-500">Revenue:</span>
                    <span className="ml-2 text-gray-900">
                      ${extractedFilters.revenue?.min?.toLocaleString() || 0} - ${extractedFilters.revenue?.max?.toLocaleString() || '∞'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Execute AI Search Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Ready to find companies?</p>
                <p>This will search CoreSignal database using the AI-generated filters above.</p>
                <p className="text-xs text-purple-600 mt-1">Cost: ~6 API credits (1 search + 5 company details)</p>
              </div>
              <button
                onClick={executeSearch}
                disabled={isExecutingSearch}
                className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {isExecutingSearch ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute Search
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Search Form */}
      {searchMode === 'manual' && (
        <ManualSearchForm
          filters={manualFilters}
          onFiltersChange={setManualFilters}
          onExecuteSearch={executeManualSearch}
          isExecuting={isExecutingSearch}
        />
      )}

      {/* Search Results Display */}
    {searchResults && (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building className="w-5 h-5 mr-2 text-green-600" />
            Search Results
          </h3>
          <div className="text-sm text-gray-600">
            {searchResults.companies.length} companies • {searchResults.executionTime}ms • 6 credits used
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.companies.map((company) => (
            <div key={company.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{company.name}</h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{company.description}</p>
                </div>
                {company.score && (
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-yellow-600">★ {company.score.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center">
                  <Building className="w-3 h-3 mr-1" />
                  <span>{company.industry || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 mr-1">👥</span>
                  <span>{company.sizeRange || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 mr-1">📍</span>
                  <span>{company.location || 'N/A'}</span>
                </div>
              </div>

              {(company.specialties && company.specialties.length > 0) && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {company.specialties.slice(0, 2).map((specialty, index) => (
                      <span key={index} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        {specialty}
                      </span>
                    ))}
                    {company.specialties.length > 2 && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        +{company.specialties.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-xs">
                {company.domain && (
                  <a
                    href={`https://${company.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800"
                  >
                    Visit Website
                  </a>
                )}
                {company.linkedinUrl && (
                  <a
                    href={company.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {searchResults.companies.length === 0 && (
          <div className="text-center py-8">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Companies Found</h4>
            <p className="text-gray-600">Try adjusting your search criteria or query.</p>
          </div>
        )}
      </div>
    )}

    {/* CoreSignal Query Display (for debugging) */}
    {coreSignalQuery && (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <details>
          <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
            Debug: Generated CoreSignal Query
          </summary>
          <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto mt-2">
            {JSON.stringify(coreSignalQuery, null, 2)}
          </pre>
        </details>
      </div>
    )}
  </div>
  );
});

export default ClientSearch;
