import { User } from '../types/auth';

export const isSuperAdmin = (user: User | undefined): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some(role => role.name === 'super-admin');
};

export const isAdmin = (user: User | undefined): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some(role => role.name === 'admin' || role.name === 'super-admin');
};

export const hasRole = (user: User | undefined, roleName: string): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some(role => role.name === roleName);
};

// HR Agency role checks
export const isHrAgencyAdmin = (user: User | undefined): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some(role => role.name === 'hr-agency-admin');
};

export const isHrAgencyDirector = (user: User | undefined): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some(role => role.name === 'hr-agency-director' || role.name === 'hr-agency-admin');
};

export const isHrAgencyAssociate = (user: User | undefined): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some(role => 
    role.name === 'hr-agency-associate' || 
    role.name === 'hr-agency-director' || 
    role.name === 'hr-agency-admin'
  );
};

export const isHrAgencySpecialist = (user: User | undefined): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some(role => 
    role.name === 'hr-agency-specialist' || 
    role.name === 'hr-agency-associate' || 
    role.name === 'hr-agency-director' || 
    role.name === 'hr-agency-admin'
  );
};

export const isHrAgencyMember = (user: User | undefined): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some(role => 
    role.name.startsWith('hr-agency-')
  );
};

export const getHrAgencyRoleLevel = (user: User | undefined): number => {
  if (!user || !user.roles) return 0;
  
  if (user.roles.some(role => role.name === 'hr-agency-admin')) return 4;
  if (user.roles.some(role => role.name === 'hr-agency-director')) return 3;
  if (user.roles.some(role => role.name === 'hr-agency-associate')) return 2;
  if (user.roles.some(role => role.name === 'hr-agency-specialist')) return 1;
  
  return 0;
};

export const canManageHrAgencyRole = (user: User | undefined, targetRoleName: string): boolean => {
  const userLevel = getHrAgencyRoleLevel(user);
  
  const targetLevel = (() => {
    switch (targetRoleName) {
      case 'hr-agency-admin': return 4;
      case 'hr-agency-director': return 3;
      case 'hr-agency-associate': return 2;
      case 'hr-agency-specialist': return 1;
      default: return 0;
    }
  })();
  
  // Can only manage roles at lower levels
  return userLevel > targetLevel;
};
