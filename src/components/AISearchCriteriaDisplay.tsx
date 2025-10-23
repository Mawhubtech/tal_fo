import React from 'react';
import { ChevronDown, ChevronUp, MapPin, Briefcase, Code, Building, Clock, Settings, Edit3 } from 'lucide-react';
import type { SearchCriteria } from '../utils/aiQueryParser';
import { 
  extractSearchCriteriaFromAIQuery, 
  groupSearchCriteriaByCategory, 
  formatCriteriaValue, 
  getCategoryDisplayName 
} from '../utils/aiQueryParser';

interface AISearchCriteriaDisplayProps {
  generatedQuery?: any;
  searchText?: string;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  onClick?: () => void;
}

const categoryIcons: Record<string, React.ComponentType<any>> = {
  job_title: Briefcase,
  location: MapPin,
  skills: Code,
  industry: Building,
  experience: Clock,
  system: Settings,
};

const categoryColors: Record<string, string> = {
  job_title: 'bg-blue-50 border-blue-200 text-blue-800',
  location: 'bg-green-50 border-green-200 text-green-800',
  skills: 'bg-purple-50 border-purple-200 text-purple-800',
  industry: 'bg-orange-50 border-orange-200 text-orange-800',
  experience: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  system: 'bg-gray-50 border-gray-200 text-gray-600',
};

const typeColors: Record<string, string> = {
  primary: 'bg-blue-100 text-blue-800 font-medium',
  secondary: 'bg-gray-100 text-gray-700',
  system: 'bg-gray-50 text-gray-600 text-xs',
};

// Badge color mapping based on category and type
function getBadgeColor(category: SearchCriteria['category'], type: SearchCriteria['type']): string {
  const baseColors = {
    job_title: 'bg-purple-100 text-purple-800',
    location: 'bg-green-100 text-green-800',
    skills: 'bg-blue-100 text-blue-800',
    industry: 'bg-orange-100 text-orange-800',
    experience: 'bg-indigo-100 text-indigo-800',
    system: 'bg-gray-100 text-gray-600',
  };
  
  // Enhance primary criteria with stronger colors
  if (type === 'primary') {
    const primaryColors = {
      job_title: 'bg-purple-200 text-purple-900',
      location: 'bg-green-200 text-green-900',
      skills: 'bg-blue-200 text-blue-900',
      industry: 'bg-orange-200 text-orange-900',
      experience: 'bg-indigo-200 text-indigo-900',
      system: 'bg-gray-200 text-gray-800',
    };
    return primaryColors[category] || baseColors.system;
  }
  
  return baseColors[category] || baseColors.system;
}

export default function AISearchCriteriaDisplay({ 
  generatedQuery, 
  searchText,
  className = '',
  collapsible = true,
  defaultExpanded = true,
  onClick
}: AISearchCriteriaDisplayProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  // Update expanded state when defaultExpanded changes
  React.useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  // Extract criteria from AI query
  const criteria = React.useMemo(() => {
    let allCriteria: SearchCriteria[] = [];
    
    // Try multiple possible data structures based on API response format
    if (generatedQuery?.query?.bool) {
      // Direct query.bool structure
      allCriteria = extractSearchCriteriaFromAIQuery(generatedQuery.query.bool);
    } else if (generatedQuery?.bool) {
      // Direct bool structure
      allCriteria = extractSearchCriteriaFromAIQuery(generatedQuery.bool);
    } else if (generatedQuery) {
      // Check if generatedQuery itself is a bool structure
      if (generatedQuery.must || generatedQuery.should || generatedQuery.filter) {
        allCriteria = extractSearchCriteriaFromAIQuery(generatedQuery);
      }
    }
    
    // Filter out system criteria (Currently Working, Active Profiles, etc.)
    return allCriteria.filter(criterion => criterion.category !== 'system');
  }, [generatedQuery]);

  if (criteria.length === 0) {
    return null; // Don't show anything if no AI criteria available
  }

  return (
    <div 
      className={`bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-blue-200 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Code className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                Search Criteria
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  AI Enhanced
                </span>
                {onClick && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    <Edit3 className="w-3 h-3 mr-1" />
                    Click to Edit
                  </span>
                )}
              </h3>
            </div>
          </div>
          
          {collapsible && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {(!collapsible || isExpanded) && (
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {/* Search Text Badge */}
            {searchText && (
              <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <Code className="w-3 h-3 mr-1.5" />
                <span className="font-medium mr-2">Search:</span>
                <span className="italic">"{searchText}"</span>
              </div>
            )}
            
            {criteria.map((criterion, index) => {
              const IconComponent = categoryIcons[criterion.category] || Settings;
              const badgeColor = getBadgeColor(criterion.category, criterion.type);
              
              return (
                <div key={`${criterion.label}-${index}`} className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${badgeColor}`}>
                  <IconComponent className="w-3 h-3 mr-1.5" />
                  <span className="font-medium mr-2">{criterion.label}:</span>
                  <span>{formatCriteriaValue(criterion.value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}