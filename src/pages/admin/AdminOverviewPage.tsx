import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Building, UserPlus, Target, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Clock, Activity, Database, 
  BarChart3, Settings, Globe, Shield, Server, Cpu
} from 'lucide-react';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  activeJobs: number;
  candidatesThisMonth: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  uptime: string;
  responseTime: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'company' | 'job' | 'system';
  message: string;
  timestamp: string;
  icon: React.ComponentType<any>;
  iconColor: string;
}

const AdminOverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 1247,
    activeUsers: 892,
    totalCompanies: 156,
    activeJobs: 89,
    candidatesThisMonth: 2340,
    systemHealth: 'excellent',
    uptime: '99.9%',
    responseTime: 145
  });

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'user',
      message: 'New admin user created: Sarah Johnson',
      timestamp: '2 minutes ago',
      icon: Users,
      iconColor: 'text-blue-600'
    },
    {
      id: '2',
      type: 'company',
      message: 'TechCorp increased job posting limit',
      timestamp: '15 minutes ago',
      icon: Building,
      iconColor: 'text-green-600'
    },
    {
      id: '3',
      type: 'system',
      message: 'Database backup completed successfully',
      timestamp: '1 hour ago',
      icon: Database,
      iconColor: 'text-purple-600'
    },
    {
      id: '4',
      type: 'job',
      message: 'Job board sync completed for LinkedIn',
      timestamp: '2 hours ago',
      icon: Target,
      iconColor: 'text-orange-600'
    }
  ]);

  const quickActionCards = [
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      link: '/dashboard/admin/user-management',
      icon: Users,
      color: 'bg-blue-500',
      stats: `${metrics.totalUsers} users`
    },
    {
      title: 'Company Management',
      description: 'Manage client companies and settings',
      link: '/dashboard/admin/company-management',
      icon: Building,
      color: 'bg-green-500',
      stats: `${metrics.totalCompanies} companies`
    },
    {
      title: 'Analytics & Reports',
      description: 'View platform performance metrics',
      link: '/dashboard/admin/analytics',
      icon: BarChart3,
      color: 'bg-purple-500',
      stats: 'View insights'
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

  const systemStatusItems = [
    {
      label: 'API Status',
      status: 'operational',
      value: '100%',
      icon: Server,
      description: 'All API endpoints responding normally'
    },
    {
      label: 'Database',
      status: 'operational',
      value: '2.1ms',
      icon: Database,
      description: 'Average query response time'
    },
    {
      label: 'Job Boards',
      status: 'operational',
      value: '8/8',
      icon: Globe,
      description: 'Active integrations running smoothly'
    },
    {
      label: 'Security',
      status: 'operational',
      value: 'Secure',
      icon: Shield,
      description: 'All security checks passed'
    }
  ];

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSystemHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return CheckCircle;
      case 'good': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health Banner */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${getSystemHealthColor(metrics.systemHealth)}`}>
              {React.createElement(getSystemHealthIcon(metrics.systemHealth), { className: "h-6 w-6" })}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
              <p className="text-sm text-gray-600">All systems operational • Uptime: {metrics.uptime}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{metrics.responseTime}ms</div>
            <div className="text-sm text-gray-500">Avg Response Time</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12% this month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Companies</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalCompanies}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8% this month
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Building className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.activeJobs}</p>
              <p className="text-sm text-red-600 flex items-center mt-1">
                <TrendingDown className="h-4 w-4 mr-1" />
                -3% this week
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Candidates</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.candidatesThisMonth.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +18% this month
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <UserPlus className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActionCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={index}
                    to={card.link}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 ${card.color} rounded-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{card.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{card.stats}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${activity.iconColor} bg-opacity-10`}>
                    <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <Link 
            to="/dashboard/admin/system-settings" 
            className="block text-sm text-purple-600 hover:text-purple-700 mt-4 text-center"
          >
            View all activity →
          </Link>
        </div>
      </div>

      {/* System Status Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemStatusItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{item.label}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
