import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Briefcase, DollarSign, Link as LinkIcon, Save, Upload, GraduationCap, Award, Plus, Camera } from 'lucide-react';
import { CreateCandidateDto, CandidateStatus, CandidateSource } from '../types/candidate.types';
import ExperienceSection from './candidate-form/ExperienceSection';
import EducationSection from './candidate-form/EducationSection';
import CertificationsSection from './candidate-form/CertificationsSection';
import ProjectsSection from './candidate-form/ProjectsSection';
import AwardsSection from './candidate-form/AwardsSection';
import AdditionalSections from './candidate-form/AdditionalSections';
import DocumentsSection from './candidate-form/DocumentsSection';
import { getAvatarUrl } from '../utils/fileUtils';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (candidateData: CreateCandidateDto & { avatarFile?: File | null }) => void;
  isLoading?: boolean;
  editingCandidate?: any; // The candidate data when editing
  isEditing?: boolean; // Whether we're in edit mode
}

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editingCandidate,
  isEditing = false
}) => {
  const [activeTab, setActiveTab] = useState('basic');  const [formData, setFormData] = useState<CreateCandidateDto>({
    personalInfo: {
      fullName: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      github: '',
      website: ''
    },
    summary: '',
    currentPosition: '',
    salaryExpectation: '',
    status: CandidateStatus.ACTIVE,
    source: CandidateSource.DIRECT_APPLICATION,
    notes: '',
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    awards: [],
    projects: [],
    languages: [],
    interests: [],
    references: [],
    documents: []
  });
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Effect to populate form data when editing
  useEffect(() => {
    if (isEditing && editingCandidate && isOpen) {
      // Populate form with existing candidate data
      setFormData({
        personalInfo: {
          fullName: editingCandidate.fullName || '',
          firstName: editingCandidate.firstName || '',
          lastName: editingCandidate.lastName || '',
          email: editingCandidate.email || '',
          phone: editingCandidate.phone || '',
          location: editingCandidate.location || '',
          linkedIn: editingCandidate.linkedIn || '',
          github: editingCandidate.github || '',
          website: editingCandidate.website || '',
          avatar: editingCandidate.avatar || ''
        },
        summary: editingCandidate.summary || '',
        currentPosition: editingCandidate.currentPosition || '',
        salaryExpectation: editingCandidate.salaryExpectation || '',
        status: editingCandidate.status || CandidateStatus.ACTIVE,
        source: editingCandidate.source || CandidateSource.DIRECT_APPLICATION,
        notes: editingCandidate.notes || '',
        skills: editingCandidate.skills || [],
        experience: editingCandidate.experience || [],
        education: editingCandidate.education || [],
        certifications: editingCandidate.certifications || [],
        awards: editingCandidate.awards || [],
        projects: editingCandidate.projects || [],        languages: editingCandidate.languages || [],
        interests: editingCandidate.interests || [],
        references: editingCandidate.references || [],
        documents: (editingCandidate.documents || []).map((doc: any) => ({
          ...doc,
          isExisting: true
        }))
      });      // Set avatar preview if exists
      if (editingCandidate.avatar) {
        const avatarUrl = getAvatarUrl(editingCandidate.avatar);
        if (avatarUrl) {
          setAvatarPreview(avatarUrl);
        }
      }
    } else if (!isEditing && isOpen) {
      // Reset form for new candidate
      setFormData({
        personalInfo: {
          fullName: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          location: '',
          linkedIn: '',
          github: '',
          website: ''
        },
        summary: '',
        currentPosition: '',
        salaryExpectation: '',
        status: CandidateStatus.ACTIVE,
        source: CandidateSource.DIRECT_APPLICATION,
        notes: '',
        skills: [],
        experience: [],
        education: [],
        certifications: [],
        awards: [],
        projects: [],
        languages: [],
        interests: [],
        references: [],
        documents: []
      });
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [isEditing, editingCandidate, isOpen]);const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills & Projects', icon: Award },
    { id: 'documents', label: 'Documents', icon: Upload },
    { id: 'additional', label: 'Additional', icon: Plus }
  ];

  const handlePersonalInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
        ...(field === 'firstName' || field === 'lastName' ? {
          fullName: field === 'firstName' 
            ? `${value} ${prev.personalInfo.lastName || ''}`.trim()
            : `${prev.personalInfo.firstName || ''} ${value}`.trim()
        } : {})
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFieldChange = (field: keyof CreateCandidateDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills?.includes(skillInput.trim())) {
        setFormData(prev => ({
          ...prev,
          skills: [...(prev.skills || []), skillInput.trim()]
        }));
      }
      setSkillInput('');
    }
  };
  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: 'Image must be less than 5MB' }));
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      setErrors(prev => ({ ...prev, avatar: '' }));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        avatar: ''
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.personalInfo.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.personalInfo.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.personalInfo.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.personalInfo.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.personalInfo.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!formData.personalInfo.location?.trim()) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setActiveTab('basic'); // Switch to basic tab to show errors
      return;
    }

    // Clean up the form data before sending
    const cleanedPersonalInfo = { ...formData.personalInfo };
    
    // Remove empty avatar field if no avatar is set
    if (!cleanedPersonalInfo.avatar || cleanedPersonalInfo.avatar.trim() === '') {
      delete cleanedPersonalInfo.avatar;
    }

    // Create the candidate data with avatar file if present
    const candidateDataWithFiles = {
      ...formData,
      personalInfo: cleanedPersonalInfo,
      avatarFile: avatarFile // Include the avatar file for upload
    };

    onSubmit(candidateDataWithFiles);
  };
  const handleClose = () => {
    setFormData({
      personalInfo: {
        fullName: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        linkedIn: '',
        github: '',
        website: ''
      },
      summary: '',
      currentPosition: '',
      salaryExpectation: '',
      status: CandidateStatus.ACTIVE,
      source: CandidateSource.DIRECT_APPLICATION,
      notes: '',
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      awards: [],
      projects: [],
      languages: [],
      interests: [],
      references: [],
      documents: []    });
    setSkillInput('');
    setErrors({});
    setAvatarFile(null);
    setAvatarPreview(null);
    setActiveTab('basic');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <User className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Candidate' : 'Add New Candidate'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* Personal Information */}                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-purple-600" />
                    Personal Information
                  </h3>
                  
                  {/* Avatar Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        {avatarPreview && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG or GIF. Max 5MB.
                        </p>
                        {errors.avatar && <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.personalInfo.firstName || ''}
                        onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter first name"
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.personalInfo.lastName || ''}
                        onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter last name"
                      />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-purple-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.personalInfo.email || ''}
                        onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter email address"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={formData.personalInfo.phone || ''}
                        onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter phone number"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location *
                      </label>
                      <input
                        type="text"
                        value={formData.personalInfo.location || ''}
                        onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.location ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter location"
                      />
                      {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleFieldChange('status', e.target.value as CandidateStatus)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value={CandidateStatus.ACTIVE}>Active</option>
                        <option value={CandidateStatus.INACTIVE}>Inactive</option>
                        <option value={CandidateStatus.INTERVIEWING}>Interviewing</option>
                        <option value={CandidateStatus.HIRED}>Hired</option>
                        <option value={CandidateStatus.REJECTED}>Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Position
                      </label>
                      <input
                        type="text"
                        value={formData.currentPosition || ''}
                        onChange={(e) => handleFieldChange('currentPosition', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter current position"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Salary Expectation
                      </label>
                      <input
                        type="text"
                        value={formData.salaryExpectation || ''}
                        onChange={(e) => handleFieldChange('salaryExpectation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., $80,000 - $100,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Source
                      </label>
                      <select
                        value={formData.source}
                        onChange={(e) => handleFieldChange('source', e.target.value as CandidateSource)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value={CandidateSource.DIRECT_APPLICATION}>Direct Application</option>
                        <option value={CandidateSource.LINKEDIN}>LinkedIn</option>
                        <option value={CandidateSource.INDEED}>Indeed</option>
                        <option value={CandidateSource.REFERRAL}>Referral</option>
                        <option value={CandidateSource.RECRUITMENT_AGENCY}>Recruitment Agency</option>
                        <option value={CandidateSource.OTHER}>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <LinkIcon className="w-5 h-5 mr-2 text-purple-600" />
                    Professional Links
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        value={formData.personalInfo.linkedIn || ''}
                        onChange={(e) => handlePersonalInfoChange('linkedIn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GitHub Profile
                      </label>
                      <input
                        type="url"
                        value={formData.personalInfo.github || ''}
                        onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Personal Website
                      </label>
                      <input
                        type="url"
                        value={formData.personalInfo.website || ''}
                        onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                  <textarea
                    value={formData.summary || ''}
                    onChange={(e) => handleFieldChange('summary', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Brief professional summary..."
                  />
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Internal notes about the candidate..."
                  />
                </div>
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <ExperienceSection
                experience={formData.experience || []}
                onChange={(experience) => handleFieldChange('experience', experience)}
              />
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <EducationSection
                education={formData.education || []}
                onChange={(education) => handleFieldChange('education', education)}
              />
            )}            {/* Skills & Projects Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-8">
                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Add Skills (Press Enter to add)
                    </label>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Type a skill and press Enter"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(formData.skills || []).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Projects */}
                <ProjectsSection
                  projects={formData.projects || []}
                  onChange={(projects) => handleFieldChange('projects', projects)}
                />

                {/* Certifications */}
                <CertificationsSection
                  certifications={formData.certifications || []}
                  onChange={(certifications) => handleFieldChange('certifications', certifications)}
                />

                {/* Awards */}
                <AwardsSection
                  awards={formData.awards || []}
                  onChange={(awards) => handleFieldChange('awards', awards)}
                />
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <DocumentsSection
                documents={formData.documents || []}
                onChange={(documents) => handleFieldChange('documents', documents)}
              />
            )}

            {/* Additional Tab */}
            {activeTab === 'additional' && (
              <AdditionalSections
                languages={formData.languages || []}
                interests={formData.interests || []}
                references={formData.references || []}
                onLanguagesChange={(languages) => handleFieldChange('languages', languages)}
                onInterestsChange={(interests) => handleFieldChange('interests', interests)}
                onReferencesChange={(references) => handleFieldChange('references', references)}
              />
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Candidate' : 'Add Candidate'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidateModal;
            