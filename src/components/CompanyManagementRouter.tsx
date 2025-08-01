import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useMyCompanies, useMemberCompanies } from '../hooks/useCompany';
import CompanyManagementPage from '../pages/admin/CompanyManagementPage';

const CompanyManagementRouter: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Check if user is super admin (has super-admin role)
  const isSuperAdmin = user?.roles?.some(role => 
    role.name === 'super-admin' || role.name === 'superadmin'
  );

  // For super-admins, get companies they own; for regular users, get companies they're members of
  const { data: myCompaniesData, isLoading: isLoadingMyCompanies } = useMyCompanies();
  const { data: memberCompaniesData, isLoading: isLoadingMemberCompanies } = useMemberCompanies();

  // Determine which companies to use based on user role
  const companies = isSuperAdmin 
    ? (myCompaniesData?.companies || [])
    : (memberCompaniesData?.companies || []);
  
  const isLoading = isSuperAdmin ? isLoadingMyCompanies : isLoadingMemberCompanies;

  // Effect to handle navigation for single company users - always call this hook
  useEffect(() => {
    // Only navigate if all conditions are met
    if (!isLoading && !isSuperAdmin && companies.length === 1) {
      const company = companies[0];
      navigate(`/dashboard/admin/companies/${company.id}`, { replace: true });
    }
  }, [companies, isLoading, isSuperAdmin, navigate]);

  // Show loading while checking user's companies
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If super admin, show CompanyManagementPage
  if (isSuperAdmin) {
    return <CompanyManagementPage />;
  }

  // If user has no companies, show an error
  if (companies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Company Access</h3>
          <p className="text-gray-500">
            You don't have access to any companies. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // If user has exactly one company, the useEffect will navigate
  // Show loading while navigation happens
  if (companies.length === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If user has multiple companies (shouldn't happen for non-super admin)
  // but just in case, show the management page
  return <CompanyManagementPage />;
};

export default CompanyManagementRouter;
