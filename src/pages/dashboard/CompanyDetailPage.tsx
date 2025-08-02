import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Edit3, 
  Plus,
  Trash2,
  UserPlus,
  Settings,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { useCompany, useCompanyMembers, useRemoveMember, useUpdateMember, useInviteMember, useDeleteCompany } from '../../hooks/useCompany';
import { useCreateUser, useRoles } from '../../hooks/useAdminUsers';
import { useAuthContext } from '../../contexts/AuthContext';
import { isSuperAdmin } from '../../utils/roleUtils';
import { EditCompanyModal } from '../../components/company/EditCompanyModal';
import { CompanyTeamsSection } from '../../components/company/CompanyTeamsSection';
import { UserModal } from '../../components/UserModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { CompanyMember } from '../../services/companyApiService';
import { toast } from '../../components/ToastContainer';
import { COMPANY_TYPE_OPTIONS, COMPANY_SIZE_OPTIONS } from '../../constants/company';

export const CompanyDetailPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<CompanyMember | null>(null);
  const [showDeleteCompanyModal, setShowDeleteCompanyModal] = useState(false);
  
  const { data: companyData, isLoading: isLoadingCompany, error: companyError } = useCompany(companyId!);
  const { data: membersData, isLoading: isLoadingMembers, refetch: refetchMembers } = useCompanyMembers(companyId!);
  const removeMember = useRemoveMember();
  const updateMember = useUpdateMember();
  const inviteMember = useInviteMember();
  const deleteCompany = useDeleteCompany();
  const createUserMutation = useCreateUser();
  const { data: rolesData } = useRoles();

  // Extract company and members from the response
  const company = companyData?.company;
  const members = membersData?.members;
  const allRoles = Array.isArray(rolesData) ? rolesData : rolesData?.roles || [];

  // Check if current user is the company owner or super-admin
  const isOwner = company?.ownerId === user?.id;
  const isUserSuperAdmin = isSuperAdmin(user);
  const canEditCompany = isOwner || isUserSuperAdmin;
  const canDeleteCompany = isOwner || isUserSuperAdmin;

  if (isLoadingCompany) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (companyError || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Company Not Found</h2>
          <p className="text-gray-600 mb-4">The requested company could not be found.</p>
          <button
            onClick={() => navigate('/dashboard/companies')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  const handleRemoveMember = async (member: CompanyMember) => {
    try {
      await removeMember.mutateAsync({ 
        companyId: company.id, 
        memberId: member.id 
      });
      toast.success('Member Removed', `${member.user.firstName} ${member.user.lastName} has been removed from the company.`);
      setMemberToRemove(null);
    } catch (error) {
      toast.error('Remove Failed', 'Failed to remove member. Please try again.');
    }
  };

  const handleRoleChange = async (member: CompanyMember, newRole: CompanyMember['role']) => {
    try {
      await updateMember.mutateAsync({
        companyId: company.id,
        memberId: member.id,
        data: { role: newRole }
      });
      toast.success('Role Updated', `${member.user.firstName}'s role has been updated to ${newRole}.`);
    } catch (error) {
      toast.error('Update Failed', 'Failed to update member role. Please try again.');
    }
  };

  const handleCreateUser = async (userData: any) => {
    if (!company) return;

    try {
      // 1. Create the user
      const response = await createUserMutation.mutateAsync(userData);
      const newUser = (response as any)?.user || response;
      
      // 2. Invite user to company as member
      await inviteMember.mutateAsync({
        companyId: company.id,
        data: { 
          email: newUser.email,
          role: 'recruiter' // Default role for new users
        }
      });
      
      toast.success('User Created', 'User created and added to company successfully!');
      setIsCreateUserModalOpen(false);
      refetchMembers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create user. Please try again.';
      toast.error('Creation Failed', errorMessage);
    }
  };

  const handleDeleteCompany = async () => {
    if (!company) return;

    try {
      await deleteCompany.mutateAsync(company.id);
      toast.success('Company Deleted', 'Company has been successfully deleted.');
      navigate('/dashboard/admin/companies');
    } catch (error: any) {
      console.error('Error deleting company:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete company. Please try again.';
      toast.error('Delete Failed', errorMessage);
    } finally {
      setShowDeleteCompanyModal(false);
    }
  };

  const getRoleColor = (role: CompanyMember['role']) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'hr_manager':
        return 'bg-blue-100 text-blue-800';
      case 'recruiter':
        return 'bg-green-100 text-green-800';
      case 'coordinator':
        return 'bg-yellow-100 text-yellow-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pending_invitation':
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper functions to get display labels
  const getCompanyTypeLabel = (type: string) => {
    const option = COMPANY_TYPE_OPTIONS.find(opt => opt.value === type);
    return option ? option.label : type.replace('_', ' ');
  };

  const getCompanySizeLabel = (size: string) => {
    const option = COMPANY_SIZE_OPTIONS.find(opt => opt.value === size);
    return option ? option.label : size;
  };

  // Helper function to get full logo URL
  const getLogoUrl = (logoUrl: string | null | undefined) => {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http')) return logoUrl;
    return `${import.meta.env.VITE_API_URL}${logoUrl}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="p-3 rounded-lg relative overflow-hidden"
                style={{ backgroundColor: company.brandColor || '#6366f1' }}
              >
                {company.logoUrl ? (
                  <img 
                    src={getLogoUrl(company.logoUrl)} 
                    alt={`${company.name} logo`}
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                    {company.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">{company.industry}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {canEditCompany && (
                <>
                  <button
                    onClick={() => setIsCreateUserModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                  </button>
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </button>
                </>
              )}
              {canEditCompany && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Company
                </button>
              )}
              {canDeleteCompany && (
                <button
                  onClick={() => setShowDeleteCompanyModal(true)}
                  className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Company
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
              
              {company.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{company.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-gray-600">{company.email}</p>
                    </div>
                  </div>
                  
                  {company.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <p className="text-gray-600">{company.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {company.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Website</p>
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {company.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {(company.address || company.city || company.country) && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Address</p>
                        <div className="text-gray-600">
                          {company.address && <p>{company.address}</p>}
                          {(company.city || company.country) && (
                            <p>
                              {company.city}{company.city && company.country && ', '}{company.country}
                              {company.zipCode && ` ${company.zipCode}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                <span className="text-sm text-gray-500">
                  {members?.length || 0} member{(members?.length || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              
              {isLoadingMembers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : members && members.length > 0 ? (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {member.user.firstName[0]}{member.user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {member.role === 'owner' ? (
                          <span className="text-sm text-gray-500 px-2 py-1">
                            Role cannot be changed
                          </span>
                        ) : !canEditCompany ? (
                          <span className="text-sm text-gray-500 px-2 py-1">
                            Only owner or super-admin can change roles
                          </span>
                        ) : (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member, e.target.value as CompanyMember['role'])}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                            disabled={updateMember.isPending}
                          >
                            <option value="viewer">Viewer</option>
                            <option value="coordinator">Coordinator</option>
                            <option value="recruiter">Recruiter</option>
                            <option value="hr_manager">HR Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                        
                        {member.role !== 'owner' && canEditCompany && (
                          <button
                            onClick={() => setMemberToRemove(member)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
                  <p className="text-gray-500 mb-4">Start building your team by inviting members.</p>
                  {canEditCompany && (
                    <button
                      onClick={() => setIsInviteModalOpen(true)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Invite First Member
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Recruitment Teams */}
            <CompanyTeamsSection companyId={company.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Team Members</span>
                  <span className="font-medium">{members?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Company Type</span>
                  <span className="font-medium">{getCompanyTypeLabel(company.type)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Company Size</span>
                  <span className="font-medium">{getCompanySizeLabel(company.size)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                    {company.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-500">
                  Company created on {new Date(company.createdAt).toLocaleDateString()}
                </div>
                {company.updatedAt !== company.createdAt && (
                  <div className="text-sm text-gray-500">
                    Last updated on {new Date(company.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <EditCompanyModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          company={company}
        />
      )}

      {/* TODO: Implement InviteMemberModal 
      {isInviteModalOpen && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          companyId={company.id}
        />
      )}
      */}

      {/* Create User Modal */}
      {isCreateUserModalOpen && (
        <UserModal
          isOpen={isCreateUserModalOpen}
          onClose={() => setIsCreateUserModalOpen(false)}
          onSubmit={handleCreateUser}
          user={null}
          isEditing={false}
          isLoading={createUserMutation.isPending}
          roles={allRoles}
          filterAdminRoles={true} // Filter out admin roles for company management
        />
      )}

      {memberToRemove && (
        <ConfirmationModal
          isOpen={!!memberToRemove}
          onClose={() => setMemberToRemove(null)}
          onConfirm={() => handleRemoveMember(memberToRemove)}
          title="Remove Team Member"
          message={`Are you sure you want to remove ${memberToRemove.user.firstName} ${memberToRemove.user.lastName} from the company? This action cannot be undone.`}
          confirmText="Remove Member"
          cancelText="Cancel"
          type="danger"
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteCompanyModal}
        onClose={() => setShowDeleteCompanyModal(false)}
        onConfirm={handleDeleteCompany}
        title="Delete Company"
        message={`Are you sure you want to delete "${company?.name}"? This action cannot be undone and will remove all company data, including members, departments, and jobs.`}
        confirmText="Delete Company"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};
