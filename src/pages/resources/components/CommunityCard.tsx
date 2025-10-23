import React from 'react';
import { ExternalLink } from 'lucide-react';
import { CommunityResource } from '../data/resourcesData';

interface CommunityCardProps {
  resource: CommunityResource;
  onResourceClick?: (resource: CommunityResource) => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ resource, onResourceClick }) => {
  const handleClick = () => {
    if (onResourceClick) {
      onResourceClick(resource);
    }
  };

  return (
    <div 
      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer group text-center bg-white hover:bg-gray-50"
      onClick={handleClick}
    >
      <div className="text-purple-600 group-hover:text-purple-700 transition-colors mb-3 flex justify-center">
        <resource.icon className="w-8 h-8" />
      </div>
      
      <h3 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors mb-2">
        {resource.title}
      </h3>
      
      <p className="text-sm text-gray-600 leading-relaxed mb-3">
        {resource.description}
      </p>
      
      {resource.external && (
        <div className="flex justify-center">
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
        </div>
      )}
    </div>
  );
};

export default CommunityCard;
