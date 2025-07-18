import React, { useState, useEffect } from 'react';
import { X, Save, User, MapPin, Phone, Building, DollarSign, Calendar, Briefcase, Plus, Trash2 } from 'lucide-react';
import { useJobSeekerProfile, useUpdateJobSeekerProfile } from '../../../../hooks/useJobSeekerProfile';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  currentPosition: string;
}

interface JobPreferences {
  contractTypes: string[];
  startAvailability: string;
  targetSalary: string;
  workplaceSettings: string[];
  preferredCompanies: string[];
  hiddenCompanies: string[];
}

interface Experience {
  id?: string;
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
}

interface Skill {
  id?: string;
  name: string;
  level: string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { data: profile } = useJobSeekerProfile();
  const updateProfile = useUpdateJobSeekerProfile();
  
  const [activeTab, setActiveTab] = useState<'personal' | 'preferences' | 'experience' | 'skills'>('personal');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    currentPosition: ''
  });
  
  const [jobPreferences, setJobPreferences] = useState<JobPreferences>({
    contractTypes: [],
    startAvailability: '',
    targetSalary: '',
    workplaceSettings: [],
    preferredCompanies: [],
    hiddenCompanies: []
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newCompany, setNewCompany] = useState('');
  const [newHiddenCompany, setNewHiddenCompany] = useState('');

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        firstName: profile.user?.firstName || profile.candidate?.firstName || '',
        lastName: profile.user?.lastName || profile.candidate?.lastName || '',
        phone: profile.candidate?.phone || '',
        location: profile.candidate?.location || '',
        currentPosition: profile.candidate?.currentPosition || ''
      });

      setJobPreferences({
        contractTypes: profile.contractTypes || [],
        startAvailability: profile.startAvailability || '',
        targetSalary: profile.targetSalary?.toString() || '',
        workplaceSettings: profile.workplaceSettings || [],
        preferredCompanies: profile.preferredCompanies || [],
        hiddenCompanies: profile.hiddenCompanies || []
      });

      setExperiences(profile.candidate?.experience?.map(exp => ({
        id: exp.id,
        position: exp.position,
        company: exp.company,
        startDate: exp.startDate,
        endDate: exp.endDate || '',
        location: exp.location || '',
        description: exp.description || ''
      })) || []);

      setSkills(profile.candidate?.skillMappings?.map(sm => ({
        id: sm.id,
        name: sm.skill.name,
        level: sm.level
      })) || []);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      // Here you would call different API endpoints based on what was changed
      // For now, let's create a comprehensive update
      await updateProfile.mutateAsync({
        personalInfo,
        jobPreferences,
        experiences,
        skills
      });
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      location: '',
      description: ''
    }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const addSkill = () => {
    setSkills([...skills, { name: '', level: 'beginner' }]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, field: keyof Skill, value: string) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
  };

  const addPreferredCompany = () => {
    if (newCompany.trim()) {
      setJobPreferences({
        ...jobPreferences,
        preferredCompanies: [...jobPreferences.preferredCompanies, newCompany.trim()]
      });
      setNewCompany('');
    }
  };

  const removePreferredCompany = (index: number) => {
    setJobPreferences({
      ...jobPreferences,
      preferredCompanies: jobPreferences.preferredCompanies.filter((_, i) => i !== index)
    });
  };

  const addHiddenCompany = () => {
    if (newHiddenCompany.trim()) {
      setJobPreferences({
        ...jobPreferences,
        hiddenCompanies: [...jobPreferences.hiddenCompanies, newHiddenCompany.trim()]
      });
      setNewHiddenCompany('');
    }
  };

  const removeHiddenCompany = (index: number) => {
    setJobPreferences({
      ...jobPreferences,
      hiddenCompanies: jobPreferences.hiddenCompanies.filter((_, i) => i !== index)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'preferences', label: 'Job Preferences', icon: Briefcase },
              { id: 'experience', label: 'Experience', icon: Building },
              { id: 'skills', label: 'Skills', icon: MapPin }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={personalInfo.location}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Position</label>
                  <input
                    type="text"
                    value={personalInfo.currentPosition}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, currentPosition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Job Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Contract Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contract Types</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Temporary'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={jobPreferences.contractTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setJobPreferences({
                              ...jobPreferences,
                              contractTypes: [...jobPreferences.contractTypes, type]
                            });
                          } else {
                            setJobPreferences({
                              ...jobPreferences,
                              contractTypes: jobPreferences.contractTypes.filter(t => t !== type)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Workplace Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workplace Settings</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['Remote', 'Hybrid', 'On-site'].map((setting) => (
                    <label key={setting} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={jobPreferences.workplaceSettings.includes(setting)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setJobPreferences({
                              ...jobPreferences,
                              workplaceSettings: [...jobPreferences.workplaceSettings, setting]
                            });
                          } else {
                            setJobPreferences({
                              ...jobPreferences,
                              workplaceSettings: jobPreferences.workplaceSettings.filter(s => s !== setting)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{setting}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Availability</label>
                  <select
                    value={jobPreferences.startAvailability}
                    onChange={(e) => setJobPreferences({ ...jobPreferences, startAvailability: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select availability</option>
                    <option value="Immediately">Immediately</option>
                    <option value="Within 2 weeks">Within 2 weeks</option>
                    <option value="Within 1 month">Within 1 month</option>
                    <option value="Within 2 months">Within 2 months</option>
                    <option value="Within 3 months">Within 3 months</option>
                    <option value="More than 3 months">More than 3 months</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Salary</label>
                  <input
                    type="number"
                    value={jobPreferences.targetSalary}
                    onChange={(e) => setJobPreferences({ ...jobPreferences, targetSalary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Annual salary"
                  />
                </div>
              </div>

              {/* Preferred Companies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Companies</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Add a company"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addPreferredCompany()}
                  />
                  <button
                    onClick={addPreferredCompany}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobPreferences.preferredCompanies.map((company, index) => (
                    <span key={index} className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      {company}
                      <button
                        onClick={() => removePreferredCompany(index)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Hidden Companies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hidden Companies</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newHiddenCompany}
                    onChange={(e) => setNewHiddenCompany(e.target.value)}
                    placeholder="Add a company to hide"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addHiddenCompany()}
                  />
                  <button
                    onClick={addHiddenCompany}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobPreferences.hiddenCompanies.map((company, index) => (
                    <span key={index} className="inline-flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                      {company}
                      <button
                        onClick={() => removeHiddenCompany(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
                <button
                  onClick={addExperience}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </button>
              </div>
              
              {experiences.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-md font-medium text-gray-900">Experience {index + 1}</h4>
                    <button
                      onClick={() => removeExperience(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={exp.endDate || ''}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={exp.location || ''}
                        onChange={(e) => updateExperience(index, 'location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={exp.description || ''}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Skills</h3>
                <button
                  onClick={addSkill}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      placeholder="Skill name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <select
                      value={skill.level}
                      onChange={(e) => updateSkill(index, 'level', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                    <button
                      onClick={() => removeSkill(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
