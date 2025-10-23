import React from 'react';
import { Briefcase, Calendar, FileText, Award, Search, X } from 'lucide-react';

interface TalEmailFiltersProps {
  onFilterChange: (query: string, label: string) => void;
  currentFilter?: string;
}

/**
 * TAL Email Filter Presets
 * Uses Gmail API query syntax for server-side filtering
 */
export function TalEmailFilters({ onFilterChange, currentFilter }: TalEmailFiltersProps) {
  const presets = [
    {
      id: 'all-tal',
      label: 'All TAL Emails',
      icon: Search,
      query: '(subject:interview OR subject:candidate OR subject:job OR subject:application OR subject:resume OR subject:cv OR subject:hire OR subject:recruitment)',
      description: 'All recruitment-related emails',
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      activeColor: 'bg-blue-600 text-white border-blue-700',
    },
    {
      id: 'interviews',
      label: 'Interviews',
      icon: Calendar,
      query: '(subject:interview OR subject:schedule OR subject:meeting) newer_than:30d',
      description: 'Interview scheduling (last 30 days)',
      color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      activeColor: 'bg-green-600 text-white border-green-700',
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: FileText,
      query: 'has:attachment (subject:application OR subject:resume OR subject:cv) newer_than:60d',
      description: 'Candidate applications with attachments',
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      activeColor: 'bg-purple-600 text-white border-purple-700',
    },
    {
      id: 'offers',
      label: 'Offers',
      icon: Award,
      query: '(subject:"offer letter" OR subject:offer OR subject:"job offer")',
      description: 'Job offers and offer letters',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
      activeColor: 'bg-yellow-600 text-white border-yellow-700',
    },
    {
      id: 'active',
      label: 'Active',
      icon: Briefcase,
      query: 'is:unread (subject:candidate OR subject:interview OR subject:application) newer_than:14d',
      description: 'Unread candidate emails (last 2 weeks)',
      color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      activeColor: 'bg-red-600 text-white border-red-700',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Quick TAL Filters
        </h3>
        {currentFilter && (
          <button
            onClick={() => onFilterChange('', '')}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {presets.map((preset) => {
          const Icon = preset.icon;
          const isActive = currentFilter === preset.id;
          
          return (
            <button
              key={preset.id}
              onClick={() => onFilterChange(preset.query, preset.id)}
              className={`
                flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left
                ${isActive ? preset.activeColor : preset.color}
              `}
              title={preset.description}
            >
              <Icon className="w-5 h-5 mb-2" />
              <span className="text-sm font-medium">{preset.label}</span>
              <span className="text-xs opacity-75 mt-1 line-clamp-2">
                {preset.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Advanced Search Examples */}
      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-600 mb-2">
          <span className="font-medium">Advanced search examples:</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('subject:interview is:unread', 'custom')}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Unread interviews
          </button>
          <button
            onClick={() => onFilterChange('has:attachment filename:pdf subject:resume', 'custom')}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Resumes (PDF)
          </button>
          <button
            onClick={() => onFilterChange('from:linkedin.com OR from:indeed.com', 'custom')}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Job boards
          </button>
          <button
            onClick={() => onFilterChange('is:starred newer_than:7d', 'custom')}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Starred (7 days)
          </button>
        </div>
      </div>
    </div>
  );
}
