import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Tag, Loader2, Search, AlertCircle } from 'lucide-react';
import {
  useCategories,
  useCategoryStats,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/useCategories';
import { CandidateCategory, CreateCandidateCategoryDto } from '../types/candidate.types';
import { useToast } from '../contexts/ToastContext';
import ConfirmationDialog from './ConfirmationDialog';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CandidateCategory | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    category: CandidateCategory | null;
  }>({ isOpen: false, category: null });

  // Form state
  const [formData, setFormData] = useState<CreateCandidateCategoryDto>({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
    isActive: true,
  });

  // Queries and mutations
  const categoriesQuery = useCategories({ search: searchTerm });
  const statsQuery = useCategoryStats();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const categories = categoriesQuery.data?.categories || [];
  const stats = statsQuery.data?.stats || [];

  // Get candidate count for a category
  const getCandidateCount = (categoryId: string): number => {
    const stat = stats.find((s) => s.categoryId === categoryId);
    return stat?.candidateCount || 0;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: PRESET_COLORS[0],
      isActive: true,
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (category: CandidateCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || PRESET_COLORS[0],
      isActive: category.isActive,
    });
    setShowForm(true);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          data: formData,
        });
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Category updated successfully',
        });
      } else {
        await createMutation.mutateAsync(formData);
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Category created successfully',
        });
      }
      resetForm();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to save category';
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    }
  };

  // Handle delete
  const handleDelete = (category: CandidateCategory) => {
    setDeleteConfirmation({ isOpen: true, category });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.category) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirmation.category.id);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Category deleted successfully',
      });
      setDeleteConfirmation({ isOpen: false, category: null });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to delete category';
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Category Management
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Create and manage candidate categories
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!showForm ? (
              <>
                {/* Search and Add Button */}
                <div className="flex gap-3 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Category
                  </button>
                </div>

                {/* Categories List */}
                {categoriesQuery.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      {searchTerm
                        ? 'No categories found matching your search'
                        : 'No categories yet. Create your first category!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map((category) => {
                      const candidateCount = getCandidateCount(category.id);
                      return (
                        <div
                          key={category.id}
                          className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                        >
                          {/* Color Badge */}
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: category.color || '#9CA3AF' }}
                          >
                            <Tag className="w-6 h-6 text-white" />
                          </div>

                          {/* Category Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                {category.name}
                              </h3>
                              {!category.isActive && (
                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                  Inactive
                                </span>
                              )}
                            </div>
                            {category.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {category.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {candidateCount} candidate{candidateCount !== 1 ? 's' : ''}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleEdit(category)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit category"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(category)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete category"
                              disabled={candidateCount > 0}
                            >
                              <Trash2
                                className={`w-4 h-4 ${
                                  candidateCount > 0
                                    ? 'text-gray-300'
                                    : 'text-red-600'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* Category Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingCategory ? 'Edit Category' : 'New Category'}
                  </h3>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Senior Developers"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of this category"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-10 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          formData.color === color
                            ? 'ring-2 ring-purple-600 ring-offset-2 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active (visible to users)
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, category: null })}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirmation.category?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </>
  );
};

export default CategoryManagementModal;
