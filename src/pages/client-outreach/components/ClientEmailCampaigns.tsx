import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Copy, Eye, Mail, Play, Pause, Clock, BarChart3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmailCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft' | 'completed';
  type: 'initial_outreach' | 'follow_up' | 'nurture' | 'promotional';
  emails: number;
  totalRecipients: number;
  sentEmails: number;
  openRate: number;
  replyRate: number;
  clickRate: number;
  description: string;
  lastSent?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientEmailCampaignsProps {
  projectId: string;
}

const ClientEmailCampaigns: React.FC<ClientEmailCampaignsProps> = ({ projectId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);

  // Mock data for email campaigns
  const campaigns: EmailCampaign[] = [
    {
      id: '1',
      name: 'Initial Client Outreach Campaign',
      status: 'active',
      type: 'initial_outreach',
      emails: 3,
      totalRecipients: 156,
      sentEmails: 234,
      openRate: 45.2,
      replyRate: 8.7,
      clickRate: 12.3,
      description: 'First touch campaign to introduce our services to potential clients. Multi-step sequence with personalized messaging.',
      lastSent: new Date('2025-01-20'),
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-01-20')
    },
    {
      id: '2',
      name: 'Follow-up Campaign',
      status: 'paused',
      type: 'follow_up',
      emails: 2,
      totalRecipients: 89,
      sentEmails: 178,
      openRate: 38.9,
      replyRate: 12.4,
      clickRate: 15.2,
      description: 'Follow-up sequence for prospects who showed initial interest but haven\'t responded.',
      lastSent: new Date('2025-01-18'),
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-18')
    },
    {
      id: '3',
      name: 'Client Nurture Series',
      status: 'draft',
      type: 'nurture',
      emails: 5,
      totalRecipients: 0,
      sentEmails: 0,
      openRate: 0,
      replyRate: 0,
      clickRate: 0,
      description: 'Long-term nurture campaign for prospects not ready to engage immediately.',
      createdAt: new Date('2025-01-22'),
      updatedAt: new Date('2025-01-22')
    },
    {
      id: '4',
      name: 'Service Promotion Campaign',
      status: 'completed',
      type: 'promotional',
      emails: 4,
      totalRecipients: 245,
      sentEmails: 980,
      openRate: 52.1,
      replyRate: 15.8,
      clickRate: 28.4,
      description: 'Promotional campaign highlighting our new recruitment services and special offers.',
      lastSent: new Date('2025-01-10'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-15')
    }
  ];

  const statuses = [
    { key: '', label: 'All Statuses' },
    { key: 'active', label: 'Active' },
    { key: 'paused', label: 'Paused' },
    { key: 'draft', label: 'Draft' },
    { key: 'completed', label: 'Completed' }
  ];

  const types = [
    { key: '', label: 'All Types' },
    { key: 'initial_outreach', label: 'Initial Outreach' },
    { key: 'follow_up', label: 'Follow Up' },
    { key: 'nurture', label: 'Nurture' },
    { key: 'promotional', label: 'Promotional' }
  ];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || campaign.status === selectedStatus;
    const matchesType = !selectedType || campaign.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'completed': return <BarChart3 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'initial_outreach': return 'bg-blue-100 text-blue-700';
      case 'follow_up': return 'bg-orange-100 text-orange-700';
      case 'nurture': return 'bg-purple-100 text-purple-700';
      case 'promotional': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const CampaignCard: React.FC<{ campaign: EmailCampaign }> = ({ campaign }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
              {getStatusIcon(campaign.status)}
              <span className="ml-1">{campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}</span>
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(campaign.type)}`}>
              {campaign.type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {campaign.description}
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSelectedCampaign(campaign)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Duplicate">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{campaign.emails}</p>
          <p className="text-xs text-gray-500">Emails</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{campaign.totalRecipients}</p>
          <p className="text-xs text-gray-500">Recipients</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-green-600">{campaign.openRate}%</p>
          <p className="text-xs text-gray-500">Open Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-blue-600">{campaign.replyRate}%</p>
          <p className="text-xs text-gray-500">Reply Rate</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>Sent {campaign.sentEmails} emails</span>
          {campaign.lastSent && (
            <span>Last sent {campaign.lastSent.toLocaleDateString()}</span>
          )}
        </div>
        <span>{campaign.clickRate}% click rate</span>
      </div>
    </div>
  );

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600 mt-1">Create and manage email campaigns for client outreach</p>
        </div>
        <Link 
          to={`/client-outreach/projects/${projectId}/campaigns/create`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Mail className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-semibold text-gray-900">{campaigns.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Recipients</p>
              <p className="text-2xl font-semibold text-gray-900">
                {campaigns.reduce((total, campaign) => total + campaign.totalRecipients, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Open Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {campaigns.length > 0 
                  ? (campaigns.reduce((total, campaign) => total + campaign.openRate, 0) / campaigns.length).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Mail className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Reply Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {campaigns.length > 0 
                  ? (campaigns.reduce((total, campaign) => total + campaign.replyRate, 0) / campaigns.length).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status.key} value={status.key}>{status.label}</option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {types.map(type => (
              <option key={type.key} value={type.key}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedStatus || selectedType 
              ? "Try adjusting your filters to see more campaigns."
              : "Get started by creating your first email campaign."
            }
          </p>
          {searchTerm || selectedStatus || selectedType ? (
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('');
                setSelectedType('');
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Filters
            </button>
          ) : (
            <Link
              to={`/client-outreach/projects/${projectId}/campaigns/create`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Campaign
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedCampaign.name}</h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedCampaign.status)}`}>
                      {getStatusIcon(selectedCampaign.status)}
                      <span className="ml-1">{selectedCampaign.status.charAt(0).toUpperCase() + selectedCampaign.status.slice(1)}</span>
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedCampaign.type)}`}>
                      {selectedCampaign.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Description</h3>
                <p className="text-gray-600">{selectedCampaign.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-semibold text-gray-900">{selectedCampaign.emails}</p>
                  <p className="text-sm text-gray-500">Total Emails</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-semibold text-gray-900">{selectedCampaign.totalRecipients}</p>
                  <p className="text-sm text-gray-500">Recipients</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-semibold text-gray-900">{selectedCampaign.sentEmails}</p>
                  <p className="text-sm text-gray-500">Sent Emails</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-semibold text-green-600">{selectedCampaign.openRate}%</p>
                  <p className="text-sm text-gray-500">Open Rate</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-semibold text-blue-600">{selectedCampaign.replyRate}%</p>
                  <p className="text-sm text-gray-500">Reply Rate</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-semibold text-purple-600">{selectedCampaign.clickRate}%</p>
                  <p className="text-sm text-gray-500">Click Rate</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                Edit Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientEmailCampaigns;
