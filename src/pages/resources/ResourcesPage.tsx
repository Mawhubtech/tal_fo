import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, Download, Users, Star, Clock, TrendingUp, Zap } from 'lucide-react';
import { communityResources, quickActions } from './data/resourcesData';
import CommunityCard from './components/CommunityCard';
import FeatureGuideCard, { featureGuides, FeatureGuide } from './components/FeatureGuideCard';
import GuideDetailModal from './components/GuideDetailModal';

const ResourcesPage: React.FC = () => {
  const [selectedGuide, setSelectedGuide] = useState<FeatureGuide | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const handleCommunityClick = (resource: any) => {
    console.log('Community resource clicked:', resource);
    // Handle community resource click
  };

  const handleFeatureGuideClick = (guide: FeatureGuide) => {
    setSelectedGuide(guide);
    setIsGuideModalOpen(true);
  };

  const handleCloseGuideModal = () => {
    setIsGuideModalOpen(false);
    setSelectedGuide(null);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'demo':
        console.log('Schedule demo clicked');
        break;
      case 'support':
        // Navigate to support page
        break;
      case 'community':
        console.log('Join community clicked');
        break;
      case 'mobile':
        console.log('Download mobile app clicked');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Resources & Documentation</h1>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Master TAL's recruitment platform with comprehensive guides, tutorials, and tools 
              designed to optimize your talent acquisition process
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-xl mx-auto">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">{featureGuides.length}</div>
                <div className="text-sm text-purple-200">Feature Guides</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">{communityResources.length}</div>
                <div className="text-sm text-purple-200">Community</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Feature Guides Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Platform Feature Guides
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  In-depth guides for mastering specific TAL features and workflows
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featureGuides.slice(0, 6).map((guide, index) => (
                <FeatureGuideCard
                  key={index}
                  guide={guide}
                  onLearnMore={handleFeatureGuideClick}
                />
              ))}
            </div>
            
            {featureGuides.length > 6 && (
              <div className="text-center mt-6">
                <button className="inline-flex items-center px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium">
                  View All Feature Guides ({featureGuides.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Community Resources */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Community & Support
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Connect with other users and access additional support resources
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communityResources.map((resource, index) => (
                <CommunityCard
                  key={index}
                  resource={resource}
                  onResourceClick={handleCommunityClick}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-8 border border-purple-200">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Need Additional Help?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get personalized assistance and connect with our team to maximize your success with TAL
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.action)}
                className={`p-4 rounded-lg text-center transition-all duration-200 ${
                  action.primary
                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md'
                }`}
              >
                <div className="font-medium mb-1">{action.title}</div>
                <div className={`text-sm ${action.primary ? 'text-purple-100' : 'text-gray-500'}`}>
                  {action.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guide Detail Modal */}
      <GuideDetailModal
        guide={selectedGuide}
        isOpen={isGuideModalOpen}
        onClose={handleCloseGuideModal}
      />
    </div>
  );
};

export default ResourcesPage;
