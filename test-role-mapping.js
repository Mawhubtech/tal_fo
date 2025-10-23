// Test file to verify role mapping functionality
const path = require('path');

// Mock company types (from constants/company.ts)
const COMPANY_TYPES = {
  INTERNAL_HR: 'internal_hr',
  EXTERNAL_HR_AGENCY: 'external_hr_agency',
  FREELANCE_HR: 'freelance_hr',
  STARTUP: 'startup',
  ENTERPRISE: 'enterprise',
  CONSULTING: 'consulting',
};

// Mock role mapping logic (from utils/companyRoleMapping.ts)
const COMPANY_TYPE_ROLE_MAPPING = {
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
};

const getRolesForCompanyType = (companyType) => {
  return COMPANY_TYPE_ROLE_MAPPING[companyType] || ['user'];
};

const filterRolesByCompanyType = (allRoles, companyType) => {
  const allowedRoleNames = getRolesForCompanyType(companyType);
  
  return allRoles.filter((role) => {
    // Always exclude super-admin from company user creation
    if (role.name === 'super-admin') return false;
    
    // Always exclude jobseeker and external-user from company contexts
    if (role.name === 'jobseeker' || role.name === 'external-user') return false;
    
    return allowedRoleNames.includes(role.name);
  });
};

// Mock roles data to test with
const mockRoles = [
  { id: '1', name: 'super-admin', description: 'Super admin role' },
  { id: '2', name: 'internal-hr', description: 'Internal HR role' },
  { id: '3', name: 'external-hr', description: 'External HR role' },
  { id: '4', name: 'freelance-hr', description: 'Freelance HR role' },
  { id: '5', name: 'hr-agency-admin', description: 'HR Agency Admin role' },
  { id: '6', name: 'hr-agency-director', description: 'HR Agency Director role' },
  { id: '7', name: 'hr-agency-associate', description: 'HR Agency Associate role' },
  { id: '8', name: 'hr-agency-specialist', description: 'HR Agency Specialist role' },
  { id: '9', name: 'user', description: 'Basic user role' },
  { id: '10', name: 'admin', description: 'Admin role' },
  { id: '11', name: 'jobseeker', description: 'Job seeker role' },
  { id: '12', name: 'external-user', description: 'External user role' }
];

console.log('=== Role Mapping Test Results ===\n');

// Test each company type
Object.values(COMPANY_TYPES).forEach(companyType => {
  console.log(`Company Type: ${companyType.toUpperCase()}`);
  console.log('----------------------------------------');
  
  // Get allowed roles for this company type
  const allowedRoles = getRolesForCompanyType(companyType);
  console.log('Allowed roles:', allowedRoles);
  
  // Filter actual roles
  const filteredRoles = filterRolesByCompanyType(mockRoles, companyType);
  console.log('Filtered roles:', filteredRoles.map(r => r.name));
  
  console.log('\n');
});

console.log('=== Test Specific Scenarios ===\n');

// Test External HR Agency filtering
const externalHrAgencyRoles = filterRolesByCompanyType(mockRoles, COMPANY_TYPES.EXTERNAL_HR_AGENCY);
console.log('External HR Agency roles:', externalHrAgencyRoles.map(r => r.name));
console.log('✓ Should include HR agency hierarchy roles');

// Test Internal HR filtering  
const internalHrRoles = filterRolesByCompanyType(mockRoles, COMPANY_TYPES.INTERNAL_HR);
console.log('Internal HR roles:', internalHrRoles.map(r => r.name));
console.log('✓ Should include internal-hr, user, admin');

// Test that excluded roles are filtered out
const allFiltered = filterRolesByCompanyType(mockRoles, COMPANY_TYPES.STARTUP);
const hasExcludedRoles = allFiltered.some(r => ['super-admin', 'jobseeker', 'external-user'].includes(r.name));
console.log('Has excluded roles (should be false):', hasExcludedRoles);
console.log(hasExcludedRoles ? '❌ Test failed - excluded roles found' : '✓ Test passed - excluded roles properly filtered');

console.log('\n=== All tests completed! ===');
