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
    fundingStage: '',
    companyName: '',
    website: '',
    ticker: '',
    specialty: ''
  });

  const updateFilters = (field: keyof ClientSearchFilters, value: any) => {
    const newFilters = {
      ...filters,
      [field]: value
    };
    onFiltersChange(newFilters);
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

  const updateRange = (field: 'employees' | 'revenue' | 'followers' | 'founded', subField: 'min' | 'max', value: number | undefined) => {
    const currentRange = filters[field] || {};
    updateFilters(field, {
      ...currentRange,
      [subField]: value
    });
  };

  const hasValidFilters = () => {
    return (
      (filters.companyNames && filters.companyNames.length > 0) ||
      (filters.industries && filters.industries.length > 0) ||
      (filters.locations && filters.locations.length > 0) ||
      (filters.technologies && filters.technologies.length > 0) ||
      (filters.keywords && filters.keywords.length > 0) ||
      (filters.specialties && filters.specialties.length > 0) ||
      (filters.websites && filters.websites.length > 0) ||
      (filters.companySize && filters.companySize.length > 0) ||
      (filters.fundingStage && filters.fundingStage.length > 0) ||
      (filters.companyType && filters.companyType.length > 0) ||
      (filters.ticker && filters.ticker.length > 0) ||
      (filters.exchange && filters.exchange.length > 0) ||
      (filters.employees?.min !== undefined && filters.employees.min > 0) ||
      (filters.employees?.max !== undefined && filters.employees.max > 0) ||
      (filters.revenue?.min !== undefined && filters.revenue.min > 0) ||
      (filters.revenue?.max !== undefined && filters.revenue.max > 0) ||
      (filters.followers?.min !== undefined && filters.followers.min > 0) ||
      (filters.followers?.max !== undefined && filters.followers.max > 0) ||
      (filters.founded?.min !== undefined && filters.founded.min > 0) ||
      (filters.founded?.max !== undefined && filters.founded.max > 0) ||
      (filters.excludeCompanies && filters.excludeCompanies.length > 0) ||
      (filters.excludeDomains && filters.excludeDomains.length > 0) ||
      filters.hasPricing !== undefined ||
      filters.hasFreeTrial !== undefined ||
      filters.hasDemo !== undefined ||
      filters.isDownloadable !== undefined ||
      filters.hasMobileApps !== undefined ||
      filters.hasApiDocs !== undefined ||
      filters.hasFacebook !== undefined ||
      filters.hasTwitter !== undefined ||
      filters.hasLinkedIn !== undefined ||
      filters.hasInstagram !== undefined ||
      filters.hasYoutube !== undefined ||
      filters.hasGithub !== undefined
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

  const companyTypeOptions = [
    'Public Company',
    'Private Company',
    'Educational Institution',
    'Government Agency',
    'Nonprofit',
    'Partnership',
    'Sole Proprietorship',
    'Self-Employed',
    'Self-Owned'
  ];

  const exchangeOptions = [
    'NASDAQ',
    'NYSE',
    'AMEX',
    'LSE',
    'TSX',
    'ASX',
    'EURONEXT',
    'XETRA',
    'NIKKEI'
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
        {/* Company Names */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-1" />
            Company Names
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={tempInputs.companyName}
              onChange={(e) => setTempInputs(prev => ({ ...prev, companyName: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('companyNames', tempInputs.companyName, 'companyName'))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Apple, Microsoft, Google"
            />
            <button
              type="button"
              onClick={() => addToArray('companyNames', tempInputs.companyName, 'companyName')}
              className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.companyNames?.map((company, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {company}
                <button
                  type="button"
                  onClick={() => removeFromArray('companyNames', company)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

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

        {/* Websites/Domains */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            Websites/Domains
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={tempInputs.website}
              onChange={(e) => setTempInputs(prev => ({ ...prev, website: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('websites', tempInputs.website, 'website'))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., apple.com, microsoft.com"
            />
            <button
              type="button"
              onClick={() => addToArray('websites', tempInputs.website, 'website')}
              className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.websites?.map((website, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyan-100 text-cyan-800"
              >
                {website}
                <button
                  type="button"
                  onClick={() => removeFromArray('websites', website)}
                  className="ml-2 text-cyan-600 hover:text-cyan-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Specialties */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="w-4 h-4 inline mr-1" />
            Specialties
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={tempInputs.specialty}
              onChange={(e) => setTempInputs(prev => ({ ...prev, specialty: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('specialties', tempInputs.specialty, 'specialty'))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Cloud Computing, Data Analytics"
            />
            <button
              type="button"
              onClick={() => addToArray('specialties', tempInputs.specialty, 'specialty')}
              className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.specialties?.map((specialty, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-800"
              >
                {specialty}
                <button
                  type="button"
                  onClick={() => removeFromArray('specialties', specialty)}
                  className="ml-2 text-teal-600 hover:text-teal-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Stock Ticker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Stock Ticker
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              value={tempInputs.ticker}
              onChange={(e) => setTempInputs(prev => ({ ...prev, ticker: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('ticker', tempInputs.ticker, 'ticker'))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., AAPL, MSFT, GOOGL"
            />
            <button
              type="button"
              onClick={() => addToArray('ticker', tempInputs.ticker, 'ticker')}
              className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.ticker?.map((tick, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-800"
              >
                {tick}
                <button
                  type="button"
                  onClick={() => removeFromArray('ticker', tick)}
                  className="ml-2 text-emerald-600 hover:text-emerald-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Company Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Briefcase className="w-4 h-4 inline mr-1" />
          Company Type
        </label>
        <div className="flex flex-wrap gap-2">
          {companyTypeOptions.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                const currentTypes = filters.companyType || [];
                if (currentTypes.includes(type)) {
                  removeFromArray('companyType', type);
                } else {
                  updateFilters('companyType', [...currentTypes, type]);
                }
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.companyType?.includes(type)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Exchange */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <DollarSign className="w-4 h-4 inline mr-1" />
          Stock Exchange
        </label>
        <div className="flex flex-wrap gap-2">
          {exchangeOptions.map((exchange) => (
            <button
              key={exchange}
              type="button"
              onClick={() => {
                const currentExchanges = filters.exchange || [];
                if (currentExchanges.includes(exchange)) {
                  removeFromArray('exchange', exchange);
                } else {
                  updateFilters('exchange', [...currentExchanges, exchange]);
                }
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.exchange?.includes(exchange)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {exchange}
            </button>
          ))}
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

      {/* Followers Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users className="w-4 h-4 inline mr-1" />
          LinkedIn Followers Range
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              value={filters.followers?.min || ''}
              onChange={(e) => updateRange('followers', 'min', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Minimum followers"
              min="0"
            />
          </div>
          <div>
            <input
              type="number"
              value={filters.followers?.max || ''}
              onChange={(e) => updateRange('followers', 'max', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Maximum followers"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Founded Year Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Founded Year Range
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              value={filters.founded?.min || ''}
              onChange={(e) => updateRange('founded', 'min', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Earliest year (e.g., 2000)"
              min="1800"
              max={new Date().getFullYear()}
            />
          </div>
          <div>
            <input
              type="number"
              value={filters.founded?.max || ''}
              onChange={(e) => updateRange('founded', 'max', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Latest year (e.g., 2024)"
              min="1800"
              max={new Date().getFullYear()}
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

      {/* Business Model Filters */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Model</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.hasPricing === true}
              onChange={(e) => updateFilters('hasPricing', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Has Pricing</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.hasFreeTrial === true}
              onChange={(e) => updateFilters('hasFreeTrial', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Free Trial</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.hasDemo === true}
              onChange={(e) => updateFilters('hasDemo', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Demo Available</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.isDownloadable === true}
              onChange={(e) => updateFilters('isDownloadable', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Downloadable</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.hasMobileApps === true}
              onChange={(e) => updateFilters('hasMobileApps', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Mobile Apps</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.hasApiDocs === true}
              onChange={(e) => updateFilters('hasApiDocs', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">API Documentation</span>
          </label>
        </div>
      </div>

      {/* Social Media Presence */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Presence</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.hasLinkedIn === true}
              onChange={(e) => updateFilters('hasLinkedIn', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">LinkedIn</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.hasTwitter === true}
              onChange={(e) => updateFilters('hasTwitter', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Twitter/X</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.hasFacebook === true}
              onChange={(e) => updateFilters('hasFacebook', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Facebook</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.hasInstagram === true}
              onChange={(e) => updateFilters('hasInstagram', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Instagram</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.hasYoutube === true}
              onChange={(e) => updateFilters('hasYoutube', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">YouTube</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.hasGithub === true}
              onChange={(e) => updateFilters('hasGithub', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">GitHub</span>
          </label>
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
