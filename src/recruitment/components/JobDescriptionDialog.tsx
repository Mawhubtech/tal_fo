import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Upload, Sparkles } from 'lucide-react';
import { useAIStructuredQuery, useAIQuery, useDocumentProcessing } from '../../hooks/ai';
import { extractKeywords, convertKeywordsToFilters } from '../../services/searchService';
import type { SearchFilters, ExtractedKeywords } from '../../services/searchService';

interface JobDescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string, filters: SearchFilters) => void;
}

const JobDescriptionDialog: React.FC<JobDescriptionDialogProps> = ({ isOpen, onClose, onSearch }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [extractedCriteria, setExtractedCriteria] = useState<any>(null);
  const [extractedKeywords, setExtractedKeywords] = useState<ExtractedKeywords | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [isExtractingKeywords, setIsExtractingKeywords] = useState(false);
  // Add a state for document processing errors
  const [documentError, setDocumentError] = useState<string | null>(null);
  // AI hooks for different purposes
  const aiQuery = useAIQuery(); // For generating job descriptions
  const structuredQuery = useAIStructuredQuery(); // For extracting structured search criteria
  const documentProcessor = useDocumentProcessing(); // For processing uploaded documents
  
  // Enhanced modal behavior
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    // Use capture phase to ensure we get the event first
    document.addEventListener('keydown', handleEscape, true);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape, true);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
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
    
    setIsExtractingKeywords(true);
    try {
      // Step 1: Extract keywords from job description using backend AI service (same as normal search)
      console.log('Extracting keywords from job description...');
      const keywords = await extractKeywords(jobDescription);
      console.log('Extracted keywords:', keywords);
      
      // Step 2: Limit keywords to ~10 total items for better performance
      const limitedKeywords: ExtractedKeywords = {
        ...keywords,
        skills: keywords.skills.slice(0, 6), // Limit to 6 skills
        keywords: keywords.keywords.slice(0, 4), // Limit to 4 keywords
        requirements: keywords.requirements.slice(0, 3), // Limit to 3 requirements
        jobTitles: keywords.jobTitles.slice(0, 3), // Limit to 3 job titles
        companies: keywords.companies.slice(0, 2), // Limit to 2 companies
        locations: keywords.locations.slice(0, 2), // Limit to 2 locations
        industries: keywords.industries.slice(0, 2), // Limit to 2 industries
      };
      
      console.log('Limited keywords for backend:', limitedKeywords);
      setExtractedKeywords(limitedKeywords);
      
      // Step 3: Convert keywords to filters (same as normal search)
      const filters = await convertKeywordsToFilters(limitedKeywords);
      console.log('Converted filters:', filters);
      
      // Set the filters as extracted criteria for display
      setExtractedCriteria(limitedKeywords);
      
    } catch (error) {
      console.error('Error extracting keywords:', error);
    } finally {
      setIsExtractingKeywords(false);
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

  // Function to convert extracted criteria to SearchFilters format
  const convertCriteriaToFilters = (criteria: ExtractedKeywords): SearchFilters => {
    if (!criteria) return {};
    
    return {
      general: {
        minExperience: criteria.experienceLevel || '',
      },
      location: {
        currentLocations: criteria.locations || [],
      },
      job: {
        titles: criteria.jobTitles || [],
        skills: criteria.skills || [],
      },
      company: {
        industries: criteria.industries || [],
        names: criteria.companies || [],
      },
      skillsKeywords: {
        items: criteria.keywords || [],
        requirements: criteria.requirements || [],
      },
      power: {
        isOpenToRemote: criteria.workType === 'Remote' || criteria.workType === 'Hybrid',
      }
    };
  };

  // Function to handle search execution
  const handleSearchWithCriteria = async () => {
    console.log('handleSearchWithCriteria called', { extractedKeywords, onSearch, jobDescription });
    
    if (!onSearch) {
      console.log('No onSearch function provided');
      return;
    }
    
    if (!jobDescription.trim()) {
      console.log('No job description provided');
      return;
    }
    
    let filters: SearchFilters;
    let searchQuery: string;
    
    if (extractedKeywords) {
      // Use extracted keywords following the same flow as normal search
      console.log('Using extracted keywords for search:', extractedKeywords);
      
      // Convert keywords to filters using the backend service (same as normal search)
      try {
        filters = await convertKeywordsToFilters(extractedKeywords);
        console.log('Converted to filters:', filters);
      } catch (error) {
        console.error('Error converting keywords to filters:', error);
        // Fallback to manual conversion
        filters = convertCriteriaToFilters(extractedKeywords);
      }
      
      // Create a brief search query from keywords
      const keywordList = [
        ...(extractedKeywords.skills || []).slice(0, 3),
        ...(extractedKeywords.jobTitles || []).slice(0, 2),
        ...(extractedKeywords.keywords || []).slice(0, 2)
      ];
      searchQuery = keywordList.join(', ');
    } else {
      // Fallback: Extract keywords first if not already done
      console.log('No extracted keywords found, extracting now...');
      await extractSearchCriteria();
      return; // Will be called again once keywords are extracted
    }
    
    console.log('Calling onSearch with:', { searchQuery, filters });
    onSearch(searchQuery, filters);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed top-0 right-0 bottom-0 left-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]"
      onClick={handleOverlayClick}
    >
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
                className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-md text-sm flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleSearchWithCriteria}
                disabled={!jobDescription.trim() || !onSearch || isExtractingKeywords}
              >
                {isExtractingKeywords ? 'Processing...' : (extractedKeywords ? 'Search with Keywords →' : 'Save & Search →')}
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
        {extractedKeywords && (
          <div className="p-6 bg-green-50 border-b border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-700" />
                <h3 className="text-base font-medium text-green-700">Extracted Keywords (AI Processed)</h3>
              </div>
              <div className="flex gap-2">
                <button
                  className="text-xs text-green-700 hover:text-green-800 underline"
                  onClick={handleSearchWithCriteria}
                >
                  Search with Keywords
                </button>
                <button
                  className="text-xs text-green-600 hover:text-green-700 underline"
                  onClick={() => {
                    setExtractedKeywords(null);
                    setExtractedCriteria(null);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {extractedKeywords.jobTitles && extractedKeywords.jobTitles.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Job Titles ({extractedKeywords.jobTitles.length})</span>
                  <span className="text-green-700">{extractedKeywords.jobTitles.join(', ')}</span>
                </div>
              )}
              
              {extractedKeywords.skills && extractedKeywords.skills.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Skills ({extractedKeywords.skills.length})</span>
                  <span className="text-green-700">{extractedKeywords.skills.join(', ')}</span>
                </div>
              )}
              
              {extractedKeywords.experienceLevel && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Experience Level</span>
                  <span className="text-green-700">{extractedKeywords.experienceLevel}</span>
                </div>
              )}
              
              {extractedKeywords.workType && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Work Type</span>
                  <span className="text-green-700">{extractedKeywords.workType}</span>
                </div>
              )}
              
              {extractedKeywords.locations && extractedKeywords.locations.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Locations ({extractedKeywords.locations.length})</span>
                  <span className="text-green-700">{extractedKeywords.locations.join(', ')}</span>
                </div>
              )}
              
              {extractedKeywords.industries && extractedKeywords.industries.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Industries ({extractedKeywords.industries.length})</span>
                  <span className="text-green-700">{extractedKeywords.industries.join(', ')}</span>
                </div>
              )}
              
              {extractedKeywords.companies && extractedKeywords.companies.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Companies ({extractedKeywords.companies.length})</span>
                  <span className="text-green-700">{extractedKeywords.companies.join(', ')}</span>
                </div>
              )}
              
              {extractedKeywords.keywords && extractedKeywords.keywords.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <span className="font-medium text-green-800 block mb-1">Keywords ({extractedKeywords.keywords.length})</span>
                  <span className="text-green-700">{extractedKeywords.keywords.join(', ')}</span>
                </div>
              )}
              
              {extractedKeywords.requirements && extractedKeywords.requirements.length > 0 && (
                <div className="bg-white p-3 rounded border md:col-span-2">
                  <span className="font-medium text-green-800 block mb-1">Requirements ({extractedKeywords.requirements.length})</span>
                  <span className="text-green-700">{extractedKeywords.requirements.join(', ')}</span>
                </div>
              )}
            </div>
            
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <p className="text-blue-800">
                <strong>Keywords extracted and limited to ~10 items for optimal search performance.</strong> Click "Search with Keywords" to use these for candidate search, or edit the job description below to re-extract.
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-medium">Job Description</h3>
            <div className="flex gap-2">
              {jobDescription.trim() && (              <button
                className="flex items-center gap-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-md disabled:opacity-50"
                onClick={extractSearchCriteria}
                disabled={isExtractingKeywords}
              >
                <Sparkles size={16} />
                {isExtractingKeywords ? 'Extracting...' : 'Extract Keywords'}
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
          {(aiQuery.error || documentError) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium mb-1">Error:</p>
              {aiQuery.error && <p className="text-sm text-red-700 mb-1">• AI Query: {aiQuery.error}</p>}
              {documentError && <p className="text-sm text-red-700 mb-1">• Document Processing: {documentError}</p>}
              <button 
                onClick={() => {
                  aiQuery.reset();
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
        <div 
          className="fixed top-0 right-0 bottom-0 left-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsGenerateDialogOpen(false);
            }
          }}
        >
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

  // Render modal content in a portal to bypass any parent z-index issues
  return createPortal(modalContent, document.body);
};

export default JobDescriptionDialog;
