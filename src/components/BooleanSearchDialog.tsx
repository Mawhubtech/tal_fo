import React, { useState } from 'react';
import { X } from 'lucide-react';

interface BooleanSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const BooleanSearchDialog: React.FC<BooleanSearchDialogProps> = ({ isOpen, onClose }) => {
  const [booleanExpression, setBooleanExpression] = useState('(software OR engineer) AND (python OR java)');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xl">Σ</span>
              <h2 className="text-lg font-medium">Search by Boolean Expression</h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Enter a boolean expression to search for candidates.
          </p>

          <div className="mb-6">
            <textarea
              value={booleanExpression}
              onChange={(e) => setBooleanExpression(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 rounded-lg text-sm font-mono"
              placeholder="Example: (software OR engineer) AND (python OR java)"
            />
          </div>

          <div className="flex justify-end">
            <button 
              className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-md text-sm flex items-center"
              onClick={() => {
                // Handle search
                onClose();
              }}
            >
              Save & Search →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooleanSearchDialog;
