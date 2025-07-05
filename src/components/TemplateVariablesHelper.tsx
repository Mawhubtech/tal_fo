import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface TemplateVariablesHelperProps {
  onInsertVariable?: (variable: string) => void;
}

const TemplateVariablesHelper: React.FC<TemplateVariablesHelperProps> = ({ onInsertVariable }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { addToast } = useToast();

  const variableCategories = {
    'Candidate Information': [
      'candidateName',
      'candidateEmail',
      'candidatePhone',
      'recipientName',
      'firstName',
      'lastName'
    ],
    'Position & Company': [
      'position',
      'company',
      'department',
      'manager',
      'recruiterName',
      'recruiterTitle',
      'senderName',
      'senderTitle'
    ],
    'Interview Details': [
      'interviewDate',
      'interviewTime',
      'duration',
      'location',
      'interviewType',
      'contactPhone',
      'interviewers'
    ],
    'Offer Details': [
      'salary',
      'benefits',
      'startDate',
      'responseDeadline',
      'additionalDetails'
    ],
    'General': [
      'subject',
      'email',
      'phone',
      'contactInfo',
      'companyDescription'
    ]
  };

  const copyToClipboard = (variable: string) => {
    const variableText = `{{${variable}}}`;
    navigator.clipboard.writeText(variableText).then(() => {
      addToast({ type: 'success', title: 'Copied to clipboard', message: `Variable ${variableText} copied` });
    }).catch(() => {
      addToast({ type: 'error', title: 'Copy failed', message: 'Could not copy to clipboard' });
    });
  };

  const handleInsertVariable = (variable: string) => {
    if (onInsertVariable) {
      onInsertVariable(`{{${variable}}}`);
    } else {
      copyToClipboard(variable);
    }
  };

  if (!isExpanded) {
    return (
      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <ChevronRight className="w-4 h-4 mr-1" />
          Show Template Variables
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-gray-50">
      <div className="p-3 border-b border-gray-200 bg-gray-100 rounded-t-lg">
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <ChevronDown className="w-4 h-4 mr-1" />
          Template Variables
        </button>
        <p className="text-xs text-gray-600 mt-1">
          Click on any variable to copy it to your clipboard
        </p>
      </div>
      
      <div className="p-3 max-h-64 overflow-y-auto">
        <div className="space-y-4">
          {Object.entries(variableCategories).map(([category, variables]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                {category}
              </h4>
              <div className="grid grid-cols-2 gap-1">
                {variables.map((variable) => (
                  <button
                    key={variable}
                    type="button"
                    onClick={() => handleInsertVariable(variable)}
                    className="flex items-center justify-between text-left px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-purple-50 hover:border-purple-300 transition-colors group"
                  >
                    <code className="text-purple-700 font-mono">
                      {'{{' + variable + '}}'}
                    </code>
                    <Copy className="w-3 h-3 text-gray-400 group-hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-3 border-t border-gray-200 bg-gray-100 rounded-b-lg">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> Not all variables apply to every template type. Use only the variables relevant to your email template.
        </p>
      </div>
    </div>
  );
};

export default TemplateVariablesHelper;
