import React, { useState } from 'react';
import { X, FileText, Upload } from 'lucide-react';

interface JobDescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const JobDescriptionDialog: React.FC<JobDescriptionDialogProps> = ({ isOpen, onClose }) => {
  const [jobDescription, setJobDescription] = useState('');

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
      }
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
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
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-medium">Job Description</h3>
              <button
                className="flex items-center gap-1 text-sm border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50"
                onClick={handleUpload}
              >
                <Upload size={16} />
                Upload
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-3">
              You can upload PDF or text-based documents like .docx, plain text, or formatted text.
            </p>

            <div className="border-t border-gray-200 my-4"></div>

            <p className="text-sm font-medium mb-2">Alternatively, paste in your job description</p>
            <p className="text-sm text-gray-500 mb-3">
              Don't worry about the formatting; we'll take care of that for you.
            </p>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full h-56 p-4 border border-gray-300 rounded-lg text-sm"
              placeholder="Paste your job description here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionDialog;
