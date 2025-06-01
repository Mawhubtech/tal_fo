import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

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
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
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

// Import user data files
import user1Data from '../data/user1.json';
import user2Data from '../data/user2.json';
import user3Data from '../data/user3.json';
import user4Data from '../data/user4.json';
import user5Data from '../data/user5.json';
import user6Data from '../data/user6.json';
import user7Data from '../data/user7.json';
import user8Data from '../data/user8.json';
import user9Data from '../data/user9.json';
import user10Data from '../data/user10.json';

// Map for quick lookup
const userDataMap = {
  'user1': user1Data,
  'user2': user2Data,
  'user3': user3Data,
  'user4': user4Data,
  'user5': user5Data,
  'user6': user6Data,
  'user7': user7Data,
  'user8': user8Data,
  'user9': user9Data,
  'user10': user10Data,
};

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);  useEffect(() => {
    // Simulate loading data
    setIsLoading(true);
    
    // Scroll to top when profile loads
    window.scrollTo(0, 0);
    
    setTimeout(() => {
      if (userId && userDataMap[userId as keyof typeof userDataMap]) {
        setUserData(userDataMap[userId as keyof typeof userDataMap]);
      }
      setIsLoading(false);
    }, 500);
    
    // Cleanup function to handle component unmount
    return () => {
      // We can use this for cleanup if needed
    };
  }, [userId]);
  const handleBack = () => {
    // Navigate back to search results page
    navigate('/dashboard/search-results');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-2 max-w-7xl bg-gray-50 min-h-screen">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-2 max-w-7xl bg-gray-50 min-h-screen">
        <div className="flex items-center py-4 mb-2">
          <Button
            variant="secondary"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <p className="text-lg font-medium text-gray-900 mb-2">Profile not found</p>
          <p className="text-gray-600">The requested profile could not be found.</p>
        </div>
      </div>
    );
  }

  const { structuredData } = userData;
  const { personalInfo, summary, experience, education, skills, projects } = structuredData;

  return (
    <div className="container mx-auto px-4 py-2 max-w-7xl bg-gray-50 min-h-screen">
      {/* Header with back button */}
      <div className="flex items-center justify-between py-4 mb-4">
        <Button
          variant="secondary"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-sm"
          >
            Share Profile
          </Button>
          <Button
            variant="primary"
            className="text-sm bg-purple-700 text-white"
          >
            Contact Candidate
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-4 border border-gray-200">
        <div className="flex items-start">
          <div className="bg-purple-100 rounded-full h-16 w-16 flex items-center justify-center text-purple-600 text-2xl font-semibold mr-4">
            {personalInfo.fullName.charAt(0)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{personalInfo.fullName}</h1>
                {experience && experience.length > 0 && (
                  <p className="text-gray-600">
                    {experience[0].position} at {experience[0].company}
                  </p>
                )}
                <p className="text-gray-500">{personalInfo.location}</p>
              </div>
              
              <div className="flex space-x-3">
                {personalInfo.linkedIn && (
                  <a href={`https://${personalInfo.linkedIn}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                )}
                {personalInfo.github && (
                  <a href={`https://${personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    <span className="sr-only">GitHub</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                )}
                {personalInfo.website && (
                  <a href={`https://${personalInfo.website}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                    <span className="sr-only">Website</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
            
            {personalInfo.email || personalInfo.phone ? (
              <div className="mt-3 flex flex-wrap gap-4">
                {personalInfo.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      
      {/* Summary Section */}
      {summary && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-4 border border-gray-200">
          <h2 className="font-medium text-lg mb-3">Summary</h2>
          <p className="text-gray-600">{summary}</p>
        </div>
      )}
      
      {/* Experience Section */}
      {experience && experience.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-4 border border-gray-200">
          <h2 className="font-medium text-lg mb-4">Experience</h2>
          <div className="space-y-6">
            {experience.map((exp, index) => (
              <div key={index} className={index !== experience.length - 1 ? "pb-6 border-b border-gray-100" : ""}>
                <div className="flex justify-between">
                  <div className="mb-1">
                    <h3 className="font-medium">{exp.position}</h3>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </div>
                </div>
                {exp.location && <p className="text-sm text-gray-500 mb-2">{exp.location}</p>}
                {exp.description && <p className="text-gray-600 mb-2">{exp.description}</p>}
                
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-1">Responsibilities:</h4>
                    <ul className="list-disc list-inside pl-2 space-y-1">
                      {exp.responsibilities.map((resp, i) => (
                        <li key={i} className="text-sm text-gray-600">{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-1">Key Achievements:</h4>
                    <ul className="list-disc list-inside pl-2 space-y-1">
                      {exp.achievements.map((ach, i) => (
                        <li key={i} className="text-sm text-gray-600">{ach}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Education Section */}
      {education && education.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-4 border border-gray-200">
          <h2 className="font-medium text-lg mb-4">Education</h2>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index} className={index !== education.length - 1 ? "pb-4 border-b border-gray-100" : ""}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.institution}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </div>
                </div>
                {edu.location && <p className="text-sm text-gray-500">{edu.location}</p>}
                {edu.description && <p className="mt-1 text-gray-600">{edu.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Skills Section */}
      {skills && skills.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-4 border border-gray-200">
          <h2 className="font-medium text-lg mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Projects Section */}
      {projects && projects.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-4 border border-gray-200">
          <h2 className="font-medium text-lg mb-4">Projects</h2>
          <div className="space-y-6">
            {projects.map((project, index) => (
              <div key={index} className={index !== projects.length - 1 ? "pb-6 border-b border-gray-100" : ""}>
                <div className="flex justify-between">
                  <h3 className="font-medium">{project.name}</h3>
                  {project.date && <div className="text-sm text-gray-500">{project.date}</div>}
                </div>
                {project.description && <p className="mt-1 text-gray-600">{project.description}</p>}
                
                {project.technologies && project.technologies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
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
                      className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
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
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
