import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Star, Briefcase } from 'lucide-react'; // Added icons that might be used by panel or its sub-parts indirectly
import Button from '../components/Button';
import { searchUsers } from '../services/searchService';
import type { SearchFilters } from '../services/searchService';

// Assuming ProfilePage.tsx and its types are in the same directory or adjust path
import type { UserStructuredData } from './ProfilePage';
import ProfileSidePanel from './ProfileSidePanel'; // Adjust path if ProfileSidePanel is elsewhere

const SearchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  // State for the profile side panel
  const [selectedUserDataForPanel, setSelectedUserDataForPanel] = useState<UserStructuredData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);

  useEffect(() => {
    if (location.state) {
      const { query, filters } = location.state;
      setSearchQuery(query || '');
      setFilters(filters || {});
      fetchResults(filters, query);
    } else {
      navigate('/');
    }
  }, [location.state, navigate]);

  const fetchResults = async (filters: SearchFilters, query?: string) => {
    setIsLoading(true);
    try {
      const searchResults = await searchUsers(filters, query);
      setResults(searchResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSearchForm = () => {
    navigate('/dashboard', {
      state: {
        editFilters: filters,
        query: searchQuery
      }
    });
  };

  // Handlers for the profile side panel
  const handleOpenProfilePanel = (userData: UserStructuredData) => {
    setSelectedUserDataForPanel(userData);
    setIsPanelOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  const handleCloseProfilePanel = () => {
    setIsPanelOpen(false);
    setSelectedUserDataForPanel(null);
    document.body.style.overflow = 'auto'; // Restore background scroll
  };


  return (
    <> {/* Added React.Fragment to wrap main content and panel */}
      <div className={`container mx-auto px-4 py-2 max-w-7xl bg-gray-50 min-h-screen ${isPanelOpen ? 'overflow-hidden' : ''}`}>
        {/* Header with back button */}
        <div className="flex items-center justify-between py-4 mb-2">
          <Button
            variant="secondary"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            onClick={handleBackToSearchForm} // Changed from handleBack
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-sm">Share</Button>
            <Button
              variant="primary"
              className="text-sm bg-purple-700 text-white"
              onClick={() => navigate('/dashboard', { replace: true })}
            >
              New Search
            </Button>
          </div>
        </div>

        {/* Search Filters Header */}
        <div className="bg-white shadow-sm rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-medium text-gray-900">Search Query & Filters</h1>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => navigate('/dashboard', { state: { editFilters: filters, query: searchQuery } })}
              title="Edit Filters"
            >
              <span className="sr-only">Edit</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
             {searchQuery && (
                <div className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-sm text-gray-700">
                    Keyword: <span className="font-medium ml-1">{searchQuery}</span>
                </div>
             )}
            {Object.entries(filters).map(([key, value]) => (
              value && (typeof value === 'string' || typeof value === 'number') && (
                <div key={key} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-sm text-gray-700">
                  {`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: `}
                  <span className="font-medium ml-1">{String(value)}</span>
                </div>
              )
            ))}
            <button
              className="text-sm text-purple-600 hover:text-purple-800 ml-auto underline"
              onClick={() => navigate('/dashboard', { state: { editFilters: filters, query: searchQuery } })}
            >
              Edit Filters
            </button>
          </div>
        </div>

        {/* All Profiles Header */}
        <div className="bg-white shadow-sm rounded-lg mb-4 border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <h2 className="font-medium">
                  All Profiles ({results.length})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {results.length > 0 ? `Showing 1-${results.length > 15 ? 15 : results.length} of ${results.length}` : '0 results'} {/* Basic pagination text */}
                </span>
                <div className="flex">
                  <button className="p-1 border border-gray-200 rounded-l-md hover:bg-gray-50" title="Previous Page">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-1 border-t border-r border-b border-gray-200 rounded-r-md hover:bg-gray-50" title="Next Page">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching candidates...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-lg font-medium text-gray-900 mb-2">No candidates found</p>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters to find more candidates.
              </p>
            </div>
          ) : (
            <div>
              {results.map((result, index) => {
                const { user } = result; // Assuming result structure from searchService
                // Ensure user and user.structuredData exist
                if (!user || !user.structuredData) {
                    console.warn("User data is missing for result:", result);
                    return null; // Skip rendering this item
                }
                const { personalInfo, experience, skills } = user.structuredData;

                return (
                  <div key={result.id || index} className={`p-6 ${index !== results.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-start">
                      <input type="checkbox" className="mt-1 mr-4 rounded" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3
                              className="font-medium cursor-pointer hover:text-purple-700 transition-colors flex items-center gap-1"
                              onClick={() => handleOpenProfilePanel(user.structuredData)} // Open panel
                            >
                              {personalInfo.fullName}
                              {/* Icon indicates clickable, panel will open */}
                              <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </h3>
                            {personalInfo.linkedIn && (
                                <a href={personalInfo.linkedIn.startsWith('http') ? personalInfo.linkedIn : `https://${personalInfo.linkedIn}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600" title="LinkedIn">
                                <span className="sr-only">LinkedIn</span>
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </a>
                            )}
                            {personalInfo.github && (
                                <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600" title="GitHub">
                                <span className="sr-only">GitHub</span>
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                </a>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="text-xs">Shortlist</Button>
                            <Button variant="outline" size="sm" className="text-xs">Summarize</Button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {experience && experience.length > 0 && (
                            <p>
                              {experience[0].position} at {experience[0].company}
                              <span className="mx-1.5">•</span>
                              {personalInfo.location || 'Location not specified'}
                            </p>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span
                              className="font-medium cursor-pointer hover:text-purple-700 transition-colors"
                              onClick={() => handleOpenProfilePanel(user.structuredData)} // Open panel
                            >
                              {personalInfo.fullName.split(' ')[0]}
                            </span>
                            {experience?.[0]?.company ? ` has been a ${experience[0].position} at ${experience[0].company}` : ' has relevant experience'}
                            {experience?.[0]?.startDate && ` since ${new Date(experience[0].startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                            {experience && experience.length > 1 && experience[1].position && `, with prior experience as a ${experience[1].position}`}.
                          </p>
                        </div>
                        <div className="mt-3">
                          {skills && skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {skills.slice(0, 4).map((skill: string, i: number) => (
                                <span key={i} className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                                  {skill}
                                </span>
                              ))}
                              {skills.length > 4 && (
                                <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                                  +{skills.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Side Panel and Overlay */}
      {isPanelOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300 ease-in-out"
            onClick={handleCloseProfilePanel}
            aria-hidden="true"
          ></div>
          {/* Panel */}
          <ProfileSidePanel
            userData={selectedUserDataForPanel}
            onClose={handleCloseProfilePanel}
          />
        </>
      )}
    </>
  );
};

export default SearchResultsPage;