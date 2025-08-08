import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Edit, Loader2, CheckCircle, MapPin, Building, Code, Search, Sparkles, ChevronDown, ChevronUp, X } from 'lucide-react';
import Button from '../../../components/Button';
import FilterDialog from '../../../components/FilterDialog';
import { useSearch } from '../../../hooks/useSearch';
import { useCoreSignalSearch, useCombinedSearch } from '../../../hooks/useSearch';
import { useCandidateSummary } from '../../../hooks/useCandidateSummary';
import { useActivePipelines } from '../../../hooks/useActivePipelines';
import { useProjectProspects, useAddProspectsToProject } from '../../../hooks/useSourcingProspects';
import { useProject } from '../../../hooks/useSourcingProjects';
import { useShortlistCoreSignalCandidate } from '../../../hooks/useShortlistCoreSignal';
import { useToast } from '../../../contexts/ToastContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useMyCompanies } from '../../../hooks/useCompany';
import type { SearchFilters } from '../../../services/searchService';
import type { AddProspectsToProjectDto } from '../../../services/sourcingApiService';

// Assuming ProfilePage.tsx and its types are in the same directory or adjust path
import type { UserStructuredData } from '../../../components/ProfileSidePanel';
import SourcingProfileSidePanel, { type PanelState } from '../../outreach/components/SourcingProfileSidePanel'; // Import the PanelState type

