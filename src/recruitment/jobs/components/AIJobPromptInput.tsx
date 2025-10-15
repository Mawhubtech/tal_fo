import React, { useState, useEffect } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface AIJobPromptInputProps {
  onGenerate: (prompt: string) => void;
  initialPrompt?: string;
  isLoading?: boolean;
}

const LOADING_MESSAGES = [
  'Analyzing job requirements...',
  'Querying AI model...',
  'Creating job details...',
  'Generating responsibilities...',
  'Building requirements list...',
  'Crafting job description...',
];

const AIJobPromptInput: React.FC<AIJobPromptInputProps> = ({
  onGenerate,
  initialPrompt = '',
  isLoading = false
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    if (!isLoading) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = () => {
    if (!prompt.trim() || isLoading) return;
    onGenerate(prompt.trim());
  };

  const handleClear = () => {
    setPrompt('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start pt-20">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl border-2 border-purple-400 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div> {/* Spacer */}
            <h1 className="text-2xl font-bold text-gray-900">Create Job with AI</h1>
            {prompt.trim() && !isLoading && (
              <button
                onClick={handleClear}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Clear and start fresh"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </button>
            )}
            {(!prompt.trim() || isLoading) && <div></div>} {/* Spacer */}
          </div>
          <p className="text-gray-500 text-sm">
            Describe the job you want to create and let AI generate the details
          </p>
        </div>

        {/* Prompt Input */}
        <div className="w-full mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-medium text-gray-700">What kind of job are you creating?</h2>
          </div>

          <div className="relative">
            <textarea
              placeholder="Example: We need a Senior Full-Stack Developer with 5+ years of experience in React and Node.js for our fintech startup in New York. The role involves building scalable web applications, leading a small team, and working with modern cloud technologies. We offer competitive salary, remote work flexibility, and equity."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-48 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none resize-none text-gray-800 placeholder-gray-400"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-gray-500">
              Tip: Include job title, experience level, key skills, location, and any special requirements
            </p>
            <span className={`text-xs ${prompt.length > 500 ? 'text-green-600' : 'text-gray-400'}`}>
              {prompt.length} characters
            </span>
          </div>
        </div>

        {/* Generate Button */}
        <div className="w-full">
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>{LOADING_MESSAGES[loadingMessageIndex]}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Generate Job with AI</span>
              </>
            )}
          </button>

          {/* Example Prompts */}
          {!isLoading && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-900 mb-2">Example prompts:</p>
              <ul className="text-xs text-purple-800 space-y-1">
                <li className="cursor-pointer hover:text-purple-600" onClick={() => setPrompt("Senior Frontend Engineer with React and TypeScript experience, remote position, $120k-$160k salary")}>
                  • "Senior Frontend Engineer with React and TypeScript experience, remote position, $120k-$160k salary"
                </li>
                <li className="cursor-pointer hover:text-purple-600" onClick={() => setPrompt("Product Manager for SaaS company, 3-5 years experience, San Francisco, leading product roadmap")}>
                  • "Product Manager for SaaS company, 3-5 years experience, San Francisco, leading product roadmap"
                </li>
                <li className="cursor-pointer hover:text-purple-600" onClick={() => setPrompt("Data Scientist with Python, ML expertise, PhD preferred, flexible location, research-focused role")}>
                  • "Data Scientist with Python, ML expertise, PhD preferred, flexible location, research-focused role"
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIJobPromptInput;
