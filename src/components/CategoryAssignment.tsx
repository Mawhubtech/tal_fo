import React, { useState } from 'react';
import { Tag, X, Loader2 } from 'lucide-react';
import { useCategories, useAssignCategoriesToCandidate, useCandidateCategories } from '../hooks/useCategories';
import { useToast } from '../contexts/ToastContext';

interface CategoryAssignmentProps {
  candidateId: string;
  onAssignmentChange?: () => void;
}

const CategoryAssignment: React.FC<CategoryAssignmentProps> = ({
  candidateId,
  onAssignmentChange,
}) => {
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch all available categories
  const { data: allCategoriesData } = useCategories({ isActive: true });
  const allCategories = allCategoriesData?.categories || [];

  // Fetch candidate's current categories
  const { data: candidateCategoriesData, isLoading: isLoadingCategories } =
    useCandidateCategories(candidateId);
  const candidateCategories = candidateCategoriesData?.categories || [];

  // Mutation for assigning categories
  const assignMutation = useAssignCategoriesToCandidate();

  const handleToggleCategory = async (categoryId: string) => {
    const isCurrentlyAssigned = candidateCategories.some(
      (cat) => cat.id === categoryId
    );

    let newCategoryIds: string[];
    if (isCurrentlyAssigned) {
      // Remove category
      newCategoryIds = candidateCategories
        .filter((cat) => cat.id !== categoryId)
        .map((cat) => cat.id);
    } else {
      // Add category
      newCategoryIds = [...candidateCategories.map((cat) => cat.id), categoryId];
    }

    try {
      await assignMutation.mutateAsync({
        candidateId,
        data: { categoryIds: newCategoryIds },
      });
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Categories updated successfully',
      });
      onAssignmentChange?.();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to update categories';
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    }
  };

  return (
    <div className="relative">
      {/* Category Badges Display */}
      <div className="flex flex-wrap items-center gap-2">
        {isLoadingCategories ? (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading categories...
          </div>
        ) : candidateCategories.length > 0 ? (
          candidateCategories.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: category.color || '#9CA3AF' }}
            >
              {category.name}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400 italic">No categories</span>
        )}

        {/* Edit Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
          title="Manage categories"
        >
          <Tag className="w-3 h-3" />
          Edit
        </button>
      </div>

      {/* Category Selection Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">
                  Assign Categories
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories List */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {allCategories.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No categories available
                </div>
              ) : (
                <div className="space-y-2">
                  {allCategories.map((category) => {
                    const isAssigned = candidateCategories.some(
                      (cat) => cat.id === category.id
                    );
                    return (
                      <label
                        key={category.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => handleToggleCategory(category.id)}
                          disabled={assignMutation.isPending}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                        />
                        <div
                          className="w-4 h-4 rounded flex-shrink-0"
                          style={{ backgroundColor: category.color || '#9CA3AF' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {category.name}
                          </p>
                          {category.description && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-600">
                {candidateCategories.length} categor
                {candidateCategories.length !== 1 ? 'ies' : 'y'} assigned
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryAssignment;
