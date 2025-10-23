import React, { useState, useEffect } from 'react';
import { Plus, Star, AlertCircle, CheckCircle, Clock, Briefcase, MapPin, Building, ExternalLink, ChevronDown, X } from 'lucide-react';
import { useJobApplicationsByCandidate, useCreateJobApplicationWithPipeline } from '../hooks/useJobApplications';
import { useSourcingProspects, useAddProspectsToProject } from '../hooks/useSourcingProspects';
import { useJobSuggestions } from '../hooks/useJobs';
import { useCandidate } from '../hooks/useCandidates';
import { useActivePipelines } from '../hooks/useActivePipelines';
import { useProject } from '../hooks/useSourcingProjects';
import { useAuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Button from './Button';
import { toast } from '../components/ToastContainer';
import { sourcingApiService, CreateSourcingProspectDto, AddProspectsToProjectDto } from '../services/sourcingApiService';

interface CandidateProspectsManagerProps {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateSkills?: string[];
  candidateExperience?: any[];
  projectId?: string; // Optional project ID for project-scoped operations
}

interface JobSuggestion {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  skills?: string[];
  matchScore: number;
  organization?: {
    id: string;
    name: string;
  };
}

interface ProspectStatus {
  isInPipeline: boolean;
  currentStage?: string;
  pipelineName?: string;
  lastActivity?: string;
  status?: string;
}

const CandidateProspectsManager: React.FC<CandidateProspectsManagerProps> = ({
  candidateId,
  candidateName,
  candidateEmail,
  candidateSkills = [],
  candidateExperience = [],
  projectId
}) => {
  const { user } = useAuthContext();
  const { addToast } = useToast();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isAddingToJob, setIsAddingToJob] = useState(false);
  const [isAddingToPipeline, setIsAddingToPipeline] = useState(false);
  const [showStageSelector, setShowStageSelector] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  // Fetch candidate's current job applications
  const { data: jobApplicationsData, isLoading: applicationsLoading } = useJobApplicationsByCandidate(candidateId);
  
  // Fetch candidate details to get the rating from the database
  const { data: candidateData, isLoading: candidateLoading } = useCandidate(candidateId);
  
  // Fetch candidate's prospect status
  const { data: prospectsData, isLoading: prospectsLoading, refetch: refetchProspects } = useSourcingProspects({
    search: candidateEmail,
    createdBy: user?.id
  });

  // Fetch active pipelines for shortlisting
  const { data: sourcingPipelines, isLoading: pipelinesLoading } = useActivePipelines('sourcing');

  // Fetch project details if projectId is provided
  const { data: projectData, isLoading: projectLoading } = useProject(projectId || '', !!projectId);

  // ❌ DISABLED: Job suggestions endpoint removed to improve performance
  const { data: jobSuggestionsData, isLoading: jobsLoading } = useJobSuggestions(
    candidateId,
    undefined,
    { enabled: false } // Disabled - not using job suggestions feature
  );

  // Get job suggestions and apply filtering
  const rawJobSuggestions = jobSuggestionsData?.suggestions || [];
  const jobApplications = jobApplicationsData?.applications || [];
  const appliedJobIds = new Set(jobApplications.map(app => app.jobId).filter(Boolean));
  
  // Double-check: filter out any jobs the candidate has already applied to
  const jobSuggestions = rawJobSuggestions.filter(suggestion => 
    !appliedJobIds.has(suggestion.job.id)
  );

  // Mutations
  const createJobApplicationWithPipelineMutation = useCreateJobApplicationWithPipeline();
  const addProspectsToProjectMutation = useAddProspectsToProject();

  // Get all the data arrays
  const prospects = prospectsData?.prospects || [];
  
  // Get candidate rating from database (convert to number for display)
  const candidateRating = candidateData ? parseFloat(candidateData.rating?.toString() || '0') : 0;

  // Determine which pipeline to use
  const pipelineToUse = projectData?.pipeline || sourcingPipelines?.find(p => p.isDefault) || sourcingPipelines?.[0];
  const availableStages = pipelineToUse?.stages?.sort((a, b) => a.order - b.order) || [];
  
  // Determine if stages start from 0 or 1 to display human-readable numbers
  const minOrder = availableStages.length > 0 ? Math.min(...availableStages.map(s => s.order)) : 0;
  const orderOffset = minOrder === 0 ? 1 : 0;

  // Debug logging
  console.log(`[CandidateProspectsManager] Applied job IDs:`, Array.from(appliedJobIds));
  console.log(`[CandidateProspectsManager] Raw suggestions:`, rawJobSuggestions.length);
  console.log(`[CandidateProspectsManager] Filtered suggestions:`, jobSuggestions.length);

  // Calculate prospect status
  const prospectStatus: ProspectStatus = {
    isInPipeline: prospects.length > 0,
    currentStage: prospects[0]?.currentStage?.name,
    pipelineName: prospects[0]?.pipeline?.name,
    lastActivity: prospects[0]?.lastContact || prospects[0]?.updatedAt,
    status: prospects[0]?.status
  };

  // Handle adding candidate to job using the new hook
  const handleAddToJob = async (jobId: string) => {
    try {
      setIsAddingToJob(true);
      setSelectedJobId(jobId);

      console.log(`[CandidateProspectsManager] Starting to add candidate ${candidateId} to job ${jobId}`);

      // Prepare the application data
      const applicationData = {
        jobId: jobId,
        candidateId: candidateId,
        status: 'Applied' as const,
        appliedDate: new Date().toISOString().split('T')[0],
        notes: `Added from prospects management`
      };

      console.log('[CandidateProspectsManager] Submitting application data:', applicationData);

      await createJobApplicationWithPipelineMutation.mutateAsync(applicationData);

      console.log('[CandidateProspectsManager] Successfully created job application with pipeline');
      toast.success('Candidate Added', `${candidateName} has been added to the job pipeline`);
    } catch (error) {
      console.error('[CandidateProspectsManager] Error adding candidate to job:', error);
      toast.error('Failed to Add', error instanceof Error ? error.message : 'Could not add candidate to job. Please try again.');
    } finally {
      setIsAddingToJob(false);
      setSelectedJobId(null);
    }
  };

  // Handle showing stage selector
  const handleShowStageSelector = () => {
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

    setShowStageSelector(true);
    setSelectedStageId(availableStages[0]?.id || null); // Default to first stage
  };

  // Handle adding candidate to sourcing pipeline (shortlisting)
  const handleAddToPipeline = async () => {
    if (!selectedStageId || !pipelineToUse) {
      addToast({
        type: 'error',
        title: 'Stage Required',
        message: 'Please select a stage to add the candidate to.',
        duration: 5000
      });
      return;
    }

    try {
      setIsAddingToPipeline(true);

      console.log('[CandidateProspectsManager] Adding to pipeline:', {
        candidateId,
        pipelineId: pipelineToUse.id,
        stageId: selectedStageId,
        projectId,
        isProjectBased: !!projectId
      });

      if (projectId) {
        // Project-based approach: Use bulk addition endpoint
        const prospectsData: AddProspectsToProjectDto = {
          candidateIds: [candidateId],
          searchId: undefined,
          stageId: selectedStageId // Pass the selected stage ID
        };

        await addProspectsToProjectMutation.mutateAsync({
          projectId,
          data: prospectsData
        });

        console.log('[CandidateProspectsManager] Successfully added to project pipeline with stage:', selectedStageId);
      } else {
        // Global approach: Use individual prospect creation
        const selectedStage = availableStages.find(stage => stage.id === selectedStageId);
        
        const prospectData: CreateSourcingProspectDto = {
          candidateId: candidateId,
          status: 'new',
          source: 'linkedin',
          rating: 3, // Default rating
          notes: `Added from candidate management on ${new Date().toLocaleDateString()}`,
          pipelineId: pipelineToUse.id,
          currentStageId: selectedStageId,
          metadata: {
            addedFromCandidateManagement: true,
            addedDate: new Date().toISOString(),
            selectedStage: selectedStage?.name
          }
        };

        console.log('[CandidateProspectsManager] Creating prospect with data:', prospectData);
        await sourcingApiService.createProspect(prospectData);

        console.log('[CandidateProspectsManager] Successfully created individual prospect');
      }

      // Refresh prospects data to show the updated status
      await refetchProspects();

      // Close stage selector
      setShowStageSelector(false);
      setSelectedStageId(null);

      // Show success feedback
      const selectedStage = availableStages.find(stage => stage.id === selectedStageId);
      addToast({
        type: 'success',
        title: 'Candidate Added to Pipeline',
        message: `${candidateName} has been added to the ${pipelineToUse.name} pipeline in ${selectedStage?.name} stage`,
        duration: 5000
      });
      
    } catch (error) {
      console.error('Error adding candidate to pipeline:', error);
      // Show error toast
      addToast({
        type: 'error',
        title: 'Pipeline Addition Failed',
        message: error instanceof Error ? error.message : 'Failed to add candidate to pipeline. Please try again.',
        duration: 7000
      });
    } finally {
      setIsAddingToPipeline(false);
    }
  };

  // Format salary display
  const formatSalary = (suggestion: any) => {
    const job = suggestion.job;
    if (!job.salaryMin && !job.salaryMax) return null;
    const currency = job.currency || 'USD';
    const symbol = currency === 'USD' ? '$' : currency;
    
    if (job.salaryMin && job.salaryMax) {
      return `${symbol}${(job.salaryMin / 1000).toFixed(0)}k - ${symbol}${(job.salaryMax / 1000).toFixed(0)}k`;
    } else if (job.salaryMin) {
      return `From ${symbol}${(job.salaryMin / 1000).toFixed(0)}k`;
    } else if (job.salaryMax) {
      return `Up to ${symbol}${(job.salaryMax / 1000).toFixed(0)}k`;
    }
    return null;
  };

  // Get match score color
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'contacted': return 'text-purple-600 bg-purple-100';
      case 'responded': return 'text-green-600 bg-green-100';
      case 'interested': return 'text-emerald-600 bg-emerald-100';
      case 'not_interested': return 'text-red-600 bg-red-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Render star rating with half-star support
  const renderStarRating = (rating: number, size: 'sm' | 'md' = 'md', color = 'yellow') => {
    const starSize = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';
    const starColor = color === 'yellow' ? 'text-yellow-400' : 'text-purple-400';
    
    return (
      <div className="flex justify-center items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.floor(rating);
          const isHalf = star === Math.floor(rating) + 1 && rating % 1 >= 0.5;
          
          return (
            <div key={star} className={`relative ${starSize}`}>
              {/* Background (empty) star */}
              <Star className={`${starSize} text-gray-300 absolute`} />
              
              {/* Filled or half-filled star */}
              {(isFilled || isHalf) && (
                <div 
                  className="absolute overflow-hidden"
                  style={{ 
                    width: isHalf ? '50%' : '100%',
                    height: '100%'
                  }}
                >
                  <Star className={`${starSize} ${starColor} fill-current`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Rating Summary - Read-only display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3">Rating Summary</h4>
        <p className="text-xs text-gray-500 mb-3">These ratings are view-only. To edit candidate ratings, use the main candidate management interface.</p>
        
        {/* Candidate Rating */}
        <div className="text-center">
          <p className="text-xs font-medium text-gray-600 mb-2">Candidate Rating</p>
          {candidateLoading ? (
            <div className="flex justify-center items-center space-x-1">
              <Clock className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          ) : (
            renderStarRating(candidateRating, 'md', 'yellow')
          )}
          <p className="text-sm text-gray-600 mt-1">
            {candidateLoading ? 'Loading...' : candidateRating >= 0 ? `${candidateRating.toFixed(1)}/5` : 'Not rated'}
          </p>
        </div>
      </div>

      {/* Prospects Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Prospects Status</h4>
          {!prospectStatus.isInPipeline && (
            <Button 
              variant="primary" 
              size="sm" 
              className="text-xs bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700"
              onClick={handleShowStageSelector}
              disabled={isAddingToPipeline || pipelinesLoading || projectLoading}
            >
              {isAddingToPipeline ? (
                <>
                  <Clock className="w-3 h-3 mr-1 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3 mr-1" />
                  Add to Pipeline
                </>
              )}
            </Button>
          )}
        </div>

        {/* Stage Selector Modal */}
        {showStageSelector && (
          <div className="mb-4 p-4 border border-purple-200 rounded-lg bg-purple-50">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">Select Pipeline Stage</h5>
              <button
                onClick={() => {
                  setShowStageSelector(false);
                  setSelectedStageId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {pipelineToUse && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">
                  Pipeline: <span className="font-medium">{pipelineToUse.name}</span>
                  {projectId && <span className="text-xs text-purple-600 ml-1">(Project Pipeline)</span>}
                </p>
                
                <div className="space-y-2">
                  {availableStages.map((stage) => (
                    <div
                      key={stage.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedStageId === stage.id
                          ? 'border-purple-500 bg-purple-100'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                      onClick={() => setSelectedStageId(stage.id)}
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
                    onClick={() => {
                      setShowStageSelector(false);
                      setSelectedStageId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddToPipeline}
                    disabled={!selectedStageId || isAddingToPipeline}
                    className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700"
                  >
                    {isAddingToPipeline ? (
                      <>
                        <Clock className="w-3 h-3 mr-1 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add to Stage'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {prospectsLoading ? (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Loading prospect status...
          </div>
        ) : prospectStatus.isInPipeline ? (
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              <span className="font-medium text-gray-900">In {prospectStatus.pipelineName} pipeline</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Current Stage: <span className="font-medium">{prospectStatus.currentStage}</span></p>
              {prospectStatus.status && (
                <p className="mt-1">
                  Status: 
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prospectStatus.status)}`}>
                    {prospectStatus.status.replace('_', ' ')}
                  </span>
                </p>
              )}
              {prospects[0]?.rating && (
                <p className="mt-1 flex items-center">
                  Pipeline Rating: 
                  <span className="ml-1 flex items-center space-x-1">
                    {renderStarRating(parseFloat(prospects[0].rating?.toString() || '0'), 'sm', 'purple')}
                    <span className="text-xs">({parseFloat(prospects[0].rating?.toString() || '0').toFixed(1)}/5)</span>
                  </span>
                </p>
              )}
              {prospectStatus.lastActivity && (
                <p className="text-xs text-gray-500 mt-1">
                  Last activity: {new Date(prospectStatus.lastActivity).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
              <span>Not currently in any pipeline.</span>
            </div>
            <p>Add this candidate to a sourcing pipeline to track their progress through outreach and recruitment.</p>
          </div>
        )}
      </div>

      {/* Current Job Applications */}
      {jobApplications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Current Applications</h4>
          <div className="space-y-2">
            {jobApplications.slice(0, 3).map((application) => (
              <div key={application.id} className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{application.job?.title || 'Unknown Job'}</div>
                    <div className="text-xs text-gray-500">
                      {application.job?.department} • {application.job?.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-purple-600">
                      {application.currentPipelineStageName || application.stage}
                    </div>
                    <div className="text-xs text-gray-500">
                      Applied: {new Date(application.appliedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {jobApplications.length > 3 && (
              <div className="text-xs text-gray-500 text-center pt-2">
                +{jobApplications.length - 3} more applications
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job Suggestions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3">
          Suggested Job Matches
          {!jobsLoading && jobSuggestions.length > 0 && (
            <span className="ml-2 text-xs text-gray-500">({jobSuggestions.length} available)</span>
          )}
        </h4>

        {jobsLoading ? (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Loading job suggestions...
          </div>
        ) : jobSuggestions.length > 0 ? (
          <div className="space-y-2">
            {jobSuggestions.map((suggestion) => (
              <div key={suggestion.job.id} className="p-3 border border-gray-100 rounded-lg hover:border-purple-200 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-sm">{suggestion.job.title}</div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMatchScoreColor(suggestion.matchScore)}`}>
                        {suggestion.matchScore}% match
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {suggestion.job.department}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {suggestion.job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {suggestion.job.type}
                      </div>
                    </div>
                    {formatSalary(suggestion) && (
                      <div className="text-xs text-green-600 font-medium mb-2">
                        {formatSalary(suggestion)}
                      </div>
                    )}
                    {suggestion.job.skills && suggestion.job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {suggestion.job.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                        {suggestion.job.skills.length > 3 && (
                          <span className="text-xs text-gray-500">+{suggestion.job.skills.length - 3}</span>
                        )}
                      </div>
                    )}
                    {/* Match breakdown */}
                    <div className="mt-2 text-xs text-gray-500">
                      Skills: {suggestion.matchReasons.skillMatch}% • 
                      Experience: {suggestion.matchReasons.experienceMatch}% • 
                      Seniority: {suggestion.matchReasons.seniorityMatch}%
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700 ml-3"
                    onClick={() => handleAddToJob(suggestion.job.id)}
                    disabled={isAddingToJob && selectedJobId === suggestion.job.id}
                  >
                    {isAddingToJob && selectedJobId === suggestion.job.id ? (
                      <Clock className="w-3 h-3 animate-spin" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            <p>No suitable job matches found at the moment.</p>
            <p className="mt-1">Job suggestions are based on candidate skills and experience.</p>
          </div>
        )}
      </div>


    </div>
  );
};

export default CandidateProspectsManager;
