import React, { useState } from 'react';
import { Search, Plus, Edit3, Trash2, Building, Users, MapPin, Globe, Phone, Mail, Calendar } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  employees: number;
  openJobs: number;
  totalHires: number;
  createdDate: string;
  lastActivity: string;
  description?: string;
  logoUrl?: string;
}

// Mock company data
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    industry: 'Technology',
    size: 'Large (1000+ employees)',
    location: 'San Francisco, CA',
    website: 'https://techcorp.com',
    email: 'hr@techcorp.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    employees: 1250,
    openJobs: 8,
    totalHires: 45,
    createdDate: '2023-01-15',
    lastActivity: '2024-01-22',
    description: 'Leading technology solutions provider specializing in enterprise software.'
  },
  {
    id: '2',
    name: 'StartupX',
    industry: 'Fintech',
    size: 'Small (10-50 employees)',
    location: 'New York, NY',
    website: 'https://startupx.io',
    email: 'careers@startupx.io',
    phone: '+1 (555) 234-5678',
    status: 'active',
    employees: 35,
    openJobs: 5,
    totalHires: 12,
    createdDate: '2023-06-20',
    lastActivity: '2024-01-21',
    description: 'Innovative fintech startup revolutionizing digital payments.'
  },
  {
    id: '3',
    name: 'Healthcare Plus',
    industry: 'Healthcare',
    size: 'Medium (100-500 employees)',
    location: 'Boston, MA',
    website: 'https://healthcareplus.com',
    email: 'jobs@healthcareplus.com',
    phone: '+1 (555) 345-6789',
    status: 'active',
    employees: 320,
    openJobs: 12,
    totalHires: 28,
    createdDate: '2022-11-10',
    lastActivity: '2024-01-20',
    description: 'Comprehensive healthcare services provider with cutting-edge medical technology.'
  },
  {
    id: '4',
    name: 'GreenEnergy Co',
    industry: 'Energy',
    size: 'Medium (100-500 employees)',
    location: 'Austin, TX',
    website: 'https://greenenergy.com',
    email: 'talent@greenenergy.com',
    phone: '+1 (555) 456-7890',
    status: 'inactive',
    employees: 180,
    openJobs: 0,
    totalHires: 15,
    createdDate: '2023-03-05',
    lastActivity: '2023-12-15',
    description: 'Sustainable energy solutions for a greener future.'
  },
  {
    id: '5',
    name: 'RetailMax',
    industry: 'Retail',
    size: 'Large (1000+ employees)',
    location: 'Chicago, IL',
    website: 'https://retailmax.com',
    email: 'hr@retailmax.com',
    phone: '+1 (555) 567-8901',
    status: 'suspended',
    employees: 2100,
    openJobs: 0,
    totalHires: 67,
    createdDate: '2022-08-12',
    lastActivity: '2024-01-10',
    description: 'National retail chain with stores across the country.'
  }
];

const CompanyManagementPage: React.FC = () => {
  const [companies] = useState<Company[]>(mockCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');

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

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter;
    const matchesSize = sizeFilter === 'all' || company.size.includes(sizeFilter);
    
    return matchesSearch && matchesStatus && matchesIndustry && matchesSize;
  });

  const stats = {
    total: companies.length,
    active: companies.filter(c => c.status === 'active').length,
    inactive: companies.filter(c => c.status === 'inactive').length,
    suspended: companies.filter(c => c.status === 'suspended').length,
    totalOpenJobs: companies.reduce((sum, c) => sum + c.openJobs, 0),
    totalHires: companies.reduce((sum, c) => sum + c.totalHires, 0)
  };

  const uniqueIndustries = [...new Set(companies.map(c => c.industry))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
          <p className="text-gray-600">Manage client companies and their hiring requirements</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Companies</div>
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
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies by name, industry, or location..."
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
            <option value="Medium">Medium (100-500)</option>
            <option value="Large">Large (1000+)</option>
          </select>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
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
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {company.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{company.industry}</div>
                      <div className="text-sm text-gray-500">{company.size}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {company.employees.toLocaleString()} employees
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Globe className="h-4 w-4 mr-1" />
                        <a href={company.website} className="text-primary-600 hover:text-primary-800" target="_blank" rel="noopener noreferrer">
                          {company.website.replace('https://', '')}
                        </a>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-1" />
                        {company.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-1" />
                        {company.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(company.status)}`}>
                      {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium text-primary-600">{company.openJobs}</span> open jobs
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium text-green-600">{company.totalHires}</span> total hires
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(company.createdDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last: {new Date(company.lastActivity).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-900">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {filteredCompanies.length} of {companies.length} companies
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

export default CompanyManagementPage;
