import { useState, useEffect } from 'react';
import { jobApiService } from '../services/jobApiService';

export interface ExternalJob {
  id: string;
  title: string;
  description?: string;
  department: string;
  departmentId: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  status: 'Active' | 'Draft' | 'Paused' | 'Closed';
  urgency: 'High' | 'Medium' | 'Low';
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  remote: boolean;
  skills?: string[];
  benefits?: string[];
  requirements?: string[];
  responsibilities?: string[];
  hiringTeamId?: string;
  applicationDeadline?: string;
  applicantsCount: number;
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    description?: string;
  };
  hiringTeam?: {
    id: string;
    name: string;
    members?: Array<{
      id: string;
      role: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    }>;
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface JobApplication {
  id: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
  };
  currentStage: {
    id: string;
    name: string;
  };
  appliedAt: string;
  status: string;
  notes?: string;
}

export const useExternalJobDetail = (jobId: string) => {
  const [job, setJob] = useState<ExternalJob | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch job details and applications in parallel
        const [jobData, applicationsData] = await Promise.all([
          jobApiService.getExternalJobDetail(jobId),
          jobApiService.getExternalJobApplications(jobId)
        ]);

        setJob(jobData as ExternalJob);
        setApplications(applicationsData);
      } catch (err: any) {
        console.error('Error fetching job detail:', err);
        setError(err.response?.data?.message || 'Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [jobId]);

  const refetch = async () => {
    if (!jobId) return;

    try {
      const [jobData, applicationsData] = await Promise.all([
        jobApiService.getExternalJobDetail(jobId),
        jobApiService.getExternalJobApplications(jobId)
      ]);

      setJob(jobData as ExternalJob);
      setApplications(applicationsData);
    } catch (err: any) {
      console.error('Error refetching job detail:', err);
      setError(err.response?.data?.message || 'Failed to refetch job details');
    }
  };

  return {
    job,
    applications,
    loading,
    error,
    refetch
  };
};
