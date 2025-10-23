import { COMPANY_TYPES } from '../constants/company';

// Define role mappings for different company types
export const COMPANY_TYPE_ROLE_MAPPING = {
  [COMPANY_TYPES.INTERNAL_HR]: [
    'internal-hr',
    'user',
    'admin'
  ],
  [COMPANY_TYPES.EXTERNAL_HR_AGENCY]: [
    'hr-agency-specialist',
    'hr-agency-associate', 
    'hr-agency-director',
    'hr-agency-admin',
    'external-hr',
    'admin'
  ],
  [COMPANY_TYPES.FREELANCE_HR]: [
    'freelance-hr',
    'external-hr',
    'user',
    'admin'
  ],
  [COMPANY_TYPES.STARTUP]: [
    'internal-hr',
    'user',
    'admin'
  ],
  [COMPANY_TYPES.ENTERPRISE]: [
    'internal-hr',
    'admin',
    'user'
  ],
  [COMPANY_TYPES.CONSULTING]: [
    'external-hr',
    'freelance-hr',
    'user',
    'admin'
  ]
} as const;

// Get appropriate roles for a company type
export const getRolesForCompanyType = (companyType: string) => {
  return COMPANY_TYPE_ROLE_MAPPING[companyType as keyof typeof COMPANY_TYPE_ROLE_MAPPING] || ['user'];
};

// Filter roles based on company type
export const filterRolesByCompanyType = (allRoles: any[], companyType: string) => {
  const allowedRoleNames = getRolesForCompanyType(companyType);
  
  return allRoles.filter((role: any) => {
    // Always exclude super-admin from company user creation
    if (role.name === 'super-admin') return false;
    
    // Always exclude jobseeker and external-user from company contexts
    if (role.name === 'jobseeker' || role.name === 'external-user') return false;
    
    return (allowedRoleNames as readonly string[]).includes(role.name);
  });
};

// Get role descriptions for company type
export const getRoleDescriptionsForCompanyType = (companyType: string) => {
  const descriptions = {
    [COMPANY_TYPES.INTERNAL_HR]: {
      'internal-hr': 'Perfect for recruiters and HR staff managing internal hiring processes',
      'user': 'Basic access for team members who need limited recruitment system access',
      'admin': 'Full administrative access for HR leaders and system administrators'
    },
    [COMPANY_TYPES.EXTERNAL_HR_AGENCY]: {
      'hr-agency-specialist': 'Entry-level recruiter focused on sourcing and candidate management',
      'hr-agency-associate': 'Mid-level recruiter handling job management and client interactions',
      'hr-agency-director': 'Senior recruiter with team management and analytics access',
      'hr-agency-admin': 'Agency administrator with full system access and user management',
      'external-hr': 'General external HR role for experienced recruiters',
      'admin': 'System administrator with technical and business management capabilities'
    },
    [COMPANY_TYPES.FREELANCE_HR]: {
      'freelance-hr': 'Independent HR consultant managing multiple clients',
      'external-hr': 'External HR professional with comprehensive recruitment capabilities',
      'user': 'Basic access for assistants or limited-scope team members',
      'admin': 'Full access for business owners managing their freelance operations'
    },
    [COMPANY_TYPES.STARTUP]: {
      'internal-hr': 'Startup HR professional managing rapid hiring and growth',
      'user': 'Team member with basic access to recruitment processes',
      'admin': 'Startup founder or HR leader with full system access'
    },
    [COMPANY_TYPES.ENTERPRISE]: {
      'internal-hr': 'Enterprise HR professional managing complex hiring workflows',
      'admin': 'Enterprise administrator with full system and user management',
      'user': 'Department member with limited recruitment system access'
    },
    [COMPANY_TYPES.CONSULTING]: {
      'external-hr': 'HR consultant working with multiple client organizations',
      'freelance-hr': 'Independent consultant managing various recruitment projects',
      'user': 'Basic access for support staff or junior consultants',
      'admin': 'Consulting firm leader with full operational access'
    }
  };

  return descriptions[companyType as keyof typeof descriptions] || {};
};
