import React, { useState } from 'react';
import { X, Search, Calendar, User, Filter } from 'lucide-react';
import type { InterviewFilters, InterviewStatus, InterviewType, InterviewStage } from '../../../../../types/interview.types';

interface InterviewFiltersPanelProps {
  filters: InterviewFilters;
  onFilterChange: (key: keyof InterviewFilters, value: any) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

const statusOptions = [
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Rescheduled', label: 'Rescheduled' },
  { value: 'No Show', label: 'No Show' },
];

const typeOptions = [
  { value: 'Phone Screen', label: 'Phone Screen' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Behavioral', label: 'Behavioral' },
  { value: 'Final', label: 'Final' },
  { value: 'Panel', label: 'Panel' },
  { value: 'Culture Fit', label: 'Culture Fit' },
  { value: 'Case Study', label: 'Case Study' },
  { value: 'Presentation', label: 'Presentation' },
];

const stageOptions = [
  { value: 'Initial Screening', label: 'Initial Screening' },
  { value: 'First Round', label: 'First Round' },
  { value: 'Second Round', label: 'Second Round' },
  { value: 'Third Round', label: 'Third Round' },
  { value: 'Final Round', label: 'Final Round' },
  { value: 'Follow-up', label: 'Follow-up' },
];

export const InterviewFiltersPanel: React.FC<InterviewFiltersPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onClose,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleLocalFilterChange = (key: keyof InterviewFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    Object.entries(localFilters).forEach(([key, value]) => {
      onFilterChange(key as keyof InterviewFilters, value);
    });
    onClose();
  };

  const clearAll = () => {
    setLocalFilters({});
    onClearFilters();
    onClose();
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filter Interviews
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Job ID Filter - only show if not already filtering by a specific job */}
        {!filters.jobId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job ID
            </label>
            <input
              type="text"
              placeholder="Enter job ID..."
              value={localFilters.jobId || ''}
              onChange={(e) => handleLocalFilterChange('jobId', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleLocalFilterChange('status', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interview Type
          </label>
          <select
            value={localFilters.type || ''}
            onChange={(e) => handleLocalFilterChange('type', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Types</option>
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Stage Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interview Stage
          </label>
          <select
            value={localFilters.stage || ''}
            onChange={(e) => handleLocalFilterChange('stage', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Stages</option>
            {stageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={localFilters.startDate ? localFilters.startDate.split('T')[0] : ''}
            onChange={(e) => handleLocalFilterChange('startDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={localFilters.endDate ? localFilters.endDate.split('T')[0] : ''}
            onChange={(e) => handleLocalFilterChange('endDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={clearAll}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Clear All
        </button>
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
