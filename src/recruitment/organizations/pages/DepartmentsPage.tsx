import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building, Users, ChevronRight, Search, ArrowLeft } from 'lucide-react';
import { useOrganization } from '../../../hooks/useOrganizations';
import { useDepartmentsByOrganization } from '../../../hooks/useDepartments';

const DepartmentsPage: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use React Query hooks
  const { 
    data: organization, 
    isLoading: organizationLoading, 
    error: organizationError 
  } = useOrganization(organizationId || '');
  
  const { 
    data: departments = [], 
    isLoading: departmentsLoading, 
    error: departmentsError 
  } = useDepartmentsByOrganization(organizationId || '');

  const loading = organizationLoading || departmentsLoading;
  const error = organizationError || departmentsError;

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = {
    departments: departments.length,
    activeJobs: departments.reduce((sum, dept) => sum + dept.activeJobs, 0),
    totalEmployees: departments.reduce((sum, dept) => sum + dept.totalEmployees, 0)
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading departments...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Organization not found</h3>
          <p className="text-gray-500 mb-4">The organization you're looking for doesn't exist.</p>
          <Link 
            to="/dashboard/organizations" 
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Organizations
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
        <Link to="/dashboard/organizations" className="hover:text-gray-700">Organizations</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{organization.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            to="/dashboard/organizations"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-600 mt-1">
              Select a department in <span className="font-medium">{organization.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Organization Info Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            {organization.name.charAt(0)}
          </div>
          <div className="ml-4 flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{organization.name}</h2>
            <p className="text-gray-600">{organization.industry} • {organization.location}</p>
          </div>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStats.departments}</p>
              <p className="text-sm text-gray-500">Departments</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStats.activeJobs}</p>
              <p className="text-sm text-gray-500">Active Jobs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalEmployees.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Employees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search departments..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDepartments.map((dept) => (
          <Link
            key={dept.id}
            to={`/dashboard/organizations/${organizationId}/departments/${dept.id}/jobs`}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            <div className="p-6">
              {/* Department Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${dept.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                    {dept.icon}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{dept.description}</p>

              {/* Manager */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Users className="w-4 h-4 mr-2" />
                <span>Manager: {dept.manager}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{dept.activeJobs}</p>
                  <p className="text-xs text-gray-500">Active Jobs</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{dept.totalEmployees}</p>
                  <p className="text-xs text-gray-500">Employees</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-500">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;
