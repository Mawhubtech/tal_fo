import React from 'react';
import { Eye, Edit, Copy, Trash2, Send, Tag, Calendar, User } from 'lucide-react';

interface EmailTemplateCardProps {
  template: {
    id: string;
    name: string;
    subject?: string;
    content?: string;
    body?: string;
    type: string;
    category: string;
    usageCount?: number;
    variables?: string[];
    isDefault?: boolean;
    createdBy?: {
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt: string;
  };
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUse: () => void;
}

export const EmailTemplateCard: React.FC<EmailTemplateCardProps> = ({
  template,
  onPreview,
  onEdit,
  onDelete,
  onUse,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'candidate_outreach': return 'bg-blue-100 text-blue-700';
      case 'follow_up': return 'bg-green-100 text-green-700';
      case 'interview_invite': return 'bg-purple-100 text-purple-700';
      case 'rejection': return 'bg-red-100 text-red-700';
      case 'offer': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sourcing': return 'bg-indigo-100 text-indigo-700';
      case 'outreach': return 'bg-emerald-100 text-emerald-700';
      case 'interview': return 'bg-violet-100 text-violet-700';
      case 'hiring': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
            {template.isDefault && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                Default
              </span>
            )}
          </div>
          {template.subject && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              <span className="font-medium">Subject:</span> {template.subject}
            </p>
          )}
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 line-clamp-3">
          {template.content || template.body || 'No content preview available'}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(template.type)}`}>
          {template.type.replace('_', ' ')}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
          {template.category}
        </span>
        {template.variables && template.variables.length > 0 && (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {template.variables.length} variables
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-500 space-y-1 mb-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Send className="w-3 h-3" />
            Used {template.usageCount || 0} times
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(template.updatedAt)}
          </span>
        </div>
        {template.createdBy && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            Created by {template.createdBy.firstName} {template.createdBy.lastName}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={onPreview}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(template.content || template.body || '')}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Copy Content"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onUse}
            className="px-3 py-1 text-sm bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors"
          >
            Use in Campaign
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
