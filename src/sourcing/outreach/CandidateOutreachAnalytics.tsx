import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, Users, Mail, MessageSquare, BarChart3, PieChart, Loader2 } from 'lucide-react';
import { useSourcingProspectStats, useSourcingProspects } from '../../hooks/useSourcingProspects';
import { useCandidateStats } from '../../hooks/useCandidates';
import CandidateOutreachAnalyticsService from '../../services/candidateOutreachAnalyticsService';

const CandidateOutreachAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  // Fetch real data from APIs
  const { data: prospectStats, isLoading: statsLoading, error: statsError } = useSourcingProspectStats();
  const { data: candidateStats, isLoading: candidateStatsLoading } = useCandidateStats();
  const { data: prospectsData, isLoading: prospectsLoading } = useSourcingProspects({ limit: 100 }); // Max limit 100

  // Calculate analytics from real data using the service
  const analyticsData = useMemo(() => {
    if (!prospectStats || !prospectsData || !candidateStats) {
      return {
        overallMetrics: [],
        campaignPerformance: [],
        channelPerformance: [],
        topPerformers: []
      };
    }

    const prospects = prospectsData.prospects || [];
    return CandidateOutreachAnalyticsService.calculateAnalyticsData(
      prospects,
      prospectStats,
      candidateStats
    );
  }, [prospectStats, prospectsData, candidateStats]);

  const { overallMetrics, campaignPerformance, channelPerformance, topPerformers } = analyticsData;

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' },
  ];

  // Loading state
  if (statsLoading || candidateStatsLoading || prospectsLoading) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">Error loading analytics data</div>
            <div className="text-sm text-gray-500">Please try refreshing the page</div>
          </div>
        </div>
      </div>
    );
  }

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
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Campaign Performance</h2>
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">Performance by skill specialization</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {campaignPerformance.length > 0 ? (
                campaignPerformance.map((campaign, index) => (
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
                        <div className="text-xs text-gray-500">Contacted</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-blue-600">{campaign.opened}</div>
                        <div className="text-xs text-gray-500">Est. Views</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">{campaign.replied}</div>
                        <div className="text-xs text-gray-500">Responded</div>
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
                          style={{ width: `${Math.min(campaign.responseRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No campaign data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Channel Performance</h2>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mt-1">Performance by outreach channel</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {channelPerformance.length > 0 ? (
                channelPerformance.map((channel, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        {(channel.channel.toLowerCase().includes('linkedin') || channel.channel.toLowerCase().includes('extension')) && <MessageSquare className="w-5 h-5 text-purple-600" />}
                        {channel.channel.toLowerCase().includes('email') && <Mail className="w-5 h-5 text-purple-600" />}
                        {(channel.channel.toLowerCase().includes('referral') || channel.channel.toLowerCase().includes('direct')) && <Users className="w-5 h-5 text-purple-600" />}
                        {(!channel.channel.toLowerCase().includes('linkedin') && !channel.channel.toLowerCase().includes('email') && !channel.channel.toLowerCase().includes('referral') && !channel.channel.toLowerCase().includes('direct') && !channel.channel.toLowerCase().includes('extension')) && <BarChart3 className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{channel.channel}</h3>
                        <p className="text-sm text-gray-600">{channel.sent} contacted • {channel.responses} responses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-purple-600">{channel.rate}%</div>
                      <div className="text-sm text-gray-500">Response Rate</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No channel data available</p>
                </div>
              )}
            </div>

            {/* Channel Distribution Chart Placeholder */}
            {channelPerformance.length > 0 && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg text-center">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Channel distribution visualization</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Candidates */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Performing Candidates</h2>
          <p className="text-sm text-gray-600 mt-1">Candidates with highest ratings and engagement</p>
        </div>
        {topPerformers.length > 0 ? (
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
                    Rating
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
                        <span className="text-sm font-medium text-gray-900 mr-2">{candidate.score}/10</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(candidate.score / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${CandidateOutreachAnalyticsService.getStatusColor(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${CandidateOutreachAnalyticsService.getProgressColor(candidate.status)}`}
                          style={{ 
                            width: CandidateOutreachAnalyticsService.getProgressWidth(candidate.status)
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No candidates data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateOutreachAnalytics;
