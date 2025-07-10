import React, { useState, useEffect } from 'react';
import { Plus, Star, AlertCircle, CheckCircle, Clock, Briefcase, MapPin, Building, ExternalLink } from 'lucide-react';
import { useJobApplicationsByCandidate, useCreateJobApplication } from '../hooks/useJobApplications';
import { useSourcingProspects } from '../hooks/useSourcingProspects';
import { useJobSuggestions } from '../hooks/useJobs';
import { useCandidate } from '../hooks/useCandidates';
import { useAuthContext } from '../contexts/AuthContext';
import Button from './Button';
import { toast } from '../components/ToastContainer';

interface CandidateProspectsManagerProps {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateSkills?: string[];
  candidateExperience?: any[];
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
  candidateExperience = []
}) => {
  const { user } = useAuthContext();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isAddingToJob, setIsAddingToJob] = useState(false);

  // Fetch candidate's current job applications
  const { data: jobApplicationsData, isLoading: applicationsLoading } = useJobApplicationsByCandidate(candidateId);
  
  // Fetch candidate details to get the rating from the database
  const { data: candidateData, isLoading: candidateLoading } = useCandidate(candidateId);
  
  // Fetch candidate's prospect status
  const { data: prospectsData, isLoading: prospectsLoading } = useSourcingProspects({
    search: candidateEmail,
    createdBy: user?.id
  });

  // Fetch job suggestions from backend
  const { data: jobSuggestionsData, isLoading: jobsLoading } = useJobSuggestions(
    candidateId,
    undefined, // Not filtering by organization for now
    { enabled: !!candidateId }
  );

  // Mutations
  const createJobApplicationMutation = useCreateJobApplication();

  const jobApplications = jobApplicationsData?.applications || [];
  const prospects = prospectsData?.prospects || [];
  
  // Get candidate rating from database (convert to number for display)
  const candidateRating = candidateData ? parseFloat(candidateData.rating?.toString() || '0') : 0;
  
  // Get raw suggestions from backend and apply additional client-side filtering as safeguard
  const rawJobSuggestions = jobSuggestionsData?.suggestions || [];
  const appliedJobIds = new Set(jobApplications.map(app => app.jobId).filter(Boolean));
  
  // Double-check: filter out any jobs the candidate has already applied to
  const jobSuggestions = rawJobSuggestions.filter(suggestion => 
    !appliedJobIds.has(suggestion.job.id)
  );

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

  // Handle adding candidate to job
  const handleAddToJob = async (jobId: string) => {
    try {
      setIsAddingToJob(true);
      setSelectedJobId(jobId);

      await createJobApplicationMutation.mutateAsync({
        jobId: jobId,
        candidateId: candidateId,
        status: 'Applied',
        stage: 'Application',
        appliedDate: new Date().toISOString().split('T')[0],
        notes: `Added from prospects management`
      });

      toast.success('Candidate Added', `${candidateName} has been added to the job pipeline`);
    } catch (error) {
      toast.error('Failed to Add', 'Could not add candidate to job. They may already be applied.');
    } finally {
      setIsAddingToJob(false);
      setSelectedJobId(null);
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
            {candidateLoading ? 'Loading...' : candidateRating > 0 ? `${candidateRating.toFixed(1)}/5` : 'Not rated'}
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
            >
              <Plus className="w-3 h-3 mr-1" />
              Add to Pipeline
            </Button>
          )}
        </div>

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
