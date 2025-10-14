/**
 * URL utility functions for creating clean, SEO-friendly URLs
 */

/**
 * Convert a string to a URL-friendly slug
 * @param text - The text to slugify
 * @returns URL-friendly slug
 * 
 * @example
 * slugify("Senior Frontend Developer") // "senior-frontend-developer"
 * slugify("Full-Stack Engineer (Remote)") // "full-stack-engineer-remote"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars except -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Create a job URL with ID and slugified title
 * @param jobId - The job ID
 * @param jobTitle - The job title
 * @returns URL path for the job
 * 
 * @example
 * createJobUrl("123", "Senior Developer") // "/dashboard/jobs/123/senior-developer"
 */
export function createJobUrl(jobId: string, jobTitle: string): string {
  const slug = slugify(jobTitle);
  return `/dashboard/jobs/${jobId}/${slug}`;
}
