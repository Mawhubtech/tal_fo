import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, HelpCircle, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';
import type { SearchFilters } from '../../../services/searchService';
import BooleanSearchParser from '../../../services/booleanSearchParser';

interface BooleanSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string, filters: SearchFilters) => void;
}

const BooleanSearchDialog: React.FC<BooleanSearchDialogProps> = ({ isOpen, onClose, onSearch }) => {
  const [booleanExpression, setBooleanExpression] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });

  // Enhanced modal behavior hooks
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Handle ESC key
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      };

      // Use capture phase to ensure we get the event first
      document.addEventListener('keydown', handleEsc, true);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener('keydown', handleEsc, true);
      };
    }
  }, [isOpen, onClose]);

  const handleExpressionChange = (value: string) => {
    setBooleanExpression(value);
    
    // Validate the query in real-time
    if (value.trim()) {
      const validationResult = BooleanSearchParser.validateQuery(value);
      setValidation(validationResult);
    } else {
      setValidation({ isValid: true, errors: [] });
    }
  };

  const handleSearch = () => {
    if (!booleanExpression.trim() || !onSearch || !validation.isValid) return;

    try {
      // Parse the boolean query
      const parsedQuery = BooleanSearchParser.parseQuery(booleanExpression);
      
      // Convert to search filters
      const filters = BooleanSearchParser.convertToSearchFilters(parsedQuery);
      
      // Add the raw boolean expression as a fallback
      filters.skillsKeywords = {
        ...filters.skillsKeywords,
        items: [...(filters.skillsKeywords?.items || []), booleanExpression]
      };

      onSearch(booleanExpression, filters);
      onClose();
    } catch (error) {
      console.error('Error parsing boolean query:', error);
      setValidation({ isValid: false, errors: ['Failed to parse query. Please check syntax.'] });
    }
  };

  const insertExample = (example: string) => {
    setBooleanExpression(example);
    handleExpressionChange(example);
  };

  if (!isOpen) return null;

  const examples = BooleanSearchParser.getExampleQueries();

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xl">Σ</span>
              <h2 className="text-lg font-medium">Advanced Boolean Search</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowHelp(!showHelp)}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Toggle help"
              >
                <HelpCircle size={20} />
              </button>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {showHelp && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-blue-600" />
                <h3 className="font-medium text-blue-900">Boolean Search Syntax</h3>
              </div>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>Supported Fields:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><code>+Keywords:(term1 OR term2) AND term3</code> - Search in skills, descriptions, etc.</li>
                  <li><code>+Job title:("Title 1" OR "Title 2")</code> - Search specific job titles</li>
                  <li><code>+Job title time scope:Current or past</code> - Filter by current/past roles</li>
                  <li><code>+Location:(City, Country)</code> - Geographic targeting</li>
                </ul>
                <p><strong>Operators:</strong> <code>OR</code>, <code>AND</code>, <code>NOT</code></p>
                <p><strong>Quotes:</strong> Use quotes for exact phrases: <code>"Public Sector"</code></p>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Boolean Expression
            </label>
            <textarea
              value={booleanExpression}
              onChange={(e) => handleExpressionChange(e.target.value)}
              className={`w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none text-sm font-mono ${
                validation.isValid ? 'border-gray-300' : 'border-red-300'
              }`}
              placeholder="Example: +Keywords:(B2G OR Government OR &quot;Public Sector&quot;) SAAS AND enterprise, +Job title:(&quot;Sales&quot; OR &quot;Business Development&quot;), +Location:(Riyadh, Saudi Arabia)"
            />
            
            {/* Validation feedback */}
            <div className="mt-2 flex items-start gap-2">
              {validation.isValid ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle size={14} />
                  <span>Query syntax is valid</span>
                </div>
              ) : (
                <div className="flex items-start gap-1 text-red-600 text-sm">
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <div>Query has errors:</div>
                    <ul className="list-disc list-inside ml-2 mt-1">
                      {validation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Example queries */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Example Queries</h3>
            <div className="space-y-2">
              {examples.map((example, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <code className="flex-1 break-all">{example}</code>
                    <button 
                      onClick={() => insertExample(example)}
                      className="flex-shrink-0 text-purple-600 hover:text-purple-800 text-xs underline"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Cancel
            </button>
            <button 
              className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-md text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSearch}
              disabled={!booleanExpression.trim() || !onSearch || !validation.isValid}
            >
              Search with Boolean Query →
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BooleanSearchDialog;
