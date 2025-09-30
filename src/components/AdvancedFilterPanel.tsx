import React, { useState, useEffect } from 'react';
import { 
  Search, 
   Filter,
  X, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Award,
  Building2,
  Calendar,
  Globe,
  Users,
  DollarSign,
  Languages,
  BookOpen,
  FileText,
  Plus
} from 'lucide-react';

export interface AdvancedFilters {
  // Basic Info
  fullName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  jobTitle?: string | string[];
  description?: string;
  jobDescription?: string;
  headline?: string;
  generatedHeadline?: string;
  shorthandNames?: string;
  professionalNetworkUrls?: string;
  pictureUrl?: string;
  publicProfileId?: string;
  
  // Location
  locationRawAddress?: string | string[];
  locationCountry?: string | string[];
  locationRegions?: string | string[];
  
  // Skills & Experience
  skills?: string[] | string;
  totalExperienceMonths?: {
    min?: number;
    max?: number;
  };
  managementLevel?: string[];
  department?: string[];
  isDecisionMaker?: boolean;
  isWorking?: boolean;
  
  // Experience Details
  experienceTitle?: string;
  experienceCompany?: string | string[];
  experienceCompanyId?: string;
  experienceDescription?: string;
  experienceLocation?: string | string[];
  experienceDurationMonths?: {
    min?: number;
    max?: number;
  };
  experienceDuration?: string;
  experienceDateFrom?: string;
  experienceDateTo?: string;
  experienceFromYear?: {
    min?: number;
    max?: number;
  };
  experienceFromMonth?: {
    min?: number;
    max?: number;
  };
  experienceToYear?: {
    min?: number;
    max?: number;
  };
  experienceToMonth?: {
    min?: number;
    max?: number;
  };
  
  // Company Info
  companyIndustry?: string[];
  companySizeRange?: string[];
  companyType?: string[];
  companyRevenue?: {
    min?: number;
    max?: number;
  };
  companyRevenueCurrency?: string[];
  companyEmployeeCount?: {
    min?: number;
    max?: number;
  };
  companyFounded?: string;
  companyFollowersCount?: {
    min?: number;
    max?: number;
  };
  companyWebsite?: string;
  companyFacebookUrl?: string;
  companyTwitterUrl?: string;
  companyLinkedInUrl?: string;
  companyHqLocation?: string | string[];
  companyHqCountry?: string | string[];
  companyHqRegions?: string | string[];
  companyHqCity?: string | string[];
  companyHqState?: string;
  companyLastUpdated?: string;
  companyCategoriesKeywords?: string;
  companyStockExchange?: string[];
  companyStockTicker?: string;
  companyIsB2B?: boolean;
  companyEmployeeGrowthRate?: {
    min?: number;
    max?: number;
  };
  companyLastFundingDate?: string;
  companyLastFundingAmount?: {
    min?: number;
    max?: number;
  };
  
  // Education
  educationTitle?: string;
  educationMajor?: string;
  educationInstitution?: string;
  educationInstitutionUrl?: string;
  educationDescription?: string;
  educationActivities?: string;
  educationDateFrom?: {
    min?: number;
    max?: number;
  };
  educationDateTo?: {
    min?: number;
    max?: number;
  };
  
  // Certifications
  certificationTitle?: string;
  certificationIssuer?: string;
  certificationCredentialId?: string;
  certificationUrl?: string;
  certificationIssuerUrl?: string;
  certificationDateFrom?: string;
  certificationDateTo?: string;
  certificationFromYear?: {
    min?: number;
    max?: number;
  };
  certificationFromMonth?: {
    min?: number;
    max?: number;
  };
  certificationToYear?: {
    min?: number;
    max?: number;
  };
  certificationToMonth?: {
    min?: number;
    max?: number;
  };
  
  // Awards
  awardTitle?: string;
  awardIssuer?: string;
  awardDescription?: string;
  awardDate?: string;
  awardYear?: {
    min?: number;
    max?: number;
  };
  awardMonth?: {
    min?: number;
    max?: number;
  };
  
  // Languages
  languages?: string[] | string;
  languageProficiency?: string[];
  
  // Activities
  activityTitle?: string;
  activityAction?: string;
  activityUrl?: string;
  
  // Organizations
  organizationName?: string;
  organizationPosition?: string;
  organizationDescription?: string;
  organizationDateFrom?: string;
  organizationDateTo?: string;
  organizationFromYear?: {
    min?: number;
    max?: number;
  };
  organizationFromMonth?: {
    min?: number;
    max?: number;
  };
  organizationToYear?: {
    min?: number;
    max?: number;
  };
  organizationToMonth?: {
    min?: number;
    max?: number;
  };
  
  // Patents
  patentTitle?: string;
  patentStatus?: string[];
  patentInventors?: string;
  patentDate?: string;
  patentYear?: {
    min?: number;
    max?: number;
  };
  patentUrl?: string;
  patentDescription?: string;
  patentNumber?: string;
  
  // Publications
  publicationTitle?: string;
  publicationPublisher?: string;
  publicationAuthors?: string;
  publicationDate?: string;
  publicationYear?: {
    min?: number;
    max?: number;
  };
  publicationDescription?: string;
  publicationUrl?: string;
  
  // Courses
  courseTitle?: string;
  courseOrganizer?: string;
  
  // Recommendations
  recommendationText?: string;
  recommendationRefereeName?: string;
  recommendationRefereeUrl?: string;
  recommendationsCount?: {
    min?: number;
    max?: number;
  };
  
  // Profile Metrics
  connectionsCount?: {
    min?: number;
    max?: number;
  };
  followerCount?: {
    min?: number;
    max?: number;
  };
  lastUpdated?: string;
  isDeleted?: boolean;
  isHidden?: boolean;
}

interface AdvancedFilterPanelProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isVisible: boolean;
  onToggle: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  convertedFilters?: any;
}

interface BadgeInputProps {
  label: string;
  value: string | string[] | undefined;
  onChange: (value: string | string[] | undefined) => void;
  placeholder: string;
  predefinedOptions?: string[];
  allowCustom?: boolean;
}

