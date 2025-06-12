import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Building, Mail, MessageSquare, BarChart3, PieChart } from 'lucide-react';

const ClientOutreachAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock analytics data
  const overallMetrics = [
    { label: 'Total Companies Contacted', value: '347', change: '+22%', trend: 'up' },
    { label: 'Overall Response Rate', value: '31.4%', change: '+5.2%', trend: 'up' },
    { label: 'Meeting Conversion', value: '18.7%', change: '+2.1%', trend: 'up' },
    { label: 'Deal Conversion', value: '7.3%', change: '+0.9%', trend: 'up' },
  ];

  const campaignPerformance = [
    { name: 'Enterprise Technology', sent: 25, opened: 18, replied: 8, meetings: 4, responseRate: 32.0 },
    { name: 'Healthcare Startups', sent: 18, opened: 12, replied: 6, meetings: 3, responseRate: 33.3 },
    { name: 'Fintech Scale-ups', sent: 22, opened: 14, replied: 5, meetings: 2, responseRate: 22.7 },
    { name: 'E-commerce Leaders', sent: 30, opened: 22, replied: 12, meetings: 7, responseRate: 40.0 },
    { name: 'Manufacturing', sent: 15, opened: 8, replied: 3, meetings: 1, responseRate: 20.0 },
  ];

  const channelPerformance = [
    { channel: 'Email', sent: 110, responses: 34, rate: 30.9 },
    { channel: 'LinkedIn', sent: 67, responses: 18, rate: 26.9 },
    { channel: 'Phone', sent: 23, responses: 12, rate: 52.2 },
  ];

  const topPerformingClients = [
    { name: 'TechCorp Inc.', industry: 'Technology', deals: 3, revenue: '$45k', status: 'Active' },
    { name: 'HealthTech Solutions', industry: 'Healthcare', deals: 2, revenue: '$32k', status: 'Active' },
    { name: 'FinanceFlow', industry: 'Financial Services', deals: 1, revenue: '$28k', status: 'Negotiating' },
    { name: 'E-commerce Giants', industry: 'E-commerce', deals: 4, revenue: '$67k', status: 'Active' },
    { name: 'InnovateNow Ltd.', industry: 'Technology', deals: 1, revenue: '$15k', status: 'Closed' },
  ];

  const industryBreakdown = [
    { industry: 'Technology', companies: 45, deals: 12, revenue: '$156k' },
    { industry: 'Healthcare', companies: 28, deals: 8, revenue: '$89k' },
    { industry: 'Financial Services', companies: 32, deals: 6, revenue: '$98k' },
    { industry: 'E-commerce', companies: 24, deals: 9, revenue: '$123k' },
    { industry: 'Manufacturing', companies: 18, deals: 3, revenue: '$34k' },
  ];

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Negotiating': return 'bg-yellow-100 text-yellow-700';
      case 'Closed': return 'bg-blue-100 text-blue-700';
      case 'Paused': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Outreach Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance and optimize your client acquisition strategy</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {timeRangeOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overallMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                <div className="flex items-center mt-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Campaign Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Campaign Performance</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {campaignPerformance.map((campaign, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                    <span className="text-sm font-semibold text-purple-600">
                      {campaign.responseRate}% response rate
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{campaign.sent}</div>
                      <div className="text-xs text-gray-500">Sent</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-blue-600">{campaign.opened}</div>
                      <div className="text-xs text-gray-500">Opened</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">{campaign.replied}</div>
                      <div className="text-xs text-gray-500">Replied</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-purple-600">{campaign.meetings}</div>
                      <div className="text-xs text-gray-500">Meetings</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${campaign.responseRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Channel Performance</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {channelPerformance.map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      {channel.channel === 'Email' && <Mail className="w-5 h-5 text-purple-600" />}
                      {channel.channel === 'LinkedIn' && <MessageSquare className="w-5 h-5 text-purple-600" />}
                      {channel.channel === 'Phone' && <Building className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{channel.channel}</h3>
                      <p className="text-sm text-gray-600">{channel.sent} sent • {channel.responses} responses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-purple-600">{channel.rate}%</div>
                    <div className="text-sm text-gray-500">Response Rate</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Channel Distribution Chart Placeholder */}
            <div className="mt-6 p-6 bg-gray-50 rounded-lg text-center">
              <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Channel distribution chart would go here</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Clients */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Clients</h2>
            <p className="text-sm text-gray-600 mt-1">Clients with highest deal value and engagement</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topPerformingClients.map((client, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">{client.industry}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.deals}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {client.revenue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Industry Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Industry Breakdown</h2>
            <p className="text-sm text-gray-600 mt-1">Performance across different industry sectors</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {industryBreakdown.map((industry, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{industry.industry}</h3>
                    <span className="text-sm font-semibold text-green-600">{industry.revenue}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">{industry.companies}</span> companies contacted
                    </div>
                    <div>
                      <span className="font-medium">{industry.deals}</span> deals closed
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(industry.deals / industry.companies) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {((industry.deals / industry.companies) * 100).toFixed(1)}% conversion rate
                    </div>
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

export default ClientOutreachAnalytics;
