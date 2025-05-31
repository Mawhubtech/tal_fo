import React, { useState } from 'react';
import { FileText, User, PlusCircle } from 'lucide-react';
import JobDescriptionDialog from './JobDescriptionDialog';
import ResumeDialog from './ResumeDialog';
import { ResumeStructure } from '../hooks/useDocumentProcessing';

const DocumentProcessingDemo = () => {
  const [isJobDescriptionOpen, setIsJobDescriptionOpen] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [latestResume, setLatestResume] = useState<ResumeStructure | null>(null);

  const handleResumeProcessed = (resumeData: ResumeStructure) => {
    console.log('Resume processed:', resumeData);
    setLatestResume(resumeData);
  };

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Document Processing Demo</h1>
        
        <p className="text-gray-700">
          This demo showcases the document processing capabilities for different document types.
          You can upload job descriptions or resumes and get structured data extracted.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Description Card */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold">Job Description Processing</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Upload a job description document to extract structured information like required skills,
              experience level, job title, and responsibilities.
            </p>
            
            <button
              onClick={() => setIsJobDescriptionOpen(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
            >
              <PlusCircle size={18} />
              Process Job Description
            </button>
          </div>
          
          {/* Resume Card */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Resume Processing</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Upload a resume or CV to extract structured information like contact details,
              work experience, education history, and skills.
            </p>
            
            <button
              onClick={() => setIsResumeDialogOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              <PlusCircle size={18} />
              Process Resume
            </button>
          </div>
        </div>
        
        {/* Latest Processed Resume */}
        {latestResume && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Latest Processed Resume</h2>
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-medium">{latestResume.name || 'Unnamed Candidate'}</h3>
              
              {latestResume.contactInfo && (
                <div className="mt-2">
                  {latestResume.contactInfo.email && (
                    <p className="text-sm">Email: {latestResume.contactInfo.email}</p>
                  )}
                  {latestResume.contactInfo.phone && (
                    <p className="text-sm">Phone: {latestResume.contactInfo.phone}</p>
                  )}
                </div>
              )}
              
              {latestResume.skills && latestResume.skills.technical && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium">Skills:</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {latestResume.skills.technical.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Dialog Components */}
      <JobDescriptionDialog
        isOpen={isJobDescriptionOpen}
        onClose={() => setIsJobDescriptionOpen(false)}
      />
      
      <ResumeDialog
        isOpen={isResumeDialogOpen}
        onClose={() => setIsResumeDialogOpen(false)}
        onResumeProcessed={handleResumeProcessed}
      />
    </div>
  );
};

export default DocumentProcessingDemo;
