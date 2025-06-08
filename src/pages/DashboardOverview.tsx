import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Users, Briefcase, Shield, BarChart3, 
  TrendingUp, Clock, UserPlus, Target, Send,
  Building, FileText, ChevronRight
} from 'lucide-react';

const DashboardOverview: React.FC = () => {
  // Mock data - replace with real data from your API
  const stats = {
    totalCandidates: 1247,
    activeJobs: 23,
    pendingInterviews: 8,
    thisMonthPlacements: 12,
    totalProjects: 15,
    activeSequences: 6,
    organizations: 8,
    candidatesThisWeek: 156
  };

  const recentActivity = [
    { id: 1, action: 'New candidate added', details: 'John Doe - Software Engineer', time: '2 hours ago', type: 'candidate' },
    { id: 2, action: 'Job posted', details: 'Senior React Developer at TechCorp', time: '4 hours ago', type: 'job' },
    { id: 3, action: 'Interview scheduled', details: 'Jane Smith - Product Manager', time: '6 hours ago', type: 'interview' },
    { id: 4, action: 'Sequence completed', details: 'Backend Engineers outreach campaign', time: '1 day ago', type: 'sequence' },
    { id: 5, action: 'Resume processed', details: '12 new resumes analyzed', time: '1 day ago', type: 'resume' },
  ];

  const quickActions = [
    { title: 'Search Talents', description: 'Find the perfect candidates', icon: Search, link: '/dashboard/search', color: 'purple' },
    { title: 'Create Job', description: 'Post a new position', icon: UserPlus, link: '/dashboard/jobs/create', color: 'blue' },
    { title: 'Start Sequence', description: 'Launch outreach campaign', icon: Send, link: '/dashboard/sequences', color: 'green' },
    { title: 'View Analytics', description: 'Check performance metrics', icon: BarChart3, link: '/dashboard/admin/analytics', color: 'orange' },
  ];

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
              <Link to="/dashboard/admin/analytics" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View all
              </Link>
            </div>
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
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-4 bg-purple-100 rounded-lg inline-block mb-3">
              <Search className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Talent Sourcing</h4>
            <p className="text-sm text-gray-600 mb-3">Search, shortlist, and manage candidates across multiple projects and sequences.</p>
            <Link to="/dashboard/search" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              Start Sourcing →
            </Link>
          </div>

          <div className="text-center">
            <div className="p-4 bg-blue-100 rounded-lg inline-block mb-3">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Job Management</h4>
            <p className="text-sm text-gray-600 mb-3">Create jobs, manage organizations, and track candidates through your ATS pipeline.</p>
            <Link to="/dashboard/jobs/all" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Jobs →
            </Link>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
