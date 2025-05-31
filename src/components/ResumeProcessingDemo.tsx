import React, { useState } from 'react';
import { useDocumentProcessing, ResumeProcessingResult } from '../hooks/useDocumentProcessing';
import Button from './Button';
import { Upload, FileText, Database, Zap, User, Briefcase, GraduationCap, Code, Award, Heart, MapPin, Mail, Phone, Calendar, Building } from 'lucide-react';

const ResumeProcessingDemo: React.FC = () => {
  const { processResumeWithDynamicSchema, loading, error } = useDocumentProcessing();
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

    const processedResult = await processResumeWithDynamicSchema(selectedFile);
    if (processedResult) {
      setResult(processedResult);
    }
  };  const formatJsonDisplay = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };
  // Enhanced dynamic card rendering functions
  const renderPersonalInfoCard = (personalInfo: any) => {
    const fields = [];
    
    // Common personal info fields with icons
    if (personalInfo.name || personalInfo.fullName) {
      fields.push({
        icon: <User className="w-4 h-4" />,
        label: 'Name',
        value: personalInfo.name || personalInfo.fullName
      });
    }
    
    if (personalInfo.email) {
      fields.push({
        icon: <Mail className="w-4 h-4" />,
        label: 'Email',
        value: personalInfo.email
      });
    }
    
    if (personalInfo.phone || personalInfo.phoneNumber) {
      fields.push({
        icon: <Phone className="w-4 h-4" />,
        label: 'Phone',
        value: personalInfo.phone || personalInfo.phoneNumber
      });
    }
    
    if (personalInfo.address || personalInfo.location) {
      fields.push({
        icon: <MapPin className="w-4 h-4" />,
        label: 'Location',
        value: personalInfo.address || personalInfo.location
      });
    }

    // Handle any other fields dynamically
    Object.entries(personalInfo).forEach(([key, value]) => {
      if (!['name', 'fullName', 'email', 'phone', 'phoneNumber', 'address', 'location'].includes(key) && value) {
        fields.push({
          icon: <User className="w-4 h-4" />,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          value: String(value)
        });
      }
    });

    return (
      <div key="personal-info" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        </div>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={index} className="flex items-start gap-3">
              {field.icon}
              <div>
                <span className="text-sm font-medium text-gray-600">{field.label}:</span>
                <span className="ml-2 text-gray-900">{field.value}</span>
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
        <div className="space-y-4">
          {experience.map((job, index) => (
            <div key={index} className="border-l-2 border-blue-200 pl-4">
              <div className="flex items-start gap-2">
                <Building className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {job.position || job.title || job.jobTitle || 'Position'}
                  </h4>
                  <p className="text-blue-600 font-medium">
                    {job.company || job.employer || job.organization || 'Company'}
                  </p>
                  {(job.duration || job.dates || job.startDate || job.endDate) && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {job.duration || 
                         `${job.startDate || ''} - ${job.endDate || 'Present'}` || 
                         job.dates}
                      </span>
                    </div>
                  )}
                  {job.description && (
                    <p className="text-gray-700 text-sm mt-2">{job.description}</p>
                  )}
                  {job.responsibilities && Array.isArray(job.responsibilities) && (
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                      {job.responsibilities.map((resp: string, respIndex: number) => (
                        <li key={respIndex}>{resp}</li>
                      ))}
                    </ul>
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
          <GraduationCap className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Education</h3>
        </div>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div key={index} className="border-l-2 border-green-200 pl-4">
              <h4 className="font-medium text-gray-900">
                {edu.degree || edu.qualification || 'Degree'}
              </h4>
              <p className="text-green-600 font-medium">
                {edu.institution || edu.school || edu.university || 'Institution'}
              </p>
              {(edu.year || edu.graduationDate || edu.dates) && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{edu.year || edu.graduationDate || edu.dates}</span>
                </div>
              )}
              {edu.gpa && (
                <p className="text-sm text-gray-700 mt-1">GPA: {edu.gpa}</p>
              )}
              {edu.description && (
                <p className="text-gray-700 text-sm mt-2">{edu.description}</p>
              )}
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
  };
  const renderDynamicCards = (result: ResumeProcessingResult): JSX.Element[] => {
    const cards: JSX.Element[] = [];
    const structuredData = result.structuredData;

    // Render specific sections with custom components
    Object.entries(structuredData).forEach(([key, value]) => {
      if (!value) return;

      const lowerKey = key.toLowerCase();
      
      if (lowerKey.includes('personal') || lowerKey.includes('contact') || lowerKey === 'personalinfo') {
        cards.push(renderPersonalInfoCard(value));
      } else if (lowerKey.includes('experience') || lowerKey.includes('work') || lowerKey === 'workexperience') {
        if (Array.isArray(value)) {
          cards.push(renderWorkExperienceCard(value));
        }
      } else if (lowerKey.includes('education')) {
        if (Array.isArray(value)) {
          cards.push(renderEducationCard(value));
        }
      } else if (lowerKey.includes('skill')) {
        cards.push(renderSkillsCard(value));
      } else if (lowerKey.includes('certification') || lowerKey.includes('certificate')) {
        if (Array.isArray(value)) {
          cards.push(renderCertificationsCard(value));
        }
      } else if (lowerKey.includes('interest') || lowerKey.includes('hobby') || lowerKey.includes('hobbies')) {
        cards.push(renderInterestsCard(value));
      } else {
        // Generic card for any other data
        cards.push(renderGenericCard(key, value, key));
      }
    });

    return cards;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI-Powered Resume Processing with Dynamic Schema
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Upload a resume (PDF or DOCX) and our AI will:
            <br />
            1. Extract the text content
            <br />
            2. Analyze the content to create a comprehensive schema
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

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Metadata */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Document Information</h3>
            </div>
            <div className="p-6">
              <div className="space-y-2 text-sm">
                <div><strong>Filename:</strong> {result.metadata.filename}</div>
                <div><strong>File Size:</strong> {(result.metadata.size / 1024).toFixed(1)} KB</div>
                <div><strong>File Type:</strong> {result.metadata.type}</div>
                <div><strong>Word Count:</strong> {result.metadata.wordCount}</div>
              </div>
            </div>
          </div>

          {/* Generated Schema */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">AI-Generated Schema</h3>
              <p className="text-sm text-gray-600 mt-1">
                The AI analyzed your resume and created this comprehensive schema
              </p>
            </div>
            <div className="p-6">
              <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-96">
                {formatJsonDisplay(result.generatedSchema)}
              </pre>
            </div>
          </div>

          {/* Extracted Text */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:col-span-1">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Extracted Text</h3>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-3 rounded-lg max-h-96 overflow-auto">
                <pre className="text-xs whitespace-pre-wrap">{result.text}</pre>
              </div>
            </div>
          </div>          {/* Structured Data */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:col-span-1">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Extracted Structured Data</h3>
              <p className="text-sm text-gray-600 mt-1">
                All resume information structured according to the generated schema
              </p>
            </div>
            <div className="p-6">
              <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-96">
                {formatJsonDisplay(result.structuredData)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Resume Cards */}
      {result && (
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderDynamicCards(result)}
          </div>
        </div>
      )}

      {/* Processing Steps Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">How It Works</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold mb-1">1. Extract Text</h4>
              <p className="text-sm text-gray-600">
                AI extracts all text content from your PDF or DOCX resume
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-semibold mb-1">2. Generate Schema</h4>
              <p className="text-sm text-gray-600">
                AI analyzes content to create a comprehensive data structure schema
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-semibold mb-1">3. Extract Data</h4>
              <p className="text-sm text-gray-600">
                AI extracts all information according to the generated schema
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeProcessingDemo;
