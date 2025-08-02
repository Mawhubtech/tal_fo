import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Users, Briefcase, Shield, BarChart3, 
  TrendingUp, Clock, UserPlus, Target, Send,
  Building, FileText, ChevronRight, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import { usePermissionCheck, SIDEBAR_PERMISSIONS } from '../hooks/usePermissionCheck';
import { useQuery } from '@tanstack/react-query';
import { dashboardApiService } from '../services/dashboardApiService';
import PendingInvitations from '../components/company/PendingInvitations';

const DashboardOverview: React.FC = () => {
  const { hasPermission, hasAnyPermission } = usePermissionCheck();
  
  // Fetch dashboard metrics
  const { 
    data: dashboardMetrics, 
    isLoading: metricsLoading, 
    error: metricsError, 
    refetch: refetchMetrics 
  } = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => dashboardApiService.getDashboardMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Fetch recent activity
  const { 
    data: recentActivityData, 
    isLoading: activityLoading 
  } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => dashboardApiService.getRecentActivity(5),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });

  // Use real data or fallback to defaults
  const stats = dashboardMetrics || {
    totalCandidates: 0,
    activeJobs: 0,
    pendingInterviews: 0,
    thisMonthPlacements: 0,
    totalProjects: 0,
    activeSequences: 0,
    organizations: 0,
    candidatesThisWeek: 0
  };

  const recentActivity = recentActivityData || [];

  // Handle loading state
  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (metricsError) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-4">There was an error loading the dashboard overview.</p>
          <button
            onClick={() => refetchMetrics()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Dynamic quick actions based on permissions
  const getQuickActions = () => {
    const actions = [];
    
    if (hasPermission(SIDEBAR_PERMISSIONS.SOURCING_ACCESS)) {
      actions.push({
        title: 'Sourcing Projects',
        description: 'Access your sourcing projects',
        icon: Search,
        link: '/dashboard/sourcing/projects',
        color: 'purple'
      });
    }
    
    if (hasAnyPermission([SIDEBAR_PERMISSIONS.JOBS_ACCESS, SIDEBAR_PERMISSIONS.ORGANIZATIONS_ACCESS])) {
      actions.push({
        title: 'View Jobs',
        description: 'Manage job positions',
        icon: Briefcase,
        link: '/dashboard/organizations',
        color: 'blue'
      });
    }
    
    if (hasPermission(SIDEBAR_PERMISSIONS.SOURCING_ACCESS)) {
      actions.push({
        title: 'Start Sequence',
        description: 'Launch outreach campaign',
        icon: Send,
        link: '/dashboard/sequences',
        color: 'green'
      });
    }
    
    if (hasPermission(SIDEBAR_PERMISSIONS.ADMIN_ACCESS)) {
      actions.push({
        title: 'View Analytics',
        description: 'Check performance metrics',
        icon: BarChart3,
        link: '/dashboard/admin/analytics',
        color: 'orange'
      });
    }
    
    if (hasPermission(SIDEBAR_PERMISSIONS.CANDIDATES_ACCESS)) {
      actions.push({
        title: 'Manage Candidates',
        description: 'View and manage candidates',
        icon: UserPlus,
        link: '/dashboard/candidates',
        color: 'emerald'
      });
    }
    
    return actions.slice(0, 4); // Limit to 4 actions for UI consistency
  };

  const quickActions = getQuickActions();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your talent acquisition.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Pending Invitations */}
      <PendingInvitations />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Candidates</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCandidates.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats.candidatesThisWeek} this week
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeJobs}</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <Building className="w-4 h-4 mr-1" />
                {stats.organizations} organizations
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Interviews</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingInterviews}</p>
              <p className="text-sm text-orange-600 flex items-center mt-1">
                <Clock className="w-4 h-4 mr-1" />
                Next: Today 2:00 PM
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
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-3xl font-bold text-gray-900">{stats.thisMonthPlacements}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                Successful placements
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
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
                  <div className={`p-2 rounded-lg bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                    <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_ACCESS) && (
                <Link to="/dashboard/admin/analytics" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View all
                </Link>
              )}
            </div>
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'candidate' ? 'bg-purple-100' :
                      activity.type === 'job' ? 'bg-blue-100' :
                      activity.type === 'interview' ? 'bg-orange-100' :
                      activity.type === 'sequence' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'candidate' && <Users className="w-4 h-4 text-purple-600" />}
                      {activity.type === 'job' && <Briefcase className="w-4 h-4 text-blue-600" />}
                      {activity.type === 'interview' && <Target className="w-4 h-4 text-orange-600" />}
                      {activity.type === 'sequence' && <Send className="w-4 h-4 text-green-600" />}
                      {activity.type === 'resume' && <FileText className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.details}</p>
                      <p className="text-xs text-gray-400 mt-1">{dashboardApiService.formatActivityTime(activity.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hasPermission(SIDEBAR_PERMISSIONS.SOURCING_ACCESS) && (
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-lg inline-block mb-3">
                <Search className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Talent Sourcing</h4>
              <p className="text-sm text-gray-600 mb-3">Search, shortlist, and manage candidates across multiple projects and sequences.</p>
              <Link to="/dashboard/sourcing/projects" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Start Sourcing →
              </Link>
            </div>
          )}

          {hasAnyPermission([SIDEBAR_PERMISSIONS.JOBS_ACCESS, SIDEBAR_PERMISSIONS.ORGANIZATIONS_ACCESS]) && (
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-lg inline-block mb-3">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Job Management</h4>
              <p className="text-sm text-gray-600 mb-3">Create jobs, manage organizations, and track candidates through your ATS pipeline.</p>
              <Link to="/dashboard/organizations" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View Jobs →
              </Link>
            </div>
          )}

          {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_ACCESS) && (
            <div className="text-center">
              <div className="p-4 bg-orange-100 rounded-lg inline-block mb-3">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Admin & Analytics</h4>
              <p className="text-sm text-gray-600 mb-3">Manage users, process resumes, and track performance with detailed analytics.</p>
              <Link to="/dashboard/admin" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                Admin Panel →
              </Link>
            </div>
          )}

          {/* Show additional sections for users without admin access */}
          {!hasPermission(SIDEBAR_PERMISSIONS.ADMIN_ACCESS) && hasPermission(SIDEBAR_PERMISSIONS.CANDIDATES_ACCESS) && (
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-lg inline-block mb-3">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Candidate Management</h4>
              <p className="text-sm text-gray-600 mb-3">View, manage, and track your candidate pipeline and interactions.</p>
              <Link to="/dashboard/candidates" className="text-green-600 hover:text-green-700 text-sm font-medium">
                View Candidates →
              </Link>
            </div>
          )}

          {!hasPermission(SIDEBAR_PERMISSIONS.ADMIN_ACCESS) && hasPermission(SIDEBAR_PERMISSIONS.CLIENTS_ACCESS) && (
            <div className="text-center">
              <div className="p-4 bg-indigo-100 rounded-lg inline-block mb-3">
                <Building className="w-8 h-8 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Client Management</h4>
              <p className="text-sm text-gray-600 mb-3">Manage client relationships, organizations, and collaboration.</p>
              <Link to="/dashboard/clients" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                View Clients →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
