import React, { useState } from 'react';
import { Search, Filter, Plus, Play, Pause, Edit, Trash2, Users, Mail, TrendingUp, Calendar } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'linkedin' | 'multi-channel';
  status: 'draft' | 'active' | 'paused' | 'completed';
  candidates: number;
  sent: number;
  opened: number;
  replied: number;
  interested: number;
  startDate: Date;
  endDate?: Date;
  template: string;
  description: string;
}

const CandidateOutreachCampaigns: React.FC = () => {
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Mock data for campaigns
  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Senior React Developer Outreach',
      type: 'email',
      status: 'active',
      candidates: 45,
      sent: 45,
      opened: 28,
      replied: 12,
      interested: 8,
      startDate: new Date('2024-01-15'),
      template: 'React Developer Template',
      description: 'Outreach campaign for senior React developers in the Bay Area'
    },
    {
      id: '2',
      name: 'Full Stack Engineer - Remote',
      type: 'linkedin',
      status: 'active',
      candidates: 32,
      sent: 25,
      opened: 18,
      replied: 8,
      interested: 5,
      startDate: new Date('2024-01-18'),
      template: 'Remote Position Template',
      description: 'Targeting full stack engineers for remote positions'
    },
    {
      id: '3',
      name: 'DevOps Engineer Campaign',
      type: 'multi-channel',
      status: 'paused',
      candidates: 28,
      sent: 20,
      opened: 12,
      replied: 6,
      interested: 3,
      startDate: new Date('2024-01-10'),
      template: 'DevOps Specialist Template',
      description: 'Multi-channel outreach for DevOps engineers'
    },
    {
      id: '4',
      name: 'Product Manager Outreach',
      type: 'email',
      status: 'draft',
      candidates: 55,
      sent: 0,
      opened: 0,
      replied: 0,
      interested: 0,
      startDate: new Date('2024-01-25'),
      template: 'PM Leadership Template',
      description: 'Campaign for senior product management roles'
    }
  ];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'linkedin': return <Users className="w-4 h-4" />;
      case 'multi-channel': return <TrendingUp className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
    const responseRate = campaign.sent > 0 ? ((campaign.replied / campaign.sent) * 100).toFixed(1) : '0';
    const interestRate = campaign.sent > 0 ? ((campaign.interested / campaign.sent) * 100).toFixed(1) : '0';

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-purple-600">
                {getTypeIcon(campaign.type)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          </div>
          <div className="flex space-x-2">
            {campaign.status === 'active' ? (
              <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg">
                <Pause className="w-4 h-4" />
              </button>
            ) : (
              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                <Play className="w-4 h-4" />
              </button>
            )}
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{campaign.candidates}</div>
            <div className="text-sm text-gray-600">Candidates</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{campaign.sent}</div>
            <div className="text-sm text-gray-600">Sent</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{responseRate}%</div>
            <div className="text-sm text-gray-600">Response Rate</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{interestRate}%</div>
            <div className="text-sm text-gray-600">Interest Rate</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Started {campaign.startDate.toLocaleDateString()}</span>
          </div>
          <span className="text-purple-600 font-medium">Template: {campaign.template}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Outreach Campaigns</h1>
          <p className="text-gray-600 mt-1">Create and manage your candidate outreach campaigns</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('cards')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                view === 'cards' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                view === 'table' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Cards View */}
      {view === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map(campaign => {
                  const responseRate = campaign.sent > 0 ? ((campaign.replied / campaign.sent) * 100).toFixed(1) : '0';
                  
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">{campaign.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="text-purple-600">
                            {getTypeIcon(campaign.type)}
                          </div>
                          <span className="text-sm text-gray-900 capitalize">{campaign.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.candidates}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {responseRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.startDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {campaign.status === 'active' ? (
                            <button className="text-yellow-600 hover:text-yellow-900">
                              <Pause className="w-4 h-4" />
                            </button>
                          ) : (
                            <button className="text-green-600 hover:text-green-900">
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateOutreachCampaigns;
