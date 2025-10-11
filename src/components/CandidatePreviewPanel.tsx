import React, { useState, useRef, useEffect } from 'react';
import { 
  X, User, Mail, Phone, MapPin, Linkedin, Github, Globe, ExternalLink, 
  Briefcase, GraduationCap, Award, Code, Calendar, Building2, 
  ChevronLeft, ChevronRight, FileText, Heart, Languages, Star, ThumbsUp, MessageCircle, FileBadge2, Clock
} from 'lucide-react';
import { useCandidate } from '../hooks/useCandidates';

export type PanelState = 'closed' | 'collapsed' | 'expanded';

interface CandidatePreviewPanelProps {
  candidateId: string;
  state: PanelState;
  onStateChange: (state: PanelState) => void;
  onClose: () => void;
}

const CandidatePreviewPanel: React.FC<CandidatePreviewPanelProps> = ({
  candidateId,
  state,
  onStateChange,
  onClose,
}) => {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const [activeTab, setActiveTab] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch fresh candidate data
  const { data: candidate, isLoading, error } = useCandidate(candidateId);

  // Auto-scroll detection - MOVED BEFORE CONDITIONAL RETURNS
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop + 100;
      
      for (let i = sectionRefs.current.length - 1; i >= 0; i--) {
        const section = sectionRefs.current[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveTab(i);
          break;
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Show loading or error state - AFTER ALL HOOKS
  if (isLoading) {
    return (
      <div className={`fixed inset-y-0 right-0 ${
        state === 'expanded' ? 'w-full sm:w-3/4 md:w-2/3 lg:w-1/2' : 'w-full sm:w-1/2 md:w-5/12 lg:w-1/3'
      } bg-white shadow-2xl z-50 flex items-center justify-center transition-all duration-300 ease-in-out overflow-hidden`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className={`fixed inset-y-0 right-0 ${
        state === 'expanded' ? 'w-full sm:w-3/4 md:w-2/3 lg:w-1/2' : 'w-full sm:w-1/2 md:w-5/12 lg:w-1/3'
      } bg-white shadow-2xl z-50 flex items-center justify-center transition-all duration-300 ease-in-out overflow-hidden`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load candidate details</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Helper functions to safely access arrays from various data sources
  const getSkills = () => {
    if (candidate.skills && Array.isArray(candidate.skills)) return candidate.skills;
    if (candidate.notesData?.skills && Array.isArray(candidate.notesData.skills)) return candidate.notesData.skills;
    return [];
  };

  const getExperience = () => {
    if (candidate.experience && Array.isArray(candidate.experience)) return candidate.experience;
    if (candidate.notesData?.experience && Array.isArray(candidate.notesData.experience)) return candidate.notesData.experience;
    return [];
  };

  const getEducation = () => {
    if (candidate.education && Array.isArray(candidate.education)) return candidate.education;
    if (candidate.notesData?.education && Array.isArray(candidate.notesData.education)) return candidate.notesData.education;
    return [];
  };

  const getProjects = () => {
    if (candidate.projects && Array.isArray(candidate.projects)) return candidate.projects;
    if (candidate.notesData?.projects && Array.isArray(candidate.notesData.projects)) return candidate.notesData.projects;
    return [];
  };

  const getCertifications = () => {
    if (candidate.certifications && Array.isArray(candidate.certifications)) return candidate.certifications;
    if (candidate.notesData?.certifications && Array.isArray(candidate.notesData.certifications)) return candidate.notesData.certifications;
    return [];
  };

  const getAwards = () => {
    if (candidate.awards && Array.isArray(candidate.awards)) return candidate.awards;
    if (candidate.notesData?.awards && Array.isArray(candidate.notesData.awards)) return candidate.notesData.awards;
    return [];
  };

  const getLanguages = () => {
    if (candidate.languages && Array.isArray(candidate.languages)) return candidate.languages;
    if (candidate.notesData?.languages && Array.isArray(candidate.notesData.languages)) return candidate.notesData.languages;
    return [];
  };

  const getInterests = () => {
    if (candidate.interests && Array.isArray(candidate.interests)) return candidate.interests;
    if (candidate.notesData?.interests && Array.isArray(candidate.notesData.interests)) return candidate.notesData.interests;
    return [];
  };

  const getActivity = () => {
    if (candidate.activity && Array.isArray(candidate.activity)) return candidate.activity;
    if (candidate.notesData?.activity && Array.isArray(candidate.notesData.activity)) return candidate.notesData.activity;
    return [];
  };

  const getReferences = () => {
    if (candidate.references && Array.isArray(candidate.references)) return candidate.references;
    if (candidate.notesData?.references && Array.isArray(candidate.notesData.references)) return candidate.notesData.references;
    return [];
  };

  const getCustomFields = () => {
    if (candidate.customFields && Array.isArray(candidate.customFields)) return candidate.customFields;
    if (candidate.notesData?.customFields && Array.isArray(candidate.notesData.customFields)) return candidate.notesData.customFields;
    return [];
  };

  const formatDateForDisplay = (date: string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Tab configuration
  const profileTabs = [
    { name: 'Experience', icon: Briefcase, index: 0, count: getExperience().length },
    { name: 'Education', icon: GraduationCap, index: 1, count: getEducation().length },
    { 
      name: 'Skills', 
      icon: Code, 
      index: 2, 
      count: getSkills().length + (candidate.skillMappings?.length || 0) 
    },
    { name: 'Projects', icon: FileText, index: 3, count: getProjects().length },
    { name: 'Certifications', icon: FileBadge2, index: 4, count: getCertifications().length },
    { name: 'Awards', icon: Award, index: 5, count: getAwards().length },
    { name: 'Languages', icon: Languages, index: 6, count: getLanguages().length },
    { name: 'Activity', icon: Clock, index: 7, count: getActivity().length },
    { name: 'Interests', icon: Heart, index: 8, count: getInterests().length },
    { name: 'References', icon: Mail, index: 9, count: getReferences().length },
    { name: 'Custom Fields', icon: FileText, index: 10, count: getCustomFields().length },
  ].filter(tab => tab.count > 0); // Only show tabs with data

  const getAvatarInitials = () => {
    if (!candidate.fullName) return '?';
    return candidate.fullName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const enrichedData = candidate.notesData;

  if (state === 'closed') return null;

  return (
    <div
      ref={panelRef}
      className={`fixed inset-y-0 right-0 ${
        state === 'expanded' ? 'w-full sm:w-3/4 md:w-2/3 lg:w-1/2' : 'w-full sm:w-1/2 md:w-5/12 lg:w-1/3'
      } bg-white shadow-2xl z-50 flex transition-all duration-300 ease-in-out overflow-hidden`}
    >
      {/* Profile Info Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Profile Basic Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start flex-1">
              {candidate.avatar ? (
                <img
                  src={candidate.avatar}
                  alt={candidate.fullName}
                  className="h-12 w-12 rounded-full mr-4 flex-shrink-0 object-cover"
                />
              ) : (
                <div className="bg-purple-100 rounded-full h-12 w-12 flex items-center justify-center text-purple-600 text-xl font-semibold mr-4 flex-shrink-0">
                  {getAvatarInitials()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">{candidate.fullName}</h2>
                <div className="flex items-center text-sm text-gray-500 mt-0.5">
                  <span className="truncate">{candidate.location || 'Location not specified'}</span>
                  {candidate.github && (
                    <>
                      <span className="mx-1">·</span>
                      <a
                        href={candidate.github.startsWith('http') ? candidate.github : `https://${candidate.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-purple-600 flex items-center"
                        title="GitHub Profile"
                      >
                        <Github size={14} />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex items-center gap-1 ml-3">
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Close Panel"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          {/* Contact Information - Compact */}
          <div className="mt-3 space-y-2">
            {candidate.email && (
              <div className="flex items-center text-xs">
                <Mail className="w-3 h-3 text-gray-400 mr-1.5 flex-shrink-0" />
                <a
                  href={`mailto:${candidate.email}`}
                  className="text-gray-700 hover:text-purple-600 transition-colors truncate"
                >
                  {candidate.email}
                </a>
              </div>
            )}

            {candidate.phone && (
              <div className="flex items-center text-xs">
                <Phone className="w-3 h-3 text-gray-400 mr-1.5 flex-shrink-0" />
                <a
                  href={`tel:${candidate.phone}`}
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                >
                  {candidate.phone}
                </a>
              </div>
            )}

            {candidate.linkedIn && (
              <div className="flex items-center text-xs">
                <a
                  href={candidate.linkedIn.startsWith('http') ? candidate.linkedIn : `https://${candidate.linkedIn}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                  title="View LinkedIn Profile"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            )}

            {candidate.website && candidate.website.trim() && (
              <div className="flex items-center text-xs">
                <ExternalLink className="w-3 h-3 text-gray-400 mr-1.5 flex-shrink-0" />
                <a
                  href={candidate.website.startsWith('http') ? candidate.website : `https://${candidate.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-purple-600 transition-colors truncate"
                >
                  {candidate.website}
                </a>
              </div>
            )}
          </div>

          {/* Professional Stats */}
          {enrichedData && (enrichedData.connectionsCount || enrichedData.followerCount || enrichedData.yearsOfExperience) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                {enrichedData.connectionsCount && (
                  <div className="flex items-center gap-2 bg-purple-50 rounded-lg px-2 py-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-purple-900">
                        {enrichedData.connectionsCount >= 500 ? '500+' : enrichedData.connectionsCount}
                      </div>
                      <div className="text-xs text-purple-600">Connections</div>
                    </div>
                  </div>
                )}

                {enrichedData.followerCount && (
                  <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-2 py-1.5">
                    <Star className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-blue-900">
                        {enrichedData.followerCount}
                      </div>
                      <div className="text-xs text-blue-600">Followers</div>
                    </div>
                  </div>
                )}

                {enrichedData.yearsOfExperience && (
                  <div className="flex items-center gap-2 bg-green-50 rounded-lg px-2 py-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-green-900">
                        {enrichedData.yearsOfExperience} yrs
                      </div>
                      <div className="text-xs text-green-600">Experience</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI-Powered Spotlight */}
        {candidate.summary && (
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">AI-Powered Spotlight</h3>
            <p className="text-xs text-gray-700 leading-relaxed">{candidate.summary}</p>
          </div>
        )}

        {/* Scrollable Content Area with Tabs */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto flex flex-col relative"
        >
          {/* Tabs Navigation - Sticky */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
            <nav className="flex px-4 overflow-x-auto" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#e5e7eb #f9fafb'
            }}>
              {profileTabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.index);
                    setTimeout(() => {
                      const sectionElement = sectionRefs.current[tab.index];
                      if (sectionElement) {
                        sectionElement.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                          inline: 'nearest'
                        });
                      }
                    }, 50);
                  }}
                  className={`${
                    activeTab === tab.index
                      ? 'border-purple-600 text-purple-700 font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-2 border-b-2 text-xs flex items-center gap-1 mr-3 flex-shrink-0`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.name}
                  {tab.count > 0 && (
                    <span className={`${
                      activeTab === tab.index ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    } py-0.5 px-1 rounded-full text-xs font-medium`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4">
            {/* Experience Section */}
            <div ref={(el) => {
              const tabIndex = profileTabs.findIndex(tab => tab.name === 'Experience');
              if (tabIndex !== -1) sectionRefs.current[tabIndex] = el;
            }} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-purple-600" />
                Experience
              </h3>
              {getExperience().length > 0 ? (
                <div className="space-y-3">
                  {getExperience().map((exp: any, index: number) => (
                    <div key={index} className="bg-white rounded border border-gray-100 p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-1">
                          <div className="mr-2 mt-0.5">
                            <Briefcase className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-xs">{exp.position}</h4>
                            
                            {/* Company with social media links */}
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <p className="text-xs text-gray-600">{exp.company}</p>
                              {exp.metadata && (exp.metadata.companyWebsite || exp.metadata.companyLinkedinUrl || exp.metadata.companyFacebookUrl || exp.metadata.companyTwitterUrl) && (
                                <div className="flex items-center gap-0.5">
                                  {exp.metadata.companyWebsite && (
                                    <a
                                      href={exp.metadata.companyWebsite.startsWith('http') ? exp.metadata.companyWebsite : `https://${exp.metadata.companyWebsite}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-600 hover:text-purple-600"
                                      title="Company Website"
                                    >
                                      <Globe className="h-3 w-3" />
                                    </a>
                                  )}
                                  {exp.metadata.companyLinkedinUrl && (
                                    <a
                                      href={exp.metadata.companyLinkedinUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800"
                                      title="LinkedIn"
                                    >
                                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                                      </svg>
                                    </a>
                                  )}
                                  {exp.metadata.companyFacebookUrl && exp.metadata.companyFacebookUrl.length > 0 && (
                                    <a
                                      href={exp.metadata.companyFacebookUrl[0]}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:text-blue-700"
                                      title="Facebook"
                                    >
                                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                      </svg>
                                    </a>
                                  )}
                                  {exp.metadata.companyTwitterUrl && exp.metadata.companyTwitterUrl.length > 0 && (
                                    <a
                                      href={exp.metadata.companyTwitterUrl[0]}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sky-500 hover:text-sky-700"
                                      title="Twitter"
                                    >
                                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                      </svg>
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Compact company metadata */}
                            <div className="flex items-center gap-1.5 flex-wrap mt-1 text-xs text-gray-500">
                              {exp.location && <span>📍 {exp.location}</span>}
                              {exp.metadata?.companyIndustry && <span>• {exp.metadata.companyIndustry}</span>}
                              {exp.metadata?.companySizeRange && <span>• 👥 {exp.metadata.companySizeRange}</span>}
                              {exp.metadata?.companyLocationHq?.fullAddress && <span>• 🏢 {exp.metadata.companyLocationHq.fullAddress}</span>}
                            </div>
                            
                            {/* Department and management level badges */}
                            {exp.metadata && (exp.metadata.department || exp.metadata.managementLevel) && (
                              <div className="flex items-center gap-1 flex-wrap mt-1.5">
                                {exp.metadata.department && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
                                    {exp.metadata.department}
                                  </span>
                                )}
                                {exp.metadata.managementLevel && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-50 text-purple-700 border border-purple-200">
                                    {exp.metadata.managementLevel}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Company financials and growth - compact inline */}
                            {exp.metadata && (exp.metadata.companyAnnualRevenue || exp.metadata.companyEmployeesCountChangeYearlyPercentage !== undefined) && (
                              <div className="flex items-center gap-1.5 flex-wrap mt-1.5 text-xs">
                                {exp.metadata.companyAnnualRevenue && (
                                  <span className="text-gray-600">
                                    💰 {exp.metadata.companyAnnualRevenueCurrency} {exp.metadata.companyAnnualRevenue.toLocaleString()}
                                  </span>
                                )}
                                {exp.metadata.companyEmployeesCountChangeYearlyPercentage !== undefined && (
                                  <span className={`font-medium ${exp.metadata.companyEmployeesCountChangeYearlyPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    📈 {exp.metadata.companyEmployeesCountChangeYearlyPercentage > 0 ? '+' : ''}
                                    {exp.metadata.companyEmployeesCountChangeYearlyPercentage.toFixed(1)}% YoY
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Keywords inline - Show limited keywords */}
                            {exp.metadata?.companyCategoriesAndKeywords && exp.metadata.companyCategoriesAndKeywords.length > 0 && (
                              <div className="mt-1.5">
                                <div className="flex flex-wrap gap-1">
                                  {exp.metadata.companyCategoriesAndKeywords.slice(0, 3).map((keyword: string, i: number) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                                      {keyword}
                                    </span>
                                  ))}
                                  {exp.metadata.companyCategoriesAndKeywords.length > 3 && (
                                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                      +{exp.metadata.companyCategoriesAndKeywords.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 text-right whitespace-nowrap pl-2">
                          {formatDateForDisplay(exp.startDate)} - {formatDateForDisplay(exp.endDate) || 'Present'}
                          {(exp.metadata?.duration || exp.duration) && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              {exp.metadata?.duration || exp.duration}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Only show description if it's NOT auto-generated from metadata */}
                      {exp.description && !exp.metadata?.source && (
                        <p className="mt-1.5 text-xs text-gray-700 leading-relaxed">{exp.description}</p>
                      )}
                      
                      {exp.responsibilities && exp.responsibilities.length > 0 && (
                        <div className="mt-1.5">
                          <h5 className="text-xs font-medium text-gray-700 mb-0.5">Responsibilities:</h5>
                          <ul className="list-disc list-inside pl-1.5 space-y-0.5">
                            {exp.responsibilities.map((resp: string, i: number) => (
                              <li key={i} className="text-xs text-gray-600">{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="mt-1.5">
                          <h5 className="text-xs font-medium text-gray-700 mb-0.5">Achievements:</h5>
                          <ul className="list-disc list-inside pl-1.5 space-y-0.5">
                            {exp.achievements.map((ach: string, i: number) => (
                              <li key={i} className="text-xs text-gray-600">{ach}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="mt-1.5">
                          <h5 className="text-xs font-medium text-gray-700 mb-0.5">Technologies:</h5>
                          <div className="flex flex-wrap gap-1">
                            {exp.technologies.map((tech: string, i: number) => (
                              <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No experience information</p>
              )}
            </div>

            {/* Education Section */}
            <div ref={(el) => {
              const tabIndex = profileTabs.findIndex(tab => tab.name === 'Education');
              if (tabIndex !== -1) sectionRefs.current[tabIndex] = el;
            }} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-purple-600" />
                Education
              </h3>
              {getEducation().length > 0 ? (
                <div className="space-y-3">
                  {getEducation().map((edu: any, index: number) => (
                    <div key={index} className="bg-white rounded border border-gray-100 p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-1">
                          <div className="mr-2 mt-0.5">
                            <GraduationCap className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-xs">{edu.degree}</h4>
                            
                            {/* Institution - handle URL or plain text */}
                            {edu.institution && (
                              edu.institution.startsWith('http') ? (
                                <a
                                  href={edu.institution}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                                >
                                  {edu.institutionName || 'View Institution'}
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <p className="text-xs text-gray-600">{edu.institution}</p>
                              )
                            )}
                            
                            {edu.location && <p className="text-xs text-gray-500 mt-0.5">{edu.location}</p>}
                            {edu.major && <p className="text-xs text-gray-600 mt-0.5">Major: {edu.major}</p>}
                            {edu.minor && <p className="text-xs text-gray-600 mt-0.5">Minor: {edu.minor}</p>}
                            
                            {/* GPA Display */}
                            {edu.gpa && (
                              <p className="text-xs text-gray-600 mt-0.5">
                                GPA: {edu.gpa}{edu.maxGpa && ` / ${edu.maxGpa}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 text-right whitespace-nowrap pl-2">
                          {edu.startDate && edu.endDate
                            ? `${formatDateForDisplay(edu.startDate)} - ${formatDateForDisplay(edu.endDate)}`
                            : edu.graduationDate
                            ? formatDateForDisplay(edu.graduationDate)
                            : edu.startDate
                            ? `${formatDateForDisplay(edu.startDate)} - Present`
                            : ''}
                        </div>
                      </div>
                      
                      {edu.description && (
                        <p className="mt-1.5 text-xs text-gray-700 leading-relaxed">{edu.description}</p>
                      )}
                      
                      {/* Courses */}
                      {edu.courses && edu.courses.length > 0 && (
                        <div className="mt-1.5">
                          <h5 className="text-xs font-medium mb-0.5">Relevant Courses:</h5>
                          <div className="flex flex-wrap gap-1">
                            {edu.courses.map((course: string, i: number) => (
                              <span key={i} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                {course}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Honors & Awards */}
                      {edu.honors && edu.honors.length > 0 && (
                        <div className="mt-1.5">
                          <h5 className="text-xs font-medium mb-0.5">Honors & Awards:</h5>
                          <ul className="list-disc list-inside pl-1.5 space-y-0.5">
                            {edu.honors.map((honor: string, i: number) => (
                              <li key={i} className="text-xs text-gray-600">{honor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No education information</p>
              )}
            </div>

            {/* Skills Section */}
            {(getSkills().length > 0 || (candidate.skillMappings && candidate.skillMappings.length > 0)) && (
            <div ref={(el) => {
              const tabIndex = profileTabs.findIndex(tab => tab.name === 'Skills');
              if (tabIndex !== -1) sectionRefs.current[tabIndex] = el;
            }} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                <Code className="h-4 w-4 text-purple-600" />
                Skills & Expertise
              </h3>
              <div className="space-y-4">
                  {/* Skills from skillMappings (with level and years) */}
                  {candidate.skillMappings && candidate.skillMappings.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {candidate.skillMappings.map((mapping: any, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium inline-flex items-center gap-1.5"
                          title={`Level: ${mapping.level}${mapping.yearsOfExperience ? ` • ${mapping.yearsOfExperience} years` : ''}`}
                        >
                          {mapping.skill?.name || 'Unknown'}
                          {mapping.level && (
                            <span className="text-xs text-purple-500">
                              • {mapping.level.charAt(0).toUpperCase() + mapping.level.slice(1)}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {getSkills().map((skill: any, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium"
                        >
                          {typeof skill === 'string' ? skill : skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Projects Section */}
            {getProjects().length > 0 && (
              <div ref={(el) => {
                const tabIndex = profileTabs.findIndex(tab => tab.name === 'Projects');
                if (tabIndex !== -1) sectionRefs.current[tabIndex] = el;
              }} className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-purple-600" />
                  Projects
                </h3>
                <div className="space-y-3">
                  {getProjects().map((project: any, index: number) => (
                    <div key={index} className="bg-white rounded border border-gray-100 p-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-900 text-xs flex-1">{project.name}</h4>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 flex-shrink-0 ml-2"
                            title="View Project"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {project.date && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {project.date}
                        </p>
                      )}
                      {project.description && (
                        <p className="mt-1 text-xs text-gray-700 leading-relaxed">{project.description}</p>
                      )}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Certifications Section */}
          {getCertifications().length > 0 && (
          <div ref={(el) => {
            const tabIndex = profileTabs.findIndex(tab => tab.name === 'Certifications');
            if (tabIndex !== -1) sectionRefs.current[tabIndex] = el;
          }} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
              <FileBadge2 className="w-3 h-3 text-purple-600" />
              Certifications
            </h3>
            <div className="space-y-2">
              {getCertifications().length > 0 ? (
                <div className="space-y-2">
                  {getCertifications().map((cert: any, index: number) => (
                    <div key={index} className="bg-white rounded border border-gray-100 p-2.5 hover:border-purple-200 transition-colors">
                      <div className="flex items-start gap-2">
                        <FileBadge2 className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-xs">{cert.name}</h4>
                          {cert.issuer && (
                            <p className="text-xs text-gray-600">{cert.issuer}</p>
                          )}
                          {(cert.dateIssued || cert.expirationDate) && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {cert.dateIssued && (
                                <span>Issued: {formatDateForDisplay(cert.dateIssued)}</span>
                              )}
                              {cert.expirationDate && (
                                <span> • Expires: {formatDateForDisplay(cert.expirationDate)}</span>
                              )}
                            </div>
                          )}
                          {cert.credentialId && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              ID: {cert.credentialId}
                            </div>
                          )}
                          {cert.credentialUrl && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 mt-1"
                            >
                              View Credential
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No certifications</p>
              )}
            </div>
          </div>
          )}

          {/* Awards Section */}
          {getAwards().length > 0 && (
          <div ref={(el) => {
            const tabIndex = profileTabs.findIndex(tab => tab.name === 'Awards');
            if (tabIndex !== -1) sectionRefs.current[tabIndex] = el;
          }} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
              <Award className="w-3 h-3 text-purple-600" />
              Awards
            </h3>
            <div className="space-y-2">
              {getAwards().length > 0 ? (
                <div className="space-y-2">
                  {getAwards().map((award: any, index: number) => (
                    <div key={index} className="bg-white rounded border border-gray-100 p-2.5 hover:border-purple-200 transition-colors">
                      <div className="flex items-start gap-2">
                        <Award className="w-3 h-3 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-xs">{award.name}</h4>
                          {award.issuer && (
                            <p className="text-xs text-gray-600">{award.issuer}</p>
                          )}
                          {award.date && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {formatDateForDisplay(award.date)}
                            </div>
                          )}
                          {award.description && (
                            <p className="text-xs text-gray-700 mt-1 leading-relaxed">{award.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No awards</p>
              )}
            </div>
          </div>
          )}

          {/* Languages Section */}
          {getLanguages().length > 0 && (
          <div ref={(el) => {
            const tabIndex = profileTabs.findIndex(tab => tab.name === 'Languages');
            if (tabIndex !== -1) sectionRefs.current[tabIndex] = el;
          }} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
              <Languages className="w-3 h-3 text-purple-600" />
              Languages
            </h3>
            <div className="space-y-2">
              {getLanguages().length > 0 ? (
                <div className="space-y-2">
                  {getLanguages().map((language: any, index: number) => (
                    <div key={index} className="bg-white rounded border border-gray-100 p-2.5 hover:border-purple-200 transition-colors">
                      <div className="flex items-start gap-2">
                        <Languages className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-xs">{language.language}</h4>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {language.proficiency && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                {language.proficiency}
                              </span>
                            )}
                            {language.isNative && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                Native
                              </span>
                            )}
                          </div>
                          {(language.speakingLevel || language.writingLevel || language.readingLevel) && (
                            <div className="mt-1 space-y-0.5">
                              {language.speakingLevel && (
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">Speaking:</span> {language.speakingLevel}
                                </div>
                              )}
                              {language.writingLevel && (
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">Writing:</span> {language.writingLevel}
                                </div>
                              )}
                              {language.readingLevel && (
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">Reading:</span> {language.readingLevel}
                                </div>
                              )}
                            </div>
                          )}
                          {language.certificationName && (
                            <div className="mt-1 text-xs text-gray-600">
                              <span className="font-medium">Certification:</span> {language.certificationName}
                              {language.certificationScore && (
                                <span> (Score: {language.certificationScore})</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No languages</p>
              )}
            </div>
          </div>
          )}

          {/* Activity Section */}
          {getActivity().length > 0 && (
            <div ref={(el) => {
              const tabIndex = profileTabs.findIndex(tab => tab.name === 'Activity');
              if (tabIndex !== -1) sectionRefs.current[tabIndex] = el;
            }} className="mb-6">
              <h3 className="text-xs font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-purple-600" />
                LinkedIn Activity
              </h3>
              <div className="space-y-2">
              {getActivity().length > 0 ? (
                <div className="space-y-3">
                  {getActivity().map((activity: any, index: number) => (
                    <div key={index} className="bg-white rounded border border-gray-100 p-3 hover:border-purple-200 transition-colors">
                      <div className="flex items-start gap-2">
                        {/* Activity Action Icon */}
                        <div className="mt-0.5 flex-shrink-0">
                          {activity.action === 'Liked by' ? (
                            <ThumbsUp className="h-3.5 w-3.5 text-blue-600" />
                          ) : activity.action === 'Commented by' ? (
                            <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <ThumbsUp className="h-3.5 w-3.5 text-gray-600" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Action Label */}
                          {activity.action && (
                            <p className="text-xs text-gray-500 mb-1">
                              {activity.action} {candidate.fullName?.split(' ')[0] || 'candidate'}
                            </p>
                          )}
                          
                          {/* Activity Title/Content */}
                          {activity.title && (
                            <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                              {activity.title}
                            </p>
                          )}
                          
                          {/* Activity URL */}
                          {activity.activityUrl && (
                            <a
                              href={activity.activityUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 mt-1.5"
                            >
                              View on LinkedIn
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {/* Order Badge (optional) */}
                      {activity.orderInProfile !== undefined && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-400">
                            Activity #{activity.orderInProfile}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No activity information</p>
              )}
              </div>
            </div>
          )}

          {/* Interests Section */}
          {getInterests().length > 0 && (
          <div ref={(el) => {
            const tabIndex = profileTabs.findIndex(tab => tab.name === 'Interests');
            if (tabIndex !== -1) sectionRefs.current[tabIndex] = el;
          }} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
              <Heart className="w-3 h-3 text-purple-600" />
              Interests
            </h3>
            <div className="space-y-2">
              {getInterests().length > 0 ? (
                <div className="bg-white rounded border border-gray-100 p-2.5">
                  <div className="flex items-center mb-2">
                    <Heart className="w-3 h-3 text-red-500 mr-1.5" />
                    <h4 className="text-xs font-medium text-gray-800">Personal Interests</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {getInterests().map((interest: any, index: number) => (
                      <span key={index} className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium flex items-center">
                        <Heart className="w-2.5 h-2.5 mr-1 text-red-500" />
                        {typeof interest === 'string' ? interest : interest.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No interests</p>
              )}
            </div>
          </div>
          )}

          {/* References Section */}
          {getReferences().length > 0 && (
          <div ref={(el) => {
            const tabIndex = profileTabs.findIndex(tab => tab.name === 'References');
            if (tabIndex !== -1) sectionRefs.current[tabIndex] = el;
          }} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-purple-600" />
              References
            </h3>
            <div className="space-y-2">
              {getReferences().length > 0 ? (
                <div className="space-y-2">
                  {getReferences().map((reference: any, index: number) => (
                    <div key={index} className="bg-white rounded border border-gray-100 p-2.5 hover:border-purple-200 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 text-blue-600 mr-1.5" />
                          <h4 className="text-xs font-medium text-gray-800">{reference.name}</h4>
                        </div>
                        {reference.status && (
                          <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                            reference.status === 'verified' ? 'bg-green-100 text-green-800' :
                            reference.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                            reference.status === 'available' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reference.status}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        {reference.position && (
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Position:</span>
                            <span>{reference.position}</span>
                          </div>
                        )}
                        {reference.company && (
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Company:</span>
                            <span>{reference.company}</span>
                          </div>
                        )}
                        {reference.email && (
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Email:</span>
                            <span className="text-blue-600">{reference.email}</span>
                          </div>
                        )}
                        {reference.phone && (
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Phone:</span>
                            <span>{reference.phone}</span>
                          </div>
                        )}
                        {reference.relationship && (
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Relationship:</span>
                            <span>{reference.relationship}</span>
                          </div>
                        )}
                        {reference.yearsKnown && (
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Years Known:</span>
                            <span>{reference.yearsKnown} years</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No references</p>
              )}
            </div>
          </div>
          )}

          {/* Custom Fields Section */}
          {getCustomFields().length > 0 && (
          <div ref={(el) => {
            const tabIndex = profileTabs.findIndex(tab => tab.name === 'Custom Fields');
            if (tabIndex !== -1) sectionRefs.current[tabIndex] = el;
          }} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-900 mb-3 pb-1.5 border-b border-gray-200 flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-purple-600" />
              Custom Fields
            </h3>
            <div className="space-y-2">
              {getCustomFields().map((field: any, index: number) => (
                    <div key={index} className="bg-white rounded border border-gray-100 p-2.5 hover:border-purple-200 transition-colors">
                      <div className="flex items-center mb-1">
                        <FileText className="w-3 h-3 text-purple-600 mr-1.5" />
                        <h4 className="text-xs font-medium text-gray-800">{field.fieldName}</h4>
                        {field.isRequired && (
                          <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        {field.fieldType && (
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Type:</span>
                            <span className="capitalize">{field.fieldType}</span>
                          </div>
                        )}
                        {field.fieldValue && (
                          <div className="flex items-start">
                            <span className="font-medium mr-1">Value:</span>
                            <span className="flex-1">{field.fieldValue}</span>
                          </div>
                        )}
                        {field.fieldDescription && (
                          <div className="flex items-start">
                            <span className="font-medium mr-1">Description:</span>
                            <span className="flex-1">{field.fieldDescription}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatePreviewPanel;
