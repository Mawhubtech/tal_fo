import React, { useState } from 'react';
import { useJobSeekerProfile } from '../../../../hooks/useJobSeekerProfile';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobSeekerProfileApiService } from '../../../../services/jobSeekerProfileApiService';
import { Edit2, Check, X } from 'lucide-react';

const SettingsTab: React.FC = () => {
  const { data: profile } = useJobSeekerProfile();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  // Custom mutation hooks for each section
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: any) => jobSeekerProfileApiService.updatePreferencesForCompletedProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobSeekerProfile'] });
    },
  });

  const updateCompaniesMutation = useMutation({
    mutationFn: (data: any) => jobSeekerProfileApiService.updateCompaniesForCompletedProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobSeekerProfile'] });
    },
  });

  const updateProfileLinksMutation = useMutation({
    mutationFn: (data: any) => jobSeekerProfileApiService.updateProfileLinksForCompletedProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobSeekerProfile'] });
    },
  });

  const updatePersonalInfoMutation = useMutation({
    mutationFn: (data: any) => jobSeekerProfileApiService.updatePersonalInfoForCompletedProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobSeekerProfile'] });
    },
  });

  const updateGenericMutation = useMutation({
    mutationFn: ({ step, data }: { step: string; data: any }) => 
      jobSeekerProfileApiService.updateOnboardingStep(step, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobSeekerProfile'] });
    },
  });

  const formatValue = (val: any) => {
    if (val === undefined || val === null || val === '') return 'Not set';
    if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : 'Not set';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return String(val);
  };

  const formatSalaryRange = (salaryRange?: string) => {
    return salaryRange || 'Not set';
  };

  const SectionCard: React.FC<{
    title: string;
    children: React.ReactNode;
    sectionKey: string;
  }> = ({ title, children, sectionKey }) => {
    const isEditing = editingSection === sectionKey;

    const handleEdit = () => {
      setEditingSection(sectionKey);
      // Initialize edit values for this section
      const sectionData: any = {};
      if (sectionKey === 'jobPreferences') {
        sectionData.contractTypes = profile?.contractTypes || [];
        sectionData.startAvailability = profile?.startAvailability || '';
        sectionData.salaryRange = profile?.salaryRange || '';
        sectionData.salaryFlexible = profile?.salaryFlexible || false;
        sectionData.workplaceSettings = profile?.workplaceSettings || [];
      } else if (sectionKey === 'companyPreferences') {
        sectionData.companyStages = profile?.companyStages || [];
        sectionData.industries = profile?.industries || [];
        sectionData.companySizes = profile?.companySizes || [];
        sectionData.preferredCompanies = profile?.preferredCompanies ? profile.preferredCompanies.join(', ') : '';
        sectionData.hiddenCompanies = profile?.hiddenCompanies ? profile.hiddenCompanies.join(', ') : '';
      } else if (sectionKey === 'professionalLinks') {
        sectionData.linkedinUrl = profile?.linkedinUrl || '';
        sectionData.githubUrl = profile?.githubUrl || '';
        sectionData.portfolioUrl = profile?.portfolioUrl || '';
        sectionData.personalWebsite = profile?.personalWebsite || '';
      } else if (sectionKey === 'personalInfo') {
        sectionData.firstName = profile?.user?.firstName || '';
        sectionData.lastName = profile?.user?.lastName || '';
        sectionData.avatar = profile?.user?.avatar || '';
      }
      setEditValues(sectionData);
    };

    const handleSave = async () => {
      try {
        let dataToSave = { ...editValues };
        
        // Convert company arrays back to arrays for company preferences
        if (sectionKey === 'companyPreferences') {
          // Handle preferredCompanies - convert string to array or empty array
          if (editValues.preferredCompanies !== undefined) {
            dataToSave.preferredCompanies = editValues.preferredCompanies 
              ? editValues.preferredCompanies.split(',').map((s: string) => s.trim()).filter((s: string) => s)
              : [];
          }
          // Handle hiddenCompanies - convert string to array or empty array
          if (editValues.hiddenCompanies !== undefined) {
            dataToSave.hiddenCompanies = editValues.hiddenCompanies 
              ? editValues.hiddenCompanies.split(',').map((s: string) => s.trim()).filter((s: string) => s)
              : [];
          }
        }

        // Clean up data - remove empty string values and replace with undefined or appropriate defaults
        Object.keys(dataToSave).forEach(key => {
          if (dataToSave[key] === '') {
            delete dataToSave[key];
          }
        });

        console.log('Saving data for section:', sectionKey, dataToSave);

        // Use specific mutation based on section
        if (sectionKey === 'jobPreferences') {
          await updatePreferencesMutation.mutateAsync(dataToSave);
        } else if (sectionKey === 'companyPreferences') {
          await updateCompaniesMutation.mutateAsync(dataToSave);
        } else if (sectionKey === 'professionalLinks') {
          await updateProfileLinksMutation.mutateAsync(dataToSave);
        } else if (sectionKey === 'personalInfo') {
          await updatePersonalInfoMutation.mutateAsync(dataToSave);
        } else {
          // For other sections, use generic method
          await updateGenericMutation.mutateAsync({
            step: sectionKey,
            data: dataToSave
          });
        }
        
        setEditingSection(null);
        setEditValues({});
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };

    const handleCancel = () => {
      setEditingSection(null);
      setEditValues({});
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>
        <div className="space-y-1">
          {isEditing ? (
            <div className="space-y-4">
              {children}
              <div className="flex space-x-2 pt-4 border-t">
                <button
                  onClick={handleSave}
                  disabled={updatePreferencesMutation.isPending || updateCompaniesMutation.isPending || updateProfileLinksMutation.isPending || updatePersonalInfoMutation.isPending || updateGenericMutation.isPending}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  <Check size={14} className="mr-1" />
                  Save Section
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  <X size={14} className="mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    );
  };

  const DisplayItem: React.FC<{ label: string; value: any }> = ({ label, value }) => (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600">{formatValue(value)}</p>
    </div>
  );

  const EditItem: React.FC<{
    label: string;
    field: string;
    type: 'text' | 'url' | 'select' | 'multiselect' | 'boolean' | 'textarea';
    options?: string[];
  }> = ({ label, field, type, options = [] }) => {
    const value = editValues[field];

    const handleChange = (newValue: any) => {
      setEditValues({ ...editValues, [field]: newValue });
    };

    const renderInput = () => {
      switch (type) {
        case 'boolean':
          return (
            <select
              value={value ? 'true' : 'false'}
              onChange={(e) => handleChange(e.target.value === 'true')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          );
        
        case 'select':
          return (
            <select
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select an option</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          );
        
        case 'multiselect':
          return (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {options.map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) ? value.includes(option) : false}
                    onChange={(e) => {
                      const currentArray = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleChange([...currentArray, option]);
                      } else {
                        handleChange(currentArray.filter(item => item !== option));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          );
        
        case 'textarea':
          return (
            <textarea
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
              placeholder="Enter companies separated by commas"
            />
          );
        
        default:
          return (
            <input
              type={type}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder={type === 'url' ? 'https://example.com' : ''}
            />
          );
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        {renderInput()}
      </div>
    );
  };

  const contractTypeOptions = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Internship',
    'Temporary'
  ];

  const startAvailabilityOptions = [
    'Immediately',
    'Within 2 weeks',
    'Within 1 month',
    'Within 2 months',
    'Within 3 months',
    'More than 3 months'
  ];

  const workplaceSettingOptions = [
    'Remote',
    'On-site',
    'Hybrid',
    'Flexible'
  ];

  const salaryRangeOptions = [
    '$0 - $30,000',
    '$30,000 - $50,000',
    '$50,000 - $70,000',
    '$70,000 - $90,000',
    '$90,000 - $120,000',
    '$120,000 - $150,000',
    '$150,000 - $200,000',
    '$200,000 - $250,000',
    '$250,000+'
  ];

  const companyStageOptions = [
    'Startup (Pre-Seed)',
    'Startup (Seed)',
    'Startup (Series A)',
    'Startup (Series B+)',
    'Scale-up',
    'Established Company',
    'Enterprise',
    'Government/Public Sector',
    'Non-profit'
  ];

  const industryOptions = [
    'Technology',
    'Finance & Banking',
    'Healthcare',
    'Education',
    'Retail & E-commerce',
    'Manufacturing',
    'Media & Entertainment',
    'Consulting',
    'Real Estate',
    'Transportation',
    'Energy',
    'Government',
    'Non-profit',
    'Automotive',
    'Aerospace',
    'Telecommunications',
    'Agriculture',
    'Construction',
    'Legal',
    'Marketing & Advertising'
  ];

  const companySizeOptions = [
    '1-10 employees',
    '11-50 employees', 
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1001-5000 employees',
    '5000+ employees'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">View and manage your job search preferences</p>
      </div>

      {/* Personal Information */}
      <SectionCard title="Personal Information" sectionKey="personalInfo">
        {editingSection === 'personalInfo' ? (
          <>
            <EditItem 
              label="First Name" 
              field="firstName"
              type="text"
            />
            <EditItem 
              label="Last Name" 
              field="lastName"
              type="text"
            />
            <EditItem 
              label="Avatar URL" 
              field="avatar"
              type="url"
            />
          </>
        ) : (
          <>
            <DisplayItem label="First Name" value={profile?.user?.firstName} />
            <DisplayItem label="Last Name" value={profile?.user?.lastName} />
            <DisplayItem label="Email" value={profile?.user?.email} />
            <DisplayItem label="Avatar" value={profile?.user?.avatar ? 'Set' : 'Not set'} />
            {profile?.user?.avatar && (
              <div className="py-3">
                <p className="text-sm font-medium text-gray-900 mb-2">Current Avatar</p>
                <img 
                  src={profile.user.avatar} 
                  alt="User avatar" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* Job Preferences */}
      <SectionCard title="Job Preferences" sectionKey="jobPreferences">
        {editingSection === 'jobPreferences' ? (
          <>
            <EditItem 
              label="Contract Types" 
              field="contractTypes"
              type="multiselect"
              options={contractTypeOptions}
            />
            <EditItem 
              label="Start Availability" 
              field="startAvailability"
              type="select"
              options={startAvailabilityOptions}
            />
            <EditItem 
              label="Salary Range" 
              field="salaryRange"
              type="select"
              options={salaryRangeOptions}
            />
            <EditItem 
              label="Salary Flexible" 
              field="salaryFlexible"
              type="boolean"
            />
            <EditItem 
              label="Workplace Settings" 
              field="workplaceSettings"
              type="multiselect"
              options={workplaceSettingOptions}
            />
          </>
        ) : (
          <>
            <DisplayItem label="Contract Types" value={profile?.contractTypes} />
            <DisplayItem label="Start Availability" value={profile?.startAvailability} />
            <DisplayItem label="Salary Range" value={formatSalaryRange(profile?.salaryRange)} />
            <DisplayItem label="Salary Flexible" value={profile?.salaryFlexible} />
            <DisplayItem label="Workplace Settings" value={profile?.workplaceSettings} />
          </>
        )}
      </SectionCard>

      {/* Company Preferences */}
      <SectionCard title="Company Preferences" sectionKey="companyPreferences">
        {editingSection === 'companyPreferences' ? (
          <>
            <EditItem 
              label="Company Stages" 
              field="companyStages"
              type="multiselect"
              options={companyStageOptions}
            />
            <EditItem 
              label="Industries" 
              field="industries"
              type="multiselect"
              options={industryOptions}
            />
            <EditItem 
              label="Company Sizes" 
              field="companySizes"
              type="multiselect"
              options={companySizeOptions}
            />
            <EditItem 
              label="Preferred Companies (comma separated)" 
              field="preferredCompanies"
              type="textarea"
            />
            <EditItem 
              label="Hidden Companies (comma separated)" 
              field="hiddenCompanies"
              type="textarea"
            />
          </>
        ) : (
          <>
            <DisplayItem label="Company Stages" value={profile?.companyStages} />
            <DisplayItem label="Industries" value={profile?.industries} />
            <DisplayItem label="Company Sizes" value={profile?.companySizes} />
            <DisplayItem label="Preferred Companies" value={profile?.preferredCompanies} />
            <DisplayItem label="Hidden Companies" value={profile?.hiddenCompanies} />
          </>
        )}
      </SectionCard>

      {/* Professional Links */}
      <SectionCard title="Professional Links" sectionKey="professionalLinks">
        {editingSection === 'professionalLinks' ? (
          <>
            <EditItem 
              label="LinkedIn URL" 
              field="linkedinUrl"
              type="url"
            />
            <EditItem 
              label="GitHub URL" 
              field="githubUrl"
              type="url"
            />
            <EditItem 
              label="Portfolio URL" 
              field="portfolioUrl"
              type="url"
            />
            <EditItem 
              label="Personal Website" 
              field="personalWebsite"
              type="url"
            />
          </>
        ) : (
          <>
            <DisplayItem label="LinkedIn URL" value={profile?.linkedinUrl} />
            <DisplayItem label="GitHub URL" value={profile?.githubUrl} />
            <DisplayItem label="Portfolio URL" value={profile?.portfolioUrl} />
            <DisplayItem label="Personal Website" value={profile?.personalWebsite} />
          </>
        )}
      </SectionCard>

      {/* Account Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
        <div className="space-y-1">
          <DisplayItem label="Onboarding Status" value={profile?.onboardingStatus} />
          <DisplayItem label="Profile Completed" value={profile?.profileCompleted} />
          <DisplayItem label="CV Uploaded" value={profile?.cvFileName ? 'Yes' : 'No'} />
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
        <div className="space-y-3">
          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-left">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
