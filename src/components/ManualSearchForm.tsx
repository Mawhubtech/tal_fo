import React, { useState } from 'react';
import {
  Building,
  MapPin,
  Users,
  Search,
  Calendar,
  DollarSign,
  Code,
  Target,
  Briefcase,
  Globe,
  Plus,
  X,
  Play,
  ArrowRight
} from 'lucide-react';
import { ClientSearchFilters } from '../services/clientOutreachSearchService';

interface ManualSearchFormProps {
  filters: ClientSearchFilters;
  onFiltersChange: (filters: ClientSearchFilters) => void;
  onExecuteSearch: () => void;
  isExecuting: boolean;
}

const ManualSearchForm: React.FC<ManualSearchFormProps> = ({
  filters,
  onFiltersChange,
  onExecuteSearch,
  isExecuting
}) => {
  const [tempInputs, setTempInputs] = useState({
    industry: '',
    location: '',
    technology: '',
    keyword: '',
    excludeCompany: '',
    excludeDomain: '',
    companySize: '',
    fundingStage: ''
  });

  const updateFilters = (field: keyof ClientSearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const addToArray = (field: keyof ClientSearchFilters, value: string, inputKey: keyof typeof tempInputs) => {
    if (value.trim()) {
      const currentArray = (filters[field] as string[]) || [];
      updateFilters(field, [...currentArray, value.trim()]);
      setTempInputs(prev => ({ ...prev, [inputKey]: '' }));
    }
  };

  const removeFromArray = (field: keyof ClientSearchFilters, valueToRemove: string) => {
    const currentArray = (filters[field] as string[]) || [];
    updateFilters(field, currentArray.filter(item => item !== valueToRemove));
  };

  const updateRange = (field: 'employees' | 'revenue', subField: 'min' | 'max', value: number | undefined) => {
    const currentRange = filters[field] || {};
    updateFilters(field, {
      ...currentRange,
      [subField]: value
    });
  };

  const hasValidFilters = () => {
    return (
      (filters.industries && filters.industries.length > 0) ||
      (filters.locations && filters.locations.length > 0) ||
      (filters.technologies && filters.technologies.length > 0) ||
      (filters.keywords && filters.keywords.length > 0) ||
      (filters.companySize && filters.companySize.length > 0) ||
      (filters.employees?.min || filters.employees?.max) ||
      (filters.revenue?.min || filters.revenue?.max)
    );
  };

  const companySizeOptions = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1001-5000',
    '5001-10000',
    '10000+'
  ];

  const fundingStageOptions = [
    'Pre-Seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C',
    'Series D+',
    'IPO',
    'Acquired',
    'Private'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Manual Search Filters</h2>
        <p className="text-gray-500 text-sm">
          Build your search query using specific filters based on CoreSignal database schema.
        </p>
      </div>

      {/* Core Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Industries */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-1" />
            Industries
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={tempInputs.industry}
              onChange={(e) => setTempInputs(prev => ({ ...prev, industry: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('industries', tempInputs.industry, 'industry'))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Technology, Healthcare, Finance"
            />
            <button
              type="button"
              onClick={() => addToArray('industries', tempInputs.industry, 'industry')}
              className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.industries?.map((industry, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
              >
                {industry}
                <button
                  type="button"
                  onClick={() => removeFromArray('industries', industry)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Locations (Countries)
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={tempInputs.location}
              onChange={(e) => setTempInputs(prev => ({ ...prev, location: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('locations', tempInputs.location, 'location'))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., United States, Germany, United Kingdom"
            />
            <button
              type="button"
              onClick={() => addToArray('locations', tempInputs.location, 'location')}
              className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.locations?.map((location, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {location}
                <button
                  type="button"
                  onClick={() => removeFromArray('locations', location)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Technologies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Code className="w-4 h-4 inline mr-1" />
            Technologies
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={tempInputs.technology}
              onChange={(e) => setTempInputs(prev => ({ ...prev, technology: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('technologies', tempInputs.technology, 'technology'))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Python, AWS, React, Salesforce"
            />
            <button
              type="button"
              onClick={() => addToArray('technologies', tempInputs.technology, 'technology')}
              className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.technologies?.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeFromArray('technologies', tech)}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Search className="w-4 h-4 inline mr-1" />
            Keywords
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={tempInputs.keyword}
              onChange={(e) => setTempInputs(prev => ({ ...prev, keyword: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('keywords', tempInputs.keyword, 'keyword'))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., SaaS, AI, Machine Learning, startup"
            />
            <button
              type="button"
              onClick={() => addToArray('keywords', tempInputs.keyword, 'keyword')}
              className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.keywords?.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeFromArray('keywords', keyword)}
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Company Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users className="w-4 h-4 inline mr-1" />
          Company Size
        </label>
        <div className="flex flex-wrap gap-2">
          {companySizeOptions.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                const currentSizes = filters.companySize || [];
                if (currentSizes.includes(size)) {
                  removeFromArray('companySize', size);
                } else {
                  updateFilters('companySize', [...currentSizes, size]);
                }
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.companySize?.includes(size)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {size} employees
            </button>
          ))}
        </div>
      </div>

      {/* Employee Count Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users className="w-4 h-4 inline mr-1" />
          Employee Count Range
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              value={filters.employees?.min || ''}
              onChange={(e) => updateRange('employees', 'min', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Minimum employees"
              min="0"
            />
          </div>
          <div>
            <input
              type="number"
              value={filters.employees?.max || ''}
              onChange={(e) => updateRange('employees', 'max', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Maximum employees"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Revenue Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <DollarSign className="w-4 h-4 inline mr-1" />
          Annual Revenue Range (USD)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              value={filters.revenue?.min || ''}
              onChange={(e) => updateRange('revenue', 'min', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Minimum revenue"
              min="0"
            />
          </div>
          <div>
            <input
              type="number"
              value={filters.revenue?.max || ''}
              onChange={(e) => updateRange('revenue', 'max', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Maximum revenue"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Funding Stage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Target className="w-4 h-4 inline mr-1" />
          Funding Stage
        </label>
        <div className="flex flex-wrap gap-2">
          {fundingStageOptions.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => {
                const currentStages = filters.fundingStage || [];
                if (currentStages.includes(stage)) {
                  removeFromArray('fundingStage', stage);
                } else {
                  updateFilters('fundingStage', [...currentStages, stage]);
                }
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.fundingStage?.includes(stage)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Exclude Filters */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Exclude Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Exclude Companies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-1" />
              Exclude Companies
            </label>
            <div className="flex mb-2">
              <input
                type="text"
                value={tempInputs.excludeCompany}
                onChange={(e) => setTempInputs(prev => ({ ...prev, excludeCompany: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('excludeCompanies', tempInputs.excludeCompany, 'excludeCompany'))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Microsoft, Google"
              />
              <button
                type="button"
                onClick={() => addToArray('excludeCompanies', tempInputs.excludeCompany, 'excludeCompany')}
                className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.excludeCompanies?.map((company, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                >
                  {company}
                  <button
                    type="button"
                    onClick={() => removeFromArray('excludeCompanies', company)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Exclude Domains */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Exclude Domains
            </label>
            <div className="flex mb-2">
              <input
                type="text"
                value={tempInputs.excludeDomain}
                onChange={(e) => setTempInputs(prev => ({ ...prev, excludeDomain: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('excludeDomains', tempInputs.excludeDomain, 'excludeDomain'))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., microsoft.com, google.com"
              />
              <button
                type="button"
                onClick={() => addToArray('excludeDomains', tempInputs.excludeDomain, 'excludeDomain')}
                className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.excludeDomains?.map((domain, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                >
                  {domain}
                  <button
                    type="button"
                    onClick={() => removeFromArray('excludeDomains', domain)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Execute Search Button */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Ready to find companies?</p>
            <p>This will search CoreSignal database using the filters above.</p>
            <p className="text-xs text-purple-600 mt-1">Cost: ~6 API credits (1 search + 5 company details)</p>
          </div>
          <button
            onClick={onExecuteSearch}
            disabled={!hasValidFilters() || isExecuting}
            className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {isExecuting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Execute Search
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualSearchForm;
