import React, { useState } from 'react';
import { Calendar, Download, TrendingUp, Users, Briefcase, Target, Clock, DollarSign, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ComponentType<any>;
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30days');

  const metrics: MetricCard[] = [
    {
      title: 'Total Applications',
      value: '1,247',
      change: '+12.5%',
      isPositive: true,
      icon: Users
    },
    {
      title: 'Open Positions',
      value: '48',
      change: '+8.2%',
      isPositive: true,
      icon: Briefcase
    },
    {
      title: 'Placement Rate',
      value: '73.2%',
      change: '+5.1%',
      isPositive: true,
      icon: Target
    },
    {
      title: 'Time to Hire',
      value: '28 days',
      change: '-3.5%',
      isPositive: true,
      icon: Clock
    },
    {
      title: 'Cost per Hire',
      value: '$3,240',
      change: '-8.2%',
      isPositive: true,
      icon: DollarSign
    },
    {
      title: 'Source Effectiveness',
      value: '68.5%',
      change: '+2.8%',
      isPositive: true,
      icon: TrendingUp
    }
  ];

  const applicationsBySource: ChartData[] = [
    { name: 'LinkedIn', value: 385, color: '#0077B5' },
    { name: 'Indeed', value: 298, color: '#2164f3' },
    { name: 'Company Website', value: 234, color: '#10B981' },
    { name: 'Referrals', value: 189, color: '#F59E0B' },
    { name: 'Glassdoor', value: 141, color: '#34D399' }
  ];

  const hiringFunnel: ChartData[] = [
    { name: 'Applications', value: 1247 },
    { name: 'Phone Screening', value: 432 },
    { name: 'Technical Interview', value: 298 },
    { name: 'Final Interview', value: 156 },
    { name: 'Offers Extended', value: 89 },
    { name: 'Offers Accepted', value: 67 }
  ];

  const topPerformers = [
    { name: 'Sarah Johnson', role: 'Senior Recruiter', placements: 23, efficiency: '94%' },
    { name: 'Michael Chen', role: 'Technical Recruiter', placements: 19, efficiency: '87%' },
    { name: 'Emily Rodriguez', role: 'Talent Acquisition', placements: 17, efficiency: '82%' },
    { name: 'David Kim', role: 'Executive Recruiter', placements: 15, efficiency: '89%' },
    { name: 'Jessica Wang', role: 'HR Manager', placements: 12, efficiency: '78%' }
  ];

  const recentActivities = [
    { type: 'placement', message: 'John Doe placed at TechCorp as Senior Developer', time: '2 hours ago', value: '$125,000' },
    { type: 'interview', message: '5 interviews scheduled for tomorrow', time: '4 hours ago', value: null },
    { type: 'application', message: '23 new applications received', time: '6 hours ago', value: null },
    { type: 'offer', message: 'Offer accepted by candidate for Product Manager role', time: '1 day ago', value: '$140,000' },
    { type: 'source', message: 'LinkedIn campaign generated 45 new leads', time: '2 days ago', value: null }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'placement': return <Target className="h-4 w-4 text-green-600" />;
      case 'interview': return <Calendar className="h-4 w-4 text-primary-600" />;
      case 'application': return <Users className="h-4 w-4 text-purple-600" />;
      case 'offer': return <DollarSign className="h-4 w-4 text-yellow-600" />;
      case 'source': return <TrendingUp className="h-4 w-4 text-indigo-600" />;
      default: return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Calendar className="h-4 w-4 mr-2" />
            Custom Range
          </button>
          <button className="flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <IconComponent className="h-5 w-5 text-primary-600" />
                </div>
                <div className={`flex items-center text-sm font-medium ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.isPositive ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  {metric.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.title}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Source */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Source</h3>
          <div className="space-y-4">
            {applicationsBySource.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: source.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{source.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900 font-semibold">{source.value}</span>
                  <span className="text-xs text-gray-500">
                    {((source.value / applicationsBySource.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hiring Funnel */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Funnel</h3>
          <div className="space-y-3">
            {hiringFunnel.map((stage, index) => {
              const percentage = index === 0 ? 100 : (stage.value / hiringFunnel[0].value) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900 font-semibold">{stage.value}</span>
                      <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{performer.name}</div>
                    <div className="text-xs text-gray-500">{performer.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{performer.placements} placements</div>
                  <div className="text-xs text-green-600">{performer.efficiency} efficiency</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-900">{activity.message}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{activity.time}</span>
                    {activity.value && (
                      <span className="text-xs font-semibold text-green-600">{activity.value}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-primary-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">4.2x</div>
            <div className="text-sm text-primary-800">ROI on LinkedIn campaigns</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">92%</div>
            <div className="text-sm text-green-800">Interview show-up rate</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">18%</div>
            <div className="text-sm text-yellow-800">Improvement in quality scores</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">$2.1M</div>
            <div className="text-sm text-purple-800">Total placement value this month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
