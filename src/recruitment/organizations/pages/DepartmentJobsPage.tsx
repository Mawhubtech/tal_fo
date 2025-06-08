import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Briefcase, MapPin, DollarSign, 
  Search, Grid3X3, List, ChevronRight 
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  level: 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Lead Level' | 'Executive';
  salary: string;
  status: 'Active' | 'Draft' | 'Closed';
  applicants: number;
  postedDate: string;
  hiringManager: string;
  description: string;
  requirements: string[];
  benefits: string[];
}

interface Organization {
  id: string;
  name: string;
  industry: string;
  location: string;
}

interface Department {
  id: string;
  name: string;
  manager: string;
  color: string;
  icon: string;
}

// Mock data
const mockOrganizations: Record<string, Organization> = {
  'org-1': {
    id: 'org-1',
    name: 'TechCorp Solutions',
    industry: 'Technology',
    location: 'San Francisco, CA'
  }
};

const mockDepartments: Record<string, Department> = {
  'eng': {
    id: 'eng',
    name: 'Engineering',
    manager: 'Sarah Johnson',
    color: 'bg-blue-500',
    icon: '💻'
  },
  'product': {
    id: 'product',
    name: 'Product',
    manager: 'Michael Chen',
    color: 'bg-green-500',
    icon: '🎯'
  },
  'design': {
    id: 'design',
    name: 'Design',
    manager: 'Emily Rodriguez',
    color: 'bg-purple-500',
    icon: '🎨'
  },
  'marketing': {
    id: 'marketing',
    name: 'Marketing',
    manager: 'David Kim',
    color: 'bg-pink-500',
    icon: '📈'
  }
};

// Mock jobs by department
const mockJobsByDepartment: Record<string, Job[]> = {
  'eng': [
    {
      id: 'job-101',
      title: 'Senior Software Engineer - Frontend',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      level: 'Senior Level',
      salary: '$140,000 - $180,000',
      status: 'Active',
      applicants: 24,
      postedDate: '2025-01-15',
      hiringManager: 'Sarah Johnson',
      description: 'We are looking for a skilled Frontend Engineer to join our team and help build amazing user experiences.',
      requirements: ['5+ years React experience', 'TypeScript proficiency', 'Modern CSS frameworks'],
      benefits: ['Health insurance', 'Stock options', 'Flexible working hours']
    },
    {
      id: 'job-102',
      title: 'DevOps Engineer - Cloud Infrastructure',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      level: 'Mid Level',
      salary: '$120,000 - $160,000',
      status: 'Active',
      applicants: 18,
      postedDate: '2025-01-20',
      hiringManager: 'Sarah Johnson',
      description: 'Join our DevOps team to build and maintain scalable cloud infrastructure.',
      requirements: ['AWS/GCP experience', 'Kubernetes', 'CI/CD pipelines'],
      benefits: ['Health insurance', 'Stock options', 'Learning stipend']
    },
    {
      id: 'job-103',
      title: 'Backend Developer - Node.js',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      level: 'Mid Level',
      salary: '$110,000 - $150,000',
      status: 'Active',
      applicants: 31,
      postedDate: '2025-01-10',
      hiringManager: 'Sarah Johnson',
      description: 'We need a talented Backend Developer to help scale our API infrastructure.',
      requirements: ['Node.js expertise', 'Database design', 'API development'],
      benefits: ['Remote work', 'Health insurance', 'Professional development']
    }
  ],
  'product': [
    {
      id: 'job-201',
      title: 'Product Manager - Mobile Apps',
      department: 'Product',
      location: 'San Francisco, CA',
      type: 'Full-time',
      level: 'Mid Level',
      salary: '$130,000 - $170,000',
      status: 'Active',
      applicants: 15,
      postedDate: '2025-01-18',
      hiringManager: 'Michael Chen',
      description: 'Lead product strategy and development for our mobile applications.',
      requirements: ['3+ years PM experience', 'Mobile product experience', 'Data-driven approach'],
      benefits: ['Stock options', 'Health insurance', 'Flexible schedule']
    },
    {
      id: 'job-202',
      title: 'Senior Product Analyst',
      department: 'Product',
      location: 'San Francisco, CA',
      type: 'Full-time',
      level: 'Senior Level',
      salary: '$120,000 - $160,000',
      status: 'Draft',
      applicants: 0,
      postedDate: '2025-01-22',
      hiringManager: 'Michael Chen',
      description: 'Analyze product metrics and drive data-informed product decisions.',
      requirements: ['SQL proficiency', 'Analytics tools', 'Statistical analysis'],
      benefits: ['Health insurance', 'Stock options', 'Learning budget']
    }
  ],
  'design': [
    {
      id: 'job-301',
      title: 'Senior UX Designer',
      department: 'Design',
      location: 'San Francisco, CA',
      type: 'Full-time',
      level: 'Senior Level',
      salary: '$115,000 - $155,000',
      status: 'Active',
      applicants: 12,
      postedDate: '2025-01-12',
      hiringManager: 'Emily Rodriguez',
      description: 'Create exceptional user experiences for our web and mobile products.',
      requirements: ['5+ years UX design', 'Figma proficiency', 'User research experience'],
      benefits: ['Creative freedom', 'Health insurance', 'Design conference budget']
    },
    {
      id: 'job-302',
      title: 'Lead Product Designer',
      department: 'Design',
      location: 'Hybrid',
      type: 'Full-time',
      level: 'Lead Level',
      salary: '$140,000 - $180,000',
      status: 'Active',
      applicants: 8,
      postedDate: '2025-01-25',
      hiringManager: 'Emily Rodriguez',
      description: 'Lead design vision and mentor a team of talented designers.',
      requirements: ['7+ years design experience', 'Team leadership', 'Design systems'],
      benefits: ['Leadership development', 'Stock options', 'Flexible work']
    }
  ],
  'marketing': [
    {
      id: 'job-401',
      title: 'Marketing Manager - Growth',
      department: 'Marketing',
      location: 'San Francisco, CA',
      type: 'Full-time',
      level: 'Mid Level',
      salary: '$95,000 - $130,000',
      status: 'Active',
      applicants: 22,
      postedDate: '2025-01-14',
      hiringManager: 'David Kim',
      description: 'Drive user acquisition and growth marketing initiatives.',
      requirements: ['Digital marketing experience', 'Analytics proficiency', 'A/B testing'],
      benefits: ['Marketing budget', 'Health insurance', 'Performance bonuses']
    }
  ]
};

