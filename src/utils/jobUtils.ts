import type { PublicJob } from '../services/publicJobApiService';

/**
 * Format salary range for display
 */
export const formatSalaryRange = (job: PublicJob): string => {
  if (!job.salaryMin && !job.salaryMax) {
    return 'Competitive salary';
  }
  
  const currency = job.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);
  
  if (job.salaryMin && job.salaryMax) {
    return `${currencySymbol}${formatNumber(job.salaryMin)} - ${currencySymbol}${formatNumber(job.salaryMax)}`;
  } else if (job.salaryMin) {
    return `From ${currencySymbol}${formatNumber(job.salaryMin)}`;
  } else if (job.salaryMax) {
    return `Up to ${currencySymbol}${formatNumber(job.salaryMax)}`;
  }
  
  return 'Competitive salary';
};

/**
 * Get currency symbol from currency code
 */
export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
  };
  
  return symbols[currency] || currency;
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Format posted date relative to current time
 */
export const formatPostedDate = (date: Date | string): string => {
  const postedDate = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - postedDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
};

/**
 * Get experience level badge styling
 */
export const getExperienceBadgeColor = (experienceLevel: string): string => {
  switch (experienceLevel?.toLowerCase()) {
    case 'entry':
    case 'entry level':
    case 'junior':
      return 'bg-green-100 text-green-800';
    case 'mid':
    case 'mid level':
    case 'intermediate':
      return 'bg-blue-100 text-blue-800';
    case 'senior':
    case 'senior level':
      return 'bg-purple-100 text-purple-800';
    case 'lead':
    case 'principal':
    case 'staff':
      return 'bg-orange-100 text-orange-800';
    case 'executive':
    case 'director':
    case 'vp':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Format experience level for display
 */
export const formatExperienceLevel = (experienceLevel: string): string => {
  switch (experienceLevel?.toLowerCase()) {
    case 'entry':
      return 'Entry Level';
    case 'mid':
      return 'Mid Level';
    case 'senior':
      return 'Senior Level';
    case 'lead':
      return 'Lead';
    case 'principal':
      return 'Principal';
    case 'staff':
      return 'Staff';
    case 'executive':
      return 'Executive';
    case 'director':
      return 'Director';
    case 'vp':
      return 'VP';
    default:
      return experienceLevel || 'Not specified';
  }
};

/**
 * Get job type badge styling
 */
export const getJobTypeBadgeColor = (jobType: string): string => {
  switch (jobType?.toLowerCase()) {
    case 'full-time':
      return 'bg-blue-100 text-blue-800';
    case 'part-time':
      return 'bg-green-100 text-green-800';
    case 'contract':
      return 'bg-yellow-100 text-yellow-800';
    case 'freelance':
      return 'bg-purple-100 text-purple-800';
    case 'internship':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Calculate application deadline status
 */
export const getDeadlineStatus = (deadline: Date | string | undefined): {
  status: 'active' | 'warning' | 'expired';
  text: string;
  daysLeft?: number;
} => {
  if (!deadline) {
    return { status: 'active', text: 'No deadline' };
  }
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { status: 'expired', text: 'Expired' };
  } else if (diffDays === 0) {
    return { status: 'warning', text: 'Expires today', daysLeft: 0 };
  } else if (diffDays === 1) {
    return { status: 'warning', text: 'Expires tomorrow', daysLeft: 1 };
  } else if (diffDays <= 7) {
    return { status: 'warning', text: `${diffDays} days left`, daysLeft: diffDays };
  } else {
    return { status: 'active', text: `${diffDays} days left`, daysLeft: diffDays };
  }
};

/**
 * Truncate text to specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Generate job sharing URL
 */
export const generateJobShareUrl = (jobId: string): string => {
  return `${window.location.origin}/jobs/${jobId}`;
};

/**
 * Extract keywords from job description for SEO
 */
export const extractJobKeywords = (job: PublicJob): string[] => {
  const keywords: string[] = [];
  
  // Add job title words
  keywords.push(...job.title.toLowerCase().split(' '));
  
  // Add skills
  if (job.skills) {
    keywords.push(...job.skills.map(skill => skill.toLowerCase()));
  }
  
  // Add department
  keywords.push(job.department.toLowerCase());
  
  // Add location
  keywords.push(job.location.toLowerCase());
  
  // Add job type
  keywords.push(job.type.toLowerCase());
  
  // Remove duplicates and filter empty strings
  return [...new Set(keywords)].filter(keyword => keyword.length > 2);
};
