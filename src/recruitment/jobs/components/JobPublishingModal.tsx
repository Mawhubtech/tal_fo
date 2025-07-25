import React, { useState, useEffect } from 'react';
import { X, Globe, Lock, ExternalLink, CheckCircle, AlertCircle, Building } from 'lucide-react';
import type { JobPublishingOptions } from '../../../services/jobApiService';

interface JobPublishingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (options: JobPublishingOptions) => void;
  isLoading?: boolean;
  currentOptions?: JobPublishingOptions;
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

const DEFAULT_JOB_BOARDS = [
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', popular: true },
  { id: 'indeed', name: 'Indeed', icon: '🔍', popular: true },
  { id: 'glassdoor', name: 'Glassdoor', icon: '🏢', popular: true },
  { id: 'monster', name: 'Monster', icon: '👹', popular: false },
  { id: 'ziprecruiter', name: 'ZipRecruiter', icon: '⚡', popular: false },
  { id: 'careerbuilder', name: 'CareerBuilder', icon: '🔨', popular: false },
  { id: 'dice', name: 'Dice (Tech Jobs)', icon: '🎲', popular: false },
  { id: 'angellist', name: 'AngelList (Startups)', icon: '😇', popular: false },
];

const JobPublishingModal: React.FC<JobPublishingModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  isLoading = false,
  currentOptions,
  availableJobBoards = []
}) => {
  const [talJobBoard, setTalJobBoard] = useState(false);
  const [externalJobBoards, setExternalJobBoards] = useState<string[]>([]);

  // Use available job boards if provided, otherwise fall back to defaults
  const jobBoardsToShow = availableJobBoards.length > 0 ? availableJobBoards : DEFAULT_JOB_BOARDS;
  const hasConfiguredJobBoards = availableJobBoards.length > 0;

  // Initialize form with current options
  useEffect(() => {
    if (currentOptions) {
      setTalJobBoard(currentOptions.talJobBoard || false);
      setExternalJobBoards(currentOptions.externalJobBoards || []);
    } else {
      // Reset to defaults
      setTalJobBoard(false);
      setExternalJobBoards([]);
    }
  }, [currentOptions, isOpen]);

  const handleSubmit = () => {
    const options: JobPublishingOptions = {
      visibility: 'private', // Always private
      talJobBoard,
      externalJobBoards,
    };

    onPublish(options);
  };

  const handleExternalBoardToggle = (boardId: string) => {
    setExternalJobBoards(prev => 
      prev.includes(boardId) 
        ? prev.filter(id => id !== boardId)
        : [...prev, boardId]
    );
  };

  const getPublishingSummary = () => {
    const platforms = [];
    if (talJobBoard) platforms.push('TAL Job Board');
    if (externalJobBoards.length > 0) platforms.push(`${externalJobBoards.length} External Board${externalJobBoards.length > 1 ? 's' : ''}`);
    
    if (platforms.length === 0) return 'Private only (no public posting)';
    return `Publishing to: ${platforms.join(', ')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Publishing Options</h3>
              <p className="text-sm text-gray-600 mt-1">Choose where to publish your job posting</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Job Posting Options */}
          <div className="space-y-6">
            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Private Job Posting</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    All jobs are private by default. Select posting platforms below to make your job discoverable.
                  </p>
                </div>
              </div>
            </div>

            {/* TAL Job Board */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">TAL Platform</h4>
              <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={talJobBoard}
                  onChange={(e) => setTalJobBoard(e.target.checked)}
                  className="mt-1 mr-3 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Building className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium text-gray-900">TAL Job Board</span>
                    <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Platform</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Publish your job on the TAL platform job board for maximum visibility to our candidate network.
                  </p>
                </div>
              </label>
            </div>

            {/* External Job Boards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">External Job Boards</h4>
                {!hasConfiguredJobBoards && (
                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                    Configure in Admin
                  </span>
                )}
              </div>

              {hasConfiguredJobBoards ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-3 flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Select External Platforms ({externalJobBoards.length} selected)
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {jobBoardsToShow.map((board) => (
                      <label
                        key={board.id}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-white transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={externalJobBoards.includes(board.id)}
                          onChange={() => handleExternalBoardToggle(board.id)}
                          className="mr-3 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-lg mr-2">{board.icon || '🔗'}</span>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{board.name}</span>
                            {board.popular && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">Popular</span>
                            )}
                          </div>
                          {board.description && (
                            <p className="text-xs text-gray-600 mt-1">{board.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center text-orange-800">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <div>
                      <p className="text-sm font-medium">No External Job Boards Configured</p>
                      <p className="text-sm mt-1">
                        Contact your administrator to configure external job board integrations (LinkedIn, Indeed, etc.)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {getPublishingSummary()}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Publishing...
                  </>
                ) : (
                  'Publish Job'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPublishingModal;