const BadgeInput: React.FC<BadgeInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  predefinedOptions,
  allowCustom = true
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Convert current value to array format
  let items: string[] = [];
  if (Array.isArray(value)) {
    items = value;
  } else if (value && typeof value === 'string') {
    // Split comma-separated items into individual items
    items = value.split(',').map(item => item.trim()).filter(item => item);
  }

  // Filter predefined options based on input and exclude already selected
  const filteredOptions = predefinedOptions ? 
    predefinedOptions.filter(option => 
      option.toLowerCase().includes(inputValue.toLowerCase()) &&
      !items.includes(option)
    ) : [];

  const addItem = (newValue: string) => {
    const trimmedValue = newValue.trim();
    if (trimmedValue && !items.includes(trimmedValue)) {
      const newItems = [...items, trimmedValue];
      onChange(newItems.length === 1 ? newItems[0] : newItems);
      setInputValue('');
      setShowDropdown(false);
    }
  };

  const removeItem = (itemToRemove: string) => {
    const newItems = items.filter(item => item !== itemToRemove);
    onChange(newItems.length === 0 ? undefined : 
             newItems.length === 1 ? newItems[0] : newItems);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0 && inputValue.trim()) {
        // If there's an exact match, use it
        const exactMatch = filteredOptions.find(option => 
          option.toLowerCase() === inputValue.toLowerCase()
        );
        if (exactMatch) {
          addItem(exactMatch);
        } else if (allowCustom) {
          addItem(inputValue);
        } else {
          addItem(filteredOptions[0]); // Use first filtered option
        }
      } else if (allowCustom && inputValue.trim()) {
        addItem(inputValue);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (predefinedOptions && e.target.value) {
      setShowDropdown(true);
    }
  };

  const handleAddClick = () => {
    if (inputValue.trim()) {
      addItem(inputValue);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {/* Items Badges */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="ml-2 text-purple-600 hover:text-purple-800 focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => predefinedOptions && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
          />
          
          {/* Dropdown for predefined options */}
          {showDropdown && filteredOptions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addItem(option)}
                  className="w-full text-left px-3 py-2 hover:bg-purple-50 focus:bg-purple-50 focus:outline-none"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleAddClick}
          disabled={!inputValue.trim()}
          className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {items.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">
          Type {predefinedOptions ? 'to search options or add custom values' : 'and click + to add badges'}
        </p>
      )}
    </div>
  );
};

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isVisible,
  onToggle,
  searchQuery = '',
  onSearchQueryChange,
  convertedFilters
}) => {
  const [activeSection, setActiveSection] = useState<string | null>('basic');
  
  // Track if filters have been manually modified to prevent convertedFilters from overriding user input
  const [hasUserInput, setHasUserInput] = useState(false);
  
  // Populate filters when convertedFilters are available (only if user hasn't made manual changes)
  React.useEffect(() => {
    if (convertedFilters && !hasUserInput) {
      console.log('🔄 Populating filters with converted data:', convertedFilters);
      onFiltersChange(convertedFilters);
    }
  }, [convertedFilters, onFiltersChange, hasUserInput]);

  // Check if a section has active filters
  const hasActiveFilters = (sectionKey: string): boolean => {
    switch (sectionKey) {
      case 'searchQuery':
        return !!searchQuery?.trim();
      case 'basic':
        return !!(
          filters.fullName || filters.firstName || filters.middleName || filters.lastName ||
          (Array.isArray(filters.jobTitle) ? filters.jobTitle.length > 0 : filters.jobTitle) || 
          filters.headline || filters.description || filters.jobDescription ||
          filters.generatedHeadline || filters.shorthandNames || filters.professionalNetworkUrls ||
          filters.pictureUrl || filters.publicProfileId
        );
      case 'location':
        return !!(
          (Array.isArray(filters.locationRawAddress) ? filters.locationRawAddress.length > 0 : filters.locationRawAddress) ||
          (Array.isArray(filters.locationCountry) ? filters.locationCountry.length > 0 : filters.locationCountry) ||
          (Array.isArray(filters.locationRegions) ? filters.locationRegions.length > 0 : filters.locationRegions)
        );
      case 'skills':
        return !!(Array.isArray(filters.skills) ? filters.skills.length > 0 : filters.skills);
      case 'workExperience':
        return !!(
          filters.totalExperienceMonths?.min || filters.totalExperienceMonths?.max ||
          filters.managementLevel?.length || filters.department?.length ||
          filters.isDecisionMaker !== undefined || filters.isWorking !== undefined ||
          filters.experienceTitle || 
          (Array.isArray(filters.experienceCompany) ? filters.experienceCompany.length > 0 : filters.experienceCompany) ||
          filters.experienceCompanyId || filters.experienceDescription || 
          (Array.isArray(filters.experienceLocation) ? filters.experienceLocation.length > 0 : filters.experienceLocation) ||
          filters.experienceDurationMonths?.min || filters.experienceDurationMonths?.max ||
          filters.experienceDuration || filters.experienceDateFrom || filters.experienceDateTo ||
          filters.experienceFromYear?.min || filters.experienceFromYear?.max ||
          filters.experienceFromMonth?.min || filters.experienceFromMonth?.max ||
          filters.experienceToYear?.min || filters.experienceToYear?.max ||
          filters.experienceToMonth?.min || filters.experienceToMonth?.max
        );
      case 'company':
        return !!(
          filters.companyIndustry?.length || filters.companySizeRange?.length ||
          filters.companyType?.length || filters.companyRevenue?.min || filters.companyRevenue?.max ||
          filters.companyRevenueCurrency?.length || filters.companyEmployeeCount?.min ||
          filters.companyEmployeeCount?.max || filters.companyFounded || filters.companyFollowersCount?.min ||
          filters.companyFollowersCount?.max || filters.companyWebsite || filters.companyFacebookUrl ||
          filters.companyTwitterUrl || filters.companyLinkedInUrl || 
          (Array.isArray(filters.companyHqLocation) ? filters.companyHqLocation.length > 0 : filters.companyHqLocation) ||
          (Array.isArray(filters.companyHqCountry) ? filters.companyHqCountry.length > 0 : filters.companyHqCountry) ||
          (Array.isArray(filters.companyHqRegions) ? filters.companyHqRegions.length > 0 : filters.companyHqRegions) ||
          (Array.isArray(filters.companyHqCity) ? filters.companyHqCity.length > 0 : filters.companyHqCity) ||
          filters.companyHqState || filters.companyLastUpdated || filters.companyCategoriesKeywords ||
          filters.companyStockExchange?.length || filters.companyStockTicker || filters.companyIsB2B !== undefined ||
          filters.companyEmployeeGrowthRate?.min || filters.companyEmployeeGrowthRate?.max ||
          filters.companyLastFundingDate || filters.companyLastFundingAmount?.min || filters.companyLastFundingAmount?.max
        );
      case 'education':
        return !!(
          filters.educationTitle || filters.educationMajor || filters.educationInstitution ||
          filters.educationInstitutionUrl || filters.educationDescription || filters.educationActivities ||
          filters.educationDateFrom?.min || filters.educationDateFrom?.max ||
          filters.educationDateTo?.min || filters.educationDateTo?.max
        );
      case 'certifications':
        return !!(
          filters.certificationTitle || filters.certificationIssuer || filters.certificationCredentialId ||
          filters.certificationUrl || filters.certificationIssuerUrl || filters.certificationDateFrom ||
          filters.certificationDateTo || filters.certificationFromYear?.min || filters.certificationFromYear?.max ||
          filters.certificationFromMonth?.min || filters.certificationFromMonth?.max ||
          filters.certificationToYear?.min || filters.certificationToYear?.max ||
          filters.certificationToMonth?.min || filters.certificationToMonth?.max
        );
      case 'awards':
        return !!(
          filters.awardTitle || filters.awardIssuer || filters.awardDescription ||
          filters.awardDate || filters.awardYear?.min || filters.awardYear?.max ||
          filters.awardMonth?.min || filters.awardMonth?.max
        );
      case 'languages':
        return !!((Array.isArray(filters.languages) ? filters.languages.length > 0 : filters.languages) || filters.languageProficiency?.length);
      case 'activities':
        return !!(filters.activityTitle || filters.activityAction || filters.activityUrl);
      case 'organizations':
        return !!(
          filters.organizationName || filters.organizationPosition || filters.organizationDescription ||
          filters.organizationDateFrom || filters.organizationDateTo || filters.organizationFromYear?.min ||
          filters.organizationFromYear?.max || filters.organizationFromMonth?.min || filters.organizationFromMonth?.max ||
          filters.organizationToYear?.min || filters.organizationToYear?.max ||
          filters.organizationToMonth?.min || filters.organizationToMonth?.max
        );
      case 'patents':
        return !!(
          filters.patentTitle || filters.patentStatus?.length || filters.patentInventors ||
          filters.patentDate || filters.patentYear?.min || filters.patentYear?.max ||
          filters.patentUrl || filters.patentDescription || filters.patentNumber
        );
      case 'publications':
        return !!(
          filters.publicationTitle || filters.publicationPublisher || filters.publicationAuthors ||
          filters.publicationDate || filters.publicationYear?.min || filters.publicationYear?.max ||
          filters.publicationDescription || filters.publicationUrl
        );
      case 'courses':
        return !!(filters.courseTitle || filters.courseOrganizer);
      case 'recommendations':
        return !!(
          filters.recommendationText || filters.recommendationRefereeName || filters.recommendationRefereeUrl ||
          filters.recommendationsCount?.min || filters.recommendationsCount?.max
        );
      case 'profileMetrics':
        return !!(
          filters.connectionsCount?.min || filters.connectionsCount?.max ||
          filters.followerCount?.min || filters.followerCount?.max ||
          filters.lastUpdated || filters.isDeleted !== undefined || filters.isHidden !== undefined
        );
      case 'aiMetadata':
        return false; // This section doesn't have user-editable filters
      default:
        return false;
    }
  };

  // Get count of active filters in a section
  const getActiveFilterCount = (sectionKey: string): number => {
    let count = 0;
    
    switch (sectionKey) {
      case 'searchQuery':
        if (searchQuery?.trim()) count++;
        break;
      case 'basic':
        if (filters.fullName) count++;
        if (filters.firstName) count++;
        if (filters.middleName) count++;
        if (filters.lastName) count++;
        if (Array.isArray(filters.jobTitle) ? filters.jobTitle.length > 0 : filters.jobTitle) count++;
        if (filters.headline) count++;
        if (filters.description) count++;
        if (filters.jobDescription) count++;
        if (filters.generatedHeadline) count++;
        if (filters.shorthandNames) count++;
        if (filters.professionalNetworkUrls) count++;
        if (filters.pictureUrl) count++;
        if (filters.publicProfileId) count++;
        break;
      case 'location':
        if (Array.isArray(filters.locationRawAddress) ? filters.locationRawAddress.length > 0 : filters.locationRawAddress) count++;
        if (Array.isArray(filters.locationCountry) ? filters.locationCountry.length > 0 : filters.locationCountry) count++;
        if (Array.isArray(filters.locationRegions) ? filters.locationRegions.length > 0 : filters.locationRegions) count++;
        break;
      case 'skills':
        if (Array.isArray(filters.skills) ? filters.skills.length > 0 : filters.skills) count++;
        break;
      case 'workExperience':
        if (filters.totalExperienceMonths?.min || filters.totalExperienceMonths?.max) count++;
        if (filters.managementLevel?.length) count++;
        if (filters.department?.length) count++;
        if (filters.isDecisionMaker !== undefined) count++;
        if (filters.isWorking !== undefined) count++;
        if (filters.experienceTitle) count++;
        if (Array.isArray(filters.experienceCompany) ? filters.experienceCompany.length > 0 : filters.experienceCompany) count++;
        if (filters.experienceCompanyId) count++;
        if (filters.experienceDescription) count++;
        if (Array.isArray(filters.experienceLocation) ? filters.experienceLocation.length > 0 : filters.experienceLocation) count++;
        if (filters.experienceDurationMonths?.min || filters.experienceDurationMonths?.max) count++;
        if (filters.experienceDuration) count++;
        if (filters.experienceDateFrom) count++;
        if (filters.experienceDateTo) count++;
        if (filters.experienceFromYear?.min || filters.experienceFromYear?.max) count++;
        if (filters.experienceFromMonth?.min || filters.experienceFromMonth?.max) count++;
        if (filters.experienceToYear?.min || filters.experienceToYear?.max) count++;
        if (filters.experienceToMonth?.min || filters.experienceToMonth?.max) count++;
        break;
      case 'company':
        if (filters.companyIndustry?.length) count++;
        if (filters.companySizeRange?.length) count++;
        if (filters.companyType?.length) count++;
        if (filters.companyRevenue?.min || filters.companyRevenue?.max) count++;
        if (filters.companyRevenueCurrency?.length) count++;
        if (filters.companyEmployeeCount?.min || filters.companyEmployeeCount?.max) count++;
        if (filters.companyFounded) count++;
        if (filters.companyFollowersCount?.min || filters.companyFollowersCount?.max) count++;
        if (filters.companyWebsite) count++;
        if (filters.companyFacebookUrl) count++;
        if (filters.companyTwitterUrl) count++;
        if (filters.companyLinkedInUrl) count++;
        if (Array.isArray(filters.companyHqLocation) ? filters.companyHqLocation.length > 0 : filters.companyHqLocation) count++;
        if (Array.isArray(filters.companyHqCountry) ? filters.companyHqCountry.length > 0 : filters.companyHqCountry) count++;
        if (Array.isArray(filters.companyHqRegions) ? filters.companyHqRegions.length > 0 : filters.companyHqRegions) count++;
        if (Array.isArray(filters.companyHqCity) ? filters.companyHqCity.length > 0 : filters.companyHqCity) count++;
        if (filters.companyHqState) count++;
        if (filters.companyLastUpdated) count++;
        if (filters.companyCategoriesKeywords) count++;
        if (filters.companyStockExchange?.length) count++;
        if (filters.companyStockTicker) count++;
        if (filters.companyIsB2B !== undefined) count++;
        if (filters.companyEmployeeGrowthRate?.min || filters.companyEmployeeGrowthRate?.max) count++;
        if (filters.companyLastFundingDate) count++;
        if (filters.companyLastFundingAmount?.min || filters.companyLastFundingAmount?.max) count++;
        break;
      case 'education':
        if (filters.educationTitle) count++;
        if (filters.educationMajor) count++;
        if (filters.educationInstitution) count++;
        if (filters.educationInstitutionUrl) count++;
        if (filters.educationDescription) count++;
        if (filters.educationActivities) count++;
        if (filters.educationDateFrom?.min || filters.educationDateFrom?.max) count++;
        if (filters.educationDateTo?.min || filters.educationDateTo?.max) count++;
        break;
      case 'certifications':
        if (filters.certificationTitle) count++;
        if (filters.certificationIssuer) count++;
        if (filters.certificationCredentialId) count++;
        if (filters.certificationUrl) count++;
        if (filters.certificationIssuerUrl) count++;
        if (filters.certificationDateFrom) count++;
        if (filters.certificationDateTo) count++;
        if (filters.certificationFromYear?.min || filters.certificationFromYear?.max) count++;
        if (filters.certificationFromMonth?.min || filters.certificationFromMonth?.max) count++;
        if (filters.certificationToYear?.min || filters.certificationToYear?.max) count++;
        if (filters.certificationToMonth?.min || filters.certificationToMonth?.max) count++;
        break;
      case 'awards':
        if (filters.awardTitle) count++;
        if (filters.awardIssuer) count++;
        if (filters.awardDescription) count++;
        if (filters.awardDate) count++;
        if (filters.awardYear?.min || filters.awardYear?.max) count++;
        if (filters.awardMonth?.min || filters.awardMonth?.max) count++;
        break;
      case 'languages':
        if (Array.isArray(filters.languages) ? filters.languages.length > 0 : filters.languages) count++;
        if (filters.languageProficiency?.length) count++;
        break;
      case 'activities':
        if (filters.activityTitle) count++;
        if (filters.activityAction) count++;
        if (filters.activityUrl) count++;
        break;
      case 'organizations':
        if (filters.organizationName) count++;
        if (filters.organizationPosition) count++;
        if (filters.organizationDescription) count++;
        if (filters.organizationDateFrom) count++;
        if (filters.organizationDateTo) count++;
        if (filters.organizationFromYear?.min || filters.organizationFromYear?.max) count++;
        if (filters.organizationFromMonth?.min || filters.organizationFromMonth?.max) count++;
        if (filters.organizationToYear?.min || filters.organizationToYear?.max) count++;
        if (filters.organizationToMonth?.min || filters.organizationToMonth?.max) count++;
        break;
      case 'patents':
        if (filters.patentTitle) count++;
        if (filters.patentStatus?.length) count++;
        if (filters.patentInventors) count++;
        if (filters.patentDate) count++;
        if (filters.patentYear?.min || filters.patentYear?.max) count++;
        if (filters.patentUrl) count++;
        if (filters.patentDescription) count++;
        if (filters.patentNumber) count++;
        break;
      case 'publications':
        if (filters.publicationTitle) count++;
        if (filters.publicationPublisher) count++;
        if (filters.publicationAuthors) count++;
        if (filters.publicationDate) count++;
        if (filters.publicationYear?.min || filters.publicationYear?.max) count++;
        if (filters.publicationDescription) count++;
        if (filters.publicationUrl) count++;
        break;
      case 'courses':
        if (filters.courseTitle) count++;
        if (filters.courseOrganizer) count++;
        break;
      case 'recommendations':
        if (filters.recommendationText) count++;
        if (filters.recommendationRefereeName) count++;
        if (filters.recommendationRefereeUrl) count++;
        if (filters.recommendationsCount?.min || filters.recommendationsCount?.max) count++;
        break;
      case 'profileMetrics':
        if (filters.connectionsCount?.min || filters.connectionsCount?.max) count++;
        if (filters.followerCount?.min || filters.followerCount?.max) count++;
        if (filters.lastUpdated) count++;
        if (filters.isDeleted !== undefined) count++;
        if (filters.isHidden !== undefined) count++;
        break;
    }
    
    return count;
  };

  // Extract relevant generated filters for a specific section
  const getGeneratedFiltersForSection = (sectionType: string): any[] => {
    // No longer showing generated query filters, return empty array
    return [];
  };

  // Render generated filters for a section (now returns null as we're not showing query data)
  const renderGeneratedFilters = (sectionType: string) => {
    return null;
  };
  
  // Predefined options based on common industry standards
  const managementLevels = [
    'C-level', 'VP', 'Director', 'Senior Manager', 'Manager', 
    'Team Lead', 'Senior', 'Mid-level', 'Junior', 'Entry-level'
  ];
  
  const departments = [
    'Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations',
    'Product', 'Design', 'Data', 'Security', 'Legal', 'Customer Success'
  ];
  
  const companySizes = [
    '1-10 employees', '11-50 employees', '51-200 employees', 
    '201-500 employees', '501-1000 employees', '1001-5000 employees', 
    '5001-10000 employees', '10000+ employees'
  ];
  
  const companyTypes = [
    'Public Company', 'Private Company', 'Partnership', 'Nonprofit',
    'Government Agency', 'Self-employed', 'Sole Proprietorship'
  ];
  
  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Consulting', 'Media', 'Real Estate', 'Transportation',
    'Energy', 'Telecommunications', 'Aerospace', 'Automotive'
  ];
  
  const languageProficiencies = [
    'Elementary proficiency', 'Limited working proficiency', 
    'Professional working proficiency', 'Full professional proficiency',
    'Native or bilingual proficiency'
  ];

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Switzerland',
    'Singapore', 'Hong Kong', 'Japan', 'South Korea', 'India', 'China',
    'Brazil', 'Mexico', 'Argentina', 'Spain', 'Italy', 'Poland',
    'Czech Republic', 'Austria', 'Belgium', 'Ireland', 'New Zealand',
    'Israel', 'United Arab Emirates', 'Saudi Arabia', 'Egypt', 'South Africa'
  ];

  const regions = [
    'North America', 'Europe', 'Asia Pacific', 'Middle East', 'Africa',
    'South America', 'Central America', 'Caribbean', 'Scandinavia',
    'Eastern Europe', 'Western Europe', 'Southeast Asia', 'East Asia',
    'South Asia', 'Oceania', 'Gulf States', 'Maghreb', 'Sub-Saharan Africa'
  ];

  const commonCities = [
    // North America
    'New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Boston', 'Seattle',
    'Toronto', 'Vancouver', 'Montreal',
    // Europe
    'London', 'Berlin', 'Paris', 'Amsterdam', 'Stockholm', 'Dublin', 'Zurich',
    'Barcelona', 'Madrid', 'Milan', 'Rome', 'Warsaw', 'Prague',
    // Asia Pacific
    'Singapore', 'Hong Kong', 'Tokyo', 'Sydney', 'Melbourne', 'Bangkok',
    'Mumbai', 'Bangalore', 'Delhi', 'Seoul', 'Shanghai', 'Beijing',
    // Middle East & Africa
    'Dubai', 'Abu Dhabi', 'Tel Aviv', 'Cairo', 'Cape Town', 'Johannesburg',
    // Others
    'São Paulo', 'Mexico City', 'Buenos Aires'
  ];

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    setHasUserInput(true); // Mark that user has made manual changes
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const updateRangeFilter = (key: keyof AdvancedFilters, field: 'min' | 'max', value: number | undefined) => {
    const currentRange = filters[key] as { min?: number; max?: number } || {};
    setHasUserInput(true); // Mark that user has made manual changes
    onFiltersChange({
      ...filters,
      [key]: {
        ...currentRange,
        [field]: value
      }
    });
  };

  const toggleArrayFilter = (key: keyof AdvancedFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setHasUserInput(true); // Mark that user has made manual changes
    onFiltersChange({
      ...filters,
      [key]: newArray.length > 0 ? newArray : undefined
    });
  };

  const handleClearFilters = () => {
    setHasUserInput(false); // Reset user input flag to allow converted filters again
    onClearFilters();
  };

  const renderSection = (title: string, icon: React.ReactNode, sectionKey: string, children: React.ReactNode) => {
    const hasFilters = hasActiveFilters(sectionKey);
    const filterCount = getActiveFilterCount(sectionKey);
    
    return (
      <div className="border-b border-gray-200">
        <button
          onClick={() => setActiveSection(activeSection === sectionKey ? null : sectionKey)}
          className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
            hasFilters ? 'bg-purple-50 hover:bg-purple-100' : ''
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="relative">
              {icon}
              {hasFilters && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"></div>
              )}
            </div>
            <span className={`font-medium ${hasFilters ? 'text-purple-900' : 'text-gray-900'}`}>
              {title}
            </span>
            {hasFilters && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full font-medium">
                  {filterCount}
                </span>
              </div>
            )}
          </div>
          {activeSection === sectionKey ? (
            <ChevronUp className={`w-4 h-4 ${hasFilters ? 'text-purple-600' : 'text-gray-500'}`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${hasFilters ? 'text-purple-600' : 'text-gray-500'}`} />
          )}
        </button>
        {activeSection === sectionKey && (
          <div className="px-4 pb-4 space-y-3">
            {children}
          </div>
        )}
      </div>
    );
  };

  const renderTextInput = (label: string, key: keyof AdvancedFilters, placeholder: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={filters[key] as string || ''}
        onChange={(e) => updateFilter(key, e.target.value || undefined)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
      />
    </div>
  );

  const renderRangeInput = (label: string, key: keyof AdvancedFilters, unit: string = '') => {
    const range = filters[key] as { min?: number; max?: number } || {};
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex space-x-2">
          <input
            type="number"
            value={range.min || ''}
            onChange={(e) => updateRangeFilter(key, 'min', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Min"
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
          />
          <input
            type="number"
            value={range.max || ''}
            onChange={(e) => updateRangeFilter(key, 'max', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Max"
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
          />
        </div>
        {unit && <p className="text-xs text-gray-500 mt-1">{unit}</p>}
      </div>
    );
  };

  const renderBadgeInput = (
    label: string, 
    key: keyof AdvancedFilters, 
    placeholder: string, 
    predefinedOptions?: string[],
    allowCustom: boolean = true
  ) => {
    const handleChange = (value: string | string[] | undefined) => {
      setHasUserInput(true);
      onFiltersChange({
        ...filters,
        [key]: value
      });
    };

    return (
      <BadgeInput
        label={label}
        value={filters[key] as string | string[] | undefined}
        onChange={handleChange}
        placeholder={placeholder}
        predefinedOptions={predefinedOptions}
        allowCustom={allowCustom}
      />
    );
  };

  const renderMultiSelect = (label: string, options: string[], key: keyof AdvancedFilters) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-2 py-1 hover:bg-gray-50 rounded px-1">
            <input
              type="checkbox"
              checked={((filters[key] as string[]) || []).includes(option)}
              onChange={() => toggleArrayFilter(key, option)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderBooleanFilter = (label: string, key: keyof AdvancedFilters) => (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={filters[key] as boolean || false}
        onChange={(e) => updateFilter(key, e.target.checked || undefined)}
        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none"
      />
      <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
  );



  const renderMultiTextInput = (label: string, key: keyof AdvancedFilters, placeholder: string) => {
    const currentValue = filters[key] as string | string[];
    
    // Convert current value to array format for rendering
    let displayValues: string[];
    if (Array.isArray(currentValue)) {
      displayValues = [...currentValue];
    } else if (currentValue && key === 'skills' && typeof currentValue === 'string') {
      // Split comma-separated skills into individual items
      displayValues = currentValue.split(',').map(skill => skill.trim()).filter(skill => skill);
    } else if (currentValue) {
      displayValues = [currentValue as string];
    } else {
      displayValues = [];
    }
    
    // Always ensure at least one empty field for input
    if (displayValues.length === 0) {
      displayValues = [''];
    } else if (displayValues[displayValues.length - 1].trim() !== '') {
      displayValues.push('');
    }

    const updateMultiTextValue = (index: number, value: string) => {
      const newValues = [...displayValues];
      newValues[index] = value;
      
      // Filter out empty values
      const nonEmptyValues = newValues.filter(val => val.trim() !== '');
      
      // Determine final value format
      let finalValues: string | string[] | undefined;
      if (nonEmptyValues.length === 0) {
        finalValues = undefined;
      } else if (nonEmptyValues.length === 1) {
        finalValues = nonEmptyValues[0];
      } else {
        finalValues = nonEmptyValues;
      }

      setHasUserInput(true);
      onFiltersChange({
        ...filters,
        [key]: finalValues
      });
    };

    const removeField = (index: number) => {
      if (displayValues.length > 1) {
        const newValues = displayValues.filter((_, idx) => idx !== index);
        const nonEmptyValues = newValues.filter(val => val.trim() !== '');
        
        let finalValues: string | string[] | undefined;
        if (nonEmptyValues.length === 0) {
          finalValues = undefined;
        } else if (nonEmptyValues.length === 1) {
          finalValues = nonEmptyValues[0];
        } else {
          finalValues = nonEmptyValues;
        }
        
        setHasUserInput(true);
        onFiltersChange({
          ...filters,
          [key]: finalValues
        });
      }
    };

    const addNewField = () => {
      // Create a temporary array value to trigger rendering of an additional field
      const currentArray = Array.isArray(currentValue) ? currentValue : 
                          currentValue ? [currentValue as string] : [];
      
      setHasUserInput(true);
      onFiltersChange({
        ...filters,
        [key]: currentArray.length === 0 ? [''] : currentArray
      });
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="space-y-2">
          {displayValues.map((value, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={value}
                onChange={(e) => updateMultiTextValue(index, e.target.value)}
                placeholder={`${placeholder} ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
              />
              {displayValues.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addNewField}
            className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded"
          >
            <Plus className="w-3 h-3" />
            <span>Add another {label.toLowerCase()}</span>
          </button>
        </div>
      </div>
    );
  };

  

  return (
    <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-hidden flex flex-col transition-transform duration-300 ${
      isVisible ? 'transform translate-x-0' : 'transform -translate-x-full'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-200 bg-purple-50">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-purple-900">Filters</h2>
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-purple-200 rounded transition-colors"
        >
          <X className="w-4 h-4 text-purple-500" />
        </button>
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto">

        {/* Search Query Section */}
        {renderSection(
          'Search Query',
          <Search className="w-4 h-4 text-gray-600" />,
          'searchQuery',
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Text
              </label>
              <textarea
                value={searchQuery}
                onChange={(e) => onSearchQueryChange?.(e.target.value)}
                placeholder="Enter your search query here..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is the main search text that will be processed by AI to generate the query.
              </p>
            </div>
          </>
        )}

        {/* Basic Information */}
        {renderSection(
          'Basic Information',
          <Search className="w-4 h-4 text-gray-600" />,
          'basic',
          <>
            {renderTextInput('Full Name', 'fullName', 'Search by full name')}
            {renderTextInput('First Name', 'firstName', 'Search by first name')}
            {renderTextInput('Middle Name', 'middleName', 'Search by middle name')}
            {renderTextInput('Last Name', 'lastName', 'Search by last name')}
            {renderMultiTextInput('Job Title', 'jobTitle', 'e.g., Software Engineer')}
            {renderTextInput('Job Description', 'jobDescription', 'Specific job description keywords')}
            {renderTextInput('Headline', 'headline', 'Professional headline')}
            {renderTextInput('Generated Headline', 'generatedHeadline', 'AI-generated headline')}
            {renderTextInput('Description/Summary', 'description', 'Profile description keywords')}
            {renderTextInput('Shorthand Names', 'shorthandNames', 'Alternative name variations')}
            {renderTextInput('Professional Network URLs', 'professionalNetworkUrls', 'LinkedIn, etc.')}
            {renderTextInput('Picture URL', 'pictureUrl', 'Profile picture URL')}
            {renderTextInput('Public Profile ID', 'publicProfileId', 'Public profile identifier')}
          </>
        )}

        {/* Location */}
        {renderSection(
          'Location',
          <MapPin className="w-4 h-4 text-gray-600" />,
          'location',
          <>
            {renderBadgeInput('City', 'locationRawAddress', 'Type city, state, or country', commonCities, true)}
            {renderBadgeInput('Country', 'locationCountry', 'Select or type country name', countries, true)}
            {renderBadgeInput('Region', 'locationRegions', 'Select or type region', regions, true)}
          </>
        )}

        {/* Skills */}
        {renderSection(
          'Skills',
          <Award className="w-4 h-4 text-gray-600" />,
          'skills',
          <>
            {renderBadgeInput('Skills', 'skills', 'Type a skill and press Enter or click +', undefined, true)}
          </>
        )}

        {/* Work Experience */}
        {renderSection(
          'Work Experience',
          <Briefcase className="w-4 h-4 text-gray-600" />,
          'workExperience',
          <>
            {renderRangeInput('Total Experience', 'totalExperienceMonths', 'months')}
            {renderBadgeInput('Management Level', 'managementLevel', 'Select or type management level', managementLevels, true)}
            {renderBadgeInput('Department', 'department', 'Select or type department', departments, true)}
            {renderBooleanFilter('Decision Maker', 'isDecisionMaker')}
            {renderBooleanFilter('Currently Working', 'isWorking')}
            
            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Current/Recent Position Details</h4>
              {renderTextInput('Job Title', 'experienceTitle', 'e.g., Senior Developer')}
              {renderMultiTextInput('Company Name', 'experienceCompany', 'e.g., Google, Microsoft')}
              {renderTextInput('Company ID', 'experienceCompanyId', 'Specific company identifier')}
              {renderTextInput('Job Description', 'experienceDescription', 'Job description keywords')}
              {renderBadgeInput('Work Location', 'experienceLocation', 'Where they worked', commonCities, true)}
              {renderRangeInput('Position Duration', 'experienceDurationMonths', 'months at current/recent job')}
              {renderTextInput('Duration Text', 'experienceDuration', 'e.g., 2 years 3 months')}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.experienceDateFrom || ''}
                    onChange={(e) => updateFilter('experienceDateFrom', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.experienceDateTo || ''}
                    onChange={(e) => updateFilter('experienceDateTo', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Granular Date Filters</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">Start Year Range</label>
                    {renderRangeInput('', 'experienceFromYear', 'years')}
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">End Year Range</label>
                    {renderRangeInput('', 'experienceToYear', 'years')}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-xs text-gray-600">Start Month Range</label>
                    {renderRangeInput('', 'experienceFromMonth', 'months (1-12)')}
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">End Month Range</label>
                    {renderRangeInput('', 'experienceToMonth', 'months (1-12)')}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Company Information */}
        {renderSection(
          'Company Information',
          <Building2 className="w-4 h-4 text-gray-600" />,
          'company',
          <>
            {renderMultiSelect('Industry', industries, 'companyIndustry')}
            {renderMultiSelect('Company Size', companySizes, 'companySizeRange')}
            {renderMultiSelect('Company Type', companyTypes, 'companyType')}
            {renderRangeInput('Annual Revenue', 'companyRevenue', 'USD')}
            {renderMultiSelect('Revenue Currency', ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'], 'companyRevenueCurrency')}
            {renderRangeInput('Employee Count', 'companyEmployeeCount', 'exact employee numbers')}
            {renderTextInput('Founded Year', 'companyFounded', 'e.g., 2010')}
            {renderRangeInput('Followers Count', 'companyFollowersCount', 'social media followers')}
            {renderTextInput('Website', 'companyWebsite', 'e.g., https://company.com')}
            {renderTextInput('Facebook URL', 'companyFacebookUrl', 'Company Facebook page')}
            {renderTextInput('Twitter URL', 'companyTwitterUrl', 'Company Twitter handle')}
            {renderTextInput('LinkedIn URL', 'companyLinkedInUrl', 'Company LinkedIn page')}
            
            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Company Headquarters</h4>
              {renderBadgeInput('HQ Location', 'companyHqLocation', 'Full headquarters address', commonCities, true)}
              {renderBadgeInput('HQ Country', 'companyHqCountry', 'Headquarters country', countries, true)}
              {renderBadgeInput('HQ Regions', 'companyHqRegions', 'Headquarters region', regions, true)}
              {renderBadgeInput('HQ City', 'companyHqCity', 'Headquarters city', commonCities, true)}
              {renderTextInput('HQ State', 'companyHqState', 'Headquarters state/province')}
            </div>
            
            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Company Data</h4>
              {renderTextInput('Last Updated', 'companyLastUpdated', 'Data freshness date')}
              {renderTextInput('Categories & Keywords', 'companyCategoriesKeywords', 'Company categories')}
              {renderMultiSelect('Stock Exchange', ['NYSE', 'NASDAQ', 'LSE', 'TSE', 'ASX'], 'companyStockExchange')}
              {renderTextInput('Stock Ticker', 'companyStockTicker', 'e.g., AAPL, GOOGL')}
              {renderBooleanFilter('B2B Company', 'companyIsB2B')}
              {renderRangeInput('Employee Growth Rate', 'companyEmployeeGrowthRate', '% yearly growth')}
              {renderTextInput('Last Funding Date', 'companyLastFundingDate', 'Latest funding round date')}
              {renderRangeInput('Last Funding Amount', 'companyLastFundingAmount', 'USD funding amount')}
            </div>
          </>
        )}

        {/* Education */}
        {renderSection(
          'Education',
          <GraduationCap className="w-4 h-4 text-gray-600" />,
          'education',
          <>
            {renderTextInput('Degree/Title', 'educationTitle', 'e.g., Bachelor of Science')}
            {renderTextInput('Major/Field', 'educationMajor', 'e.g., Computer Science')}
            {renderTextInput('Institution', 'educationInstitution', 'e.g., Stanford University')}
            {renderTextInput('Institution URL', 'educationInstitutionUrl', 'School website')}
            {renderTextInput('Education Description', 'educationDescription', 'Program description')}
            {renderTextInput('Activities & Societies', 'educationActivities', 'Extra-curricular activities')}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Start Year Range</label>
                {renderRangeInput('', 'educationDateFrom', 'graduation start year')}
              </div>
              <div>
                <label className="text-sm text-gray-600">End Year Range</label>
                {renderRangeInput('', 'educationDateTo', 'graduation end year')}
              </div>
            </div>
          </>
        )}

        {/* Certifications */}
        {renderSection(
          'Certifications',
          <Award className="w-4 h-4 text-gray-600" />,
          'certifications',
          <>
            {renderTextInput('Certification Title', 'certificationTitle', 'e.g., AWS Certified')}
            {renderTextInput('Certification Issuer', 'certificationIssuer', 'e.g., Amazon Web Services')}
            {renderTextInput('Credential ID', 'certificationCredentialId', 'Certification ID number')}
            {renderTextInput('Certificate URL', 'certificationUrl', 'Certificate verification link')}
            {renderTextInput('Issuer URL', 'certificationIssuerUrl', 'Issuing organization website')}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={filters.certificationDateFrom || ''}
                  onChange={(e) => updateFilter('certificationDateFrom', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={filters.certificationDateTo || ''}
                  onChange={(e) => updateFilter('certificationDateTo', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="border-t pt-3 mt-3">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Granular Date Filters</h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Issue Year Range</label>
                  {renderRangeInput('', 'certificationFromYear', 'issue years')}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Expiry Year Range</label>
                  {renderRangeInput('', 'certificationToYear', 'expiry years')}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="text-xs text-gray-600">Issue Month Range</label>
                  {renderRangeInput('', 'certificationFromMonth', 'months (1-12)')}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Expiry Month Range</label>
                  {renderRangeInput('', 'certificationToMonth', 'months (1-12)')}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Awards */}
        {renderSection(
          'Awards',
          <Award className="w-4 h-4 text-gray-600" />,
          'awards',
          <>
            {renderTextInput('Award Title', 'awardTitle', 'Professional awards')}
            {renderTextInput('Award Issuer', 'awardIssuer', 'Issuing organization')}
            {renderTextInput('Award Description', 'awardDescription', 'Award details')}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Award Date</label>
              <input
                type="date"
                value={filters.awardDate || ''}
                onChange={(e) => updateFilter('awardDate', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Award Year Range</label>
                {renderRangeInput('', 'awardYear', 'award years')}
              </div>
              <div>
                <label className="text-xs text-gray-600">Award Month Range</label>
                {renderRangeInput('', 'awardMonth', 'months (1-12)')}
              </div>
            </div>
          </>
        )}

        {/* Languages */}
        {renderSection(
          'Languages',
          <Languages className="w-4 h-4 text-gray-600" />,
          'languages',
          <>
            {renderTextInput('Languages (comma separated)', 'languages', 'English, Spanish, French')}
            {renderMultiSelect('Proficiency Level', languageProficiencies, 'languageProficiency')}
          </>
        )}

        {/* Activities */}
        {renderSection(
          'Professional Activities',
          <Briefcase className="w-4 h-4 text-gray-600" />,
          'activities',
          <>
            {renderTextInput('Activity Title', 'activityTitle', 'Professional activity title')}
            {renderTextInput('Activity Action', 'activityAction', 'Action performed')}
            {renderTextInput('Activity URL', 'activityUrl', 'Link to activity')}
          </>
        )}

        {/* Organizations */}
        {renderSection(
          'Organizations',
          <Building2 className="w-4 h-4 text-gray-600" />,
          'organizations',
          <>
            {renderTextInput('Organization Name', 'organizationName', 'Organization or club name')}
            {renderTextInput('Position', 'organizationPosition', 'Role in organization')}
            {renderTextInput('Description', 'organizationDescription', 'Organization description')}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.organizationDateFrom || ''}
                  onChange={(e) => updateFilter('organizationDateFrom', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.organizationDateTo || ''}
                  onChange={(e) => updateFilter('organizationDateTo', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="border-t pt-3 mt-3">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Granular Date Filters</h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Start Year Range</label>
                  {renderRangeInput('', 'organizationFromYear', 'start years')}
                </div>
                <div>
                  <label className="text-xs text-gray-600">End Year Range</label>
                  {renderRangeInput('', 'organizationToYear', 'end years')}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="text-xs text-gray-600">Start Month Range</label>
                  {renderRangeInput('', 'organizationFromMonth', 'months (1-12)')}
                </div>
                <div>
                  <label className="text-xs text-gray-600">End Month Range</label>
                  {renderRangeInput('', 'organizationToMonth', 'months (1-12)')}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Patents */}
        {renderSection(
          'Patents',
          <FileText className="w-4 h-4 text-gray-600" />,
          'patents',
          <>
            {renderTextInput('Patent Title', 'patentTitle', 'Patent or application title')}
            {renderMultiSelect('Patent Status', ['Filed', 'Published', 'Granted', 'Expired', 'Pending'], 'patentStatus')}
            {renderTextInput('Inventors', 'patentInventors', 'Patent inventors names')}
            {renderTextInput('Patent Date', 'patentDate', 'Patent filing/grant date')}
            {renderTextInput('Patent URL', 'patentUrl', 'Link to patent documentation')}
            {renderTextInput('Patent Description', 'patentDescription', 'Patent description keywords')}
            {renderTextInput('Patent Number', 'patentNumber', 'Patent or application number')}
            
            <div>
              <label className="text-xs text-gray-600">Patent Year Range</label>
              {renderRangeInput('', 'patentYear', 'patent years')}
            </div>
          </>
        )}

        {/* Publications */}
        {renderSection(
          'Publications',
          <BookOpen className="w-4 h-4 text-gray-600" />,
          'publications',
          <>
            {renderTextInput('Publication Title', 'publicationTitle', 'Research paper or article title')}
            {renderTextInput('Publisher', 'publicationPublisher', 'Journal, conference, or publisher')}
            {renderTextInput('Authors', 'publicationAuthors', 'Publication authors')}
            {renderTextInput('Publication Date', 'publicationDate', 'Publication date')}
            {renderTextInput('Publication Description', 'publicationDescription', 'Publication abstract or keywords')}
            {renderTextInput('Publication URL', 'publicationUrl', 'Link to publication')}
            
            <div>
              <label className="text-xs text-gray-600">Publication Year Range</label>
              {renderRangeInput('', 'publicationYear', 'publication years')}
            </div>
          </>
        )}

        {/* Courses */}
        {renderSection(
          'Professional Courses',
          <GraduationCap className="w-4 h-4 text-gray-600" />,
          'courses',
          <>
            {renderTextInput('Course Title', 'courseTitle', 'Professional course name')}
            {renderTextInput('Course Organizer', 'courseOrganizer', 'Training provider or institution')}
          </>
        )}

        {/* Recommendations */}
        {renderSection(
          'Recommendations',
          <Users className="w-4 h-4 text-gray-600" />,
          'recommendations',
          <>
            {renderTextInput('Recommendation Text', 'recommendationText', 'Recommendation content keywords')}
            {renderTextInput('Referee Name', 'recommendationRefereeName', 'Person who gave recommendation')}
            {renderTextInput('Referee URL', 'recommendationRefereeUrl', 'Referee profile link')}
            {renderRangeInput('Recommendations Count', 'recommendationsCount', 'number of recommendations')}
          </>
        )}

        {/* Profile Metrics */}
        {renderSection(
          'Profile Metrics',
          <DollarSign className="w-4 h-4 text-gray-600" />,
          'profileMetrics',
          <>
            {renderRangeInput('Connections Count', 'connectionsCount', 'LinkedIn connections')}
            {renderRangeInput('Followers Count', 'followerCount', 'Social media followers')}
            {renderTextInput('Last Updated', 'lastUpdated', 'Profile data freshness date')}
            {renderBooleanFilter('Is Deleted', 'isDeleted')}
            {renderBooleanFilter('Is Hidden', 'isHidden')}
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-purple-200 p-4 bg-purple-50">
        <div className="flex space-x-2">
          <button
            onClick={onApplyFilters}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilterPanel;