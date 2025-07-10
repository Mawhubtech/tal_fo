import React from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Sparkles } from 'lucide-react';

interface AIEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onUseEnhancedQuery: (enhancedQuery: string) => void;
}

const AIEnhancementModal: React.FC<AIEnhancementModalProps> = ({
  isOpen,
  onClose,
  content,
  onUseEnhancedQuery
}) => {
  if (!isOpen) return null;

  const handleUseQuery = () => {
    onUseEnhancedQuery(content);
    // Don't call onClose() here - let the parent component handle it
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl transform animate-scaleIn flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-700" />
            <h2 className="text-lg font-semibold text-gray-900">AI Enhanced Search</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            <div className="prose prose-purple max-w-none">
              <ReactMarkdown 
                components={{
                  // Custom components for better styling
                  p: ({ children }) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-purple-900">{children}</strong>,
                  em: ({ children }) => <em className="italic text-purple-700">{children}</em>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                  li: ({ children }) => <li className="text-gray-700">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-purple-100 text-purple-900 px-2 py-1 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-3">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-900 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-medium text-gray-900 mb-2">{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-300 pl-4 italic text-gray-600 mb-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUseQuery}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Use Enhanced Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIEnhancementModal;
