import React, { useState } from 'react';
import { Search, Plus, LayoutGrid, List } from 'lucide-react';
import { useSourcingProspects, useSourcingDefaultPipeline, useMoveSourcingProspectStage, useDeleteSourcingProspect } from '../../hooks/useSourcingProspects';
import { PipelineKanbanView } from '../../recruitment/organizations/components/ats/pipeline/PipelineKanbanView';
import { PipelineListView } from '../../recruitment/organizations/components/ats/pipeline/PipelineListView';
import { PipelineStats } from '../../recruitment/organizations/components/ats/pipeline/PipelineStats';
import { SourcingProspect } from '../../services/sourcingApiService';

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

// Transform prospect to match Candidate interface expected by pipeline components
interface PipelineCandidate {
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
}

const CandidateOutreachProspects: React.FC = () => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Load sourcing prospects and pipeline
  const { data: sourcingData, isLoading: prospectsLoading, error: prospectsError } = useSourcingProspects({
    search: searchTerm || undefined,
    status: selectedStatus || undefined,
    skills: selectedSkill ? [selectedSkill] : undefined,
  });
  
  const { data: defaultPipeline, isLoading: pipelineLoading } = useSourcingDefaultPipeline();
  
  // Mutations
  const moveProspectMutation = useMoveSourcingProspectStage();
  const deleteProspectMutation = useDeleteSourcingProspect();

  const prospects = sourcingData?.prospects || [];
  const activePipeline = defaultPipeline;

  // Transform prospects to match pipeline candidate interface
  const transformProspectToPipelineCandidate = (prospect: SourcingProspect): PipelineCandidate => ({
    id: prospect.id,
    name: prospect.name,
    avatar: '', // Default empty avatar
    email: prospect.email,
    phone: prospect.phone || '',
    stage: prospect.status, // Map status to stage
    score: prospect.rating,
    lastUpdated: prospect.lastContact || prospect.updatedAt,
    tags: [prospect.source, prospect.experience, ...prospect.skills.slice(0, 2)], // Combine source, experience, and top skills as tags
    source: prospect.source,
    appliedDate: prospect.createdAt,
  });

  // Get all unique skills from prospects
  const allSkills = Array.from(new Set(prospects.flatMap(p => p.skills)));

  // Apply additional filtering (API already handles search, status, skills)
  const filteredProspects = prospects;

  // Transform filtered prospects to pipeline candidates
  const pipelineCandidates = filteredProspects.map(transformProspectToPipelineCandidate);

  // Helper function for pipeline stats
  const getCandidatesByStage = (stage: string) => {
    return pipelineCandidates.filter(candidate => candidate.stage === stage);
  };

  // Pipeline handlers
  const handleCandidateClick = (candidate: PipelineCandidate) => {
    console.log('Candidate clicked:', candidate);
    // TODO: Open candidate detail modal or navigate to candidate page
  };

  const handleCandidateStageChange = async (candidateId: string, newStage: string) => {
    console.log('Stage change:', candidateId, newStage);
    
    // Find the stage ID from the pipeline
    const stage = activePipeline?.stages?.find(s => s.name === newStage);
    if (!stage) {
      console.error('Stage not found:', newStage);
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

  const handleCandidateRemove = async (candidate: PipelineCandidate) => {
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
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Prospects</h1>
          <p className="text-gray-600 mt-1">Manage your candidate pipeline and outreach efforts</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Candidate</span>
        </button>
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
      {activePipeline && (
        <div className="mb-6">
          <PipelineStats 
            candidates={pipelineCandidates}
            pipeline={activePipeline}
            getCandidatesByStage={getCandidatesByStage}
          />
        </div>
      )}

      {/* Pipeline Views */}
      {activePipeline ? (
        <>
          {view === 'kanban' && (
            <PipelineKanbanView
              candidates={pipelineCandidates}
              pipeline={activePipeline}
              onCandidateClick={handleCandidateClick}
              onCandidateStageChange={handleCandidateStageChange}
              onCandidateRemove={handleCandidateRemove}
            />
          )}

          {view === 'list' && (
            <PipelineListView
              candidates={pipelineCandidates}
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
  );
};

export default CandidateOutreachProspects;
