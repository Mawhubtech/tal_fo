import React, { useState } from 'react';
import { X, FileText, Upload, Sparkles } from 'lucide-react';
import { useAIQuery } from '../hooks/ai';

interface JobDescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const JobDescriptionDialog: React.FC<JobDescriptionDialogProps> = ({ isOpen, onClose }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [extractedCriteria, setExtractedCriteria] = useState<string | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  
  // AI hook for extracting search criteria and generating job descriptions
  const aiQuery = useAIQuery();

  if (!isOpen) return null;

  const handleUpload = () => {
    // Handle file upload (would trigger file input)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt';
    fileInput.click();
    
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In a real implementation, you'd process the file here
        console.log('File selected:', file.name);
      }    };
  };
  const extractSearchCriteria = async () => {
    if (!jobDescription.trim()) return;
    
    await aiQuery.query({
      prompt: `Extract key search criteria from this job description for talent search: "${jobDescription}"`,
      systemPrompt: "You are a recruitment specialist. Extract key search criteria from job descriptions including required skills, experience level, location, industry, and job titles. Format as a concise search query.",
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
    });
    
    if (aiQuery.data) {
      setExtractedCriteria(aiQuery.data.content);
    }
  };

  const generateJobDescription = async () => {
    if (!generatePrompt.trim()) return;
    
    await aiQuery.query({
      prompt: `Generate a detailed job description based on this input: "${generatePrompt}"`,
      systemPrompt: "You are a recruitment specialist. Generate professional, detailed job descriptions including responsibilities, requirements, qualifications, and company benefits. Format it properly with clear sections.",
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
    });
    
    if (aiQuery.data) {
      setJobDescription(aiQuery.data.content);
      setIsGenerateDialogOpen(false);
      setGeneratePrompt('');
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-medium">Search by Job Description</h2>
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-md text-sm flex items-center"
                onClick={() => {
                  // Handle search
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
            </div>          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-medium">Job Description</h3>
              <div className="flex gap-2">
                {jobDescription.trim() && (
                  <button
                    className="flex items-center gap-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-md"
                    onClick={extractSearchCriteria}
                    disabled={aiQuery.loading}
                  >
                    <Sparkles size={16} />
                    {aiQuery.loading ? 'Extracting...' : 'Extract Criteria'}
                  </button>
                )}
                <button
                  className="flex items-center gap-1 text-sm border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50"
                  onClick={handleUpload}
                >
                  <Upload size={16} />
                  Upload
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mb-3">
              You can upload PDF or text-based documents like .docx, plain text, or formatted text.
            </p>            <div className="border-t border-gray-200 my-4"></div>

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
            </p>            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full h-48 p-4 border border-gray-300 rounded-lg text-sm resize-none"
              placeholder="Paste your job description here..."
            />

            {/* AI Extracted Criteria */}
            {extractedCriteria && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                  <h4 className="text-sm font-medium text-purple-700">AI Extracted Search Criteria</h4>
                </div>
                <p className="text-sm text-purple-800 leading-relaxed mb-3">{extractedCriteria}</p>
                <div className="flex gap-2">
                  <button
                    className="text-xs text-purple-700 hover:text-purple-800 underline"
                    onClick={() => {
                      // You would use this criteria for the actual search
                      console.log('Using criteria:', extractedCriteria);
                      onClose();
                    }}
                  >
                    Use for Search
                  </button>
                  <button
                    className="text-xs text-purple-600 hover:text-purple-700 underline"
                    onClick={() => setExtractedCriteria(null)}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* AI Error Display */}
            {aiQuery.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">Error extracting criteria: {aiQuery.error}</p>
                <button 
                  onClick={aiQuery.reset}
                  className="mt-1 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>              </div>
            )}          </div>
        </div>
      </div>      {/* Generate Job Description Dialog */}
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
                </button>              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-6">
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
                    <p className="text-sm text-red-700">Error: {aiQuery.error}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end p-6 border-t border-gray-200 flex-shrink-0">
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
        </div>
      )}
    </div>
  );
};

export default JobDescriptionDialog;
