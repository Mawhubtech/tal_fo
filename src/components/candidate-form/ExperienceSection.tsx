import React from 'react';
import { Plus, X, Briefcase } from 'lucide-react';
import { CreateExperienceDto } from '../../types/candidate.types';

interface ExperienceSectionProps {
  experience: CreateExperienceDto[];
  onChange: (experience: CreateExperienceDto[]) => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experience, onChange }) => {
  const handleAddExperience = () => {
    const newExperience: CreateExperienceDto = {
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      location: '',
      description: '',
      responsibilities: [],
      achievements: [],
      technologies: [],
      sortOrder: experience.length
    };
    onChange([...experience, newExperience]);
  };

  const handleRemoveExperience = (index: number) => {
    onChange(experience.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index: number, field: keyof CreateExperienceDto, value: any) => {
    const updated = experience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    );
    onChange(updated);
  };

  const handleArrayFieldChange = (index: number, field: 'responsibilities' | 'achievements' | 'technologies', value: string) => {
    if (value.trim()) {
      const currentArray = experience[index][field] || [];
      if (!currentArray.includes(value.trim())) {
        handleExperienceChange(index, field, [...currentArray, value.trim()]);
      }
    }
  };

  const handleRemoveArrayItem = (expIndex: number, field: 'responsibilities' | 'achievements' | 'technologies', itemIndex: number) => {
    const currentArray = experience[expIndex][field] || [];
    handleExperienceChange(expIndex, field, currentArray.filter((_, i) => i !== itemIndex));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
          Work Experience
        </h3>
        <button
          type="button"
          onClick={handleAddExperience}
          className="flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Experience
        </button>
      </div>

      {experience.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No work experience added yet. Click "Add Experience" to get started.</p>
      ) : (
        <div className="space-y-6">
          {experience.map((exp, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Microsoft"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={exp.startDate}
                    onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={exp.endDate || ''}
                    onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank if current position</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={exp.location || ''}
                    onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Seattle, WA"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={exp.description || ''}
                  onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the role and overall responsibilities..."
                />
              </div>

              {/* Responsibilities */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Responsibilities (Press Enter to add)
                </label>
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.currentTarget.value;
                      handleArrayFieldChange(index, 'responsibilities', value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Led a team of 5 developers"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {(exp.responsibilities || []).map((responsibility, respIndex) => (
                    <span
                      key={respIndex}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {responsibility}
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(index, 'responsibilities', respIndex)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Achievements (Press Enter to add)
                </label>
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.currentTarget.value;
                      handleArrayFieldChange(index, 'achievements', value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Reduced processing time by 40%"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {(exp.achievements || []).map((achievement, achIndex) => (
                    <span
                      key={achIndex}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                    >
                      {achievement}
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(index, 'achievements', achIndex)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technologies Used (Press Enter to add)
                </label>
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.currentTarget.value;
                      handleArrayFieldChange(index, 'technologies', value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., React, Node.js, PostgreSQL"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {(exp.technologies || []).map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(index, 'technologies', techIndex)}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceSection;