// Component for displaying search query with markdown support and expandable functionality
const SearchQueryDisplay: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!searchQuery) return null;
  
  // Check if the query contains markdown formatting (basic check)
  const hasMarkdown = /[*_#`\[\]()>-]/g.test(searchQuery) || searchQuery.includes('**') || searchQuery.includes('*') || searchQuery.includes('#');
  
  // Function to truncate text to approximately 2 lines (about 100 characters for better line height)
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
  };
  
  if (!hasMarkdown) {
    // Display as regular text if no markdown detected
    const displayText = isExpanded ? searchQuery : truncateText(searchQuery);
    const needsExpansion = searchQuery.length > 100;
    
    return (
      <div className="w-full px-4 py-3 rounded-lg bg-purple-100 text-sm text-purple-700 border border-purple-200">
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-3">
            <span className="font-medium">Search Query:</span> 
            <div className={`font-semibold ml-1 ${!isExpanded && needsExpansion ? 'overflow-hidden' : ''}`} 
                 style={!isExpanded && needsExpansion ? {
                   display: '-webkit-box',
                   WebkitLineClamp: 2,
                   WebkitBoxOrient: 'vertical' as const,
                   lineHeight: '1.5em',
                   maxHeight: '3em'
                 } : {}}>
              {displayText}
            </div>
          </div>
          {needsExpansion && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-xs whitespace-nowrap mt-0.5"
            >
              {isExpanded ? (
                <>
                  <span>Show less</span>
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  <span>Read more</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Display as markdown if markdown formatting is detected
  const displayContent = isExpanded ? searchQuery : truncateText(searchQuery);
  const needsExpansion = searchQuery.length > 100;
  
  return (
    <div className="w-full px-4 py-3 rounded-lg bg-purple-100 border border-purple-200">
      <div className="flex items-start justify-between mb-2">
        <span className="font-medium text-purple-700 text-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Enhanced Search Query:
        </span>
        {needsExpansion && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-xs whitespace-nowrap"
          >
            {isExpanded ? (
              <>
                Show less
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Read more
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>
      <div className={`prose prose-sm prose-purple max-w-none text-purple-800 ${!isExpanded && needsExpansion ? 'overflow-hidden' : ''}`}
           style={!isExpanded && needsExpansion ? {
             display: '-webkit-box',
             WebkitLineClamp: 2,
             WebkitBoxOrient: 'vertical' as const,
             lineHeight: '1.5em',
             maxHeight: '3em'
           } : {}}>
        <ReactMarkdown 
          components={{
            p: ({ children }) => <p className="mb-1 last:mb-0 text-sm leading-relaxed">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-purple-900">{children}</strong>,
            em: ({ children }) => <em className="italic text-purple-700">{children}</em>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-1 space-y-0.5">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-1 space-y-0.5">{children}</ol>,
            li: ({ children }) => <li className="text-sm">{children}</li>,
            code: ({ children }) => (
              <code className="bg-purple-200 text-purple-900 px-1 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            ),
            h1: ({ children }) => <h1 className="text-base font-semibold text-purple-900 mb-1">{children}</h1>,
            h2: ({ children }) => <h2 className="text-sm font-medium text-purple-900 mb-1">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-medium text-purple-900 mb-1">{children}</h3>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-purple-300 pl-2 italic text-purple-700 mb-1 text-sm">
                {children}
              </blockquote>
            ),
          }}
        >
          {displayContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

const SearchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const [results, setResults] = useState<any[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchId, setSearchId] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'database' | 'coresignal' | 'combined'>('database');
  const [prospectsAddedCount, setProspectsAddedCount] = useState<number>(0);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [candidateSummaries, setCandidateSummaries] = useState<{ [key: string]: any }>({});
  const [shortlistingCandidates, setShortlistingCandidates] = useState<{ [key: string]: boolean }>({});
  const [shortlistedCandidates, setShortlistedCandidates] = useState<{ [key: string]: boolean }>({});
  const [showStageSelector, setShowStageSelector] = useState<{ [key: string]: boolean }>({});
  const [selectedStageId, setSelectedStageId] = useState<{ [key: string]: string }>({});
  
  // Pagination state
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Calculate overall loading state
  // Get current user context
  const { user } = useAuthContext();
  
  // Use hooks
  const { executeSearch, isLoading, error, data } = useSearch();
  const { executeSearch: executeCoreSignalSearch, isLoading: isCoreSignalLoading } = useCoreSignalSearch();
  const { executeSearch: executeCombinedSearch, isLoading: isCombinedLoading } = useCombinedSearch();
  const { generateSummary, isLoading: summaryLoading } = useCandidateSummary();
  const { data: sourcingPipelines, isLoading: pipelinesLoading } = useActivePipelines('sourcing');
  const { data: existingProspects } = useProjectProspects(projectId!);
  const { data: projectData, isLoading: projectLoading } = useProject(projectId || '', !!projectId);
  const { data: myCompanies } = useMyCompanies();
  const { addToast } = useToast();
  const addProspectsToProjectMutation = useAddProspectsToProject();
  const shortlistCoreSignalMutation = useShortlistCoreSignalCandidate();
  
  // Calculate overall loading state
  const isSearchLoading = isLoading || isCoreSignalLoading || isCombinedLoading;
  
  // State for the profile side panel
  const [selectedUserDataForPanel, setSelectedUserDataForPanel] = useState<UserStructuredData | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [panelState, setPanelState] = useState<PanelState>('closed');

  // Determine which pipeline to use (similar to CandidateProspectsManager)
  const pipelineToUse = projectData?.pipeline || sourcingPipelines?.find(p => p.isDefault) || sourcingPipelines?.[0];
  const availableStages = pipelineToUse?.stages?.sort((a, b) => a.order - b.order) || [];
  
  // Determine if stages start from 0 or 1 to display human-readable numbers
  const minOrder = availableStages.length > 0 ? Math.min(...availableStages.map(s => s.order)) : 0;
  const orderOffset = minOrder === 0 ? 1 : 0;

  // Redirect to projects page if no projectId (global search no longer supported)
  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard/sourcing/projects', { replace: true });
      return;
    }
  }, [projectId, navigate]);

  useEffect(() => {
    if (location.state) {
      const { query, filters, searchId: stateSearchId, searchMode: stateSearchMode } = location.state;
      setSearchQuery(query || '');
      setFilters(filters || {});
      setSearchId(stateSearchId || null);
      setSearchMode(stateSearchMode || 'database');
      fetchResults(filters, query, stateSearchMode || 'database');
    } else {
      // Navigate back to project searches if no state
      navigate(`/dashboard/sourcing/projects/${projectId}/searches`);
    }
  }, [location.state, navigate, projectId]);

  // Check for existing prospects and mark candidates as shortlisted
  useEffect(() => {
    if (existingProspects && results.length > 0) {
      const shortlistedCandidateIds = new Set(
        existingProspects.map(prospect => prospect.candidateId)
      );
      
      const shortlistedStatus: { [key: string]: boolean } = {};
      results.forEach(result => {
        if (result.candidate && shortlistedCandidateIds.has(result.candidate.id)) {
          shortlistedStatus[result.candidate.id] = true;
        }
      });
      
      setShortlistedCandidates(prev => ({ ...prev, ...shortlistedStatus }));
    }
  }, [existingProspects, results]);

  // COMPLETELY DISABLED: Search completion functionality
  // This was causing persistent 403 errors because the backend has strict state management
  // for search completion that doesn't align with frontend usage patterns.
  // The search completion was primarily for analytics/tracking, and all core functionality
  // (search execution, results display, shortlisting) works without it.
  
  /*
  // Track if search has been completed to prevent infinite loop
  const [hasCompletedSearch, setHasCompletedSearch] = useState(false);
  // Track if we should skip completion attempts (due to previous errors)
  const [skipCompletion, setSkipCompletion] = useState(false);

  // Complete the search on backend when results are loaded
  useEffect(() => {
    if (searchId && results.length > 0 && !isLoading && !hasCompletedSearch && !skipCompletion) {
      // Only complete the search once when we have results
      const completeSearch = async () => {
        try {
          await completeSearchMutation.mutateAsync({
            id: searchId,
            results: {
              resultsCount: results.length,
              prospectsAdded: 0, // Initial completion always has 0 prospects
              resultsMetadata: {
                searchQuery,
                filters,
                timestamp: new Date().toISOString(),
                hasResults: results.length > 0
              }
            }
          });
          console.log('Search completed successfully on backend');
          setHasCompletedSearch(true);
        } catch (error) {
          console.error('Error completing search on backend:', error);
          
          // Check if the search is already completed or in wrong state
          if (error instanceof Error && error.message.includes('Search must be running to be completed')) {
            console.log('Search was already completed, marking as completed locally and skipping future attempts');
            setHasCompletedSearch(true);
            setSkipCompletion(true);
          } else if ((error as any)?.response?.data?.message?.includes('Search must be running to be completed')) {
            console.log('Search was already completed (via response), marking as completed locally and skipping future attempts');
            setHasCompletedSearch(true);
            setSkipCompletion(true);
          } else if ((error as any)?.response?.status === 403) {
            // Any 403 error likely means the search is already completed or in wrong state
            console.log('Search completion failed with 403, marking as completed locally and skipping future attempts');
            setHasCompletedSearch(true);
            setSkipCompletion(true);
          }
          // Don't show error to user as this is background tracking
        }
      };

      completeSearch();
    }
  }, [searchId, results.length, isLoading, hasCompletedSearch, skipCompletion]);
  */

  // Update search record when prospects are added (separate from initial completion)
  // DISABLED: This was causing 403 errors when trying to update already completed searches
  // The backend doesn't allow updating search records once they're completed
  // Initial completion is sufficient for tracking purposes
  /*
  useEffect(() => {
    if (searchId && hasCompletedSearch && prospectsAddedCount > 0) {
      const updateSearchRecord = async () => {
        try {
          await completeSearchMutation.mutateAsync({
            id: searchId,
            results: {
              resultsCount: results.length,
              prospectsAdded: prospectsAddedCount,
              resultsMetadata: {
                searchQuery,
                filters,
                timestamp: new Date().toISOString(),
                hasResults: results.length > 0,
                lastProspectAdded: new Date().toISOString()
              }
            }
          });
          console.log('Search record updated with prospect count:', prospectsAddedCount);
        } catch (error) {
          console.error('Error updating search record:', error);
          
          // If search is already completed or in wrong state, just log and continue
          if (error instanceof Error && error.message.includes('Search must be running to be completed')) {
            console.log('Search completion failed - search already in final state');
          } else if ((error as any)?.response?.data?.message?.includes('Search must be running to be completed')) {
            console.log('Search completion failed - search already in final state (via response)');
          }
          // Don't show error to user as this is background tracking
        }
      };

      updateSearchRecord();
    }
  }, [prospectsAddedCount]); // Only depend on prospectsAddedCount
  */

  const fetchResults = async (filters: SearchFilters, query?: string, mode?: 'database' | 'coresignal' | 'combined', cursor?: string, resetResults: boolean = true) => {
    try {
      const searchParams = {
        filters,
        searchText: query,
        pagination: { page: 1, limit: 20 },
        after: cursor
      };
      
      const searchMode = mode || 'database';
      let searchResults: any;
      
      // Execute search based on mode
      if (searchMode === 'coresignal') {
        searchResults = await executeCoreSignalSearch(searchParams);
      } else if (searchMode === 'combined') {
        searchResults = await executeCombinedSearch(searchParams, true);
      } else {
        searchResults = await executeSearch(searchParams);
      }
      
      console.log('Search results:', searchResults); // Debug log
      console.log('Search results type:', typeof searchResults);
      console.log('Search results keys:', searchResults ? Object.keys(searchResults) : 'null');
      if (searchResults && searchResults.externalPagination) {
        console.log('External pagination:', searchResults.externalPagination);
      }
      
      // Handle the response structure from backend
      let newResults: any[] = [];
      if (searchResults && typeof searchResults === 'object' && 'results' in searchResults) {
        newResults = (searchResults as any).results || [];
      } else if (Array.isArray(searchResults)) {
        newResults = searchResults;
      }

      // Handle pagination metadata for external sources
      if (searchResults && searchResults.externalPagination) {
        setNextCursor(searchResults.externalPagination.nextCursor);
        setHasNextPage(searchResults.externalPagination.hasNextPage);
        if (searchResults.externalPagination.totalResults) {
          setTotalResults(searchResults.externalPagination.totalResults);
        }
      } else {
        // Reset external pagination state for non-external searches
        setNextCursor(undefined);
        setHasNextPage(false);
        if (searchResults && searchResults.pagination && searchResults.pagination.totalResults) {
          setTotalResults(searchResults.pagination.totalResults);
        }
      }

      // Update results - either replace or append based on resetResults
      if (resetResults) {
        setResults(newResults);
        setCurrentPage(1);
      } else {
        setResults(prev => [...prev, ...newResults]);
        setCurrentPage(prev => prev + 1);
      }
      
      setCurrentCursor(cursor);
    } catch (error) {
      console.error('Error fetching search results:', error);
      if (resetResults) {
        setResults([]);
      }
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (hasNextPage && nextCursor) {
      fetchResults(filters, searchQuery, searchMode, nextCursor, false);
    }
  };

  const handleRefresh = () => {
    // Reset pagination state and fetch first page
    setCurrentCursor(undefined);
    setNextCursor(undefined);
    setHasNextPage(false);
    setCurrentPage(1);
    fetchResults(filters, searchQuery, searchMode, undefined, true);
  };

  const handleSummarize = async (candidateId: string) => {
    try {
      const summary = await generateSummary(candidateId);
      setCandidateSummaries(prev => ({
        ...prev,
        [candidateId]: summary
      }));
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const handleBackToSearchForm = () => {
    // Navigate to project searches
    const searchPath = `/dashboard/sourcing/projects/${projectId}/searches`;
    
    navigate(searchPath, {
      state: {
        editFilters: filters,
        query: searchQuery
      }
    });
  };

  const handleEditFilters = () => {
    setIsFilterDialogOpen(true);
  };

  const handleApplyFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setIsFilterDialogOpen(false);
    // Perform new search with updated filters using current search mode
    fetchResults(newFilters, searchQuery, searchMode);
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

  // Handle showing stage selector for a specific candidate
  const handleShowStageSelector = (candidateId: string) => {
    if (!pipelineToUse) {
      addToast({
        type: 'error',
        title: 'No Pipeline Available',
        message: 'No sourcing pipeline is available. Please create a sourcing pipeline first.',
        duration: 7000
      });
      return;
    }

    if (availableStages.length === 0) {
      addToast({
        type: 'error',
        title: 'No Stages Available',
        message: 'The sourcing pipeline has no stages configured.',
        duration: 7000
      });
      return;
    }

    setShowStageSelector(prev => ({ ...prev, [candidateId]: true }));
    setSelectedStageId(prev => ({ ...prev, [candidateId]: availableStages[0]?.id || '' })); // Default to first stage
  };

  // Handle closing stage selector for a specific candidate
  const handleCloseStageSelector = (candidateId: string) => {
    setShowStageSelector(prev => ({ ...prev, [candidateId]: false }));
    setSelectedStageId(prev => ({ ...prev, [candidateId]: '' }));
  };

  const handleShortlist = async (candidate: any, teamId?: string, stageId?: string) => {
    try {
      // Start shortlisting process
      setShortlistingCandidates(prev => ({ ...prev, [candidate.id]: true }));

      // Determine if this is a CoreSignal candidate
      const isCoreSignalCandidate = searchMode === 'coresignal' || (searchMode === 'combined' && candidate.source === 'coresignal') || candidate.coreSignalId;
      let candidateIdForProspects = candidate.id;

      // Step 1: If CoreSignal candidate, save to database first
      if (isCoreSignalCandidate && (candidate.coreSignalId || candidate.id)) {
        try {
          const coreSignalId = candidate.coreSignalId || candidate.id;
          const shortlistResult = await shortlistCoreSignalMutation.mutateAsync({
            coreSignalId: coreSignalId,
            candidateData: candidate,
            createdBy: user?.id || ''
          });

          if (shortlistResult.success) {
            // Use the returned candidate ID for adding to prospects
            candidateIdForProspects = shortlistResult.candidateId || shortlistResult.existingCandidateId || candidate.id;
            
            addToast({
              type: 'success',
              title: 'Candidate Saved',
              message: shortlistResult.message,
              duration: 3000
            });
          }
        } catch (shortlistError) {
          console.error('Error saving CoreSignal candidate:', shortlistError);
          addToast({
            type: 'error',
            title: 'Failed to Save Candidate',
            message: shortlistError instanceof Error ? shortlistError.message : 'Failed to save candidate to database. Please try again.',
            duration: 5000
          });
          // Don't continue with prospects addition if candidate save failed
          return;
        }
      }

      // Step 2: Add candidate to sourcing project/prospects
      // Get the default sourcing pipeline
      if (!sourcingPipelines || sourcingPipelines.length === 0) {
        throw new Error('No sourcing pipelines available. Please create a sourcing pipeline first.');
      }

      // Find the default sourcing pipeline (should be first due to sorting in useActivePipelines)
      const defaultPipeline = sourcingPipelines.find(p => p.isDefault) || sourcingPipelines[0];
      
      if (!defaultPipeline.stages || defaultPipeline.stages.length === 0) {
        throw new Error('The sourcing pipeline has no stages configured.');
      }

      // Create the prospects data using the bulk addition endpoint
      const prospectsData: AddProspectsToProjectDto = {
        candidateIds: [candidateIdForProspects],
        searchId: searchId || undefined,
        stageId: stageId // Pass the selected stage ID if provided
      };

      // Add the prospects to the project
      await addProspectsToProjectMutation.mutateAsync({
        projectId: projectId!,
        data: prospectsData
      });

      // Update prospects added count
      const newProspectsCount = prospectsAddedCount + 1;
      setProspectsAddedCount(newProspectsCount);

      // Mark candidate as shortlisted
      setShortlistedCandidates(prev => ({ ...prev, [candidate.id]: true }));

      // Close stage selector if it was open
      handleCloseStageSelector(candidate.id);

      // Show success feedback
      const selectedStage = stageId ? availableStages.find(stage => stage.id === stageId) : availableStages[0];
      const pipelineName = pipelineToUse?.name || defaultPipeline.name;
      
      addToast({
        type: 'success',
        title: 'Candidate Shortlisted Successfully',
        message: `${candidate.fullName} has been ${isCoreSignalCandidate ? 'saved to your database and ' : ''}added to the ${pipelineName} pipeline${selectedStage ? ` in ${selectedStage.name} stage` : ''}`,
        duration: 5000
      });
      
    } catch (error) {
      console.error('Error shortlisting candidate:', error);
      // Show error toast
      addToast({
        type: 'error',
        title: 'Shortlisting Failed',
        message: error instanceof Error ? error.message : 'Failed to shortlist candidate. Please try again.',
        duration: 7000
      });
    } finally {
      // Stop shortlisting process
      setShortlistingCandidates(prev => ({ ...prev, [candidate.id]: false }));
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown-container]')) {
        setShowStageSelector({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <> {/* Added React.Fragment to wrap main content and panel */}
      <div className={`container mx-auto px-6 py-4 max-w-full bg-gray-50 min-h-screen transition-all duration-300 ${
        panelState === 'expanded' ? 'mr-[66.666667%] overflow-hidden' : 
        panelState === 'collapsed' ? 'mr-[33.333333%] overflow-hidden' : 
        ''
      }`}>
        {/* Header with back button */}
        <div className="flex items-center justify-between py-6 mb-4">
          <Button
            className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700"
            onClick={handleBackToSearchForm} // Changed from handleBack
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Button>          <div className="flex items-center gap-3">
            <Button
              className="text-sm bg-purple-600 text-white hover:bg-purple-700"
              onClick={() => {
                // Navigate to project searches
                const searchPath = `/dashboard/sourcing/projects/${projectId}/searches`;
                navigate(searchPath);
              }}
            >
              New Search
            </Button>
          </div>
        </div>        {/* Search Filters Header */}
        <div className="bg-white shadow-sm rounded-xl p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Search Query & Filters</h1>
            </div>
            <button
              className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200"
              onClick={handleEditFilters}
              title="Edit Filters"
            >
              <Edit className="h-4 w-4" />
              <span className="text-sm font-medium">Edit Filters</span>
            </button>
          </div>
          <div className="space-y-3">
             {searchQuery && (
                <SearchQueryDisplay searchQuery={searchQuery} />
             )}
             
             {/* Search Mode Indicator */}
             <div className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-50 text-sm text-blue-700 border border-blue-200">
               <span className="font-medium">Search Mode:</span>
               <span className="font-semibold ml-1 capitalize">
                 {searchMode === 'coresignal' ? 'CoreSignal' : searchMode === 'combined' ? 'Combined' : 'Database'}
               </span>
               {searchMode === 'coresignal' && <span className="ml-1 text-xs">(External candidates)</span>}
               {searchMode === 'combined' && <span className="ml-1 text-xs">(Database + External)</span>}
               {searchMode === 'database' && <span className="ml-1 text-xs">(Existing candidates)</span>}
             </div>
             
             <div className="flex items-center gap-3 flex-wrap">
            {Object.entries(filters).map(([key, value]) => (
              value && (typeof value === 'string' || typeof value === 'number') && (
                <div key={key} className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-700 border border-gray-200">
                  <span className="font-medium">{`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:`}</span>
                  <span className="font-semibold ml-1">{String(value)}</span>
                </div>
              )
            ))}
            <button
              className="text-sm text-purple-600 hover:text-purple-700 font-medium ml-auto underline transition-colors duration-200"
              onClick={handleEditFilters}
            >
              Edit Filters
            </button>
            </div>
          </div>
        </div>        {/* All Profiles Header */}
        <div className="bg-white shadow-sm rounded-xl mb-6 border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-100 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  All Profiles ({results.length})
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 font-medium">
                  {searchMode === 'coresignal' || searchMode === 'combined' ? (
                    totalResults > 0 ? `Showing ${results.length} of ${totalResults} results` : '0 results'
                  ) : (
                    results.length > 0 ? `Showing 1-${results.length > 15 ? 15 : results.length} of ${results.length}` : '0 results'
                  )}
                </span>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button 
                    className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                    title="Refresh Results"
                    onClick={handleRefresh}
                    disabled={isSearchLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button 
                    className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l border-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                    title="Load More Results"
                    onClick={handleNextPage}
                    disabled={!hasNextPage || isSearchLoading}
                  >
                    {isSearchLoading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>          {isSearchLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
              <p className="mt-6 text-gray-600 font-medium">Searching candidates...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-900 mb-3">No candidates found</p>
              <p className="text-gray-600 max-w-md mx-auto">
                Try adjusting your search criteria or filters to find more candidates.
              </p>
            </div>
          ) : (
            <div>
              {results.map((result, index) => {
                const { candidate, score, matchCriteria } = result; // Backend returns CandidateMatchDto with candidate property and match criteria
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
                  linkedIn: candidate.linkedIn || '',
                  github: candidate.github || '',
                  avatar: candidate.avatar || ''
                };
                
                const experience = candidate.experience || [];
                // Extract skills from skillMappings structure
                const skills = candidate.skillMappings 
                  ? candidate.skillMappings.map(mapping => mapping.skill?.name).filter(Boolean)
                  : (candidate.skills ? candidate.skills.map(skill => skill.name || skill) : []);
                const candidateSummary = candidateSummaries[candidate.id];
                
                return (
                  <div key={candidate.id || index} className={`px-6 py-6 hover:bg-gray-50 transition-colors duration-200 ${index !== results.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-start">
                      <input type="checkbox" className="mt-2 mr-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <div className="flex-1">
                        
                        {/* Header with name, score, and actions */}
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
                              onClick={() => handleOpenProfilePanel({
                                personalInfo,
                                experience,
                                skills,
                                summary: candidate.summary || '',
                                education: candidate.education || [],
                                certifications: candidate.certifications || [],
                                awards: candidate.awards || [],
                                projects: candidate.projects || [],
                                languages: candidate.languages || [],
                                interests: candidate.interests || [],
                                references: candidate.references || []
                              }, candidate.id)}
                            >
                              {personalInfo.fullName}
                              {/* Icon indicates clickable, panel will open */}
                              <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </h3>
                            
                            {/* Match Score Badge */}
                            {score > 0 && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                <CheckCircle className="h-3 w-3" />
                                {Math.round(score * 100)}% match
                              </div>
                            )}
                            
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
                            {shortlistedCandidates[candidate.id] ? (
                              <div className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                                <CheckCircle className="h-3 w-3" />
                                Shortlisted
                              </div>
                            ) : (
                              <div className="relative" data-dropdown-container>
                                {/* Stage Selector Modal */}
                                {showStageSelector[candidate.id] && pipelineToUse && (
                                  <>
                                    {/* Backdrop */}
                                    <div 
                                      className="fixed inset-0 bg-black bg-opacity-25 z-40"
                                      onClick={() => handleCloseStageSelector(candidate.id)}
                                    />
                                    {/* Modal */}
                                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-purple-200 rounded-lg shadow-xl z-50 w-96 max-h-[100vh]">
                                    <div className="p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-medium text-gray-900">Select Pipeline Stage</h5>
                                        <button
                                          onClick={() => handleCloseStageSelector(candidate.id)}
                                          className="text-gray-400 hover:text-gray-600"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                      
                                      <div className="mb-3">
                                        <p className="text-sm text-gray-600 mb-2">
                                          Pipeline: <span className="font-medium">{pipelineToUse.name}</span>
                                          {projectId && <span className="text-xs text-purple-600 ml-1">(Project Pipeline)</span>}
                                        </p>
                                        
                                        <div className="space-y-2 max-h-80 overflow-y-auto">
                                          {availableStages.map((stage) => (
                                            <div
                                              key={stage.id}
                                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                selectedStageId[candidate.id] === stage.id
                                                  ? 'border-purple-500 bg-purple-100'
                                                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                              }`}
                                              onClick={() => setSelectedStageId(prev => ({ ...prev, [candidate.id]: stage.id }))}
                                            >
                                              <div className="flex items-center justify-between">
                                                <div>
                                                  <div className="font-medium text-sm">{stage.name}</div>
                                                  {stage.description && (
                                                    <div className="text-xs text-gray-500 mt-1">{stage.description}</div>
                                                  )}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  Stage {stage.order + orderOffset}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        
                                        <div className="flex justify-end gap-2 mt-4">
                                          <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleCloseStageSelector(candidate.id)}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleShortlist(candidate, undefined, selectedStageId[candidate.id])}
                                            disabled={!selectedStageId[candidate.id] || shortlistingCandidates[candidate.id]}
                                            className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700"
                                          >
                                            {shortlistingCandidates[candidate.id] ? (
                                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                            ) : (
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                            )}
                                            Add to Stage
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    </div>
                                  </>
                                )}

                                {/* Main Shortlist Button */}
                                <div className="flex items-center">
                                  <Button 
                                    size="sm" 
                                    className="text-sm bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1 rounded-r-none"
                                    onClick={() => handleShortlist(candidate, undefined, availableStages[0]?.id)}
                                    disabled={shortlistingCandidates[candidate.id] || pipelinesLoading || projectLoading}
                                  >
                                    {shortlistingCandidates[candidate.id] ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-3 w-3" />
                                    )}
                                    Shortlist
                                  </Button>
                                </div>
                              </div>
                            )}
                            <Button 
                              size="sm" 
                              className="text-sm bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1"
                              onClick={() => handleSummarize(candidate.id)}
                              disabled={summaryLoading}
                            >
                              {summaryLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                              Summarize
                            </Button>
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
                        {matchCriteria && (
                          <div className="mb-3 p-3 bg-purple-100 rounded-lg border border-purple-200">
                            <h4 className="text-sm font-medium text-purple-900 mb-2 flex items-center gap-1">
                              <Search className="h-4 w-4" />
                              Match Criteria
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {matchCriteria.titleMatch && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                  ✓ Job Title Match
                                </span>
                              )}
                              {matchCriteria.locationMatch && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                  ✓ Location Match
                                </span>
                              )}
                              {matchCriteria.companyMatch && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                  ✓ Company Experience
                                </span>
                              )}
                              {matchCriteria.skillMatch && matchCriteria.skillMatch.length > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                  <Code className="h-3 w-3 mr-1" />
                                  {matchCriteria.skillMatch.length} Skills: {matchCriteria.skillMatch.slice(0, 2).join(', ')}
                                  {matchCriteria.skillMatch.length > 2 && ` +${matchCriteria.skillMatch.length - 2} more`}
                                </span>
                              )}
                              {matchCriteria.keywordMatches && matchCriteria.keywordMatches.length > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-200 text-purple-800">
                                  Keywords: {matchCriteria.keywordMatches.slice(0, 3).join(', ')}
                                  {matchCriteria.keywordMatches.length > 3 && ` +${matchCriteria.keywordMatches.length - 3} more`}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* AI Summary */}
                        {candidateSummary && (
                          <div className="mb-3 p-4 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg border border-purple-200">
                            <h4 className="text-sm font-medium text-purple-900 mb-2 flex items-center gap-1">
                              <Sparkles className="h-4 w-4" />
                              AI Summary
                            </h4>
                            <p className="text-sm text-gray-700 mb-3">{candidateSummary.summary}</p>
                            
                            {candidateSummary.keyStrengths && candidateSummary.keyStrengths.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-purple-900 mb-1">Key Strengths:</p>
                                <div className="flex flex-wrap gap-1">
                                  {candidateSummary.keyStrengths.map((strength: string, i: number) => (
                                    <span key={i} className="inline-block px-2 py-0.5 text-xs bg-purple-200 text-purple-700 rounded">
                                      {strength}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {candidateSummary.matchHighlights && candidateSummary.matchHighlights.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-purple-900 mb-1">Match Highlights:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {candidateSummary.matchHighlights.map((highlight: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-purple-600 mt-0.5">•</span>
                                      {highlight}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Experience Summary */}
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span
                              className="font-medium cursor-pointer hover:text-purple-600 transition-colors"
                              onClick={() => handleOpenProfilePanel({
                                personalInfo,
                                experience,
                                skills,
                                summary: candidate.summary || '',
                                education: candidate.education || [],
                                certifications: candidate.certifications || [],
                                awards: candidate.awards || [],
                                projects: candidate.projects || [],
                                languages: candidate.languages || [],
                                interests: candidate.interests || [],
                                references: candidate.references || []
                              }, candidate.id)}
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
            </div>
          )}
        </div>
      </div>      {/* Side Panel and Overlay */}
      {panelState !== 'closed' && (
        <>
          {/* Overlay - only show for expanded state */}
          {panelState === 'expanded' && (
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300 ease-in-out"
              onClick={() => handlePanelStateChange('closed')}
              aria-hidden="true"
            ></div>
          )}
          {/* Panel */}
          <SourcingProfileSidePanel
            userData={selectedUserDataForPanel}
            panelState={panelState}
            onStateChange={handlePanelStateChange}
            candidateId={selectedCandidateId || undefined}
            projectId={projectId}
          />
        </>
      )}

      {/* Filter Dialog */}
      <FilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />
    </>
  );
};

export default SearchResultsPage;