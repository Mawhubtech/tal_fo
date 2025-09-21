import React, { useState } from 'react';
import { useDocumentProcessing, ResumeProcessingResult } from '../hooks/useDocumentProcessing';
import Button from './Button'; // Assuming Button is a custom component
import { Upload, FileText, Database, Zap, User, Briefcase, GraduationCap, Code, Award, Heart, MapPin, Mail, Phone, Calendar, Info, CheckCircle, AlertTriangle, Package } from 'lucide-react';

// --- Enhanced Helper Functions ---
const cardBaseStyle = "bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl";
const cardHeaderStyle = "flex items-center gap-3 p-5 border-b border-slate-200 bg-slate-50/50";
const cardTitleStyle = "text-lg font-semibold text-slate-800";
const cardContentStyle = "p-5 space-y-4 text-slate-700";

const hasContent = (data: any): boolean => {
    if (data === null || data === undefined) return false;
    if (typeof data === 'string') {
        const trimmedData = data.trim();
        if (trimmedData === "" || trimmedData.toLowerCase() === "null") return false;
    }
    if (Array.isArray(data)) {
        if (data.length === 0) return false;
        return data.some(item => hasContent(item)); // True if at least one item has REAL content
    }
    if (typeof data === 'object' && data !== null) { // Check data !== null for objects
        if (Object.keys(data).length === 0) return false;
        return Object.values(data).some(v => hasContent(v)); // True if at least one value has REAL content
    }
    // For numbers, booleans (true/false considered as content), non-empty/non-"null" strings
    return true; 
};

