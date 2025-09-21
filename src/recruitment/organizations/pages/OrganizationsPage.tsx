import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Building, Users, Briefcase, ChevronRight, Search } from 'lucide-react';
import { type Organization } from '../services/organizationApiService';
import { useOrganizationPageData, usePrefetchOrganization } from '../../../hooks/useOrganizations';
import { useAuth } from '../../../hooks/useAuth';

const OrganizationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  
  // Get current user for role-based access
  const { user: currentUser } = useAuth();
  
  // Check if current user is super-admin
  const isSuperAdmin = currentUser?.roles?.some(role => role.name === 'super-admin') || false;
  
  // Single optimized API call for all organization page data
  const { 
    data: pageData,
    isLoading,
    error 
  } = useOrganizationPageData();
  
  // Extract data from the single response
  const organizations = pageData?.organizations || [];
  const stats = pageData?.stats || { organizations: 0, departments: 0, activeJobs: 0, employees: 0 };
  const industries = pageData?.industries || [];
  
  const prefetchOrganization = usePrefetchOrganization();

  // Memoized filtered organizations
  const filteredOrganizations = useMemo(() => {
    return organizations.filter(org => {
      const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           org.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           org.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesIndustry = industryFilter === 'all' || org.industry === industryFilter;
      
      return matchesSearch && matchesIndustry;
    });
  }, [organizations, searchTerm, industryFilter]);

  // Handle organization hover for prefetching (temporarily disabled to prevent cascade of API calls)
  const handleOrganizationHover = useCallback((organizationId: string) => {
    // Temporarily disable prefetching to prevent excessive API calls
    // Each prefetch was triggering department and job stats calls
    // prefetchOrganization(organizationId);
  }, []);

  // Use the loading state from the single API call

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="text-center py-12 px-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <div className="text-center py-12 px-6">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Organizations</h3>
          <p className="text-gray-500 mb-4">Failed to load organizations. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-2">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4 px-6 pt-6">
        <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Organizations</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSuperAdmin ? 'All Organizations' : 'My Organizations'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin 
              ? 'Choose an organization to view departments and jobs'
              : 'Choose from your assigned organizations to view departments and jobs'
            }
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 px-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Organizations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.organizations}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.departments}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.employees.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 mx-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={isSuperAdmin ? "Search all organizations..." : "Search your organizations..."}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
        {filteredOrganizations.map((org) => (
          <Link
            key={org.id}
            to={`/dashboard/organizations/${org.id}`}
            onMouseEnter={() => handleOrganizationHover(org.id)}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
          >
            <div className="p-5 flex flex-col h-full">
              {/* Organization Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {org.name.charAt(0)}
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <h3 className="font-semibold text-gray-900 truncate">{org.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{org.industry}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
              </div>

              {/* Description - with fixed height */}
              <div className="h-12 mb-3">
                <p className="text-sm text-gray-600 line-clamp-2">{org.description}</p>
              </div>

              {/* Location */}
              <p className="text-sm text-gray-500 mb-3 truncate">{org.location}</p>             
              
              {/* Stats - with equal widths and better alignment */}
              <div className="mt-auto pt-3 border-t border-gray-100 grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{org.departmentCount || 0}</p>
                  <p className="text-xs text-gray-500">Departments</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{org.activeJobs || 0}</p>
                  <p className="text-xs text-gray-500">Active Jobs</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{(org.totalEmployees || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Employees</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrganizations.length === 0 && (
        <div className="text-center py-12 px-6">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isSuperAdmin ? 'No organizations found' : 'No assigned organizations found'}
          </h3>
          <p className="text-gray-500">
            {isSuperAdmin 
              ? 'Try adjusting your search or filter criteria.'
              : 'You do not have access to any organizations yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default OrganizationsPage;
