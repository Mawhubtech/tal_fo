import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Building, Globe, Mail, Phone, MapPin, Users, Briefcase,
  Calendar, TrendingUp, Edit3, Settings,
  Clock, ExternalLink, Activity, Target, CheckCircle, XCircle,
  Plus, Search, Star
} from 'lucide-react';
import { ClientService } from './data/clientService';
import type { Client } from './data/clientService';

// Utility function to generate consistent colors based on string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Predefined vibrant colors for better visual appeal
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA5A5', '#A178DF',
    '#75C9B7', '#FFD166', '#118AB2', '#06D6A0', '#EF476F',
    '#FFC43D', '#E76F51', '#1B9AAA', '#6A0572', '#AB83A1'
  ];
  
  // Use a consistent color from our palette based on the hash
  return colors[Math.abs(hash) % colors.length];
};

// Function to get client initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const ClientDetailPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'departments' | 'activity' | 'contracts'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const clientService = new ClientService();

  // Load client data
  useEffect(() => {
    const loadClient = async () => {
      if (!clientId) {
        setError('Missing client ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const clientData = await clientService.getClientById(clientId);
        
        if (!clientData) {
          setError('Client not found');
          return;
        }

        setClient(clientData);
        setError(null);
      } catch (err) {
        console.error('Error loading client:', err);
        setError('Failed to load client data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [clientId]);

  // Helper functions
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-gray-600" />;
      case 'suspended':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'departments', label: 'Departments', icon: Users },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'contracts', label: 'Contracts', icon: Target }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading client details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !client) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-4 shadow-sm"
            style={{ 
              backgroundColor: '#A3A3A3',
              backgroundImage: 'linear-gradient(135deg, #A3A3A3AA, #A3A3A3)',
            }}
          >
            <XCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'Client not found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {error || "The client you're looking for doesn't exist."}
          </p>
          <Link 
            to="/dashboard/clients" 
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span className="mx-2">/</span>
        <Link to="/dashboard/clients" className="hover:text-gray-700">Clients</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{client.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            to="/dashboard/clients"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>          <div className="flex items-center">
            <div 
              className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl mr-4 shadow-sm"
              style={{ 
                backgroundColor: stringToColor(client.name),
                backgroundImage: `linear-gradient(135deg, ${stringToColor(client.name)}aa, ${stringToColor(client.name)})`,
              }}
            >
              {getInitials(client.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-gray-600 mt-1">{client.industry} • {client.location}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(client.status)}`}>
            {getStatusIcon(client.status)}
            <span className="ml-1 capitalize">{client.status}</span>
          </span>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Client
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Client Info Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        {client.description && (
          <p className="text-gray-700 mb-4">{client.description}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Website</p>
              <a href={client.website} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:text-blue-800 flex items-center">
                {client.website.replace('https://', '')}
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <a href={`mailto:${client.email}`} className="text-gray-900 hover:text-purple-600">
                {client.email}
              </a>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <Phone className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <a href={`tel:${client.phone}`} className="text-gray-900 hover:text-purple-600">
                {client.phone}
              </a>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-gray-900">{client.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Company Size</p>
              <p className="text-2xl font-bold text-gray-900">{client.size}</p>
              <p className="text-sm text-gray-500">{client.employees.toLocaleString()} employees</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Jobs</p>
              <p className="text-2xl font-bold text-green-600">{client.openJobs}</p>
              <p className="text-sm text-gray-500">Active positions</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hires</p>
              <p className="text-2xl font-bold text-purple-600">{client.totalHires}</p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                All time
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Member Since</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(client.createdDate)}</p>
              <p className="text-sm text-gray-500">Client start date</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Activity</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(client.lastActivity)}</p>
              <p className="text-sm text-gray-500">Recent engagement</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <Activity className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Industry:</span>
                      <span className="font-medium">{client.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Company Size:</span>
                      <span className="font-medium">{client.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Employees:</span>
                      <span className="font-medium">{client.employees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Location:</span>
                      <span className="font-medium">{client.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(client.status)}`}>
                        {getStatusIcon(client.status)}
                        <span className="ml-1 capitalize">{client.status}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <Briefcase className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">New job posted</p>
                          <p className="text-xs text-gray-500">Senior Developer position</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">2 days ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">New hire completed</p>
                          <p className="text-xs text-gray-500">Marketing Manager role</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">1 week ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          <Activity className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Profile updated</p>
                          <p className="text-xs text-gray-500">Contact information</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">2 weeks ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded border text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">85%</div>
                    <p className="text-sm text-gray-600">Hire Success Rate</p>
                    <p className="text-xs text-green-600 mt-1">↑ 5% from last month</p>
                  </div>
                  <div className="bg-white p-4 rounded border text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">12</div>
                    <p className="text-sm text-gray-600">Avg. Days to Hire</p>
                    <p className="text-xs text-blue-600 mt-1">↓ 2 days improved</p>
                  </div>
                  <div className="bg-white p-4 rounded border text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">4.8</div>
                    <p className="text-sm text-gray-600">Client Satisfaction</p>
                    <div className="flex justify-center mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3 h-3 ${star <= 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Open Positions</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Job
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((job) => (
                  <div key={job} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-medium text-gray-900">Senior Software Developer</h4>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Active
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="mr-4">Remote</span>
                          <Clock className="w-4 h-4 mr-1" />
                          <span className="mr-4">Full-time</span>
                          <Users className="w-4 h-4 mr-1" />
                          <span>24 applicants</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Posted: {formatDate('2024-06-01')} • Deadline: {formatDate('2024-07-01')}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            $120,000 - $150,000
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Engineering', 'Marketing', 'Sales', 'HR'].map((dept) => (
                  <div key={dept} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{dept}</h4>
                          <p className="text-sm text-gray-500">Department Head: John Doe</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Open Positions: <span className="font-medium text-gray-900">3</span></span>
                      <span className="text-gray-500">Employees: <span className="font-medium text-gray-900">45</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Job application received</p>
                      <p className="text-sm text-gray-600">New candidate applied for Senior Developer position</p>
                      <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contracts & Agreements</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Master Service Agreement</h4>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Start Date: {formatDate('2023-01-15')}</p>
                    <p>End Date: {formatDate('2024-12-31')}</p>
                    <p>Terms: Standard recruitment services</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailPage;
