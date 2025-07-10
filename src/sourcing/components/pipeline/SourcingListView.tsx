import React from 'react';
import { Calendar, Mail, Phone, Star, Tag, MapPin, ChevronDown, Trash2 } from 'lucide-react';
import type { Pipeline } from '../../../services/pipelineService';
import { getScoreColor, getStageColor } from '../../../recruitment/organizations/components/ats/shared';

// Sourcing-specific candidate interface
interface SourcingCandidate {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  stage: string;
  score: number; // This represents prospect rating
  lastUpdated: string;
  tags: string[];
  source: string;
  appliedDate: string;
  candidateRating?: number; // Overall candidate rating from database
}

interface SourcingListViewProps {
  candidates: SourcingCandidate[];
  pipeline?: Pipeline | null;
  onCandidateClick?: (candidate: SourcingCandidate) => void;
  onCandidateStageChange?: (candidateId: string, newStage: string) => void;
  onCandidateRemove?: (candidate: SourcingCandidate) => void;
}

export const SourcingListView: React.FC<SourcingListViewProps> = ({
  candidates,
  pipeline,
  onCandidateClick,
  onCandidateStageChange,
  onCandidateRemove
}) => {
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

  // Render star rating for prospect score
  const renderProspectRating = (rating: number) => {
    // Ensure rating is a valid number
    const validRating = typeof rating === 'number' && !isNaN(rating) ? Math.max(0, Math.min(5, rating)) : 0;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.floor(validRating);
          const isHalf = star === Math.floor(validRating) + 1 && validRating % 1 >= 0.5;
          
          return (
            <div key={star} className="relative w-4 h-4">
              {/* Background (empty) star */}
              <Star className="w-4 h-4 text-gray-300 absolute" />
              
              {/* Filled or half-filled star */}
              {(isFilled || isHalf) && (
                <div 
                  className="absolute overflow-hidden"
                  style={{ 
                    width: isHalf ? '50%' : '100%',
                    height: '100%'
                  }}
                >
                  <Star className="w-4 h-4 text-purple-400 fill-current" />
                </div>
              )}
            </div>
          );
        })}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {validRating > 0 ? validRating.toFixed(1) : 'No rating'}
        </span>
      </div>
    );
  };

  // Render star rating for overall candidate score
  const renderCandidateRating = (rating?: number) => {
    if (!rating || typeof rating !== 'number' || isNaN(rating) || rating <= 0) {
      return (
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} className="relative w-4 h-4">
              <Star className="w-4 h-4 text-gray-300" />
            </div>
          ))}
          <span className="ml-2 text-sm text-gray-500">No rating</span>
        </div>
      );
    }

    // Ensure rating is within valid range
    const validRating = Math.max(0, Math.min(5, rating));

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.floor(validRating);
          const isHalf = star === Math.floor(validRating) + 1 && validRating % 1 >= 0.5;
          
          return (
            <div key={star} className="relative w-4 h-4">
              {/* Background (empty) star */}
              <Star className="w-4 h-4 text-gray-300 absolute" />
              
              {/* Filled or half-filled star */}
              {(isFilled || isHalf) && (
                <div 
                  className="absolute overflow-hidden"
                  style={{ 
                    width: isHalf ? '50%' : '100%',
                    height: '100%'
                  }}
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
              )}
            </div>
          );
        })}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {validRating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prospect
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prospect Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Added
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates.map((candidate) => (
              <tr
                key={candidate.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onCandidateClick?.(candidate)}
              >
                {/* Prospect */}
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
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {candidate.email}
                      </div>
                    </div>
                  </div>
                </td>

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

                {/* Candidate Rating (Yellow Stars) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderCandidateRating(candidate.candidateRating)}
                </td>

                {/* Prospect Rating (Purple Stars with Half Stars) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderProspectRating(candidate.score)}
                </td>

                {/* Contact */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center mb-1">
                    <Phone className="w-3 h-3 mr-1 text-gray-400" />
                    {candidate.phone || 'No phone'}
                  </div>
                </td>

                {/* Skills/Tags */}
                <td className="px-6 py-4">
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
                </td>

                {/* Added Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(candidate.appliedDate).toLocaleDateString()}
                  </div>
                </td>

                {/* Source */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                    {candidate.source}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      onCandidateRemove?.(candidate);
                    }}
                    className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded transition-colors"
                    title="Remove prospect from pipeline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {candidates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MapPin className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sourcing prospects found</h3>
          <p className="text-gray-500">Try adjusting your search or filters to see more prospects.</p>
        </div>
      )}
    </div>
  );
};
