import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Building, UserPlus, Target, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Clock, Activity, Database,
  BarChart3, Settings, Globe, Shield, Server, Cpu, RefreshCw,
  Loader2, AlertCircle
} from 'lucide-react';
import { useAdminStats, useAdminActivity, useSystemComponents } from '../../hooks/useAdminStats';
import { adminApiService } from '../../services/adminApiService';

const AdminOverviewPage: React.FC = () => {
  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats();
  
  // Fetch recent activity
  const { data: recentActivity, isLoading: activityLoading } = useAdminActivity();
  
  // Fetch system components
  const { data: systemComponents, isLoading: systemLoading } = useSystemComponents();

  // Handle loading state
  if (statsLoading || activityLoading || systemLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          <span className="text-gray-600">Loading admin overview...</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (statsError) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load admin data</h3>
          <p className="text-gray-600 mb-4">There was an error loading the admin overview.</p>
          <button
            onClick={() => refetchStats()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Use actual data or fallbacks
  const adminStats = stats || {
    users: { total: 0, active: 0, inactive: 0, admins: 0, recruiters: 0, clients: 0, thisMonth: 0 },
    jobs: { total: 0, active: 0, filled: 0, paused: 0, thisMonth: 0 },
    candidates: { total: 0, active: 0, thisWeek: 0, thisMonth: 0 },
    organizations: { total: 0, active: 0, inactive: 0, premium: 0, trial: 0, thisMonth: 0 },
    system: { uptime: '99.9%', responseTime: 150, health: 'excellent' as const, apiStatus: 'operational' as const, databaseStatus: 'operational' as const, jobBoardStatus: 'operational' as const, securityStatus: 'operational' as const },
    recent_activity: []
  };

  const activities = recentActivity || [];
  const components = systemComponents || [];

  // Define quick actions
  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      link: '/dashboard/admin/users',
      icon: Users,
      color: 'bg-blue-500',
      stats: `${adminStats.totalUsers} users`
    },
    {
      title: 'Analytics',
      description: 'View system performance and metrics',
      link: '/dashboard/admin/analytics',
      icon: BarChart3,
      color: 'bg-green-500',
      stats: 'Real-time data'
    },
    {
      title: 'Resume Processing',
      description: 'Process and manage resume uploads',
      link: '/dashboard/admin/resume-processing',
      icon: Activity,
      color: 'bg-purple-500',
      stats: `${adminStats.pendingReviews} pending`
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      link: '/dashboard/admin/system-settings',
      icon: Settings,
      color: 'bg-orange-500',
      stats: 'Configure'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-600 mt-1">Manage and monitor your talent acquisition platform.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">System Status</p>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              adminStats.systemHealth === 'healthy' ? 'bg-green-500' :
              adminStats.systemHealth === 'warning' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></div>
            <p className="text-sm font-medium text-gray-900 capitalize">{adminStats.systemHealth}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{adminStats.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                {adminStats.activeUsers} active
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Candidates</p>
              <p className="text-3xl font-bold text-gray-900">{adminStats.totalCandidates.toLocaleString()}</p>
              <p className="text-sm text-purple-600 flex items-center mt-1">
                <UserPlus className="w-4 h-4 mr-1" />
                In system
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-3xl font-bold text-gray-900">{adminStats.totalJobs}</p>
              <p className="text-sm text-orange-600 flex items-center mt-1">
                <Building className="w-4 h-4 mr-1" />
                {adminStats.totalOrganizations} orgs
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-3xl font-bold text-gray-900">{adminStats.uptime}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                Operational
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Server className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{action.stats}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Admin Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Admin Activity</h3>
              <Link to="/dashboard/admin/analytics" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View all
              </Link>
            </div>
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'user' ? 'bg-blue-100' :
                      activity.type === 'system' ? 'bg-orange-100' :
                      activity.type === 'security' ? 'bg-red-100' :
                      activity.type === 'data' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'user' && <Users className="w-4 h-4 text-blue-600" />}
                      {activity.type === 'system' && <Settings className="w-4 h-4 text-orange-600" />}
                      {activity.type === 'security' && <Shield className="w-4 h-4 text-red-600" />}
                      {activity.type === 'data' && <Database className="w-4 h-4 text-green-600" />}
                      {activity.type === 'performance' && <Activity className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.details}</p>
                      <p className="text-xs text-gray-400 mt-1">{adminApiService.formatActivityTime(activity.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {systemLoading ? (
            <div className="col-span-3 flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            components.map((component) => (
              <div key={component.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    component.status === 'healthy' ? 'bg-green-100' :
                    component.status === 'warning' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    {component.name === 'Database' && <Database className={`w-5 h-5 ${
                      component.status === 'healthy' ? 'text-green-600' :
                      component.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />}
                    {component.name === 'API Server' && <Server className={`w-5 h-5 ${
                      component.status === 'healthy' ? 'text-green-600' :
                      component.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />}
                    {component.name === 'Cache' && <Cpu className={`w-5 h-5 ${
                      component.status === 'healthy' ? 'text-green-600' :
                      component.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />}
                    {!['Database', 'API Server', 'Cache'].includes(component.name) && <Globe className={`w-5 h-5 ${
                      component.status === 'healthy' ? 'text-green-600' :
                      component.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{component.name}</p>
                    <p className="text-sm text-gray-500">{component.metric}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  component.status === 'healthy' ? 'bg-green-100 text-green-800' :
                  component.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {component.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Platform Overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-4 bg-blue-100 rounded-lg inline-block mb-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">User Management</h4>
            <p className="text-sm text-gray-600 mb-3">Manage user accounts, roles, and permissions across the platform.</p>
            <Link to="/dashboard/admin/users" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Manage Users →
            </Link>
          </div>

          <div className="text-center">
            <div className="p-4 bg-green-100 rounded-lg inline-block mb-3">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Analytics & Reports</h4>
            <p className="text-sm text-gray-600 mb-3">View detailed analytics, generate reports, and monitor platform performance.</p>
            <Link to="/dashboard/admin/analytics" className="text-green-600 hover:text-green-700 text-sm font-medium">
              View Analytics →
            </Link>
          </div>

          <div className="text-center">
            <div className="p-4 bg-orange-100 rounded-lg inline-block mb-3">
              <Settings className="w-8 h-8 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">System Configuration</h4>
            <p className="text-sm text-gray-600 mb-3">Configure platform settings, integrations, and system preferences.</p>
            <Link to="/dashboard/admin/system-settings" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              System Settings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
