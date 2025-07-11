import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, LayoutGrid, List, X } from 'lucide-react';
import { useSourcingProspects, useSourcingDefaultPipeline, useMoveSourcingProspectStage, useDeleteSourcingProspect } from '../../hooks/useSourcingProspects';
import { useCandidate } from '../../hooks/useCandidates';
import { useAuthContext } from '../../contexts/AuthContext';
import { SourcingKanbanView } from '../components/pipeline/SourcingKanbanView';
import { SourcingListView } from '../components/pipeline/SourcingListView';
import { PipelineStats } from '../../recruitment/organizations/components/ats/pipeline/PipelineStats';
import { SourcingProspect } from '../../services/sourcingApiService';
import SourcingProfileSidePanel, { type PanelState, type UserStructuredData } from './components/SourcingProfileSidePanel';

/**
 * CandidateOutreachProspects Component
 * 
 * This component manages candidate outreach prospects using the existing pipeline infrastructure.
 * It transforms prospect data to match the pipeline candidate interface and provides both
 * kanban and list views with drag-and-drop functionality, filtering, and pipeline statistics.
 * 
 * Key Features:
 * - Pipeline-based candidate management (kanban & list views)
 * - Real-time pipeline statistics
 * - Advanced filtering by skills, status, and search terms
 * - Drag-and-drop stage management
 * - Integration with existing pipeline system
 */

// Transform prospect to match SourcingCandidate interface expected by sourcing pipeline components
interface SourcingCandidate {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  stage: string; // This maps to our prospect status
  score: number; // This maps to our prospect rating
  lastUpdated: string;
  tags: string[];
  source: string;
  appliedDate: string;
  candidateRating?: number; // Overall candidate rating from database
}

