import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Phone,
  ExternalLink,
  Download,
  CheckSquare,
  Square
} from 'lucide-react';
import { useClientOutreachProject } from '../../hooks/useClientOutreachProjects';
import { 
  useClientOutreachProjectProspects, 
  useUpdateClientProspect, 
  useDeleteClientProspect,
  useBulkUpdateClientProspects,
  useExportClientProspects
} from '../../hooks/useClientOutreachProspects';
import { ClientProspect } from '../../services/clientOutreachProjectApiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModal';

const ProspectCard: React.FC<{ 
  prospect: ClientProspect; 
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, data: Partial<ClientProspect>) => void; 
  onDelete: (id: string) => void;
}> = ({ prospect, isSelected, onSelect, onUpdate, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'meeting-scheduled': return 'bg-purple-100 text-purple-800';
      case 'proposal-sent': return 'bg-indigo-100 text-indigo-800';
      case 'negotiating': return 'bg-orange-100 text-orange-800';
      case 'closed-won': return 'bg-green-200 text-green-900';
      case 'closed-lost': return 'bg-red-100 text-red-800';
      case 'not-interested': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <button
              onClick={() => onSelect(prospect.id)}
              className="mt-1 text-gray-400 hover:text-purple-600"
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-purple-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {prospect.companyName}
              </h3>
              {prospect.industry && (
                <p className="text-sm text-gray-600">{prospect.industry}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prospect.status)}`}>
              <span className="capitalize">{prospect.status.replace('-', ' ')}</span>
            </span>
            <div className="relative group">
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <Link
                  to={`/dashboard/client-outreach/prospects/${prospect.id}`}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Link>
                <Link
                  to={`/dashboard/client-outreach/prospects/${prospect.id}/edit`}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="mb-4 space-y-2">
          {prospect.location && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Location:</span> {prospect.location}
            </div>
          )}
          {prospect.companySize && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Size:</span> {prospect.companySize}
            </div>
          )}
          {prospect.revenue && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Revenue:</span> ${prospect.revenue.amount?.toLocaleString()} {prospect.revenue.currency}
            </div>
          )}
        </div>

        {/* Contact Person */}
        {prospect.contactPerson && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-900 mb-1">
              {prospect.contactPerson.name}
            </div>
            {prospect.contactPerson.title && (
              <div className="text-sm text-gray-600 mb-2">
                {prospect.contactPerson.title}
              </div>
            )}
            <div className="flex space-x-3">
              {prospect.contactPerson.email && (
                <a
                  href={`mailto:${prospect.contactPerson.email}`}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </a>
              )}
              {prospect.contactPerson.phone && (
                <a
                  href={`tel:${prospect.contactPerson.phone}`}
                  className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </a>
              )}
              {prospect.contactPerson.linkedinUrl && (
                <a
                  href={prospect.contactPerson.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        )}

        {/* Tags and Priority */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(prospect.priority)}`}>
              {prospect.priority}
            </span>
            {prospect.score && (
              <span className="text-sm text-gray-600">
                Score: {prospect.score}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {prospect.tags?.slice(0, 2).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {tag}
              </span>
            ))}
            {prospect.tags && prospect.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                +{prospect.tags.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Deal Value */}
        {prospect.dealValue && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Deal Value:</span> ${prospect.dealValue.amount?.toLocaleString()} {prospect.dealValue.currency}
            </div>
          </div>
        )}

        {/* Last Contact */}
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          {prospect.lastContactDate 
            ? `Last contact: ${new Date(prospect.lastContactDate).toLocaleDateString()}`
            : 'No contact yet'
          }
          {prospect.nextFollowUpDate && (
            <span className="ml-3">
              Next follow-up: {new Date(prospect.nextFollowUpDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onDelete(prospect.id);
          setShowDeleteModal(false);
        }}
        title="Delete Prospect"
        message={`Are you sure you want to delete "${prospect.companyName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

const ProjectProspectsPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: project } = useClientOutreachProject(projectId!);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProspects, setSelectedProspects] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');

  // Build filters
  const filters = {
    ...(statusFilter !== 'all' && { status: [statusFilter] }),
    ...(priorityFilter !== 'all' && { priority: [priorityFilter] }),
    ...(searchTerm && { search: searchTerm }),
  };

  const { data: prospectsData, isLoading } = useClientOutreachProjectProspects(
    projectId!,
    currentPage,
    12,
    filters
  );
  const updateProspectMutation = useUpdateClientProspect();
  const deleteProspectMutation = useDeleteClientProspect();
  const bulkUpdateMutation = useBulkUpdateClientProspects();
  const exportMutation = useExportClientProspects();

  const prospects = prospectsData?.prospects || [];
  const totalPages = Math.ceil((prospectsData?.total || 0) / 12);

  const handleSelectProspect = (prospectId: string) => {
    setSelectedProspects(prev => 
      prev.includes(prospectId) 
        ? prev.filter(id => id !== prospectId)
        : [...prev, prospectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProspects.length === prospects.length) {
      setSelectedProspects([]);
    } else {
      setSelectedProspects(prospects.map(p => p.id));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedProspects.length === 0 || !bulkStatus) return;

    try {
      await bulkUpdateMutation.mutateAsync({
        prospectIds: selectedProspects,
        updates: { status: bulkStatus as any }
      });
      setSelectedProspects([]);
      setShowBulkActions(false);
      setBulkStatus('');
    } catch (error) {
      console.error('Failed to bulk update prospects:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx' = 'csv') => {
    try {
      await exportMutation.mutateAsync({
        projectId: projectId!,
        format,
        filters
      });
    } catch (error) {
      console.error('Failed to export prospects:', error);
    }
  };

  const handleUpdateProspect = async (prospectId: string, data: Partial<ClientProspect>) => {
    try {
      await updateProspectMutation.mutateAsync({ id: prospectId, data });
    } catch (error) {
      console.error('Failed to update prospect:', error);
    }
  };

  const handleDeleteProspect = async (prospectId: string) => {
    try {
      await deleteProspectMutation.mutateAsync(prospectId);
    } catch (error) {
      console.error('Failed to delete prospect:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link
            to={`/dashboard/client-outreach/projects/${projectId}`}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Prospects</h1>
            <p className="text-gray-600">{project?.name}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={exportMutation.isPending}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={exportMutation.isPending}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="responded">Responded</option>
              <option value="meeting-scheduled">Meeting Scheduled</option>
              <option value="proposal-sent">Proposal Sent</option>
              <option value="negotiating">Negotiating</option>
              <option value="closed-won">Closed Won</option>
              <option value="closed-lost">Closed Lost</option>
              <option value="not-interested">Not Interested</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          {selectedProspects.length > 0 && (
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Bulk Actions ({selectedProspects.length})
            </button>
          )}
        </div>

        {/* Bulk Actions */}
        {showBulkActions && selectedProspects.length > 0 && (
          <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
            <span className="text-sm text-purple-800">
              {selectedProspects.length} prospect(s) selected
            </span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="border border-purple-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select status to update</option>
              <option value="contacted">Contacted</option>
              <option value="responded">Responded</option>
              <option value="meeting-scheduled">Meeting Scheduled</option>
              <option value="proposal-sent">Proposal Sent</option>
              <option value="negotiating">Negotiating</option>
              <option value="closed-won">Closed Won</option>
              <option value="closed-lost">Closed Lost</option>
              <option value="not-interested">Not Interested</option>
            </select>
            <button
              onClick={handleBulkUpdate}
              disabled={!bulkStatus || bulkUpdateMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Status
            </button>
            <button
              onClick={() => setShowBulkActions(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Select All */}
        <div className="flex items-center space-x-2 mt-4">
          <button
            onClick={handleSelectAll}
            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800"
          >
            {selectedProspects.length === prospects.length ? (
              <CheckSquare className="w-4 h-4 mr-1" />
            ) : (
              <Square className="w-4 h-4 mr-1" />
            )}
            Select All ({prospects.length})
          </button>
        </div>
      </div>

      {/* Prospects Grid */}
      {prospects.length === 0 ? (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {prospectsData?.total === 0 ? 'No prospects yet' : 'No prospects match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {prospectsData?.total === 0 
              ? 'Run searches to start finding potential clients.'
              : 'Try adjusting your search criteria or filters.'
            }
          </p>
          {prospectsData?.total === 0 && (
            <Link
              to={`/dashboard/client-outreach/projects/${projectId}/searches/create`}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Create Search
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {prospects.map((prospect) => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                isSelected={selectedProspects.includes(prospect.id)}
                onSelect={handleSelectProspect}
                onUpdate={handleUpdateProspect}
                onDelete={handleDeleteProspect}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 2 && page <= currentPage + 2)
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] < page - 1 && (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-lg ${
                        currentPage === page
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectProspectsPage;
