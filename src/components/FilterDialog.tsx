import React, { useState, useCallback, useMemo } from 'react';
import {
  X,
  MapPin,
  Briefcase,
  Building,
  Layers,
  KeySquare,
  GraduationCap,
  Globe,
  Star,
  Zap,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Command,
} from 'lucide-react';

// Types
interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: FilterState) => void;
}

interface FilterState {
  general: {
    minExperience: string;
    maxExperience: string;
    requiredContactInfo: string;
    hideViewedProfiles: string;
    onlyConnections: string;
  };
  location: {
    currentLocations: string[];
    pastLocations: string[];
    radius: string;
    timezone: boolean;
  };
  job: {
    titles: string[];
    skills: string[];
  };
  company: {
    names: string[];
    industries: string[];
    size: string;
  };
  funding: {
    // Add funding specific fields
  };
  skillsKeywords: {
    items: string[];
  };
  power: {
    isOpenToRemote: boolean;
    hasEmail: boolean;
    hasPhone: boolean;
  };
  likelyToSwitch: {
    likelihood: string;
    recentActivity: string;
  };
  education: {
    schools: string[];
    degrees: string[];
    majors: string[];
  };
  languages: {
    items: string[];
  };
  boolean: {
    fullName: string;
    booleanString: string;
  };
}

interface ArrayInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  helpText?: string;
}

interface FilterSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  hasActiveFilters?: boolean;
}

