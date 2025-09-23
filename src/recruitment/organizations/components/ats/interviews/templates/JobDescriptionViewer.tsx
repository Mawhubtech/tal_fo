import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Eye, 
  Edit3, 
  Save, 
  X, 
  FileText, 
  Briefcase, 
  DollarSign,
  MapPin,
  Clock,
  Users,
  Star,
  Plus,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { GeneratedJobDescription } from './AIJobDescriptionGenerator';

interface JobDescriptionViewerProps {
  isOpen: boolean;
  onClose: () => void;
  jobDescription: GeneratedJobDescription;
  onSave?: (updatedJobDescription: GeneratedJobDescription) => void;
  onCreateJob?: (jobDescription: GeneratedJobDescription) => void;
  isEditable?: boolean;
  clientName: string;
  isSaving?: boolean;
}

export const JobDescriptionViewer: React.FC<JobDescriptionViewerProps> = ({
  isOpen,
  onClose,
  jobDescription: initialJobDescription,
  onSave,
  onCreateJob,
  isEditable = true,
  clientName,
  isSaving = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [jobDescription, setJobDescription] = useState<GeneratedJobDescription>(initialJobDescription);
  const [hasChanges, setHasChanges] = useState(false);

  // Enhanced modal behavior
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    setJobDescription(initialJobDescription);
    setHasChanges(false);
    setIsEditing(false);
  }, [initialJobDescription, isOpen]);

  const handleFieldChange = <K extends keyof GeneratedJobDescription>(
    field: K,
    value: GeneratedJobDescription[K]
  ) => {
    setJobDescription(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleArrayFieldChange = <K extends keyof GeneratedJobDescription>(
    field: K,
    index: number,
    value: string
  ) => {
    const array = jobDescription[field] as string[];
    const newArray = [...array];
    newArray[index] = value;
    handleFieldChange(field, newArray as GeneratedJobDescription[K]);
  };

  const addArrayItem = <K extends keyof GeneratedJobDescription>(field: K) => {
    const array = (jobDescription[field] as string[]) || [];
    handleFieldChange(field, [...array, ''] as GeneratedJobDescription[K]);
  };

  const removeArrayItem = <K extends keyof GeneratedJobDescription>(field: K, index: number) => {
    const array = jobDescription[field] as string[];
    const newArray = array.filter((_, i) => i !== index);
    handleFieldChange(field, newArray as GeneratedJobDescription[K]);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(jobDescription);
    }
    setHasChanges(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setJobDescription(initialJobDescription);
    setHasChanges(false);
    setIsEditing(false);
  };

  const handleCreateJob = () => {
    if (onCreateJob) {
      onCreateJob(jobDescription);
    }
  };

  const copyToClipboard = () => {
    const content = `
Job Title: ${jobDescription.jobTitle}
Experience Level: ${jobDescription.experienceLevel}
${jobDescription.department ? `Department: ${jobDescription.department}` : ''}
${jobDescription.workType ? `Work Type: ${jobDescription.workType}` : ''}
${jobDescription.salaryRange ? `Salary: ${jobDescription.salaryRange}` : ''}

Job Description:
${jobDescription.jobDescription}

Key Responsibilities:
${jobDescription.responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Requirements:
${jobDescription.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Required Skills:
${jobDescription.skills.join(', ')}

Benefits:
${jobDescription.benefits.map((b, i) => `${i + 1}. ${b}`).join('\n')}

${jobDescription.companyInfo ? `\nCompany Information:\n${jobDescription.companyInfo}` : ''}
    `.trim();

    navigator.clipboard.writeText(content);
    // Could add a toast notification here
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed top-0 right-0 bottom-0 left-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Job Description' : 'Job Description'}
              </h2>
              <p className="text-sm text-gray-500">Generated for {clientName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isEditing && isEditable && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit job description"
              >
                <Edit3 className="h-5 w-5" />
              </button>
            )}
            
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="h-5 w-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Job Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={jobDescription.jobTitle}
                      onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <h3 className="text-2xl font-bold text-gray-900">{jobDescription.jobTitle}</h3>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Experience Level</label>
                      {isEditing ? (
                        <select
                          value={jobDescription.experienceLevel}
                          onChange={(e) => handleFieldChange('experienceLevel', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Entry Level">Entry Level</option>
                          <option value="Mid Level">Mid Level</option>
                          <option value="Senior Level">Senior Level</option>
                          <option value="Lead/Principal">Lead/Principal</option>
                          <option value="Executive">Executive</option>
                        </select>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{jobDescription.experienceLevel}</span>
                      )}
                    </div>
                  </div>
                  
                  {(jobDescription.department || isEditing) && (
                    <div className="flex items-center space-x-3">
                      <Users className="w-4 h-4 text-blue-500" />
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Department</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={jobDescription.department || ''}
                            onChange={(e) => handleFieldChange('department', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Department name"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900">{jobDescription.department}</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {(jobDescription.workType || isEditing) && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Work Type</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={jobDescription.workType || ''}
                            onChange={(e) => handleFieldChange('workType', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Remote, On-site, Hybrid"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900">{jobDescription.workType}</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {(jobDescription.salaryRange || isEditing) && (
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-4 h-4 text-purple-500" />
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Salary Range</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={jobDescription.salaryRange || ''}
                            onChange={(e) => handleFieldChange('salaryRange', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., $80,000 - $120,000"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900">{jobDescription.salaryRange}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h4>
              {isEditing ? (
                <textarea
                  value={jobDescription.jobDescription}
                  onChange={(e) => handleFieldChange('jobDescription', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              ) : (
                <div className="prose max-w-none text-gray-700 bg-gray-50 rounded-lg p-4">
                  {jobDescription.jobDescription.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3 last:mb-0">{paragraph}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Responsibilities */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">Key Responsibilities</h4>
                {isEditing && (
                  <button
                    onClick={() => addArrayItem('responsibilities')}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {jobDescription.responsibilities.map((responsibility, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    {isEditing ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={responsibility}
                          onChange={(e) => handleArrayFieldChange('responsibilities', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={() => removeArrayItem('responsibilities', index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-700 text-sm leading-relaxed">{responsibility}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">Requirements</h4>
                {isEditing && (
                  <button
                    onClick={() => addArrayItem('requirements')}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {jobDescription.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs font-medium flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    {isEditing ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => handleArrayFieldChange('requirements', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={() => removeArrayItem('requirements', index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-700 text-sm leading-relaxed">{requirement}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">Required Skills</h4>
                {isEditing && (
                  <button
                    onClick={() => addArrayItem('skills')}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  {jobDescription.skills.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleArrayFieldChange('skills', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={() => removeArrayItem('skills', index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {jobDescription.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Benefits */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">Benefits & Perks</h4>
                {isEditing && (
                  <button
                    onClick={() => addArrayItem('benefits')}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {jobDescription.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></span>
                    {isEditing ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => handleArrayFieldChange('benefits', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={() => removeArrayItem('benefits', index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-700 text-sm leading-relaxed">{benefit}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Company Info */}
            {(jobDescription.companyInfo || isEditing) && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">About the Company</h4>
                {isEditing ? (
                  <textarea
                    value={jobDescription.companyInfo || ''}
                    onChange={(e) => handleFieldChange('companyInfo', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Company description and culture information..."
                  />
                ) : (
                  <div className="prose max-w-none text-gray-700 bg-gray-50 rounded-lg p-4">
                    <p>{jobDescription.companyInfo}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          {isEditing ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              {onCreateJob && (
                <button
                  onClick={handleCreateJob}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Create Job Posting</span>
                </button>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Generated from intake meeting data</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal content in a portal to bypass any parent z-index issues
  return createPortal(modalContent, document.body);
};

export default JobDescriptionViewer;
