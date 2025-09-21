import React, { useState, useEffect } from 'react';
import { X, Users, Building2, Plus, Minus, Save } from 'lucide-react';
import { 
  useShareTemplateWithTeams, 
  useShareTemplateWithOrganizations,
  useRemoveTemplateFromTeams,
  useRemoveTemplateFromOrganizations,
  useGetTemplateSharing,
  type EmailTemplate 
} from '../hooks/useEmailManagement';
import { useHiringTeams } from '../hooks/useHiringTeam';
import { useOrganizations } from '../hooks/useOrganizations';
import { useToast } from '../contexts/ToastContext';

interface TemplateShareDialogProps {
  template: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TemplateShareDialog: React.FC<TemplateShareDialogProps> = ({
  template,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
  const [initialTeams, setInitialTeams] = useState<string[]>([]);
  const [initialOrganizations, setInitialOrganizations] = useState<string[]>([]);

  const { addToast } = useToast();

  // API hooks
  const { data: teams = [] } = useHiringTeams();
  const { data: organizations = [] } = useOrganizations();
  const { data: templateSharing } = useGetTemplateSharing(template?.id || '');
  
  const shareWithTeamsMutation = useShareTemplateWithTeams();
  const shareWithOrgsMutation = useShareTemplateWithOrganizations();
  const removeFromTeamsMutation = useRemoveTemplateFromTeams();
  const removeFromOrgsMutation = useRemoveTemplateFromOrganizations();

  // Initialize selected items when template or sharing data changes
  useEffect(() => {
    if (template && templateSharing) {
      const teamIds = templateSharing.sharedWithTeams?.map((t: any) => t.id) || [];
      const orgIds = templateSharing.sharedWithOrganizations?.map((o: any) => o.id) || [];
      
      setSelectedTeams(teamIds);
      setSelectedOrganizations(orgIds);
      setInitialTeams(teamIds);
      setInitialOrganizations(orgIds);
    } else if (template) {
      // Fallback to template data if sharing data not available
      const teamIds = template.sharedWithTeams?.map(t => t.id) || template.teamIds || [];
      const orgIds = template.sharedWithOrganizations?.map(o => o.id) || template.organizationIds || [];
      
      setSelectedTeams(teamIds);
      setSelectedOrganizations(orgIds);
      setInitialTeams(teamIds);
      setInitialOrganizations(orgIds);
    }
  }, [template, templateSharing]);

  const handleAddTeam = (teamId: string) => {
    if (!selectedTeams.includes(teamId)) {
      setSelectedTeams(prev => [...prev, teamId]);
    }
  };

  const handleRemoveTeam = (teamId: string) => {
    setSelectedTeams(prev => prev.filter(id => id !== teamId));
  };

  const handleAddOrganization = (orgId: string) => {
    if (!selectedOrganizations.includes(orgId)) {
      setSelectedOrganizations(prev => [...prev, orgId]);
    }
  };

  const handleRemoveOrganization = (orgId: string) => {
    setSelectedOrganizations(prev => prev.filter(id => id !== orgId));
  };

  const handleSave = async () => {
    if (!template) return;

    try {
      // Calculate changes
      const teamsToAdd = selectedTeams.filter(id => !initialTeams.includes(id));
      const teamsToRemove = initialTeams.filter(id => !selectedTeams.includes(id));
      const orgsToAdd = selectedOrganizations.filter(id => !initialOrganizations.includes(id));
      const orgsToRemove = initialOrganizations.filter(id => !selectedOrganizations.includes(id));

      // Execute changes
      const promises = [];
      
      if (teamsToAdd.length > 0) {
        promises.push(shareWithTeamsMutation.mutateAsync({ 
          templateId: template.id, 
          teamIds: teamsToAdd 
        }));
      }
      
      if (teamsToRemove.length > 0) {
        promises.push(removeFromTeamsMutation.mutateAsync({ 
          templateId: template.id, 
          teamIds: teamsToRemove 
        }));
      }
      
      if (orgsToAdd.length > 0) {
        promises.push(shareWithOrgsMutation.mutateAsync({ 
          templateId: template.id, 
          organizationIds: orgsToAdd 
        }));
      }
      
      if (orgsToRemove.length > 0) {
        promises.push(removeFromOrgsMutation.mutateAsync({ 
          templateId: template.id, 
          organizationIds: orgsToRemove 
        }));
      }

      await Promise.all(promises);

      addToast({ 
        type: 'success', 
        title: 'Template sharing updated successfully' 
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      addToast({ 
        type: 'error', 
        title: 'Failed to update template sharing' 
      });
    }
  };

  const isLoading = shareWithTeamsMutation.isPending || 
                   shareWithOrgsMutation.isPending || 
                   removeFromTeamsMutation.isPending || 
                   removeFromOrgsMutation.isPending;

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50" aria-hidden="true">
      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Share Template: {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage which teams and organizations can access this template
                  </p>
                </div>
                <button
                  type="button"
                  className="ml-4 rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-4 sm:px-6 sm:pb-4 space-y-6">
              {/* Current Scope Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-900">
                      Template Scope: {template.scope.charAt(0).toUpperCase() + template.scope.slice(1)}
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {template.scope === 'personal' && 'This template is currently private to you'}
                      {template.scope === 'team' && 'This template can be shared with teams'}
                      {template.scope === 'organization' && 'This template can be shared with organizations and teams'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Teams Section */}
              {(template.scope === 'team' || template.scope === 'organization') && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm font-medium text-gray-900">Shared with Teams</h4>
                  </div>
                  
                  {/* Selected Teams */}
                  {selectedTeams.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedTeams.map(teamId => {
                        const team = teams.find(t => t.id === teamId);
                        return team ? (
                          <span
                            key={teamId}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {team.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveTeam(teamId)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  
                  {/* Add Team */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddTeam(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    defaultValue=""
                  >
                    <option value="">Add a team...</option>
                    {teams
                      .filter(team => !selectedTeams.includes(team.id))
                      .map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} {team.organizations?.[0]?.name && `(${team.organizations[0].name})`}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Organizations Section */}
              {template.scope === 'organization' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                    <h4 className="text-sm font-medium text-gray-900">Shared with Organizations</h4>
                  </div>
                  
                  {/* Selected Organizations */}
                  {selectedOrganizations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedOrganizations.map(orgId => {
                        const org = organizations.find(o => o.id === orgId);
                        return org ? (
                          <span
                            key={orgId}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                          >
                            {org.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveOrganization(orgId)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  
                  {/* Add Organization */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddOrganization(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                    defaultValue=""
                  >
                    <option value="">Add an organization...</option>
                    {organizations
                      .filter(org => !selectedOrganizations.includes(org.id))
                      .map(org => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.industry || 'Unknown Industry'})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Warning for personal scope */}
              {template.scope === 'personal' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Users className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-yellow-900">
                        Personal Template
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This template has a personal scope and cannot be shared. 
                        Edit the template and change its scope to 'Team' or 'Organization' to enable sharing.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading || template.scope === 'personal'}
                className="inline-flex w-full justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateShareDialog;
