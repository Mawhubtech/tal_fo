import React, { useState, useEffect } from 'react';
import { X, Lock, Building } from 'lucide-react';
import type { JobPublishingOptions } from '../../../services/jobApiService';

interface JobPublishingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (options: JobPublishingOptions) => void;
  isLoading?: boolean;
  currentOptions?: JobPublishingOptions;
}


const JobPublishingModal: React.FC<JobPublishingModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  isLoading = false,
  currentOptions,
}) => {
  const [talJobBoard, setTalJobBoard] = useState(false);

  // Initialize form with current options
  useEffect(() => {
    if (currentOptions) {
      setTalJobBoard(currentOptions.talJobBoard || false);
    } else {
      // Reset to defaults
      setTalJobBoard(false);
    }
  }, [currentOptions, isOpen]);

  const handleSubmit = () => {
    const options: JobPublishingOptions = {
      visibility: 'private', // Always private
      talJobBoard,
      externalJobBoards: [], // No external boards
    };

    onPublish(options);
  };

  const getPublishingSummary = () => {
    if (talJobBoard) return 'Publishing to: TAL Job Board';
    return 'Private only (no public posting)';
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
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <h4 className="text-sm font-semibold text-purple-900">Private Job Posting</h4>
                  <p className="text-sm text-purple-700 mt-1">
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
