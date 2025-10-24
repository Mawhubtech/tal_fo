import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Users, Briefcase, Shield, BarChart3, 
  TrendingUp, Clock, UserPlus, Target, Send,
  Building, FileText, ChevronRight, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import { usePermissionCheck, SIDEBAR_PERMISSIONS } from '../hooks/usePermissionCheck';
import { useQuery } from '@tanstack/react-query';
import { dashboardApiService } from '../services/dashboardApiService';
import { PendingInvitations } from '../components/calendar/PendingEventInvitations';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import TodoListWidget from '../components/dashboard/TodoListWidget';
import ChatbotWidget from '../components/dashboard/ChatbotWidget';
import CreateTaskModal from '../components/CreateTaskModal';
import { toast } from '../components/ToastContainer';
import { useAuthContext } from '../contexts/AuthContext';

const DashboardOverview: React.FC = () => {
  const { hasPermission, hasAnyPermission } = usePermissionCheck();
  const { user } = useAuthContext();
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  
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

  // Fetch recent activity (currently using mock data until backend endpoint is implemented)
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

  // Fetch upcoming calendar events
  const { 
    data: upcomingEventsData, 
    isLoading: eventsLoading 
  } = useQuery({
    queryKey: ['dashboard', 'upcoming-events'],
    queryFn: () => dashboardApiService.getUpcomingEvents(5),
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
  const upcomingEvents = upcomingEventsData || [];

  // Dynamic quick actions based on permissions
  const getQuickActions = () => {
    const actions = [];
    
    if (hasPermission(SIDEBAR_PERMISSIONS.SOURCING_ACCESS)) {
      actions.push({
        title: 'Sourcing Projects',
        description: 'Access your sourcing projects',
        icon: Search,
        link: '/sourcing/projects',
        color: 'purple'
      });
    }
    
    if (hasAnyPermission([SIDEBAR_PERMISSIONS.JOBS_ACCESS, SIDEBAR_PERMISSIONS.ORGANIZATIONS_ACCESS])) {
      actions.push({
        title: 'View Jobs',
        description: 'Manage job positions',
        icon: Briefcase,
        link: '/organizations',
        color: 'blue'
      });
    }
    
    if (hasPermission(SIDEBAR_PERMISSIONS.SOURCING_ACCESS)) {
      actions.push({
        title: 'Start Sequence',
        description: 'Launch outreach campaign',
        icon: Send,
        link: '/sequences',
        color: 'green'
      });
    }
    
    if (hasPermission(SIDEBAR_PERMISSIONS.ADMIN_ACCESS)) {
      actions.push({
        title: 'View Analytics',
        description: 'Check performance metrics',
        icon: BarChart3,
        link: '/admin/analytics',
        color: 'orange'
      });
    }
    
    if (hasPermission(SIDEBAR_PERMISSIONS.CANDIDATES_ACCESS)) {
      actions.push({
        title: 'Manage Candidates',
        description: 'View and manage candidates',
        icon: UserPlus,
        link: '/candidates',
        color: 'emerald'
      });
    }
    
    return actions.slice(0, 4); // Limit to 4 actions for UI consistency
  };

  const quickActions = getQuickActions();

  const handleAddTaskClick = () => {
    setShowCreateTaskModal(true);
  };

  const handleTaskCreated = () => {
    setShowCreateTaskModal(false);
    toast.success('Task created successfully!');
    // Optionally refetch dashboard data here
  };

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

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">Dashboard</h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base line-clamp-2">
              Welcome{user?.firstName ? `, ${user.firstName}` : ''}! Here's what's happening with your talent acquisition.
            </p>
          </div>
          <div className="text-right ml-2 flex-shrink-0">
            <p className="text-xs sm:text-sm text-gray-500">Last updated</p>
            <p className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {/* Total Candidates Card - Only show if user has candidates access */}
        {hasPermission(SIDEBAR_PERMISSIONS.CANDIDATES_ACCESS) && (
          <Link 
            to="/candidates" 
            className="bg-white p-2.5 sm:p-3 md:p-4 lg:p-6 rounded-lg md:rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer active:scale-98"
          >
            <div className="flex flex-col items-start">
              <div className="w-full flex justify-between items-start mb-2 sm:mb-3">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 line-clamp-1">Total Candidates</p>
                <div className="p-1 sm:p-1.5 md:p-2 lg:p-3 bg-purple-100 rounded-md sm:rounded-lg flex-shrink-0 ml-1">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{stats.totalCandidates.toLocaleString()}</p>
            </div>
          </Link>
        )}

        <Link 
          to="/my-jobs" 
          className="bg-white p-2.5 sm:p-3 md:p-4 lg:p-6 rounded-lg md:rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer active:scale-98"
        >
          <div className="flex flex-col items-start">
            <div className="w-full flex justify-between items-start mb-2 sm:mb-3">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 line-clamp-1">Active Jobs</p>
              <div className="p-1 sm:p-1.5 md:p-2 lg:p-3 bg-blue-100 rounded-md sm:rounded-lg flex-shrink-0 ml-1">
                <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{stats.activeJobs}</p>
          </div>
        </Link>

        <div className="bg-white p-2.5 sm:p-3 md:p-4 lg:p-6 rounded-lg md:rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col items-start">
            <div className="w-full flex justify-between items-start mb-2 sm:mb-3">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 line-clamp-1">Pending Interviews</p>
              <div className="p-1 sm:p-1.5 md:p-2 lg:p-3 bg-orange-100 rounded-md sm:rounded-lg flex-shrink-0 ml-1">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{stats.pendingInterviews}</p>
          </div>
        </div>

        <div className="bg-white p-2.5 sm:p-3 md:p-4 lg:p-6 rounded-lg md:rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col items-start">
            <div className="w-full flex justify-between items-start mb-2 sm:mb-3">
              <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 line-clamp-1">This Month</p>
              <div className="p-1 sm:p-1.5 md:p-2 lg:p-3 bg-green-100 rounded-md sm:rounded-lg flex-shrink-0 ml-1">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{stats.thisMonthPlacements}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Calendar & Upcoming Events */}
        <CalendarWidget 
          className="lg:col-span-1" 
          events={upcomingEvents}
        />

        {/* To-Do List */}
        <TodoListWidget 
          className="lg:col-span-1" 
          onAddTaskClick={handleAddTaskClick}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Pending Event Invitations */}
        <PendingInvitations className="lg:col-span-1" />

        {/* Recent Activity - To-Do List Style */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 md:p-6 h-full">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h3>
              {/* {hasPermission(SIDEBAR_PERMISSIONS.ADMIN_ACCESS) && (
                <Link to="/admin/analytics" className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium flex-shrink-0">
                  View all
                </Link>
              )} */}
            </div>
              {activityLoading ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100">
                      <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 mr-2 sm:mr-3 ${
                        activity.type === 'candidate' ? 'bg-purple-100' :
                        activity.type === 'job' ? 'bg-blue-100' :
                        activity.type === 'interview' ? 'bg-orange-100' :
                        activity.type === 'sequence' ? 'bg-green-100' :
                        'bg-gray-100'
                      }`}>
                        {activity.type === 'candidate' && <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />}
                        {activity.type === 'job' && <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />}
                        {activity.type === 'interview' && <Target className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />}
                        {activity.type === 'sequence' && <Send className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />}
                        {activity.type === 'resume' && <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{activity.details}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{dashboardApiService.formatActivityTime(activity.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300 mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">No recent activities</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 px-4">Activity will appear here as you use the platform</p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
};

export default DashboardOverview;
