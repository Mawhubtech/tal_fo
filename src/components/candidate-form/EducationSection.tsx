import React from 'react';
import { Plus, X, GraduationCap } from 'lucide-react';
import { CreateEducationDto } from '../../types/candidate.types';

interface EducationSectionProps {
  education: CreateEducationDto[];
  onChange: (education: CreateEducationDto[]) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({ education, onChange }) => {
  const handleAddEducation = () => {
    const newEducation: CreateEducationDto = {
      degree: '',
      institution: '',
      major: '',
      minor: '',
      graduationDate: '',
      startDate: '',
      endDate: '',
      location: '',
      gpa: undefined,
      maxGpa: '',
      courses: [],
      honors: [],
      description: '',
      sortOrder: education.length
    };
    onChange([...education, newEducation]);
  };

  const handleRemoveEducation = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index: number, field: keyof CreateEducationDto, value: any) => {
    const updated = education.map((edu, i) => 
      i === index ? { ...edu, [field]: value } : edu
    );
    onChange(updated);
  };

  const handleArrayFieldChange = (index: number, field: 'courses' | 'honors', value: string) => {
    if (value.trim()) {
      const currentArray = education[index][field] || [];
      if (!currentArray.includes(value.trim())) {
        handleEducationChange(index, field, [...currentArray, value.trim()]);
      }
    }
  };

  const handleRemoveArrayItem = (eduIndex: number, field: 'courses' | 'honors', itemIndex: number) => {
    const currentArray = education[eduIndex][field] || [];
    handleEducationChange(eduIndex, field, currentArray.filter((_, i) => i !== itemIndex));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <GraduationCap className="w-5 h-5 mr-2 text-purple-600" />
          Education
        </h3>
        <button
          type="button"
          onClick={handleAddEducation}
          className="flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Education
        </button>
      </div>

      {education.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No education added yet. Click "Add Education" to get started.</p>
      ) : (
        <div className="space-y-6">
          {education.map((edu, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Education #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree *
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="e.g., Bachelor of Science"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution *
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="e.g., University of California"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Major
                  </label>
                  <input
                    type="text"
                    value={edu.major || ''}
                    onChange={(e) => handleEducationChange(index, 'major', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minor
                  </label>
                  <input
                    type="text"
                    value={edu.minor || ''}
                    onChange={(e) => handleEducationChange(index, 'minor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={edu.startDate || ''}
                    onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date / Graduation Date
                  </label>
                  <input
                    type="date"
                    value={edu.graduationDate || edu.endDate || ''}
                    onChange={(e) => {
                      handleEducationChange(index, 'graduationDate', e.target.value);
                      handleEducationChange(index, 'endDate', e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={edu.location || ''}
                    onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                    placeholder="e.g., Berkeley, CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GPA
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={edu.gpa || ''}
                      onChange={(e) => handleEducationChange(index, 'gpa', parseFloat(e.target.value) || undefined)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      placeholder="3.8"
                    />
                    <input
                      type="text"
                      value={edu.maxGpa || ''}
                      onChange={(e) => handleEducationChange(index, 'maxGpa', e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                      placeholder="4.0"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={edu.description || ''}
                  onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  rows={2}
                  placeholder="Additional details about your education..."
                />
              </div>

              {/* Courses */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relevant Courses (Press Enter to add)
                </label>
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.currentTarget.value;
                      handleArrayFieldChange(index, 'courses', value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  placeholder="e.g., Data Structures and Algorithms"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {(edu.courses || []).map((course, courseIndex) => (
                    <span
                      key={courseIndex}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {course}
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(index, 'courses', courseIndex)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Honors */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Honors & Awards (Press Enter to add)
                </label>
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.currentTarget.value;
                      handleArrayFieldChange(index, 'honors', value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
                  placeholder="e.g., Dean's List, Magna Cum Laude"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {(edu.honors || []).map((honor, honorIndex) => (
                    <span
                      key={honorIndex}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                    >
                      {honor}
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(index, 'honors', honorIndex)}
                        className="ml-1 text-green-600 hover:text-green-800"
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

export default EducationSection;
