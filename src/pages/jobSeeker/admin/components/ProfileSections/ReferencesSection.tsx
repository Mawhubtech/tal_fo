import React from 'react';
import { useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { Plus, X, Users, Phone, Mail, Building } from 'lucide-react';
import { CandidateFormData } from '../ProfileTab';

interface ReferencesSectionProps {
  control: Control<CandidateFormData>;
  register: UseFormRegister<CandidateFormData>;
  isEditing: boolean;
}

const ReferencesSection: React.FC<ReferencesSectionProps> = ({ control, register, isEditing }) => {
  const { fields: referenceFields, append: appendReference, remove: removeReference } = useFieldArray({
    control,
    name: 'references'
  });

  const relationships = [
    { value: 'supervisor', label: 'Direct Supervisor' },
    { value: 'manager', label: 'Manager' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'client', label: 'Client' },
    { value: 'vendor', label: 'Vendor/Partner' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'professor', label: 'Professor/Teacher' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Professional References</h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => appendReference({
              name: '',
              position: '',
              company: '',
              email: '',
              phone: '',
              relationship: 'supervisor',
              yearsKnown: undefined
            })}
            className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Reference
          </button>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Users className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">Reference Guidelines</h4>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Always ask permission before listing someone as a reference</li>
                <li>Include people who can speak to your professional abilities</li>
                <li>Provide current contact information</li>
                <li>Consider including a mix of supervisors, colleagues, and clients</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {referenceFields.length === 0 && !isEditing && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No References Added</h3>
          <p className="text-gray-600">Add professional references who can vouch for your work.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {referenceFields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900 flex items-center">
                <Users className="h-4 w-4 mr-2 text-purple-600" />
                Reference #{index + 1}
              </h4>
              {isEditing && referenceFields.length > 0 && (
                <button
                  type="button"
                  onClick={() => removeReference(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  {...register(`references.${index}.name`)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Reference's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position/Title</label>
                <input
                  {...register(`references.${index}.position`)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Their job title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...register(`references.${index}.company`)}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...register(`references.${index}.email`)}
                    disabled={!isEditing}
                    type="email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="email@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    {...register(`references.${index}.phone`)}
                    disabled={!isEditing}
                    type="tel"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  {...register(`references.${index}.relationship`)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                >
                  {relationships.map((relationship) => (
                    <option key={relationship.value} value={relationship.value}>
                      {relationship.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years Known</label>
                <input
                  {...register(`references.${index}.yearsKnown`, { valueAsNumber: true })}
                  disabled={!isEditing}
                  type="number"
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="How many years have you known them?"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {referenceFields.length === 0 && isEditing && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Add Your First Reference</h3>
          <p className="text-gray-600 mb-4">Add professional references who can speak to your abilities and character.</p>
          <button
            type="button"
            onClick={() => appendReference({
              name: '',
              position: '',
              company: '',
              email: '',
              phone: '',
              relationship: 'supervisor',
              yearsKnown: undefined
            })}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Reference
          </button>
        </div>
      )}
    </div>
  );
};

export default ReferencesSection;
