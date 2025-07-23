import React, { useState, useMemo } from 'react';
import { Search, Plus, LayoutGrid, List, Filter, ChevronDown, Building } from 'lucide-react';
import { useProjectProspects } from '../../../hooks/useClientOutreach';
import { ClientOutreachKanbanView } from './pipeline/ClientOutreachKanbanView';
import type { ClientOutreachProspect } from './pipeline/ClientOutreachKanbanView';

interface FilterState {
  search: string;
  status: string;
  priority: string;
  industry: string;
  location: string;
  minEmployees: number | undefined;
  maxEmployees: number | undefined;
  hasNotes: boolean | undefined;
}

const PROSPECT_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'responded', label: 'Responded' },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: '1', label: 'High Priority' },
  { value: '2', label: 'Medium Priority' },
  { value: '3', label: 'Low Priority' },
];

// Default stages for client outreach pipeline
const DEFAULT_STAGES = ['new', 'contacted', 'responded', 'meeting_scheduled', 'qualified', 'unqualified'];

interface ClientOutreachProspectsProps {
  projectId?: string;
}

const ClientOutreachProspects: React.FC<ClientOutreachProspectsProps> = ({ projectId }) => {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    priority: '',
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
      priority: prospect.priority,
      matchScore: prospect.matchScore,
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

      // Status filter
      if (filters.status && prospect.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority && prospect.priority.toString() !== filters.priority) {
        return false;
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
    // TODO: Implement stage change API call
    console.log('Moving prospect', prospectId, 'to stage', newStage);
  };

  const handleProspectRemove = (prospect: ClientOutreachProspect) => {
    // TODO: Implement prospect removal
    console.log('Removing prospect:', prospect);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Prospects Pipeline</h2>
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
                    ? 'bg-blue-600 text-white'
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
                    ? 'bg-blue-600 text-white'
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {PROSPECT_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {PRIORITY_OPTIONS.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                stages={DEFAULT_STAGES}
                onProspectClick={handleProspectClick}
                onProspectStageChange={handleProspectStageChange}
                onProspectRemove={handleProspectRemove}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">List view coming soon...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOutreachProspects;
