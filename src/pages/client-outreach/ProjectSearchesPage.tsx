import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Filter, MoreVertical, Play, Pause, Eye, Edit, Trash2 } from 'lucide-react';
import { useClientOutreachProject } from '../../hooks/useClientOutreachProjects';
import { useClientOutreachProjectSearches, useRunClientOutreachSearch, useDeleteClientOutreachSearch } from '../../hooks/useClientOutreachSearches';
import { ClientOutreachSearch } from '../../services/clientOutreachProjectApiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationModal from '../../components/ConfirmationModal';

const SearchCard: React.FC<{ 
  search: ClientOutreachSearch; 
  onRun: (id: string) => void; 
  onDelete: (id: string) => void;
}> = ({ search, onRun, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{search.name}</h3>
            {search.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{search.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(search.status)}`}>
              <span className="capitalize">{search.status}</span>
            </span>
            <div className="relative group">
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={() => onRun(search.id)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Search
                </button>
                <Link
                  to={`/dashboard/client-outreach/searches/${search.id}/edit`}
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

        {/* Search Criteria Summary */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Industries:</span>
              <span className="ml-2 text-gray-900">
                {search.searchCriteria.industries?.length 
                  ? search.searchCriteria.industries.slice(0, 2).join(', ') + 
                    (search.searchCriteria.industries.length > 2 ? ` +${search.searchCriteria.industries.length - 2}` : '')
                  : 'Any'
                }
              </span>
            </div>
            <div>
              <span className="text-gray-500">Company Size:</span>
              <span className="ml-2 text-gray-900">
                {search.searchCriteria.companySize?.length 
                  ? search.searchCriteria.companySize.slice(0, 2).join(', ') + 
                    (search.searchCriteria.companySize.length > 2 ? ` +${search.searchCriteria.companySize.length - 2}` : '')
                  : 'Any'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {search.results?.totalFound || 0}
            </div>
            <div className="text-xs text-gray-500">Found</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {search.results?.totalAdded || 0}
            </div>
            <div className="text-xs text-gray-500">Added</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {search.results?.avgCompanyScore ? search.results.avgCompanyScore.toFixed(1) : '0'}
            </div>
            <div className="text-xs text-gray-500">Avg Score</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {search.results?.lastRunAt 
              ? `Last run: ${new Date(search.results.lastRunAt).toLocaleDateString()}`
              : 'Never run'
            }
          </div>
          <div className="flex space-x-2">
            <Link
              to={`/dashboard/client-outreach/searches/${search.id}`}
              className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Link>
            <button
              onClick={() => onRun(search.id)}
              className="inline-flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
            >
              <Play className="w-3 h-3 mr-1" />
              Run
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onDelete(search.id);
          setShowDeleteModal(false);
        }}
        title="Delete Search"
        message={`Are you sure you want to delete "${search.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

const ProjectSearchesPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { data: project } = useClientOutreachProject(projectId!);
  const { data: searches = [], isLoading } = useClientOutreachProjectSearches(projectId!);
  const runSearchMutation = useRunClientOutreachSearch();
  const deleteSearchMutation = useDeleteClientOutreachSearch();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSearches = searches.filter(search => {
    const matchesStatus = statusFilter === 'all' || search.status === statusFilter;
    const matchesSearch = !searchTerm || 
      search.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      search.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleRunSearch = async (searchId: string) => {
    try {
      await runSearchMutation.mutateAsync(searchId);
    } catch (error) {
      console.error('Failed to run search:', error);
    }
  };

  const handleDeleteSearch = async (searchId: string) => {
    try {
      await deleteSearchMutation.mutateAsync(searchId);
    } catch (error) {
      console.error('Failed to delete search:', error);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Searches</h1>
            <p className="text-gray-600">{project?.name}</p>
          </div>
        </div>
        <Link
          to={`/dashboard/client-outreach/projects/${projectId}/searches/create`}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Search
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or description..."
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
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Searches Grid */}
      {filteredSearches.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searches.length === 0 ? 'No searches yet' : 'No searches match your filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searches.length === 0 
              ? 'Create your first search to start finding potential clients.'
              : 'Try adjusting your search criteria or filters.'
            }
          </p>
          {searches.length === 0 && (
            <Link
              to={`/dashboard/client-outreach/projects/${projectId}/searches/create`}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Search
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSearches.map((search) => (
            <SearchCard
              key={search.id}
              search={search}
              onRun={handleRunSearch}
              onDelete={handleDeleteSearch}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectSearchesPage;
