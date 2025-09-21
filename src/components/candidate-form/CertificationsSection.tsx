import React from 'react';
import { Plus, X, Award } from 'lucide-react';
import { CreateCertificationDto } from '../../types/candidate.types';

interface CertificationsSectionProps {
  certifications: CreateCertificationDto[];
  onChange: (certifications: CreateCertificationDto[]) => void;
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({ certifications, onChange }) => {
  const handleAddCertification = () => {
    const newCertification: CreateCertificationDto = {
      name: '',
      issuer: '',
      dateIssued: '',
      expirationDate: '',
      credentialId: '',
      credentialUrl: '',
      description: '',
      isActive: true
    };
    onChange([...certifications, newCertification]);
  };

  const handleRemoveCertification = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  const handleCertificationChange = (index: number, field: keyof CreateCertificationDto, value: any) => {
    const updated = certifications.map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    );
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Award className="w-5 h-5 mr-2 text-purple-600" />
          Certifications
        </h3>
        <button
          type="button"
          onClick={handleAddCertification}
          className="flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Certification
        </button>
      </div>

      {certifications.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No certifications added yet. Click "Add Certification" to get started.</p>
      ) : (
        <div className="space-y-6">
          {certifications.map((cert, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Certification #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveCertification(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certification Name *
                  </label>
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="e.g., AWS Certified Solutions Architect"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuer *
                  </label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="e.g., Amazon Web Services"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Issued *
                  </label>
                  <input
                    type="date"
                    value={cert.dateIssued}
                    onChange={(e) => handleCertificationChange(index, 'dateIssued', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={cert.expirationDate || ''}
                    onChange={(e) => handleCertificationChange(index, 'expirationDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credential ID
                  </label>
                  <input
                    type="text"
                    value={cert.credentialId || ''}
                    onChange={(e) => handleCertificationChange(index, 'credentialId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="e.g., AWS-SAA-12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credential URL
                  </label>
                  <input
                    type="url"
                    value={cert.credentialUrl || ''}
                    onChange={(e) => handleCertificationChange(index, 'credentialUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={cert.description || ''}
                  onChange={(e) => handleCertificationChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  rows={2}
                  placeholder="Additional details about this certification..."
                />
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={cert.isActive !== false}
                    onChange={(e) => handleCertificationChange(index, 'isActive', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active/Valid Certification</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificationsSection;
