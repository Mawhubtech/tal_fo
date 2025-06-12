import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Users, Mail, MessageSquare, BarChart3, PieChart } from 'lucide-react';

const CandidateOutreachAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock analytics data
  const overallMetrics = [
    { label: 'Total Candidates Contacted', value: '1,247', change: '+15%', trend: 'up' },
    { label: 'Overall Response Rate', value: '24.3%', change: '+3.2%', trend: 'up' },
    { label: 'Interview Conversion', value: '12.8%', change: '+1.5%', trend: 'up' },
    { label: 'Hire Conversion', value: '3.2%', change: '-0.8%', trend: 'down' },
  ];

  const campaignPerformance = [
    { name: 'Senior React Developer', sent: 45, opened: 28, replied: 12, interested: 8, responseRate: 26.7 },
    { name: 'Full Stack Engineer', sent: 32, opened: 18, replied: 8, interested: 5, responseRate: 25.0 },
    { name: 'DevOps Engineer', sent: 28, opened: 12, replied: 6, interested: 3, responseRate: 21.4 },
    { name: 'Product Manager', sent: 55, opened: 35, replied: 15, interested: 9, responseRate: 27.3 },
    { name: 'Data Scientist', sent: 38, opened: 22, replied: 9, interested: 6, responseRate: 23.7 },
  ];

  const channelPerformance = [
    { channel: 'Email', sent: 198, responses: 52, rate: 26.3 },
    { channel: 'LinkedIn', sent: 89, responses: 18, rate: 20.2 },
    { channel: 'Phone', sent: 34, responses: 12, rate: 35.3 },
  ];

  const topPerformers = [
    { name: 'Sarah Johnson', position: 'Senior React Developer', score: 9.2, status: 'Hired' },
    { name: 'Michael Chen', position: 'Full Stack Engineer', score: 8.8, status: 'Final Interview' },
    { name: 'Emily Davis', position: 'DevOps Engineer', score: 8.5, status: 'Technical Interview' },
    { name: 'David Wilson', position: 'Product Manager', score: 8.3, status: 'Interview Scheduled' },
    { name: 'Lisa Anderson', position: 'Data Scientist', score: 8.1, status: 'In Review' },
  ];

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hired': return 'bg-green-100 text-green-700';
      case 'Final Interview': return 'bg-purple-100 text-purple-700';
      case 'Technical Interview': return 'bg-blue-100 text-blue-700';
      case 'Interview Scheduled': return 'bg-yellow-100 text-yellow-700';
      case 'In Review': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Outreach Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance and optimize your candidate outreach strategy</p>
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
                      <div className="text-lg font-semibold text-purple-600">{campaign.interested}</div>
                      <div className="text-xs text-gray-500">Interested</div>
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
                      {channel.channel === 'Phone' && <Users className="w-5 h-5 text-purple-600" />}
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

      {/* Top Performing Candidates */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Performing Candidates</h2>
          <p className="text-sm text-gray-600 mt-1">Candidates with highest engagement and progression scores</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPerformers.map((candidate, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">{candidate.score}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(candidate.score / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          candidate.status === 'Hired' ? 'bg-green-500' :
                          candidate.status === 'Final Interview' ? 'bg-purple-500' :
                          candidate.status === 'Technical Interview' ? 'bg-blue-500' :
                          candidate.status === 'Interview Scheduled' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}
                        style={{ 
                          width: candidate.status === 'Hired' ? '100%' :
                                candidate.status === 'Final Interview' ? '80%' :
                                candidate.status === 'Technical Interview' ? '60%' :
                                candidate.status === 'Interview Scheduled' ? '40%' :
                                '20%'
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CandidateOutreachAnalytics;
