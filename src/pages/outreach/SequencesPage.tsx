import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Filter, MoreVertical, Mail, Copy, 
  Edit, Trash2, Eye, MessageSquare, Send,
  Home, ChevronRight, Calendar, Clock, Tag,
  FileText, Star, Heart
} from 'lucide-react';
import { useEmailSequences, useEmailSequenceAnalytics } from '../../hooks/useEmailSequences';
import { EmailSequence } from '../../services/emailSequencesApiService';

// Types - using the backend types
type SequenceType = EmailSequence['type'];
type SequenceCategory = EmailSequence['category'];

const SequencesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<SequenceType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<SequenceCategory | 'all'>('all');

  // Fetch sequences from API
  const { 
    data: sequencesResponse, 
    isLoading: sequencesLoading, 
    error: sequencesError 
  } = useEmailSequences({
    search: searchTerm || undefined,
    type: selectedFilter !== 'all' ? selectedFilter : undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    isPreset: false, // Only show user sequences, not system presets
    limit: 50,
  });

  const { 
    data: analytics, 
    isLoading: analyticsLoading 
  } = useEmailSequenceAnalytics();

  const sequences = sequencesResponse?.data || [];
  const typeConfig = {
    initial: { label: 'Initial Outreach', color: 'bg-blue-100 text-blue-800' },
    follow_up: { label: 'Follow-up', color: 'bg-yellow-100 text-yellow-800' },
    cold_outreach: { label: 'Cold Outreach', color: 'bg-purple-100 text-purple-800' },
    warm_intro: { label: 'Warm Introduction', color: 'bg-green-100 text-green-800' },
    thank_you: { label: 'Thank You', color: 'bg-gray-100 text-gray-800' },
    candidate_outreach: { label: 'Candidate Outreach', color: 'bg-indigo-100 text-indigo-800' },
    client_outreach: { label: 'Client Outreach', color: 'bg-emerald-100 text-emerald-800' },
    custom: { label: 'Custom', color: 'bg-slate-100 text-slate-800' }
  };

  const categories = ['All', 'Candidate Sourcing', 'Client Outreach', 'Recruitment', 'Follow-up', 'General', 'Networking', 'Interview', 'Onboarding', 'Custom'];

  const filteredSequences = sequences.filter(sequence => {
    const matchesSearch = searchTerm === '' || 
      sequence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sequence.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sequence.steps.some(step => step.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedFilter === 'all' || sequence.type === selectedFilter;
    const matchesCategory = selectedCategory === 'all' || sequence.category === selectedCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const SequenceCard: React.FC<{ sequence: EmailSequence }> = ({ sequence }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{sequence.name}</h3>
              {sequence.isFavorite && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig[sequence.type].color}`}>
                {typeConfig[sequence.type].label}
              </span>
            </div>
            {sequence.description && (
              <p className="text-sm text-gray-600 mb-2">{sequence.description}</p>
            )}
            <div className="flex flex-wrap gap-1 mb-3">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                {sequence.category.replace('_', ' ')}
              </span>
              {sequence.tags?.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sequence Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{sequence.usageCount}</div>
            <div className="text-xs text-gray-600">Times Used</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {sequence.responseRate > 0 ? `${sequence.responseRate}%` : 'N/A'}
            </div>
            <div className="text-xs text-gray-600">Response Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{sequence.steps?.length || 0}</div>
            <div className="text-xs text-gray-600">Steps</div>
          </div>
        </div>

        {/* Sequence Preview */}
        {isExpanded && sequence.steps && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Sequence Steps:</h4>
            <div className="space-y-3">
              {sequence.steps.map((step, index) => (
                <div key={step.id || index} className="text-sm">
                  <div className="font-medium text-gray-900">
                    Step {step.stepOrder}: {step.name}
                  </div>
                  {step.subject && (
                    <div className="text-gray-600">Subject: {step.subject}</div>
                  )}
                  <div className="text-gray-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border mt-2">
                    {step.content}
                  </div>
                </div>
              ))}
            </div>
            {sequence.variables && sequence.variables.length > 0 && (
              <div className="mt-3">
                <h5 className="text-xs font-medium text-gray-700 mb-1">Variables:</h5>
                <div className="flex flex-wrap gap-1">
                  {sequence.variables.map((variable, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sequence Details */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Created:</span>
            <span>{new Date(sequence.createdAt).toLocaleDateString()}</span>
          </div>
          {sequence.lastUsedAt && (
            <div className="flex items-center justify-between">
              <span>Last Used:</span>
              <span>{new Date(sequence.lastUsedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          <button className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium">
            <Send className="w-4 h-4" />
            Use Sequence
          </button>
          <button className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium">
            {sequence.isFavorite ? (
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
            {sequence.isFavorite ? 'Unfavorite' : 'Favorite'}
          </button>
        </div>
      </div>
    );
  };

  const stats = {
    totalSequences: sequences.length,
    favoriteSequences: sequences.filter(t => t.isFavorite).length,
    totalUsage: sequences.reduce((sum, t) => sum + t.usageCount, 0),
    avgResponseRate: sequences.filter(t => t.responseRate > 0).length > 0 
      ? sequences.filter(t => t.responseRate > 0).reduce((sum, t) => sum + t.responseRate, 0) / sequences.filter(t => t.responseRate > 0).length 
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {sequencesLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Loading sequences...</span>
        </div>
      )}

      {/* Error State */}
      {sequencesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading sequences
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>There was an error loading your email sequences. Please try again.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content - only show when not loading */}
      {!sequencesLoading && (
        <>
          {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="flex items-center hover:text-gray-700">
          <Home className="w-4 h-4 mr-1" />
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to="/dashboard/sourcing" className="hover:text-gray-700">
          Sourcing
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">Sequences</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Sequences</h1>
          <p className="text-gray-600 mt-1">Create and manage reusable email sequences for your outreach campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            New Sequence
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">
            {analyticsLoading ? '...' : (analytics?.totalSequences ?? stats.totalSequences)}
          </div>
          <div className="text-sm text-gray-600">Total Sequences</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {analyticsLoading ? '...' : (analytics?.favoriteSequences ?? stats.favoriteSequences)}
          </div>
          <div className="text-sm text-gray-600">Favorites</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {analyticsLoading ? '...' : (analytics?.totalUsage ?? stats.totalUsage)}
          </div>
          <div className="text-sm text-gray-600">Total Usage</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {analyticsLoading ? '...' : `${(analytics?.averageResponseRate ?? stats.avgResponseRate).toFixed(1)}%`}
          </div>
          <div className="text-sm text-gray-600">Avg Response Rate</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sequences..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
          />
        </div>
        <select 
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value as SequenceType | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="initial">Initial Outreach</option>
          <option value="follow_up">Follow-up</option>
          <option value="cold_outreach">Cold Outreach</option>
          <option value="warm_intro">Warm Introduction</option>
          <option value="thank_you">Thank You</option>
          <option value="candidate_outreach">Candidate Outreach</option>
          <option value="client_outreach">Client Outreach</option>
          <option value="custom">Custom</option>
        </select>
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as SequenceCategory | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
        >
          {categories.map(category => (
            <option key={category} value={category === 'All' ? 'all' : category.toLowerCase().replace(' ', '_')}>
              {category} {category !== 'All' ? 'Sequences' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Sequences Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSequences.map(sequence => (
          <SequenceCard key={sequence.id} sequence={sequence} />
        ))}
      </div>

      {filteredSequences.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sequences found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedFilter !== 'all' || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first email sequence'
            }
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Sequence
          </button>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default SequencesPage;
