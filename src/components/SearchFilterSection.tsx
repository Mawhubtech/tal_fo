import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  Search as SearchIconUI, // Renamed to avoid conflict with Search page
  ChevronDown,
  ChevronUp,
  Plus,
  Command,
} from 'lucide-react';

// Assuming searchService.ts is located at '../../services/searchService'
// Adjust the path if necessary
import type { SearchFilters } from '../../services/searchService';

// Types
interface FilterDialogProps {
  onApplyFilters?: (filters: FilterState) => void;
  initialFilters?: SearchFilters;
}

export interface FilterState { // Exporting in case it's needed elsewhere
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
    // Add funding specific fields if any
  };
  skillsKeywords: {
    items: string[];
    requirements?: string[]; // For AI extracted requirements
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

// Enhanced ArrayInput component
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
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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

// Helper function to create the default initial state for filters
const createDefaultFilterState = (): FilterState => ({
  general: { minExperience: '0', maxExperience: '', requiredContactInfo: '', hideViewedProfiles: '', onlyConnections: '' },
  location: { currentLocations: [], pastLocations: [], radius: '25', timezone: false },
  job: { titles: [], skills: [] },
  company: { names: [], industries: [], size: '' },
  funding: {},
  skillsKeywords: { items: [], requirements: [] },
  power: { isOpenToRemote: false, hasEmail: false, hasPhone: false },
  likelyToSwitch: { likelihood: '', recentActivity: '' },
  education: { schools: [], degrees: [], majors: [] },
  languages: { items: [] },
  boolean: { fullName: '', booleanString: '' },
});


// Active Filters Summary Component
const ActiveFiltersSummary: React.FC<{ 
    filters: FilterState; 
    onRemoveFilter: (section: keyof FilterState, field: string, value?: any) => void;
    onClearAllFilters: () => void;
}> = ({ 
  filters, 
  onRemoveFilter,
  onClearAllFilters
}) => {
  const activeFiltersList: Array<{ section: keyof FilterState; field: string; value: any; label: string; displayValue: string }> = [];

  Object.entries(filters).forEach(([sectionKey, sectionData]) => {
    const section = sectionKey as keyof FilterState;
    if (typeof sectionData === 'object' && sectionData !== null) {
      Object.entries(sectionData).forEach(([field, value]) => {
        const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
        if (Array.isArray(value) && value.length > 0) {
          value.forEach(item => {
            activeFiltersList.push({ section, field, value: item, label: fieldLabel, displayValue: item });
          });
        } else if (typeof value === 'boolean' && value) {
          activeFiltersList.push({ section, field, value, label: fieldLabel, displayValue: 'Yes' });
        } else if (typeof value === 'string' && value.trim() !== '' && !(field === 'radius' && value === '25') && !(field === 'minExperience' && value === '0')) {
          // Avoid showing default "25 miles" radius or "0" minExperience if they are the only value for that field
          // unless other parts of 'general' or 'location' are active.
          // This simple check might need refinement based on specific UX goals for default values.
           if (value.trim()) { // Simpler: show if not empty
            activeFiltersList.push({ section, field, value, label: fieldLabel, displayValue: value });
           }
        }
      });
    }
  });

  if (activeFiltersList.length === 0) return null;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-purple-800">
          Active Filters ({activeFiltersList.length})
        </h3>
        <button
          onClick={onClearAllFilters}
          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
        >
          Clear All
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeFiltersList.map((filter, index) => (
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


// Main SearchFilters component
const SearchFiltersSection: React.FC<FilterDialogProps> = ({
  onApplyFilters,
  initialFilters,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true, location: false, job: false, company: false, funding: false,
    skills: false, power: false, likely: false, education: false, languages: false, boolean: false,
  });
  const [filters, setFilters] = useState<FilterState>(createDefaultFilterState());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const defaults = createDefaultFilterState();
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters({
        general: { ...defaults.general, ...initialFilters.general },
        location: {
          ...defaults.location,
          ...initialFilters.location,
          currentLocations: initialFilters.location?.currentLocations || defaults.location.currentLocations,
          pastLocations: initialFilters.location?.pastLocations || defaults.location.pastLocations,
        },
        job: {
          ...defaults.job,
          ...initialFilters.job,
          titles: initialFilters.job?.titles || defaults.job.titles,
          skills: initialFilters.job?.skills || defaults.job.skills,
        },
        company: {
          ...defaults.company,
          ...initialFilters.company,
          names: initialFilters.company?.names || defaults.company.names,
          industries: initialFilters.company?.industries || defaults.company.industries,
        },
        funding: { ...defaults.funding, /* ...initialFilters.funding if defined */ },
        skillsKeywords: {
          ...defaults.skillsKeywords,
          items: initialFilters.skillsKeywords?.items || defaults.skillsKeywords.items,
          requirements: initialFilters.skillsKeywords?.requirements || defaults.skillsKeywords.requirements,
        },
        power: { ...defaults.power, ...initialFilters.power },
        likelyToSwitch: { ...defaults.likelyToSwitch, ...initialFilters.likelyToSwitch },
        education: {
          ...defaults.education,
          ...initialFilters.education,
          schools: initialFilters.education?.schools || defaults.education.schools,
          degrees: initialFilters.education?.degrees || defaults.education.degrees,
          majors: initialFilters.education?.majors || defaults.education.majors,
        },
        languages: {
          ...defaults.languages,
          ...initialFilters.languages,
          items: initialFilters.languages?.items || defaults.languages.items,
        },
        boolean: { ...defaults.boolean, ...initialFilters.boolean },
      });
    } else {
      setFilters(defaults);
    }
  }, [initialFilters]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  const updateFilter = useCallback((section: keyof FilterState, field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  }, []);
  
  const handleRemoveFilterItem = (section: keyof FilterState, field: string, valueToRemove?: any) => {
    const sectionData = filters[section] as any;
    if (Array.isArray(sectionData[field]) && valueToRemove !== undefined) {
      updateFilter(section, field, sectionData[field].filter((v: any) => v !== valueToRemove));
    } else if (typeof sectionData[field] === 'boolean') {
        updateFilter(section, field, false); 
    } else {
      const defaultSectionValue = (createDefaultFilterState()[section] as any)[field];
      updateFilter(section, field, defaultSectionValue);
    }
  };


  const hasActiveFilters = useCallback((sectionKey: keyof FilterState): boolean => {
    const sectionData = filters[sectionKey];
    const defaultSectionData = createDefaultFilterState()[sectionKey];

    if (typeof sectionData === 'object' && sectionData !== null) {
      return Object.keys(sectionData).some(fieldKey => {
        const field = fieldKey as keyof typeof sectionData;
        const value = sectionData[field];
        const defaultValue = (defaultSectionData as any)[field];

        if (Array.isArray(value)) return (value as any[]).length > 0;
        // For non-array types, check if it's different from its default value
        return value !== defaultValue;
      });
    }
    return false;
  }, [filters]);

  const totalActiveFiltersCount = useMemo(() => {
    let count = 0;
    for (const section of Object.keys(filters) as Array<keyof FilterState>) {
      if (hasActiveFilters(section)) {
        count++;
      }
    }
    return count;
  }, [filters, hasActiveFilters]);


  const handleApplyFiltersCallback = useCallback(() => {
    onApplyFilters?.(filters);
  }, [filters, onApplyFilters]);

  const handleClearAll = useCallback(() => {
    setFilters(createDefaultFilterState());
  }, []);

  return (
    <div className="w-fullmx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Search Filters</h2>
            <p className="text-sm text-gray-500 mt-1">
              {totalActiveFiltersCount > 0 ? `${totalActiveFiltersCount} active filter category${totalActiveFiltersCount !== 1 ? 'ies' : 'y'}` : 'No active filters'}
            </p>
          </div>

        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <SearchIconUI size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search filters (e.g., 'Location', 'Skills')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>
        </div>
        
        <ActiveFiltersSummary 
            filters={filters} 
            onRemoveFilter={handleRemoveFilterItem}
            onClearAllFilters={handleClearAll}
        />

        <div className="overflow-y-auto p-4">
          <div className="space-y-4">
            {/* General Filters */}
            <FilterSection
              title="General Filters" icon={Layers} isExpanded={expandedSections.general}
              onToggle={() => toggleSection('general')} hasActiveFilters={hasActiveFilters('general')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Min Experience (Years)</label>
                  <input type="number" value={filters.general.minExperience}
                    onChange={(e) => updateFilter('general', 'minExperience', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Max Experience (Years)</label>
                  <input type="number" value={filters.general.maxExperience}
                    onChange={(e) => updateFilter('general', 'maxExperience', e.target.value)}
                    placeholder="e.g., 10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Required Contact Info</label>
                  <select value={filters.general.requiredContactInfo}
                    onChange={(e) => updateFilter('general', 'requiredContactInfo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                   <select value={filters.general.hideViewedProfiles}
                    onChange={(e) => updateFilter('general', 'hideViewedProfiles', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="">Don't hide profiles</option>
                    <option value="viewed">Hide viewed profiles</option>
                    <option value="shortlisted">Hide shortlisted profiles</option>
                    <option value="both">Hide both</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Connection Level</label>
                   <select value={filters.general.onlyConnections}
                    onChange={(e) => updateFilter('general', 'onlyConnections', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
              title="Location Filters" icon={MapPin} isExpanded={expandedSections.location}
              onToggle={() => toggleSection('location')} hasActiveFilters={hasActiveFilters('location')}
            >
              <ArrayInput label="Current Locations" values={filters.location.currentLocations}
                onChange={(values) => updateFilter('location', 'currentLocations', values)}
                placeholder="Enter city, state, or country"
                helpText="Add multiple locations to search across different areas"
              />
              <ArrayInput label="Past Locations" values={filters.location.pastLocations}
                onChange={(values) => updateFilter('location', 'pastLocations', values)}
                placeholder="Enter past city, state, or country"
                helpText="Find candidates who previously worked in these locations"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Search Radius</label>
                  <select value={filters.location.radius}
                    onChange={(e) => updateFilter('location', 'radius', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="25">Within 25 miles</option>
                    <option value="50">Within 50 miles</option>
                    <option value="100">Within 100 miles</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>
                <div className="flex items-center pt-6"> {/* Adjusted for alignment */}
                  <input type="checkbox" id="timezone" checked={filters.location.timezone}
                    onChange={(e) => updateFilter('location', 'timezone', e.target.checked)}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded accent-purple-600"
                  />
                  <label htmlFor="timezone" className="ml-2 text-sm font-medium text-gray-700">
                    Match timezone
                  </label>
                </div>
              </div>
            </FilterSection>

            {/* Job & Skills */}
            <FilterSection
              title="Job & Skills" icon={Briefcase} isExpanded={expandedSections.job}
              onToggle={() => toggleSection('job')} hasActiveFilters={hasActiveFilters('job')}
            >
              <ArrayInput label="Job Titles" values={filters.job.titles}
                onChange={(values) => updateFilter('job', 'titles', values)}
                placeholder="Enter job title"
                helpText="Search for specific job titles or roles"
              />
              <ArrayInput label="Skills & Technologies" values={filters.job.skills}
                onChange={(values) => updateFilter('job', 'skills', values)}
                placeholder="Enter skill or technology"
                helpText="Find candidates with specific technical or professional skills"
              />
            </FilterSection>

            {/* Company & Industry */}
            <FilterSection
              title="Company & Industry" icon={Building} isExpanded={expandedSections.company}
              onToggle={() => toggleSection('company')} hasActiveFilters={hasActiveFilters('company')}
            >
              <ArrayInput label="Company Names" values={filters.company.names}
                onChange={(values) => updateFilter('company', 'names', values)}
                placeholder="Enter company name"
                helpText="Search for candidates from specific companies"
              />
              <ArrayInput label="Industries" values={filters.company.industries}
                onChange={(values) => updateFilter('company', 'industries', values)}
                placeholder="Enter industry"
                helpText="Find candidates with experience in specific industries"
              />
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Company Size</label>
                <select value={filters.company.size}
                  onChange={(e) => updateFilter('company', 'size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
            
            {/* Additional Skills & Keywords */}
            <FilterSection
              title="Additional Skills & Keywords" icon={KeySquare} isExpanded={expandedSections.skills}
              onToggle={() => toggleSection('skills')} hasActiveFilters={hasActiveFilters('skillsKeywords')}
            >
              <ArrayInput label="Skills, Keywords, or Buzzwords" values={filters.skillsKeywords.items}
                onChange={(values) => updateFilter('skillsKeywords', 'items', values)}
                placeholder="Enter any skill, keyword, or term"
                helpText="Broad search across profiles for any mentioned skills or keywords"
              />
              {/* Optional: UI for requirements */}
               <ArrayInput label="Specific Requirements" values={filters.skillsKeywords.requirements || []}
                onChange={(values) => updateFilter('skillsKeywords', 'requirements', values)}
                placeholder="Enter specific requirement from query"
                helpText="These are specific requirements extracted by AI"
              />
            </FilterSection>

            {/* Power Filters */}
            <FilterSection
              title="Power Filters" icon={Zap} isExpanded={expandedSections.power}
              onToggle={() => toggleSection('power')} hasActiveFilters={hasActiveFilters('power')}
            >
              <div className="space-y-4">
                <div className="flex items-center">
                  <input type="checkbox" id="openToRemote" checked={filters.power.isOpenToRemote}
                    onChange={(e) => updateFilter('power', 'isOpenToRemote', e.target.checked)}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded accent-purple-600"
                  />
                  <label htmlFor="openToRemote" className="ml-3 text-sm font-medium text-gray-700">Open to Remote Work</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="hasVerifiedEmail" checked={filters.power.hasEmail}
                    onChange={(e) => updateFilter('power', 'hasEmail', e.target.checked)}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded accent-purple-600"
                  />
                  <label htmlFor="hasVerifiedEmail" className="ml-3 text-sm font-medium text-gray-700">Has Verified Email</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="hasVerifiedPhone" checked={filters.power.hasPhone}
                    onChange={(e) => updateFilter('power', 'hasPhone', e.target.checked)}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded accent-purple-600"
                  />
                  <label htmlFor="hasVerifiedPhone" className="ml-3 text-sm font-medium text-gray-700">Has Verified Phone Number</label>
                </div>
              </div>
            </FilterSection>

            {/* Job Change Likelihood */}
            <FilterSection
              title="Job Change Likelihood" icon={Star} isExpanded={expandedSections.likely}
              onToggle={() => toggleSection('likely')} hasActiveFilters={hasActiveFilters('likelyToSwitch')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Likelihood to Switch</label>
                  <select value={filters.likelyToSwitch.likelihood}
                    onChange={(e) => updateFilter('likelyToSwitch', 'likelihood', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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
                  <select value={filters.likelyToSwitch.recentActivity}
                    onChange={(e) => updateFilter('likelyToSwitch', 'recentActivity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
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

            {/* Education */}
            <FilterSection
              title="Education" icon={GraduationCap} isExpanded={expandedSections.education}
              onToggle={() => toggleSection('education')} hasActiveFilters={hasActiveFilters('education')}
            >
              <ArrayInput label="Schools & Universities" values={filters.education.schools}
                onChange={(values) => updateFilter('education', 'schools', values)}
                placeholder="Enter school or university name"
              />
              <ArrayInput label="Degrees" values={filters.education.degrees}
                onChange={(values) => updateFilter('education', 'degrees', values)}
                placeholder="Enter degree type (e.g., Bachelor's)"
              />
              <ArrayInput label="Fields of Study" values={filters.education.majors}
                onChange={(values) => updateFilter('education', 'majors', values)}
                placeholder="Enter field of study or major"
              />
            </FilterSection>

            {/* Languages */}
            <FilterSection
              title="Languages" icon={Globe} isExpanded={expandedSections.languages}
              onToggle={() => toggleSection('languages')} hasActiveFilters={hasActiveFilters('languages')}
            >
              <ArrayInput label="Languages Spoken" values={filters.languages.items}
                onChange={(values) => updateFilter('languages', 'items', values)}
                placeholder="Enter language (e.g., Spanish, Mandarin)"
              />
            </FilterSection>

            {/* Advanced Search */}
            <FilterSection
              title="Advanced Search" icon={Command} isExpanded={expandedSections.boolean}
              onToggle={() => toggleSection('boolean')} hasActiveFilters={hasActiveFilters('boolean')}
            >
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Full Name Search</label>
                  <input type="text" value={filters.boolean.fullName}
                    onChange={(e) => updateFilter('boolean', 'fullName', e.target.value)}
                    placeholder="Enter exact name to search for"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Boolean Search String</label>
                  <textarea value={filters.boolean.booleanString}
                    onChange={(e) => updateFilter('boolean', 'booleanString', e.target.value)}
                    placeholder='Example: ("software engineer" OR "developer") AND (React OR Angular) NOT "manager"'
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  />
                </div>
              </div>
            </FilterSection>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-center">
            <div className="text-sm text-gray-600">
              {totalActiveFiltersCount > 0 && (
                <span>{totalActiveFiltersCount} active filter categor{totalActiveFiltersCount !== 1 ? 'ies' : 'y'} applied</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFiltersSection;
