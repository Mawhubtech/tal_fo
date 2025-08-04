import React, { useState } from 'react';
import { X, Building2, Plus, Minus, Search, Users } from 'lucide-react';
import { useTeamClients, useAvailableClientsForTeam, useAssignClientsToTeam, useRemoveClientsFromTeam } from '../../hooks/useHiringTeam';
import { toast } from '../ToastContainer';
import { formatApiError } from '../../utils/errorUtils';

interface ClientManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

interface Client {
  id: string;
  name: string;
  industry?: string;
  status: string;
}

export const ClientManagementModal: React.FC<ClientManagementModalProps> = ({
  isOpen,
  onClose,
  teamId,
  teamName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const { data: teamClients = [], isLoading: loadingTeamClients, refetch: refetchTeamClients } = useTeamClients(teamId);
  const { data: availableClients = [], isLoading: loadingAvailableClients } = useAvailableClientsForTeam(teamId);
  const assignClientsMutation = useAssignClientsToTeam();
  const removeClientsMutation = useRemoveClientsFromTeam();

  const filteredAvailableClients = availableClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeamClients = teamClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignClients = async () => {
    if (selectedClients.length === 0) return;

    try {
      setIsAssigning(true);
      await assignClientsMutation.mutateAsync({
        teamId,
        clientIds: selectedClients
      });
      
      toast.success('Organizations Assigned', `${selectedClients.length} organization${selectedClients.length !== 1 ? 's' : ''} assigned to ${teamName} successfully.`);
      setSelectedClients([]);
      refetchTeamClients();
    } catch (error: any) {
      console.error('Error assigning organizations:', error);
      const errorMessage = formatApiError(error);
      toast.error('Assignment Failed', errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveClient = async (clientId: string) => {
    try {
      await removeClientsMutation.mutateAsync({
        teamId,
        clientIds: [clientId]
      });
      
      const client = teamClients.find(c => c.id === clientId);
      toast.success('Organization Removed', `${client?.name || 'Organization'} removed from ${teamName} successfully.`);
      refetchTeamClients();
    } catch (error: any) {
      console.error('Error removing organization:', error);
      const errorMessage = formatApiError(error);
      toast.error('Removal Failed', errorMessage);
    }
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Manage Organizations</h2>
            <p className="text-sm text-gray-600 mt-1">Assign and manage organizations for {teamName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Organizations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Available Organizations</h3>
                {selectedClients.length > 0 && (
                  <button
                    onClick={handleAssignClients}
                    disabled={isAssigning}
                    className="flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Assign ({selectedClients.length})
                  </button>
                )}
              </div>

              {loadingAvailableClients ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : filteredAvailableClients.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredAvailableClients.map((client) => (
                    <div
                      key={client.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedClients.includes(client.id)
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleClientSelection(client.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          {client.industry && (
                            <p className="text-sm text-gray-500">{client.industry}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.id)}
                          onChange={() => toggleClientSelection(client.id)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No available organizations found</p>
                </div>
              )}
            </div>

            {/* Assigned Organizations */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Assigned Organizations ({teamClients.length})
              </h3>

              {loadingTeamClients ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : filteredTeamClients.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredTeamClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          {client.industry && (
                            <p className="text-sm text-gray-500">{client.industry}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                        <button
                          onClick={() => handleRemoveClient(client.id)}
                          disabled={removeClientsMutation.isPending}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                          title="Remove organization from team"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No organizations assigned to this team</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
