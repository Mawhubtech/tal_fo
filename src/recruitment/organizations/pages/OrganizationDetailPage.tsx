import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building, Users, Briefcase, ChevronRight, Search, Plus, ArrowLeft } from 'lucide-react';
import AllJobsCard from '../components/AllJobsCard';

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

interface Job {
  id: string;
  title: string;
  department: string;
  departmentId: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  status: 'Active' | 'Draft' | 'Paused';
  applicants: number;
  postedDate: string;
  urgency: 'High' | 'Medium' | 'Low';
}

// Mock organization data
const mockOrganizations: Record<string, Organization> = {
  'org-1': {
    id: 'org-1',
    name: 'TechCorp Solutions',
    description: 'Leading technology solutions provider specializing in enterprise software development and cloud services.',
    departmentCount: 8,
    activeJobs: 12,
    totalEmployees: 1250,
    industry: 'Technology',
    location: 'San Francisco, CA'
  },
  'org-2': {
    id: 'org-2',
    name: 'FinanceFirst',
    description: 'Innovative financial services company providing digital banking and investment solutions.',
    departmentCount: 6,
    activeJobs: 8,
    totalEmployees: 650,
    industry: 'Financial Services',
    location: 'New York, NY'
  },
  'org-3': {
    id: 'org-3',
    name: 'HealthcarePlus',
    description: 'Comprehensive healthcare services provider with cutting-edge medical technology and patient care.',
    departmentCount: 12,
    activeJobs: 15,
    totalEmployees: 2100,
    industry: 'Healthcare',
    location: 'Boston, MA'
  }
};

// Mock jobs data by organization
const mockJobsByOrg: Record<string, Job[]> = {
  'org-1': [
    {
      id: 'job-1',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      departmentId: 'eng',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'Active',
      applicants: 45,
      postedDate: '2 days ago',
      urgency: 'High'
    },
    {
      id: 'job-2',
      title: 'Product Manager',
      department: 'Product',
      departmentId: 'product',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'Active',
      applicants: 32,
      postedDate: '1 week ago',
      urgency: 'Medium'
    },
    {
      id: 'job-3',
      title: 'UX Designer',
      department: 'Design',
      departmentId: 'design',
      location: 'Remote',
      type: 'Full-time',
      status: 'Active',
      applicants: 28,
      postedDate: '3 days ago',
      urgency: 'Medium'
    },
    {
      id: 'job-4',
      title: 'DevOps Engineer',
      department: 'Engineering',
      departmentId: 'eng',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'Draft',
      applicants: 0,
      postedDate: '5 days ago',
      urgency: 'Low'
    }
  ],
  'org-2': [
    {
      id: 'job-5',
      title: 'Financial Analyst',
      department: 'Finance',
      departmentId: 'finance',
      location: 'New York, NY',
      type: 'Full-time',
      status: 'Active',
      applicants: 15,
      postedDate: '1 day ago',
      urgency: 'High'
    },
    {
      id: 'job-6',
      title: 'Software Developer',
      department: 'Engineering',
      departmentId: 'eng',
      location: 'New York, NY',
      type: 'Full-time',
      status: 'Active',
      applicants: 22,
      postedDate: '4 days ago',
      urgency: 'Medium'
    }
  ]
};

const OrganizationDetailPage: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  
  const organization = organizationId ? mockOrganizations[organizationId] : null;
  const jobs = organizationId ? (mockJobsByOrg[organizationId] || []) : [];

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
            <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
            <p className="text-gray-600 mt-1">{organization.industry} • {organization.location}</p>
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

      {/* Organization Info Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            {organization.name.charAt(0)}
          </div>
          <div className="ml-4 flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{organization.name}</h2>
            <p className="text-gray-600">{organization.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-8 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{organization.departmentCount}</p>
            <p className="text-sm text-gray-500">Departments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{organization.activeJobs}</p>
            <p className="text-sm text-gray-500">Active Jobs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{organization.totalEmployees.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Employees</p>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Departments Navigation */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Departments
            </h3>
            <Link
              to={`/dashboard/organizations/${organizationId}/departments`}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Browse jobs by department structure
          </p>
          <Link
            to={`/dashboard/organizations/${organizationId}/departments`}
            className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Building className="w-4 h-4 mr-2" />
            Browse Departments
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Jobs</span>
              <span className="font-medium">{jobs.filter(j => j.status === 'Active').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Draft Jobs</span>
              <span className="font-medium">{jobs.filter(j => j.status === 'Draft').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Applicants</span>
              <span className="font-medium">{jobs.reduce((sum, job) => sum + job.applicants, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">High Priority</span>
              <span className="font-medium text-red-600">{jobs.filter(j => j.urgency === 'High').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* All Jobs Card */}
      <AllJobsCard 
        organizationId={organizationId!}
        organizationName={organization.name}
        jobs={jobs}
      />
    </div>
  );
};

export default OrganizationDetailPage;
