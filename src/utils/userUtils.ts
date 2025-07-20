import { User } from '../types/auth';

export const isExternalUser = (user: User | undefined): boolean => {
  if (!user || !user.roles) return false;
  
  return user.roles.some(role => 
    role.name === 'external-user' || 
    role.name === 'external' ||
    role.name.toLowerCase().includes('external')
  );
};

export const getDefaultRedirectPath = (user: User | undefined): string => {
  if (isExternalUser(user)) {
    return '/external/jobs';
  }
  
  return '/dashboard';
};

export const hasRole = (user: User | undefined, roleName: string): boolean => {
  if (!user || !user.roles) return false;
  
  return user.roles.some(role => 
    role.name.toLowerCase() === roleName.toLowerCase()
  );
};

export const hasAnyRole = (user: User | undefined, roleNames: string[]): boolean => {
  if (!user || !user.roles) return false;
  
  return roleNames.some(roleName => hasRole(user, roleName));
};

export const isInternalUser = (user: User | undefined): boolean => {
  if (!user || !user.roles) return false;
  
  return user.roles.some(role => 
    role.name === 'internal-hr' || 
    role.name === 'internal-admin'
  );
};
