import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building, Users, ChevronRight, Search, ArrowLeft } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
  manager: string;
  activeJobs: number;
  totalEmployees: number;
  color: string;
  icon: string;
}

interface Organization {
  id: string;
  name: string;
  industry: string;
  location: string;
}

// Mock organizations data
const mockOrganizations: Record<string, Organization> = {
  'org-1': {
    id: 'org-1',
    name: 'TechCorp Solutions',
    industry: 'Technology',
    location: 'San Francisco, CA'
  },
  'org-2': {
    id: 'org-2',
    name: 'FinanceFirst',
    industry: 'Financial Services',
    location: 'New York, NY'
  },
  'org-3': {
    id: 'org-3',
    name: 'HealthcarePlus',
    industry: 'Healthcare',
    location: 'Boston, MA'
  }
};

// Mock departments data by organization
const mockDepartmentsByOrg: Record<string, Department[]> = {
  'org-1': [
    {
      id: 'eng',
      name: 'Engineering',
      description: 'Software development, DevOps, and technical infrastructure teams.',
      manager: 'Sarah Johnson',
      activeJobs: 8,
      totalEmployees: 450,
      color: 'bg-blue-500',
      icon: '💻'
    },
    {
      id: 'product',
      name: 'Product',
      description: 'Product management, strategy, and user experience design.',
      manager: 'Michael Chen',
      activeJobs: 3,
      totalEmployees: 85,
      color: 'bg-green-500',
      icon: '🎯'
    },
    {
      id: 'design',
      name: 'Design',
      description: 'UI/UX design, visual design, and design systems.',
      manager: 'Emily Rodriguez',
      activeJobs: 2,
      totalEmployees: 45,
      color: 'bg-purple-500',
      icon: '🎨'
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Digital marketing, brand management, and growth strategies.',
      manager: 'David Kim',
      activeJobs: 4,
      totalEmployees: 120,
      color: 'bg-pink-500',
      icon: '📈'
    },
    {
      id: 'sales',
      name: 'Sales',
      description: 'Business development, account management, and revenue growth.',
      manager: 'Lisa Wang',
      activeJobs: 3,
      totalEmployees: 95,
      color: 'bg-orange-500',
      icon: '💼'
    },
    {
      id: 'hr',
      name: 'Human Resources',
      description: 'Talent acquisition, employee relations, and organizational development.',
      manager: 'James Wilson',
      activeJobs: 2,
      totalEmployees: 35,
      color: 'bg-teal-500',
      icon: '👥'
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Financial planning, accounting, and corporate finance.',
      manager: 'Maria Garcia',
      activeJobs: 1,
      totalEmployees: 28,
      color: 'bg-indigo-500',
      icon: '💰'
    },
    {
      id: 'operations',
      name: 'Operations',
      description: 'Business operations, IT support, and administrative functions.',
      manager: 'Robert Taylor',
      activeJobs: 2,
      totalEmployees: 65,
      color: 'bg-gray-500',
      icon: '⚙️'
    }
  ],
  'org-2': [
    {
      id: 'eng',
      name: 'Engineering',
      description: 'Financial technology development and platform engineering.',
      manager: 'Alex Thompson',
      activeJobs: 5,
      totalEmployees: 180,
      color: 'bg-blue-500',
      icon: '💻'
    },
    {
      id: 'product',
      name: 'Product',
      description: 'Financial product management and strategy.',
      manager: 'Jennifer Lee',
      activeJobs: 2,
      totalEmployees: 45,
      color: 'bg-green-500',
      icon: '🎯'
    },
    {
      id: 'compliance',
      name: 'Compliance',
      description: 'Regulatory compliance and risk management.',
      manager: 'Thomas Brown',
      activeJobs: 3,
      totalEmployees: 55,
      color: 'bg-red-500',
      icon: '⚖️'
    },
    {
      id: 'sales',
      name: 'Sales',
      description: 'Financial services sales and client relationship management.',
      manager: 'Amanda Davis',
      activeJobs: 4,
      totalEmployees: 85,
      color: 'bg-orange-500',
      icon: '💼'
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Corporate finance and financial planning & analysis.',
      manager: 'Kevin Martinez',
      activeJobs: 2,
      totalEmployees: 35,
      color: 'bg-indigo-500',
      icon: '💰'
    },
    {
      id: 'operations',
      name: 'Operations',
      description: 'Financial operations and customer support.',
      manager: 'Rachel Kim',
      activeJobs: 3,
      totalEmployees: 75,
      color: 'bg-gray-500',
      icon: '⚙️'
    }
  ]
};

const DepartmentsPage: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [searchTerm, setSearchTerm] = useState('');

  const organization = organizationId ? mockOrganizations[organizationId] : null;
  const departments = organizationId ? (mockDepartmentsByOrg[organizationId] || []) : [];

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
