import React from 'react';
import { useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { Plus, X, Trophy, Star } from 'lucide-react';
import { CandidateFormData } from '../ProfileTab';

interface AwardsSectionProps {
  control: Control<CandidateFormData>;
  register: UseFormRegister<CandidateFormData>;
  isEditing: boolean;
}

const AwardsSection: React.FC<AwardsSectionProps> = ({ control, register, isEditing }) => {
  const { fields: awardFields, append: appendAward, remove: removeAward } = useFieldArray({
    control,
    name: 'awards'
  });

  const recognitionLevels = [
    { value: 'international', label: 'International' },
    { value: 'national', label: 'National' },
    { value: 'regional', label: 'Regional' },
    { value: 'company', label: 'Company' },
    { value: 'team', label: 'Team' },
    { value: 'project', label: 'Project' },
    { value: 'other', label: 'Other' }
  ];

  const categories = [
    { value: 'professional', label: 'Professional Excellence' },
    { value: 'innovation', label: 'Innovation' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'technical', label: 'Technical Achievement' },
    { value: 'academic', label: 'Academic' },
    { value: 'community', label: 'Community Service' },
    { value: 'sales', label: 'Sales Performance' },
    { value: 'safety', label: 'Safety' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Awards & Recognition</h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => appendAward({
              name: '',
              issuer: '',
              date: '',
              description: '',
              category: 'professional',
              recognitionLevel: 'company'
            })}
            className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Award
          </button>
        )}
      </div>

      {awardFields.length === 0 && !isEditing && (
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Awards Added</h3>
          <p className="text-gray-600">Add your professional awards and recognition.</p>
        </div>
      )}

      {awardFields.map((field, index) => (
        <div key={field.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-purple-600" />
              Award #{index + 1}
            </h4>
            {isEditing && awardFields.length > 0 && (
              <button
                type="button"
                onClick={() => removeAward(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Award Name</label>
              <input
                {...register(`awards.${index}.name`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g., Employee of the Year"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
              <input
                {...register(`awards.${index}.issuer`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g., Company Name, Association"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
              <input
                {...register(`awards.${index}.date`)}
                disabled={!isEditing}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                {...register(`awards.${index}.category`)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Recognition Level</label>
              <select
                {...register(`awards.${index}.recognitionLevel`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              >
                {recognitionLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register(`awards.${index}.description`)}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="Describe what you achieved to receive this award"
            />
          </div>
        </div>
      ))}

      {awardFields.length === 0 && isEditing && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Add Your First Award</h3>
          <p className="text-gray-600 mb-4">Showcase your professional awards and recognition.</p>
          <button
            type="button"
            onClick={() => appendAward({
              name: '',
              issuer: '',
              date: '',
              description: '',
              category: 'professional',
              recognitionLevel: 'company'
            })}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Award
          </button>
        </div>
      )}
    </div>
  );
};

export default AwardsSection;
