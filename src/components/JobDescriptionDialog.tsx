import React, { useState, useEffect } from 'react';
import { X, FileText, Upload, Sparkles } from 'lucide-react';
import { useAIStructuredQuery, useAIQuery, useDocumentProcessing } from '../hooks/ai';

interface JobDescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const JobDescriptionDialog: React.FC<JobDescriptionDialogProps> = ({ isOpen, onClose }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [extractedCriteria, setExtractedCriteria] = useState<any>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  // Add a state for document processing errors
  const [documentError, setDocumentError] = useState<string | null>(null);
  // AI hooks for different purposes
  const aiQuery = useAIQuery(); // For generating job descriptions
  const structuredQuery = useAIStructuredQuery(); // For extracting structured search criteria
  const documentProcessor = useDocumentProcessing(); // For processing uploaded documents
  
  // Effect to update job description when AI query completes
  useEffect(() => {
    if (aiQuery.data && aiQuery.data.content) {
      setJobDescription(aiQuery.data.content);
    }
  }, [aiQuery.data]);

  // Effect to update document error from document processor
  useEffect(() => {
    if (documentProcessor.error) {
      setDocumentError(documentProcessor.error);
    }
  }, [documentProcessor.error]);
  
  if (!isOpen) return null;
  
  const handleUpload = () => {
    // Clear previous errors
    setDocumentError(null);
    
    // Handle file upload with document processing
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt';
    fileInput.click();
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {          console.log('File selected:', file.name);
          
          // Use our specialized job description processing method
          const processedDocument = await documentProcessor.processJobDescription(file, {
            // Custom system prompt for better job description extraction
            systemPrompt: "You are an expert recruitment specialist. Extract structured information from job descriptions for talent search. Focus on key requirements, skills needed, experience level, and job responsibilities. Format everything professionally."
          });
          
          if (processedDocument) {
            // Set the extracted text as job description
            setJobDescription(processedDocument.enhancedText || processedDocument.text);
            
            // If we got structured data, set it as extracted criteria
            if (processedDocument.structuredData) {
              setExtractedCriteria(processedDocument.structuredData);
            }
          }
        } catch (error) {
          console.error('Error processing document:', error);
          if (error instanceof Error) {
            setDocumentError(error.message);
          } else {
            setDocumentError('Failed to process document');
          }
        }
      }
    };
  };

  const extractSearchCriteria = async () => {
    if (!jobDescription.trim()) return;
    
    // Define schema for structured keyword extraction
    const searchCriteriaSchema = {
      type: 'object',
      properties: {
        skills: {
          type: 'array',
          items: { type: 'string' },
          description: 'Technical skills and competencies required'
        },
        experienceLevel: {
          type: 'string',
          description: 'Required experience level (e.g., Junior, Mid-level, Senior, Lead)'
        },
        jobTitles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Relevant job titles and positions'
        },
        industries: {
          type: 'array',
          items: { type: 'string' },
          description: 'Relevant industries or sectors'
        },
        locations: {
          type: 'array',
          items: { type: 'string' },
          description: 'Required or preferred locations'
        },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Important keywords and terms for search'
        },
        requirements: {
          type: 'array',
          items: { type: 'string' },
          description: 'Key requirements and qualifications'
        },
        workType: {
          type: 'string',
          description: 'Work arrangement (e.g., Remote, On-site, Hybrid)'
        }
      },
      required: ['skills', 'experienceLevel', 'jobTitles']
    };
    
    await structuredQuery.structuredQuery({
      prompt: `Extract key search criteria from this job description for talent search: "${jobDescription}"`,
      schema: searchCriteriaSchema,
      systemPrompt: "You are a recruitment specialist. Extract structured search criteria from job descriptions including required skills, experience level, location, industry, and job titles. Respond only with valid JSON that matches the provided schema.",
      model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8"
    });
    
    if (structuredQuery.data) {
      setExtractedCriteria(structuredQuery.data.data);
    }
  };

  const generateJobDescription = async () => {
    if (!generatePrompt.trim()) return;
    
    await aiQuery.query({
      prompt: `Generate a detailed job description based on this input: "${generatePrompt}"`,
      systemPrompt: "You are a recruitment specialist. Generate professional, detailed job descriptions including responsibilities, requirements, qualifications, and company benefits. Format it properly with clear sections.",
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
    });
    
    // Close the dialog after the query is sent
    // The useEffect will handle updating the job description when data arrives
    setIsGenerateDialogOpen(false);
    setGeneratePrompt('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 flex-shrink-0 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-medium">Search by Job Description</h2>
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-md text-sm flex items-center"
                onClick={() => {
                  // Handle search with extracted criteria
                  if (extractedCriteria) {
                    console.log('Using structured criteria:', extractedCriteria);
                  }
                  onClose();
                }}
              >
                Save & Search →
              </button>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* AI Extracted Criteria - Top Section */}
        {extractedCriteria && (
          <div className="p-6 bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-700" />
                <h3 className="text-base font-medium text-green-700">AI Extracted Search Criteria</h3>
              </div>
              <div className="flex gap-2">
                <button
                  className="text-xs text-green-700 hover:text-green-800 underline"
                  onClick={() => {
                    // You would use this criteria for the actual search
                    console.log('Using structured criteria:', extractedCriteria);
                    onClose();
                  }}
                >
                  Use These Criteria
                </button>
                <button
                  className="text-xs text-green-600 hover:text-green-700 underline"
                  onClick={() => setExtractedCriteria(null)}
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {extractedCriteria.jobTitles && extractedCriteria.jobTitles.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Job Titles</span>
                  <span className="text-green-700">{extractedCriteria.jobTitles.join(', ')}</span>
                </div>
              )}
              
              {extractedCriteria.skills && extractedCriteria.skills.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Skills</span>
                  <span className="text-green-700">{extractedCriteria.skills.join(', ')}</span>
                </div>
              )}
              
              {extractedCriteria.experienceLevel && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Experience Level</span>
                  <span className="text-green-700">{extractedCriteria.experienceLevel}</span>
                </div>
              )}
              
              {extractedCriteria.workType && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Work Type</span>
                  <span className="text-green-700">{extractedCriteria.workType}</span>
                </div>
              )}
              
              {extractedCriteria.locations && extractedCriteria.locations.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Locations</span>
                  <span className="text-green-700">{extractedCriteria.locations.join(', ')}</span>
                </div>
              )}
              
              {extractedCriteria.industries && extractedCriteria.industries.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Industries</span>
                  <span className="text-green-700">{extractedCriteria.industries.join(', ')}</span>
                </div>
              )}
              
              {extractedCriteria.keywords && extractedCriteria.keywords.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Keywords</span>
                  <span className="text-green-700">{extractedCriteria.keywords.join(', ')}</span>
                </div>
              )}
              
              {extractedCriteria.requirements && extractedCriteria.requirements.length > 0 && (
                <div className="bg-white p-3 rounded border md:col-span-2">
                  <span className="font-medium text-green-800 block mb-1">Requirements</span>
                  <span className="text-green-700">{extractedCriteria.requirements.join(', ')}</span>
                </div>
              )}
            </div>
            
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <p className="text-blue-800">
                <strong>Review the extracted criteria above.</strong> You can edit the job description below to regenerate the criteria, or click "Use These Criteria" to proceed with the search.
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-medium">Job Description</h3>
            <div className="flex gap-2">
              {jobDescription.trim() && (
                <button
                  className="flex items-center gap-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-md"
                  onClick={extractSearchCriteria}
                  disabled={structuredQuery.loading}
                >
                  <Sparkles size={16} />
                  {structuredQuery.loading ? 'Extracting...' : 'Extract Criteria'}
                </button>
              )}              <button
                className="flex items-center gap-1 text-sm border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleUpload}
                disabled={documentProcessor.loading}
              >
                {documentProcessor.loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full mr-1"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-3">
            You can upload PDF or text-based documents like .docx, plain text, or formatted text.
          </p>

          <div className="border-t border-gray-200 my-4"></div>

          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Alternatively, paste in your job description</p>
            <button
              className="flex items-center gap-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md"
              onClick={() => setIsGenerateDialogOpen(true)}
            >
              <Sparkles size={16} />
              Generate with AI
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mb-3">
            Don't worry about the formatting; we'll take care of that for you.
          </p>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full h-48 p-4 border border-gray-300 rounded-lg text-sm resize-none"
            placeholder="Paste your job description here..."          />          {/* Error Displays */}
          {(aiQuery.error || structuredQuery.error || documentError) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium mb-1">Error:</p>
              {aiQuery.error && <p className="text-sm text-red-700 mb-1">• AI Query: {aiQuery.error}</p>}
              {structuredQuery.error && <p className="text-sm text-red-700 mb-1">• Structure Extraction: {structuredQuery.error}</p>}
              {documentError && <p className="text-sm text-red-700 mb-1">• Document Processing: {documentError}</p>}
              <button 
                onClick={() => {
                  aiQuery.reset();
                  structuredQuery.reset();
                  setDocumentError(null);
                  documentProcessor.reset();
                }}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Dismiss All Errors
              </button>
            </div>
          )}

          {/* Document Processing Error Display */}
          {documentError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                Document Error: {documentError}
              </p>
              <button 
                onClick={() => setDocumentError(null)}
                className="mt-1 text-xs text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generate Job Description Dialog */}
      {isGenerateDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-medium">Generate Job Description</h3>
                </div>
                <button 
                  onClick={() => setIsGenerateDialogOpen(false)} 
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Describe the role you want to create
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Example: "Senior React Developer for fintech startup, remote work, 5+ years experience"
                </p>
                <textarea
                  value={generatePrompt}
                  onChange={(e) => setGeneratePrompt(e.target.value)}
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg text-sm resize-none"
                  placeholder="Enter job role details..."
                />
              </div>

              {aiQuery.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">Error generating job description: {aiQuery.error}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => setIsGenerateDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
                  onClick={generateJobDescription}
                  disabled={!generatePrompt.trim() || aiQuery.loading}
                >
                  {aiQuery.loading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>      )}
    </div>
  );
};

export default JobDescriptionDialog;
