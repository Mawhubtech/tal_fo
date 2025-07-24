import React, { useState, useEffect, useRef } from 'react';
import { 
  Building, 
  MapPin, 
  Users, 
  ExternalLink, 
  Globe,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { ClientOutreachProspect } from './pipeline/ClientOutreachKanbanView';
import { Pipeline } from '../../../services/pipelineService';

interface ClientOutreachListViewProps {
  prospects: ClientOutreachProspect[];
  pipeline: Pipeline;
  onProspectClick?: (prospect: ClientOutreachProspect) => void;
  onProspectStageChange?: (prospectId: string, newStage: string) => void;
  onProspectRemove?: (prospect: ClientOutreachProspect) => void;
}

type SortField = 'companyName' | 'industry' | 'location' | 'employeeCount' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 25;

// Function to get company logo URL
const getCompanyLogoUrl = (companyName: string, website?: string) => {
  if (website) {
    // Extract domain from website URL
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      const domain = url.hostname.replace('www.', '');
      return `https://logo.clearbit.com/${domain}`;
    } catch {
      // Fallback to company name based lookup
    }
  }
  
  // Fallback: try to construct domain from company name
  const cleanName = companyName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/(inc|llc|corp|ltd|company|co)$/, '');
  
  return `https://logo.clearbit.com/${cleanName}.com`;
};

const getStatusColor = (stageName: string) => {
  switch (stageName.toLowerCase()) {
    case 'new':
    case 'lead':
    case 'initial contact':
      return 'bg-purple-100 text-purple-800';
    case 'contacted':
    case 'follow up':
      return 'bg-blue-100 text-blue-800';
    case 'responded':
    case 'qualified':
      return 'bg-green-100 text-green-800';
    case 'meeting_scheduled':
    case 'meeting scheduled':
    case 'proposal sent':
      return 'bg-yellow-100 text-yellow-800';
    case 'closed won':
    case 'converted':
      return 'bg-emerald-100 text-emerald-800';
    case 'unqualified':
    case 'closed lost':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-purple-100 text-purple-800';
  }
};

export const ClientOutreachListView: React.FC<ClientOutreachListViewProps> = ({
  prospects,
  pipeline,
  onProspectClick,
  onProspectStageChange,
  onProspectRemove
}) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const stages = pipeline.stages.sort((a, b) => a.order - b.order);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset page when prospects change
  useEffect(() => {
    setCurrentPage(1);
  }, [prospects]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const sortedProspects = [...prospects].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle special cases
    if (sortField === 'createdAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

    // String comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination calculations
  const totalItems = sortedProspects.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProspects = sortedProspects.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStageName = (prospect: ClientOutreachProspect) => {
    if (prospect.currentStage) {
      return prospect.currentStage.name;
    }
    if (prospect.currentStageId) {
      const stage = stages.find(s => s.id === prospect.currentStageId);
      return stage?.name || 'Unknown';
    }
    return 'New';
  };

  const getStageValue = (prospect: ClientOutreachProspect) => {
    if (prospect.currentStageId) {
      return prospect.currentStageId;
    }
    if (prospect.currentStage?.id) {
      return prospect.currentStage.id;
    }
    // Fallback to first stage if no stage is set
    return stages[0]?.id || '';
  };

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode; className?: string }> = ({ 
    field, 
    children, 
    className = '' 
  }) => (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="companyName">Company</SortableHeader>
              <SortableHeader field="industry">Industry</SortableHeader>
              <SortableHeader field="location">Location</SortableHeader>
              <SortableHeader field="employeeCount">Size</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <SortableHeader field="createdAt">Added</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Links
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedProspects.map((prospect) => (
              <tr 
                key={prospect.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onProspectClick?.(prospect)}
              >
                {/* Company Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 mr-3 flex-shrink-0">
                      <img
                        src={getCompanyLogoUrl(prospect.companyName, prospect.website)}
                        alt={`${prospect.companyName} logo`}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        onError={(e) => {
                          // Fallback to building icon if logo fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                        <Building className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {prospect.companyName}
                      </div>
                      {prospect.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {prospect.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Industry */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {prospect.industry || '-'}
                </td>

                {/* Location */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    {prospect.location && (
                      <>
                        <MapPin className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
                        {prospect.location}
                      </>
                    )}
                    {!prospect.location && '-'}
                  </div>
                </td>

                {/* Size */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    {(prospect.employeeCount || prospect.sizeRange) && (
                      <>
                        <Users className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
                        {prospect.employeeCount ? 
                          `${prospect.employeeCount.toLocaleString()}` : 
                          prospect.sizeRange
                        }
                      </>
                    )}
                    {!prospect.employeeCount && !prospect.sizeRange && '-'}
                  </div>
                </td>

                {/* Stage */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <select
                      value={getStageValue(prospect)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onProspectStageChange?.(prospect.id, e.target.value);
                      }}
                      className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer ${getStatusColor(getStageName(prospect))}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>

                {/* Added Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(prospect.createdAt).toLocaleDateString()}
                </td>

                {/* Links */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    {prospect.website && (
                      <a
                        href={prospect.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:text-blue-700"
                        title="Visit website"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                    {prospect.linkedinUrl && (
                      <a
                        href={prospect.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:text-blue-700"
                        title="LinkedIn profile"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative" ref={openDropdownId === prospect.id ? dropdownRef : undefined}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === prospect.id ? null : prospect.id);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    
                    {openDropdownId === prospect.id && (
                      <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onProspectClick?.(prospect);
                              setOpenDropdownId(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement edit functionality
                              setOpenDropdownId(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onProspectRemove?.(prospect);
                              setOpenDropdownId(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {paginatedProspects.length === 0 && prospects.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prospects found</h3>
          <p className="text-gray-500">No prospects match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default ClientOutreachListView;
