import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Copy, Archive, Trash2, Search as SearchIcon, ChevronDown } from 'lucide-react'; // Added ChevronDown

// Mock data for demonstration
const mockJobs = [
  { id: '1', title: 'Software Engineer', department: 'Engineering', location: 'New York, NY', status: 'Open', applications: 25, hiringManager: 'Jane Doe', createdDate: '2025-05-15' },
  { id: '2', title: 'Product Manager', department: 'Product', location: 'San Francisco, CA', status: 'Closed', applications: 40, hiringManager: 'John Smith', createdDate: '2025-04-01' },
  { id: '3', title: 'UX Designer', department: 'Design', location: 'Remote', status: 'Draft', applications: 0, hiringManager: 'Alice Brown', createdDate: '2025-05-20' },
];

const AllJobsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [jobs, setJobs] = useState(mockJobs); // Manage jobs in state
  const [editingStatusJobId, setEditingStatusJobId] = useState<string | null>(null);
  // TODO: Add date range filter state

  const handleStatusChange = (jobId: string, newStatus: 'Open' | 'Closed' | 'Draft') => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
    setEditingStatusJobId(null); // Hide dropdown after selection
    // TODO: API call to update status on the backend
    console.log(`Updated job ${jobId} status to ${newStatus} (locally)`);
  };

  const filteredJobs = jobs.filter(job => { // Filter from state
    return (
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter ? job.status === statusFilter : true) &&
      (departmentFilter ? job.department === departmentFilter : true)
      // TODO: Add date range filtering logic
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">All Jobs</h1>
        <Link to="/dashboard/jobs/create" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
          Create Job
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="mb-4 p-4 bg-gray-50 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Search by job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              id="department"
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {/* TODO: Populate dynamically */}
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            {/* TODO: Implement Date Range Picker */}
            <input type="text" id="dateRange" placeholder="Select date range" className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hiring Manager</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingStatusJobId === job.id ? (
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job.id, e.target.value as 'Active' | 'Inactive' | 'Draft' | 'Closed')}
                        onBlur={() => setEditingStatusJobId(null)}
                        autoFocus
                        className="px-2 py-1 border rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none" // Added appearance-none and custom styling
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Draft">Draft</option>
                        <option value="Closed">Closed</option>
                      </select>
                    ) : (
                      <span
                        onClick={() => setEditingStatusJobId(job.id)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer flex items-center ${
                          job.status === 'Active' ? 'bg-green-100 text-green-700' :
                          job.status === 'Inactive' ? 'bg-yellow-100 text-yellow-700' :
                          job.status === 'Draft' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}
                      >
                        {job.status}
                        <ChevronDown size={14} className="ml-1 opacity-50" /> {/* Added dropdown arrow icon */}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{job.applications}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.hiringManager}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.createdDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button title="View Details" className="text-purple-600 hover:text-purple-900"><Eye size={18} /></button>
                      <button title="Duplicate" className="text-blue-600 hover:text-blue-900"><Copy size={18} /></button>
                      <button title="Archive" className="text-yellow-600 hover:text-yellow-900"><Archive size={18} /></button>
                      <button title="Delete" className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllJobsPage;
