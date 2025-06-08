import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Users, ChevronRight, Search } from 'lucide-react';

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

interface AllJobsCardProps {
  organizationId: string;
  organizationName: string;
  jobs: Job[];
}

const AllJobsCard: React.FC<AllJobsCardProps> = ({ organizationId, organizationName, jobs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return 'border-l-red-500';
      case 'Medium':
        return 'border-l-yellow-500';
      case 'Low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
              All Jobs in {organizationName}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {jobs.length} total jobs • {jobs.filter(j => j.status === 'Active').length} active
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <select
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredJobs.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                to={`/dashboard/organizations/${organizationId}/departments/${job.departmentId}/jobs/${job.id}/ats`}
                className={`block p-4 hover:bg-gray-50 transition-colors border-l-4 ${getUrgencyColor(job.urgency)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {job.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {job.department}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {job.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {job.applicants} applicants • Posted {job.postedDate}
                      </span>
                      <span className={`text-xs font-medium ${
                        job.urgency === 'High' ? 'text-red-600' :
                        job.urgency === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {job.urgency} Priority
                      </span>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredJobs.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>
      )}
    </div>
  );
};

export default AllJobsCard;
