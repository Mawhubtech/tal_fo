import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, Users, Briefcase, ChevronRight, Search } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  description: string;
  departmentCount: number;
  activeJobs: number;
  totalEmployees: number;
  logoUrl?: string;
  industry: string;
  location: string;
}

// Mock organization data
const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'TechCorp Solutions',
    description: 'Leading technology solutions provider specializing in enterprise software development and cloud services.',
    departmentCount: 8,
    activeJobs: 12,
    totalEmployees: 1250,
    industry: 'Technology',
    location: 'San Francisco, CA'
  },
  {
    id: 'org-2',
    name: 'FinanceFirst',
    description: 'Innovative financial services company providing digital banking and investment solutions.',
    departmentCount: 6,
    activeJobs: 8,
    totalEmployees: 650,
    industry: 'Financial Services',
    location: 'New York, NY'
  },
  {
    id: 'org-3',
    name: 'HealthcarePlus',
    description: 'Comprehensive healthcare services provider with cutting-edge medical technology and patient care.',
    departmentCount: 12,
    activeJobs: 15,
    totalEmployees: 2100,
    industry: 'Healthcare',
    location: 'Boston, MA'
  },
  {
    id: 'org-4',
    name: 'GreenEnergy Co',
    description: 'Sustainable energy solutions company focused on renewable energy and environmental technology.',
    departmentCount: 5,
    activeJobs: 7,
    totalEmployees: 320,
    industry: 'Energy',
    location: 'Austin, TX'
  },
  {
    id: 'org-5',
    name: 'EduTech Innovations',
    description: 'Educational technology platform transforming learning experiences through innovative digital solutions.',
    departmentCount: 7,
    activeJobs: 9,
    totalEmployees: 450,
    industry: 'Education Technology',
    location: 'Seattle, WA'
  }
];

const OrganizationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');

  const filteredOrganizations = mockOrganizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = industryFilter === 'all' || org.industry === industryFilter;
    
    return matchesSearch && matchesIndustry;
  });

  const industries = [...new Set(mockOrganizations.map(org => org.industry))];

  const totalStats = {
    organizations: mockOrganizations.length,
    departments: mockOrganizations.reduce((sum, org) => sum + org.departmentCount, 0),
    activeJobs: mockOrganizations.reduce((sum, org) => sum + org.activeJobs, 0),
    employees: mockOrganizations.reduce((sum, org) => sum + org.totalEmployees, 0)
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Organizations</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Select Organization</h1>
          <p className="text-gray-600 mt-1">Choose an organization to view departments and jobs</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Organizations</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.organizations}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.departments}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.activeJobs}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.employees.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search organizations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Industry Filter */}
          <div className="md:w-64">
            <select
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            >
              <option value="all">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizations.map((org) => (
          <Link
            key={org.id}
            to={`/dashboard/organizations/${org.id}/departments`}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              {/* Organization Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {org.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-500">{org.industry}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{org.description}</p>

              {/* Location */}
              <p className="text-sm text-gray-500 mb-4">{org.location}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{org.departmentCount}</p>
                  <p className="text-xs text-gray-500">Departments</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{org.activeJobs}</p>
                  <p className="text-xs text-gray-500">Active Jobs</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{org.totalEmployees.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Employees</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrganizations.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default OrganizationsPage;
