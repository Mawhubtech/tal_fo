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
 * Create a job URL with slugified title and unique slug for SEO
 * @param jobSlug - The job's unique slug (nanoid)
 * @param jobTitle - The job title
 * @returns URL path for the job
 * 
 * @example
 * createJobUrl("aBc123XyZ9", "Senior Developer") // "/jobs/senior-developer-aBc123XyZ9"
 * createJobUrl("f1Uk-Vl3in", "Senior Marketing Manager") // "/jobs/senior-marketing-manager-f1Uk-Vl3in"
 * 
 * @note The backend automatically extracts the nanoid slug from the full URL parameter,
 * so the frontend can pass the entire SEO-friendly slug without extraction.
 */
export function createJobUrl(jobSlug: string, jobTitle: string): string {
  const titleSlug = slugify(jobTitle);
  return `/jobs/${titleSlug}-${jobSlug}`;
}

