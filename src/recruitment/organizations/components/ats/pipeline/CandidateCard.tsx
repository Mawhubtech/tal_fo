import React from 'react';
import { Calendar, Mail, Phone, Star } from 'lucide-react';
import type { Candidate } from '../../../data/mock';
import { getScoreColor } from '../shared';

interface CandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ 
  candidate,
  onClick 
}) => {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Candidate Info */}
      <div className="flex items-center mb-2">
        <img 
          src={candidate.avatar} 
          alt={candidate.name} 
          className="w-8 h-8 rounded-full mr-2" 
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {candidate.name}
          </p>
          <div className="flex items-center">
            <Star className="w-3 h-3 text-yellow-400 mr-1" />
            <span className={`text-xs font-medium ${getScoreColor(candidate.score)}`}>
              {candidate.score}
            </span>
          </div>
        </div>
      </div>
      
      {/* Contact Info */}
      <div className="text-xs text-gray-500 mb-2 space-y-1">
        <div className="flex items-center">
          <Mail className="w-3 h-3 mr-1" />
          <span className="truncate">{candidate.email}</span>
        </div>
        <div className="flex items-center">
          <Phone className="w-3 h-3 mr-1" />
          <span>{candidate.phone}</span>
        </div>
      </div>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {candidate.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
          >
            {tag}
          </span>
        ))}
        {candidate.tags.length > 3 && (
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
            +{candidate.tags.length - 3}
          </span>
        )}
      </div>
      
      {/* Applied Date */}
      <div className="flex items-center text-xs text-gray-400 mb-2">
        <Calendar className="w-3 h-3 mr-1" />
        Applied {new Date(candidate.appliedDate).toLocaleDateString()}
      </div>
      
      {/* Source */}
      <div className="text-xs text-gray-500">
        Source: {candidate.source}
      </div>
    </div>
  );
};
