import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  FileText, 
  Briefcase, 
  Bell, 
  Settings, 
  LogOut,
  Edit3,
  Upload,
  Search,
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogout } from '../../../hooks/useAuth';

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

interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedDate: Date;
}

const JobSeekerAdminPage: React.FC = () => {
  const { user } = useAuthContext();
  const logout = useLogout();
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'saved' | 'profile' | 'settings'>('overview');

  // Mock data - in real app, this would come from API
  const [applications] = useState<Application[]>([
    {
      id: '1',
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      appliedDate: new Date('2025-06-15'),
      status: 'reviewing',
      salary: '$120,000 - $160,000',
      type: 'Full-time'
    },
    {
      id: '2',
      jobTitle: 'Product Manager',
      company: 'StartupXYZ',
      location: 'Remote',
      appliedDate: new Date('2025-06-12'),
      status: 'interview',
      salary: '$100,000 - $140,000',
      type: 'Full-time'
    },
    {
      id: '3',
      jobTitle: 'UX Designer',
      company: 'Design Studios',
      location: 'New York, NY',
      appliedDate: new Date('2025-06-10'),
      status: 'rejected',
      salary: '$85,000 - $115,000',
      type: 'Full-time'
    }
  ]);

  const [savedJobs] = useState<SavedJob[]>([
    {
      id: '1',
      title: 'Backend Developer',
      company: 'CloudTech',
      location: 'Austin, TX',
      salary: '$90,000 - $120,000',
      type: 'Full-time',
      postedDate: new Date('2025-06-16')
    },
    {
      id: '2',
      title: 'Data Scientist',
      company: 'AI Innovations',
      location: 'Boston, MA',
      salary: '$110,000 - $150,000',
      type: 'Full-time',
      postedDate: new Date('2025-06-14')
    }
  ]);

  const handleLogout = () => {
    logout.mutate();
  };

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

  const getStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending' || app.status === 'reviewing').length;
    const interviews = applications.filter(app => app.status === 'interview').length;
    const responses = applications.filter(app => app.status === 'accepted' || app.status === 'rejected').length;
    
    return { total, pending, interviews, responses };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">            <div className="flex items-center space-x-6">
              
              <Link to="/jobs" className="text-2xl font-bold text-purple-600">
                TAL Jobs
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>              {/* User Profile Avatar */}
              <div className="relative">
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="hidden sm:block">{user?.firstName || 'Job Seeker'}</span>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  activeTab === 'overview'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Briefcase className="h-4 w-4 mr-3" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  activeTab === 'applications'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4 mr-3" />
                My Applications
                {stats.total > 0 && (
                  <span className="ml-auto bg-purple-600 text-white text-xs rounded-full px-2 py-1">
                    {stats.total}
                  </span>
                )}
              </button>              <Link
                to="/jobs"
                className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <Briefcase className="h-4 w-4 mr-3" />
                All Jobs
              </Link>
              <button
                onClick={() => setActiveTab('saved')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  activeTab === 'saved'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Search className="h-4 w-4 mr-3" />
                Saved Jobs
                {savedJobs.length > 0 && (
                  <span className="ml-auto bg-gray-500 text-white text-xs rounded-full px-2 py-1">
                    {savedJobs.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  activeTab === 'profile'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="h-4 w-4 mr-3" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  activeTab === 'settings'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
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
                          <p className="text-sm text-gray-600">{application.company} • {application.location}</p>
                          <p className="text-xs text-gray-500">Applied {formatDate(application.appliedDate)}</p>
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
                      <button
                        onClick={() => setActiveTab('applications')}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        View all applications
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
                  <p className="text-gray-600">Track your job applications and their status</p>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{application.jobTitle}</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                  {getStatusIcon(application.status)}
                                  <span className="ml-1 capitalize">{application.status}</span>
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <Building className="h-4 w-4" />
                                  <span>{application.company}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{application.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Briefcase className="h-4 w-4" />
                                  <span>{application.type}</span>
                                </div>
                                {application.salary && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span>{application.salary}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">Applied on {formatDate(application.appliedDate)}</p>
                            </div>
                            <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0">
                              <button className="w-full lg:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Jobs Tab */}
            {activeTab === 'saved' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
                  <p className="text-gray-600">Jobs you've saved for later</p>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <div className="space-y-4">
                      {savedJobs.map((job) => (
                        <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <Building className="h-4 w-4" />
                                  <span>{job.company}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Briefcase className="h-4 w-4" />
                                  <span>{job.type}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>{job.salary}</span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-500">Posted {formatDate(job.postedDate)}</p>
                            </div>
                            <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0 flex gap-2">
                              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                Apply Now
                              </button>
                              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                  <p className="text-gray-600">Manage your profile information</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={user?.firstName || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={user?.lastName || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        placeholder="Add your phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Update Profile
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume</h2>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload your resume</p>
                    <p className="text-sm text-gray-500">PDF, DOC, or DOCX (max 5MB)</p>
                    <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Choose File
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                  <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive job alerts and application updates</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600">
                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                        <p className="text-sm text-gray-500">Get text alerts for important updates</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Profile Visibility</h3>
                        <p className="text-sm text-gray-500">Allow recruiters to find your profile</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600">
                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
                  <div className="space-y-4">
                    <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-left">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerAdminPage;
