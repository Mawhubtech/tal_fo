import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, Users, ExternalLink } from 'lucide-react';
import { useSearchProspects } from '../../hooks/useClientOutreach';
import LoadingSpinner from '../../components/LoadingSpinner';

const SearchResultsPage: React.FC = () => {
  const { searchId } = useParams<{ searchId: string }>();
  const { data: prospects = [], isLoading } = useSearchProspects(searchId!);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard/client-outreach/searches"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Searches
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
              <p className="text-gray-600 mt-2">
                Found {prospects.length} potential prospects
              </p>
            </div>
          </div>
        </div>

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
