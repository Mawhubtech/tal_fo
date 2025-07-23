import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  MapPin,
  Users,
  Globe,
  ExternalLink,
  Linkedin,
  Search,
  Filter,
  Eye,
  Calendar,
  Download,
  RefreshCw,
  Phone,
  Mail
} from 'lucide-react';
import { type ClientSearchResult } from '../../services/clientOutreachSearchService';
import { useSearchDetails, useSearchProspects } from '../../hooks/useClientOutreach';
import LoadingSpinner from '../../components/LoadingSpinner';

interface CompanyResult {
  id: number;
  name: string;
  domain?: string;
  industry?: string;
  sizeRange?: string;
  employeeCount?: number;
  location?: string;
  description?: string;
  specialties?: string[];
  technologies?: string[];
  founded?: string;
  linkedinUrl?: string;
  logo?: string;
  followers?: number;
  type?: string;
  score?: number;
  phoneNumbers?: string[];
  emails?: string[];
  fullAddress?: string;
  socialLinks?: {
    facebook?: string[];
    twitter?: string[];
    instagram?: string[];
    youtube?: string[];
    github?: string[];
  };
}

const SearchResultsListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: projectId, searchId } = useParams<{ id: string; searchId: string }>();
  
  // Get search data from navigation state (for immediate display)
  const { searchResults: stateSearchResults, searchQuery: stateSearchQuery, extractedFilters: stateExtractedFilters, coreSignalQuery: stateCoreSignalQuery } = location.state || {};
  
  // Fetch search data from backend (when no state or for fresh data)
  const { data: searchDetails, isLoading: searchLoading } = useSearchDetails(searchId!);
  const { data: prospects = [], isLoading: prospectsLoading } = useSearchProspects(searchId!);
  
  // Debug logging
  console.log('SearchResultsListPage Debug:', {
    searchId,
    projectId,
    stateSearchResults: !!stateSearchResults,
    searchDetails,
    prospects: prospects.slice(0, 2), // Log first 2 prospects for debugging
    searchLoading,
    prospectsLoading
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  // Determine data source (prefer state for immediate display, fall back to fetched data)
  const searchResults = stateSearchResults || (searchDetails && prospects.length > 0 ? {
    companies: prospects.map(prospect => ({
      id: prospect.coreSignalId || prospect.id,
      name: prospect.companyName,
      domain: prospect.website,
      industry: prospect.industry,
      sizeRange: prospect.sizeRange,
      employeeCount: prospect.employeeCount,
      location: prospect.location,
      description: prospect.description,
      logo: prospect.logo,
      specialties: Array.isArray(prospect.specialties) ? prospect.specialties : 
                   typeof prospect.specialties === 'string' ? [prospect.specialties] : [],
      technologies: Array.isArray(prospect.technologies) ? prospect.technologies : 
                    typeof prospect.technologies === 'string' ? [prospect.technologies] : [],
      linkedinUrl: prospect.linkedinUrl,
      score: prospect.matchScore,
    })),
    total: prospects.length,
    executionTime: searchDetails.results?.executionTime || 0,
  } : null);
  
  const searchQuery = stateSearchQuery || searchDetails?.originalQuery || searchDetails?.name || '';
  const extractedFilters = stateExtractedFilters || searchDetails?.filters || {};
  const coreSignalQuery = stateCoreSignalQuery || searchDetails?.coreSignalQuery || null;

  // Show loading if fetching data and no state available
  if ((searchLoading || prospectsLoading) && !stateSearchResults) {
    return <LoadingSpinner />;
  }

  // If no search results after loading, redirect back
  if (!searchResults) {
    const fallbackRoute = projectId 
      ? `/dashboard/client-outreach/projects/${projectId}/search`
      : '/dashboard/client-outreach';
    navigate(fallbackRoute);
    return null;
  }

  const results: CompanyResult[] = searchResults.companies || [];
  
  // Debug the final results
  console.log('Final results:', results.slice(0, 2));

  // Filter results based on search term and industries
  const filteredResults = results.filter(result => {
    const matchesSearch = !searchTerm || 
      (result.name && result.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (result.industry && result.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (result.location && result.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesIndustry = selectedIndustries.length === 0 || 
      (result.industry && selectedIndustries.includes(result.industry));
    
    return matchesSearch && matchesIndustry;
  });

  // Get unique industries for filter
  const industries = Array.from(new Set(results.map(r => r.industry).filter(Boolean))) as string[];

  const handleCompanyClick = (company: CompanyResult) => {
    navigate('/dashboard/client-outreach/company-detail', {
      state: { company, searchContext: { searchQuery, extractedFilters } }
    });
  };

  const handleBackToSearch = () => {
    // Determine the correct route based on whether we're in a project context
    const searchRoute = projectId 
      ? `/dashboard/client-outreach/projects/${projectId}/search`
      : '/dashboard/client-outreach/search';
      
    navigate(searchRoute, {
      state: { 
        query: searchQuery,
        extractedFilters: extractedFilters,
        shouldRestoreSearch: true
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToSearch}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Search
            </button>
            <div className="h-6 border-l border-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{filteredResults.length} of {results.length} companies</span>
            <span>•</span>
            <span>{searchResults.executionTime}ms</span>
            <span>•</span>
            <span className="text-purple-600 font-medium">6 credits used</span>
          </div>
        </div>

        {/* Search query display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Search Query:</span>
            <span className="text-sm text-gray-900">"{searchQuery}"</span>
          </div>
          
          {/* Show extracted filters */}
          {extractedFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {extractedFilters.industries?.map((industry: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md">
                  {industry}
                </span>
              ))}
              {extractedFilters.locations?.map((location: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                  {location}
                </span>
              ))}
              {extractedFilters.technologies?.map((tech: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-md">
                  {tech}
                </span>
              ))}
              {extractedFilters.keywords?.map((keyword: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md">
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          {/* Search filter */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Filter companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Industry filter */}
          <select
            value={selectedIndustries[0] || ''}
            onChange={(e) => setSelectedIndustries(e.target.value ? [e.target.value] : [])}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Industries</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>

          {/* Clear filters */}
          {(searchTerm || selectedIndustries.length > 0) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedIndustries([]);
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.map((company) => (
          <div
            key={company.id}
            onClick={() => handleCompanyClick(company)}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-purple-300"
          >
            <div className="flex items-start gap-4">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                {company.logo ? (
                  <img
                    src={company.logo.startsWith('/9j/') || company.logo.startsWith('data:') ? 
                      `data:image/jpeg;base64,${company.logo.replace(/\r?\n/g, '')}` : 
                      company.logo
                    }
                    alt={`${company.name} logo`}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center ${company.logo ? 'hidden' : ''}`}>
                  <span className="text-white font-semibold text-lg">
                    {company.name && company.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Company Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-xl mb-1">
                      {company.name || 'Unknown Company'}
                    </h3>
                    <p className="text-sm text-purple-600 font-medium">{company.industry || 'Unknown Industry'}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {company.description || 'No description available'}
                </p>

                {/* Company Details Row */}
                <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{company.location || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{company.sizeRange || 'Size not specified'}</span>
                  </div>
                  {company.founded && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Founded {company.founded}</span>
                    </div>
                  )}
                  {company.employeeCount && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{company.employeeCount.toLocaleString()} employees</span>
                    </div>
                  )}
                </div>

                {/* Specialties */}
                {company.specialties && company.specialties.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {company.specialties.slice(0, 5).map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                        >
                          {specialty}
                        </span>
                      ))}
                      {company.specialties.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          +{company.specialties.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Technologies */}
                {company.technologies && company.technologies.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {company.technologies.slice(0, 4).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                      {company.technologies.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          +{company.technologies.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 flex-wrap">
                    {company.domain && (
                      <a
                        href={`https://${company.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center text-sm text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        Website
                      </a>
                    )}
                    {company.linkedinUrl && (
                      <a
                        href={company.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Linkedin className="w-4 h-4 mr-1" />
                        LinkedIn
                      </a>
                    )}
                    {company.phoneNumbers && company.phoneNumbers.length > 0 && (
                      <a
                        href={`tel:${company.phoneNumbers[0]}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center text-sm text-green-600 hover:text-green-800 transition-colors"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        {company.phoneNumbers[0]}
                      </a>
                    )}
                    {company.emails && company.emails.length > 0 && (
                      <a
                        href={`mailto:${company.emails[0]}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center text-sm text-orange-600 hover:text-orange-800 transition-colors"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        {company.emails[0]}
                      </a>
                    )}
                    {company.followers && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        {company.followers.toLocaleString()} followers
                      </div>
                    )}
                  </div>
                  <button className="flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredResults.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Found</h3>
          <p className="text-gray-600 mb-6">
            {results.length === 0
              ? 'No companies match your search criteria.'
              : 'No companies match your current filters.'}
          </p>
          {results.length > 0 && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedIndustries([]);
              }}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Debug Info */}
      {coreSignalQuery && (
        <div className="mt-8 bg-gray-50 rounded-lg border border-gray-200 p-4">
          <details>
            <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
              Debug: CoreSignal Query Used
            </summary>
            <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto mt-2">
              {JSON.stringify(coreSignalQuery, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default SearchResultsListPage;
