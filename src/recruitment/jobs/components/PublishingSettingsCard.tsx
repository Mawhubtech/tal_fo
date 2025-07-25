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
    if (publishingOptions.externalJobBoards && publishingOptions.externalJobBoards.length > 0) {
      platforms.push(`${publishingOptions.externalJobBoards.length} External Board${publishingOptions.externalJobBoards.length > 1 ? 's' : ''}`);
    }
    
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

          {/* External Job Boards */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              External Job Boards
              {!hasConfiguredJobBoards && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                  Configure in Admin
                </span>
              )}
            </label>
            
            {hasConfiguredJobBoards ? (
              <div className="space-y-2">
                {availableJobBoards.map((board) => (
                  <label
                    key={board.id}
                    className="flex items-center text-sm p-2 border rounded hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={publishingOptions.externalJobBoards?.includes(board.id) || false}
                      onChange={(e) => handleExternalBoardToggle(board.id, e.target.checked)}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="mr-2">{board.icon || '🔗'}</span>
                    <span className="flex-1">{board.name}</span>
                    {board.popular && (
                      <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded mr-2">
                        Popular
                      </span>
                    )}
                    {publishingOptions.externalJobBoards?.includes(board.id) && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </label>
                ))}
                
                {publishingOptions.externalJobBoards && publishingOptions.externalJobBoards.length > 0 && (
                  <div className="text-xs text-green-700 mt-2">
                    ✓ {publishingOptions.externalJobBoards.length} external board{publishingOptions.externalJobBoards.length > 1 ? 's' : ''} selected
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded p-2">
                No external job boards configured. Contact admin to set up integrations.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishingSettingsCard;
