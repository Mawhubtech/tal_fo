import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Mail, MessageSquare, BarChart3, TrendingUp, 
  Clock, Target, Send, Plus, Eye, ArrowUpRight 
} from 'lucide-react';

const OutreachOverview: React.FC = () => {
  // Mock data - replace with real data from your API
  const stats = {
    totalProspects: 1247,
    activeCampaigns: 8,
    emailsSent: 3456,
    responseRate: 24.5,
    totalTemplates: 15,
    scheduledEmails: 89
  };

  const recentActivity = [
    { id: 1, action: 'New prospect added', details: 'John Doe - CTO at TechCorp', time: '2 hours ago', type: 'prospect' },
    { id: 2, action: 'Campaign launched', details: 'Software Engineer Outreach Q1', time: '4 hours ago', type: 'campaign' },
    { id: 3, action: 'Email response received', details: 'Jane Smith replied to your outreach', time: '6 hours ago', type: 'response' },
    { id: 4, action: 'Template created', details: 'Follow-up sequence template', time: '1 day ago', type: 'template' },
  ];

  const activeCampaigns = [
    {
      id: 1,
      name: 'Software Engineer Outreach Q1',
      prospects: 156,
      sent: 89,
      responses: 12,
      responseRate: 13.5,
      status: 'active',
      lastActivity: '2 hours ago'
    },
    {
      id: 2,
      name: 'Product Manager Recruitment',
      prospects: 98,
      sent: 67,
      responses: 18,
      responseRate: 26.9,
      status: 'active',
      lastActivity: '1 day ago'
    },
    {
      id: 3,
      name: 'Senior Developer Outreach',
      prospects: 203,
      sent: 156,
      responses: 31,
      responseRate: 19.9,
      status: 'active',
      lastActivity: '3 hours ago'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'prospect': return <Users className="w-4 h-4 text-blue-600" />;
      case 'campaign': return <Mail className="w-4 h-4 text-green-600" />;
      case 'response': return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case 'template': return <MessageSquare className="w-4 h-4 text-orange-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outreach Overview</h1>
          <p className="text-gray-600 mt-1">Manage your prospect relationships and outreach campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/dashboard/outreach/prospects" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Users className="w-4 h-4 mr-2" />
            View Prospects
          </Link>
          <Link 
            to="/dashboard/outreach/campaigns" 
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalProspects.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Prospects</div>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</div>
              <div className="text-sm text-gray-600">Active Campaigns</div>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.emailsSent.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Emails Sent</div>
            </div>
            <Send className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.responseRate}%</div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-indigo-600">{stats.totalTemplates}</div>
              <div className="text-sm text-gray-600">Templates</div>
            </div>
            <MessageSquare className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.scheduledEmails}</div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </div>
            <Clock className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Campaigns */}
        <div className="lg:col-span-2 bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Campaigns</h2>
              <Link 
                to="/dashboard/outreach/campaigns" 
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
              >
                View All <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {activeCampaigns.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-500">Last activity: {campaign.lastActivity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {campaign.status}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{campaign.prospects}</div>
                      <div className="text-gray-500">Prospects</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{campaign.sent}</div>
                      <div className="text-gray-500">Sent</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{campaign.responses}</div>
                      <div className="text-gray-500">Responses</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600">{campaign.responseRate}%</div>
                      <div className="text-gray-500">Rate</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.details}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/dashboard/outreach/prospects"
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <Users className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Manage Prospects</h3>
            <p className="text-sm text-gray-500">Add and organize your prospect database</p>
          </Link>
          
          <Link 
            to="/dashboard/outreach/campaigns"
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <Mail className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Create Campaign</h3>
            <p className="text-sm text-gray-500">Launch new outreach campaigns</p>
          </Link>
          
          <Link 
            to="/dashboard/outreach/templates"
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <MessageSquare className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Email Templates</h3>
            <p className="text-sm text-gray-500">Create and manage email templates</p>
          </Link>
          
          <Link 
            to="/dashboard/outreach/analytics"
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">View Analytics</h3>
            <p className="text-sm text-gray-500">Track performance and metrics</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OutreachOverview;
