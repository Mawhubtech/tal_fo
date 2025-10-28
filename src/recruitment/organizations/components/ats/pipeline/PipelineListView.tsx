import React, { useState } from 'react';
import { Calendar, Mail, Phone, Star, Tag, MapPin, ChevronDown, Trash2, ExternalLink, Briefcase, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Candidate } from '../../../data/mock';
import type { Pipeline } from '../../../../../services/pipelineService';
import { getScoreColor, getStageColor } from '../shared';

interface PipelineListViewProps {
  candidates: Candidate[];
  pipeline?: Pipeline | null;
  onCandidateClick?: (candidate: Candidate) => void;
  onCandidateStageChange?: (candidateId: string, newStage: string) => void;
  onCandidateRemove?: (candidate: Candidate) => void;
  onCandidateUpdate?: (candidate: Candidate) => void;
  sortBy?: 'date-desc' | 'date-asc' | 'score-desc' | 'score-asc';
}

// Star Rating Component
const StarRating: React.FC<{
  rating: number;
  maxRating?: number;
  onChange: (rating: number) => void;
  readonly?: boolean;
  isLoading?: boolean;
}> = ({ rating, maxRating = 5, onChange, readonly = false, isLoading = false }) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  const displayRating = hoverRating !== null ? hoverRating : rating;
  const starCount = 5; // Display as 5 stars (each star represents 1 point)
  
  const handleClick = (starIndex: number) => {
    if (readonly || isLoading) return;
    const newRating = starIndex + 1;
    onChange(newRating);
  };
  
  const renderStar = (index: number) => {
    const starValue = index + 1;
    const isFilled = displayRating >= starValue;
    
    return (
      <button
        key={index}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleClick(index);
        }}
        onMouseEnter={() => !readonly && !isLoading && setHoverRating(index + 1)}
        onMouseLeave={() => !readonly && !isLoading && setHoverRating(null)}
        className={`focus:outline-none transition-transform ${
          readonly || isLoading ? 'cursor-default' : 'cursor-pointer hover:scale-110'
        } ${isLoading ? 'opacity-50' : ''}`}
        disabled={readonly || isLoading}
      >
        {isFilled ? (
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ) : (
          <Star className="w-5 h-5 text-gray-300" />
        )}
      </button>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
        <span className="text-xs text-gray-500 font-medium">Updating...</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: starCount }, (_, i) => renderStar(i))}
      <span className="ml-2 text-xs text-gray-500 font-medium min-w-[20px]">
        {displayRating > 0 ? `${displayRating}/5` : '-'}
      </span>
    </div>
  );
};

