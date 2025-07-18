import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Search, 
  Upload, 
  Edit3,
  Building,
  MapPin,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  appliedDate: Date;
  status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
  salary?: string;
  type: string;
}

interface Stats {
  total: number;
  pending: number;
  interviews: number;
  responses: number;
}

interface OverviewTabProps {
  user: any;
  applications: Application[];
  stats: Stats;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ user, applications, stats }) => {
  const getStatusColor = (status: Application['status']) => {
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

  const getStatusIcon = (status: Application['status']) => {
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/jobs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Search className="h-6 w-6 text-purple-600 mr-3" />
            <span className="font-medium">Browse Jobs</span>
          </Link>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="h-6 w-6 text-blue-600 mr-3" />
            <span className="font-medium">Update Resume</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Edit3 className="h-6 w-6 text-green-600 mr-3" />
            <span className="font-medium">Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h2>
        <div className="space-y-4">
          {applications.slice(0, 3).map((application) => (
            <div key={application.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{application.jobTitle}</h3>
                <div className="flex items-center gap-4 text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    <span className="text-sm">{application.company}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="text-sm">{application.location}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Applied {formatDate(application.appliedDate)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                  {getStatusIcon(application.status)}
                  <span className="ml-1 capitalize">{application.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
        {applications.length > 3 && (
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
