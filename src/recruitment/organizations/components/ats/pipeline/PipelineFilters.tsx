import React from 'react';
import { Search, Filter } from 'lucide-react';
import type { Pipeline } from '../../../../../services/pipelineService';

interface PipelineFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStage: string;
  onStageChange: (stage: string) => void;
  sortBy: 'date' | 'score';
  onSortChange: (sort: 'date' | 'score') => void;
  pipeline?: Pipeline | null;
}

export const PipelineFilters: React.FC<PipelineFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedStage,
  onStageChange,
  sortBy,
  onSortChange,
  pipeline
}) => {
  // Get stages from pipeline, sorted by order
  const stages = pipeline?.stages
    ?.filter(stage => stage.isActive)
    ?.sort((a, b) => a.order - b.order)
    ?.map(stage => stage.name) || [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search candidates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Stage Filter */}
        <div className="md:w-48">
          <select
            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={selectedStage}
            onChange={(e) => onStageChange(e.target.value)}
          >
            <option value="all">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="md:w-48">
          <select
            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'date' | 'score')}
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Score</option>
          </select>
        </div>
      </div>
    </div>
  );
};
