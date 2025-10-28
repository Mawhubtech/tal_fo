import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Tag } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { CandidateCategory } from '../types/candidate.types';

interface CategoryFilterProps {
  selectedCategoryIds: string[];
  onCategoryChange: (categoryIds: string[]) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategoryIds,
  onCategoryChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data } = useCategories({ isActive: true });
  const categories = data?.categories || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggleCategory = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      onCategoryChange(selectedCategoryIds.filter((id) => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategoryIds, categoryId]);
    }
  };

  const handleClearAll = () => {
    onCategoryChange([]);
  };

  const getSelectedCategories = (): CandidateCategory[] => {
    return categories.filter((cat) => selectedCategoryIds.includes(cat.id));
  };

  const selectedCategories = getSelectedCategories();

  return (
    <div ref={dropdownRef} className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
          selectedCategoryIds.length > 0
            ? 'border-purple-300 bg-purple-50 text-purple-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Tag className="w-4 h-4" />
        <span className="text-sm font-medium">
          Categories
          {selectedCategoryIds.length > 0 && (
            <span className="ml-1">({selectedCategoryIds.length})</span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <span className="text-sm font-semibold text-gray-900">
              Filter by Categories
            </span>
            {selectedCategoryIds.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="max-h-80 overflow-y-auto p-2">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No categories available
              </div>
            ) : (
              categories.map((category) => {
                const isSelected = selectedCategoryIds.includes(category.id);
                return (
                  <label
                    key={category.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleCategory(category.id)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div
                      className="w-3 h-3 rounded flex-shrink-0"
                      style={{ backgroundColor: category.color || '#9CA3AF' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {category.name}
                      </p>
                      {category.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Selected Categories Badges (shown below the button) */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCategories.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: category.color || '#9CA3AF' }}
            >
              {category.name}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleCategory(category.id);
                }}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
