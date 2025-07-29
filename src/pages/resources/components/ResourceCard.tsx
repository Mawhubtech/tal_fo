import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ResourceItem, getTypeColor, getDifficultyColor } from '../data/resourcesData';

interface ResourceCardProps {
  item: ResourceItem;
  onItemClick?: (item: ResourceItem) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ item, onItemClick }) => {
  const handleClick = () => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer group bg-white hover:bg-gray-50"
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="text-gray-400 group-hover:text-purple-600 transition-colors mt-1 flex-shrink-0">
          <item.icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors leading-tight">
              {item.title}
            </h3>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0 ml-2" />
          </div>
          
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            {item.description}
          </p>
          
          <div className="flex items-center flex-wrap gap-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
              {item.type}
            </span>
            
            {item.difficulty && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                {item.difficulty}
              </span>
            )}
            
            {item.duration && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {item.duration}
              </span>
            )}
            
            {item.size && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {item.size}
              </span>
            )}
          </div>
          
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{item.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
