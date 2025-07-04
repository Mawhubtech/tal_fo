import React from 'react';
import { Calendar, Mail, Phone, Star, Tag, MapPin, ChevronDown, Trash2 } from 'lucide-react';
import type { Candidate } from '../../../data/mock';
import type { Pipeline } from '../../../../../services/pipelineService';
import { getScoreColor, getStageColor } from '../shared';

interface PipelineListViewProps {
  candidates: Candidate[];
  pipeline?: Pipeline | null;
  onCandidateClick?: (candidate: Candidate) => void;
  onCandidateStageChange?: (candidateId: string, newStage: string) => void;
  onCandidateRemove?: (candidate: Candidate) => void;
}

export const PipelineListView: React.FC<PipelineListViewProps> = ({
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
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied
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
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {candidate.email}
                      </div>
                    </div>
                  </div>
                </td>                {/* Stage */}
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

                {/* Score */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className={`text-sm font-medium ${getScoreColor(candidate.score)}`}>
                      {candidate.score}
                    </span>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center mb-1">
                    <Phone className="w-3 h-3 mr-1 text-gray-400" />
                    {candidate.phone}
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

                {/* Applied Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(candidate.appliedDate).toLocaleDateString()}
                  </div>
                </td>

                {/* Source */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {candidate.source}
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

      {/* Empty State */}
      {candidates.length === 0 && (
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
