import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Eye } from 'lucide-react';
import { useSearch, useExternalSourceSearch, useCombinedSearch } from '../hooks/useSearch';
import { useAddProspectsToProject } from '../hooks/useSourcingProjects';
import { useShortlistExternalCandidate } from '../hooks/useShortlistExternal';
import { useAuthContext } from '../contexts/AuthContext';
import type { SearchFilters } from '../services/searchService';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ProjectSelectionModal from '../components/ProjectSelectionModal';
import SourcingProfileSidePanel, { type PanelState } from '../sourcing/outreach/components/SourcingProfileSidePanel';
import type { UserStructuredData } from '../components/ProfileSidePanel';

// We'll need to create a simplified version of the search results for global use
const GlobalSearchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  
  const [results, setResults] = useState<any[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMode, setSearchMode] = useState<'database' | 'external' | 'combined'>('external');
  const [isLoading, setIsLoading] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [fromQuickSearch, setFromQuickSearch] = useState(false);
  const [shortlistingCandidates, setShortlistingCandidates] = useState<{ [key: string]: boolean }>({});
  
  // State for the profile side panel
  const [selectedUserDataForPanel, setSelectedUserDataForPanel] = useState<UserStructuredData | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [panelState, setPanelState] = useState<PanelState>('closed');
  
  // Search hooks for different modes
  const { executeSearch } = useSearch();
  const { executeSearch: executeExternalSourceSearch } = useExternalSourceSearch();
  const { executeSearch: executeCombinedSearch } = useCombinedSearch();
  const addProspectsToProjectMutation = useAddProspectsToProject();
  const shortlistExternalMutation = useShortlistExternalCandidate();
  
  // Get current user context
  const { user } = useAuthContext();

  // Handle state from search page
  useEffect(() => {
    if (location.state) {
      const { 
        query, 
        filters, 
        searchMode: stateSearchMode, 
        isGlobalSearch, 
        fromQuickSearch,
        newProjectId,
        candidateToShortlist,
        shouldAutoShortlist
      } = location.state;
      
      setSearchQuery(query || '');
      setFilters(filters || {});
      setSearchMode(stateSearchMode || 'external');
      setFromQuickSearch(!!fromQuickSearch);
      
      if (isGlobalSearch && query) {
        fetchResults(filters || {}, query, stateSearchMode || 'external');
      }
      
      // Handle auto-shortlisting after project creation
      if (shouldAutoShortlist && newProjectId && candidateToShortlist) {
        // Show a loading toast while auto-shortlisting
        addToast({
          type: 'info',
          title: 'Shortlisting Candidate',
          message: 'Adding candidate to your newly created project...'
        });
        
        // Auto-shortlist the candidate to the newly created project
        setTimeout(() => {
          handleAutoShortlist(candidateToShortlist, newProjectId);
        }, 1000); // Small delay to ensure UI state is ready
      }
    } else {
      // Navigate back to global search if no state
      navigate('/dashboard/search');
    }
  }, [location.state, navigate]);

  const fetchResults = async (filters: SearchFilters, query?: string, mode?: 'database' | 'external' | 'combined') => {
    setIsLoading(true);
    try {
      const searchParams = {
        filters,
        searchText: query,
        pagination: { page: 1, limit: 10 }
      };
      
      const searchMode = mode || 'database';
      let searchResults: any;
      
      // Execute search based on mode
      if (searchMode === 'external') {
        searchResults = await executeExternalSourceSearch(searchParams);
      } else if (searchMode === 'combined') {
        searchResults = await executeCombinedSearch(searchParams, true);
      } else {
        searchResults = await executeSearch(searchParams);
      }
      
      // Handle the response structure from backend
      let newResults: any[] = [];
      if (searchResults && typeof searchResults === 'object' && 'results' in searchResults) {
        newResults = (searchResults as any).results || [];
      } else if (Array.isArray(searchResults)) {
        newResults = searchResults;
      }

      setResults(newResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Failed to fetch search results. Please try again.'
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for the profile side panel
  const handleOpenProfilePanel = (userData: UserStructuredData, candidateId?: string) => {
    setSelectedUserDataForPanel(userData);
    setSelectedCandidateId(candidateId || null);
    setPanelState('expanded');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  const handlePanelStateChange = (newState: PanelState) => {
    setPanelState(newState);
    if (newState === 'closed') {
      setSelectedUserDataForPanel(null);
      setSelectedCandidateId(null);
      document.body.style.overflow = 'auto'; // Restore background scroll
    }
  };

  // Function to convert candidate data to UserStructuredData format
  const convertCandidateToUserData = (candidate: any): UserStructuredData => {
    const candidateData = candidate.candidate || candidate;
    
    return {
      personalInfo: {
        fullName: candidateData.fullName || 'Unknown',
        email: candidateData.email || '',
        phone: candidateData.phone || '',
        location: candidateData.location || 'Not specified',
        linkedIn: candidateData.linkedinUrl || candidateData.linkedin || '',
        avatar: candidateData.avatar || ''
      },
      summary: candidateData.summary || candidateData.profileSummary || '',
      experience: candidateData.experience || candidateData.workExperience || [],
      education: candidateData.education || [],
      skills: candidateData.skills || [],
      projects: candidateData.projects || [],
      certifications: candidateData.certifications || [],
      awards: candidateData.awards || [],
      interests: candidateData.interests || [],
      languages: candidateData.languages || [],
      references: candidateData.references || [],
      customFields: []
    };
  };

  // Auto-shortlist a candidate to a specific project (used after project creation)
  const handleAutoShortlist = async (candidate: any, projectId: string) => {
    try {
      setShortlistingCandidates(prev => ({ ...prev, [candidate.id]: true }));

      // Determine if this is an external source candidate
      const isExternalSourceCandidate = searchMode === 'external' || (searchMode === 'combined' && candidate.source === 'coresignal') || candidate.coreSignalId;
      let candidateIdForProspects = candidate.id;

      // Step 1: If external source candidate, save to database first
      if (isExternalSourceCandidate && (candidate.coreSignalId || candidate.id)) {
        try {
          const coreSignalId = candidate.coreSignalId || candidate.id;
          const shortlistResult = await shortlistExternalMutation.mutateAsync({
            coreSignalId: coreSignalId,
            candidateData: candidate,
            createdBy: user?.id || ''
          });

          // Extract candidate ID regardless of success status (for existing candidates)
          candidateIdForProspects = shortlistResult.candidateId || shortlistResult.existingCandidateId || candidate.id;

          if (shortlistResult.success) {
            addToast({
              type: 'success',
              title: 'Candidate Saved',
              message: shortlistResult.message,
              duration: 3000
            });
          } else if (shortlistResult.existingCandidateId) {
            // Candidate already exists, show info message
            addToast({
              type: 'info', 
              title: 'Candidate Already Exists',
              message: shortlistResult.message,
              duration: 3000
            });
          } else {
            // Other error
            throw new Error(shortlistResult.message);
          }
        } catch (shortlistError) {
          console.error('Error saving external candidate:', shortlistError);
          addToast({
            type: 'error',
            title: 'Failed to Save Candidate',
            message: shortlistError instanceof Error ? shortlistError.message : 'Failed to save candidate to database. Please try again.',
            duration: 7000
          });
          return; // Exit early if we can't save the candidate
        }
      }

      // Step 2: Add candidate to prospects
      try {
        await addProspectsToProjectMutation.mutateAsync({
          projectId: projectId,
          candidateIds: [candidateIdForProspects],
          searchId: undefined, // No search ID for auto-shortlisting from project creation
        });

        addToast({
          type: 'success',
          title: 'Candidate Shortlisted Successfully',
          message: `${candidate.fullName || candidate.candidateName || 'Candidate'} has been ${isExternalSourceCandidate ? 'saved to your database and ' : ''}added to your project!`
        });
        
        // Close the project modal if it was open
        setShowProjectModal(false);
        setSelectedCandidate(null);
        
      } catch (prospectError: any) {
        // Handle duplicate shortlisting specifically
        if (prospectError?.response?.status === 409 || prospectError?.message?.includes('already exist as prospects')) {
          addToast({
            type: 'info',
            title: 'Already Shortlisted',
            message: `${candidate.fullName || candidate.candidateName || 'Candidate'} is already shortlisted for this project.`,
            duration: 5000
          });
        } else {
          console.error('Error adding candidate to prospects:', prospectError);
          addToast({
            type: 'error',
            title: 'Shortlisting Failed',
            message: 'Failed to shortlist candidate to the project. Please try again.',
            duration: 7000
          });
        }
        return;
      }
      
    } catch (error) {
      console.error('Error auto-shortlisting candidate:', error);
      addToast({
        type: 'error',
        title: 'Shortlisting Failed',
        message: 'Failed to shortlist candidate to the project. Please try again.'
      });
    } finally {
      setShortlistingCandidates(prev => ({ ...prev, [candidate.id]: false }));
    }
  };

  const handleBackToSearch = () => {
    if (fromQuickSearch) {
      // If came from quick search, go back to projects page
      navigate('/dashboard/sourcing/projects');
    } else {
      // Otherwise go back to global search page
      navigate('/dashboard/search', {
        state: {
          query: searchQuery
        }
      });
    }
  };

  const handleShortlistCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowProjectModal(true);
  };

  const handleProjectSelected = async (projectId: string) => {
    if (!selectedCandidate) return;

    try {
      setShortlistingCandidates(prev => ({ ...prev, [selectedCandidate.id]: true }));

      // Determine if this is an external source candidate
      const isExternalSourceCandidate = searchMode === 'external' || (searchMode === 'combined' && selectedCandidate.source === 'coresignal') || selectedCandidate.coreSignalId;
      let candidateIdForProspects = selectedCandidate.id;

      // Step 1: If external source candidate, save to database first
      if (isExternalSourceCandidate && (selectedCandidate.coreSignalId || selectedCandidate.id)) {
        try {
          const coreSignalId = selectedCandidate.coreSignalId || selectedCandidate.id;
          const shortlistResult = await shortlistExternalMutation.mutateAsync({
            coreSignalId: coreSignalId,
            candidateData: selectedCandidate,
            createdBy: user?.id || ''
          });

          // Extract candidate ID regardless of success status (for existing candidates)
          candidateIdForProspects = shortlistResult.candidateId || shortlistResult.existingCandidateId || selectedCandidate.id;

          if (shortlistResult.success) {
            addToast({
              type: 'success',
              title: 'Candidate Saved',
              message: shortlistResult.message,
              duration: 3000
            });
          } else if (shortlistResult.existingCandidateId) {
            // Candidate already exists, show info message
            addToast({
              type: 'info',
              title: 'Candidate Already Exists', 
              message: shortlistResult.message,
              duration: 3000
            });
          } else {
            // Other error
            throw new Error(shortlistResult.message);
          }
        } catch (shortlistError) {
          console.error('Error saving external candidate:', shortlistError);
          addToast({
            type: 'error',
            title: 'Failed to Save Candidate',
            message: shortlistError instanceof Error ? shortlistError.message : 'Failed to save candidate to database. Please try again.',
            duration: 7000
          });
          return; // Exit early if we can't save the candidate
        }
      }

      // Step 2: Add candidate to the selected project
      try {
        await addProspectsToProjectMutation.mutateAsync({
          projectId,
          candidateIds: [candidateIdForProspects],
          searchId: undefined // No search ID for global search
        });

        addToast({
          type: 'success',
          title: 'Candidate Shortlisted',
          message: `${selectedCandidate.fullName || 'Candidate'} has been ${isExternalSourceCandidate ? 'saved to your database and ' : ''}added to the project successfully.`
        });

        setShowProjectModal(false);
        setSelectedCandidate(null);
        
      } catch (prospectError: any) {
        // Handle duplicate shortlisting specifically
        if (prospectError?.response?.status === 409 || prospectError?.message?.includes('already exist as prospects')) {
          addToast({
            type: 'info',
            title: 'Already Shortlisted',
            message: `${selectedCandidate.fullName || 'Candidate'} is already shortlisted for this project.`,
            duration: 5000
          });
          setShowProjectModal(false);
          setSelectedCandidate(null);
        } else {
          console.error('Error adding candidate to prospects:', prospectError);
          addToast({
            type: 'error',
            title: 'Shortlisting Failed',
            message: 'Failed to shortlist candidate to the project. Please try again.',
            duration: 7000
          });
        }
        return;
      }
    } finally {
      setShortlistingCandidates(prev => ({ ...prev, [selectedCandidate.id]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <> {/* Added React.Fragment to wrap main content and panel */}
      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${
        panelState === 'expanded' ? 'mr-[66.666667%] overflow-hidden' : 
        panelState === 'collapsed' ? 'mr-[33.333333%] overflow-hidden' : 
        ''
      }`}>
        <div className="container mx-auto px-6 py-4">
          {/* Header */}
        <div className="flex items-center justify-between py-6 mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToSearch}
              className="inline-flex items-center px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {fromQuickSearch ? 'Back to Projects' : 'Back to Search'}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Global Search Results</h1>
              <p className="text-gray-600">
                Found {results.length} candidates for "{searchQuery}"
              </p>
            </div>
          </div>
        </div>

        {/* Project Requirement Notice */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-800 mb-1">Project Required for Shortlisting</h4>
              <p className="text-sm text-amber-700">
                To shortlist candidates, you'll need to create or select a sourcing project. This helps organize your prospects and manage your recruitment pipeline.
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {results.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search query or filters to find more candidates.
              </p>
              <button
                onClick={handleBackToSearch}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Modify Search
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {results.map((result, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-medium text-lg">
                            {result.candidate?.fullName?.charAt(0) || result.fullName?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 
                            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
                            onClick={() => {
                              const userData = convertCandidateToUserData(result);
                              handleOpenProfilePanel(userData, result.candidate?.id || result.id);
                            }}
                          >
                            {result.candidate?.fullName || result.fullName || 'Unknown'}
                          </h3>
                          <p className="text-gray-600">
                            {result.candidate?.currentPosition || result.currentPosition || 'Position not specified'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Location:</span>
                          <div>{result.candidate?.location || result.location || 'Not specified'}</div>
                        </div>
                        <div>
                          <span className="font-medium">Experience:</span>
                          <div>{result.candidate?.yearsOfExperience || result.yearsOfExperience || 'Not specified'} years</div>
                        </div>
                        <div>
                          <span className="font-medium">Company:</span>
                          <div>{result.candidate?.currentCompany || result.currentCompany || 'Not specified'}</div>
                        </div>
                        <div>
                          <span className="font-medium">Skills:</span>
                          <div className="truncate">
                            {result.candidate?.skills?.slice(0, 3).join(', ') || result.skills?.slice(0, 3).join(', ') || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleShortlistCandidate(result.candidate || result)}
                        disabled={shortlistingCandidates[result.candidate?.id || result.id]}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                      >
                        {shortlistingCandidates[result.candidate?.id || result.id] ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Shortlisting...
                          </>
                        ) : (
                          'Shortlist'
                        )}
                      </button>
                      <button 
                        onClick={() => {
                          const userData = convertCandidateToUserData(result);
                          handleOpenProfilePanel(userData, result.candidate?.id || result.id);
                        }}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div> {/* Close main container with panel state classes */}
      
      {/* Side Panel and Overlay */}
      {panelState !== 'closed' && (
        <>
          {/* Overlay */}
          {panelState === 'expanded' && (
            <div className="fixed inset-0 bg-black bg-opacity-25 z-40"></div>
          )}
          {/* Panel */}
          <SourcingProfileSidePanel
            userData={selectedUserDataForPanel}
            panelState={panelState}
            onStateChange={handlePanelStateChange}
            candidateId={selectedCandidateId || undefined}
            projectId={undefined} // No project context in global search
          />
        </>
      )}

      {/* Project Selection Modal */}
      <ProjectSelectionModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setSelectedCandidate(null);
        }}
        candidate={selectedCandidate}
        onProjectSelected={handleProjectSelected}
        searchState={{
          query: searchQuery,
          filters: filters,
          searchMode: searchMode,
          isGlobalSearch: true,
          fromQuickSearch: fromQuickSearch
        }}
      />
    </>
  );
};

export default GlobalSearchResultsPage;
