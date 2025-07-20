import type { PublicJob } from '../services/publicJobApiService';
import type { Job as LegacyJob } from '../recruitment/organizations/data/types';

/**
 * Convert legacy Job type to PublicJob type
 */
export const convertLegacyJobToPublicJob = (legacyJob: LegacyJob): PublicJob => {
  return {
    id: legacyJob.id,
    title: legacyJob.title,
    description: legacyJob.description,
    department: legacyJob.department,
    location: legacyJob.location,
    type: legacyJob.employmentType as PublicJob['type'],
    status: 'Published' as const,
    experienceLevel: legacyJob.experience,
    salaryMin: undefined,
    salaryMax: undefined,
    currency: 'USD',
    remote: false,
    skills: legacyJob.skills || [],
    benefits: [],
    requirements: legacyJob.requirements || [],
    responsibilities: [],
    applicationDeadline: legacyJob.applicationDeadline,
    applicantsCount: legacyJob.applicantCount,
    organizationId: legacyJob.organizationId,
    createdAt: legacyJob.postedDate,
    updatedAt: legacyJob.postedDate,
    postedDate: legacyJob.postedDate,
    salaryRange: legacyJob.salary,
  };
};

/**
 * Normalize job data from different sources
 */
export const normalizeJobData = (job: any): PublicJob => {
  // If it's already a PublicJob, return as is
  if (job.createdAt && job.type && job.experienceLevel !== undefined) {
    return job as PublicJob;
  }
  
  // If it's a legacy Job, convert it
  if (job.employmentType && job.experience && job.postedDate) {
    return convertLegacyJobToPublicJob(job as LegacyJob);
  }
  
  // Try to create a PublicJob from any object
  return {
    id: job.id || '',
    title: job.title || '',
    description: job.description || '',
    department: job.department || '',
    location: job.location || '',
    type: job.type || job.employmentType || 'Full-time',
    status: 'Published' as const,
    experienceLevel: job.experienceLevel || job.experience || '',
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    currency: job.currency || 'USD',
    remote: job.remote || false,
    skills: Array.isArray(job.skills) ? job.skills : [],
    benefits: Array.isArray(job.benefits) ? job.benefits : [],
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
    applicationDeadline: job.applicationDeadline,
    applicantsCount: job.applicantsCount || job.applicantCount || 0,
    organizationId: job.organizationId || '',
    createdAt: job.createdAt || job.postedDate || new Date(),
    updatedAt: job.updatedAt || job.postedDate || new Date(),
    postedDate: job.postedDate || job.createdAt || new Date(),
    salaryRange: job.salaryRange || job.salary,
  } as PublicJob;
};
