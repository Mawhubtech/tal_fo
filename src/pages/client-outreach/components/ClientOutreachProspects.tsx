import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, LayoutGrid, List, Filter, ChevronDown, Building } from 'lucide-react';
import { useProjectProspects, useUpdateProspect, useProject } from '../../../hooks/useClientOutreach';
import { useClientDefaultPipeline } from '../../../hooks/useClientPipeline';
import { ClientOutreachKanbanView } from './pipeline/ClientOutreachKanbanView';
import ClientOutreachListView from './ClientOutreachListView';
import type { ClientOutreachProspect } from './pipeline/ClientOutreachKanbanView';

interface FilterState {
  search: string;
  stage: string; // Changed from 'status' to 'stage'
  industry: string;
  location: string;
  minEmployees: number | undefined;
  maxEmployees: number | undefined;
  hasNotes: boolean | undefined;
}



interface ClientOutreachProspectsProps {
  projectId?: string;
}

const ClientOutreachProspects: React.FC<ClientOutreachProspectsProps> = ({ projectId }) => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Get project data (which includes pipeline info)
  const { data: project, isLoading: projectLoading } = useProject(projectId!);
  
  // Get default client pipeline (fallback)
  const { data: defaultPipeline, isLoading: pipelineLoading, error: pipelineError } = useClientDefaultPipeline();
  
  // Use project's pipeline if available, otherwise fall back to default
  const pipeline = project?.pipeline || defaultPipeline;
  
  // Validate pipeline has stages before using
  const isValidPipeline = pipeline && pipeline.stages && pipeline.stages.length > 0;
  
  if (!isValidPipeline && (project?.pipelineId || defaultPipeline)) {
    console.warn('WARNING: Pipeline missing stages, this may cause stage update errors');
  }
  
  // Debug: Log pipeline information
  useEffect(() => {
    console.log('DEBUG: ===== PIPELINE DEBUG INFO =====');
    console.log('DEBUG: Project object:', project);
    console.log('DEBUG: Project pipelineId:', project?.pipelineId);
    console.log('DEBUG: Project pipeline object:', project?.pipeline);
    console.log('DEBUG: Default pipeline:', defaultPipeline);
    
    if (pipeline) {
      console.log('DEBUG: FINAL pipeline being used:', {
        id: pipeline.id,
        name: pipeline.name,
        stageCount: pipeline.stages?.length || 0,
        stages: pipeline.stages?.map(s => ({ id: s.id, name: s.name })) || []
      });
    } else {
      console.log('DEBUG: NO PIPELINE AVAILABLE');
    }
    console.log('DEBUG: ================================');
  }, [pipeline, project, defaultPipeline]);
  
  // Mutation for updating prospect stage
  const updateProspectMutation = useUpdateProspect();
  
  // Helper function to get current stage ID for a prospect
  const getProspectStageId = (prospect: ClientOutreachProspect): string => {
    if (prospect.currentStageId) {
      return prospect.currentStageId;
    }
    if (prospect.currentStage?.id) {
      return prospect.currentStage.id;
    }
    // Fallback to status for backward compatibility
    return prospect.status;
  };

  // Helper function to get current stage name for a prospect
  const getProspectStageName = (prospect: ClientOutreachProspect): string => {
    const stageId = getProspectStageId(prospect);
    const stage = pipeline?.stages?.find(s => s.id === stageId);
    return stage?.name || stageId;
  };
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    stage: '', // Changed from 'status' to 'stage'
    industry: '',
    location: '',
    minEmployees: undefined,
    maxEmployees: undefined,
    hasNotes: undefined,
  });

  // Fetch prospects for the project
  const { data: rawProspects = [], isLoading, error } = useProjectProspects(projectId!);

  // Convert raw prospect data to ClientOutreachProspect format
  const prospects: ClientOutreachProspect[] = useMemo(() => {
    return rawProspects.map(prospect => ({
      id: prospect.id,
      companyName: prospect.companyName,
      website: prospect.website,
      industry: prospect.industry,
      location: prospect.location,
      employeeCount: prospect.employeeCount,
      sizeRange: prospect.sizeRange,
      description: prospect.description,
      status: prospect.status,
      currentStageId: prospect.currentStageId,
      notes: prospect.notes,
      linkedinUrl: prospect.linkedinUrl,
      createdAt: prospect.createdAt,
      updatedAt: prospect.updatedAt,
    }));
  }, [rawProspects]);

  // Apply filters to prospects
  const filteredProspects = useMemo(() => {
    return prospects.filter(prospect => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          prospect.companyName.toLowerCase().includes(searchTerm) ||
          prospect.industry?.toLowerCase().includes(searchTerm) ||
          prospect.location?.toLowerCase().includes(searchTerm) ||
          prospect.description?.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }

      // Stage filter
      if (filters.stage) {
        const prospectStageId = getProspectStageId(prospect);
        if (prospectStageId !== filters.stage) {
          return false;
        }
      }

      // Industry filter
      if (filters.industry && prospect.industry !== filters.industry) {
        return false;
      }

      // Location filter
      if (filters.location && prospect.location !== filters.location) {
        return false;
      }

      // Employee count filters
      if (filters.minEmployees !== undefined && (!prospect.employeeCount || prospect.employeeCount < filters.minEmployees)) {
        return false;
      }
      if (filters.maxEmployees !== undefined && (!prospect.employeeCount || prospect.employeeCount > filters.maxEmployees)) {
        return false;
      }

      // Notes filter
      if (filters.hasNotes !== undefined) {
        const hasNotes = !!(prospect.notes && prospect.notes.trim());
        if (filters.hasNotes !== hasNotes) {
          return false;
        }
      }

      return true;
    });
  }, [prospects, filters]);

  // Get unique values for filter dropdowns
  const uniqueIndustries = useMemo(() => {
    const industries = prospects.map(p => p.industry).filter(Boolean);
    return Array.from(new Set(industries)).sort();
  }, [prospects]);

  const uniqueLocations = useMemo(() => {
    const locations = prospects.map(p => p.location).filter(Boolean);
    return Array.from(new Set(locations)).sort();
  }, [prospects]);

  const handleProspectClick = (prospect: ClientOutreachProspect) => {
    // TODO: Open prospect detail panel/modal
    console.log('Prospect clicked:', prospect);
  };

  const handleProspectStageChange = async (prospectId: string, newStage: string) => {
    console.log('DEBUG: handleProspectStageChange called with:', { prospectId, newStage });
    
    // Validate the new stage exists in current pipeline
    if (!pipeline || !pipeline.stages) {
      console.error('ERROR: No pipeline or stages available');
      throw new Error('Pipeline not loaded');
    }
    
    const stageExists = pipeline.stages.find(s => s.id === newStage);
    if (!stageExists) {
      console.error('ERROR: Stage ID does not exist in pipeline:', {
        requestedStage: newStage,
        availableStages: pipeline.stages.map(s => ({ id: s.id, name: s.name }))
      });
      throw new Error(`Stage ${newStage} not found in pipeline`);
    }
    
    try {
      await updateProspectMutation.mutateAsync({
        id: prospectId,
        data: { 
          currentStageId: newStage
        }
      });
      console.log('DEBUG: Update successful');
    } catch (error) {
      console.error('Failed to update prospect stage:', error);
      // Error handling could be enhanced with toast notifications or user feedback
      throw error; // Re-throw to let the kanban view handle the error state
    }
  };

  const handleProspectRemove = (prospect: ClientOutreachProspect) => {
    // TODO: Implement prospect removal
    console.log('Removing prospect:', prospect);
  };

  if (isLoading || pipelineLoading || projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">
          {projectLoading ? 'Loading project...' : pipelineLoading ? 'Loading pipeline...' : 'Loading prospects...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error loading prospects</div>
        <p className="text-gray-600">Please try again later</p>
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error loading pipeline</div>
        <p className="text-gray-600">
          {pipelineError ? 'Unable to load pipeline.' : 'No pipeline available for this project.'}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {defaultPipeline?.name || 'Prospects Pipeline'}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredProspects.length} of {prospects.length} prospects
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setView('kanban')}
                className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                  view === 'kanban'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Kanban
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {/* Basic Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search prospects..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Stage Filter */}
            <select
              value={filters.stage}
              onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Stages</option>
              {pipeline?.stages?.map(stage => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Industry Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  value={filters.industry}
                  onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Industries</option>
                  {uniqueIndustries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee Count Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Employees</label>
                <input
                  type="number"
                  value={filters.minEmployees || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    minEmployees: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Min employees"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Employees</label>
                <input
                  type="number"
                  value={filters.maxEmployees || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    maxEmployees: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Max employees"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {filteredProspects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Building className="w-16 h-16 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {prospects.length === 0 ? 'No prospects yet' : 'No prospects match your filters'}
            </h3>
            <p className="text-sm">
              {prospects.length === 0 
                ? 'Start by adding prospects to your pipeline'
                : 'Try adjusting your search criteria or filters'
              }
            </p>
          </div>
        ) : (
          <div className="h-full p-6">
            {view === 'kanban' ? (
              <ClientOutreachKanbanView
                prospects={filteredProspects}
                pipeline={pipeline}
                onProspectClick={handleProspectClick}
                onProspectStageChange={handleProspectStageChange}
                onProspectRemove={handleProspectRemove}
              />
            ) : (
              <ClientOutreachListView
                prospects={filteredProspects}
                pipeline={pipeline}
                onProspectClick={handleProspectClick}
                onProspectStageChange={handleProspectStageChange}
                onProspectRemove={handleProspectRemove}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOutreachProspects;
