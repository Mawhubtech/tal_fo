import React, { useState } from 'react';
import { X, Github, Plus, Briefcase, FolderOpen, ChevronLeft, ChevronRight, FileText, Clock, GraduationCap, Zap } from 'lucide-react'; // Ensure these icons are installed
import Button from './Button'; // Adjust path to your Button component if necessary
// Assuming ProfilePage.tsx is in the same directory or adjust path accordingly
// to import UserStructuredData and other related types.
// Define interfaces for type safety - ADD 'export' HERE
export interface PersonalInfo {
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedIn?: string;
  github?: string;
}

export interface Experience {
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
  responsibilities?: string[];
  achievements?: string[];
}

export interface Education {
  degree: string;
  institution: string;
  startDate?: string;
  endDate?: string;
  graduationDate?: string;
  location?: string;
  description?: string;
  major?: string;
  courses?: string[];
  honors?: string[];
}

export interface Project {
  name: string;
  date?: string;
  description?: string;
  technologies?: string[];
  url?: string;
}

export interface UserStructuredData {
  personalInfo: PersonalInfo;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  skills?: string[];
  projects?: Project[];
}

export interface UserData { // If UserData is also needed elsewhere
  fileName: string;
  fileSize: number;
  extractedText: string;
  structuredData: UserStructuredData;
}

export type PanelState = 'closed' | 'collapsed' | 'expanded';

interface ProfileSidePanelProps {
  userData: UserStructuredData | null;
  panelState: PanelState;
  onStateChange: (state: PanelState) => void;
}

