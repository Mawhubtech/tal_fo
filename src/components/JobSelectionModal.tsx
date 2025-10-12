import React, { useState } from 'react';
import { X, Briefcase, MapPin, Building, Clock, DollarSign, Users, ChevronRight, Loader2, Check, Plus, ChevronLeft } from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { useAuthContext } from '../contexts/AuthContext';

interface JobSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobSelected: (jobId: string) => Promise<void>;
  onAddToDatabase?: () => void; // Make optional
  candidate: any;
  isLoading?: boolean;
  showAddToDatabase?: boolean; // New prop to control visibility
}

const JobSelectionModal: React.FC<JobSelectionModalProps> = ({
  isOpen,
  onClose,
  onJobSelected,
  onAddToDatabase,
  candidate,
  isLoading = false,
  showAddToDatabase = true // Default to true for backward compatibility
}) => {
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Jobs per page
  const [addedJobIds, setAddedJobIds] = useState<Set<string>>(new Set());
  const [processingJobIds, setProcessingJobIds] = useState<Set<string>>(new Set());
  const [alreadyAppliedJobIds, setAlreadyAppliedJobIds] = useState<Set<string>>(new Set());

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Fetch all jobs for the current user - refetch every 10 seconds while modal is open
  const { data: jobsData, isLoading: jobsLoading } = useJobs(
    { 
      status: 'Published',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      page: currentPage,
      limit: pageSize,
      search: debouncedSearch || undefined, // Use debounced search
    },
    { 
      enabled: isOpen && !!user,
      refetchInterval: isOpen ? 10000 : false // Refetch every 10 seconds when modal is open
    }
  );

  const jobs = jobsData?.data || [];
  const totalJobs = jobsData?.total || 0;
  const totalPages = Math.ceil(totalJobs / pageSize);

  // Check which jobs the candidate has already applied to
  React.useEffect(() => {
    if (candidate && jobs.length > 0) {
      const appliedIds = new Set<string>();
      
      // Get all possible IDs for the candidate
      const candidateIds = [
        candidate.id,
        candidate.candidateId,
        candidate.existingCandidateId,
      ].filter(Boolean);
      
      // Get sourceId and source for external candidates (CoreSignal, PDL, etc.)
      const candidateSourceId = candidate.sourceId || candidate.coreSignalId;
      const candidateSource = candidate.source || (candidate.coreSignalId ? 'coresignal' : null);
      
      console.log('[JobSelectionModal] Checking applications for candidate:', {
        candidateIds,
        sourceId: candidateSourceId,
        source: candidateSource,
        candidateName: candidate.fullName || candidate.candidateName
      });
      
      jobs.forEach(job => {
        // Check if job has applications array and if candidate is in it
        if (job.applications && Array.isArray(job.applications)) {
          const hasApplied = job.applications.some(
            (app: any) => {
              const appCandidateId = app.candidateId || app.candidate?.id;
              const appSourceId = app.candidate?.sourceId;
              const appSource = app.candidate?.source;
              
              // Check by database candidate ID
              const matchById = candidateIds.includes(appCandidateId);
              
              // Check by sourceId and source (for external candidates like CoreSignal)
              const matchBySource = candidateSourceId && 
                                  appSourceId === candidateSourceId && 
                                  candidateSource && 
                                  appSource?.toLowerCase() === candidateSource.toLowerCase();
              
              const match = matchById || matchBySource;
              
              if (match) {
                console.log('[JobSelectionModal] Found existing application:', {
                  jobId: job.id,
                  jobTitle: job.title,
                  matchedBy: matchById ? 'ID' : 'Source',
                  appCandidateId,
                  appSourceId,
                  appSource
                });
              }
              return match;
            }
          );
          if (hasApplied) {
            appliedIds.add(job.id);
          }
        }
      });
      
      console.log('[JobSelectionModal] Already applied to jobs:', Array.from(appliedIds));
      setAlreadyAppliedJobIds(appliedIds);
    }
  }, [candidate, jobs]);

  // Handle search with debouncing - reset to page 1 when searching
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle adding candidate to a job
  const handleAddToJob = async (jobId: string) => {
    if (addedJobIds.has(jobId) || processingJobIds.has(jobId)) {
      return; // Already added or currently processing
    }

    setProcessingJobIds(prev => new Set(prev).add(jobId));
    
    try {
      await onJobSelected(jobId);
      setAddedJobIds(prev => new Set(prev).add(jobId));
    } catch (error) {
      console.error('Error adding to job:', error);
      // Don't add to addedJobIds if there was an error
    } finally {
      setProcessingJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setAddedJobIds(new Set());
      setProcessingJobIds(new Set());
      setSearchTerm('');
      setCurrentPage(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg sm:text-2xl font-bold text-purple-600">Add Candidate to Job</h3>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm">
            Select one or more jobs for <span className="font-semibold text-purple-600">{candidate?.fullName || candidate?.candidateName || 'this candidate'}</span>
          </p>
          {addedJobIds.size > 0 && (
            <p className="text-xs sm:text-sm text-green-600 font-medium mt-2">
              ✓ Added to {addedJobIds.size} {addedJobIds.size === 1 ? 'job' : 'jobs'}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Add to Database Option - Only show if showAddToDatabase is true */}
          {showAddToDatabase && onAddToDatabase && (
            <div className="mb-6">
              <button
                onClick={onAddToDatabase}
                disabled={isLoading}
                className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 group-hover:bg-purple-200 p-3 rounded-lg transition-colors">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Add to Candidates Database Only</div>
                      <div className="text-sm text-gray-600">Save candidate without assigning to a specific job</div>
                    </div>
                  </div>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                {jobsLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                  </div>
                )}
              </div>
              <a
                href="/dashboard/jobs/create"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5 font-medium whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Job</span>
                <span className="sm:hidden">Create</span>
              </a>
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {jobsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  {searchTerm ? 'No jobs found matching your search' : 'No open jobs available'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm ? 'Try adjusting your search terms' : 'Create a new job posting to get started'}
                </p>
              </div>
            ) : (
              jobs.map((job) => {
                const isAdded = addedJobIds.has(job.id);
                const isProcessing = processingJobIds.has(job.id);
                const alreadyApplied = alreadyAppliedJobIds.has(job.id);
                
                return (
                  <button
                    key={job.id}
                    onClick={() => !alreadyApplied && handleAddToJob(job.id)}
                    disabled={isLoading || isProcessing || isAdded || alreadyApplied}
                    className={`w-full p-3 sm:p-4 border rounded-lg transition-all group text-left relative ${
                      alreadyApplied
                        ? 'border-blue-300 bg-blue-50 cursor-not-allowed'
                        : isAdded 
                        ? 'border-green-300 bg-green-50 cursor-default' 
                        : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {/* Already Applied Badge */}
                    {alreadyApplied && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-500 text-white px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium">
                        <Check className="w-3 h-3" />
                        <span className="hidden sm:inline">Candidate Added to Job</span>
                        <span className="sm:hidden">Added</span>
                      </div>
                    )}
                    
                    {/* Added Badge */}
                    {!alreadyApplied && isAdded && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Added
                      </div>
                    )}
                    
                    {/* Processing Indicator */}
                    {!alreadyApplied && isProcessing && (
                      <div className="absolute top-2 right-2">
                        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                      </div>
                    )}
                    
                    {/* Desktop: Single line | Mobile: Stacked layout */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 w-full">
                      {/* Job Title and Details */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {/* Job Title */}
                        <h4 className={`font-semibold text-sm sm:flex-shrink-0 transition-colors ${
                          alreadyApplied 
                            ? 'text-blue-700' 
                            : isAdded 
                            ? 'text-green-700' 
                            : 'text-gray-900 group-hover:text-purple-600'
                        }`}>
                          {job.title}
                        </h4>
                      
                        {/* Job Details - Responsive wrap */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-600">
                          {job.client?.name && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="font-medium text-gray-700 truncate max-w-[120px] sm:max-w-none">{job.client.name}</span>
                            </div>
                          )}
                          
                          {job.department && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate max-w-[100px] sm:max-w-none">{job.department}</span>
                            </div>
                          )}
                          
                          {job.location && (
                            <div className="flex items-center gap-1 shrink-0">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate max-w-[100px] sm:max-w-none">{job.location}</span>
                            </div>
                          )}
                          
                          {job.type && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="truncate max-w-[80px] sm:max-w-none">{job.type}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    
                      {/* Arrow Icon - Only show if not added and not already applied */}
                      {!isAdded && !isProcessing && !alreadyApplied && (
                        <ChevronRight className="hidden sm:block w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                      )}
                    </div>
                </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer with Pagination */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Results Info */}
            <p className="text-xs text-gray-500 text-center sm:text-left">
              Showing {jobs.length > 0 ? ((currentPage - 1) * pageSize + 1) : 0} - {Math.min(currentPage * pageSize, totalJobs)} of {totalJobs} {totalJobs === 1 ? 'position' : 'positions'}
            </p>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || jobsLoading}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                
                <div className="flex items-center gap-1">
                  {/* Show first page */}
                  {currentPage > 2 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        1
                      </button>
                      {currentPage > 3 && <span className="text-gray-400 px-1">...</span>}
                    </>
                  )}
                  
                  {/* Show current and adjacent pages */}
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    if (
                      pageNum === currentPage ||
                      pageNum === currentPage - 1 ||
                      pageNum === currentPage + 1
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={jobsLoading}
                          className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                            pageNum === currentPage
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  {/* Show last page */}
                  {currentPage < totalPages - 1 && (
                    <>
                      {currentPage < totalPages - 2 && <span className="text-gray-400 px-1">...</span>}
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || jobsLoading}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSelectionModal;
