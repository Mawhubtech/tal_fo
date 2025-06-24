import React from 'react';
import { Plus, X, Code } from 'lucide-react';
import { CreateProjectDto } from '../../types/candidate.types';

interface ProjectsSectionProps {
  projects: CreateProjectDto[];
  onChange: (projects: CreateProjectDto[]) => void;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, onChange }) => {
  const handleAddProject = () => {
    const newProject: CreateProjectDto = {
      name: '',
      description: '',
      technologies: [],
      url: '',
      repositoryUrl: '',
      startDate: '',
      endDate: '',
      role: '',
      teamSize: '',
      achievements: [],
      isActive: true,
      sortOrder: projects.length
    };
    onChange([...projects, newProject]);
  };

  const handleRemoveProject = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  const handleProjectChange = (index: number, field: keyof CreateProjectDto, value: any) => {
    const updated = projects.map((project, i) => 
      i === index ? { ...project, [field]: value } : project
    );
    onChange(updated);
  };

  const handleArrayFieldChange = (index: number, field: 'technologies' | 'achievements', value: string) => {
    if (value.trim()) {
      const currentArray = projects[index][field] || [];
      if (!currentArray.includes(value.trim())) {
        handleProjectChange(index, field, [...currentArray, value.trim()]);
      }
    }
  };

  const handleRemoveArrayItem = (projectIndex: number, field: 'technologies' | 'achievements', itemIndex: number) => {
    const currentArray = projects[projectIndex][field] || [];
    handleProjectChange(projectIndex, field, currentArray.filter((_, i) => i !== itemIndex));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Code className="w-5 h-5 mr-2 text-purple-600" />
          Projects
        </h3>
        <button
          type="button"
          onClick={handleAddProject}
          className="flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No projects added yet. Click "Add Project" to get started.</p>
      ) : (
        <div className="space-y-6">
          {projects.map((project, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Project #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., E-commerce Platform"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Role
                  </label>
                  <input
                    type="text"
                    value={project.role || ''}
                    onChange={(e) => handleProjectChange(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Full-Stack Developer, Team Lead"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={project.startDate || ''}
                    onChange={(e) => handleProjectChange(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={project.endDate || ''}
                    onChange={(e) => handleProjectChange(index, 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank if ongoing</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Size
                  </label>
                  <input
                    type="text"
                    value={project.teamSize || ''}
                    onChange={(e) => handleProjectChange(index, 'teamSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 5 people, Solo project"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project URL
                  </label>
                  <input
                    type="url"
                    value={project.url || ''}
                    onChange={(e) => handleProjectChange(index, 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repository URL
                  </label>
                  <input
                    type="url"
                    value={project.repositoryUrl || ''}
                    onChange={(e) => handleProjectChange(index, 'repositoryUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={project.description}
                  onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the project, its purpose, and what you built..."
                  required
                />
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
                  placeholder="e.g., React, Node.js, MongoDB"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {(project.technologies || []).map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(index, 'technologies', techIndex)}
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
                  placeholder="e.g., Increased user engagement by 35%"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {(project.achievements || []).map((achievement, achIndex) => (
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

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={project.isActive !== false}
                    onChange={(e) => handleProjectChange(index, 'isActive', e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active/Current Project</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
