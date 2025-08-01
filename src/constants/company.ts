// Company Type Constants
export const COMPANY_TYPES = {
  INTERNAL_HR: 'internal_hr',
  EXTERNAL_HR_AGENCY: 'external_hr_agency',
  FREELANCE_HR: 'freelance_hr',
  STARTUP: 'startup',
  ENTERPRISE: 'enterprise',
  CONSULTING: 'consulting',
} as const;

// Company Size Constants
export const COMPANY_SIZES = {
  SOLO: '1',
  SMALL: '2-10',
  MEDIUM: '11-50',
  LARGE: '51-200',
  ENTERPRISE: '200+',
} as const;

// Company Status Constants
export const COMPANY_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING_VERIFICATION: 'pending_verification',
} as const;

// Company Member Role Constants
export const COMPANY_MEMBER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  HR_MANAGER: 'hr_manager',
  RECRUITER: 'recruiter',
  COORDINATOR: 'coordinator',
  VIEWER: 'viewer',
} as const;

// Company Member Status Constants
export const COMPANY_MEMBER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING_INVITATION: 'pending_invitation',
  SUSPENDED: 'suspended',
} as const;

// Helper arrays for dropdowns/forms
export const COMPANY_TYPE_OPTIONS = [
  { value: COMPANY_TYPES.INTERNAL_HR, label: 'Internal HR' },
  { value: COMPANY_TYPES.EXTERNAL_HR_AGENCY, label: 'External HR Agency' },
  { value: COMPANY_TYPES.FREELANCE_HR, label: 'Freelance HR' },
  { value: COMPANY_TYPES.STARTUP, label: 'Startup' },
  { value: COMPANY_TYPES.ENTERPRISE, label: 'Enterprise' },
  { value: COMPANY_TYPES.CONSULTING, label: 'Consulting' },
];

export const COMPANY_SIZE_OPTIONS = [
  { value: COMPANY_SIZES.SOLO, label: '1 employee' },
  { value: COMPANY_SIZES.SMALL, label: '2-10 employees' },
  { value: COMPANY_SIZES.MEDIUM, label: '11-50 employees' },
  { value: COMPANY_SIZES.LARGE, label: '51-200 employees' },
  { value: COMPANY_SIZES.ENTERPRISE, label: '200+ employees' },
];

export const COMPANY_STATUS_OPTIONS = [
  { value: COMPANY_STATUSES.ACTIVE, label: 'Active' },
  { value: COMPANY_STATUSES.INACTIVE, label: 'Inactive' },
  { value: COMPANY_STATUSES.SUSPENDED, label: 'Suspended' },
  { value: COMPANY_STATUSES.PENDING_VERIFICATION, label: 'Pending Verification' },
];

export const COMPANY_MEMBER_ROLE_OPTIONS = [
  { value: COMPANY_MEMBER_ROLES.OWNER, label: 'Owner' },
  { value: COMPANY_MEMBER_ROLES.ADMIN, label: 'Admin' },
  { value: COMPANY_MEMBER_ROLES.HR_MANAGER, label: 'HR Manager' },
  { value: COMPANY_MEMBER_ROLES.RECRUITER, label: 'Recruiter' },
  { value: COMPANY_MEMBER_ROLES.COORDINATOR, label: 'Coordinator' },
  { value: COMPANY_MEMBER_ROLES.VIEWER, label: 'Viewer' },
];

export const COMPANY_MEMBER_STATUS_OPTIONS = [
  { value: COMPANY_MEMBER_STATUSES.ACTIVE, label: 'Active' },
  { value: COMPANY_MEMBER_STATUSES.INACTIVE, label: 'Inactive' },
  { value: COMPANY_MEMBER_STATUSES.PENDING_INVITATION, label: 'Pending Invitation' },
  { value: COMPANY_MEMBER_STATUSES.SUSPENDED, label: 'Suspended' },
];

// Type definitions
export type CompanyType = typeof COMPANY_TYPES[keyof typeof COMPANY_TYPES];
export type CompanySize = typeof COMPANY_SIZES[keyof typeof COMPANY_SIZES];
export type CompanyStatus = typeof COMPANY_STATUSES[keyof typeof COMPANY_STATUSES];
export type CompanyMemberRole = typeof COMPANY_MEMBER_ROLES[keyof typeof COMPANY_MEMBER_ROLES];
export type CompanyMemberStatus = typeof COMPANY_MEMBER_STATUSES[keyof typeof COMPANY_MEMBER_STATUSES];
