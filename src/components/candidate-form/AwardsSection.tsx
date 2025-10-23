import React from 'react';
import { Plus, X, Trophy } from 'lucide-react';
import { CreateAwardDto } from '../../types/candidate.types';

interface AwardsSectionProps {
  awards: CreateAwardDto[];
  onChange: (awards: CreateAwardDto[]) => void;
}

const AwardsSection: React.FC<AwardsSectionProps> = ({ awards, onChange }) => {
  const handleAddAward = () => {
    const newAward: CreateAwardDto = {
      name: '',
      issuer: '',
      date: '',
      description: '',
      category: '',
      recognitionLevel: ''
    };
    onChange([...awards, newAward]);
  };

  const handleRemoveAward = (index: number) => {
    onChange(awards.filter((_, i) => i !== index));
  };

  const handleAwardChange = (index: number, field: keyof CreateAwardDto, value: string) => {
    const updated = awards.map((award, i) => 
      i === index ? { ...award, [field]: value } : award
    );
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-purple-600" />
          Awards & Recognition
        </h3>
        <button
          type="button"
          onClick={handleAddAward}
          className="flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Award
        </button>
      </div>

      {awards.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No awards added yet. Click "Add Award" to get started.</p>
      ) : (
        <div className="space-y-4">
          {awards.map((award, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Award #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveAward(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Award Name *
                  </label>
                  <input
                    type="text"
                    value={award.name}
                    onChange={(e) => handleAwardChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="e.g., Employee of the Year"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuer *
                  </label>
                  <input
                    type="text"
                    value={award.issuer}
                    onChange={(e) => handleAwardChange(index, 'issuer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="e.g., Microsoft Corporation"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={award.date}
                    onChange={(e) => handleAwardChange(index, 'date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={award.category || ''}
                    onChange={(e) => handleAwardChange(index, 'category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="e.g., Performance, Innovation"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recognition Level
                  </label>
                  <select
                    value={award.recognitionLevel || ''}
                    onChange={(e) => handleAwardChange(index, 'recognitionLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  >
                    <option value="">Select level...</option>
                    <option value="Team">Team</option>
                    <option value="Department">Department</option>
                    <option value="Company">Company</option>
                    <option value="Industry">Industry</option>
                    <option value="National">National</option>
                    <option value="International">International</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={award.description || ''}
                  onChange={(e) => handleAwardChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  rows={2}
                  placeholder="What was this award for? What did you accomplish?"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AwardsSection;
