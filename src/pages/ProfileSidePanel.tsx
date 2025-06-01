import React, { useState } from 'react';
import { X, Github, Plus, Star, Briefcase, GraduationCap, Zap, FolderOpen } from 'lucide-react'; // Ensure these icons are installed
import Button from '../components/Button'; // Adjust path to your Button component if necessary
// Assuming ProfilePage.tsx is in the same directory or adjust path accordingly
// to import UserStructuredData and other related types.
import type { UserStructuredData } from './ProfilePage';

interface ProfileSidePanelProps {
  userData: UserStructuredData | null;
  onClose: () => void;
}

const ProfileSidePanel: React.FC<ProfileSidePanelProps> = ({ userData, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  if (!userData) {
    return null;
  }

  const { personalInfo, summary, experience, education, skills, projects } = userData;

  return (
    <div className="fixed inset-y-0 right-0 w-[45%] max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
      {/* Panel Header - Sticky */}
      <div className="sticky top-0 bg-white z-10">        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Button variant="ghost" onClick={onClose} className="text-gray-600 hover:text-gray-800 flex items-center text-sm p-2 -ml-2">
            <X size={20} className="mr-1" /> Search Results
          </Button>
          <div className="flex items-center space-x-1">
            {/* These are placeholders based on the image. Implement functionality as needed. */}
            <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 px-2 py-1">Shortlist</Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 px-2 py-1">Notes</Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 px-2 py-1">Activity</Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:bg-gray-100 px-2 py-1">Projects</Button>
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
            <Button variant="primary" size="sm" className='bg-primary-600'>Reveal Email & Phone (1 credit)</Button>
            <Button variant="primary" size="sm" className="bg-primary-600 text-purple-700 border-purple-700 hover:bg-purple-50 flex items-center">
              <Plus size={16} className="mr-1 " /> Add to Sequence
            </Button>
            <Button variant="primary" size="sm" className="bg-primary-600 hover:bg-purple-700">Shortlist</Button>
          </div>
        </div>
      </div>      {/* Scrollable Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* AI-Powered Spotlight (Using Summary) */}
        {summary && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AI-Powered Spotlight</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Highlights Section (Simplified) */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Highlights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {experience && experience.length > 0 && (
              <div className="bg-purple-50 p-3 rounded-md">
                <Briefcase size={18} className="text-purple-600 mb-1.5" />
                <p className="text-xs text-gray-500">Current Role</p>
                <p className="text-sm font-medium text-gray-800 truncate">{experience[0].position}</p>
              </div>
            )}
            {skills && skills.length > 0 && (
               <div className="bg-green-50 p-3 rounded-md">
                <Star size={18} className="text-green-600 mb-1.5" />
                <p className="text-xs text-gray-500">Top Skill Focus</p>
                <p className="text-sm font-medium text-gray-800 truncate">{skills[0]}</p>
              </div>
            )}
             {education && education.length > 0 && education[0].institution.toLowerCase().includes("university") && (
               <div className="bg-blue-50 p-3 rounded-md">
                {/* Using a generic icon, replace if you have a better one for 'university' */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mb-1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v6H6.5A2.5 2.5 0 0 1 4 19.5z"/><path d="M12 12v9"/><path d="M12 3L2 7l10 4 10-4-10-4z"/></svg>
                <p className="text-xs text-gray-500">Education</p>
                <p className="text-sm font-medium text-gray-800 truncate">{education[0].institution}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6" aria-label="Tabs">
            {[
              { name: 'Experience', icon: Briefcase, index: 0, count: experience?.length || 0 },
              { name: 'Education', icon: GraduationCap, index: 1, count: education?.length || 0 },
              { name: 'Skills', icon: Zap, index: 2, count: skills?.length || 0 },
              { name: 'Projects', icon: FolderOpen, index: 3, count: projects?.length || 0 },
            ].map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.index)}
                className={`${
                  activeTab === tab.index
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-xs flex items-center gap-1 mr-6`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.name}
                {tab.count > 0 && (
                  <span className="bg-gray-100 text-gray-600 py-0.5 px-1.5 rounded-full text-xs">
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
  );
};

export default ProfileSidePanel;