import React from 'react';
import { useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { Plus, X, BookOpen, ExternalLink, Github } from 'lucide-react';
import { CandidateFormData } from '../ProfileTab';

interface ProjectsSectionProps {
  control: Control<CandidateFormData>;
  register: UseFormRegister<CandidateFormData>;
  isEditing: boolean;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ control, register, isEditing }) => {
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: 'projects'
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => appendProject({
              name: '',
              description: '',
              technologies: [],
              url: '',
              repositoryUrl: '',
              startDate: '',
              endDate: '',
              role: '',
              achievements: []
            })}
            className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Project
          </button>
        )}
      </div>

      {projectFields.length === 0 && !isEditing && (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Added</h3>
          <p className="text-gray-600">Add your projects to showcase your work and skills.</p>
        </div>
      )}

      {projectFields.map((field, index) => (
        <div key={field.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-purple-600" />
              Project #{index + 1}
            </h4>
            {isEditing && projectFields.length > 0 && (
              <button
                type="button"
                onClick={() => removeProject(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                {...register(`projects.${index}.name`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Enter project name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
              <input
                {...register(`projects.${index}.role`)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="e.g., Lead Developer, Frontend Developer"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register(`projects.${index}.description`)}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="Describe the project, its purpose, and your contributions"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                {...register(`projects.${index}.startDate`)}
                disabled={!isEditing}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                {...register(`projects.${index}.endDate`)}
                disabled={!isEditing}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  {...register(`projects.${index}.url`)}
                  disabled={!isEditing}
                  type="url"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="https://project-demo.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repository URL</label>
              <div className="relative">
                <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  {...register(`projects.${index}.repositoryUrl`)}
                  disabled={!isEditing}
                  type="url"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
            <input
              {...register(`projects.${index}.technologies`)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="React, Node.js, PostgreSQL, AWS (comma-separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Separate technologies with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Achievements</label>
            <textarea
              {...register(`projects.${index}.achievements`)}
              disabled={!isEditing}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="List key achievements, metrics, or outcomes (one per line)"
            />
            <p className="text-xs text-gray-500 mt-1">List one achievement per line</p>
          </div>
        </div>
      ))}

      {projectFields.length === 0 && isEditing && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Add Your First Project</h3>
          <p className="text-gray-600 mb-4">Showcase your projects to demonstrate your skills and experience.</p>
          <button
            type="button"
            onClick={() => appendProject({
              name: '',
              description: '',
              technologies: [],
              url: '',
              repositoryUrl: '',
              startDate: '',
              endDate: '',
              role: '',
              achievements: []
            })}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
