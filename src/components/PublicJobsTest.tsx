import React, { useEffect, useState } from 'react';
import { publicJobApiService } from '../services/publicJobApiService';
import type { PublicJob } from '../services/publicJobApiService';

const PublicJobsTest: React.FC = () => {
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        setLoading(true);
        
        // Test getting published jobs
        console.log('Testing GET /jobs/public');
        const jobsResponse = await publicJobApiService.getPublishedJobs({
          page: 1,
          limit: 10
        });
        console.log('Jobs response:', jobsResponse);
        setJobs(jobsResponse.jobs);

        // Test getting stats
        console.log('Testing GET /jobs/public/stats');
        const statsResponse = await publicJobApiService.getPublicJobStats();
        console.log('Stats response:', statsResponse);
        setStats(statsResponse);

        // Test getting featured jobs
        console.log('Testing GET /jobs/public/featured');
        const featuredResponse = await publicJobApiService.getFeaturedJobs(3);
        console.log('Featured jobs response:', featuredResponse);

      } catch (err: any) {
        console.error('API test error:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Testing Public Jobs API...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-red-600">API Test Error</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <p className="text-sm text-red-600 mt-2">
            Check browser console for more details and ensure backend is running on http://localhost:3000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-green-600">✅ Public Jobs API Test Results</h2>
      
      {/* Stats */}
      {stats && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Job Statistics</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>Total Jobs: {stats.totalJobs}</div>
            <div>Total Companies: {stats.totalCompanies}</div>
            <div>Recent Jobs: {stats.recentJobs}</div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Published Jobs ({jobs.length})</h3>
        {jobs.length > 0 ? (
          <div className="space-y-2">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="bg-white p-3 rounded border text-sm">
                <div className="font-medium">{job.title}</div>
                <div className="text-gray-600">{job.department} • {job.location}</div>
                <div className="text-gray-500">{job.type} • {job.applicantsCount} applicants</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No published jobs found</p>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>✅ API endpoints are working correctly!</p>
        <p>Check browser console for detailed API responses.</p>
      </div>
    </div>
  );
};

export default PublicJobsTest;
