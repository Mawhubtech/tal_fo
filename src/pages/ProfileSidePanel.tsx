import React from 'react';
import { X, Github, Plus, Star, Briefcase } from 'lucide-react'; // Ensure these icons are installed
import Button from '../components/Button'; // Adjust path to your Button component if necessary
// Assuming ProfilePage.tsx is in the same directory or adjust path accordingly
// to import UserStructuredData and other related types.
import type { UserStructuredData, Experience, Education, Project } from './ProfilePage';

interface ProfileSidePanelProps {
  userData: UserStructuredData | null;
  onClose: () => void;
}

const ProfileSidePanel: React.FC<ProfileSidePanelProps> = ({ userData, onClose }) => {
  if (!userData) {
    return null;
  }

  const { personalInfo, summary, experience, education, skills } = userData;

  return (
    <div className="fixed inset-y-0 right-0 w-[45%] max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
      {/* Panel Header - Sticky */}
      <div className="sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
            <Button variant="outline" size="sm">Reveal Email & Phone (1 credit)</Button>
            <Button variant="outline" size="sm" className="text-purple-700 border-purple-700 hover:bg-purple-50 flex items-center">
              <Plus size={16} className="mr-1" /> Add to Sequence
            </Button>
            <Button variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700">Shortlist</Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow p-6 space-y-6 overflow-y-auto">
        {/* AI-Powered Spotlight (Using Summary) */}
        {summary && (
          <div className="pb-6 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AI-Powered Spotlight</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Highlights Section (Simplified) */}
        <div className="pb-6 border-b border-gray-100">
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

        {/* Experiences Section */}
        {experience && experience.length > 0 && (
          <section>
            <h3 className="text-base font-semibold text-gray-800 mb-3">Experiences</h3>
            <div className="space-y-5">
              {experience.map((exp, index) => (
                <div key={index} className="pb-5 border-b border-gray-100 last:border-b-0">
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
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {education && education.length > 0 && (
          <section className="mt-6">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Education</h3>
            <div className="space-y-5">
              {education.map((edu, index) => (
                 <div key={index} className="pb-5 border-b border-gray-100 last:border-b-0">
                   <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      {edu.location && <p className="text-xs text-gray-500 mt-0.5">{edu.location}</p>}
                    </div>
                    <div className="text-xs text-gray-500 text-right whitespace-nowrap pl-2">
                      {edu.startDate} - {edu.endDate || 'Present'}
                    </div>
                  </div>
                  {edu.description && <p className="mt-2 text-sm text-gray-700 leading-relaxed">{edu.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <section className="mt-6">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Technical Skills</h3>
             <div className="flex flex-wrap gap-2">
               {skills.map((skill, index) => (
                 <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                   {skill}
                 </span>
               ))}
             </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProfileSidePanel;