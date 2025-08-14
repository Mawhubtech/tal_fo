import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Info } from 'lucide-react';

interface EnhancedSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onEnhancedSearch: () => void;
  isSearching: boolean;
  placeholder?: string;
  showHints?: boolean;
}

export const EnhancedSearchInput: React.FC<EnhancedSearchInputProps> = ({
  value,
  onChange,
  onSearch,
  onEnhancedSearch,
  isSearching,
  placeholder = "e.g., 'Find senior React developers who must have TypeScript experience. Prefer candidates with AWS knowledge.'",
  showHints = true
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [focusedHint, setFocusedHint] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchHints = [
    {
      type: 'Required Criteria',
      keywords: ['must have', 'required', 'essential', 'mandatory', 'need'],
      examples: [
        'must have React experience',
        'required to work in New York', 
        'essential TypeScript skills',
        'need 5+ years experience'
      ],
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: '🚨',
      description: 'These become MUST filters (candidates must match)'
    },
    {
      type: 'Preferred Criteria',
      keywords: ['prefer', 'ideally', 'nice to have', 'bonus', 'plus'],
      examples: [
        'prefer candidates with AWS',
        'ideally from tech companies',
        'nice to have startup experience',
        'bonus if familiar with Docker'
      ],
      color: 'text-blue-600',
      bgColor: 'bg-blue-50', 
      borderColor: 'border-blue-200',
      icon: '💡',
      description: 'These become SHOULD filters (boost relevance score)'
    },
    {
      type: 'Location Intelligence',
      keywords: ['based in', 'located in', 'from', 'remote'],
      examples: [
        'must be based in San Francisco',
        'prefer candidates from Europe', 
        'open to remote workers',
        'located in tech hubs'
      ],
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200', 
      icon: '🗺️',
      description: 'Smart location handling with must vs prefer logic'
    }
  ];

  const insertExample = (example: string) => {
    const currentValue = value;
    const newValue = currentValue ? `${currentValue}. ${example}` : example;
    onChange(newValue);
    setShowHelp(false);
    inputRef.current?.focus();
  };

  const highlightKeywords = (text: string, keywords: string[]) => {
    let highlighted = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    return highlighted;
  };

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
              onEnhancedSearch();
            }
          }}
          onFocus={() => setShowHelp(true)}
        />
        
        {/* Search Buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
          <button
            onClick={onSearch}
            disabled={isSearching || !value.trim()}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            title="Regular Search"
          >
            <Search className="h-4 w-4" />
          </button>
          
          <button
            onClick={onEnhancedSearch}
            disabled={isSearching || !value.trim()}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
            title="Enhanced AI Search"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium">AI</span>
          </button>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && showHints && value.length < 100 && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <Sparkles className="h-4 w-4 mr-1 text-blue-500" />
                Enhanced AI Search Tips
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {searchHints.map((hint, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${hint.bgColor} ${hint.borderColor} cursor-pointer transition-all duration-200 ${
                    focusedHint === index ? 'ring-2 ring-blue-300' : ''
                  }`}
                  onMouseEnter={() => setFocusedHint(index)}
                  onMouseLeave={() => setFocusedHint(null)}
                >
                  <div className={`text-xs font-medium ${hint.color} mb-1 flex items-center`}>
                    <span className="mr-1">{hint.icon}</span>
                    {hint.type}
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-2">
                    {hint.description}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {hint.keywords.map((keyword, i) => (
                      <span 
                        key={i}
                        className={`px-2 py-1 text-xs rounded ${hint.color.replace('text-', 'bg-').replace('600', '100')} ${hint.color}`}
                      >
                        "{keyword}"
                      </span>
                    ))}
                  </div>
                  
                  <div className="space-y-1">
                    {hint.examples.slice(0, 2).map((example, i) => (
                      <div 
                        key={i}
                        className="text-xs text-gray-700 hover:text-blue-600 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                        onClick={() => insertExample(example)}
                        dangerouslySetInnerHTML={{ 
                          __html: `"${highlightKeywords(example, hint.keywords)}"` 
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
              💡 <strong>Pro tip:</strong> Combine multiple criteria! Try: "Find senior React developers who must have TypeScript experience and are required to work in NYC. Prefer candidates with AWS knowledge from startup backgrounds."
            </div>
          </div>
        </div>
      )}
      
      {/* Current Query Analysis */}
      {value.length > 10 && (
        <div className="mt-2 text-xs text-gray-500">
          <span className="font-medium">Query Analysis:</span>
          {searchHints.map((hint) => {
            const count = hint.keywords.filter(keyword => 
              value.toLowerCase().includes(keyword.toLowerCase())
            ).length;
            return count > 0 ? (
              <span key={hint.type} className={`ml-2 ${hint.color}`}>
                {hint.icon} {count} {hint.type.toLowerCase()}
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};