const CandidateOutreachProspects: React.FC = () => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // State for the profile side panel
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [panelState, setPanelState] = useState<PanelState>('closed');

  // Ref for the side panel to detect clicks outside
  const sidePanelRef = useRef<HTMLDivElement>(null);

  // Get current user context
  const { user } = useAuthContext();

  // Handle click outside and escape key to close panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidePanelRef.current && !sidePanelRef.current.contains(event.target as Node)) {
        handlePanelStateChange('closed');
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && panelState !== 'closed') {
        handlePanelStateChange('closed');
      }
    };

    if (panelState !== 'closed') {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [panelState]);

  // Load sourcing prospects and pipeline (filtered by current user)
  const { data: sourcingData, isLoading: prospectsLoading, error: prospectsError } = useSourcingProspects({
    search: searchTerm || undefined,
    status: selectedStatus || undefined,
    skills: selectedSkill ? [selectedSkill] : undefined,
    createdBy: user?.id, // Only load prospects created by current user
  });
  
  const { data: defaultPipeline, isLoading: pipelineLoading } = useSourcingDefaultPipeline();
  
  // Load candidate data for side panel
  const { data: selectedCandidateData, isLoading: candidateLoading } = useCandidate(selectedCandidateId || '');
  
  // Mutations
  const moveProspectMutation = useMoveSourcingProspectStage();
  const deleteProspectMutation = useDeleteSourcingProspect();

  const prospects = sourcingData?.prospects || [];
  const activePipeline = defaultPipeline;

  // Transform prospects to match sourcing candidate interface
  const transformProspectToSourcingCandidate = (prospect: SourcingProspect): SourcingCandidate => {
    // Extract candidate data (with fallbacks for when candidate is not loaded)
    const candidate = prospect.candidate;
    const candidateName = candidate?.fullName || `Candidate ${prospect.candidateId}`;
    const candidateEmail = candidate?.email || '';
    const candidatePhone = candidate?.phone || '';
    
    // Extract skills from candidate's skillMappings or fallback to empty array
    const candidateSkills = candidate?.skillMappings 
      ? candidate.skillMappings.map((mapping: any) => mapping.skill?.name).filter(Boolean)
      : (candidate?.skills ? candidate.skills.map((skill: any) => skill.name || skill) : []);

    // Safely extract and validate ratings
    const prospectRating = typeof prospect.rating === 'number' ? prospect.rating : 0;
    const candidateRating = candidate?.rating;
    
    // Convert string rating to number if needed
    let validCandidateRating: number | undefined = undefined;
    if (candidateRating !== undefined && candidateRating !== null) {
      if (typeof candidateRating === 'string') {
        const parsed = parseFloat(candidateRating);
        if (!isNaN(parsed) && parsed > 0) {
          validCandidateRating = parsed;
        }
      } else if (typeof candidateRating === 'number' && candidateRating > 0) {
        validCandidateRating = candidateRating;
      }
    }

    // Debug logging to verify rating conversion
    console.log(`Candidate ${candidateName}: Original rating = ${candidateRating} (${typeof candidateRating}), Converted = ${validCandidateRating}`);

    return {
      id: prospect.id,
      name: candidateName,
      avatar: candidate?.avatar || '', // Use candidate avatar if available
      email: candidateEmail,
      phone: candidatePhone,
      stage: prospect.currentStage?.name || prospect.status, // Use actual stage name, fallback to status
      score: prospectRating,
      lastUpdated: prospect.lastContact || prospect.updatedAt,
      tags: [prospect.source, ...(candidateSkills.slice(0, 2) || [])], // Combine source and top skills as tags
      source: prospect.source,
      appliedDate: prospect.createdAt,
      candidateRating: validCandidateRating, // Overall candidate rating (properly converted)
    };
  };

  // Get all unique skills from prospects
  const allSkills = Array.from(new Set(prospects.flatMap(p => {
    const candidate = p.candidate;
    const candidateSkills = candidate?.skillMappings 
      ? candidate.skillMappings.map((mapping: any) => mapping.skill?.name).filter(Boolean)
      : (candidate?.skills ? candidate.skills.map((skill: any) => skill.name || skill) : []);
    return candidateSkills;
  })));

  // Apply additional filtering (API already handles search, status, skills)
  const filteredProspects = prospects;

  // Transform filtered prospects to sourcing candidates
  const sourcingCandidates = filteredProspects.map(transformProspectToSourcingCandidate);

  // Helper function for pipeline stats
  const getCandidatesByStage = (stageName: string) => {
    return sourcingCandidates.filter(candidate => candidate.stage === stageName);
  };

  // Pipeline handlers
  const handleCandidateClick = (candidate: SourcingCandidate) => {
    console.log('Candidate clicked:', candidate);
    // Find the prospect by candidate ID to get the candidateId
    const prospect = prospects.find(p => p.id === candidate.id);
    if (prospect && prospect.candidateId) {
      setSelectedCandidateId(prospect.candidateId);
      setPanelState('expanded');
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
  };

  // Panel state management
  const handlePanelStateChange = (newState: PanelState) => {
    setPanelState(newState);
    if (newState === 'closed') {
      setSelectedCandidateId(null);
      document.body.style.overflow = 'auto'; // Restore background scroll
    }
  };

  // Transform candidate data to UserStructuredData format for side panel
  const transformCandidateToUserStructuredData = (candidate: any): UserStructuredData | null => {
    if (!candidate) return null;

    return {
      personalInfo: {
        fullName: candidate.fullName || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        location: candidate.location || '',
        website: candidate.website || '',
        linkedIn: candidate.linkedIn || '',
        github: candidate.github || '',
        avatar: candidate.avatar || ''
      },
      summary: candidate.summary || '',
      experience: candidate.experience || [],
      education: candidate.education || [],
      skills: candidate.skillMappings?.map((mapping: any) => mapping.skill?.name || mapping).filter(Boolean) || 
               candidate.skills || [],
      projects: candidate.projects || [],
      certifications: candidate.certifications || [],
      awards: candidate.awards || [],
      interests: candidate.interests || [],
      languages: candidate.languages || [],
      references: candidate.references || [],
      customFields: candidate.customFields || []
    };
  };

  const handleCandidateStageChange = async (candidateId: string, newStageName: string) => {
    console.log('Stage change:', candidateId, newStageName);
    
    // Find the stage object from the pipeline
    const stage = activePipeline?.stages?.find(s => s.name === newStageName);
    if (!stage) {
      console.error('Stage not found:', newStageName);
      return;
    }

    try {
      await moveProspectMutation.mutateAsync({
        id: candidateId,
        data: { stageId: stage.id }
      });
    } catch (error) {
      console.error('Failed to move prospect:', error);
    }
  };

  const handleCandidateRemove = async (candidate: SourcingCandidate) => {
    console.log('Remove candidate:', candidate);
    
    try {
      await deleteProspectMutation.mutateAsync(candidate.id);
    } catch (error) {
      console.error('Failed to delete prospect:', error);
    }
  };

  // Show loading state
  if (prospectsLoading || pipelineLoading) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading prospects...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (prospectsError) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error loading prospects. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`w-full p-6 transition-all duration-300 ${
        panelState === 'expanded' ? 'mr-[66.666667%] overflow-hidden' : 
        panelState === 'collapsed' ? 'mr-[33.333333%] overflow-hidden' : 
        ''
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidate Prospects</h1>
            <p className="text-gray-600 mt-1">Manage your candidate pipeline and outreach efforts</p>
          </div>
          {/* <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Candidate</span>
          </button> */}
        </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Skills</option>
              {allSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="responded">Responded</option>
              <option value="interested">Interested</option>
              <option value="not_interested">Not Interested</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
                view === 'kanban' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
                view === 'list' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline Stats */}
      {/* {activePipeline && (
        <div className="mb-6">
          <PipelineStats 
            candidates={pipelineCandidates}
            pipeline={activePipeline}
            getCandidatesByStage={getCandidatesByStage}
          />
        </div>
      )} */}

        {/* Pipeline Views */}
        {activePipeline ? (
          <>
            {view === 'kanban' && (
              <SourcingKanbanView
                candidates={sourcingCandidates}
                pipeline={activePipeline}
                onCandidateClick={handleCandidateClick}
                onCandidateStageChange={handleCandidateStageChange}
                onCandidateRemove={handleCandidateRemove}
              />
            )}

            {view === 'list' && (
              <SourcingListView
                candidates={sourcingCandidates}
                pipeline={activePipeline}
                onCandidateClick={handleCandidateClick}
                onCandidateStageChange={handleCandidateStageChange}
                onCandidateRemove={handleCandidateRemove}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No pipeline available for outreach candidates.</p>
            <p className="text-sm text-gray-400">Please configure a default pipeline in your settings.</p>
          </div>
        )}
      </div>

      {/* Side Panel */}
      {panelState !== 'closed' && (
        <>
          {/* Overlay for click outside detection */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            aria-hidden="true"
          />
          
          {/* Side Panel */}
          <div 
            ref={sidePanelRef}
            className="fixed right-0 top-0 h-full bg-white border-l border-gray-200 overflow-hidden z-50"
          >
            {/* Close button for expanded panel */}
            {panelState === 'expanded' && (
              <button
                className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-md"
                onClick={() => handlePanelStateChange('closed')}
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <SourcingProfileSidePanel
              userData={transformCandidateToUserStructuredData(selectedCandidateData)}
              panelState={panelState}
              onStateChange={handlePanelStateChange}
              candidateId={selectedCandidateId || undefined}
            />
          </div>
        </>
      )}
    </>
  );
};

export default CandidateOutreachProspects;
