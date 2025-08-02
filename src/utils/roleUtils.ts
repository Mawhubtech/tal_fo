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
