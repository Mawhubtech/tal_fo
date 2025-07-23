import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, Users, ExternalLink, Search, Calendar, BarChart3 } from 'lucide-react';
import { useSearchProspects, useSearchDetails } from '../../hooks/useClientOutreach';
import LoadingSpinner from '../../components/LoadingSpinner';

const SearchResultsPage: React.FC = () => {
  const { searchId } = useParams<{ searchId: string }>();
  const { data: prospects = [], isLoading: prospectsLoading } = useSearchProspects(searchId!);
  const { data: searchDetails, isLoading: searchLoading } = useSearchDetails(searchId!);

  if (prospectsLoading || searchLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            {searchDetails?.project ? (
              <>
                <Link
                  to={`/dashboard/client-outreach/projects/${searchDetails.project.id}`}
                  className="hover:text-gray-700"
                >
                  {searchDetails.project.name}
                </Link>
                <span>/</span>
                <Link
                  to={`/dashboard/client-outreach/projects/${searchDetails.project.id}/searches`}
                  className="hover:text-gray-700"
                >
                  Searches
                </Link>
                <span>/</span>
                <span className="text-gray-900">Results</span>
              </>
            ) : (
              <Link
                to="/dashboard/client-outreach/searches"
                className="inline-flex items-center hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Searches
              </Link>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {searchDetails?.name || 'Search Results'}
              </h1>
              <p className="text-gray-600 mt-2">
                Found {prospects.length} potential prospects
              </p>
            </div>
            
            {searchDetails?.project && (
              <Link
                to={`/dashboard/client-outreach/projects/${searchDetails.project.id}/prospects`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Users className="w-4 h-4 mr-2" />
                View All Prospects
              </Link>
            )}
          </div>
        </div>

        {/* Search Info Card */}
        {searchDetails && (
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Search Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{new Date(searchDetails.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Search className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="capitalize">{searchDetails.searchType} search</span>
                  </div>
                  {searchDetails.originalQuery && (
                    <div className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Query:</span> {searchDetails.originalQuery}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Results Summary</h3>
                <div className="space-y-2 text-sm">
                  {searchDetails.results ? (
                    <>
                      <div>Total Found: <span className="font-medium">{searchDetails.results.total || searchDetails.results.companiesFound || 0}</span></div>
                      <div>Execution Time: <span className="font-medium">{searchDetails.results.executionTime || 'N/A'}ms</span></div>
                      <div>API Cost: <span className="font-medium">{searchDetails.results.apiCost || 6} credits</span></div>
                      <div>Prospects Saved: <span className="font-medium">{searchDetails.prospectsCount || 0}</span></div>
                    </>
                  ) : (
                    <div className="text-gray-500">No results data available</div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Search Filters</h3>
                <div className="space-y-1">
                  {searchDetails.filters ? (
                    <div className="flex flex-wrap gap-1">
                      {searchDetails.filters.industries?.slice(0, 3).map((industry: string, index: number) => (
                        <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {industry}
                        </span>
                      ))}
                      {searchDetails.filters.locations?.slice(0, 2).map((location: string, index: number) => (
                        <span key={index} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {location}
                        </span>
                      ))}
                      {searchDetails.filters.companySize?.slice(0, 1).map((size: string, index: number) => (
                        <span key={index} className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          {size}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No filter data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {prospects.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8">
            <div className="text-center">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">
                This search didn't return any prospects. Try adjusting your search criteria.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {prospects.map((prospect) => (
              <div key={prospect.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {prospect.companyName}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        prospect.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        prospect.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        prospect.status === 'responded' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {prospect.status}
                      </span>
                    </div>

                    {prospect.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {prospect.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      {prospect.industry && (
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {prospect.industry}
                        </div>
                      )}
                      {prospect.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {prospect.location}
                        </div>
                      )}
                      {prospect.employeeCount && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {prospect.employeeCount} employees
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {prospect.website && (
                        <a
                          href={prospect.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Website
                        </a>
                      )}
                      {prospect.linkedinUrl && (
                        <a
                          href={prospect.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {prospect.matchScore && (
                      <div className="text-right">
                        <span className="text-sm text-gray-500">Match Score</span>
                        <div className="text-lg font-semibold text-green-600">
                          {(prospect.matchScore * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