const ProfileSidePanel: React.FC<ProfileSidePanelProps> = ({ userData, panelState, onStateChange }) => {
  const [activeTab, setActiveTab] = useState(0); // For main profile tabs
  const [activeSideTab, setActiveSideTab] = useState(0); // For side panel tabs
  
  if (!userData || panelState === 'closed') {
    return null;
  }

  const { personalInfo, summary, experience, education, skills, projects } = userData;  // Main profile tabs for the 2/3 section
  const profileTabs = [
    { name: 'Experience', icon: Briefcase, index: 0, count: experience?.length || 0 },
    { name: 'Education', icon: GraduationCap, index: 1, count: education?.length || 0 },
    { name: 'Skills', icon: Zap, index: 2, count: skills?.length || 0 },
    { name: 'Projects', icon: FolderOpen, index: 3, count: projects?.length || 0 },
  ];

  // Side panel tabs for the 1/3 section (candidate management)
  const sideTabs = [
    { name: 'Sequences', icon: FolderOpen, index: 0, count: 0 },
    { name: 'Notes', icon: FileText, index: 1, count: 0 },
    { name: 'Activity', icon: Clock, index: 2, count: 0 },
    { name: 'Pipeline', icon: Briefcase, index: 3, count: 0 },
  ];  // Collapsed state - show only the 2/3 profile section (1/3 of total page width)
  if (panelState === 'collapsed') {
    return (
      <div className="fixed inset-y-0 right-0 w-1/3 bg-white shadow-2xl z-50 flex">
        {/* Profile Info Section - Full width in collapsed view */}
        <div className="flex-1 w-full flex flex-col">
          {/* Panel Header - Sticky */}
          <div className="sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-full h-8 w-8 flex items-center justify-center text-purple-600 text-sm font-semibold mr-3 flex-shrink-0">
                  {personalInfo.fullName.charAt(0)}
                </div>
                <h3 className="text-md font-semibold text-gray-800">{personalInfo.fullName}</h3>
              </div>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => onStateChange('expanded')}
                  className="text-gray-500 hover:text-gray-700 p-2"
                  aria-label="Expand Panel"
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onStateChange('closed')}
                  className="text-gray-500 hover:text-gray-700 p-2 ml-1"
                  aria-label="Close Panel"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Basic Info + Main Action Buttons */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start">
              <div className="bg-purple-100 rounded-full h-12 w-12 flex items-center justify-center text-purple-600 text-xl font-semibold mr-4 flex-shrink-0">
                {personalInfo.fullName.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{personalInfo.fullName}</h2>
                <div className="flex items-center text-sm text-gray-500 mt-0.5">
                  {personalInfo.location}
                  {personalInfo.github && (
                    <>
                      <span className="mx-1.5">·</span>
                      <a
                        href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-purple-600 flex items-center"
                        title="GitHub Profile"
                      >
                        <Github size={16} />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="primary" size="sm" className='bg-primary-600 hover:bg-primary-700'>Reveal Email & Phone (1 credit)</Button>
              <Button variant="primary" size="sm" className="bg-primary-600 text-primary-600 border-primary-600 hover:bg-primary-700 flex items-center">
                <Plus size={16} className="mr-1" /> Add to Sequence
              </Button>
              <Button variant="primary" size="sm" className="bg-primary-600 text-primary-600 border-primary-600 hover:bg-primary-700">Shortlist</Button>
            </div>
          </div> {/* Scrollable Content Area - Collapsed view with tabs */}
          <div className="flex-1 overflow-y-auto">
            {/* AI-Powered Spotlight (Using Summary) */}
            {summary && (
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AI-Powered Spotlight</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex px-6" aria-label="Tabs">
                {profileTabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.index)}
                    className={`${
                      activeTab === tab.index
                        ? 'border-purple-500 text-purple-600 font-semibold'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-3 px-1 border-b-2 text-xs flex items-center gap-1 mr-4`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.name}
                    {tab.count > 0 && (
                      <span className={`${
                        activeTab === tab.index ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      } py-0.5 px-1.5 rounded-full text-xs font-medium`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content - Compact view for collapsed state */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Experience Tab */}
              {activeTab === 0 && (
                <div>
                  {experience && experience.length > 0 ? (
                    <div className="space-y-3">
                      {experience.slice(0, 3).map((exp, index) => (
                        <div key={index} className={index !== Math.min(experience.length - 1, 2) ? "pb-3 border-b border-gray-100" : ""}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm">{exp.position}</h4>
                              <p className="text-sm text-gray-600">{exp.company}</p>
                            </div>
                            <div className="text-xs text-gray-500 text-right whitespace-nowrap pl-2">
                              {exp.startDate} - {exp.endDate || 'Present'}
                            </div>
                          </div>
                          {exp.description && (
                            <p className="mt-1 text-xs text-gray-700 leading-relaxed line-clamp-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                      {experience.length > 3 && (
                        <button
                          onClick={() => onStateChange('expanded')}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium mt-2"
                        >
                          View all {experience.length} experiences →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No experience information</p>
                    </div>
                  )}
                </div>
              )}

              {/* Education Tab */}
              {activeTab === 1 && (
                <div>
                  {education && education.length > 0 ? (
                    <div className="space-y-3">
                      {education.slice(0, 2).map((edu, index) => (
                        <div key={index} className={index !== Math.min(education.length - 1, 1) ? "pb-3 border-b border-gray-100" : ""}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm">{edu.degree}</h4>
                              <p className="text-sm text-gray-600">{edu.institution}</p>
                              {edu.major && <p className="text-xs text-gray-500 mt-0.5">Major: {edu.major}</p>}
                            </div>
                            <div className="text-xs text-gray-500 text-right whitespace-nowrap pl-2">
                              {edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : 
                               edu.graduationDate ? edu.graduationDate :
                               edu.startDate ? `${edu.startDate} - Present` : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                      {education.length > 2 && (
                        <button
                          onClick={() => onStateChange('expanded')}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium mt-2"
                        >
                          View all {education.length} education entries →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No education information</p>
                    </div>
                  )}
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === 2 && (
                <div>
                  {skills && skills.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {skills.slice(0, 12).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                      {skills.length > 12 && (
                        <button
                          onClick={() => onStateChange('expanded')}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium mt-2"
                        >
                          View all {skills.length} skills →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Zap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No skills information</p>
                    </div>
                  )}
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === 3 && (
                <div>
                  {projects && projects.length > 0 ? (
                    <div className="space-y-3">
                      {projects.slice(0, 2).map((project, index) => (
                        <div key={index} className={index !== Math.min(projects.length - 1, 1) ? "pb-3 border-b border-gray-100" : ""}>
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900 text-sm">{project.name}</h4>
                            {project.date && <div className="text-xs text-gray-500">{project.date}</div>}
                          </div>
                          {project.description && (
                            <p className="mt-1 text-xs text-gray-700 leading-relaxed line-clamp-2">{project.description}</p>
                          )}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {project.technologies.slice(0, 3).map((tech, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                  {tech}
                                </span>
                              ))}
                              {project.technologies.length > 3 && (
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                  +{project.technologies.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {projects.length > 2 && (
                        <button
                          onClick={() => onStateChange('expanded')}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium mt-2"
                        >
                          View all {projects.length} projects →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FolderOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No projects information</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }  // Expanded state - full panel covering 2/3 of page width
  return (
    <div className="fixed inset-y-0 right-0 w-2/3 bg-white shadow-2xl z-50 flex">
      {/* Profile Info Section - 2/3 of the space */}
      <div className="flex-1 w-2/3 flex flex-col border-r border-gray-200">
        {/* Panel Header - Sticky */}
        <div className="sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => onStateChange('collapsed')} 
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 flex items-center text-sm p-2 rounded-md mr-1"
              >
                <ChevronRight size={20} />
                 <span className="ml-1 font-medium">Collapse</span>
              </Button>
            </div>
            <Button variant="ghost" onClick={() => onStateChange('closed')} className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 flex items-center text-sm p-2 rounded-md">
              <X size={18} className="mr-1" /> Back to Search
            </Button>
          </div>
        </div>

        {/* Profile Basic Info + Main Action Buttons */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start">
            <div className="bg-purple-100 rounded-full h-12 w-12 flex items-center justify-center text-purple-600 text-xl font-semibold mr-4 flex-shrink-0">
              {personalInfo.fullName.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{personalInfo.fullName}</h2>
              <div className="flex items-center text-sm text-gray-500 mt-0.5">
                {personalInfo.location}
                {personalInfo.github && (
                  <>
                    <span className="mx-1.5">·</span>
                    <a
                      href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-purple-600 flex items-center"
                      title="GitHub Profile"
                    >
                      <Github size={16} />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" size="sm" className='bg-primary-600 hover:bg-primary-700'>Reveal Email & Phone (1 credit)</Button>
            <Button variant="primary" size="sm" className="bg-primary-600 text-primary-600 border-primary-600 hover:bg-primary-700 flex items-center">
              <Plus size={16} className="mr-1" /> Add to Sequence
            </Button>
            <Button variant="primary" size="sm" className="bg-primary-600 text-primary-600 border-primary-600 hover:bg-primary-700">Shortlist</Button>
          </div>        </div>        {/* Scrollable Content Area - Tabbed Experience, Education, Skills, Projects */}
        <div className="flex-1 overflow-y-auto">          {/* AI-Powered Spotlight (Using Summary) */}
          {summary && (
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AI-Powered Spotlight</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex px-6" aria-label="Tabs">
              {profileTabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.index)}
                  className={`${
                    activeTab === tab.index
                      ? 'border-purple-600 text-purple-700 font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-3 px-1 border-b-2 text-sm flex items-center gap-1.5 mr-6`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                  {tab.count > 0 && (
                    <span className={`${
                      activeTab === tab.index ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    } py-0.5 px-1.5 rounded-full text-xs font-medium`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Experience Tab */}
            {activeTab === 0 && (
              <div>
                {experience && experience.length > 0 ? (
                  <div className="space-y-5">
                    {experience.map((exp, index) => (
                      <div key={index} className={index !== experience.length - 1 ? "pb-5 border-b border-gray-100" : ""}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{exp.position}</h4>
                            <p className="text-sm text-gray-600">{exp.company}</p>
                            {exp.location && <p className="text-xs text-gray-500 mt-0.5">{exp.location}</p>}
                          </div>
                          <div className="text-xs text-gray-500 text-right whitespace-nowrap pl-2">
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </div>
                        </div>
                        {exp.description && <p className="mt-2 text-sm text-gray-700 leading-relaxed">{exp.description}</p>}
                        
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-xs font-medium mb-1">Responsibilities:</h5>
                            <ul className="list-disc list-inside pl-2 space-y-1">
                              {exp.responsibilities.map((resp, i) => (
                                <li key={i} className="text-xs text-gray-600">{resp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-xs font-medium mb-1">Key Achievements:</h5>
                            <ul className="list-disc list-inside pl-2 space-y-1">
                              {exp.achievements.map((ach, i) => (
                                <li key={i} className="text-xs text-gray-600">{ach}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No experience information available</p>
                  </div>
                )}
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 1 && (
              <div>
                {education && education.length > 0 ? (
                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={index} className={index !== education.length - 1 ? "pb-4 border-b border-gray-100" : ""}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                            <p className="text-sm text-gray-600">{edu.institution}</p>
                            {edu.location && <p className="text-xs text-gray-500 mt-0.5">{edu.location}</p>}
                          </div>
                          <div className="text-xs text-gray-500 text-right whitespace-nowrap pl-2">
                            {edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : 
                             edu.graduationDate ? edu.graduationDate :
                             edu.startDate ? `${edu.startDate} - Present` : ''}
                          </div>
                        </div>
                        {edu.major && <p className="text-xs text-gray-600 mt-1">Major: {edu.major}</p>}
                        {edu.description && <p className="mt-2 text-sm text-gray-700 leading-relaxed">{edu.description}</p>}
                        
                        {edu.courses && edu.courses.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-xs font-medium mb-1">Relevant Courses:</h5>
                            <div className="flex flex-wrap gap-1">
                              {edu.courses.map((course, i) => (
                                <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                  {course}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {edu.honors && edu.honors.length > 0 && (
                          <div className="mt-2">
                            <h5 className="text-xs font-medium mb-1">Honors & Awards:</h5>
                            <ul className="list-disc list-inside pl-2 space-y-1">
                              {edu.honors.map((honor, i) => (
                                <li key={i} className="text-xs text-gray-600">{honor}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No education information available</p>
                  </div>
                )}
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 2 && (
              <div>
                {skills && skills.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No skills information available</p>
                  </div>
                )}
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 3 && (
              <div>
                {projects && projects.length > 0 ? (
                  <div className="space-y-5">
                    {projects.map((project, index) => (
                      <div key={index} className={index !== projects.length - 1 ? "pb-5 border-b border-gray-100" : ""}>
                        <div className="flex justify-between">
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          {project.date && <div className="text-xs text-gray-500">{project.date}</div>}
                        </div>
                        {project.description && <p className="mt-1 text-sm text-gray-700">{project.description}</p>}
                        
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {project.technologies.map((tech, i) => (
                              <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {project.url && (
                          <div className="mt-2">
                            <a 
                              href={project.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800 text-xs flex items-center gap-1"
                            >
                              <span>View Project</span>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No projects information available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabbed Content Section - 1/3 of the space */}
      <div className="w-1/3 flex flex-col border-l border-gray-200 bg-gray-50">
        {/* Tabs Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="text-base font-semibold text-gray-900">Candidate Actions</h3>
        </div>        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <nav className="flex" aria-label="Tabs">
            {sideTabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveSideTab(tab.index)}
                className={`${
                  activeSideTab === tab.index
                    ? 'border-purple-600 text-purple-700 font-semibold bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                } whitespace-nowrap py-3 px-3 border-b-2 text-sm flex items-center gap-1.5 flex-1 justify-center transition-colors duration-150 ease-in-out`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
                {tab.count > 0 && (
                  <span className="bg-gray-100 text-gray-600 py-0.5 px-1.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Sequences Tab */}
          {activeSideTab === 0 && (
            <div>
              <div className="mb-4">
                <Button variant="primary" size="md" className="w-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center">
                  <Plus size={18} className="mr-2" />
                  Add to Sequence
                </Button>
              </div>
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No sequences yet</p>
                <p className="text-gray-400 text-xs mt-1">Add this candidate to a sequence to start nurturing them</p>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeSideTab === 1 && (
            <div>
              <div className="mb-4">
                <textarea
                  placeholder="Add a note about this candidate..."
                  className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                  rows={3}
                />
                <Button variant="primary" size="md" className="w-full mt-2 bg-primary-600 hover:bg-primary-700">
                  Add Note
                </Button>
              </div>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm">No notes yet</p>
                <p className="text-xs mt-1">Add notes to remember key details about this candidate</p>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeSideTab === 2 && (
            <div>
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs mt-1">Interactions and updates will appear here</p>
              </div>
            </div>
          )}

          {/* Pipeline Tab */}
          {activeSideTab === 3 && (
            <div>
              <div className="mb-4">
                <select className="w-full p-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm bg-white">
                  <option>Select Pipeline Stage</option>
                  <option>Sourced</option>
                  <option>Contacted</option>
                  <option>Screening</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Hired</option>
                  <option>Rejected</option>
                </select>
                <Button variant="primary" size="md" className="w-full mt-2 bg-primary-600 hover:bg-primary-700">
                  Update Stage
                </Button>
              </div>
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm">Not in pipeline</p>
                <p className="text-xs mt-1">Add to pipeline to track recruitment progress</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSidePanel;