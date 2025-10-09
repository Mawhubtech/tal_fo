import React, { useState } from 'react';
import { X, Briefcase, MapPin, Building, Clock, DollarSign, Users, ChevronRight, Loader2, Check } from 'lucide-react';
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
  const [addedJobIds, setAddedJobIds] = useState<Set<string>>(new Set());
  const [processingJobIds, setProcessingJobIds] = useState<Set<string>>(new Set());
  const [alreadyAppliedJobIds, setAlreadyAppliedJobIds] = useState<Set<string>>(new Set());
  
  // Fetch all jobs for the current user
  const { data: jobsData, isLoading: jobsLoading } = useJobs(
    { 
      status: 'Published',
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    },
    { enabled: isOpen && !!user }
  );

  const jobs = jobsData?.data || [];

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

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold text-purple-600">Add Candidate to Job</h3>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 text-sm">
            Select one or more jobs for <span className="font-semibold text-purple-600">{candidate?.fullName || candidate?.candidateName || 'this candidate'}</span>
          </p>
          {addedJobIds.size > 0 && (
            <p className="text-sm text-green-600 font-medium mt-2">
              ✓ Added to {addedJobIds.size} {addedJobIds.size === 1 ? 'job' : 'jobs'}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
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
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, department, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {jobsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : filteredJobs.length === 0 ? (
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
              filteredJobs.map((job) => {
                const isAdded = addedJobIds.has(job.id);
                const isProcessing = processingJobIds.has(job.id);
                const alreadyApplied = alreadyAppliedJobIds.has(job.id);
                
                return (
                  <button
                    key={job.id}
                    onClick={() => !alreadyApplied && handleAddToJob(job.id)}
                    disabled={isLoading || isProcessing || isAdded || alreadyApplied}
                    className={`w-full p-4 border rounded-lg transition-all group text-left relative ${
                      alreadyApplied
                        ? 'border-blue-300 bg-blue-50 cursor-not-allowed'
                        : isAdded 
                        ? 'border-green-300 bg-green-50 cursor-default' 
                        : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {/* Already Applied Badge */}
                    {alreadyApplied && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        <Check className="w-3 h-3" />
                        Already Applied
                      </div>
                    )}
                    
                    {/* Added Badge */}
                    {!alreadyApplied && isAdded && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
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
                    
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Job Title */}
                        <h4 className={`font-semibold mb-2 transition-colors ${
                          alreadyApplied 
                            ? 'text-blue-700' 
                            : isAdded 
                            ? 'text-green-700' 
                            : 'text-gray-900 group-hover:text-purple-600'
                        }`}>
                          {job.title}
                        </h4>
                      
                      {/* Job Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        {job.department && (
                          <div className="flex items-center gap-1.5">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span>{job.department}</span>
                          </div>
                        )}
                        
                        {job.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        
                        {job.type && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{job.type}</span>
                          </div>
                        )}
                        
                        {job.salary && job.salary.min && job.salary.max && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span>
                              {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Job Description Preview */}
                      {job.description && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Arrow Icon - Only show if not added and not already applied */}
                    {!isAdded && !isProcessing && !alreadyApplied && (
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Showing {filteredJobs.length} of {jobs.length} open {jobs.length === 1 ? 'position' : 'positions'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobSelectionModal;
