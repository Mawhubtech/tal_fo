import React, { useState } from 'react';
import { Settings, Eye, EyeOff, Globe, Lock, ExternalLink, Building, CheckCircle } from 'lucide-react';
import type { JobPublishingOptions } from '../../../services/jobApiService';

interface PublishingSettingsCardProps {
  publishingOptions: JobPublishingOptions;
  onUpdate: (options: JobPublishingOptions) => void;
  className?: string;
  availableJobBoards?: Array<{
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
    requiresCredentials: boolean;
    popular: boolean;
    icon?: string;
  }>;
}

const PublishingSettingsCard: React.FC<PublishingSettingsCardProps> = ({
  publishingOptions,
  onUpdate,
  className = '',
  availableJobBoards = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasConfiguredJobBoards = availableJobBoards.length > 0;

  const handleTalJobBoardToggle = (value: boolean) => {
    onUpdate({
      ...publishingOptions,
      talJobBoard: value,
    });
  };

  const handleExternalBoardToggle = (boardId: string, checked: boolean) => {
    const currentExternal = publishingOptions.externalJobBoards || [];
    const updatedExternal = checked
      ? [...currentExternal, boardId]
      : currentExternal.filter(id => id !== boardId);

    onUpdate({
      ...publishingOptions,
      externalJobBoards: updatedExternal,
    });
  };

  const getPublishingSummary = () => {
    const platforms = [];
    if (publishingOptions.talJobBoard) platforms.push('TAL Job Board');
    // External job boards hidden from UI
    
    if (platforms.length === 0) return 'Private only';
    return platforms.join(', ');
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Settings className="w-5 h-5 text-gray-600" />
          <div>
            <h4 className="text-sm font-medium text-gray-900">Publishing Settings</h4>
            <div className="flex items-center space-x-2 mt-1">
              <Lock className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600">{getPublishingSummary()}</span>
            </div>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 space-y-4">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              📌 All jobs are private by default. Select platforms below to publish publicly.
            </p>
          </div>

          {/* TAL Job Board */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">TAL Platform</label>
            <label className="flex items-center text-sm p-2 border rounded hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={publishingOptions.talJobBoard || false}
                onChange={(e) => handleTalJobBoardToggle(e.target.checked)}
                className="mr-3 text-purple-600 focus:ring-purple-500"
              />
              <Building className="w-4 h-4 text-purple-600 mr-2" />
              <span>TAL Job Board</span>
              {publishingOptions.talJobBoard && (
                <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
              )}
            </label>
          </div>

          {/* External Job Boards - Hidden */}
        </div>
      )}
    </div>
  );
};

export default PublishingSettingsCard;
