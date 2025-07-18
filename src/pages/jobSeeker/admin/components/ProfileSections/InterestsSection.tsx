import React from 'react';
import { useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { Plus, X, Star, Heart } from 'lucide-react';
import { CandidateFormData } from '../ProfileTab';

interface InterestsSectionProps {
  control: Control<CandidateFormData>;
  register: UseFormRegister<CandidateFormData>;
  isEditing: boolean;
}

const InterestsSection: React.FC<InterestsSectionProps> = ({ control, register, isEditing }) => {
  const { fields: interestFields, append: appendInterest, remove: removeInterest } = useFieldArray({
    control,
    name: 'interests'
  });

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'sports', label: 'Sports & Fitness' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'music', label: 'Music' },
    { value: 'travel', label: 'Travel' },
    { value: 'cooking', label: 'Cooking & Food' },
    { value: 'reading', label: 'Reading & Literature' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'photography', label: 'Photography' },
    { value: 'volunteer', label: 'Volunteering' },
    { value: 'learning', label: 'Learning & Education' },
    { value: 'business', label: 'Business & Entrepreneurship' },
    { value: 'nature', label: 'Nature & Outdoors' },
    { value: 'social', label: 'Social Activities' },
    { value: 'creative', label: 'Creative Arts' },
    { value: 'other', label: 'Other' }
  ];

  const levels = [
    { value: 'casual', label: 'Casual Interest' },
    { value: 'hobbyist', label: 'Hobbyist' },
    { value: 'enthusiast', label: 'Enthusiast' },
    { value: 'expert', label: 'Expert/Professional' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Interests & Hobbies</h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => appendInterest({
              name: '',
              category: 'other',
              level: 'casual',
              description: '',
              yearsOfExperience: undefined,
              achievements: [],
              relatedSkills: []
            })}
            className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Interest
          </button>
        )}
      </div>

      {interestFields.length === 0 && !isEditing && (
        <div className="text-center py-8">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Interests Added</h3>
          <p className="text-gray-600">Add your interests and hobbies to show your personality.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {interestFields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Star className="h-4 w-4 mr-2 text-purple-600" />
                Interest #{index + 1}
              </h4>
              {isEditing && interestFields.length > 0 && (
                <button
                  type="button"
                  onClick={() => removeInterest(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest/Hobby Name</label>
                <input
                  {...register(`interests.${index}.name`)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="e.g., Photography, Rock Climbing, Cooking"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    {...register(`interests.${index}.category`)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    {...register(`interests.${index}.level`)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    {levels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input
                  {...register(`interests.${index}.yearsOfExperience`, { valueAsNumber: true })}
                  disabled={!isEditing}
                  type="number"
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="How many years have you been involved?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  {...register(`interests.${index}.description`)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Describe your involvement and what you enjoy about this interest"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Achievements</label>
                <textarea
                  {...register(`interests.${index}.achievements`)}
                  disabled={!isEditing}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Any notable achievements or accomplishments (one per line)"
                />
                <p className="text-xs text-gray-500 mt-1">List one achievement per line</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Skills</label>
                <input
                  {...register(`interests.${index}.relatedSkills`)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Skills developed through this interest (comma-separated)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {interestFields.length === 0 && isEditing && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Add Your First Interest</h3>
          <p className="text-gray-600 mb-4">Share your interests and hobbies to show your personality and well-rounded nature.</p>
          <button
            type="button"
            onClick={() => appendInterest({
              name: '',
              category: 'other',
              level: 'casual',
              description: '',
              yearsOfExperience: undefined,
              achievements: [],
              relatedSkills: []
            })}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Interest
          </button>
        </div>
      )}
    </div>
  );
};

export default InterestsSection;
