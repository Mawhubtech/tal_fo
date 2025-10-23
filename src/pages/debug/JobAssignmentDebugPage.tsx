import React, { useState } from 'react';
import { Bug, Search, User, Briefcase, Users, Building } from 'lucide-react';
import apiClient from '../../services/api';

interface DebugInfo {
  userId: string;
  teamMemberships: any[];
  jobs: any[];
  jobCount: number;
}

const JobAssignmentDebugPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDebug = async () => {
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/jobs/external/debug/${userId}`);
      setDebugInfo(response.data.debug);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGetMyJobs = async () => {
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/jobs/external/my-jobs', {
        headers: {
          'X-Debug-User-Id': userId // This would need to be handled in the backend for debugging
        }
      });
      console.log('My Jobs Response:', response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Bug className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Job Assignment Debug Tool</h1>
          </div>
          <p className="text-gray-600">
            Debug tool to help understand why external users may not be seeing assigned jobs.
          </p>
        </div>

        {/* Debug Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug External User Access</h2>
          
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                External User ID
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter external user ID (UUID)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleDebug}
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              <span>{loading ? 'Debugging...' : 'Debug Access'}</span>
            </button>
            
            <button
              onClick={handleGetMyJobs}
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Briefcase className="h-4 w-4" />
              <span>Test My Jobs</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Debug Results */}
        {debugInfo && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">User Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">User ID:</span>
                  <p className="text-gray-900 font-mono">{debugInfo.userId}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Jobs Found:</span>
                  <p className="text-gray-900">{debugInfo.jobCount}</p>
                </div>
              </div>
            </div>

            {/* Team Memberships */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Team Memberships</h3>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                  {debugInfo.teamMemberships.length}
                </span>
              </div>
              
              {debugInfo.teamMemberships.length > 0 ? (
                <div className="space-y-4">
                  {debugInfo.teamMemberships.map((team, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{team.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          team.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {team.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{team.description || 'No description'}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">Visibility:</span>
                          <span className="ml-2 capitalize">{team.visibility}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Members:</span>
                          <span className="ml-2">{team.members?.length || 0}</span>
                        </div>
                      </div>

                      {team.organizations && team.organizations.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-gray-500">Organizations:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {team.organizations.map((org: any, orgIndex: number) => (
                              <span key={orgIndex} className="inline-flex items-center space-x-1 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                                <Building className="h-3 w-3" />
                                <span>{org.name}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No team memberships found</p>
                </div>
              )}
            </div>

            {/* Jobs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Accessible Jobs</h3>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                  {debugInfo.jobs.length}
                </span>
              </div>
              
              {debugInfo.jobs.length > 0 ? (
                <div className="space-y-4">
                  {debugInfo.jobs.map((job, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          job.status === 'Active' ? 'bg-green-100 text-green-800' :
                          job.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">Department:</span>
                          <span className="ml-2">{job.department}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Location:</span>
                          <span className="ml-2">{job.location}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Organization ID:</span>
                          <span className="ml-2 font-mono text-xs">{job.organizationId}</span>
                        </div>
                      </div>

                      {job.hiringTeam && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-gray-500">Assigned to Team:</span>
                          <span className="ml-2">{job.hiringTeam.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No accessible jobs found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This could mean:
                  </p>
                  <ul className="text-sm text-gray-500 mt-1 space-y-1">
                    <li>• User is not a member of any teams</li>
                    <li>• No jobs are assigned to user's teams</li>
                    <li>• User hasn't accepted team invitations</li>
                    <li>• Teams are not associated with organizations that have jobs</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobAssignmentDebugPage;
