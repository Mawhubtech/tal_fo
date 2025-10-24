import React from 'react';
import { Building, MapPin, CheckCircle, Loader2, Sparkles } from 'lucide-react';

interface CandidateCardProps {
  candidate: any; // CandidateMatchDto from backend
  onShortlist?: (candidate: any) => void;
  onViewProfile?: (candidate: any) => void;
  isShortlisting?: boolean;
  showCheckbox?: boolean;
  compact?: boolean; // For chat display - more compact version
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate: result,
  onShortlist,
  onViewProfile,
  isShortlisting = false,
  showCheckbox = false,
  compact = false,
}) => {
  const { candidate, matchCriteria, matchedCriteria } = result;

  // Ensure candidate exists
  if (!candidate) {
    console.warn("Candidate data is missing for result:", result);
    return null;
  }

  // Map backend candidate structure to frontend expected structure
  const personalInfo = {
    fullName: candidate.fullName || 'Unknown',
    email: candidate.email || '',
    location: candidate.location || 'Location not specified',
    linkedIn: candidate.linkedIn || candidate.linkedinUrl || '',
    github: candidate.github || '',
    facebook: candidate.facebook || candidate.facebookUrl || candidate.facebook_url || '',
    twitter: candidate.twitter || candidate.twitterUrl || candidate.twitter_url || '',
    avatar: candidate.avatar || ''
  };

  const experience = candidate.experience || [];
  
  // Extract skills from skillMappings structure
  const skills = candidate.skillMappings 
    ? candidate.skillMappings.map((mapping: any) => mapping.skill?.name).filter(Boolean)
    : (candidate.skills ? candidate.skills.map((skill: any) => skill.name || skill) : []);

  return (
    <div className={`${compact ? 'p-3' : 'px-4 py-4'} hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200 last:border-b-0`}>
      <div className="flex items-start">
        {showCheckbox && (
          <input 
            type="checkbox" 
            className="mt-1 mr-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:outline-none" 
          />
        )}
        
        <div className="flex-1">
          {/* Header with name and actions */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {personalInfo.avatar ? (
                  <img
                    src={personalInfo.avatar}
                    alt={`${personalInfo.fullName} avatar`}
                    className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full object-cover border-2 border-gray-200`}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                {/* Fallback initials avatar */}
                <div 
                  className={`${compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold ${personalInfo.avatar ? 'hidden' : 'flex'}`}
                  style={{ display: personalInfo.avatar ? 'none' : 'flex' }}
                >
                  {personalInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              </div>
              
              <div>
                <h3
                  className={`${compact ? 'text-sm' : 'text-base'} font-semibold cursor-pointer hover:text-purple-600 transition-colors duration-200 flex items-center gap-1`}
                  onClick={() => onViewProfile?.(result)}
                >
                  {personalInfo.fullName}
                  {/* Icon indicates clickable */}
                  <svg className="h-3 w-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </h3>
              </div>
              
              {/* Social Links - only show if not compact */}
              {!compact && (
                <div className="flex items-center gap-1">
                  {personalInfo.linkedIn && (
                    <a href={personalInfo.linkedIn.startsWith('http') ? personalInfo.linkedIn : `https://${personalInfo.linkedIn}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-600 transition-colors duration-200" title="LinkedIn">
                      <span className="sr-only">LinkedIn</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  )}
                  {personalInfo.github && (
                    <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-600 transition-colors duration-200" title="GitHub">
                      <span className="sr-only">GitHub</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>
            
            {onShortlist && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onShortlist(candidate)}
                  disabled={isShortlisting}
                  className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'} bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center gap-1 font-medium`}
                >
                  {isShortlisting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Shortlist
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Current Position & Location */}
          {!compact && experience && experience.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1 flex-wrap">
                  <Building className="h-3 w-3 text-purple-600 flex-shrink-0" />
                  <span className="font-medium">{experience[0].position}</span>
                  <span className="text-gray-400">at</span>
                  <span>{experience[0].company}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {personalInfo.location}
                </div>
              </div>
            </div>
          )}

          {/* Compact version - just show location */}
          {compact && (
            <div className="mb-1">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {experience && experience.length > 0 && (
                  <>
                    <Building className="h-3 w-3 text-purple-600 flex-shrink-0" />
                    <span className="font-medium">{experience[0].position}</span>
                    <span className="text-gray-400 mx-1">•</span>
                  </>
                )}
                <MapPin className="h-3 w-3" />
                {personalInfo.location}
              </div>
            </div>
          )}

          {/* Professional Summary - only show if not compact */}
          {!compact && candidate.summary && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 leading-relaxed">
                {candidate.summary.length > 280 
                  ? candidate.summary.substring(0, 280) + '...' 
                  : candidate.summary}
                {candidate.summary.length > 280 && (
                  <button
                    onClick={() => onViewProfile?.(result)}
                    className="text-purple-600 hover:text-purple-800 font-medium ml-1"
                  >
                    Read more
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Skills */}
          <div className={`${compact ? 'mt-1' : 'mt-3'}`}>
            {skills && skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, compact ? 5 : 8).map((skill: string, i: number) => {
                  // Check if this skill is in matched criteria for highlighting
                  const isMatched = matchedCriteria?.some((criteria: string) => 
                    criteria.toLowerCase().includes(skill.toLowerCase()) ||
                    skill.toLowerCase().includes(criteria.toLowerCase())
                  );
                  
                  return (
                    <span 
                      key={i} 
                      className={`inline-block px-2 py-1 text-xs font-medium rounded transition-colors ${
                        isMatched 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {skill}
                    </span>
                  );
                })}
                {skills.length > (compact ? 5 : 8) && (
                  <button
                    onClick={() => onViewProfile?.(result)}
                    className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                  >
                    +{skills.length - (compact ? 5 : 8)}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
