import React, { useState, useEffect } from 'react';
import { X, FileText, Upload, Sparkles, User } from 'lucide-react';
import { useDocumentProcessing, ResumeStructure } from '../hooks/useDocumentProcessing';

interface ResumeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResumeProcessed?: (data: ResumeStructure) => void;
}

const ResumeDialog: React.FC<ResumeDialogProps> = ({ isOpen, onClose, onResumeProcessed }) => {
  const [resumeData, setResumeData] = useState<ResumeStructure | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [documentError, setDocumentError] = useState<string | null>(null);
  
  // Document processing hook
  const documentProcessor = useDocumentProcessing();
  
  // Reset errors when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setDocumentError(null);
      documentProcessor.reset();
    }
  }, [isOpen]);

  // Update from document processor error
  useEffect(() => {
    if (documentProcessor.error) {
      setDocumentError(documentProcessor.error);
    }
  }, [documentProcessor.error]);
  
  if (!isOpen) return null;
  
  const handleUploadResume = () => {
    // Clear previous errors
    setDocumentError(null);
    
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt';
    fileInput.click();
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          console.log('Resume file selected:', file.name);
          
          // Process the resume with our specialized resume processing method
          const processedDocument = await documentProcessor.processResume(file);
          
          if (processedDocument) {
            // Store the raw text
            setRawText(processedDocument.enhancedText || processedDocument.text);
            
            // Store and pass the structured data
            if (processedDocument.structuredData) {
              const resumeData = processedDocument.structuredData as ResumeStructure;
              setResumeData(resumeData);
              
              // Pass to parent if callback provided
              if (onResumeProcessed) {
                onResumeProcessed(resumeData);
              }
            }
          }
        } catch (error) {
          console.error('Error processing resume:', error);
          if (error instanceof Error) {
            setDocumentError(error.message);
          } else {
            setDocumentError('Failed to process resume');
          }
        }
      }
    };
  };

  const renderContactInfo = (contactInfo?: ResumeStructure['contactInfo']) => {
    if (!contactInfo) return null;
    
    return (
      <div className="space-y-1">
        {contactInfo.email && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Email:</span>
            <span>{contactInfo.email}</span>
          </div>
        )}
        {contactInfo.phone && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Phone:</span>
            <span>{contactInfo.phone}</span>
          </div>
        )}
        {contactInfo.location && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Location:</span>
            <span>{contactInfo.location}</span>
          </div>
        )}
      </div>
    );
  };

  const renderEducation = (education?: ResumeStructure['education']) => {
    if (!education || education.length === 0) return null;
    
    return (
      <div className="space-y-3">
        <h3 className="text-md font-semibold text-gray-800">Education</h3>
        {education.map((edu, index) => (
          <div key={index} className="border-l-2 border-blue-500 pl-3">
            <div className="font-medium">{edu.degree}</div>
            <div>{edu.institution}</div>
            {edu.graduationDate && <div className="text-sm text-gray-600">{edu.graduationDate}</div>}
          </div>
        ))}
      </div>
    );
  };

  const renderWorkExperience = (experience?: ResumeStructure['workExperience']) => {
    if (!experience || experience.length === 0) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-800">Work Experience</h3>
        {experience.map((job, index) => (
          <div key={index} className="border-l-2 border-green-500 pl-3">
            <div className="font-medium">{job.title}</div>
            <div>{job.company}</div>
            {(job.startDate || job.endDate) && (
              <div className="text-sm text-gray-600">
                {job.startDate || 'N/A'} - {job.endDate || 'Present'}
              </div>
            )}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <ul className="list-disc list-inside text-sm mt-1">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = (skills?: ResumeStructure['skills']) => {
    if (!skills) return null;
    
    return (
      <div className="space-y-3">
        <h3 className="text-md font-semibold text-gray-800">Skills</h3>
        
        {skills.technical && skills.technical.length > 0 && (
          <div>
            <h4 className="font-medium">Technical Skills</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {skills.technical.map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {skills.soft && skills.soft.length > 0 && (
          <div className="mt-2">
            <h4 className="font-medium">Soft Skills</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {skills.soft.map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 flex-shrink-0 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-medium">Resume Parser</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!resumeData ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Upload a Resume</h3>
                <p className="text-gray-600">Upload a resume or CV to extract structured information</p>
              </div>
              <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleUploadResume}
                disabled={documentProcessor.loading}
              >
                {documentProcessor.loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload Resume
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Extracted Resume Data */}
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-blue-800">
                    {resumeData.name || 'Resume Data'}
                  </h3>
                  <button 
                    onClick={() => {
                      setResumeData(null);
                      setRawText('');
                    }}
                    className="text-xs text-blue-600 underline"
                  >
                    Reset
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Contact Info */}
                  {renderContactInfo(resumeData.contactInfo)}
                  
                  {/* Summary */}
                  {resumeData.summary && (
                    <div>
                      <h3 className="text-md font-semibold text-gray-800">Summary</h3>
                      <p className="mt-1 text-gray-700">{resumeData.summary}</p>
                    </div>
                  )}
                  
                  {/* Skills */}
                  {renderSkills(resumeData.skills)}
                  
                  {/* Education */}
                  {renderEducation(resumeData.education)}
                  
                  {/* Work Experience */}
                  {renderWorkExperience(resumeData.workExperience)}
                </div>
              </div>
              
              {/* Raw Text Section */}
              {rawText && (
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-2">Raw Text</h3>
                  <div className="border border-gray-300 rounded-md p-3 bg-gray-50 max-h-60 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap">{rawText}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {documentError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700 font-medium">Error:</p>
              <p className="text-sm text-red-700">{documentError}</p>
              <button 
                onClick={() => setDocumentError(null)}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDialog;