const DepartmentJobsPage: React.FC = () => {
  const { organizationId, departmentId } = useParams<{ organizationId: string; departmentId: string }>();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const organization = organizationId ? mockOrganizations[organizationId] : null;
  const department = departmentId ? mockDepartments[departmentId] : null;
  const jobs = departmentId ? (mockJobsByDepartment[departmentId] || []) : [];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesLevel = levelFilter === 'all' || job.level === levelFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesLevel;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!organization || !department) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Page not found</h3>
          <p className="text-gray-500 mb-4">The organization or department you're looking for doesn't exist.</p>
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
        <Link to={`/dashboard/organizations/${organizationId}/departments`} className="hover:text-gray-700">
          {organization.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{department.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            to={`/dashboard/organizations/${organizationId}/departments`}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600 mt-1">
              <span className="font-medium">{department.name}</span> department in {organization.name}
            </p>
          </div>
        </div>
        
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

      {/* Department Info Card */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-12 h-12 ${department.color} rounded-lg flex items-center justify-center text-white text-xl`}>
              {department.icon}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">{department.name} Department</h2>
              <p className="text-gray-600">Manager: {department.manager}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
            <p className="text-sm text-gray-500">Total Jobs</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <select
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior Level">Senior Level</option>
              <option value="Lead Level">Lead Level</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid/List */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Job Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.salary}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>

                {/* Job Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium">{job.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Level:</span>
                    <span className="font-medium">{job.level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Applicants:</span>
                    <span className="font-medium">{job.applicants}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </div>
                  <Link
                    to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${job.id}/ats`}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center"
                  >
                    View ATS <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">{job.salary}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.type} • {job.level}</div>
                      <div className="text-sm text-gray-500">{job.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.applicants}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.postedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${job.id}/ats`}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        View ATS
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default DepartmentJobsPage;
