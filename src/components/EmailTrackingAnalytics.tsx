import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Eye,
  MousePointer,
  MessageSquare,
  Mail,
  TrendingUp,
  TrendingDown,
  Globe,
  Monitor,
  Clock,
  BarChart3,
} from 'lucide-react';

interface Props {
  sequenceId?: string;
  stepId?: string;
  className?: string;
}

export const EmailTrackingAnalytics: React.FC<Props> = ({ sequenceId, stepId, className }) => {
  const { id } = useParams();
  const targetId = sequenceId || stepId || id;
  
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'devices' | 'timing' | 'geography'>('overview');

  // Mock data for testing - this will be replaced with real API data later
  const mockAnalytics = {
    totalSent: 150,
    totalOpened: 75,
    totalClicked: 30,
    totalReplied: 8,
    openRate: 50.0,
    clickRate: 20.0,
    responseRate: 5.3
  };

  const getEngagementTrend = (rate: number): React.ReactElement => {
    const isPositive = rate > 20;
    return isPositive ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const tabButtons = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'engagement', label: 'Engagement', icon: TrendingUp },
    { id: 'devices', label: 'Devices', icon: Monitor },
    { id: 'timing', label: 'Timing', icon: Clock },
    { id: 'geography', label: 'Geography', icon: Globe },
  ];

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Email Tracking Analytics
        </h3>
        <p className="text-gray-600">
          Track email performance and engagement metrics {targetId ? `for sequence ${targetId}` : ''}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabButtons.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{mockAnalytics.totalSent.toLocaleString()}</p>
                </div>
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Rate</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-2xl font-bold text-blue-600">{mockAnalytics.openRate}%</p>
                    {getEngagementTrend(mockAnalytics.openRate)}
                  </div>
                </div>
                <Eye className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Click Rate</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-2xl font-bold text-purple-600">{mockAnalytics.clickRate}%</p>
                    {getEngagementTrend(mockAnalytics.clickRate)}
                  </div>
                </div>
                <MousePointer className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-2xl font-bold text-green-600">{mockAnalytics.responseRate}%</p>
                    {getEngagementTrend(mockAnalytics.responseRate)}
                  </div>
                </div>
                <MessageSquare className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>

          {/* Additional Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Opened</p>
                  <p className="text-xl font-bold text-blue-900">{mockAnalytics.totalOpened}</p>
                </div>
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clicked</p>
                  <p className="text-xl font-bold text-purple-900">{mockAnalytics.totalClicked}</p>
                </div>
                <MousePointer className="w-6 h-6 text-purple-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Replied</p>
                  <p className="text-xl font-bold text-green-900">{mockAnalytics.totalReplied}</p>
                </div>
                <MessageSquare className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Analytics System Active
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Email tracking is enabled. Metrics will update as emails are sent and engaged with.</p>
                  {targetId && <p className="mt-1">Tracking data for sequence: {targetId}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other tabs show placeholder for now */}
      {activeTab !== 'overview' && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Analytics
          </h3>
          <p className="text-gray-600">
            Advanced {activeTab} analytics will be available once real data is integrated.
          </p>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              🚧 This section will show detailed {activeTab} insights when connected to the backend tracking system.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTrackingAnalytics;
