import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Plus, 
  Settings, 
  BarChart3, 
  Shield, 
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  Trash2,
  Crown,
  UserPlus,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useMyCompanies, useMemberCompanies, useDeleteCompany } from '../../hooks/useCompany';
import { Company } from '../../services/companyApiService';
import { useAuthContext } from '../../contexts/AuthContext';
import { CreateCompanyModal } from '../../components/company/CreateCompanyModal';
import { EditCompanyModal } from '../../components/company/EditCompanyModal';
import ToastContainer, { toast } from '../../components/ToastContainer';
import { isSuperAdmin } from '../../utils/roleUtils';

const CompanyManagementPage: React.FC = () => {
  const { user } = useAuthContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Fetch companies
  const { data: myCompaniesData, isLoading: loadingMyCompanies } = useMyCompanies();
  const { data: memberCompaniesData, isLoading: loadingMemberCompanies } = useMemberCompanies();
  const deleteCompany = useDeleteCompany();

  const myCompanies = myCompaniesData?.companies || [];
  const memberCompanies = memberCompaniesData?.companies || [];
  const allCompanies = [...myCompanies, ...memberCompanies.filter(c => !myCompanies.find(mc => mc.id === c.id))];

  const isUserSuperAdmin = isSuperAdmin(user);

  // Helper function to get full logo URL
  const getLogoUrl = (logoUrl: string | null | undefined) => {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http')) return logoUrl;
    return `${import.meta.env.VITE_API_URL}${logoUrl}`;
  };

  const handleDeleteCompany = async (company: Company) => {
    if (!window.confirm(`Are you sure you want to delete "${company.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteCompany.mutateAsync(company.id);
      toast.success('Company Deleted', 'Company has been deleted successfully.');
    } catch (error) {
      toast.error('Delete Failed', 'Failed to delete company. Please try again.');
    }
  };

  const getCompanyTypeLabel = (type: string) => {
    const types = {
      'internal_hr': 'Internal HR',
      'external_hr_agency': 'HR Agency',
      'freelance_hr': 'Freelance HR',
      'startup': 'Startup',
      'enterprise': 'Enterprise',
      'consulting': 'Consulting',
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'suspended': 'bg-red-100 text-red-800',
      'pending_verification': 'bg-yellow-100 text-yellow-800',
    };
    
    const statusLabels = {
      'active': 'Active',
      'inactive': 'Inactive',
      'suspended': 'Suspended',
      'pending_verification': 'Pending Verification',
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  const getRoleBadge = (company: Company) => {
    const isOwner = company.ownerId === user?.id;
    const member = company.members?.find(m => m.userId === user?.id);
    
    if (isOwner) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Crown className="h-3 w-3 mr-1" />
          Owner
        </span>
      );
    }
    
    if (member) {
      const roleColors = {
        'admin': 'bg-blue-100 text-blue-800',
        'hr_manager': 'bg-green-100 text-green-800',
        'recruiter': 'bg-indigo-100 text-indigo-800',
        'coordinator': 'bg-orange-100 text-orange-800',
        'viewer': 'bg-gray-100 text-gray-800',
      };
      
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleColors[member.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
          {member.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      );
    }
    
    return null;
  };

  if (loadingMyCompanies || loadingMemberCompanies) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span>Loading companies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
            {isUserSuperAdmin && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <Crown className="h-3 w-3 mr-1" />
                Super Admin
              </span>
            )}
          </div>
          <p className="text-gray-600">
            {isUserSuperAdmin 
              ? "Manage all companies and assign ownership to users" 
              : "Manage your HR companies and team members"
            }
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isUserSuperAdmin ? "Create Company" : "Create Company"}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-semibold text-gray-900">{allCompanies.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Crown className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Owned Companies</p>
              <p className="text-2xl font-semibold text-gray-900">{myCompanies.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Member Of</p>
              <p className="text-2xl font-semibold text-gray-900">{memberCompanies.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-semibold text-gray-900">
                {allCompanies.reduce((sum, company) => sum + (company.members?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {allCompanies.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No companies</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first company.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Company
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCompanies.map((company) => {
            const isOwner = company.ownerId === user?.id;
            const member = company.members?.find(m => m.userId === user?.id);
            
            return (
              <div key={company.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {company.name}
                        </h3>
                        {company.isVerified && (
                          <Shield className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(company.status)}
                        {getRoleBadge(company)}
                      </div>
                      <p className="text-sm text-gray-600">{getCompanyTypeLabel(company.type)}</p>
                    </div>
                    {company.logoUrl ? (
                      <img
                        src={getLogoUrl(company.logoUrl)}
                        alt={`${company.name} logo`}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          // Fallback to default icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0a2 2 0 01-2 2H5a2 2 0 01-2-2m14 0V9a2 2 0 00-2-2H5a2 2 0 002-2h10a2 2 0 012 2v12z"></path>
                                </svg>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {company.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {company.description}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {company.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="truncate">{company.email}</span>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="h-4 w-4 mr-2" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 truncate"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                    {(company.city || company.country) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{[company.city, company.country].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 py-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{company.members?.length || 0}</p>
                      <p className="text-xs text-gray-600">Members</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{company.activeJobs}</p>
                      <p className="text-xs text-gray-600">Active Jobs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{company.totalHires}</p>
                      <p className="text-xs text-gray-600">Total Hires</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <button
                      onClick={() => setSelectedCompany(company)}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                    
                    {isOwner && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingCompany(company)}
                          className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company)}
                          className="text-sm text-red-600 hover:text-red-700 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateCompanyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {editingCompany && (
        <EditCompanyModal
          isOpen={!!editingCompany}
          onClose={() => setEditingCompany(null)}
          company={editingCompany}
        />
      )}

      {/* Toast Container */}
      <ToastContainer position="top-right" />
    </div>
  );
};

export default CompanyManagementPage;
