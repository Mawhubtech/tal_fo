import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Users, 
  Search,
  ExternalLink,
  Clock,
  AlertCircle 
} from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useExternalUserJobs } from '../../hooks/useExternalJobs';
import type { Job } from '../../recruitment/data/types';

// Extended job type for external users with relations
interface ExternalJob extends Job {
  hiringTeam?: {
    id: string;
    name: string;
    members?: Array<{
      teamRole: string;
      user?: { id: string };
    }>;
  };
  organization?: {
    id: string;
    name: string;
  };
}

const ExternalJobsPage: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: jobs = [], isLoading, error } = useExternalUserJobs() as { 
    data: ExternalJob[], 
    isLoading: boolean, 
    error: any 
  };

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJobClick = (job: ExternalJob) => {
    const organizationId = job.organizationId || job.organization?.id;
    const departmentId = job.departmentId;
    
    if (organizationId && departmentId) {
      // Navigate to the main JobATSPage for full ATS experience
      navigate(`/dashboard/organizations/${organizationId}/departments/${departmentId}/jobs/${job.id}/ats`);
    } else {
      // Fallback to external job detail page if missing organization/department info
      navigate(`/external/jobs/${job.id}/applications`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Jobs</h2>
          <p className="text-gray-600">Failed to load your assigned jobs. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-600 mt-2">
            Jobs where you're a team member • {filteredJobs.length} total
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search jobs by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No jobs match your search' : 'No jobs assigned'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'You haven\'t been assigned to any jobs yet. Contact your hiring manager for access.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div 
                key={job.id} 
                onClick={() => handleJobClick(job)}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-purple-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                        {job.title}
                      </h3>
                      {job.hiringTeam?.members && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Team Member
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 font-medium mb-3">{job.organization?.name || 'Organization'}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{job.applicants} applicants</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Team:</span>
                      <span className="text-xs font-medium text-gray-700">{job.hiringTeam?.name || 'Unknown Team'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === 'Published' ? 'bg-green-100 text-green-800' :
                      job.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExternalJobsPage;
