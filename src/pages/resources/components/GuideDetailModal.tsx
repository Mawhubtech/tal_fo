import React from 'react';
import { X, Clock, Users, BookOpen, Star } from 'lucide-react';
import { FeatureGuide } from '../components/FeatureGuideCard';
import { QuickStartGuide } from '../guides/getting-started/QuickStartGuide';
import { PlatformOverviewGuide } from '../guides/getting-started/PlatformOverviewGuide';
import { SetupChecklistGuide } from '../guides/getting-started/SetupChecklistGuide';
import { SourcingProjectsGuide } from '../guides/sourcing/SourcingProjectsGuide';
import { ChromeExtensionGuide } from '../guides/sourcing/ChromeExtensionGuide';
import { JobManagementGuide } from '../guides/jobs/JobManagementGuide';
import { CandidateManagementGuide } from '../guides/candidate-management/CandidateManagementGuide';

interface GuideDetailModalProps {
  guide: FeatureGuide | null;
  isOpen: boolean;
  onClose: () => void;
}

const GuideDetailModal: React.FC<GuideDetailModalProps> = ({ guide, isOpen, onClose }) => {
  if (!isOpen || !guide) return null;

  const renderGuideContent = () => {
    switch (guide.title) {
      case 'Quick Start Guide':
        return <QuickStartGuide />;
      case 'Platform Overview':
        return <PlatformOverviewGuide />;
      case 'Setup Checklist':
        return <SetupChecklistGuide />;
      case 'Sourcing Projects':
        return <SourcingProjectsGuide />;
      case 'Chrome Extension':
        return <ChromeExtensionGuide />;
      case 'Job Management':
        return <JobManagementGuide />;
      case 'Candidate Management':
        return <CandidateManagementGuide />;
      default:
        return (
          <div className="p-8 text-center">
            <div className="p-4 bg-purple-100 rounded-lg inline-block mb-4">
              <guide.icon className="w-12 h-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{guide.title}</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {guide.description}
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-2">Guide Coming Soon</h3>
              <p className="text-yellow-800 text-sm">
                We're working on a comprehensive guide for this feature. 
                In the meantime, check out our other available resources or contact support for assistance.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Key Features Covered:</h3>
              <ul className="text-left max-w-md mx-auto space-y-2">
                {guide.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-8 flex justify-center space-x-4">
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Contact Support
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                View Related Resources
              </button>
            </div>
          </div>
        );
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <guide.icon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{guide.title} Guide</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{guide.estimatedTime}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
                    {guide.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">#{guide.category}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-purple-600 transition-colors">
                <Star className="w-4 h-4" />
                <span>Bookmark</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {renderGuideContent()}
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Found this helpful?</span>
                <div className="flex space-x-2">
                  <button className="text-green-600 hover:text-green-700 text-sm">👍 Yes</button>
                  <button className="text-red-600 hover:text-red-700 text-sm">👎 No</button>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Share Guide
                </button>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Print Guide
                </button>
                <button 
                  onClick={onClose}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDetailModal;