export const PipelineListView: React.FC<PipelineListViewProps> = ({
  candidates,
  pipeline,
  onCandidateClick,
  onCandidateStageChange,
  onCandidateRemove,
  onCandidateUpdate,
  sortBy = 'date-desc'
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Track which candidate's rating is being updated
  const [updatingRatingId, setUpdatingRatingId] = useState<string | null>(null);
  
  // Don't re-sort here - candidates are already sorted by PipelineTab based on sortBy prop
  // Just use the candidates as they come in
  const sortedCandidates = candidates;
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCandidates = sortedCandidates.slice(startIndex, endIndex);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Reset to page 1 when candidates change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [candidates.length]);
  // Get stages from pipeline, sorted by order
  const stages = pipeline?.stages
    ?.filter(stage => stage.isActive)
    ?.sort((a, b) => a.order - b.order)
    ?.map(stage => stage.name) || [];

  // Helper function to generate initials from name
  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return '?';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Handle stage change
  const handleStageChange = (candidateId: string, newStage: string) => {
    if (onCandidateStageChange) {
      onCandidateStageChange(candidateId, newStage);
    }
  };

  // Handle rating change
  const handleRatingChange = async (candidate: Candidate, newRating: number) => {
    if (onCandidateUpdate) {
      setUpdatingRatingId(candidate.id);
      try {
        const updatedCandidate = { ...candidate, score: newRating };
        await onCandidateUpdate(updatedCandidate);
      } finally {
        // Keep loading state for a brief moment to show feedback
        setTimeout(() => {
          setUpdatingRatingId(null);
        }, 300);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experience
              </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skills
              </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedCandidates.map((candidate) => (
              <tr
                key={candidate.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onCandidateClick?.(candidate)}
              >                {/* Candidate */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center bg-purple-100">
                      {candidate.avatar ? (
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-purple-600 font-medium text-sm">
                          {getInitials(candidate.name)}
                        </span>
                      )}
                    </div>
                    <div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          onCandidateClick?.(candidate);
                        }}
                        className="text-sm font-medium text-gray-900 hover:text-purple-600 hover:underline cursor-pointer transition-colors text-left"
                        title="Click to view full profile"
                      >
                        {candidate.name}
                      </button>
                      {candidate.position && (
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {candidate.position}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {candidate.phone && (
                      <div className="text-sm text-gray-900 flex items-center">
                        <Phone className="w-3 h-3 mr-1 text-gray-400" />
                        {candidate.phone}
                      </div>
                    )}
                    {candidate.email && (
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="w-3 h-3 mr-1 text-gray-400" />
                        {candidate.email}
                      </div>
                    )}
                    {candidate.linkedIn && (
                      <a
                        href={candidate.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center hover:underline"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </td>

                {/* Location */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {candidate.location && (
                    <div className="text-sm text-gray-900 flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="truncate max-w-[200px]" title={candidate.location}>
                        {candidate.location}
                      </span>
                    </div>
                  )}
                  {!candidate.location && (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>

                {/* Experience - Hidden */}
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  {candidate.notesData?.yearsOfExperience && (
                    <div className="text-sm text-gray-900">
                      {candidate.notesData.yearsOfExperience} {candidate.notesData.yearsOfExperience === 1 ? 'year' : 'years'}
                    </div>
                  )}
                  {candidate.notesData?.department && (
                    <div className="text-xs text-gray-500 mt-1">
                      {candidate.notesData.department}
                    </div>
                  )}
                  {!candidate.notesData?.yearsOfExperience && !candidate.notesData?.department && (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td> */}

                {/* Stage */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <select
                      value={candidate.stage}
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleStageChange(candidate.id, e.target.value);
                      }}
                      className={`appearance-none bg-transparent border-0 pr-8 pl-3 py-1 text-xs font-semibold rounded-full border-l-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${getStageColor(candidate.stage, pipeline)}`}
                      onClick={(e) => e.stopPropagation()} // Prevent row click when clicking dropdown
                    >
                      {stages.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                  </div>
                </td>

                {/* Rating */}
                <td 
                  className="px-6 py-4 whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()} // Prevent row click when interacting with rating
                >
                  <StarRating
                    rating={candidate.score || 0}
                    onChange={(newRating) => handleRatingChange(candidate, newRating)}
                    isLoading={updatingRatingId === candidate.id}
                  />
                </td>

                {/* Skills/Tags - Hidden */}
                {/* <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {candidate.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {candidate.tags.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{candidate.tags.length - 2} more
                      </span>
                    )}
                  </div>
                </td> */}

                {/* Applied Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(candidate.appliedDate).toLocaleDateString()}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      onCandidateRemove?.(candidate);
                    }}
                    className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded transition-colors"
                    title="Remove candidate from this job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sortedCandidates.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedCandidates.length)} of {sortedCandidates.length} candidates
            </p>
            <p className="text-xs text-gray-500">
              Sorted by: {
                sortBy === 'date-desc' ? 'Date: Newest First' :
                sortBy === 'date-asc' ? 'Date: Oldest First' :
                sortBy === 'score-desc' ? 'Rating: Highest First' :
                'Rating: Lowest First'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-purple-600 text-white font-medium'
                        : 'border border-gray-300 hover:bg-white text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedCandidates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MapPin className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
          <p className="text-gray-500">Try adjusting your search or filters to see more results.</p>
        </div>
      )}
    </div>
  );
};
