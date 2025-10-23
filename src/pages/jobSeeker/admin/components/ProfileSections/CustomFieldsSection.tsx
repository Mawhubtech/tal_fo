import React from 'react';
import { useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { Plus, X, Edit3, Type, Hash, Calendar, FileText, ToggleLeft } from 'lucide-react';
import { CandidateFormData } from '../ProfileTab';

interface CustomFieldsSectionProps {
  control: Control<CandidateFormData>;
  register: UseFormRegister<CandidateFormData>;
  isEditing: boolean;
  watchedData?: CandidateFormData;
}

const CustomFieldsSection: React.FC<CustomFieldsSectionProps> = ({ control, register, isEditing, watchedData }) => {
  const { fields: customFieldFields, append: appendCustomField, remove: removeCustomField } = useFieldArray({
    control,
    name: 'customFields'
  });

  const fieldTypes = [
    { value: 'text', label: 'Text', icon: Type },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'textarea', label: 'Long Text', icon: FileText },
    { value: 'url', label: 'URL', icon: Edit3 },
    { value: 'email', label: 'Email', icon: Edit3 },
    { value: 'phone', label: 'Phone', icon: Edit3 }
  ];

  const generateFieldKey = (fieldName: string) => {
    return fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Custom Fields</h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => appendCustomField({
              fieldName: '',
              fieldKey: '',
              fieldType: 'text',
              fieldValue: '',
              fieldDescription: ''
            })}
            className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Custom Field
          </button>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Edit3 className="h-5 w-5 text-amber-600 mt-0.5" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-amber-900">Custom Fields</h4>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                Use custom fields to add any additional information that doesn't fit in the standard sections. 
                This could include portfolio URLs, social media handles, certifications, or any other relevant data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {customFieldFields.length === 0 && !isEditing && (
        <div className="text-center py-8">
          <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Fields Added</h3>
          <p className="text-gray-600">Add custom fields for any additional information.</p>
        </div>
      )}

      {customFieldFields.map((field, index) => (
        <div key={field.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center">
              <Edit3 className="h-4 w-4 mr-2 text-purple-600" />
              Custom Field #{index + 1}
            </h4>
            {isEditing && customFieldFields.length > 0 && (
              <button
                type="button"
                onClick={() => removeCustomField(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
              <input
                {...register(`customFields.${index}.fieldName`, {
                  onChange: (e) => {
                    const key = generateFieldKey(e.target.value);
                    // Update the field key automatically
                    const form = e.target.form;
                    if (form) {
                      const keyInput = form.querySelector(`input[name="customFields.${index}.fieldKey"]`) as HTMLInputElement;
                      if (keyInput) {
                        keyInput.value = key;
                      }
                    }
                  }
                })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g., Portfolio Website, GitHub Profile"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
              <select
                {...register(`customFields.${index}.fieldType`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              >
                {fieldTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Key (Auto-generated)</label>
            <input
              {...register(`customFields.${index}.fieldKey`)}
              disabled={true}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              placeholder="Auto-generated from field name"
            />
            <p className="text-xs text-gray-500 mt-1">This is automatically generated for internal use</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Value</label>
            {['textarea'].includes(watchedData.customFields?.[index]?.fieldType || 'text') ? (
              <textarea
                {...register(`customFields.${index}.fieldValue`)}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Enter the value for this field"
              />
            ) : (
              <input
                {...register(`customFields.${index}.fieldValue`)}
                disabled={!isEditing}
                type={['number', 'date', 'url', 'email', 'phone'].includes(watchedData.customFields?.[index]?.fieldType || 'text') ? (watchedData.customFields?.[index]?.fieldType === 'phone' ? 'tel' : watchedData.customFields?.[index]?.fieldType) : 'text'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Enter the value for this field"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              {...register(`customFields.${index}.fieldDescription`)}
              disabled={!isEditing}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="Optional description or context for this field"
            />
          </div>
        </div>
      ))}

      {customFieldFields.length === 0 && isEditing && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Add Your First Custom Field</h3>
          <p className="text-gray-600 mb-4">Create custom fields for any additional information you want to include in your profile.</p>
          <button
            type="button"
            onClick={() => appendCustomField({
              fieldName: '',
              fieldKey: '',
              fieldType: 'text',
              fieldValue: '',
              fieldDescription: ''
            })}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Field
          </button>
        </div>
      )}

      {customFieldFields.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Custom Fields Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {customFieldFields.map((field, index) => (
              <div key={field.id} className="bg-white border border-gray-200 rounded p-3">
                <div className="flex items-center mb-1">
                  {fieldTypes.find(t => t.value === field.fieldType)?.icon && (
                    React.createElement(fieldTypes.find(t => t.value === field.fieldType)!.icon, {
                      className: "h-4 w-4 text-purple-600 mr-2"
                    })
                  )}
                  <span className="text-sm font-medium text-gray-900">{field.fieldName || `Field ${index + 1}`}</span>
                </div>
                <p className="text-xs text-gray-600">{fieldTypes.find(t => t.value === field.fieldType)?.label}</p>
                {field.fieldValue && (
                  <p className="text-xs text-gray-800 mt-1 truncate">{field.fieldValue}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFieldsSection;
