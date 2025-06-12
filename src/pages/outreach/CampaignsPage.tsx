import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Filter, MoreVertical, Mail, Users, 
  Calendar, Target, TrendingUp, Play, Pause, 
  Edit, Trash2, Eye, Copy, Send,
  Home, ChevronRight, Clock, CheckCircle
} from 'lucide-react';

// Types
interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  prospects: number;
  emailsSent: number;
  responses: number;
  responseRate: number;
  createdDate: string;
  lastActivity?: string;
  tags: string[];
  template?: string;
  schedule?: {
    startDate: string;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
}

const CampaignsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data - replace with real data from your API
  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Software Engineer Outreach Q1',
      description: 'Targeting senior software engineers for upcoming React projects',
      status: 'active',
      prospects: 156,
      emailsSent: 89,
      responses: 12,
      responseRate: 13.5,
      createdDate: '2024-01-15',
      lastActivity: '2024-01-20',
      tags: ['React', 'Senior', 'Remote'],
      template: 'Software Engineer Intro',
      schedule: {
        startDate: '2024-01-16',
        frequency: 'daily'
      }
    },
    {
      id: '2',
      name: 'Product Manager Recruitment',
      description: 'Seeking experienced product managers for B2B SaaS companies',
      status: 'active',
      prospects: 98,
      emailsSent: 67,
      responses: 18,
      responseRate: 26.9,
      createdDate: '2024-01-12',
      lastActivity: '2024-01-19',
      tags: ['Product', 'B2B', 'SaaS'],
      template: 'PM Opportunity',
      schedule: {
        startDate: '2024-01-13',
        frequency: 'weekly'
      }
    },
    {
      id: '3',
      name: 'Senior Developer Outreach',
      description: 'Full-stack developers for startup environment',
      status: 'paused',
      prospects: 203,
      emailsSent: 156,
      responses: 31,
      responseRate: 19.9,
      createdDate: '2024-01-10',
      lastActivity: '2024-01-18',
      tags: ['Full-stack', 'Startup', 'Mid-Senior'],
      template: 'Developer Opportunity',
      schedule: {
        startDate: '2024-01-11',
        frequency: 'daily'
      }
    },
    {
      id: '4',
      name: 'UX Designer Campaign',
      description: 'Creative UX designers for e-commerce projects',
      status: 'draft',
      prospects: 45,
      emailsSent: 0,
      responses: 0,
      responseRate: 0,
      createdDate: '2024-01-18',
      tags: ['UX', 'Design', 'E-commerce'],
      template: 'UX Designer Intro'
    },
    {
      id: '5',
      name: 'Data Science Recruitment',
      description: 'Data scientists and ML engineers for AI projects',
      status: 'completed',
      prospects: 124,
      emailsSent: 124,
      responses: 28,
      responseRate: 22.6,
      createdDate: '2024-01-01',
      lastActivity: '2024-01-15',
      tags: ['Data Science', 'ML', 'AI'],
      template: 'Data Scientist Opportunity',
      schedule: {
        startDate: '2024-01-02',
        frequency: 'daily'
      }
    }
  ];

  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit },
    active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: Play },
    paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800', icon: Pause },
    completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || campaign.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
    const StatusIcon = statusConfig[campaign.status].icon;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[campaign.status].color}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig[campaign.status].label}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {campaign.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
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

        {/* Campaign Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{campaign.prospects}</div>
            <div className="text-xs text-gray-600">Prospects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{campaign.emailsSent}</div>
            <div className="text-xs text-gray-600">Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{campaign.responses}</div>
            <div className="text-xs text-gray-600">Responses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{campaign.responseRate}%</div>
            <div className="text-xs text-gray-600">Rate</div>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Created:</span>
            <span>{new Date(campaign.createdDate).toLocaleDateString()}</span>
          </div>
          {campaign.lastActivity && (
            <div className="flex items-center justify-between">
              <span>Last Activity:</span>
              <span>{new Date(campaign.lastActivity).toLocaleDateString()}</span>
            </div>
          )}
          {campaign.template && (
            <div className="flex items-center justify-between">
              <span>Template:</span>
              <span className="text-purple-600">{campaign.template}</span>
            </div>
          )}
          {campaign.schedule && (
            <div className="flex items-center justify-between">
              <span>Schedule:</span>
              <span className="capitalize">{campaign.schedule.frequency}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          {campaign.status === 'draft' && (
            <button className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium">
              <Play className="w-4 h-4" />
              Launch
            </button>
          )}
          {campaign.status === 'active' && (
            <button className="flex items-center gap-1 px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm font-medium">
              <Pause className="w-4 h-4" />
              Pause
            </button>
          )}
          {campaign.status === 'paused' && (
            <button className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium">
              <Play className="w-4 h-4" />
              Resume
            </button>
          )}
          <button className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
            <Mail className="w-4 h-4" />
            Send Test
          </button>
          <button className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </button>
          <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium">
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
        </div>
      </div>
    );
  };

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalProspects: campaigns.reduce((sum, c) => sum + c.prospects, 0),
    totalEmailsSent: campaigns.reduce((sum, c) => sum + c.emailsSent, 0),
    avgResponseRate: campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + c.responseRate, 0) / campaigns.length 
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="flex items-center hover:text-gray-700">
          <Home className="w-4 h-4 mr-1" />
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to="/dashboard/outreach" className="hover:text-gray-700">
          Outreach
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">Campaigns</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-1">Create and manage your outreach campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</div>
          <div className="text-sm text-gray-600">Total Campaigns</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{stats.totalProspects.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Prospects</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{stats.totalEmailsSent.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Emails Sent</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{stats.avgResponseRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Avg Response Rate</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
          />
        </div>
        <select 
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first outreach campaign'
            }
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
