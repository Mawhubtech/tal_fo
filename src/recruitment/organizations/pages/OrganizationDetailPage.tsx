import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Users, Briefcase, Building, 
  MapPin, Search, Grid3X3, List 
} from 'lucide-react';
import { OrganizationService, DepartmentService, JobService } from '../data';
import type { Organization, Department, Job } from '../data';
import AllJobsCard from '../components/AllJobsCard';

const OrganizationDetailPage: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for data
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const organizationService = new OrganizationService();
  const departmentService = new DepartmentService();
  const jobService = new JobService();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!organizationId) {
        setError('Missing organization ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load organization
        const orgData = await organizationService.getOrganizationById(organizationId);
        setOrganization(orgData);

        if (!orgData) {
          setError('Organization not found');
          return;
        }        // Load departments
        const deptData = await departmentService.getDepartmentsByOrganization(organizationId);
        setDepartments(deptData);

        // Load all jobs for organization
        const jobsData = await jobService.getJobsByOrganization(organizationId);
        setAllJobs(jobsData);
        
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [organizationId]);

  // Filter departments
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading organization details...</p>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'Organization not found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {error || "The organization you're looking for doesn't exist."}
          </p>
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
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl mr-4">
              {organization.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
              <p className="text-gray-600 mt-1">{organization.industry} • {organization.location}</p>
            </div>
          </div>
        </div>
        
        <Link
          to={`/dashboard/organizations/${organizationId}/create-job`}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Link>
      </div>

      {/* Organization Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <p className="text-gray-700 mb-4">{organization.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{organization.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Building className="w-4 h-4 mr-2" />
            <span>{organization.departmentCount} Departments</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Briefcase className="w-4 h-4 mr-2" />
            <span>{organization.activeJobs} Active Jobs</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>{organization.totalEmployees.toLocaleString()} Employees</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Departments */}
        <div className="lg:col-span-2">
          {/* Departments Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Departments</h2>
            
            {/* View Toggle */}
            <div className="flex items-center bg-white rounded-lg border p-1">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
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

          {/* Departments Grid/List */}
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDepartments.map((dept) => (
                <Link
                  key={dept.id}
                  to={`/dashboard/organizations/${organizationId}/departments/${dept.id}/jobs`}
                  className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{dept.name}</h3>
                        <p className="text-sm text-gray-500">Manager: {dept.manager}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dept.description}</p>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Jobs: <span className="font-medium text-gray-900">{dept.activeJobs}</span></span>
                    <span className="text-gray-500">Employees: <span className="font-medium text-gray-900">{dept.totalEmployees}</span></span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active Jobs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employees
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDepartments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/dashboard/organizations/${organizationId}/departments/${dept.id}/jobs`}
                          className="flex items-center text-purple-600 hover:text-purple-700"
                        >
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <Briefcase className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{dept.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{dept.description}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.manager}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.activeJobs}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.totalEmployees}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State for Departments */}
          {filteredDepartments.length === 0 && (
            <div className="text-center py-8">
              <Building className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No departments found</p>
            </div>
          )}
        </div>

        {/* Right Column - All Jobs Card */}
        <div className="lg:col-span-1">
          <AllJobsCard organizationId={organizationId!} jobs={allJobs} />
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetailPage;
