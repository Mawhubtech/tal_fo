import React from 'react';
import { 
  Building,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark
} from 'lucide-react';

interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedDate: Date;
}

interface SavedJobsTabProps {
  savedJobs: SavedJob[];
}

const SavedJobsTab: React.FC<SavedJobsTabProps> = ({ savedJobs }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-600">Jobs you've saved for later</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-4">
            {savedJobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Posted {formatDate(job.postedDate)}</p>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0 flex gap-2">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Apply Now
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {savedJobs.length === 0 && (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
                <p className="text-gray-600 mb-4">Save jobs you're interested in to view them here</p>
                <a
                  href="/jobs"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Browse Jobs
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedJobsTab;
