import React from 'react';
import { useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { Plus, X, Languages, Globe } from 'lucide-react';
import { CandidateFormData } from '../ProfileTab';

interface LanguagesSectionProps {
  control: Control<CandidateFormData>;
  register: UseFormRegister<CandidateFormData>;
  isEditing: boolean;
}

const LanguagesSection: React.FC<LanguagesSectionProps> = ({ control, register, isEditing }) => {
  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control,
    name: 'languages'
  });

  const proficiencyLevels = [
    { value: 'basic', label: 'Basic (A1-A2)' },
    { value: 'intermediate', label: 'Intermediate (B1-B2)' },
    { value: 'advanced', label: 'Advanced (C1)' },
    { value: 'fluent', label: 'Fluent (C2)' },
    { value: 'native', label: 'Native Speaker' }
  ];

  const skillLevels = [
    { value: 'basic', label: 'Basic' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'fluent', label: 'Fluent' },
    { value: 'native', label: 'Native' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Languages</h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => appendLanguage({
              language: '',
              proficiency: 'intermediate',
              speakingLevel: 'intermediate',
              writingLevel: 'intermediate',
              readingLevel: 'intermediate',
              isNative: false,
              certificationName: ''
            })}
            className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Language
          </button>
        )}
      </div>

      {languageFields.length === 0 && !isEditing && (
        <div className="text-center py-8">
          <Languages className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Languages Added</h3>
          <p className="text-gray-600">Add your language skills and proficiency levels.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {languageFields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Globe className="h-4 w-4 mr-2 text-purple-600" />
                Language #{index + 1}
              </h4>
              {isEditing && languageFields.length > 0 && (
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <input
                  {...register(`languages.${index}.language`)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="e.g., English, Spanish, French"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overall Proficiency</label>
                <select
                  {...register(`languages.${index}.proficiency`)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                >
                  {proficiencyLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  {...register(`languages.${index}.isNative`)}
                  disabled={!isEditing}
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                />
                <label className="text-sm font-medium text-gray-700">Native Speaker</label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Speaking</label>
                  <select
                    {...register(`languages.${index}.speakingLevel`)}
                    disabled={!isEditing}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    {skillLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Writing</label>
                  <select
                    {...register(`languages.${index}.writingLevel`)}
                    disabled={!isEditing}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    {skillLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Reading</label>
                  <select
                    {...register(`languages.${index}.readingLevel`)}
                    disabled={!isEditing}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  >
                    {skillLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
                <input
                  {...register(`languages.${index}.certificationName`)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="e.g., TOEFL, IELTS, DELE (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">Any language proficiency certifications</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {languageFields.length === 0 && isEditing && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Languages className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Add Your First Language</h3>
          <p className="text-gray-600 mb-4">Showcase your language skills and proficiency levels.</p>
          <button
            type="button"
            onClick={() => appendLanguage({
              language: '',
              proficiency: 'intermediate',
              speakingLevel: 'intermediate',
              writingLevel: 'intermediate',
              readingLevel: 'intermediate',
              isNative: false,
              certificationName: ''
            })}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Language
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguagesSection;
