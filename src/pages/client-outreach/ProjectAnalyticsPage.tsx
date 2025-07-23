import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  Building, 
  Users, 
  DollarSign, 
  Mail,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useClientOutreachProject } from '../../hooks/useClientOutreachProjects';
import { useClientOutreachProjectAnalytics } from '../../hooks/useClientOutreachProjects';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5A2B'];

const ProjectAnalyticsPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: project } = useClientOutreachProject(projectId!);
  const { data: analytics, isLoading } = useClientOutreachProjectAnalytics(projectId!);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'demographics' | 'performance'>('overview');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Not Available</h2>
          <p className="text-gray-600">Analytics data is not available for this project yet.</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Prospects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analytics.overview.totalProspects.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {analytics.overview.totalSearches} searches
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(analytics.overview.responseRate * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-green-600 mt-1">
                Industry avg: 25%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meetings Scheduled</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analytics.overview.meetingsScheduled}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                {(analytics.overview.conversionRate * 100).toFixed(1)}% conversion
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue Generated</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${analytics.overview.actualRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-orange-600 mt-1">
                {analytics.overview.dealsClosed} deals closed
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Funnel Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Prospects</span>
              <span className="font-semibold text-gray-900">{analytics.overview.totalProspects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Contacted</span>
              <span className="font-semibold text-gray-900">
                {Math.round(analytics.overview.totalProspects * 0.8)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Responded</span>
              <span className="font-semibold text-gray-900">
                {Math.round(analytics.overview.totalProspects * analytics.overview.responseRate)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Meetings Scheduled</span>
              <span className="font-semibold text-gray-900">{analytics.overview.meetingsScheduled}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Deals Closed</span>
              <span className="font-semibold text-gray-900">{analytics.overview.dealsClosed}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {analytics.demographics.byStatus.map((item, index) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700 capitalize">{item.status.replace('-', ' ')}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prospects Over Time</h3>
          <div className="space-y-3">
            {analytics.trends.prospectsOverTime.slice(-5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                <span className="text-sm font-semibold text-gray-900">{item.count} prospects</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Rate Trend</h3>
          <div className="space-y-3">
            {analytics.trends.responseRateOverTime.slice(-5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                <span className="text-sm font-semibold text-green-600">{(item.rate * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate Trend</h3>
          <div className="space-y-3">
            {analytics.trends.conversionRateOverTime.slice(-5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                <span className="text-sm font-semibold text-orange-600">{(item.rate * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
          <div className="space-y-3">
            {analytics.trends.revenueOverTime.slice(-5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                <span className="text-sm font-semibold text-red-600">${item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDemographics = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Industry</h3>
          <div className="space-y-3">
            {analytics.demographics.byIndustry.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{item.industry}</div>
                  <div className="text-sm text-gray-600">{item.count} prospects</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">
                    {(item.responseRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">response rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Company Size</h3>
          <div className="space-y-3">
            {analytics.demographics.byCompanySize.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{item.size}</div>
                  <div className="text-sm text-gray-600">{item.count} prospects</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-blue-600">
                    {(item.responseRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">response rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.demographics.byLocation.map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="font-medium text-gray-900 mb-1">{item.location}</div>
              <div className="text-sm text-gray-600 mb-2">{item.count} prospects</div>
              <div className="text-sm font-semibold text-green-600">
                {(item.responseRate * 100).toFixed(1)}% response rate
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Searches</h3>
          <div className="space-y-4">
            {analytics.performance.topPerformingSearches.map((search, index) => (
              <div key={search.searchId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{search.name}</h4>
                  <p className="text-sm text-gray-600">
                    {search.conversions} conversions • {(search.responseRate * 100).toFixed(1)}% response rate
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-purple-600">#{index + 1}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Sequences</h3>
          <div className="space-y-4">
            {analytics.performance.topPerformingSequences.map((sequence, index) => (
              <div key={sequence.sequenceId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{sequence.name}</h4>
                  <p className="text-sm text-gray-600">
                    {sequence.conversions} conversions • {(sequence.responseRate * 100).toFixed(1)}% response rate
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">#{index + 1}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Days for Outreach</h3>
          <div className="space-y-3">
            {analytics.performance.bestDays.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="font-medium text-gray-900 capitalize">{item.day}</div>
                <div className="text-sm font-semibold text-purple-600">
                  {(item.responseRate * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Times for Outreach</h3>
          <div className="space-y-3">
            {analytics.performance.bestTimes.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="font-medium text-gray-900">{item.hour}:00</div>
                <div className="text-sm font-semibold text-green-600">
                  {(item.responseRate * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link
            to={`/dashboard/client-outreach/projects/${projectId}`}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Analytics</h1>
            <p className="text-gray-600">{project?.name}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
            { id: 'demographics', label: 'Demographics', icon: PieChart },
            { id: 'performance', label: 'Performance', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className={`mr-2 w-5 h-5 ${
                activeTab === tab.id ? 'text-purple-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'trends' && renderTrends()}
      {activeTab === 'demographics' && renderDemographics()}
      {activeTab === 'performance' && renderPerformance()}
    </div>
  );
};

export default ProjectAnalyticsPage;
