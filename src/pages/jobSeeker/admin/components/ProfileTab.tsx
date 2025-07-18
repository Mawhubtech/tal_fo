import React, { useState } from 'react';
import { User, Upload, FileText, Calendar, Edit3, MapPin, Briefcase, Target, DollarSign, Clock, Star, Building, CheckCircle, XCircle } from 'lucide-react';
import { useJobSeekerProfile } from '../../../../hooks/useJobSeekerProfile';
import EditProfileModal from './EditProfileModal';

interface ProfileTabProps {
  user: any;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ user }) => {
  const { data: profile, isLoading, error } = useJobSeekerProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your profile information</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-red-600">
            <p>Error loading profile data. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your profile information</p>
        </div>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Profile
        </button>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={profile?.user?.firstName || profile?.candidate?.firstName || user?.firstName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={profile?.user?.lastName || profile?.candidate?.lastName || user?.lastName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profile?.user?.email || profile?.candidate?.email || user?.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={profile?.candidate?.phone || 'Not provided'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={profile?.candidate?.location || 'Not provided'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Position</label>
            <input
              type="text"
              value={profile?.candidate?.currentPosition || 'Not provided'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Job Preferences */}
      {profile && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Briefcase className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Contract Types</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.contractTypes?.map((type: string, index: number) => (
                  <span key={index} className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                    {type}
                  </span>
                )) || <span className="text-gray-500">Not specified</span>}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Start Availability</span>
              </div>
              <p className="text-gray-700">{profile.startAvailability || 'Not specified'}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Target Salary</span>
              </div>
              <p className="text-gray-700">
                {profile.targetSalary ? `$${Number(profile.targetSalary).toLocaleString()}` : 'Not specified'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Workplace Settings</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.workplaceSettings?.map((setting: string, index: number) => (
                  <span key={index} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    {setting}
                  </span>
                )) || <span className="text-gray-500">Not specified</span>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Building className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Preferred Companies</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.preferredCompanies?.length > 0 ? 
                  profile.preferredCompanies.map((company: string, index: number) => (
                    <span key={index} className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                      {company}
                    </span>
                  )) : <span className="text-gray-500">None specified</span>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <XCircle className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Hidden Companies</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.hiddenCompanies?.length > 0 ? 
                  profile.hiddenCompanies.map((company: string, index: number) => (
                    <span key={index} className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                      {company}
                    </span>
                  )) : <span className="text-gray-500">None hidden</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skills */}
      {profile?.candidate?.skillMappings && profile.candidate.skillMappings.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {profile.candidate.skillMappings.map((skillMapping: any, index: number) => (
              <div key={index} className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                <Star className="h-3 w-3 mr-1" />
                <span>{skillMapping.skill?.name}</span>
                {skillMapping.level && (
                  <span className="ml-1 text-purple-600">({skillMapping.level})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {profile?.candidate?.experience && profile.candidate.experience.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Experience</h2>
          <div className="space-y-4">
            {profile.candidate.experience.map((exp: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{exp.position}</h3>
                    <p className="text-purple-600 font-medium">{exp.company}</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'Start date not specified'} - 
                      {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                    </p>
                    {exp.location && (
                      <p className="text-gray-600 text-sm flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {exp.location}
                      </p>
                    )}
                    {exp.description && (
                      <p className="text-gray-700 mt-2">{exp.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resume Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume & Documents</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Upload your resume</p>
          <p className="text-sm text-gray-500">PDF, DOC, or DOCX (max 5MB)</p>
          <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Upload className="h-4 w-4 mr-2 inline" />
            Choose File
          </button>
        </div>
      </div>

      {/* Onboarding Progress */}
      {profile && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { key: 'personalInfoCompleted', label: 'Personal Info' },
              { key: 'preferencesCompleted', label: 'Preferences' },
              { key: 'companiesCompleted', label: 'Companies' },
              { key: 'skillsCompleted', label: 'Skills' },
              { key: 'experienceCompleted', label: 'Experience' },
              { key: 'educationCompleted', label: 'Education' }
            ].map((item) => (
              <div key={item.key} className="text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  (profile as any)[item.key] ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {(profile as any)[item.key] ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <p className={`text-xs ${(profile as any)[item.key] ? 'text-green-600' : 'text-gray-500'}`}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Status */}
      {profile && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Status</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Onboarding Status: {profile.onboardingStatus}
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Profile created on {new Date(profile.createdAt).toLocaleDateString()}
                </p>
                {profile.onboardingCompletedAt && (
                  <p className="text-sm text-green-700">
                    Onboarding completed on {new Date(profile.onboardingCompletedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </div>
  );
};

export default ProfileTab;
