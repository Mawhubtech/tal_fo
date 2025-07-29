import React, { useState } from 'react';
import { 
  Ticket,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Search,
  Filter,
  Mail,
  UserCheck,
  Archive,
  TrendingUp,
  BarChart3,
  Settings
} from 'lucide-react';
import { useSupportDashboard, type SupportTicket, type SupportMessage, type AdminUser } from '../../hooks/useSupportDashboard';

const SupportDashboardPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    // State
    selectedTicket,
    setSelectedTicket,
    isManaging,
    newMessage,
    setNewMessage,
    isInternal,
    setIsInternal,
    newStatus,
    setNewStatus,
    newPriority,
    setNewPriority,
    newAssignee,
    setNewAssignee,
    
    // Query hooks
    useTickets,
    useStats,
    useMessages,
    useAdminUsers,
    
    // Mutations
    addMessageMutation,
    assignTicketMutation,
    updateStatusMutation,
    updatePriorityMutation,
    
    // Helper functions
    openManageTicket,
    closeManageTicket,
    retryMessages,
  } = useSupportDashboard();

  // Use the query hooks
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets(selectedStatus, selectedPriority, searchTerm);
  const { data: statsData } = useStats();
  const { data: messagesData, isLoading: messagesLoading, error: messagesError } = useMessages();
  const { data: adminUsersData, error: adminUsersError } = useAdminUsers();

  const tickets = ticketsData?.data?.tickets || [];
  const stats = statsData?.data || {};
  const messages = messagesData?.data || [];
  const adminUsers = adminUsersData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'waiting_for_customer': return 'bg-orange-100 text-orange-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'urgent': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Settings className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <Archive className="w-4 h-4" />;
      default: return <Ticket className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage support tickets and customer inquiries</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
            <Mail className="w-4 h-4 inline mr-2" />
            Email All Users
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTickets || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open/In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats.openTickets || 0) + (stats.inProgressTickets || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolvedTickets || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageResponseTime ? `${Math.round(stats.averageResponseTime)}h` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_for_customer">Waiting for Customer</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
        </div>
        
        {ticketsLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Found</h3>
            <p className="text-gray-600">No support tickets match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket: SupportTicket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            #{ticket.ticketNumber}
                          </span>
                          {ticket.messageCount > 0 && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {ticket.messageCount}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 max-w-xs truncate">
                          {ticket.subject}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {ticket.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.requester.firstName} {ticket.requester.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {ticket.requester.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1">{ticket.status.replace('_', ' ').toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ticket.assignee ? (
                        <div className="text-sm text-gray-900">
                          {ticket.assignee.firstName} {ticket.assignee.lastName}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openManageTicket(ticket)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Manage
                        </button>
                        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ 
                              ticketId: ticket.id, 
                              status: ticket.status === 'open' ? 'in_progress' : 'resolved' 
                            })}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            {ticket.status === 'open' ? 'Start' : 'Resolve'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Management Modal */}
      {selectedTicket && isManaging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Manage Ticket #{selectedTicket.ticketNumber}
                  </h3>
                  <p className="text-gray-600 mt-1">{selectedTicket.subject}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTicket(null);
                    closeManageTicket();
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Left Panel - Ticket Details and Actions */}
              <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Customer</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">{selectedTicket.requester.firstName} {selectedTicket.requester.lastName}</span>
                      </p>
                      <p className="text-sm text-gray-600">{selectedTicket.requester.email}</p>
                    </div>
                  </div>

                  {/* Ticket Status */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Status</h4>
                    <div className="space-y-3">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_for_customer">Waiting for Customer</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      {newStatus !== selectedTicket.status && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ ticketId: selectedTicket.id, status: newStatus })}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Update Status
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Priority</h4>
                    <div className="space-y-3">
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      {newPriority !== selectedTicket.priority && (
                        <button
                          onClick={() => updatePriorityMutation.mutate({ ticketId: selectedTicket.id, priority: newPriority })}
                          className="w-full px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                        >
                          Update Priority
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Assignment */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Assignee</h4>
                    <div className="space-y-3">
                      <select
                        value={newAssignee}
                        onChange={(e) => setNewAssignee(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Unassigned</option>
                        {adminUsers.map((admin: AdminUser) => (
                          <option key={admin.id} value={admin.id}>
                            {admin.firstName} {admin.lastName}
                          </option>
                        ))}
                      </select>
                      {newAssignee !== (selectedTicket.assignee?.id || '') && (
                        <button
                          onClick={() => assignTicketMutation.mutate({ ticketId: selectedTicket.id, assigneeId: newAssignee })}
                          className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          {newAssignee ? 'Assign Ticket' : 'Unassign Ticket'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Category:</span> {selectedTicket.category}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Created:</span> {new Date(selectedTicket.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Updated:</span> {new Date(selectedTicket.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Messages */}
              <div className="flex-1 flex flex-col">
                {/* Messages Header */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                  <h4 className="font-medium text-gray-900">Conversation</h4>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Original Ticket Description */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-blue-900">
                            {selectedTicket.requester.firstName} {selectedTicket.requester.lastName}
                          </p>
                          <span className="text-xs text-blue-600">Original Request</span>
                        </div>
                        <div className="mt-2 text-sm text-blue-800">
                          <p className="font-medium mb-1">{selectedTicket.subject}</p>
                          <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          {new Date(selectedTicket.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {messagesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2 text-sm">Loading messages...</p>
                    </div>
                  ) : messagesError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600 text-sm">Error loading messages: {messagesError.message}</p>
                      <button 
                        onClick={retryMessages}
                        className="mt-2 text-purple-600 hover:text-purple-700 text-sm"
                      >
                        Retry
                      </button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No messages found</p>
                    </div>
                  ) : (
                    messages.map((message: SupportMessage) => (
                      <div
                        key={message.id}
                        className={`${
                          message.sender === 'admin' 
                            ? message.isInternal 
                              ? 'bg-yellow-50 border-yellow-200' 
                              : 'bg-purple-50 border-purple-200'
                            : 'bg-gray-50 border-gray-200'
                        } border rounded-lg p-4`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.sender === 'admin'
                                ? message.isInternal
                                  ? 'bg-yellow-100'
                                  : 'bg-purple-100'
                                : 'bg-gray-100'
                            }`}>
                              {message.sender === 'admin' ? (
                                message.isInternal ? (
                                  <UserCheck className="w-4 h-4 text-yellow-600" />
                                ) : (
                                  <UserCheck className="w-4 h-4 text-purple-600" />
                                )
                              ) : (
                                <Users className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center space-x-2">
                              <p className={`text-sm font-medium ${
                                message.sender === 'admin'
                                  ? message.isInternal
                                    ? 'text-yellow-900'
                                    : 'text-purple-900'
                                  : 'text-gray-900'
                              }`}>
                                {message.author 
                                  ? `${message.author.firstName} ${message.author.lastName}`
                                  : message.sender === 'admin' 
                                    ? 'Admin' 
                                    : 'Customer'
                                }
                              </p>
                              {message.isInternal && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  Internal Note
                                </span>
                              )}
                            </div>
                            <div className={`mt-2 text-sm ${
                              message.sender === 'admin'
                                ? message.isInternal
                                  ? 'text-yellow-800'
                                  : 'text-purple-800'
                                : 'text-gray-800'
                            }`}>
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                            <p className={`text-xs mt-2 ${
                              message.sender === 'admin'
                                ? message.isInternal
                                  ? 'text-yellow-600'
                                  : 'text-purple-600'
                                : 'text-gray-600'
                            }`}>
                              {new Date(message.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Form */}
                <div className="border-t border-gray-200 p-4 flex-shrink-0">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Internal note (not visible to customer)</span>
                      </label>
                    </div>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={isInternal ? "Add an internal note..." : "Reply to customer..."}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => addMessageMutation.mutate({
                          ticketId: selectedTicket.id,
                          content: newMessage,
                          isInternal
                        })}
                        disabled={!newMessage.trim() || addMessageMutation.isPending}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {addMessageMutation.isPending ? 'Sending...' : isInternal ? 'Add Note' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportDashboardPage;
