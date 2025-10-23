import React, { useRef } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface EnhancedSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onEnhancedSearch: () => void;
  isSearching: boolean;
  placeholder?: string;
}

export const EnhancedSearchInput: React.FC<EnhancedSearchInputProps> = ({
  value,
  onChange,
  onSearch,
  onEnhancedSearch,
  isSearching,
  placeholder = "e.g., 'Find senior React developers who must have TypeScript experience. Prefer candidates with AWS knowledge.'"
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full">
      {/* Main Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSearch(); // Changed from onEnhancedSearch to onSearch
            }
          }}
        />
        
        {/* Search Buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
          {/* <button
            onClick={onSearch}
            disabled={isSearching || !value.trim()}
            className="p-2 text-purple-500 hover:text-purple-700 disabled:opacity-50"
            title="AI Search"
          >
            <Search className="h-6 w-6" />
          </button> */}
          
          {/* Enhanced AI Search - Temporarily disabled */}
          {/* <button
            onClick={onEnhancedSearch}
            disabled={isSearching || !value.trim()}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
            title="Enhanced AI Search"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium">AI</span>
          </button> */}
        </div>
      </div>


      
    </div>
  );
};
