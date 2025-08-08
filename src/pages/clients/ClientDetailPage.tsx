import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Building, Globe, Mail, Phone, MapPin, Users, Briefcase,
  Calendar, TrendingUp, Edit3, Settings, Trash2, MoreVertical,
  Clock, ExternalLink, Activity, Target, CheckCircle, XCircle, Building2
} from 'lucide-react';
import { clientApi } from '../../services/api';
import { useAuthContext } from '../../contexts/AuthContext';
import { isInternalUser } from '../../utils/userUtils';
import type { Client } from './data/clientService';
import ClientForm from './components/ClientForm';
import DeleteClientDialog from './components/DeleteClientDialog';
import DepartmentForm from './components/DepartmentForm';
import DeleteDepartmentDialog from './components/DeleteDepartmentDialog';
import { DepartmentApiService } from '../../recruitment/organizations/services/departmentApiService';
import type { Department } from '../../recruitment/organizations/services/departmentApiService';
import { 
  OrganizationChart, 
  OrganizationChartDemo, 
  PositionForm, 
  DeletePositionDialog,
  demoOrganizationData, 
  demoDepartments, 
  getDepartmentStats 
} from '../../components/organization-chart';
import { useOrganizationChart, useCreatePosition, useUpdatePosition, useDeletePosition } from '../../hooks/usePositions';
import type { Position } from '../../services/positionApiService';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuthContext();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'contracts' | 'departments' | 'organization'>('overview');
  
  // Check if current user is internal (should not see edit/delete buttons)
  const isInternalUserRole = isInternalUser(currentUser);
  
  // Form and dialog states
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Department states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [showDeleteDepartmentDialog, setShowDeleteDepartmentDialog] = useState(false);
  const [deleteDepartmentLoading, setDeleteDepartmentLoading] = useState(false);
  
  // Organization chart states
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [parentPosition, setParentPosition] = useState<Position | null>(null);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
  const [showDeletePositionDialog, setShowDeletePositionDialog] = useState(false);
  const [deletePositionLoading, setDeletePositionLoading] = useState(false);
  const [organizationDepartmentFilter, setOrganizationDepartmentFilter] = useState<string>('');
  
  const departmentApiService = new DepartmentApiService();
  
  // Position hooks
  const { data: organizationPositions = [], isLoading: positionsLoading, refetch: refetchPositions, error: positionsError } = useOrganizationChart(
    clientId || '', 
    organizationDepartmentFilter || undefined
  );
  
  // Use demo data if API is not available or returns empty
  const finalOrganizationPositions = organizationPositions.length > 0 || !positionsError 
    ? organizationPositions 
    : demoOrganizationData.filter(pos => 
        !organizationDepartmentFilter || pos.departmentId === organizationDepartmentFilter
      );
  
  const createPositionMutation = useCreatePosition();
  const updatePositionMutation = useUpdatePosition();
  const deletePositionMutation = useDeletePosition();
  
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
        const clientData = await clientApi.getById(clientId);
        setClient(clientData);
        setError(null);
      } catch (err: any) {
        console.error('Error loading client:', err);
        setError(err.response?.data?.message || 'Failed to load client data. Please try again.');
      } finally {
        setLoading(false);
      }
    };    loadClient();
  }, [clientId]);

  // Load departments for this client
  useEffect(() => {
    const loadDepartments = async () => {
      if (!clientId) return;

      try {
        setDepartmentsLoading(true);
        const departmentsData = await departmentApiService.getDepartmentsByClient(clientId);
        setDepartments(departmentsData);
      } catch (err: any) {
        console.error('Error loading departments:', err);
        // Don't show error for departments as it's not critical for the page
      } finally {
        setDepartmentsLoading(false);
      }
    };

    if (client) {
      loadDepartments();
    }
  }, [clientId, client]);

  // Handle tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'activity', 'contracts', 'departments', 'organization'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  // Handle delete client
  const handleDeleteClient = async () => {
    if (!client) return;

    try {
      setDeleteLoading(true);
      await clientApi.delete(client.id);
      // Navigate back to clients list after successful deletion
      navigate('/dashboard/clients');
    } catch (err: any) {
      console.error('Error deleting client:', err);
      // Note: In a real app, you might want to show an error toast here
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };
  
  // Handle create department
  const handleCreateDepartment = (newDepartment: Department) => {
    setDepartments(prev => [...prev, newDepartment]);
    setShowDepartmentForm(false);
  };

  // Handle edit department
  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setShowDepartmentForm(true);
  };

  // Handle update department
  const handleUpdateDepartment = (updatedDepartment: Department) => {
    setDepartments(prev => prev.map(dept => 
      dept.id === updatedDepartment.id ? updatedDepartment : dept
    ));
    setShowDepartmentForm(false);
    setEditingDepartment(null);
  };

  // Handle delete department
  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;

    try {
      setDeleteDepartmentLoading(true);
      await departmentApiService.deleteDepartment(departmentToDelete.id);
      setDepartments(prev => prev.filter(dept => dept.id !== departmentToDelete.id));
      setShowDeleteDepartmentDialog(false);
      setDepartmentToDelete(null);
    } catch (err: any) {
      console.error('Error deleting department:', err);
      setError(err.response?.data?.message || 'Failed to delete department. Please try again.');
      // TODO: Show error toast or keep dialog open with error message
    } finally {
      setDeleteDepartmentLoading(false);
    }
  };

  // Handle department form save (create or update)
  const handleDepartmentSave = (department: Department) => {
    if (editingDepartment) {
      handleUpdateDepartment(department);
    } else {
      handleCreateDepartment(department);
    }
  };

  // Handle department form close
  const handleDepartmentFormClose = () => {
    setShowDepartmentForm(false);
    setEditingDepartment(null);
  };

  // Handle add position
  const handleAddPosition = (parentId?: string) => {
    const parent = parentId ? finalOrganizationPositions.find(pos => pos.id === parentId) : null;
    setParentPosition(parent);
    setEditingPosition(null);
    setShowPositionForm(true);
  };

  // Handle edit position
  const handleEditPosition = (position: Position) => {
    setEditingPosition(position);
    setParentPosition(null);
    setShowPositionForm(true);
  };

  // Handle position form save
  const handlePositionSave = async (positionData: Omit<Position, 'id' | 'children' | 'isExpanded'>) => {
    try {
      if (editingPosition) {
        // Update existing position
        await updatePositionMutation.mutateAsync({
          id: editingPosition.id,
          data: positionData
        });
      } else {
        // Create new position
        await createPositionMutation.mutateAsync({
          ...positionData,
          clientId: clientId!
        });
      }
      
      // Close form and refresh data
      setShowPositionForm(false);
      setEditingPosition(null);
      setParentPosition(null);
      refetchPositions();
    } catch (error) {
      console.error('Error saving position:', error);
      // For demo purposes, just close the form
      setShowPositionForm(false);
      setEditingPosition(null);
      setParentPosition(null);
    }
  };

  // Handle position form close
  const handlePositionFormClose = () => {
    setShowPositionForm(false);
    setEditingPosition(null);
    setParentPosition(null);
  };

  // Handle delete position
  const handleDeletePosition = async () => {
    if (!positionToDelete) return;

    try {
      setDeletePositionLoading(true);
      await deletePositionMutation.mutateAsync(positionToDelete.id);
      setShowDeletePositionDialog(false);
      setPositionToDelete(null);
      refetchPositions();
    } catch (error) {
      console.error('Error deleting position:', error);
      // For demo purposes, just close the dialog
      setShowDeletePositionDialog(false);
      setPositionToDelete(null);
    } finally {
      setDeletePositionLoading(false);
    }
  };

  // Handle department filter change for organization chart
  const handleDepartmentFilterChange = (departmentId: string) => {
    setOrganizationDepartmentFilter(departmentId);
  };
  
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
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'contracts', label: 'Contracts', icon: Target },
    { id: 'departments', label: 'Departments', icon: Users },
    { id: 'organization', label: 'Organization Chart', icon: Building2 }
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
      {/* Breadcrumbs - Hidden for internal users */}
      {!isInternalUserRole && (
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link to="/dashboard/clients" className="hover:text-gray-700">Clients</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{client.name}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {!isInternalUserRole && (
            <Link 
              to="/dashboard/clients"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div className="flex items-center">
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
          <button 
            onClick={() => navigate(`/dashboard/organizations/${client.id}`)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            View Jobs
          </button>
          {!isInternalUserRole && (
            <>
              <button 
                onClick={() => setShowEditForm(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Client
              </button>
              <button 
                onClick={() => setShowDeleteDialog(true)}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Client Info Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        {client.description && (
          <p className="text-gray-700 mb-4">{client.description}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Website</p>
              <a href={client.website} target="_blank" rel="noopener noreferrer" 
                 className="text-purple-600 hover:text-purple-800 flex items-center">
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
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
        </div>        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Member Since</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(client.createdAt)}</p>
              <p className="text-sm text-gray-500">Client start date</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('departments')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              <p className="text-sm text-purple-600 hover:text-purple-700">View & manage →</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="w-5 h-5 text-purple-600" />
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
                </div>                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="text-center py-8">
                    <div className="p-3 bg-gray-200 rounded-lg inline-block mb-3">
                      <Activity className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No recent activity data available</p>
                    <p className="text-gray-400 text-xs mt-1">Activity tracking will appear here when implemented</p>
                  </div>
                </div>
              </div>              {/* Performance Metrics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="text-center py-8">
                  <div className="p-3 bg-gray-200 rounded-lg inline-block mb-3">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">Performance metrics not available</p>
                  <p className="text-gray-400 text-xs mt-1">Metrics will be calculated based on hire data when available</p>
                </div>
              </div></div>
          )}          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
              <div className="text-center py-8">
                <div className="p-3 bg-gray-200 rounded-lg inline-block mb-3">
                  <Activity className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No activity timeline available</p>
                <p className="text-gray-400 text-xs mt-1">Client activity will be tracked here when implemented</p>
              </div>
            </div>
          )}          {activeTab === 'contracts' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contracts & Agreements</h3>
              <div className="text-center py-8">
                <div className="p-3 bg-gray-200 rounded-lg inline-block mb-3">
                  <Target className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No contracts available</p>
                <p className="text-gray-400 text-xs mt-1">Contract information will appear here when implemented</p>
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Departments</h3>
                <button
                  onClick={() => setShowDepartmentForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Add Department
                </button>
              </div>

              {departmentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading departments...</p>
                </div>
              ) : departments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <div 
                      key={dept.id} 
                      className="bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 group relative cursor-pointer"
                      onClick={() => navigate(`/dashboard/organizations/${client.id}/departments/${dept.id}/jobs`)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl mr-3 shadow-sm"
                            style={{ backgroundColor: dept.color }}
                          >
                            {dept.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{dept.name}</h4>
                            <p className="text-sm text-gray-500">{dept.manager || 'No manager assigned'}</p>
                          </div>
                        </div>
                        
                        {/* Action buttons - Now always visible on mobile, hover on desktop */}
                        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDepartment(dept);
                            }}
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-150"
                            title="Edit department"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDepartmentToDelete(dept);
                              setShowDeleteDepartmentDialog(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150"
                            title="Delete department"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>                      {dept.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dept.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{dept.activeJobs || 0}</p>
                          <p className="text-xs text-gray-500">Active Jobs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{dept.totalEmployees}</p>
                          <p className="text-xs text-gray-500">Employees</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-3 bg-gray-200 rounded-lg inline-block mb-3">
                    <Building className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No departments found</p>
                  <p className="text-gray-400 text-xs mt-1">Create your first department to get started</p>
                  <button
                    onClick={() => setShowDepartmentForm(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Add Department
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'organization' && (
            <div>
              {/* Organization Chart Demo */}
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Interactive Organization Chart Demo
                    </h4>
                    <p className="text-sm text-blue-800">
                      This is a comprehensive demo showing the relationship between full organization charts and department-specific views for <strong>{client.name}</strong>. 
                      Use the controls below to explore different perspectives of the organizational structure.
                    </p>
                  </div>
                </div>
              </div>

              {/* Embedded Demo Component */}
              <div className="bg-white rounded-lg border shadow-sm">
                <OrganizationChartDemo />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Position Form Modal */}
      {showPositionForm && client && (
        <PositionForm
          isOpen={showPositionForm}
          onClose={handlePositionFormClose}
          onSave={handlePositionSave}
          position={editingPosition}
          parentPosition={parentPosition}
          clientId={client.id}
          clientName={client.name}
          departments={departments.length > 0 ? departments.map(dept => ({
            id: dept.id,
            name: dept.name,
            color: dept.color
          })) : demoDepartments}
          allPositions={finalOrganizationPositions}
          mode={editingPosition ? 'edit' : 'create'}
        />
      )}

      {/* Delete Position Dialog */}
      {showDeletePositionDialog && positionToDelete && (
        <DeletePositionDialog
          isOpen={showDeletePositionDialog}
          positionTitle={positionToDelete.title}
          employeeName={positionToDelete.employeeName}
          hasSubordinates={positionToDelete.children && positionToDelete.children.length > 0}
          subordinatesCount={positionToDelete.children?.length || 0}
          onConfirm={handleDeletePosition}
          onCancel={() => {
            setShowDeletePositionDialog(false);
            setPositionToDelete(null);
          }}
          loading={deletePositionLoading}
        />
      )}      {/* Edit Client Form Modal */}
      {showEditForm && client && (
        <ClientForm
          client={client}
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSave={(updatedClient) => {
            setClient(updatedClient);
            setShowEditForm(false);
          }}
          mode="edit"
        />
      )}

      {/* Delete Client Dialog */}
      {showDeleteDialog && client && (
        <DeleteClientDialog
          isOpen={showDeleteDialog}
          clientName={client.name}
          onConfirm={handleDeleteClient}
          onCancel={() => setShowDeleteDialog(false)}
          loading={deleteLoading}
        />
      )}

      {/* Department Form Modal */}
      {showDepartmentForm && client && (
        <DepartmentForm
          isOpen={showDepartmentForm}
          onClose={handleDepartmentFormClose}
          onSave={handleDepartmentSave}
          clientId={client.id}
          clientName={client.name}
          department={editingDepartment}
          mode={editingDepartment ? 'edit' : 'create'}
        />
      )}

      {/* Delete Department Dialog */}
      {showDeleteDepartmentDialog && departmentToDelete && (
        <DeleteDepartmentDialog
          isOpen={showDeleteDepartmentDialog}
          departmentName={departmentToDelete.name}
          onConfirm={handleDeleteDepartment}
          onCancel={() => {
            setShowDeleteDepartmentDialog(false);
            setDepartmentToDelete(null);
          }}
          loading={deleteDepartmentLoading}
        />
      )}
    </div>
  );
};

export default ClientDetailPage;
