import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
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
  X,
  RotateCcw
} from 'lucide-react';
import { useCompany, useCompanyMembers, useRemoveMember, useUpdateMember, useInviteMember, useDeleteCompany, useResendInvitation, companyKeys } from '../../hooks/useCompany';
import { useCreateUser, useRoles, useClients, useCurrentUserClients, adminUserKeys } from '../../hooks/useAdminUsers';
import { useAuthContext } from '../../contexts/AuthContext';
import { isSuperAdmin } from '../../utils/roleUtils';
import { EditCompanyModal } from '../../components/company/EditCompanyModal';
import { InviteMemberModal } from '../../components/company/InviteMemberModal';
import { EditMemberModal } from '../../components/company/EditMemberModal';
import { HiringTeamsSection } from '../../components/company/HiringTeamsSection';
import { UserModal } from '../../components/UserModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { CompanyMember } from '../../services/companyApiService';
import { toast } from '../../components/ToastContainer';
import { COMPANY_TYPE_OPTIONS, COMPANY_SIZE_OPTIONS } from '../../constants/company';
import { filterRolesByCompanyType } from '../../utils/companyRoleMapping';
import { formatApiError } from '../../utils/errorUtils';

export const CompanyDetailPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<CompanyMember | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<CompanyMember | null>(null);
  const [showDeleteCompanyModal, setShowDeleteCompanyModal] = useState(false);
  
  const { data: companyData, isLoading: isLoadingCompany, error: companyError } = useCompany(companyId!);
  const { data: membersData, isLoading: isLoadingMembers, refetch: refetchMembers } = useCompanyMembers(companyId!);
  const removeMember = useRemoveMember();
  const updateMember = useUpdateMember();
  const inviteMember = useInviteMember();
  const deleteCompany = useDeleteCompany();
  const resendInvitation = useResendInvitation();
  const createUserMutation = useCreateUser();
  const { data: rolesData } = useRoles();

  // Extract company and members from the response
  const company = companyData?.company;
  const members = membersData?.members;
  const allRoles = Array.isArray(rolesData) ? rolesData : rolesData?.roles || [];

  // Check if current user is the company owner or super-admin
  const isOwner = company?.ownerId === user?.id;
  const isUserSuperAdmin = isSuperAdmin(user);
  
  // Check if user is a member of this company
  const isCompanyMember = members?.some(member => member.user.id === user?.id && member.status === 'active');
  
  // Allow company members all actions except delete
  const canEditCompany = isOwner || isUserSuperAdmin || isCompanyMember;
  const canDeleteCompany = isOwner || isUserSuperAdmin;
  
  // Client data hooks - implements hierarchy:
  // - Super-admin sees all clients
  // - Company owners see all company clients 
  // - HR agency admins see all company clients
  // - Regular users see only clients from hiring teams they're members of + individual assignments
  const { data: clientsResponse } = isUserSuperAdmin 
    ? useClients()
    : useCurrentUserClients();
  const allClients = Array.isArray(clientsResponse) ? clientsResponse : clientsResponse?.clients || [];

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
            onClick={() => navigate('/admin/companies')}
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
      
      // Additional query invalidations
      queryClient.invalidateQueries({ queryKey: adminUserKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.stats() });
    } catch (error: any) {
      console.error('Error removing member:', error);
      const errorMessage = formatApiError(error);
      toast.error('Remove Failed', errorMessage);
    }
  };

  const handleUpdateMember = async (memberId: string, data: { role?: CompanyMember['role']; title?: string }) => {
    try {
      await updateMember.mutateAsync({
        companyId: company.id,
        memberId: memberId,
        data: data
      });
      refetchMembers(); // Refresh the members list
      
      // Additional query invalidations
      queryClient.invalidateQueries({ queryKey: adminUserKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.stats() });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyStats(company.id) });
    } catch (error: any) {
      console.error('Error updating member:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleEditMemberSuccess = () => {
    setMemberToEdit(null);
    refetchMembers(); // Refresh members to show updated user data
    
    // Additional query invalidations
    queryClient.invalidateQueries({ queryKey: adminUserKeys.users() });
    queryClient.invalidateQueries({ queryKey: adminUserKeys.stats() });
    queryClient.invalidateQueries({ queryKey: companyKeys.companyStats(company.id) });
  };

  const handleResendInvitation = async (member: CompanyMember) => {
    try {
      const response = await resendInvitation.mutateAsync({
        companyId: company.id,
        memberId: member.id
      });
      
      if (response.emailSent) {
        toast.success('Invitation Resent', `Invitation email has been sent to ${member.user.email}`);
      } else {
        toast.warning('Invitation Updated', `Invitation was updated but email could not be sent. ${response.emailError || 'Please check Gmail connection.'}`);
      }
      
      // Additional query invalidations
      queryClient.invalidateQueries({ queryKey: adminUserKeys.users() });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyStats(company.id) });
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      const errorMessage = formatApiError(error);
      toast.error('Resend Failed', errorMessage);
    }
  };

  const handleCreateUser = async (userData: any) => {
    if (!company) return;

    try {
      // Create the user
      const response = await createUserMutation.mutateAsync(userData);
      const newUser = (response as any)?.user || response;
      
      // Determine default role based on company type
      const getDefaultRole = () => {
        if (company.type === 'external_hr_agency') {
          return 'hr_agency_specialist';
        }
        return 'recruiter';
      };
      
      // Invite user to company as member
      await inviteMember.mutateAsync({
        companyId: company.id,
        data: { 
          email: newUser.email,
          role: getDefaultRole() // Role based on company type
        }
      });
      
      toast.success('User Created', 'User created successfully and invited to the company.');
      setIsCreateUserModalOpen(false);
      refetchMembers(); // Refresh the members list
      
      // Additional query invalidations
      queryClient.invalidateQueries({ queryKey: adminUserKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.stats() });
      queryClient.invalidateQueries({ queryKey: companyKeys.companyStats(company.id) });
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Use the error utility to format the message properly
      const errorMessage = formatApiError(error);
      toast.error('Creation Failed', errorMessage);
    }
  };

  const handleInviteMemberSuccess = () => {
    refetchMembers();
    setIsInviteModalOpen(false);
    
    // Additional query invalidations
    queryClient.invalidateQueries({ queryKey: adminUserKeys.users() });
    queryClient.invalidateQueries({ queryKey: adminUserKeys.stats() });
    queryClient.invalidateQueries({ queryKey: companyKeys.companyStats(company.id) });
  };

  const handleDeleteCompany = async () => {
    if (!company) return;

    try {
      await deleteCompany.mutateAsync(company.id);
      toast.success('Company Deleted', 'Company has been successfully deleted.');
      navigate('/dashboard/admin/companies');
      
      // Additional query invalidations for comprehensive cleanup
      queryClient.invalidateQueries({ queryKey: adminUserKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.stats() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.clients() });
    } catch (error: any) {
      console.error('Error deleting company:', error);
      const errorMessage = formatApiError(error);
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
      // HR Agency roles
      case 'hr_agency_admin':
        return 'bg-indigo-100 text-indigo-800';
      case 'hr_agency_director':
        return 'bg-blue-100 text-blue-800';
      case 'hr_agency_associate':
        return 'bg-green-100 text-green-800';
      case 'hr_agency_specialist':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRole = (role: CompanyMember['role']) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'hr_manager':
        return 'HR Manager';
      case 'recruiter':
        return 'Recruiter';
      case 'coordinator':
        return 'Coordinator';
      case 'viewer':
        return 'Viewer';
      // HR Agency roles
      case 'hr_agency_admin':
        return 'Admin';
      case 'hr_agency_director':
        return 'Director';
      case 'hr_agency_associate':
        return 'Associate';
      case 'hr_agency_specialist':
        return 'Specialist';
      default:
        return String(role).replace('_', ' ');
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
                    title={`Create user with roles suitable for ${getCompanyTypeLabel(company.type)} companies`}
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {formatRole(member.role)}
                        </span>
                        
                        {/* Member Status */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                        
                        {/* User Status - Show if different from member status or if user is inactive */}
                        {(member.user.status !== 'active' || member.status !== member.user.status) && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            member.user.status === 'active' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            User: {member.user.status}
                          </span>
                        )}
                        
                        {/* Client Access Indicator */}
                        {member.user.clients && member.user.clients.length > 0 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200" title={`Has access to ${member.user.clients.length} client${member.user.clients.length !== 1 ? 's' : ''}`}>
                            {member.user.clients.length} Client{member.user.clients.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        
                        {canEditCompany && member.role !== 'owner' && (
                          <button
                            onClick={() => setMemberToEdit(member)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="Edit member"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        
                        {canEditCompany && member.status === 'pending_invitation' && (
                          <button
                            onClick={() => handleResendInvitation(member)}
                            className="text-orange-500 hover:text-orange-700 p-1"
                            title="Resend invitation email"
                            disabled={resendInvitation.isPending}
                          >
                            <RotateCcw className={`h-4 w-4 ${resendInvitation.isPending ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                        
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

            {/* Hiring Teams */}
            <HiringTeamsSection 
              companyId={company.id} 
              canManage={canEditCompany} 
            />
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

      {isInviteModalOpen && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          companyId={company.id}
          companyType={company.type}
          onSuccess={handleInviteMemberSuccess}
        />
      )}

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
          companyType={company?.type} // Pass company type for role filtering
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

      {memberToEdit && (
        <EditMemberModal
          isOpen={!!memberToEdit}
          onClose={() => setMemberToEdit(null)}
          member={memberToEdit}
          companyId={company.id}
          companyType={company.type}
          onSuccess={handleEditMemberSuccess}
          onUpdateMember={handleUpdateMember}
          isUpdating={updateMember.isPending}
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
