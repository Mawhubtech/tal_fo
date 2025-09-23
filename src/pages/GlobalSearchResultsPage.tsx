import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Eye, Plus, Loader2, CheckCircle, MapPin, Building, Code, Search, Sparkles } from 'lucide-react';
import { useSearch, useExternalSourceSearch, useCombinedSearch } from '../hooks/useSearch';
import { useAddProspectsToProject } from '../hooks/useSourcingProjects';
import { useShortlistExternalCandidate } from '../hooks/useShortlistExternal';
import { useAuthContext } from '../contexts/AuthContext';
import type { SearchFilters } from '../services/searchService';
import { searchEnhanced, searchCandidatesExternalDirect } from '../services/searchService';
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
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isBooleanSearch, setIsBooleanSearch] = useState(false);
  const [criticalRequirements, setCriticalRequirements] = useState<any>(null);
  const [preferredCriteria, setPreferredCriteria] = useState<any>(null);
  const [contextualHints, setContextualHints] = useState<any>(null);
  const [shortlistingCandidates, setShortlistingCandidates] = useState<{ [key: string]: boolean }>({});
  
  // Pagination state
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Track active shortlist calls to prevent duplicates (use ref to avoid React state delays)
  const activeShortlistCallsRef = useRef<Set<string>>(new Set());
  
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
    console.log('GlobalSearchResults: Loading with state:', location.state);
    
    if (location.state) {
      const { 
        query, 
        filters, 
        searchMode: stateSearchMode, 
        isGlobalSearch, 
        fromQuickSearch,
        isEnhanced,
        isBooleanSearch,
        criticalRequirements,
        preferredCriteria,
        contextualHints,
        newProjectId,
        candidateToShortlist,
        shouldAutoShortlist,
        preloadedResults
      } = location.state;
      
      setSearchQuery(query || '');
      setFilters(filters || {});
      setSearchMode(stateSearchMode || 'external');
      setFromQuickSearch(!!fromQuickSearch);
      setIsEnhanced(!!isEnhanced);
      setIsBooleanSearch(!!isBooleanSearch);
      setCriticalRequirements(criticalRequirements || null);
      setPreferredCriteria(preferredCriteria || null);
      setContextualHints(contextualHints || null);
      
      if (isGlobalSearch && (query || preloadedResults)) {
        console.log('GlobalSearchResults: Executing search for:', query || 'filter search');
        // Reset pagination state for new search
        setCurrentCursor(undefined);
        setNextCursor(undefined);
        setHasNextPage(false);
        setCurrentPage(1);
        
        // If we have preloaded results from QuickSearch, use them directly
        if (preloadedResults) {
          console.log('GlobalSearchResults: Using preloaded results:', preloadedResults);
          console.log('GlobalSearchResults: Preloaded results type:', typeof preloadedResults);
          console.log('GlobalSearchResults: Preloaded results.results:', preloadedResults.results);
          console.log('GlobalSearchResults: Preloaded results.results length:', preloadedResults.results?.length || 0);
          
          const resultsToSet = preloadedResults.results || [];
          console.log('GlobalSearchResults: Setting results array:', resultsToSet);
          setResults(resultsToSet);
          setIsLoading(false);
          
          // Set pagination info if available
          if (preloadedResults.externalPagination) {
            setNextCursor(preloadedResults.externalPagination.nextCursor);
            setHasNextPage(preloadedResults.externalPagination.hasNextPage);
            setCurrentPage(preloadedResults.externalPagination.currentPage || 1);
          } else if (preloadedResults && typeof preloadedResults.page === 'number' && typeof preloadedResults.totalPages === 'number') {
            // Handle standard pagination format from external direct search
            const currentPageNum = preloadedResults.page || 1;
            const totalPagesNum = preloadedResults.totalPages || 1;
            const hasMorePages = currentPageNum < totalPagesNum;
            console.log('GlobalSearchResults: Preloaded standard pagination - page:', currentPageNum, 'of', totalPagesNum, 'hasMore:', hasMorePages);
            setHasNextPage(hasMorePages);
            setNextCursor(hasMorePages ? (currentPageNum + 1).toString() : undefined);
            setCurrentPage(currentPageNum);
            console.log('GlobalSearchResults: Preloaded set hasNextPage:', hasMorePages, 'nextCursor:', hasMorePages ? (currentPageNum + 1).toString() : undefined);
          }
        } else if (query) {
          // Only fetch results if we have a query and no preloaded results
          fetchResults(filters || {}, query, stateSearchMode || 'external', !!isEnhanced, undefined, true);
        }
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
      console.log('GlobalSearchResults: No state found, redirecting to search');
      // Navigate back to global search if no state
      navigate('/dashboard/search');
    }
  }, [location.state, navigate]);

  // Cleanup active shortlist calls on unmount
  useEffect(() => {
    return () => {
      activeShortlistCallsRef.current.clear();
    };
  }, []);

  const fetchResults = async (
    filters: SearchFilters, 
    query?: string, 
    mode?: 'database' | 'external' | 'combined', 
    useEnhanced?: boolean,
    cursor?: string,
    resetResults?: boolean
  ) => {
    console.log('GlobalSearchResults: Fetching results for:', { query, mode, enhanced: useEnhanced, cursor, reset: resetResults });
    
    if (resetResults) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const searchMode = mode || 'database';
      let searchResults: any;
      
      // For external or combined search, try enhanced search first if available
      if (useEnhanced && (searchMode === 'external' || searchMode === 'combined') && query) {
        try {
          console.log('GlobalSearchResults: Using enhanced search...');
          searchResults = await searchEnhanced(query, searchMode === 'external' || searchMode === 'combined', { page: 1, limit: 10 });
        } catch (enhancedError) {
          console.warn('GlobalSearchResults: Enhanced search failed, using fallback:', enhancedError);
          // Fallback to standard search methods
          useEnhanced = false;
        }
      }
      
      // If enhanced search wasn't used or failed, use standard search methods
      if (!useEnhanced || !searchResults) {
        console.log('GlobalSearchResults: Using standard search...');
        
        // For external search, prefer our direct external search for richer data
        if (searchMode === 'external') {
          try {
            console.log('GlobalSearchResults: Using direct external search for richer data...');
            // Calculate page number from cursor or use 1 for initial search
            const pageNumber = cursor ? parseInt(cursor) : 1;
            searchResults = await searchCandidatesExternalDirect(filters, query, { 
              page: pageNumber, 
              limit: 10 
            });
          } catch (externalError) {
            console.warn('GlobalSearchResults: Direct external search failed, using hook fallback:', externalError);
            // Fallback to the existing hook method
            const searchParams = {
              filters,
              searchText: query,
              pagination: { page: 1, limit: 10 },
              after: cursor
            };
            searchResults = await executeExternalSourceSearch(searchParams);
          }
        } else {
          // For other search modes, use existing methods
          const searchParams = {
            filters,
            searchText: query,
            pagination: { page: 1, limit: 10 },
            after: cursor
          };
          
          if (searchMode === 'combined') {
            searchResults = await executeCombinedSearch(searchParams, true);
          } else {
            searchResults = await executeSearch(searchParams);
          }
        }
      }
      
      // Handle the response structure from backend
      let newResults: any[] = [];
      if (searchResults && typeof searchResults === 'object') {
        if ('results' in searchResults) {
          newResults = (searchResults as any).results || [];
        } else if ('candidates' in searchResults) {
          newResults = (searchResults as any).candidates || [];
        } else if (Array.isArray(searchResults)) {
          newResults = searchResults;
        }
      } else if (Array.isArray(searchResults)) {
        newResults = searchResults;
      }

      // Handle pagination metadata for external sources
      if (searchResults && searchResults.externalPagination) {
        setNextCursor(searchResults.externalPagination.nextCursor);
        setHasNextPage(searchResults.externalPagination.hasNextPage);
      } else if (searchResults && typeof searchResults.page === 'number' && typeof searchResults.totalPages === 'number') {
        // Handle standard pagination format from external direct search
        const currentPageNum = searchResults.page || 1;
        const totalPagesNum = searchResults.totalPages || 1;
        const hasMorePages = currentPageNum < totalPagesNum;
        console.log('GlobalSearchResults: Standard pagination - page:', currentPageNum, 'of', totalPagesNum, 'hasMore:', hasMorePages);
        setHasNextPage(hasMorePages);
        setNextCursor(hasMorePages ? (currentPageNum + 1).toString() : undefined);
        console.log('GlobalSearchResults: Set hasNextPage:', hasMorePages, 'nextCursor:', hasMorePages ? (currentPageNum + 1).toString() : undefined);
      } else {
        setNextCursor(undefined);
        setHasNextPage(false);
      }

      if (resetResults) {
        // For new search, replace all results
        console.log('GlobalSearchResults: Setting new results:', newResults.length);
        setResults(newResults);
        setCurrentPage(1);
      } else {
        // For pagination, append new results but avoid duplicates
        setResults(prev => {
          const existingIds = new Set(prev.map(r => r.candidate?.id || r.id).filter(Boolean));
          const uniqueNewResults = newResults.filter(r => {
            const id = r.candidate?.id || r.id;
            return id && !existingIds.has(id);
          });
          console.log(`GlobalSearchResults: Appending ${uniqueNewResults.length} new results (${newResults.length - uniqueNewResults.length} duplicates filtered)`);
          return [...prev, ...uniqueNewResults];
        });
        setCurrentPage(prev => prev + 1);
      }

      setCurrentCursor(cursor);
    } catch (error) {
      console.error('GlobalSearchResults: Search failed:', error);
      addToast({
        type: 'error',
        title: 'Search Failed',
        message: 'Failed to fetch search results. Please try again.'
      });
      if (resetResults) {
        setResults([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Handle pagination - load more results
  const handleNextPage = () => {
    if (hasNextPage && nextCursor && !isLoadingMore) {
      console.log('GlobalSearchResults: Loading next page:', nextCursor, 'hasNextPage:', hasNextPage);
      setIsLoadingMore(true);
      fetchResults(filters, searchQuery, searchMode, isEnhanced, nextCursor, false);
    } else {
      console.log('GlobalSearchResults: Cannot load more - hasNextPage:', hasNextPage, 'nextCursor:', nextCursor, 'isLoadingMore:', isLoadingMore);
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
    const callKey = `${candidate.id}-${projectId}`;
    
    // Prevent duplicate calls for the same candidate-project combination
    if (activeShortlistCallsRef.current.has(callKey)) {
      console.log('🚫 AUTO-SHORTLIST BLOCKED: Duplicate call detected for', callKey);
      return;
    }
    
    console.log('🔄 AUTO-SHORTLIST START:', {
      candidateId: candidate.id,
      candidateName: candidate.fullName || candidate.candidateName,
      projectId,
      callKey,
      searchMode,
      coreSignalId: candidate.coreSignalId,
      source: candidate.source
    });
    
    // Mark this call as active
    activeShortlistCallsRef.current.add(callKey);
    
    try {
      setShortlistingCandidates(prev => ({ ...prev, [candidate.id]: true }));

      // Determine if this is an external source candidate
      const isExternalSourceCandidate = searchMode === 'external' || (searchMode === 'combined' && candidate.source === 'coresignal') || candidate.coreSignalId;
      let candidateIdForProspects = candidate.id;

      // Step 1: If external source candidate, save to database first
      if (isExternalSourceCandidate && (candidate.coreSignalId || candidate.id)) {
        console.log('💾 AUTO-SHORTLIST: Saving external candidate to database...');
        try {
          const coreSignalId = candidate.coreSignalId || candidate.id;
          const shortlistResult = await shortlistExternalMutation.mutateAsync({
            coreSignalId: coreSignalId,
            candidateData: candidate,
            createdBy: user?.id || ''
          });

          console.log('💾 AUTO-SHORTLIST: External candidate save result:', shortlistResult);

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
      console.log('📋 AUTO-SHORTLIST: Adding candidate to project prospects...', {
        projectId,
        candidateIdForProspects,
        searchId: undefined
      });
      
      try {
        const prospectResult = await addProspectsToProjectMutation.mutateAsync({
          projectId: projectId,
          candidateIds: [candidateIdForProspects],
          searchId: undefined, // No search ID for auto-shortlisting from project creation
        });
        
        console.log('📋 AUTO-SHORTLIST: Project prospect addition result:', prospectResult);

        addToast({
          type: 'success',
          title: 'Candidate Shortlisted Successfully',
          message: `${candidate.fullName || candidate.candidateName || 'Candidate'} has been ${isExternalSourceCandidate ? 'saved to your database and ' : ''}added to your project!`
        });
        
        console.log('✅ AUTO-SHORTLIST: Successfully completed for candidate:', candidate.id);
        
        // Close the project modal if it was open
        setShowProjectModal(false);
        setSelectedCandidate(null);
        
      } catch (prospectError: any) {
        console.error('❌ AUTO-SHORTLIST: Error adding candidate to prospects:', prospectError);
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
      console.error('❌ AUTO-SHORTLIST: General error during auto-shortlist:', error);
      addToast({
        type: 'error',
        title: 'Shortlisting Failed',
        message: 'Failed to shortlist candidate to the project. Please try again.'
      });
    } finally {
      setShortlistingCandidates(prev => ({ ...prev, [candidate.id]: false }));
      // Remove the call from active calls
      activeShortlistCallsRef.current.delete(callKey);
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
    
    const callKey = `${selectedCandidate.id}-${projectId}`;
    
    // Prevent duplicate calls for the same candidate-project combination
    if (activeShortlistCallsRef.current.has(callKey)) {
      console.log('🚫 MANUAL-SHORTLIST BLOCKED: Duplicate call detected for', callKey);
      return;
    }

    console.log('🔄 MANUAL-SHORTLIST START:', {
      candidateId: selectedCandidate.id,
      candidateName: selectedCandidate.fullName || selectedCandidate.candidateName,
      projectId,
      callKey,
      searchMode,
      coreSignalId: selectedCandidate.coreSignalId,
      source: selectedCandidate.source
    });

    // Mark this call as active
    activeShortlistCallsRef.current.add(callKey);

    try {
      setShortlistingCandidates(prev => ({ ...prev, [selectedCandidate.id]: true }));

      // Determine if this is an external source candidate
      const isExternalSourceCandidate = searchMode === 'external' || (searchMode === 'combined' && selectedCandidate.source === 'coresignal') || selectedCandidate.coreSignalId;
      let candidateIdForProspects = selectedCandidate.id;

      // Step 1: If external source candidate, save to database first
      if (isExternalSourceCandidate && (selectedCandidate.coreSignalId || selectedCandidate.id)) {
        console.log('💾 MANUAL-SHORTLIST: Saving external candidate to database...');
        try {
          const coreSignalId = selectedCandidate.coreSignalId || selectedCandidate.id;
          const shortlistResult = await shortlistExternalMutation.mutateAsync({
            coreSignalId: coreSignalId,
            candidateData: selectedCandidate,
            createdBy: user?.id || ''
          });

          console.log('💾 MANUAL-SHORTLIST: External candidate save result:', shortlistResult);

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
      console.log('📋 MANUAL-SHORTLIST: Adding candidate to project prospects...', {
        projectId,
        candidateIdForProspects,
        searchId: undefined
      });
      
      try {
        const prospectResult = await addProspectsToProjectMutation.mutateAsync({
          projectId,
          candidateIds: [candidateIdForProspects],
          searchId: undefined // No search ID for global search
        });
        
        console.log('📋 MANUAL-SHORTLIST: Project prospect addition result:', prospectResult);

        addToast({
          type: 'success',
          title: 'Candidate Shortlisted',
          message: `${selectedCandidate.fullName || 'Candidate'} has been ${isExternalSourceCandidate ? 'saved to your database and ' : ''}added to the project successfully.`
        });

        console.log('✅ MANUAL-SHORTLIST: Successfully completed for candidate:', selectedCandidate.id);

        setShowProjectModal(false);
        setSelectedCandidate(null);
        
      } catch (prospectError: any) {
        console.error('❌ MANUAL-SHORTLIST: Error adding candidate to prospects:', prospectError);
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
      // Remove the call from active calls
      activeShortlistCallsRef.current.delete(callKey);
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
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-gray-600">
                  Showing {results.length} candidates
                  {searchQuery ? ` for "${searchQuery}"` : ' for your filter criteria'}
                  {hasNextPage && <span className="text-purple-600"> • More results available</span>}
                </p>
                {isBooleanSearch && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Boolean Search
                  </span>
                )}
                {isEnhanced && !isBooleanSearch && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    AI Enhanced
                  </span>
                )}
              </div>
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
              {results.map((result, index) => {
                const { candidate, matchCriteria, matchedCriteria } = result; // Backend returns CandidateMatchDto with candidate property and match criteria
                // Ensure candidate exists
                if (!candidate) {
                    console.warn("Candidate data is missing for result:", result);
                    return null; // Skip rendering this item
                }
                
                // Map backend candidate structure to frontend expected structure
                const personalInfo = {
                  fullName: candidate.fullName || 'Unknown',
                  email: candidate.email || '',
                  location: candidate.location || 'Location not specified',
                  linkedIn: candidate.linkedIn || candidate.linkedinUrl || '',
                  github: candidate.github || '',
                  avatar: candidate.avatar || ''
                };
                
                const experience = candidate.experience || [];
                // Extract skills from skillMappings structure
                const skills = candidate.skillMappings 
                  ? candidate.skillMappings.map(mapping => mapping.skill?.name).filter(Boolean)
                  : (candidate.skills ? candidate.skills.map(skill => skill.name || skill) : []);
                
                return (
                  <div key={candidate.id || index} className={`px-6 py-6 hover:bg-gray-50 transition-colors duration-200 ${index !== results.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-start">
                      <input type="checkbox" className="mt-2 mr-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none" />
                      <div className="flex-1">
                        
                        {/* Header with name and actions */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              {personalInfo.avatar ? (
                                <img
                                  src={personalInfo.avatar}
                                  alt={`${personalInfo.fullName} avatar`}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                  onError={(e) => {
                                    // If image fails to load, hide it and show initials fallback
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              {/* Fallback initials avatar */}
                              <div 
                                className={`w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm ${personalInfo.avatar ? 'hidden' : 'flex'}`}
                                style={{ display: personalInfo.avatar ? 'none' : 'flex' }}
                              >
                                {personalInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                            </div>
                            
                            <h3
                              className="text-lg font-semibold cursor-pointer hover:text-purple-600 transition-colors duration-200 flex items-center gap-2"
                              onClick={() => {
                                const userData = convertCandidateToUserData(result);
                                handleOpenProfilePanel(userData, candidate.id);
                              }}
                            >
                              {personalInfo.fullName}
                              {/* Icon indicates clickable, panel will open */}
                              <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </h3>
                            
                            {/* Social Links */}
                            {personalInfo.linkedIn && (
                                <a href={personalInfo.linkedIn.startsWith('http') ? personalInfo.linkedIn : `https://${personalInfo.linkedIn}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-600 transition-colors duration-200" title="LinkedIn">
                                <span className="sr-only">LinkedIn</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </a>
                            )}
                            {personalInfo.github && (
                                <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-600 transition-colors duration-200" title="GitHub">
                                <span className="sr-only">GitHub</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                </a>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleShortlistCandidate(candidate)}
                              disabled={shortlistingCandidates[candidate.id]}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center gap-2 text-sm"
                            >
                              {shortlistingCandidates[candidate.id] ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Shortlisting...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  Shortlist
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Current Position */}
                        <div className="text-sm text-gray-500 mb-3">
                          {experience && experience.length > 0 && (
                            <p className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {experience[0].position} at {experience[0].company}
                              <span className="mx-1.5">•</span>
                              <MapPin className="h-4 w-4" />
                              {personalInfo.location}
                            </p>
                          )}
                        </div>

                        {/* Match Criteria */}
                        {(matchCriteria || matchedCriteria) && (
                          <div className="mb-3 p-3 bg-purple-100 rounded-lg border border-purple-200">
                            <h4 className="text-sm font-medium text-purple-900 mb-2 flex items-center gap-1">
                              <Search className="h-4 w-4" />
                              Match Criteria
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {matchCriteria?.titleMatch && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                  ✓ Job Title Match
                                </span>
                              )}
                              {matchCriteria?.locationMatch && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                  ✓ Location Match
                                </span>
                              )}
                              {matchCriteria?.skillsMatch && matchCriteria.skillsMatch.length > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                  <Code className="h-3 w-3 mr-1" />
                                  {matchCriteria.skillsMatch.length} Skills: {matchCriteria.skillsMatch.slice(0, 2).join(', ')}
                                  {matchCriteria.skillsMatch.length > 2 && ` +${matchCriteria.skillsMatch.length - 2} more`}
                                </span>
                              )}
                              {matchedCriteria && Array.isArray(matchedCriteria) && matchedCriteria.length > 0 && (
                                <>
                                  {matchedCriteria.slice(0, 3).map((criteria, i) => (
                                    <span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                      ✓ {criteria}
                                    </span>
                                  ))}
                                  {matchedCriteria.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                      +{matchedCriteria.length - 3} more matches
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Experience Summary */}
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span
                              className="font-medium cursor-pointer hover:text-purple-600 transition-colors"
                              onClick={() => {
                                const userData = convertCandidateToUserData(result);
                                handleOpenProfilePanel(userData, candidate.id);
                              }}
                            >
                              {personalInfo.fullName.split(' ')[0]}
                            </span>
                            {experience?.[0]?.company ? ` has been a ${experience[0].position} at ${experience[0].company}` : ' has relevant experience'}
                            {experience?.[0]?.startDate && ` since ${new Date(experience[0].startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                            {experience && experience.length > 1 && experience[1].position && `, with prior experience as a ${experience[1].position}`}.
                          </p>
                        </div>

                        {/* Skills */}
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
              
              {/* Load More Button */}
              {hasNextPage && (
                <div className="flex justify-center py-8 border-t border-gray-200">
                  <button
                    onClick={handleNextPage}
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Load More Results
                      </>
                    )}
                  </button>
                </div>
              )}
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
