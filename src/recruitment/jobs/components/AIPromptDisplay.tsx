import React, { useState } from 'react';
import { Sparkles, Edit2, RefreshCw, X } from 'lucide-react';

interface AIPromptDisplayProps {
  prompt: string;
  onRegenerate: (newPrompt: string) => void;
  isRegenerating?: boolean;
}

const AIPromptDisplay: React.FC<AIPromptDisplayProps> = ({
  prompt,
  onRegenerate,
  isRegenerating = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(prompt);

  const handleSaveAndRegenerate = () => {
    if (editedPrompt.trim() && editedPrompt !== prompt) {
      onRegenerate(editedPrompt.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedPrompt(prompt);
    setIsEditing(false);
  };

  const handleRegenerate = () => {
    onRegenerate(prompt);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-purple-600 overflow-hidden">
      <div className=" bg-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-white">
            <Sparkles className="mr-3" size={24} />
            <h2 className="text-xl font-semibold">AI Prompt</h2>
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm font-medium"
                disabled={isRegenerating}
              >
                <Edit2 className="w-4 h-4" />
                Edit Prompt
              </button>
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edit your prompt and regenerate the job details:
              </label>
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="w-full h-32 px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none resize-none text-gray-800"
                placeholder="Describe the job you want to create..."
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${editedPrompt.length > 500 ? 'text-green-600' : 'text-gray-400'}`}>
                  {editedPrompt.length} characters
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSaveAndRegenerate}
                disabled={!editedPrompt.trim() || editedPrompt === prompt}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                Save & Regenerate
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm font-medium text-purple-900 mb-2">Your AI Prompt:</p>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {prompt}
            </p>
          </div>
        )}

        {isRegenerating && (
          <div className="mt-4 flex items-center justify-center gap-3 text-purple-600">
            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Regenerating job details with AI...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPromptDisplay;
