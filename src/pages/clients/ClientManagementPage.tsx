import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit3, Trash2, Users, MapPin, Globe, Phone, Mail, Calendar, Eye, Home, ChevronRight } from 'lucide-react';
import { ClientService, type Client } from './data/clientService';

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

const ClientManagementPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');

  const clientService = new ClientService();

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const clientData = await clientService.getAllClients();
        setClients(clientData);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || client.industry === industryFilter;
    const matchesSize = sizeFilter === 'all' || client.size.includes(sizeFilter);
    
    return matchesSearch && matchesStatus && matchesIndustry && matchesSize;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
    suspended: clients.filter(c => c.status === 'suspended').length,
    totalOpenJobs: clients.reduce((sum, c) => sum + c.openJobs, 0),
    totalHires: clients.reduce((sum, c) => sum + c.totalHires, 0)
  };
  const uniqueIndustries = [...new Set(clients.map(c => c.industry))];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading clients...</div>
      </div>
    );
  }
    return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="flex items-center hover:text-gray-700">
          <Home className="w-4 h-4 mr-1" />
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900 font-medium">Client Management</span>
      </div>
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />            <input
              type="text"
              placeholder="Search clients by name, industry, or location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            >
              <option value="all">All Industries</option>
              {uniqueIndustries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
            >
              <option value="all">All Sizes</option>
              <option value="Small">Small (10-50)</option>
              <option value="Medium">Medium (50-200)</option>
              <option value="Large">Large (1000+)</option>
            </select>
          </div>
        </div>        <button className="flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800">
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Clients</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          <div className="text-sm text-gray-600">Inactive</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
          <div className="text-sm text-gray-600">Suspended</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-primary-600">{stats.totalOpenJobs}</div>
          <div className="text-sm text-gray-600">Open Jobs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{stats.totalHires}</div>
          <div className="text-sm text-gray-600">Total Hires</div>
        </div>
      </div>      {/* Companies Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry & Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metrics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                        style={{ 
                          backgroundColor: stringToColor(client.name),
                          backgroundImage: `linear-gradient(135deg, ${stringToColor(client.name)}aa, ${stringToColor(client.name)})`,
                        }}
                      >
                        {getInitials(client.name)}
                      </div><div className="ml-4">
                        <Link 
                          to={`/dashboard/clients/${client.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-purple-600 hover:underline cursor-pointer"
                        >
                          {client.name}
                        </Link>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {client.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{client.industry}</div>
                      <div className="text-sm text-gray-500">{client.size}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {client.employees.toLocaleString()} employees
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Globe className="h-4 w-4 mr-1" />
                        <a href={client.website} className="text-primary-600 hover:text-primary-800" target="_blank" rel="noopener noreferrer">
                          {client.website.replace('https://', '')}
                        </a>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-1" />
                        {client.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-1" />
                        {client.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(client.status)}`}>
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium text-primary-600">{client.openJobs}</span> open jobs
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium text-green-600">{client.totalHires}</span> total hires
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(client.createdDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last: {new Date(client.lastActivity).toLocaleDateString()}
                      </div>
                    </div>
                  </td>                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link 
                        to={`/dashboard/clients/${client.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View client details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button 
                        className="text-green-600 hover:text-green-900"
                        title="Edit client"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        title="Delete client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">        <div className="text-sm text-gray-700">
          Showing {filteredClients.length} of {clients.length} clients
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 bg-primary-700 text-white rounded">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientManagementPage;
