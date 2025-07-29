import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface ResourceFiltersProps {
  onSearchChange: (search: string) => void;
  onTypeFilter: (types: string[]) => void;
  onDifficultyFilter: (difficulties: string[]) => void;
  onClearFilters: () => void;
  searchTerm: string;
  selectedTypes: string[];
  selectedDifficulties: string[];
}

const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  onSearchChange,
  onTypeFilter,
  onDifficultyFilter,
  onClearFilters,
  searchTerm,
  selectedTypes,
  selectedDifficulties
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const availableTypes = [
    'guide', 'video', 'pdf', 'extension', 'templates', 'checklist', 'api', 'tool'
  ];

  const availableDifficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleTypeChange = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    onTypeFilter(newTypes);
  };

  const handleDifficultyChange = (difficulty: string) => {
    const newDifficulties = selectedDifficulties.includes(difficulty)
      ? selectedDifficulties.filter(d => d !== difficulty)
      : [...selectedDifficulties, difficulty];
    onDifficultyFilter(newDifficulties);
  };

  const hasActiveFilters = selectedTypes.length > 0 || selectedDifficulties.length > 0 || searchTerm.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-4 mb-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
            showFilters || hasActiveFilters
              ? 'border-purple-500 text-purple-700 bg-purple-50'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {selectedTypes.length + selectedDifficulties.length}
            </span>
          )}
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Clear</span>
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* Resource Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Resource Type</h4>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map(type => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeChange(type)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty Levels */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Difficulty Level</h4>
            <div className="flex flex-wrap gap-2">
              {availableDifficulties.map(difficulty => (
                <label key={difficulty} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes(difficulty)}
                    onChange={() => handleDifficultyChange(difficulty)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{difficulty}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex flex-wrap gap-2">
            {selectedTypes.map(type => (
              <span
                key={`type-${type}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {type}
                <button
                  onClick={() => handleTypeChange(type)}
                  className="ml-1 hover:text-purple-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedDifficulties.map(difficulty => (
              <span
                key={`difficulty-${difficulty}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {difficulty}
                <button
                  onClick={() => handleDifficultyChange(difficulty)}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceFilters;
