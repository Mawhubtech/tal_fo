import React from 'react';
import { 
  FileText, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Building,
  MapPin,
  XCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Award,
  Bookmark
} from 'lucide-react';
import { useJobApplications, useProfileStrength } from '../../../../hooks/useJobSeekerProfile';

type ApplicationStatus = 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted';

interface Stats {
  total: number;
  pending: number;
  interviews: number;
  responses: number;
}

interface OverviewTabProps {
  user: any;
  stats: Stats;
  setActiveTab: (tab: 'overview' | 'applications' | 'alljobs' | 'saved' | 'profile' | 'settings') => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ user, stats, setActiveTab }) => {
  const { data: applications } = useJobApplications();
  const { data: profileStrength, isLoading: profileStrengthLoading } = useProfileStrength();
  
  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'interview':
        return <Calendar className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName || 'Job Seeker'}!</h1>
        <p className="text-gray-600">Here's your job search activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Interviews</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.interviews}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Responses</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.responses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Search Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Success Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            Application Success Rate
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Applications Sent</span>
              <span className="font-semibold">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Responses Received</span>
              <span className="font-semibold">{stats.responses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Interview Invitations</span>
              <span className="font-semibold">{stats.interviews}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">Success Rate</span>
                <span className="text-lg font-bold text-green-600">
                  {stats.total > 0 ? Math.round((stats.responses / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 text-blue-600 mr-2" />
            Profile Strength
          </h2>
          {profileStrengthLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          ) : profileStrength ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Overall Completeness</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        profileStrength.strengthLevel === 'Excellent' ? 'bg-green-600' :
                        profileStrength.strengthLevel === 'Good' ? 'bg-blue-600' :
                        profileStrength.strengthLevel === 'Fair' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`} 
                      style={{ width: `${profileStrength.overallCompleteness}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{profileStrength.overallCompleteness}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Profile Level:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  profileStrength.strengthLevel === 'Excellent' ? 'bg-green-100 text-green-800' :
                  profileStrength.strengthLevel === 'Good' ? 'bg-blue-100 text-blue-800' :
                  profileStrength.strengthLevel === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {profileStrength.strengthLevel}
                </span>
              </div>
              <div className="space-y-2">
                {profileStrength.breakdown.completed.slice(0, 2).map((item: string, index: number) => (
                  <div key={index} className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
                {profileStrength.breakdown.missing.slice(0, 3).map((item: string, index: number) => (
                  <div key={index} className="flex items-center text-sm">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-gray-600">Missing: {item}</span>
                  </div>
                ))}
              </div>
              {profileStrength.breakdown.missing.length > 0 && (
                <div className="pt-2 border-t">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Complete Profile →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Profile Completeness</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-sm font-medium">--</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">Unable to load profile strength data</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h2>
        <div className="space-y-4">
          {applications && applications.length > 0 ? (
            applications.slice(0, 3).map((application) => {
              // Handle both application objects and applications with nested job data
              const job = application.job || application;
              const applicationStatus = (application.status || 'pending') as ApplicationStatus;
              
              return (
                <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {job.title || application.jobTitle}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span className="text-sm">{application.company || 'Company'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">{job.location || application.location || 'Location'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Applied {formatDate(application.appliedDate || application.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(applicationStatus)}`}>
                      {getStatusIcon(applicationStatus)}
                      <span className="ml-1 capitalize">{applicationStatus}</span>
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No applications yet</p>
              <p className="text-sm">Start applying to jobs to see them here</p>
            </div>
          )}
        </div>
        {applications && applications.length > 3 && (
          <div className="mt-4 text-center">
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              View all applications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
