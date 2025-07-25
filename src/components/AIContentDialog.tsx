import React, { useState } from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';

interface AIContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (context: string) => void;
  type: 'subject' | 'content' | 'email';
  isGenerating: boolean;
  companyName: string;
}

const AIContentDialog: React.FC<AIContentDialogProps> = ({
  isOpen,
  onClose,
  onGenerate,
  type,
  isGenerating,
  companyName
}) => {
  const [context, setContext] = useState('');

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (context.trim()) {
      onGenerate(context);
      setContext('');
    }
  };

  const suggestions = type === 'subject' ? [
    'Partnership opportunity',
    'Service introduction',
    'Collaboration proposal',
    'Follow-up meeting',
    'Product demonstration'
  ] : type === 'content' ? [
    'Professional introduction and services overview',
    'Partnership proposal with specific benefits',
    'Follow-up on previous conversation',
    'Meeting request with agenda',
    'Service demonstration offer'
  ] : [
    'Professional introduction and partnership opportunity',
    'Service presentation and collaboration proposal',
    'Follow-up meeting to discuss mutual benefits',
    'Partnership proposal with clear value proposition',
    'Introduction of our services and capabilities'
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setContext(suggestion);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              AI Generate {type === 'email' ? 'Email' : type === 'subject' ? 'Subject' : 'Content'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Provide context for generating {type === 'email' ? 'an email (subject and content)' : type === 'subject' ? 'an email subject' : 'email content'} for <span className="font-medium">{companyName}</span>:
            </p>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={
                type === 'email'
                  ? "e.g., We want to introduce our AI recruitment platform and schedule a demo meeting..."
                  : type === 'subject' 
                  ? "e.g., We want to discuss a partnership opportunity in the healthcare sector..."
                  : "e.g., Introduce our AI recruitment platform and schedule a demo meeting..."
              }
            />
          </div>

          {/* Quick Suggestions */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!context.trim() || isGenerating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIContentDialog;