// Enhanced ArrayInput component with better UX
const ArrayInput: React.FC<ArrayInputProps> = ({ 
  label, 
  values, 
  onChange, 
  placeholder,
  helpText 
}) => {
  const [currentValue, setCurrentValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddValue = useCallback(() => {
    const trimmedValue = currentValue.trim();
    if (trimmedValue && !values.includes(trimmedValue)) {
      onChange([...values, trimmedValue]);
      setCurrentValue('');
    }
  }, [currentValue, values, onChange]);

  const handleRemoveValue = useCallback((valueToRemove: string) => {
    onChange(values.filter(value => value !== valueToRemove));
  }, [values, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddValue();
    }
  }, [handleAddValue]);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {values.length > 0 && (
          <span className="text-xs text-gray-500">{values.length} item{values.length !== 1 ? 's' : ''}</span>
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          placeholder={placeholder || `Add ${label.toLowerCase().slice(0, -1)}`}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={handleAddValue}
          disabled={!currentValue.trim()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-md text-sm transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {helpText && (
        <p className="text-xs text-gray-500 mb-3">{helpText}</p>
      )}

      {values.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Selected {label}</span>
            {values.length > 3 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                {isExpanded ? 'Show less' : `Show all (${values.length})`}
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
          
          <div className={`flex flex-wrap gap-2 ${!isExpanded && values.length > 3 ? 'max-h-20 overflow-hidden' : ''}`}>
            {values.map((value, index) => (
              <div
                key={`${value}-${index}`}
                className="flex items-center bg-purple-50 border border-purple-200 rounded-md px-3 py-1.5 text-sm"
              >
                <span className="text-purple-800">{value}</span>
                <button
                  onClick={() => handleRemoveValue(value)}
                  className="ml-2 text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Collapsible filter section component
const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
  hasActiveFilters = false
}) => (
  <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={hasActiveFilters ? 'text-purple-600' : 'text-gray-500'} />
        <span className={`font-medium ${hasActiveFilters ? 'text-purple-700' : 'text-gray-700'}`}>
          {title}
        </span>
        {hasActiveFilters && (
          <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
        )}
      </div>
      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
    {isExpanded && (
      <div className="p-4 border-t border-gray-200">
        {children}
      </div>
    )}
  </div>
);

// Active Filters Summary Component
const ActiveFiltersSummary: React.FC<{ filters: FilterState; onRemoveFilter: (section: keyof FilterState, field: string, value?: string) => void }> = ({ 
  filters, 
  onRemoveFilter 
}) => {
  const activeFilters: Array<{ section: keyof FilterState; field: string; value: any; label: string; displayValue: string }> = [];

  // Collect all active filters
  Object.entries(filters).forEach(([section, sectionData]) => {
    if (typeof sectionData === 'object' && sectionData !== null) {
      Object.entries(sectionData).forEach(([field, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach(item => {
            activeFilters.push({
              section: section as keyof FilterState,
              field,
              value: item,
              label: `${field.charAt(0).toUpperCase() + field.slice(1)}`,
              displayValue: item
            });
          });
        } else if (typeof value === 'boolean' && value) {
          activeFilters.push({
            section: section as keyof FilterState,
            field,
            value,
            label: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
            displayValue: 'Yes'
          });
        } else if (typeof value === 'string' && value.trim() !== '' && value !== '25') {
          activeFilters.push({
            section: section as keyof FilterState,
            field,
            value,
            label: field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1'),
            displayValue: value
          });
        }
      });
    }
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-purple-800">
          Active Filters ({activeFilters.length})
        </h3>
        <button
          onClick={() => {
            // Clear all filters by calling onRemoveFilter for each
            activeFilters.forEach(filter => {
              onRemoveFilter(filter.section, filter.field, filter.value);
            });
          }}
          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
        >
          Clear All
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter, index) => (
          <div
            key={`${filter.section}-${filter.field}-${filter.value}-${index}`}
            className="inline-flex items-center bg-white border border-purple-300 rounded-md px-3 py-1.5 text-sm"
          >
            <span className="text-purple-700">
              <span className="font-medium">{filter.label}:</span> {filter.displayValue}
            </span>
            <button
              onClick={() => onRemoveFilter(filter.section, filter.field, filter.value)}
              className="ml-2 text-purple-500 hover:text-purple-700 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main FilterDialog component
const FilterDialog: React.FC<FilterDialogProps> = ({ isOpen, onClose, onApplyFilters }) => {
  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    location: false,
    job: false,
    company: false,
    funding: false,
    skills: false,
    power: false,
    likely: false,
    education: false,
    languages: false,
    boolean: false,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    general: {
      minExperience: '0',
      maxExperience: '',
      requiredContactInfo: '',
      hideViewedProfiles: '',
      onlyConnections: '',
    },
    location: {
      currentLocations: ['San Francisco'],
      pastLocations: [],
      radius: '25',
      timezone: false,
    },
    job: {
      titles: ['Product Manager'],
      skills: ['JavaScript'],
    },
    company: {
      names: [],
      industries: [],
      size: '',
    },
    funding: {},
    skillsKeywords: {
      items: [],
    },
    power: {
      isOpenToRemote: false,
      hasEmail: false,
      hasPhone: false,
    },
    likelyToSwitch: {
      likelihood: '',
      recentActivity: '',
    },
    education: {
      schools: [],
      degrees: [],
      majors: [],
    },
    languages: {
      items: [],
    },
    boolean: {
      fullName: '',
      booleanString: '',
    },
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // Update filter helper
  const updateFilter = useCallback((section: keyof FilterState, field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }, []);

  // Check if section has active filters
  const hasActiveFilters = useCallback((section: keyof FilterState): boolean => {
    const sectionData = filters[section];
    if (typeof sectionData === 'object') {
      return Object.values(sectionData).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.trim() !== '';
        return false;
      });
    }
    return false;
  }, [filters]);

  // Calculate total active filters
  const totalActiveFilters = useMemo(() => {
    return Object.keys(filters).reduce((count, section) => {
      return count + (hasActiveFilters(section as keyof FilterState) ? 1 : 0);
    }, 0);
  }, [filters, hasActiveFilters]);

  // Handle apply filters
  const handleApplyFilters = useCallback(() => {
    onApplyFilters?.(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setFilters({
      general: {
        minExperience: '',
        maxExperience: '',
        requiredContactInfo: '',
        hideViewedProfiles: '',
        onlyConnections: '',
      },
      location: {
        currentLocations: [],
        pastLocations: [],
        radius: '25',
        timezone: false,
      },
      job: {
        titles: [],
        skills: [],
      },
      company: {
        names: [],
        industries: [],
        size: '',
      },
      funding: {},
      skillsKeywords: {
        items: [],
      },
      power: {
        isOpenToRemote: false,
        hasEmail: false,
        hasPhone: false,
      },
      likelyToSwitch: {
        likelihood: '',
        recentActivity: '',
      },
      education: {
        schools: [],
        degrees: [],
        majors: [],
      },
      languages: {
        items: [],
      },
      boolean: {
        fullName: '',
        booleanString: '',
      },
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Search Filters</h2>
            <p className="text-sm text-gray-500 mt-1">
              {totalActiveFilters > 0 ? `${totalActiveFilters} active filter${totalActiveFilters !== 1 ? 's' : ''}` : 'No active filters'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded-full">
              694 matches
            </span>
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded-md transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleApplyFilters}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Apply Filters
            </button>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 p-1 rounded-md transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search filters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>        {/* Active Filters Summary */}
        <ActiveFiltersSummary 
          filters={filters} 
          onRemoveFilter={(section, field, value) => {
            // Handle individual filter removal
            const sectionData = filters[section] as any;
            if (Array.isArray(sectionData[field])) {
              // For array fields, remove the specific value
              updateFilter(section, field, sectionData[field].filter((v: any) => v !== value));
            } else {
              // For non-array fields, reset the field to its initial state
              updateFilter(section, field, '');
            }
          }}
        />

        {/* Filters Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* General Filters */}
            <FilterSection
              title="General Filters"
              icon={Layers}
              isExpanded={expandedSections.general}
              onToggle={() => toggleSection('general')}
              hasActiveFilters={hasActiveFilters('general')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Min Experience (Years)</label>
                  <input
                    type="number"
                    value={filters.general.minExperience}
                    onChange={(e) => updateFilter('general', 'minExperience', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Max Experience (Years)</label>
                  <input
                    type="number"
                    value={filters.general.maxExperience}
                    onChange={(e) => updateFilter('general', 'maxExperience', e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Required Contact Info</label>
                  <select
                    value={filters.general.requiredContactInfo}
                    onChange={(e) => updateFilter('general', 'requiredContactInfo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Any contact info</option>
                    <option value="email">Email required</option>
                    <option value="phone">Phone required</option>
                    <option value="linkedin">LinkedIn required</option>
                    <option value="all">All contact info required</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Hide Viewed/Shortlisted</label>
                  <select
                    value={filters.general.hideViewedProfiles}
                    onChange={(e) => updateFilter('general', 'hideViewedProfiles', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Don't hide profiles</option>
                    <option value="viewed">Hide viewed profiles</option>
                    <option value="shortlisted">Hide shortlisted profiles</option>
                    <option value="both">Hide both</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Connection Level</label>
                  <select
                    value={filters.general.onlyConnections}
                    onChange={(e) => updateFilter('general', 'onlyConnections', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All connections</option>
                    <option value="1st">1st connections only</option>
                    <option value="2nd">2nd connections only</option>
                    <option value="3rd">3rd connections only</option>
                  </select>
                </div>
              </div>
            </FilterSection>

            {/* Location Filters */}
            <FilterSection
              title="Location Filters"
              icon={MapPin}
              isExpanded={expandedSections.location}
              onToggle={() => toggleSection('location')}
              hasActiveFilters={hasActiveFilters('location')}
            >
              <ArrayInput
                label="Current Locations"
                values={filters.location.currentLocations}
                onChange={(values) => updateFilter('location', 'currentLocations', values)}
                placeholder="Enter city, state, or country"
                helpText="Add multiple locations to search across different areas"
              />
              
              <ArrayInput
                label="Past Locations"
                values={filters.location.pastLocations}
                onChange={(values) => updateFilter('location', 'pastLocations', values)}
                placeholder="Enter past city, state, or country"
                helpText="Find candidates who previously worked in these locations"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Search Radius</label>
                  <select
                    value={filters.location.radius}
                    onChange={(e) => updateFilter('location', 'radius', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="25">Within 25 miles</option>
                    <option value="50">Within 50 miles</option>
                    <option value="100">Within 100 miles</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="timezone"
                    checked={filters.location.timezone}
                    onChange={(e) => updateFilter('location', 'timezone', e.target.checked)}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded accent-purple-600"
                  />
                  <label htmlFor="timezone" className="ml-2 text-sm font-medium text-gray-700">
                    Match timezone
                  </label>
                </div>
              </div>
            </FilterSection>

            {/* Job Filters */}
            <FilterSection
              title="Job & Skills"
              icon={Briefcase}
              isExpanded={expandedSections.job}
              onToggle={() => toggleSection('job')}
              hasActiveFilters={hasActiveFilters('job')}
            >
              <ArrayInput
                label="Job Titles"
                values={filters.job.titles}
                onChange={(values) => updateFilter('job', 'titles', values)}
                placeholder="Enter job title"
                helpText="Search for specific job titles or roles"
              />
              
              <ArrayInput
                label="Skills & Technologies"
                values={filters.job.skills}
                onChange={(values) => updateFilter('job', 'skills', values)}
                placeholder="Enter skill or technology"
                helpText="Find candidates with specific technical or professional skills"
              />
            </FilterSection>

            {/* Company Filters */}
            <FilterSection
              title="Company & Industry"
              icon={Building}
              isExpanded={expandedSections.company}
              onToggle={() => toggleSection('company')}
              hasActiveFilters={hasActiveFilters('company')}
            >
              <ArrayInput
                label="Company Names"
                values={filters.company.names}
                onChange={(values) => updateFilter('company', 'names', values)}
                placeholder="Enter company name"
                helpText="Search for candidates from specific companies"
              />
              
              <ArrayInput
                label="Industries"
                values={filters.company.industries}
                onChange={(values) => updateFilter('company', 'industries', values)}
                placeholder="Enter industry"
                helpText="Find candidates with experience in specific industries"
              />

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Company Size</label>
                <select
                  value={filters.company.size}
                  onChange={(e) => updateFilter('company', 'size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Any size</option>
                  <option value="1-10">Startup (1-10 employees)</option>
                  <option value="11-50">Small (11-50 employees)</option>
                  <option value="51-200">Medium (51-200 employees)</option>
                  <option value="201-500">Large (201-500 employees)</option>
                  <option value="501-1000">Enterprise (501-1000 employees)</option>
                  <option value="1001+">Fortune 500 (1001+ employees)</option>
                </select>
              </div>
            </FilterSection>

            {/* Power Filters */}
            <FilterSection
              title="Power Filters"
              icon={Zap}
              isExpanded={expandedSections.power}
              onToggle={() => toggleSection('power')}
              hasActiveFilters={hasActiveFilters('power')}
            >
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="openToRemote"
                    checked={filters.power.isOpenToRemote}
                    onChange={(e) => updateFilter('power', 'isOpenToRemote', e.target.checked)}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded accent-purple-600"
                  />
                  <label htmlFor="openToRemote" className="ml-3 text-sm font-medium text-gray-700">
                    Open to Remote Work
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasVerifiedEmail"
                    checked={filters.power.hasEmail}
                    onChange={(e) => updateFilter('power', 'hasEmail', e.target.checked)}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded accent-purple-600"
                  />
                  <label htmlFor="hasVerifiedEmail" className="ml-3 text-sm font-medium text-gray-700">
                    Has Verified Email
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasVerifiedPhone"
                    checked={filters.power.hasPhone}
                    onChange={(e) => updateFilter('power', 'hasPhone', e.target.checked)}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded accent-purple-600"
                  />
                  <label htmlFor="hasVerifiedPhone" className="ml-3 text-sm font-medium text-gray-700">
                    Has Verified Phone Number
                  </label>
                </div>
              </div>
            </FilterSection>

            {/* Likely to Switch */}
            <FilterSection
              title="Job Change Likelihood"
              icon={Star}
              isExpanded={expandedSections.likely}
              onToggle={() => toggleSection('likely')}
              hasActiveFilters={hasActiveFilters('likelyToSwitch')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Likelihood to Switch</label>
                  <select
                    value={filters.likelyToSwitch.likelihood}
                    onChange={(e) => updateFilter('likelyToSwitch', 'likelihood', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Any likelihood</option>
                    <option value="very_likely">Very Likely (Actively looking)</option>
                    <option value="likely">Likely (Open to opportunities)</option>
                    <option value="somewhat_likely">Somewhat Likely (Passive)</option>
                    <option value="unlikely">Unlikely (Happy in current role)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Recent Activity</label>
                  <select
                    value={filters.likelyToSwitch.recentActivity}
                    onChange={(e) => updateFilter('likelyToSwitch', 'recentActivity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Any activity level</option>
                    <option value="last_24_hours">Active in last 24 hours</option>
                    <option value="last_7_days">Active in last 7 days</option>
                    <option value="last_30_days">Active in last 30 days</option>
                    <option value="last_90_days">Active in last 90 days</option>
                  </select>
                </div>
              </div>
            </FilterSection>

            {/* Education Filters */}
            <FilterSection
              title="Education"
              icon={GraduationCap}
              isExpanded={expandedSections.education}
              onToggle={() => toggleSection('education')}
              hasActiveFilters={hasActiveFilters('education')}
            >
              <ArrayInput
                label="Schools & Universities"
                values={filters.education.schools}
                onChange={(values) => updateFilter('education', 'schools', values)}
                placeholder="Enter school or university name"
                helpText="Find candidates from specific educational institutions"
              />
              
              <ArrayInput
                label="Degrees"
                values={filters.education.degrees}
                onChange={(values) => updateFilter('education', 'degrees', values)}
                placeholder="Enter degree type (e.g., Bachelor's, Master's, PhD)"
                helpText="Search by degree level or type"
              />
              
              <ArrayInput
                label="Fields of Study"
                values={filters.education.majors}
                onChange={(values) => updateFilter('education', 'majors', values)}
                placeholder="Enter field of study or major"
                helpText="Find candidates with specific academic backgrounds"
              />
            </FilterSection>

            {/* Skills & Keywords */}
            <FilterSection
              title="Additional Skills & Keywords"
              icon={KeySquare}
              isExpanded={expandedSections.skills}
              onToggle={() => toggleSection('skills')}
              hasActiveFilters={hasActiveFilters('skillsKeywords')}
            >
              <ArrayInput
                label="Skills, Keywords, or Buzzwords"
                values={filters.skillsKeywords.items}
                onChange={(values) => updateFilter('skillsKeywords', 'items', values)}
                placeholder="Enter any skill, keyword, or term"
                helpText="Broad search across profiles for any mentioned skills or keywords"
              />
            </FilterSection>

            {/* Languages */}
            <FilterSection
              title="Languages"
              icon={Globe}
              isExpanded={expandedSections.languages}
              onToggle={() => toggleSection('languages')}
              hasActiveFilters={hasActiveFilters('languages')}
            >
              <ArrayInput
                label="Languages Spoken"
                values={filters.languages.items}
                onChange={(values) => updateFilter('languages', 'items', values)}
                placeholder="Enter language (e.g., Spanish, Mandarin, French)"
                helpText="Find candidates who speak specific languages"
              />
            </FilterSection>

            {/* Boolean & Name Search */}
            <FilterSection
              title="Advanced Search"
              icon={Command}
              isExpanded={expandedSections.boolean}
              onToggle={() => toggleSection('boolean')}
              hasActiveFilters={hasActiveFilters('boolean')}
            >
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Full Name Search</label>
                  <input
                    type="text"
                    value={filters.boolean.fullName}
                    onChange={(e) => updateFilter('boolean', 'fullName', e.target.value)}
                    placeholder="Enter exact name to search for"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Search for specific individuals by their full name</p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Boolean Search String</label>
                  <textarea
                    value={filters.boolean.booleanString}
                    onChange={(e) => updateFilter('boolean', 'booleanString', e.target.value)}
                    placeholder='Example: ("software engineer" OR "developer") AND (React OR Angular) NOT "manager"'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use AND, OR, NOT operators with quotes for exact phrases. Supports complex search logic.
                  </p>
                </div>
              </div>
            </FilterSection>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {totalActiveFilters > 0 && (
                <span>{totalActiveFilters} active filter{totalActiveFilters !== 1 ? 's' : ''} applied</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterDialog;
