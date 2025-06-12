import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, BarChart3, Mail, Users, Target, 
  Calendar, Filter, Download, RefreshCw,
  Home, ChevronRight, ArrowUp, ArrowDown,
  Eye, MessageSquare, Clock, CheckCircle
} from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock data - replace with real data from your API
  const overallStats = {
    totalCampaigns: 12,
    totalProspects: 1247,
    emailsSent: 3456,
    responses: 824,
    responseRate: 23.8,
    meetings: 156,
    conversions: 48,
    conversionRate: 5.8
  };

  const campaignPerformance = [
    {
      id: '1',
      name: 'Software Engineer Outreach Q1',
      prospects: 156,
      sent: 89,
      delivered: 87,
      opened: 52,
      clicked: 18,
      replied: 12,
      responseRate: 13.5,
      openRate: 59.8,
      clickRate: 34.6,
      trend: 'up'
    },
    {
      id: '2',
      name: 'Product Manager Recruitment',
      prospects: 98,
      sent: 67,
      delivered: 65,
      opened: 41,
      clicked: 22,
      replied: 18,
      responseRate: 26.9,
      openRate: 63.1,
      clickRate: 53.7,
      trend: 'up'
    },
    {
      id: '3',
      name: 'Senior Developer Outreach',
      prospects: 203,
      sent: 156,
      delivered: 152,
      opened: 78,
      clicked: 31,
      replied: 31,
      responseRate: 19.9,
      openRate: 51.3,
      clickRate: 39.7,
      trend: 'down'
    },
    {
      id: '4',
      name: 'Data Science Recruitment',
      prospects: 124,
      sent: 124,
      delivered: 120,
      opened: 85,
      clicked: 42,
      replied: 28,
      responseRate: 22.6,
      openRate: 70.8,
      clickRate: 49.4,
      trend: 'up'
    }
  ];

  const timeSeriesData = [
    { date: '2024-01-01', sent: 45, responses: 8, meetings: 2 },
    { date: '2024-01-02', sent: 52, responses: 12, meetings: 3 },
    { date: '2024-01-03', sent: 38, responses: 9, meetings: 1 },
    { date: '2024-01-04', sent: 65, responses: 15, meetings: 4 },
    { date: '2024-01-05', sent: 71, responses: 18, meetings: 5 },
    { date: '2024-01-06', sent: 43, responses: 11, meetings: 2 },
    { date: '2024-01-07', sent: 58, responses: 14, meetings: 3 }
  ];

  const templatePerformance = [
    {
      id: '1',
      name: 'Software Engineer Introduction',
      usage: 45,
      responseRate: 18.5,
      avgResponseTime: '2.3 days',
      bestPerforming: true
    },
    {
      id: '2',
      name: 'Product Manager Follow-up',
      usage: 32,
      responseRate: 24.8,
      avgResponseTime: '1.8 days',
      bestPerforming: false
    },
    {
      id: '3',
      name: 'UX Designer Warm Introduction',
      usage: 28,
      responseRate: 42.1,
      avgResponseTime: '1.2 days',
      bestPerforming: true
    },
    {
      id: '4',
      name: 'Data Scientist Initial Outreach',
      usage: 19,
      responseRate: 31.6,
      avgResponseTime: '2.1 days',
      bestPerforming: false
    }
  ];

  const topPerformers = {
    bestResponseRate: campaignPerformance.reduce((prev, current) => 
      prev.responseRate > current.responseRate ? prev : current
    ),
    bestOpenRate: campaignPerformance.reduce((prev, current) => 
      prev.openRate > current.openRate ? prev : current
    ),
    bestClickRate: campaignPerformance.reduce((prev, current) => 
      prev.clickRate > current.clickRate ? prev : current
    ),
    mostActive: campaignPerformance.reduce((prev, current) => 
      prev.sent > current.sent ? prev : current
    )
  };

  const MetricCard: React.FC<{ 
    title: string; 
    value: string | number; 
    change?: number; 
    icon: React.ComponentType<any>;
    color: string;
  }> = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span className="text-sm font-medium ml-1">{Math.abs(change)}%</span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  const CampaignPerformanceTable: React.FC = () => (
    <div className="bg-white rounded-lg border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivered
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Opened
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clicked
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Replied
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Response Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trend
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaignPerformance.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{campaign.name}</div>
                  <div className="text-sm text-gray-500">{campaign.prospects} prospects</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.sent}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.delivered}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{campaign.opened}</div>
                  <div className="text-xs text-gray-500">{campaign.openRate}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{campaign.clicked}</div>
                  <div className="text-xs text-gray-500">{campaign.clickRate}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.replied}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    campaign.responseRate >= 20 
                      ? 'bg-green-100 text-green-800' 
                      : campaign.responseRate >= 15 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {campaign.responseRate}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center ${campaign.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {campaign.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TemplatePerformanceCard: React.FC = () => (
    <div className="bg-white rounded-lg border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Template Performance</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {templatePerformance.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  {template.bestPerforming && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                      Top Performer
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">Used {template.usage} times</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-900">{template.responseRate}%</div>
                  <div className="text-gray-500">Response Rate</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{template.avgResponseTime}</div>
                  <div className="text-gray-500">Avg Response Time</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TopPerformersCard: React.FC = () => (
    <div className="bg-white rounded-lg border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Best Response Rate</span>
            </div>
            <div className="font-semibold text-blue-900">{topPerformers.bestResponseRate.name}</div>
            <div className="text-sm text-blue-700">{topPerformers.bestResponseRate.responseRate}%</div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Best Open Rate</span>
            </div>
            <div className="font-semibold text-green-900">{topPerformers.bestOpenRate.name}</div>
            <div className="text-sm text-green-700">{topPerformers.bestOpenRate.openRate}%</div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Best Click Rate</span>
            </div>
            <div className="font-semibold text-purple-900">{topPerformers.bestClickRate.name}</div>
            <div className="text-sm text-purple-700">{topPerformers.bestClickRate.clickRate}%</div>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Most Active</span>
            </div>
            <div className="font-semibold text-orange-900">{topPerformers.mostActive.name}</div>
            <div className="text-sm text-orange-700">{topPerformers.mostActive.sent} emails sent</div>
          </div>
        </div>
      </div>
    </div>
  );

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
        <span className="text-gray-900 font-medium">Analytics</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outreach Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance and optimize your outreach campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Campaigns"
          value={overallStats.totalCampaigns}
          change={8.3}
          icon={Target}
          color="bg-blue-600"
        />
        <MetricCard
          title="Emails Sent"
          value={overallStats.emailsSent.toLocaleString()}
          change={12.5}
          icon={Mail}
          color="bg-green-600"
        />
        <MetricCard
          title="Response Rate"
          value={`${overallStats.responseRate}%`}
          change={-2.1}
          icon={MessageSquare}
          color="bg-purple-600"
        />
        <MetricCard
          title="Meetings Booked"
          value={overallStats.meetings}
          change={15.7}
          icon={Calendar}
          color="bg-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance Metrics */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Total Prospects</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{overallStats.totalProspects.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Across all campaigns</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Conversion Rate</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{overallStats.conversionRate}%</div>
                <div className="text-sm text-gray-500">{overallStats.conversions} conversions</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Avg Response Time</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">1.8 days</div>
                <div className="text-sm text-gray-500">Industry avg: 3.2 days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <TopPerformersCard />
      </div>

      {/* Campaign Performance Table */}
      <CampaignPerformanceTable />

      {/* Template Performance */}
      <TemplatePerformanceCard />

      {/* Time Series Chart Placeholder */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Performance Over Time</h3>
          <select 
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Metrics</option>
            <option value="sent">Emails Sent</option>
            <option value="responses">Responses</option>
            <option value="meetings">Meetings</option>
          </select>
        </div>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Chart will be implemented with a charting library</p>
            <p className="text-sm text-gray-400">Showing {selectedPeriod} days of data</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
