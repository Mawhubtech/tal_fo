import React from 'react';
import { User, MapPin, Building, Calendar, Mail, Phone, ExternalLink, Star } from 'lucide-react';

interface SearchResult {
  id: string;
  score: number;
  user: {
    fileName: string;
    fileSize: number;
    extractedText: string;
    structuredData: {
      personalInfo: {
        fullName: string;
        email?: string;
        phone?: string;
        location?: string;
        website?: string;
        linkedIn?: string;
        github?: string;
      };
      summary?: string;
      experience: Array<{
        position: string;
        company: string;
        startDate: string;
        endDate: string;
        location?: string;
        description?: string;
        responsibilities?: string[];
        achievements?: string[];
        technologies?: string[];
      }>;
      education?: Array<{
        degree: string;
        institution: string;
        graduationDate: string;
        location?: string;
        major?: string;
        courses?: string[];
        honors?: string[];
      }>;
      skills: string[];
      certifications?: Array<{
        name: string;
        issuer: string;
        dateIssued: string;
      }>;
      awards?: Array<{
        name: string;
        issuer: string;
        date: string;
        description?: string;
      }>;
      interests?: string[];
      projects?: Array<{
        name: string;
        description: string;
        technologies: string[];
        url?: string;
      }>;
    };
  };
  matchedCriteria: string[];
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  searchQuery?: string;
  appliedFilters?: any;
  onViewProfile: (userId: string) => void;
  onContactCandidate: (userId: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  searchQuery,
  onViewProfile,
  onContactCandidate
}) => {
  if (isLoading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mb-4 animate-pulse"></div>
        <p className="text-lg font-medium text-gray-900">Finding perfect candidates...</p>
        <p className="text-gray-600 mt-2">Searching across 30+ data sources</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No candidates found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Try adjusting your search criteria or filters to find more candidates.
        </p>
      </div>
    );
  }

  const getExperienceLevel = (experience: any[]) => {
    if (!experience || experience.length === 0) return 'Entry Level';
    
    const totalMonths = experience.reduce((total, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return total + months;
    }, 0);
    
    const years = Math.floor(totalMonths / 12);
    if (years < 2) return 'Entry Level';
    if (years < 5) return 'Mid Level';
    if (years < 10) return 'Senior Level';
    return 'Expert Level';
  };

  const getCurrentRole = (experience: any[]) => {
    if (!experience || experience.length === 0) return 'Not specified';
    const current = experience.find(exp => exp.endDate === 'Present') || experience[0];
    return `${current.position} at ${current.company}`;
  };

  const formatMatchScore = (score: number) => {
    return Math.round(score * 100);
  };

  return (
    <div className="space-y-8 bg-white rounded-2xl border border-gray-200 p-8">
      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {results.length} candidate{results.length !== 1 ? 's' : ''} found
          </h2>
          {searchQuery && (
            <p className="text-gray-600 mt-2">
              Results for: <span className="font-semibold text-purple-600">"{searchQuery}"</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-gray-300 rounded-lg px-4 py-2 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all">
            <option>Sort by relevance</option>
            <option>Sort by experience</option>
            <option>Sort by name</option>
          </select>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-6">
        {results.map((result) => {
          const { user, score, matchedCriteria } = result;
          const { personalInfo, experience, skills, summary } = user.structuredData;
          
          return (
            <div key={result.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-2xl p-8 hover:shadow-lg hover:border-purple-200 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {personalInfo.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {personalInfo.fullName}
                        </h3>
                        <p className="text-gray-600 font-medium">{getCurrentRole(experience)}</p>
                        <div className="flex items-center gap-6 mt-2 text-sm text-gray-500">
                          {personalInfo.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{personalInfo.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{getExperienceLevel(experience)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Match Score */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="text-lg font-bold text-gray-900">
                          {formatMatchScore(score)}% match
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => onViewProfile(result.id)}
                          className="px-4 py-2 text-purple-600 hover:text-purple-700 border border-purple-200 hover:border-purple-300 rounded-lg transition-all duration-200 font-medium"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => onContactCandidate(result.id)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg"
                        >
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  {summary && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {summary.length > 200 ? `${summary.substring(0, 200)}...` : summary}
                      </p>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Top Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.slice(0, 8).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {skills.length > 8 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          +{skills.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recent Experience */}
                  {experience && experience.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Experience</h4>
                      <div className="space-y-2">
                        {experience.slice(0, 2).map((exp, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Building className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{exp.position}</p>
                              <p className="text-sm text-gray-600">
                                {exp.company} • {exp.startDate} - {exp.endDate}
                              </p>
                              {exp.technologies && exp.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {exp.technologies.slice(0, 4).map((tech, techIndex) => (
                                    <span
                                      key={techIndex}
                                      className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                  {exp.technologies.length > 4 && (
                                    <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                                      +{exp.technologies.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Criteria */}
                  {matchedCriteria && matchedCriteria.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Matched Search Criteria
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {matchedCriteria.map((criteria, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                          >
                            {criteria}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {personalInfo.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{personalInfo.email}</span>
                        </div>
                      )}
                      {personalInfo.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{personalInfo.phone}</span>
                        </div>
                      )}
                      {personalInfo.linkedIn && (
                        <a
                          href={personalInfo.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {personalInfo.github && (                        <a
                          href={personalInfo.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>GitHub</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchResults;
