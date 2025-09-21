import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { SearchFilters } from '../../../services/searchService';

interface BooleanSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string, filters: SearchFilters) => void;
}

const BooleanSearchDialog: React.FC<BooleanSearchDialogProps> = ({ isOpen, onClose, onSearch }) => {
  const [booleanExpression, setBooleanExpression] = useState('(software OR engineer) AND (python OR java)');

  const handleSearch = () => {
    if (!booleanExpression.trim() || !onSearch) return;

    // Convert boolean expression to basic filters
    const filters: SearchFilters = {
      skillsKeywords: {
        items: [booleanExpression], // Store the boolean expression as a keyword
      }
    };

    onSearch(booleanExpression, filters);
    onClose();
  };

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
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm font-mono"
              placeholder="Example: (software OR engineer) AND (python OR java)"
            />
          </div>

          <div className="flex justify-end">
            <button 
              className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-md text-sm flex items-center"
              onClick={handleSearch}
              disabled={!booleanExpression.trim() || !onSearch}
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
