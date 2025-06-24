import React from 'react';
import { Plus, X, Languages, Heart, Users } from 'lucide-react';
import { CreateCandidateLanguageDto, CreateCandidateInterestDto, CreateCandidateReferenceDto } from '../../types/candidate.types';

interface AdditionalSectionsProps {
  languages: CreateCandidateLanguageDto[];
  interests: CreateCandidateInterestDto[];
  references: CreateCandidateReferenceDto[];
  onLanguagesChange: (languages: CreateCandidateLanguageDto[]) => void;
  onInterestsChange: (interests: CreateCandidateInterestDto[]) => void;
  onReferencesChange: (references: CreateCandidateReferenceDto[]) => void;
}

const AdditionalSections: React.FC<AdditionalSectionsProps> = ({
  languages,
  interests,
  references,
  onLanguagesChange,
  onInterestsChange,
  onReferencesChange
}) => {
  // Languages handlers
  const handleAddLanguage = () => {
    const newLanguage: CreateCandidateLanguageDto = {
      language: '',
      proficiency: 'Intermediate',
      level: ''
    };
    onLanguagesChange([...languages, newLanguage]);
  };

  const handleRemoveLanguage = (index: number) => {
    onLanguagesChange(languages.filter((_, i) => i !== index));
  };

  const handleLanguageChange = (index: number, field: keyof CreateCandidateLanguageDto, value: string) => {
    const updated = languages.map((lang, i) => 
      i === index ? { ...lang, [field]: value } : lang
    );
    onLanguagesChange(updated);
  };

  // Interests handlers
  const handleAddInterest = () => {
    const newInterest: CreateCandidateInterestDto = {
      name: '',
      description: ''
    };
    onInterestsChange([...interests, newInterest]);
  };

  const handleRemoveInterest = (index: number) => {
    onInterestsChange(interests.filter((_, i) => i !== index));
  };

  const handleInterestChange = (index: number, field: keyof CreateCandidateInterestDto, value: string) => {
    const updated = interests.map((interest, i) => 
      i === index ? { ...interest, [field]: value } : interest
    );
    onInterestsChange(updated);
  };

  // References handlers
  const handleAddReference = () => {
    const newReference: CreateCandidateReferenceDto = {
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      relationship: ''
    };
    onReferencesChange([...references, newReference]);
  };

  const handleRemoveReference = (index: number) => {
    onReferencesChange(references.filter((_, i) => i !== index));
  };

  const handleReferenceChange = (index: number, field: keyof CreateCandidateReferenceDto, value: string) => {
    const updated = references.map((ref, i) => 
      i === index ? { ...ref, [field]: value } : ref
    );
    onReferencesChange(updated);
  };

  return (
    <div className="space-y-8">
      {/* Languages Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Languages className="w-5 h-5 mr-2 text-purple-600" />
            Languages
          </h3>
          <button
            type="button"
            onClick={handleAddLanguage}
            className="flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Language
          </button>
        </div>

        {languages.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No languages added yet. Click "Add Language" to get started.</p>
        ) : (
          <div className="space-y-4">
            {languages.map((lang, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Language #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language *
                    </label>
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Spanish, French"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proficiency *
                    </label>
                    <select
                      value={lang.proficiency}
                      onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Elementary">Elementary</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Native">Native</option>
                      <option value="Fluent">Fluent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level (Optional)
                    </label>
                    <input
                      type="text"
                      value={lang.level || ''}
                      onChange={(e) => handleLanguageChange(index, 'level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., B2, C1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interests Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-purple-600" />
            Interests & Hobbies
          </h3>
          <button
            type="button"
            onClick={handleAddInterest}
            className="flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Interest
          </button>
        </div>

        {interests.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No interests added yet. Click "Add Interest" to get started.</p>
        ) : (
          <div className="space-y-4">
            {interests.map((interest, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Interest #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interest/Hobby *
                    </label>
                    <input
                      type="text"
                      value={interest.name}
                      onChange={(e) => handleInterestChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Photography, Rock Climbing"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={interest.description || ''}
                      onChange={(e) => handleInterestChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Brief description..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* References Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            References
          </h3>
          <button
            type="button"
            onClick={handleAddReference}
            className="flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Reference
          </button>
        </div>

        {references.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No references added yet. Click "Add Reference" to get started.</p>
        ) : (
          <div className="space-y-4">
            {references.map((reference, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Reference #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveReference(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={reference.name}
                      onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., John Smith"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={reference.title || ''}
                      onChange={(e) => handleReferenceChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Senior Manager"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={reference.company || ''}
                      onChange={(e) => handleReferenceChange(index, 'company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Microsoft"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={reference.relationship || ''}
                      onChange={(e) => handleReferenceChange(index, 'relationship', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Direct Supervisor, Colleague"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={reference.email || ''}
                      onChange={(e) => handleReferenceChange(index, 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={reference.phone || ''}
                      onChange={(e) => handleReferenceChange(index, 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalSections;
