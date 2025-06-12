import React, { useState } from 'react';
import { 
  Search, Filter, Plus, MapPin, Building, Users, Globe, 
  ExternalLink, Linkedin, Eye, Star, Bookmark, ArrowRight,
  Briefcase, DollarSign, TrendingUp, Clock, Target
} from 'lucide-react';

interface SearchResult {
  id: string;
  companyName: string;
  description: string;
  industry: string;
  location: string;
  companySize: string;
  website?: string;
  founded?: string;
  employees?: string;
  revenue?: string;
  recentNews?: string[];
  keyContacts?: {
    name: string;
    title: string;
    linkedinUrl?: string;
  }[];
  source: 'google' | 'linkedin';
  matchScore: number;
  hiringPotential: 'low' | 'medium' | 'high';
  contactInfo?: {
    email?: string;
    phone?: string;
  };
}

const ClientOutreachSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<'all' | 'google' | 'linkedin'>('all');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCompanySize, setSelectedCompanySize] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [savedResults, setSavedResults] = useState<string[]>([]);

  // Mock search results - in a real app, this would come from your search API
  const mockResults: SearchResult[] = [
    {
      id: '1',
      companyName: 'InnovateTech Solutions',
      description: 'Leading software development company specializing in AI and machine learning solutions for enterprise clients.',
      industry: 'Technology',
      location: 'Austin, TX',
      companySize: '51-200',
      website: 'www.innovatetech.com',
      founded: '2018',
      employees: '150',
      revenue: '$10M - $50M',
      recentNews: [
        'Raised $15M Series A funding',
        'Launched new AI platform',
        'Expanding engineering team'
      ],
      keyContacts: [
        { name: 'Sarah Chen', title: 'CTO', linkedinUrl: '/in/sarahchen' },
        { name: 'Michael Rodriguez', title: 'VP Engineering', linkedinUrl: '/in/mrodriguez' }
      ],
      source: 'linkedin',
      matchScore: 95,
      hiringPotential: 'high',
      contactInfo: {
        email: 'careers@innovatetech.com',
        phone: '+1 (512) 555-0123'
      }
    },
    {
      id: '2',
      companyName: 'FinanceFlow Corp',
      description: 'Fintech startup revolutionizing payment processing and financial services for small businesses.',
      industry: 'Financial Services',
      location: 'New York, NY',
      companySize: '11-50',
      website: 'www.financeflow.com',
      founded: '2020',
      employees: '35',
      revenue: '$1M - $10M',
      recentNews: [
        'Partnership with major bank',
        'New product launch',
        'Hiring software engineers'
      ],
      keyContacts: [
        { name: 'David Kim', title: 'CEO', linkedinUrl: '/in/davidkim' },
        { name: 'Lisa Wang', title: 'Head of Product', linkedinUrl: '/in/lisawang' }
      ],
      source: 'google',
      matchScore: 87,
      hiringPotential: 'high'
    },
    {
      id: '3',
      companyName: 'HealthTech Innovations',
      description: 'Healthcare technology company developing digital health solutions and telemedicine platforms.',
      industry: 'Healthcare',
      location: 'Boston, MA',
      companySize: '201-500',
      website: 'www.healthtechinnovations.com',
      founded: '2015',
      employees: '300',
      revenue: '$50M+',
      recentNews: [
        'FDA approval for new platform',
        'Expanding to European markets',
        'Growing development team'
      ],
      keyContacts: [
        { name: 'Dr. Jennifer Adams', title: 'Chief Medical Officer', linkedinUrl: '/in/jennadams' },
        { name: 'Robert Taylor', title: 'VP Technology', linkedinUrl: '/in/robtaylor' }
      ],
      source: 'linkedin',
      matchScore: 82,
      hiringPotential: 'medium'
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate API call delay
    setTimeout(() => {
      setSearchResults(mockResults.filter(result => {
        const matchesQuery = result.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            result.industry.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesSource = selectedSource === 'all' || result.source === selectedSource;
        const matchesIndustry = !selectedIndustry || result.industry === selectedIndustry;
        const matchesLocation = !selectedLocation || result.location.includes(selectedLocation);
        const matchesSize = !selectedCompanySize || result.companySize === selectedCompanySize;
        
        return matchesQuery && matchesSource && matchesIndustry && matchesLocation && matchesSize;
      }));
      setIsSearching(false);
    }, 1500);
  };

  const handleSaveResult = (resultId: string) => {
    setSavedResults(prev => 
      prev.includes(resultId) 
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'linkedin': return <Linkedin className="w-4 h-4 text-blue-600" />;
      case 'google': return <Globe className="w-4 h-4 text-red-600" />;
      default: return <Search className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const SearchCard: React.FC<{ result: SearchResult }> = ({ result }) => (
    <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{result.companyName}</h3>
          <div className="flex items-center gap-1">
            {getSourceIcon(result.source)}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(result.hiringPotential)}`}>
              {result.hiringPotential} potential
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-green-600">{result.matchScore}% match</span>
          <button
            onClick={() => handleSaveResult(result.id)}
            className={`p-1 rounded hover:bg-gray-100 ${
              savedResults.includes(result.id) ? 'text-yellow-500' : 'text-gray-400'
            }`}
          >
            <Star className={`w-4 h-4 ${savedResults.includes(result.id) ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4">{result.description}</p>

      {/* Company Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-3 h-3" />
            <span>{result.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Building className="w-3 h-3" />
            <span>{result.industry}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-3 h-3" />
            <span>{result.companySize} employees</span>
          </div>
        </div>
        <div className="space-y-2">
          {result.founded && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-3 h-3" />
              <span>Founded {result.founded}</span>
            </div>
          )}
          {result.revenue && (
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-3 h-3" />
              <span>{result.revenue}</span>
            </div>
          )}
          {result.website && (
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="w-3 h-3" />
              <a href={`https://${result.website}`} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline">
                {result.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Key Contacts */}
      {result.keyContacts && result.keyContacts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Key Contacts</h4>
          <div className="space-y-2">
            {result.keyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-900">{contact.name}</span>
                  <span className="text-gray-600 ml-2">{contact.title}</span>
                </div>
                {contact.linkedinUrl && (
                  <a href={`https://linkedin.com${contact.linkedinUrl}`} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4 text-blue-600 hover:text-blue-700" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent News */}
      {result.recentNews && result.recentNews.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Recent News</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {result.recentNews.slice(0, 2).map((news, index) => (
              <li key={index} className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-green-600" />
                {news}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
            <Eye className="w-3 h-3" />
            View Details
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100">
            <Plus className="w-3 h-3" />
            Add to Prospects
          </button>
        </div>
        <button className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100">
          Start Outreach
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Search</h1>
        <p className="text-gray-600">Search for potential clients on Google and LinkedIn</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="space-y-4">
          {/* Main Search */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for companies, industries, or technologies..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Sources</option>
                <option value="google">Google</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="City, State"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
              <select
                value={selectedCompanySize}
                onChange={(e) => setSelectedCompanySize(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Any Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {isSearching ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Searching for potential clients...</p>
          </div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Found {searchResults.length} potential clients
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {savedResults.length} saved
              </span>
              {savedResults.length > 0 && (
                <button className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100">
                  <Bookmark className="w-3 h-3" />
                  View Saved
                </button>
              )}
            </div>
          </div>
          
          <div className="grid gap-6">
            {searchResults.map((result) => (
              <SearchCard key={result.id} result={result} />
            ))}
          </div>
        </div>
      ) : searchQuery && !isSearching ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters to find more results.
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start your client search</h3>
          <p className="text-gray-600 mb-4">
            Search for potential clients using company names, industries, or technologies.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setSearchQuery('fintech startup');
                handleSearch();
              }}
              className="px-3 py-1 text-sm text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100"
            >
              Fintech startups
            </button>
            <button
              onClick={() => {
                setSearchQuery('healthcare technology');
                handleSearch();
              }}
              className="px-3 py-1 text-sm text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100"
            >
              Healthcare tech
            </button>
            <button
              onClick={() => {
                setSearchQuery('AI companies');
                handleSearch();
              }}
              className="px-3 py-1 text-sm text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100"
            >
              AI companies
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientOutreachSearch;