const getDisplayableValue = (...values: (string | null | undefined)[]): string | null => {
    for (const value of values) {
        if (hasContent(value)) return value as string;
    }
    return null;
};

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
    setResult(null); // Clear previous results
    const processedResult = await processResumeWithPredefinedSchema(selectedFile);
    if (processedResult) {
      setResult(processedResult);
    }
  };
  
  const renderDisplayableField = (label: string, value: any, icon?: JSX.Element, customValueRender?: (val: any) => JSX.Element) => {
    if (!hasContent(value)) return null;
    return (
        <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors duration-300">
            {icon && (
                 <div className="p-2 bg-white/10 rounded-full flex-shrink-0 mt-1">
                    {icon}
                </div>
            )}
            <div className="flex-1">
                <span className="block text-sm font-medium text-sky-100 opacity-90">{label}</span>
                {customValueRender ? customValueRender(value) : <p className="text-white font-semibold text-lg break-words">{String(value)}</p>}
            </div>
        </div>
    );
  };


  const renderPersonalInfoCard = (personalInfo: any) => {
    if (!hasContent(personalInfo)) return null;
    
    const fieldsToRender = [
        renderDisplayableField('Name', getDisplayableValue(personalInfo.fullName, personalInfo.name), <User className="w-6 h-6 text-sky-400" />),
        renderDisplayableField('Email', personalInfo.email, <Mail className="w-6 h-6 text-rose-400" />),
        renderDisplayableField('Phone', getDisplayableValue(personalInfo.phone, personalInfo.phoneNumber), <Phone className="w-6 h-6 text-emerald-400" />),
        renderDisplayableField('Location', getDisplayableValue(personalInfo.location, personalInfo.address, personalInfo.city, personalInfo.country), <MapPin className="w-6 h-6 text-purple-400" />),
        renderDisplayableField('Website', personalInfo.website, <Zap className="w-6 h-6 text-teal-400" />), // Example adding website
        renderDisplayableField('LinkedIn', personalInfo.linkedIn, <User className="w-6 h-6 text-blue-400" />), // Example
        renderDisplayableField('GitHub', personalInfo.github, <Code className="w-6 h-6 text-slate-400" />), // Example
    ];

    // Dynamically add other fields not explicitly handled, if they have content
    const explicitlyHandledKeys = ['fullName', 'name', 'email', 'phone', 'phoneNumber', 'location', 'address', 'city', 'country', 'website', 'linkedIn', 'github'];
    Object.entries(personalInfo).forEach(([key, value]) => {
        if (!explicitlyHandledKeys.includes(key) && hasContent(value)) {
            const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            fieldsToRender.push(renderDisplayableField(label, value, <Info className="w-6 h-6 text-amber-400" />));
        }
    });

    const validFields = fieldsToRender.filter(Boolean);
    if (validFields.length === 0) return null;

    return (
      <div key="personal-info" className="rounded-xl shadow-2xl p-6 md:p-8 bg-gradient-to-br from-sky-600 via-indigo-600 to-purple-700 text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-white/20 rounded-full">
            <User className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-3xl font-bold">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {validFields}
        </div>
      </div>
    );
  };

  const renderWorkExperienceCard = (experience: any[]) => {
    const validExperience = experience.filter(job => hasContent(job));
    if (validExperience.length === 0) return null;

    return (
      <div key="work-experience" className={cardBaseStyle}>
        <div className={cardHeaderStyle}>
          <Briefcase className="w-6 h-6 text-sky-600" />
          <h3 className={cardTitleStyle}>Work Experience</h3>
        </div>
        <div className={`${cardContentStyle} space-y-8`}>
          {validExperience.map((job, index) => {
            const position = getDisplayableValue(job.position, job.title, job.jobTitle) || 'Position Not Specified';
            const company = getDisplayableValue(job.company, job.employer, job.organization) || 'Company Not Specified';
            
            const startDate = getDisplayableValue(job.startDate);
            const endDate = getDisplayableValue(job.endDate);
            let dateInfo = getDisplayableValue(job.duration);
            if (!dateInfo && (startDate || endDate)) {
                dateInfo = `${startDate || 'Start Date N/A'} - ${endDate || 'Present'}`;
            }
            dateInfo = getDisplayableValue(dateInfo, job.dates);


            const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities.filter(r => hasContent(r)) : [];
            const achievements = Array.isArray(job.achievements) ? job.achievements.filter(a => hasContent(a)) : [];
            const technologies = Array.isArray(job.technologies) ? job.technologies.filter(t => hasContent(t)) : [];

            return (
              <div key={index} className="relative pl-8 group">
                <div className="absolute left-0 top-1 w-4 h-4 bg-sky-500 rounded-full border-4 border-white ring-2 ring-sky-200 group-hover:ring-sky-400 transition-all"></div>
                {index !== validExperience.length - 1 && <div className="absolute left-[6px] top-5 h-[calc(100%-1rem)] w-0.5 bg-sky-200 group-hover:bg-sky-300 transition-all"></div>}
                
                <div className="bg-gradient-to-r from-sky-50/70 via-white to-white p-4 rounded-lg border-l-4 border-sky-500 hover:border-sky-600 transition-colors shadow-sm hover:shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-800">{position}</h4>
                      <p className="text-sky-700 font-medium text-base">{company}</p>
                    </div>
                    {hasContent(dateInfo) && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-full shadow-sm mt-2 sm:mt-0 ring-1 ring-slate-200/80">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="font-medium">{dateInfo}</span>
                      </div>
                    )}
                  </div>
                  
                  {hasContent(job.location) && (
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  
                  {hasContent(job.description) && <p className="text-slate-600 text-sm mb-3 leading-relaxed">{job.description}</p>}
                  
                  {responsibilities.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-semibold text-slate-700 mb-1.5">Key Responsibilities:</h5>
                      <ul className="space-y-1.5">
                        {responsibilities.map((resp: string, respIndex: number) => (
                          <li key={respIndex} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {achievements.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-semibold text-slate-700 mb-1.5">Key Achievements:</h5>
                      <ul className="space-y-1.5">
                        {achievements.map((achievement: string, achIndex: number) => (
                          <li key={achIndex} className="flex items-start gap-2 text-sm text-slate-600">
                            <Award className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {technologies.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-slate-700 mb-1.5">Technologies Used:</h5>
                      <div className="flex flex-wrap gap-2">
                        {technologies.map((tech: string, techIndex: number) => (
                          <span key={techIndex} className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-medium shadow-sm hover:bg-sky-200 transition-colors">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEducationCard = (education: any[]) => {
    const validEducation = education.filter(edu => hasContent(edu));
    if (validEducation.length === 0) return null;

    return (
        <div key="education" className={cardBaseStyle}>
            <div className={cardHeaderStyle}>
                <GraduationCap className="w-6 h-6 text-emerald-600" />
                <h3 className={cardTitleStyle}>Education</h3>
            </div>
            <div className={`${cardContentStyle} space-y-8`}>
                {validEducation.map((edu, index) => {
                    const degree = getDisplayableValue(edu.degree, edu.qualification) || 'Degree Not Specified';
                    const institution = getDisplayableValue(edu.institution, edu.school, edu.university) || 'Institution Not Specified';
                    
                    const startDate = getDisplayableValue(edu.startDate);
                    const endDate = getDisplayableValue(edu.endDate);
                    let dateInfo = getDisplayableValue(edu.year, edu.graduationDate);
                    if (!dateInfo && (startDate || endDate)) {
                        dateInfo = `${startDate || ''} - ${endDate || 'Present'}`;
                    }
                    dateInfo = getDisplayableValue(dateInfo, edu.dates);

                    const courses = Array.isArray(edu.courses || edu.relevantCoursework) ? (edu.courses || edu.relevantCoursework).filter((c:string) => hasContent(c)) : [];
                    const honors = Array.isArray(edu.honors) ? edu.honors.filter((h:string) => hasContent(h)) : [];


                    return (
                        <div key={index} className="relative pl-8 group">
                            <div className="absolute left-0 top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white ring-2 ring-emerald-200 group-hover:ring-emerald-400 transition-all"></div>
                            {index !== validEducation.length - 1 && <div className="absolute left-[6px] top-5 h-[calc(100%-1rem)] w-0.5 bg-emerald-200 group-hover:bg-emerald-300 transition-all"></div>}
                            
                            <div className="bg-gradient-to-r from-emerald-50/70 via-white to-white p-4 rounded-lg border-l-4 border-emerald-500 hover:border-emerald-600 transition-colors shadow-sm hover:shadow-md">
                                <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-slate-800">{degree}</h4>
                                        <p className="text-emerald-700 font-medium text-base">{institution}</p>
                                    </div>
                                    {hasContent(dateInfo) && (
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-full shadow-sm mt-2 sm:mt-0 ring-1 ring-slate-200/80">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                            <span className="font-medium">{dateInfo}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {hasContent(edu.location) && <p className="text-sm text-slate-500 mb-1"><MapPin className="inline w-3.5 h-3.5 mr-1" />{edu.location}</p>}
                                {hasContent(edu.field) && <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">Field:</span> {edu.field}</p>}
                                {hasContent(edu.major) && <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">Major:</span> {edu.major}</p>}
                                {hasContent(edu.minor) && <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">Minor:</span> {edu.minor}</p>}
                                {hasContent(edu.gpa) && <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">GPA:</span> {edu.gpa}</p>}
                                {hasContent(edu.description) && <p className="text-sm text-slate-600 mt-2">{edu.description}</p>}
                                {hasContent(edu.thesis) && <p className="text-sm text-slate-600 italic mt-2"><span className="font-medium text-slate-700 not-italic">Thesis:</span> {edu.thesis}</p>}

                                {courses.length > 0 && (
                                    <div className="mt-3">
                                        <h5 className="text-sm font-semibold text-slate-700 mb-1.5">Relevant Courses:</h5>
                                        <div className="flex flex-wrap gap-2">
                                        {courses.map((course: string, cIndex: number) => (
                                            <span key={cIndex} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium shadow-sm hover:bg-emerald-200 transition-colors">{course}</span>
                                        ))}
                                        </div>
                                    </div>
                                )}
                                {honors.length > 0 && (
                                    <div className="mt-3">
                                        <h5 className="text-sm font-semibold text-slate-700 mb-1.5">Honors:</h5>
                                        <ul className="space-y-1">
                                        {honors.map((honor: string, hIndex: number) => (
                                            <li key={hIndex} className="flex items-start gap-2 text-sm text-slate-600"><Award className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />{honor}</li>
                                        ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const renderSkillsCard = (skillsData: any) => {
    let allSkillsList: string[] = [];

    if (typeof skillsData === 'object' && skillsData !== null) {
        Object.values(skillsData).forEach((category: any) => { // category can be array of skills or string of skills
            if (Array.isArray(category)) {
                category.forEach(skill => { if (hasContent(skill)) allSkillsList.push(String(skill)); });
            } else if (typeof category === 'string' && hasContent(category)) { // If a category is a single string, not an array
                String(category).split(',').forEach(s => { const trimmed = s.trim(); if (hasContent(trimmed)) allSkillsList.push(trimmed); });
            }
        });
    } else if (Array.isArray(skillsData)) {
        skillsData.forEach(skill => { if (hasContent(skill)) allSkillsList.push(String(skill)); });
    } else if (typeof skillsData === 'string' && hasContent(skillsData)) {
        skillsData.split(',').forEach(s => { const trimmed = s.trim(); if (hasContent(trimmed)) allSkillsList.push(trimmed); });
    }
    
    allSkillsList = [...new Set(allSkillsList)]; // Deduplicate

    if (allSkillsList.length === 0) return null;

    return (
      <div key="skills" className={cardBaseStyle}>
        <div className={cardHeaderStyle}>
          <Code className="w-6 h-6 text-sky-600" />
          <h3 className={cardTitleStyle}>Skills</h3>
        </div>
        <div className={`${cardContentStyle} flex flex-wrap gap-2`}>
          {allSkillsList.map((skill, index) => (
            <span key={index} className="px-3.5 py-1.5 bg-sky-100 text-sky-800 rounded-full text-sm font-medium shadow-sm hover:bg-sky-200 hover:shadow-md transition-all duration-200">
              {skill}
            </span>
          ))}
        </div>
      </div>
    );
  };
  
  const renderCertificationsCard = (certifications: any[]) => {
    const validCerts = certifications.filter(cert => hasContent(cert) && (hasContent(cert.name) || hasContent(cert.title) || hasContent(cert.certification)));
    if (validCerts.length === 0) return null;

    return (
      <div key="certifications" className={cardBaseStyle}>
        <div className={cardHeaderStyle}>
          <Award className="w-6 h-6 text-amber-500" />
          <h3 className={cardTitleStyle}>Certifications</h3>
        </div>
        <div className={`${cardContentStyle} space-y-4`}>
          {validCerts.map((cert, index) => {
            const name = getDisplayableValue(cert.name, cert.title, cert.certification) || "Certification";
            const date = getDisplayableValue(cert.date, cert.year, cert.dateIssued);
            return (
                <div key={index} className="flex items-start gap-3 p-3 bg-amber-50/70 rounded-lg hover:shadow-sm transition-shadow border border-amber-100 hover:border-amber-200">
                <Award className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold text-slate-800">{name}</h4>
                    {hasContent(cert.issuer) && <p className="text-sm text-slate-600">{cert.issuer}</p>}
                    {hasContent(date) && <p className="text-xs text-slate-500 mt-0.5">{date}</p>}
                    {hasContent(cert.description) && <p className="text-xs text-slate-500 mt-1">{cert.description}</p>}
                </div>
                </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const renderAwardsCard = (awards: any[]) => {
    const validAwards = awards.filter(award => hasContent(award) && (hasContent(award.name) || hasContent(award.title)));
    if (validAwards.length === 0) return null;

    return (
      <div key="awards" className={cardBaseStyle}>
        <div className={cardHeaderStyle}>
          <Award className="w-6 h-6 text-yellow-500" /> {/* Different shade for distinction */}
          <h3 className={cardTitleStyle}>Awards & Achievements</h3>
        </div>
        <div className={`${cardContentStyle} space-y-4`}>
          {validAwards.map((award, index) => {
            const name = getDisplayableValue(award.name, award.title) || "Award";
            return(
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50/70 rounded-lg hover:shadow-sm transition-shadow border border-yellow-100 hover:border-yellow-200">
                <Award className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold text-slate-800">{name}</h4>
                    {hasContent(award.issuer) && <p className="text-sm text-slate-600">{award.issuer}</p>}
                    {hasContent(award.date) && <p className="text-xs text-slate-500 mt-0.5">{award.date}</p>}
                    {hasContent(award.description) && <p className="text-sm text-slate-600 mt-1">{award.description}</p>}
                </div>
                </div>
            );
          })}
        </div>
      </div>
    );
  };


    const renderInterestsCard = (interests: any) => {
        let interestsList: string[] = [];
        if (Array.isArray(interests)) { interests.forEach(i => { if(hasContent(i)) interestsList.push(String(i)); }); }
        else if (typeof interests === 'string' && hasContent(interests)) { interests.split(',').forEach(s => { const trimmed = s.trim(); if(hasContent(trimmed)) interestsList.push(trimmed); }); }
        
        interestsList = [...new Set(interestsList)]; // Deduplicate

        if (interestsList.length === 0) return null;

        return (
            <div key="interests" className={cardBaseStyle}>
                <div className={cardHeaderStyle}>
                    <Heart className="w-6 h-6 text-pink-500" />
                    <h3 className={cardTitleStyle}>Interests</h3>
                </div>
                <div className={`${cardContentStyle} flex flex-wrap gap-2`}>
                    {interestsList.map((interest, index) => (
                        <span key={index} className="px-3.5 py-1.5 bg-pink-100 text-pink-800 rounded-full text-sm font-medium shadow-sm hover:bg-pink-200 hover:shadow-md transition-all duration-200">
                            {interest}
                        </span>
                    ))}
                </div>
            </div>
        );
    };
    
    const renderProjectsCard = (projects: any[]) => {
        const validProjects = projects.filter(p => hasContent(p) && (hasContent(p.name) || hasContent(p.title)));
        if (validProjects.length === 0) return null;
    
        return (
          <div key="projects" className={cardBaseStyle}>
            <div className={cardHeaderStyle}>
              <Package className="w-6 h-6 text-purple-600" /> {/* Changed icon */}
              <h3 className={cardTitleStyle}>Projects</h3>
            </div>
            <div className={`${cardContentStyle} space-y-6`}>
              {validProjects.map((project, index) => {
                const name = getDisplayableValue(project.name, project.title) || "Project";
                const technologies = Array.isArray(project.technologies) ? project.technologies.filter(t => hasContent(t)) : [];
                return (
                  <div key={index} className="p-4 rounded-lg border border-purple-100 hover:border-purple-200 bg-purple-50/50 shadow-sm hover:shadow-md transition-all">
                    <h4 className="font-semibold text-lg text-purple-800 mb-1">{name}</h4>
                    {hasContent(project.description) && (
                      <p className="text-slate-600 text-sm mt-1 mb-3">{project.description}</p>
                    )}
                    {technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 mb-3">
                        {technologies.map((tech: string, techIndex: number) => (
                          <span key={techIndex} className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium shadow-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-4 text-sm mt-2">
                        {hasContent(project.url) && <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 hover:underline">Project Link</a>}
                        {hasContent(project.github) && <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 hover:underline">GitHub</a>}
                        {hasContent(project.demo) && <a href={project.demo} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 hover:underline">Demo</a>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      };

    const renderGenericCard = (title: string, data: any, key: string) => {
        if (!hasContent(data)) return null;
    
        const displayTitle = title.charAt(0).toUpperCase() + title.slice(1).replace(/([A-Z])/g, ' $1');
    
        return (
          <div key={key} className={cardBaseStyle}>
            <div className={cardHeaderStyle}>
              <Info className="w-6 h-6 text-slate-500" />
              <h3 className={cardTitleStyle}>{displayTitle}</h3>
            </div>
            <div className={cardContentStyle}>
              {Array.isArray(data) ? (
                <ul className="space-y-2 list-disc list-inside pl-2">
                  {data.filter(hasContent).map((item, index) => (
                    <li key={index} className="text-slate-600">
                      {typeof item === 'object' ? (
                        <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto shadow-sm">{JSON.stringify(item, null, 2)}</pre>
                      ) : (
                        String(item)
                      )}
                    </li>
                  ))}
                </ul>
              ) : typeof data === 'object' ? (
                <div className="space-y-3">
                  {Object.entries(data).filter(([_, val]) => hasContent(val)).map(([fieldKey, value]) => (
                    <div key={fieldKey} className="flex flex-col sm:flex-row py-1">
                      <span className="font-medium text-slate-700 sm:w-1/3 capitalize mb-0.5 sm:mb-0">
                        {fieldKey.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-slate-600 sm:w-2/3 break-words">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : ( // Simple string, number, or boolean
                <p className="text-slate-600">{String(data)}</p>
              )}
            </div>
          </div>
        );
      };

  const renderDynamicCards = (currentResult: ResumeProcessingResult): { personalCard: JSX.Element | null, summaryCard: JSX.Element | null, fullWidthCards: JSX.Element[], regularCards: JSX.Element[] } => {
    let personalCard: JSX.Element | null = null;
    let summaryCard: JSX.Element | null = null;
    const fullWidthCards: JSX.Element[] = [];
    const regularCards: JSX.Element[] = [];
    const structuredData = currentResult.structuredData || {};

    Object.entries(structuredData).forEach(([key, value]) => {
      if (!hasContent(value)) return; // Skip entirely if top-level key has no content

      const lowerKey = key.toLowerCase();
      let cardRenderedHandled = true; // Assume handled, set to false if generic needed

      if (lowerKey.includes('personal') || lowerKey.includes('contact') || lowerKey === 'personalinfo') {
        personalCard = renderPersonalInfoCard(value);
      } else if (lowerKey.includes('summary') || lowerKey.includes('objective')) {
        summaryCard = renderGenericCard(key, value, key); // Summary can be generic or a custom one
      } else if (lowerKey.includes('experience') || lowerKey.includes('work')) {
        if (Array.isArray(value)) fullWidthCards.push(renderWorkExperienceCard(value)); else cardRenderedHandled = false;
      } else if (lowerKey.includes('education')) {
        if (Array.isArray(value)) fullWidthCards.push(renderEducationCard(value)); else cardRenderedHandled = false;
      } else if (lowerKey.includes('skill')) {
        regularCards.push(renderSkillsCard(value));
      } else if (lowerKey.includes('certification') || lowerKey.includes('certificate')) {
        if (Array.isArray(value)) regularCards.push(renderCertificationsCard(value)); else cardRenderedHandled = false;
      } else if (lowerKey.includes('award')) { // Ensure 'awards' is distinct from 'certifications' if needed
        if (Array.isArray(value)) regularCards.push(renderAwardsCard(value)); else cardRenderedHandled = false;
      } else if (lowerKey.includes('interest') || lowerKey.includes('hobby')) {
        regularCards.push(renderInterestsCard(value));
      } else if (lowerKey.includes('project')) {
        if (Array.isArray(value)) regularCards.push(renderProjectsCard(value)); else cardRenderedHandled = false;
      }
      // ... Add more specific handlers for publications, volunteer, conferences, references, additionalInfo, customSections
      // Example:
      // else if (lowerKey.includes('publication')) { if (Array.isArray(value)) regularCards.push(renderPublicationsCard(value)); else cardRenderedHandled = false; }
      else {
        cardRenderedHandled = false; // Not handled by a specific renderer
      }
      
      if(!cardRenderedHandled){ // If not handled by specific renderers above, use generic
        const generic = renderGenericCard(key, value, key);
        if(generic) regularCards.push(generic);
      }
    });
    // Filter out any nulls that might have slipped in (e.g. if a render function returned null)
    return { personalCard, summaryCard, fullWidthCards: fullWidthCards.filter(Boolean), regularCards: regularCards.filter(Boolean) };
  };

  const { personalCard, summaryCard, fullWidthCards, regularCards } = result ? renderDynamicCards(result) : { personalCard: null, summaryCard: null, fullWidthCards: [], regularCards: [] };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-sky-600 to-indigo-700 text-white">
                <div className="flex items-center gap-3">
                    <Zap className="h-8 w-8 text-yellow-300" />
                    <h2 className="text-2xl md:text-3xl font-bold">AI Resume Parser</h2>
                </div>
                <p className="text-sm text-sky-100 mt-2">
                    Upload a resume (PDF or DOCX). Our AI will extract, structure, and display the information.
                </p>
            </div>
          <div className="p-6 space-y-6">
            <div className="group border-2 border-dashed border-sky-300 rounded-xl p-6 md:p-10 text-center hover:border-sky-500 transition-colors duration-300 ease-in-out cursor-pointer" onClick={() => document.getElementById('resume-upload')?.click()}>
              <Upload className="mx-auto h-16 w-16 text-sky-400 mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-sky-500" />
              <input type="file" accept=".pdf,.docx" onChange={handleFileSelect} className="hidden" id="resume-upload" />
              <label htmlFor="resume-upload" className="cursor-pointer text-sky-600 font-semibold group-hover:text-sky-700 transition-colors">
                {selectedFile ? `Selected: ${selectedFile.name}` : "Click to upload or drag & drop resume"}
              </label>
              <p className="text-xs text-slate-500 mt-2">Supports PDF and DOCX files (max 10MB)</p>
            </div>

            {selectedFile && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-sky-50 rounded-lg border border-sky-200 shadow-sm">
                <div className="flex items-center gap-3 text-sm mb-3 sm:mb-0">
                  <FileText className="h-5 w-5 text-sky-600 flex-shrink-0" />
                  <span className="font-medium text-slate-700 truncate max-w-[200px] sm:max-w-xs md:max-w-sm" title={selectedFile.name}>{selectedFile.name}</span>
                  <span className="text-xs text-slate-500">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <Button
                  onClick={handleProcessResume}
                  disabled={loading}
                  className="!px-6 !py-2.5 !text-sm !font-medium !rounded-lg !text-white !bg-indigo-600 hover:!bg-indigo-700 focus:!outline-none focus:!ring-2 focus:!ring-offset-2 focus:!ring-indigo-500 disabled:!opacity-60 disabled:!cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {loading ? ( <> <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-t-2 border-white"></div> Processing...</>
                  ) : ( <> <Database className="h-5 w-5" /> Process Resume </> )}
                </Button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-100 border-l-4 border-red-500 rounded-r-lg shadow-md">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="space-y-8">
            {(personalCard || summaryCard || fullWidthCards.length > 0 || regularCards.length > 0) && (
                <div className={cardBaseStyle}>
                    <div className={`${cardHeaderStyle} justify-between`}>
                        <div className="flex items-center gap-3">
                            <Database className="w-6 h-6 text-indigo-500" />
                            <h3 className={cardTitleStyle}>Extracted Resume Information</h3>
                        </div>
                        <span className="text-xs text-slate-500">AI Processed</span>
                    </div>
                </div>
            )}
            
            {personalCard}
            {summaryCard} 
            
            {fullWidthCards.length > 0 && (
              <div className="space-y-8">
                {fullWidthCards}
              </div>
            )}
            
            {regularCards.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {regularCards}
              </div>
            )}
             {!(personalCard || summaryCard || fullWidthCards.length > 0 || regularCards.length > 0) && !loading && (
                <div className={`${cardBaseStyle} text-center`}>
                    <div className={cardContentStyle}>
                        <Info className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                        <p className="text-slate-600 font-medium">No displayable content found in the resume.</p>
                        <p className="text-sm text-slate-500">The AI processed the document, but key information might be missing or in an unexpected format.</p>
                    </div>
                </div>
             )}
          </div>
        )}
        {!result && selectedFile && !loading && (
            <div className={`${cardBaseStyle} text-center`}>
                <div className={cardContentStyle}>
                    <Info className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                    <p className="text-slate-600 font-medium">Your selected resume is ready.</p>
                    <p className="text-sm text-slate-500">Click "Process Resume" to see the extracted data.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ResumeProcessing;
