import React, { useState } from 'react';
import { Search, Filter, Plus, TrendingUp, Building, Mail, MessageSquare, BarChart3 } from 'lucide-react';

const ClientOutreachOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for client outreach stats
  const stats = [
    { label: 'Active Prospects', value: '234', change: '+18%', icon: Building, color: 'text-blue-600' },
    { label: 'Response Rate', value: '31.2%', change: '+5.1%', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Active Campaigns', value: '12', change: '+3', icon: Mail, color: 'text-purple-600' },
    { label: 'Meetings Scheduled', value: '28', change: '+12', icon: MessageSquare, color: 'text-orange-600' },
  ];

  const recentActivity = [
    { id: 1, type: 'response', company: 'TechCorp Inc.', action: 'Expressed interest in hiring', time: '1 hour ago', status: 'interested' },
    { id: 2, type: 'campaign', company: 'Enterprise Solutions Campaign', action: 'Campaign sent to 15 companies', time: '3 hours ago', status: 'sent' },
    { id: 3, type: 'meeting', company: 'InnovateNow Ltd.', action: 'Discovery call scheduled', time: '5 hours ago', status: 'scheduled' },
    { id: 4, type: 'response', company: 'StartupXYZ', action: 'No current hiring needs', time: '1 day ago', status: 'declined' },
  ];

  const activeCampaigns = [
    { id: 1, name: 'Enterprise Tech Companies', prospects: 25, responses: 8, status: 'active' },
    { id: 2, name: 'Healthcare Startups', prospects: 18, responses: 6, status: 'active' },
    { id: 3, name: 'Fintech Scale-ups', prospects: 22, responses: 5, status: 'paused' },
    { id: 4, name: 'E-commerce Leaders', prospects: 30, responses: 12, status: 'active' },
  ];
  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Outreach Overview</h1>
        <p className="text-gray-600">Manage and track your business development and client acquisition efforts</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'} mt-1`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className={`${stat.color} bg-gray-50 p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
            <Plus className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-purple-700 font-medium">Create Campaign</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
            <Search className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-700 font-medium">Find Companies</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
            <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700 font-medium">Create Template</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Campaigns */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Campaigns</h2>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {activeCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-600">
                      {campaign.prospects} prospects • {campaign.responses} responses
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {campaign.status}
                    </span>
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'interested' ? 'bg-green-400' :
                    activity.status === 'sent' ? 'bg-blue-400' :
                    activity.status === 'scheduled' ? 'bg-purple-400' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.company}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOutreachOverview;
