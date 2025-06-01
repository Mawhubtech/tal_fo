import React, { useState } from 'react';
import { useDocumentProcessing, ResumeProcessingResult } from '../hooks/useDocumentProcessing';
import Button from './Button';
import { Upload, FileText, Database, Zap, User, Briefcase, GraduationCap, Code, Award, Heart, MapPin, Mail, Phone, Calendar } from 'lucide-react';

const ResumeProcessing: React.FC = () => {
  const { processResumeWithPredefinedSchema, loading, error } = useDocumentProcessing();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ResumeProcessingResult | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  };
  const handleProcessResume = async () => {
    if (!selectedFile) return;

    const processedResult = await processResumeWithPredefinedSchema(selectedFile);
    if (processedResult) {
      setResult(processedResult);
    }
  };

  // Enhanced dynamic card rendering functions
  const renderPersonalInfoCard = (personalInfo: any) => {
    const fields = [];
      // Common personal info fields with colorful icons
    if (personalInfo.name || personalInfo.fullName) {
      fields.push({
        icon: <User className="w-5 h-5 text-blue-500" />,
        label: 'Name',
        value: personalInfo.name || personalInfo.fullName
      });
    }
    
    if (personalInfo.email) {
      fields.push({
        icon: <Mail className="w-5 h-5 text-red-500" />,
        label: 'Email',
        value: personalInfo.email
      });
    }
    
    if (personalInfo.phone || personalInfo.phoneNumber) {
      fields.push({
        icon: <Phone className="w-5 h-5 text-green-500" />,
        label: 'Phone',
        value: personalInfo.phone || personalInfo.phoneNumber
      });
    }
    
    if (personalInfo.address || personalInfo.location) {
      fields.push({
        icon: <MapPin className="w-5 h-5 text-purple-500" />,
        label: 'Location',
        value: personalInfo.address || personalInfo.location
      });
    }

    // Handle any other fields dynamically with orange icon
    Object.entries(personalInfo).forEach(([key, value]) => {
      if (!['name', 'fullName', 'email', 'phone', 'phoneNumber', 'address', 'location'].includes(key) && value) {
        fields.push({
          icon: <User className="w-5 h-5 text-orange-500" />,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          value: String(value)
        });
      }
    });

    if (fields.length === 0) return null;

    return (
      <div key="personal-info" className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-8 border border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500 rounded-full">
            <User className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm">
              <div className="p-2 bg-gray-50 rounded-full">
                {field.icon}
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-600">{field.label}</span>
                <p className="text-gray-900 font-medium">{field.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const renderWorkExperienceCard = (experience: any[]) => {
    return (
      <div key="work-experience" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
        </div>
        <div className="space-y-6">
          {experience.map((job, index) => (
            <div key={index} className="relative">
              {/* Timeline indicator */}
              <div className="absolute left-0 mt-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow"></div>
              <div className="ml-6 pb-4">
                <div className="bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {job.position || job.title || job.jobTitle || 'Position'}
                      </h4>
                      <p className="text-blue-600 font-medium text-base">
                        {job.company || job.employer || job.organization || 'Company'}
                      </p>
                    </div>
                    {(job.duration || job.dates || job.startDate || job.endDate) && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
                        <Calendar className="w-3 h-3" />
                        <span className="font-medium">
                          {job.duration || 
                           `${job.startDate || ''} - ${job.endDate || 'Present'}` || 
                           job.dates}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {job.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  
                  {job.description && (
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">{job.description}</p>
                  )}
                  
                  {job.responsibilities && Array.isArray(job.responsibilities) && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-800 mb-2">Key Responsibilities:</h5>
                      <ul className="space-y-1">
                        {job.responsibilities.map((resp: string, respIndex: number) => (
                          <li key={respIndex} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {job.achievements && Array.isArray(job.achievements) && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-800 mb-2">Key Achievements:</h5>
                      <ul className="space-y-1">
                        {job.achievements.map((achievement: string, achIndex: number) => (
                          <li key={achIndex} className="flex items-start gap-2 text-sm text-gray-700">
                            <Award className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {job.technologies && Array.isArray(job.technologies) && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-800 mb-2">Technologies Used:</h5>
                      <div className="flex flex-wrap gap-1">
                        {job.technologies.map((tech: string, techIndex: number) => (
                          <span
                            key={techIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const renderEducationCard = (education: any[]) => {
    return (
      <div key="education" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Education</h3>
        </div>
        <div className="space-y-6">
          {education.map((edu, index) => (
            <div key={index} className="relative">
              {/* Timeline indicator */}
              <div className="absolute left-0 mt-1.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow"></div>
              <div className="ml-6 pb-4">
                <div className="bg-gradient-to-r from-green-50 to-transparent p-4 rounded-lg border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {edu.degree || edu.qualification || 'Degree'}
                      </h4>
                      <p className="text-green-600 font-medium text-base">
                        {edu.institution || edu.school || edu.university || 'Institution'}
                      </p>
                    </div>
                    {(edu.year || edu.graduationDate || edu.dates || edu.startDate || edu.endDate) && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
                        <Calendar className="w-3 h-3" />
                        <span className="font-medium">
                          {edu.year || edu.graduationDate || 
                           `${edu.startDate || ''} - ${edu.endDate || 'Present'}` || 
                           edu.dates}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {edu.field && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Field of Study:</span>
                        <p className="text-sm text-gray-800">{edu.field}</p>
                      </div>
                    )}
                    {edu.major && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Major:</span>
                        <p className="text-sm text-gray-800">{edu.major}</p>
                      </div>
                    )}
                    {edu.minor && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Minor:</span>
                        <p className="text-sm text-gray-800">{edu.minor}</p>
                      </div>
                    )}
                    {edu.gpa && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">GPA:</span>
                        <p className="text-sm text-gray-800 font-medium">{edu.gpa}</p>
                      </div>
                    )}
                  </div>
                  
                  {edu.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{edu.location}</span>
                    </div>
                  )}
                  
                  {edu.description && (
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">{edu.description}</p>
                  )}
                  
                  {edu.thesis && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-600">Thesis:</span>
                      <p className="text-sm text-gray-700 italic">{edu.thesis}</p>
                    </div>
                  )}
                  
                  {edu.advisor && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-600">Advisor:</span>
                      <p className="text-sm text-gray-700">{edu.advisor}</p>
                    </div>
                  )}
                  
                  {edu.courses && Array.isArray(edu.courses) && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-800 mb-2">Relevant Courses:</h5>
                      <div className="flex flex-wrap gap-1">
                        {edu.courses.map((course: string, courseIndex: number) => (
                          <span
                            key={courseIndex}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                          >
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {edu.honors && Array.isArray(edu.honors) && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-800 mb-2">Honors & Awards:</h5>
                      <ul className="space-y-1">
                        {edu.honors.map((honor: string, honorIndex: number) => (
                          <li key={honorIndex} className="flex items-start gap-2 text-sm text-gray-700">
                            <Award className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>{honor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const renderSkillsCard = (skills: any) => {
    let skillsList: string[] = [];
    
    if (Array.isArray(skills)) {
      skillsList = skills.map(skill => String(skill));
    } else if (typeof skills === 'object') {
      // Handle categorized skills
      skillsList = Object.values(skills).flat().map(skill => String(skill));
    } else if (typeof skills === 'string') {
      skillsList = skills.split(',').map(s => s.trim());
    }

    return (
      <div key="skills" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {skillsList.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderCertificationsCard = (certifications: any[]) => {
    return (
      <div key="certifications" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
        </div>
        <div className="space-y-3">
          {certifications.map((cert, index) => (
            <div key={index} className="flex items-start gap-3">
              <Award className="w-4 h-4 text-yellow-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">
                  {cert.name || cert.title || cert.certification}
                </h4>
                {cert.issuer && (
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                )}
                {(cert.date || cert.year || cert.dateIssued) && (
                  <p className="text-sm text-gray-500">
                    {cert.date || cert.year || cert.dateIssued}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderInterestsCard = (interests: any) => {
    let interestsList: string[] = [];
    
    if (Array.isArray(interests)) {
      interestsList = interests;
    } else if (typeof interests === 'string') {
      interestsList = interests.split(',').map(s => s.trim());
    }

    return (
      <div key="interests" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Interests</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {interestsList.map((interest, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
            >
              {String(interest)}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderProjectsCard = (projects: any[]) => {
    return (
      <div key="projects" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
        </div>
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div key={index} className="border-l-2 border-purple-200 pl-4">
              <h4 className="font-medium text-gray-900">
                {project.name || project.title || 'Project'}
              </h4>
              {project.description && (
                <p className="text-gray-700 text-sm mt-1">{project.description}</p>
              )}
              {project.technologies && Array.isArray(project.technologies) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.technologies.map((tech: string, techIndex: number) => (
                    <span
                      key={techIndex}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {(project.url || project.github || project.demo) && (
                <div className="flex gap-3 text-sm text-blue-600 mt-2">
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Project URL
                    </a>
                  )}
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      GitHub
                    </a>
                  )}
                  {project.demo && (
                    <a href={project.demo} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Demo
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAwardsCard = (awards: any[]) => {
    return (
      <div key="awards" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Awards & Achievements</h3>
        </div>
        <div className="space-y-3">
          {awards.map((award, index) => (
            <div key={index} className="flex items-start gap-3">
              <Award className="w-4 h-4 text-yellow-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">
                  {award.name || award.title || 'Award'}
                </h4>
                {award.issuer && (
                  <p className="text-sm text-gray-600">{award.issuer}</p>
                )}
                {award.date && (
                  <p className="text-sm text-gray-500">{award.date}</p>
                )}
                {award.description && (
                  <p className="text-sm text-gray-700 mt-1">{award.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPublicationsCard = (publications: any[]) => {
    return (
      <div key="publications" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Publications</h3>
        </div>
        <div className="space-y-4">
          {publications.map((pub, index) => (
            <div key={index} className="border-l-2 border-indigo-200 pl-4">
              <h4 className="font-medium text-gray-900">
                {pub.title || 'Publication'}
              </h4>
              {pub.authors && (
                <p className="text-sm text-gray-600">Authors: {pub.authors}</p>
              )}
              {pub.publication && (
                <p className="text-sm text-indigo-600">{pub.publication}</p>
              )}
              {pub.date && (
                <p className="text-sm text-gray-500">{pub.date}</p>
              )}
              {pub.url && (
                <a href={pub.url} target="_blank" rel="noopener noreferrer" 
                   className="text-sm text-blue-600 hover:underline">
                  View Publication
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVolunteerCard = (volunteer: any[]) => {
    return (
      <div key="volunteer" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Volunteer Experience</h3>
        </div>
        <div className="space-y-4">
          {volunteer.map((vol, index) => (
            <div key={index} className="border-l-2 border-green-200 pl-4">
              <h4 className="font-medium text-gray-900">
                {vol.role || vol.position || 'Volunteer Role'}
              </h4>
              <p className="text-green-600 font-medium">
                {vol.organization || 'Organization'}
              </p>
              {(vol.startDate || vol.endDate || vol.duration) && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {vol.duration || 
                     `${vol.startDate || ''} - ${vol.endDate || 'Present'}`}
                  </span>
                </div>
              )}
              {vol.description && (
                <p className="text-gray-700 text-sm mt-2">{vol.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  const renderConferencesCard = (conferences: any[]) => {
    return (
      <div key="conferences" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Conferences & Events</h3>
        </div>
        <div className="space-y-3">
          {conferences.map((conf, index) => (
            <div key={index} className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-purple-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">
                  {conf.name || 'Conference'}
                </h4>
                {conf.role && (
                  <p className="text-sm text-purple-600">Role: {conf.role}</p>
                )}
                {conf.location && (
                  <p className="text-sm text-gray-600">Location: {conf.location}</p>
                )}
                {conf.date && (
                  <p className="text-sm text-gray-500">{conf.date}</p>
                )}
                {conf.presentation && (
                  <p className="text-sm text-gray-700 mt-1">
                    Presentation: {conf.presentation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReferencesCard = (references: any) => {
    let referencesList: any[] = [];
    
    if (Array.isArray(references)) {
      referencesList = references;
    } else if (typeof references === 'object' && references !== null) {
      // Handle single reference object
      referencesList = [references];
    }

    return (
      <div key="references" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">References</h3>
        </div>
        <div className="space-y-4">
          {referencesList.map((ref, index) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4">
              <h4 className="font-medium text-gray-900">
                {ref.name || 'Reference'}
              </h4>
              {ref.title && (
                <p className="text-sm text-gray-600">{ref.title}</p>
              )}
              {ref.company && (
                <p className="text-sm text-gray-600">{ref.company}</p>
              )}
              {ref.relationship && (
                <p className="text-sm text-blue-600">Relationship: {ref.relationship}</p>
              )}
              {ref.email && (
                <p className="text-sm text-gray-700">Email: {ref.email}</p>
              )}
              {ref.phone && (
                <p className="text-sm text-gray-700">Phone: {ref.phone}</p>
              )}
              {ref.relationship === "Available upon request" && (
                <p className="text-sm text-gray-500 italic">Available upon request</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomSectionsCard = (customSections: any) => {
    let sectionsList: any[] = [];
    
    if (Array.isArray(customSections)) {
      sectionsList = customSections;
    } else if (typeof customSections === 'object' && customSections !== null) {
      // Convert object to array of sections
      sectionsList = Object.entries(customSections).map(([key, value]) => ({
        title: key,
        content: value
      }));
    }

    return (
      <div key="custom-sections" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Additional Sections</h3>
        </div>
        <div className="space-y-4">
          {sectionsList.map((section, index) => (
            <div key={index} className="border-l-2 border-indigo-200 pl-4">
              <h4 className="font-medium text-gray-900 capitalize">
                {section.title || `Section ${index + 1}`}
              </h4>
              <div className="text-sm text-gray-700 mt-1">
                {typeof section.content === 'string' ? (
                  <p>{section.content}</p>
                ) : Array.isArray(section.content) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {section.content.map((item: any, itemIndex: number) => (
                      <li key={itemIndex}>{String(item)}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(section.content || {}).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="font-medium w-1/3 capitalize">{key}:</span>
                        <span className="w-2/3">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAdditionalInfoCard = (additionalInfo: any) => {
    if (!additionalInfo || typeof additionalInfo !== 'object') return null;

    const infoFields = Object.entries(additionalInfo).filter(([_, value]) => value);
    if (infoFields.length === 0) return null;

    return (
      <div key="additional-info" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
        </div>
        <div className="space-y-2">
          {infoFields.map(([key, value]) => (
            <div key={key} className="flex">
              <span className="font-medium text-gray-600 w-1/3 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-gray-700 w-2/3">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGenericCard = (title: string, data: any, key: string) => {
    if (Array.isArray(data)) {
      return (
        <div key={key} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {title.charAt(0).toUpperCase() + title.slice(1)}
          </h3>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="text-gray-700">
                {typeof item === 'object' ? (
                  <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                ) : (
                  String(item)
                )}
              </div>
            ))}
          </div>
        </div>
      );
    } else if (typeof data === 'object') {
      return (
        <div key={key} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {title.charAt(0).toUpperCase() + title.slice(1)}
          </h3>
          <div className="space-y-2">
            {Object.entries(data).map(([fieldKey, value]) => (
              <div key={fieldKey} className="flex">
                <span className="font-medium text-gray-600 w-1/3">
                  {fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}:
                </span>
                <span className="text-gray-700 w-2/3">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div key={key} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {title.charAt(0).toUpperCase() + title.slice(1)}
          </h3>
          <p className="text-gray-700">{String(data)}</p>
        </div>
      );
    }
  };  // Helper function to check if data has content
  const hasContent = (data: any): boolean => {
    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === 'object') return Object.values(data).some(v => v);
    if (typeof data === 'string') return data.trim().length > 0;
    return true;
  };

  const renderDynamicCards = (result: ResumeProcessingResult): { personalCard: JSX.Element | null, fullWidthCards: JSX.Element[], regularCards: JSX.Element[] } => {
    let personalCard: JSX.Element | null = null;
    const fullWidthCards: JSX.Element[] = [];
    const regularCards: JSX.Element[] = [];
    const structuredData = result.structuredData;

    // Render specific sections with custom components
    Object.entries(structuredData).forEach(([key, value]) => {
      if (!hasContent(value)) return; // Skip cards without data

      const lowerKey = key.toLowerCase();
      
      if (lowerKey.includes('personal') || lowerKey.includes('contact') || lowerKey === 'personalinfo') {
        personalCard = renderPersonalInfoCard(value);
      } else if (lowerKey.includes('experience') || lowerKey.includes('work') || lowerKey === 'workexperience') {
        if (Array.isArray(value) && value.length > 0) {
          fullWidthCards.push(renderWorkExperienceCard(value));
        }
      } else if (lowerKey.includes('education')) {
        if (Array.isArray(value) && value.length > 0) {
          fullWidthCards.push(renderEducationCard(value));
        }
      } else if (lowerKey.includes('skill')) {
        regularCards.push(renderSkillsCard(value));
      } else if (lowerKey.includes('certification') || lowerKey.includes('certificate')) {
        if (Array.isArray(value) && value.length > 0) {
          regularCards.push(renderCertificationsCard(value));
        }
      } else if (lowerKey.includes('interest') || lowerKey.includes('hobby') || lowerKey.includes('hobbies')) {
        regularCards.push(renderInterestsCard(value));
      } else if (lowerKey.includes('project') || lowerKey.includes('portfolio')) {
        if (Array.isArray(value) && value.length > 0) {
          regularCards.push(renderProjectsCard(value));
        }
      } else if (lowerKey.includes('award') || lowerKey.includes('achievement')) {
        if (Array.isArray(value) && value.length > 0) {
          regularCards.push(renderAwardsCard(value));
        }
      } else if (lowerKey.includes('publication')) {
        if (Array.isArray(value) && value.length > 0) {
          regularCards.push(renderPublicationsCard(value));
        }
      } else if (lowerKey.includes('volunteer')) {
        if (Array.isArray(value) && value.length > 0) {
          regularCards.push(renderVolunteerCard(value));
        }
      } else if (lowerKey.includes('conference') || lowerKey.includes('event')) {
        if (Array.isArray(value) && value.length > 0) {
          regularCards.push(renderConferencesCard(value));
        }
      } else if (lowerKey.includes('reference')) {
        regularCards.push(renderReferencesCard(value));
      } else if (lowerKey.includes('custom') || lowerKey.includes('additional')) {
        regularCards.push(renderCustomSectionsCard(value));
      } else if (lowerKey === 'additionalinfo') {
        const additionalCard = renderAdditionalInfoCard(value);
        if (additionalCard) {
          regularCards.push(additionalCard);
        }
      } else {
        // Generic card for any other data
        regularCards.push(renderGenericCard(key, value, key));
      }
    });

    return { personalCard, fullWidthCards, regularCards };
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI-Powered Resume Processing with Comprehensive Schema
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Upload a resume (PDF or DOCX) and our AI will:
            <br />
            1. Extract the text content
            <br />
            2. Use a comprehensive predefined schema covering all resume sections
            <br />
            3. Extract all structured data according to that schema
          </p>
        </div>
        <div className="p-6 space-y-4">
          {/* File Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Choose Resume File
              </label>
              <p className="text-sm text-gray-500">
                Supports PDF and DOCX files (max 10MB)
              </p>
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                onClick={handleProcessResume}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Process Resume
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
      {/* Dynamic Resume Cards */}
      {result && (() => {
        const { personalCard, fullWidthCards, regularCards } = renderDynamicCards(result);
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Resume Information Cards
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  AI-extracted resume data displayed as interactive cards
                </p>
              </div>
            </div>
            
            {/* Personal Information Card - Full Width */}
            {personalCard && (
              <div className="w-full">
                {personalCard}
              </div>
            )}
            
            {/* Full Width Cards (Work Experience, Education) */}
            {fullWidthCards.length > 0 && (
              <div className="space-y-6">
                {fullWidthCards}
              </div>
            )}
            
            {/* Regular Cards - Side by Side Grid */}
            {regularCards.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {regularCards}
              </div>
            )}
          </div>
        );
      })()}


    </div>
  );
};

export default ResumeProcessing;
