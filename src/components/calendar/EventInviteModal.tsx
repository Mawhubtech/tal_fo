import React, { useState } from 'react';
import { X, UserPlus, Send, Users, Mail, AlertCircle, Check } from 'lucide-react';
import { useCompanyUsers, useInviteToEvent } from '../../hooks/useCalendarInvitations';
import type { CalendarEvent } from '../../services/calendarApiService';

interface EventInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent;
}

interface InviteeItem {
  id: string;
  email: string;
  name: string;
  isExternal: boolean;
  userId?: string;
}

export const EventInviteModal: React.FC<EventInviteModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const [selectedInvitees, setSelectedInvitees] = useState<InviteeItem[]>([]);
  const [externalEmail, setExternalEmail] = useState('');
  const [externalName, setExternalName] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [showExternalForm, setShowExternalForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: companyUsersData, isLoading: loadingUsers, error: usersError } = useCompanyUsers();
  const inviteToEventMutation = useInviteToEvent();

  const companyUsers = companyUsersData?.users || [];

  // Filter users who are not already attendees or selected
  const availableUsers = companyUsers.filter(user => {
    const isAlreadyAttendee = event.attendees?.some(attendee => attendee.id === user.id) || false;
    const isAlreadySelected = selectedInvitees.some(invitee => invitee.userId === user.id);
    const matchesSearch = searchTerm === '' || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return !isAlreadyAttendee && !isAlreadySelected && matchesSearch;
  });

  const handleAddCompanyUser = (user: typeof companyUsers[0]) => {
    const invitee: InviteeItem = {
      id: `user-${user.id}`,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      isExternal: false,
      userId: user.id
    };
    setSelectedInvitees(prev => [...prev, invitee]);
    setSearchTerm('');
  };

  const handleAddExternalUser = () => {
    if (!externalEmail.trim()) return;

    const invitee: InviteeItem = {
      id: `external-${Date.now()}`,
      email: externalEmail.trim(),
      name: externalName.trim() || externalEmail.trim(),
      isExternal: true
    };

    setSelectedInvitees(prev => [...prev, invitee]);
    setExternalEmail('');
    setExternalName('');
    setShowExternalForm(false);
  };

  const handleRemoveInvitee = (inviteeId: string) => {
    setSelectedInvitees(prev => prev.filter(invitee => invitee.id !== inviteeId));
  };

  const handleSendInvitations = async () => {
    if (selectedInvitees.length === 0) return;

    try {
      await inviteToEventMutation.mutateAsync({
        eventId: event.id,
        invitees: selectedInvitees.map(invitee => ({
          email: invitee.email,
          name: invitee.name,
          userId: invitee.userId,
          isExternal: invitee.isExternal
        })),
        message: inviteMessage.trim() || undefined,
        sendEmail: true
      });

      // Reset form and close modal
      setSelectedInvitees([]);
      setInviteMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to send invitations:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Invite to Event</h2>
              <p className="text-sm text-gray-600">{event.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Current Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Current Attendees</h3>
              <div className="flex flex-wrap gap-2">
                {event.attendees.map((attendee) => (
                  <div key={attendee.id} className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <Check className="w-3 h-3" />
                    {attendee.firstName} {attendee.lastName}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Invitees */}
          {selectedInvitees.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Selected to Invite</h3>
              <div className="space-y-2">
                {selectedInvitees.map((invitee) => (
                  <div key={invitee.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {invitee.isExternal ? (
                        <Mail className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Users className="w-4 h-4 text-purple-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{invitee.name}</p>
                        <p className="text-xs text-gray-600">{invitee.email}</p>
                        {invitee.isExternal && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            External
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveInvitee(invitee.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Company Users */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Invite Team Members</h3>
              <button
                onClick={() => setShowExternalForm(!showExternalForm)}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
              >
                <Mail className="w-4 h-4" />
                Invite External Person
              </button>
            </div>

            {/* Search Company Users */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Company Users List */}
            {loadingUsers ? (
              <div className="text-center py-4 text-gray-500">Loading team members...</div>
            ) : usersError ? (
              <div className="text-center py-4 text-red-500">
                Error loading team members: {usersError.message}
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchTerm ? 'No team members found matching your search.' : 'No available team members to invite.'}
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAddCompanyUser(user)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left transition-colors"
                  >
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* External User Form */}
          {showExternalForm && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Invite External Person</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={externalEmail}
                    onChange={(e) => setExternalEmail(e.target.value)}
                    placeholder="example@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={externalName}
                    onChange={(e) => setExternalName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddExternalUser}
                    disabled={!externalEmail.trim()}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowExternalForm(false);
                      setExternalEmail('');
                      setExternalName('');
                    }}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invitation Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Custom Message (Optional)
            </label>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={3}
              placeholder="Add a personal message to your invitation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Email notifications will be sent to all invitees.</p>
              <p className="mt-1">Company members will see the invitation in their dashboard and can accept/decline. External invitees will receive email invitations.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            {selectedInvitees.length} {selectedInvitees.length === 1 ? 'person' : 'people'} selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvitations}
              disabled={selectedInvitees.length === 0 || inviteToEventMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviteToEventMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Invitations
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
