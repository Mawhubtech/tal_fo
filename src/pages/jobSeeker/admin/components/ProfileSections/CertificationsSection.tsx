import React from 'react';
import { useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { Plus, X, Award, ExternalLink } from 'lucide-react';
import { CandidateFormData } from '../ProfileTab';

interface CertificationsSectionProps {
  control: Control<CandidateFormData>;
  register: UseFormRegister<CandidateFormData>;
  isEditing: boolean;
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({ control, register, isEditing }) => {
  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control,
    name: 'certifications'
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => appendCertification({
              name: '',
              issuer: '',
              dateIssued: '',
              expirationDate: '',
              credentialId: '',
              credentialUrl: '',
              description: ''
            })}
            className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Certification
          </button>
        )}
      </div>

      {certificationFields.length === 0 && !isEditing && (
        <div className="text-center py-8">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Certifications Added</h3>
          <p className="text-gray-600">Add your professional certifications and credentials.</p>
        </div>
      )}

      {certificationFields.map((field, index) => (
        <div key={field.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center">
              <Award className="h-4 w-4 mr-2 text-purple-600" />
              Certification #{index + 1}
            </h4>
            {isEditing && certificationFields.length > 0 && (
              <button
                type="button"
                onClick={() => removeCertification(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
              <input
                {...register(`certifications.${index}.name`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g., AWS Certified Solutions Architect"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
              <input
                {...register(`certifications.${index}.issuer`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g., Amazon Web Services"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
              <input
                {...register(`certifications.${index}.dateIssued`)}
                disabled={!isEditing}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
              <input
                {...register(`certifications.${index}.expirationDate`)}
                disabled={!isEditing}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank if certification doesn't expire</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID</label>
              <input
                {...register(`certifications.${index}.credentialId`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Certification ID or license number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credential URL</label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  {...register(`certifications.${index}.credentialUrl`)}
                  disabled={!isEditing}
                  type="url"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Link to verify certification"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register(`certifications.${index}.description`)}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="Describe what this certification demonstrates or covers"
            />
          </div>
        </div>
      ))}

      {certificationFields.length === 0 && isEditing && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Add Your First Certification</h3>
          <p className="text-gray-600 mb-4">Showcase your professional certifications and credentials.</p>
          <button
            type="button"
            onClick={() => appendCertification({
              name: '',
              issuer: '',
              dateIssued: '',
              expirationDate: '',
              credentialId: '',
              credentialUrl: '',
              description: ''
            })}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </button>
        </div>
      )}
    </div>
  );
};

export default CertificationsSection;
