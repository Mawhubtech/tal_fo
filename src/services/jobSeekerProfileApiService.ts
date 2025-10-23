import apiClient from '../lib/api';

export interface JobSeekerProfile {
  id: string;
  userId: string;
  candidateId?: string;
  onboardingStatus: 'not_started' | 'in_progress' | 'completed';
  onboardingCompletedAt?: string;
  contractTypes: string[];
  startAvailability: string;
  targetSalary?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryRange?: string;
  salaryFlexible?: boolean;
  workplaceSettings: string[];
  preferredCompanies: string[];
  hiddenCompanies: string[];
  companyStages?: string[];
  industries?: string[];
  companySizes?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  personalWebsite?: string;
  cvFileName?: string;
  cvFilePath?: string;
  personalInfoCompleted: boolean;
  preferencesCompleted: boolean;
  companiesCompleted: boolean;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    provider: string;
    providerId?: string;
    status: string;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: string;
    gmailAccessToken?: string;
    gmailRefreshToken?: string;
    gmailEmail?: string;
    gmailConnectedAt?: string;
    createdAt: string;
    updatedAt: string;
    roles?: Array<{
      id: string;
      name: string;
      description: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
      permissions?: Array<{
        id: string;
        name: string;
        description: string;
        resource: string;
        action: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      }>;
    }>;
  };
  candidate?: {
    id: string;
    fullName?: string;
    email: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    phone?: string;
    location: string;
    website?: string;
    linkedIn?: string;
    github?: string;
    avatar?: string;
    summary?: string;
    currentPosition?: string;
    salaryExpectation?: string;
    status: string;
    rating: string;
    appliedDate?: string;
    lastActivity?: string;
    source: string;
    notes?: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    experience: Array<{
      id: string;
      position: string;
      company: string;
      startDate: string;
      endDate?: string;
      location?: string;
      description?: string;
      responsibilities?: string[];
      achievements?: string[];
      technologies?: string[];
      sortOrder: number;
      createdAt: string;
      updatedAt: string;
      candidateId: string;
    }>;
    education: Array<{
      id: string;
      institution: string;
      degree: string;
      field: string;
      graduationYear: number;
      createdAt: string;
      updatedAt: string;
      candidateId: string;
    }>;
    skillMappings: Array<{
      id: string;
      candidateId: string;
      skillId: string;
      level: string;
      yearsOfExperience: number;
      isHighlighted: boolean;
      createdAt: string;
      updatedAt: string;
      skill: {
        id: string;
        name: string;
        category: string;
        description?: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      };
    }>;
  };
}

export interface OnboardingData {
  personalInfo: {
    firstName: string;
    lastName: string;
    location: string;
  };
  preferences: {
    contractTypes: string[];
    startAvailability: string;
    salaryRange?: string;
    salaryFlexible?: boolean;
    workplaceSettings: string[];
  };
  companies?: {
    preferredCompanies: string[];
    hiddenCompanies: string[];
    companyStages: string[];
    industries: string[];
    companySizes: string[];
  };
  profile?: {
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    personalWebsite?: string;
  };
  cvData?: {
    cvFilePath?: string;
    cvFileName?: string;
    cvParsedData?: any;
    cvOriginalText?: string;
  };
  skills?: {
    skills: string[];
  };
  experiences?: {
    experiences: any[];
  };
  education?: {
    education: any[];
  };
}

export interface OnboardingStatus {
  status: 'not_started' | 'in_progress' | 'completed';
  completedSteps: string[];
  nextStep?: string;
}

class JobSeekerProfileApiService {
  private baseURL = 'job-seekers';

  // Get current user's job seeker profile
  async getProfile(): Promise<JobSeekerProfile> {
    try {
      const response = await apiClient.get(`${this.baseURL}/profile`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job seeker profile:', error);
      throw error;
    }
  }

  // Complete full onboarding process
  async completeOnboarding(data: OnboardingData): Promise<JobSeekerProfile> {
    try {
      const response = await apiClient.post(`${this.baseURL}/onboarding`, data);
      return response.data;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  // Get onboarding status
  async getOnboardingStatus(): Promise<OnboardingStatus> {
    try {
      const response = await apiClient.get(`${this.baseURL}/onboarding/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      throw error;
    }
  }

  // Update specific onboarding step
  async updateOnboardingStep(step: string, data: any): Promise<JobSeekerProfile> {
    try {
      const response = await apiClient.put(`${this.baseURL}/onboarding/step`, { step, data });
      return response.data;
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      throw error;
    }
  }

  // Get job applications
  async getApplications(): Promise<any[]> {
    try {
      // First, get the job seeker profile to get the candidate ID
      const profile = await this.getProfile();
      if (!profile.candidate?.id) {
        return [];
      }
      
      // Query job applications by candidate ID
      const response = await apiClient.get(`/job-applications?candidateId=${profile.candidate.id}`);
      return response.data?.applications || response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  // Get saved jobs from backend
  async getSavedJobs(): Promise<any[]> {
    try {
      const response = await apiClient.get('/job-seekers/saved-jobs');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      return [];
    }
  }

  // Save a job using backend API
  async saveJob(jobId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post('/job-seekers/saved-jobs', { jobId });
      return {
        success: true,
        message: 'Job saved successfully'
      };
    } catch (error: any) {
      console.error('Error saving job:', error);
      if (error.response?.status === 409) {
        return {
          success: false,
          message: 'Job is already saved'
        };
      }
      throw error;
    }
  }

  // Remove a saved job using backend API
  async removeSavedJob(jobId: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiClient.delete(`/job-seekers/saved-jobs/${jobId}`);
      return {
        success: true,
        message: 'Job removed from saved jobs'
      };
    } catch (error) {
      console.error('Error removing saved job:', error);
      throw error;
    }
  }

  // Apply to a job
  async applyToJob(jobId: string, applicationData?: {
    coverLetter?: string;
    resume?: File;
    additionalDocuments?: File[];
  }): Promise<{ success: boolean; applicationId: string; message: string }> {
    try {
      const formData = new FormData();
      
      // For the job-applications endpoint, we need to send candidateId and jobId
      const profile = await this.getProfile();
      if (!profile.candidate?.id) {
        throw new Error('No candidate profile found');
      }
      
      const requestData: any = {
        candidateId: profile.candidate.id,
        jobId: jobId,
        status: 'Applied'
      };
      
      if (applicationData?.coverLetter) {
        requestData.coverLetter = applicationData.coverLetter;
      }

      const response = await apiClient.post('/job-applications', requestData);
      return {
        success: true,
        applicationId: response.data.id,
        message: 'Application submitted successfully'
      };
    } catch (error) {
      console.error('Error applying to job:', error);
      throw error;
    }
  }

  // Withdraw application from a job
  async withdrawApplication(applicationId: string): Promise<{ success: boolean; message: string }> {
    try {
      await apiClient.delete(`/job-applications/${applicationId}`);
      return {
        success: true,
        message: 'Application withdrawn successfully'
      };
    } catch (error) {
      console.error('Error withdrawing application:', error);
      throw error;
    }
  }

  // Update personal info step
  async updatePersonalInfo(data: { firstName: string; lastName: string; location: string }): Promise<JobSeekerProfile> {
    try {
      const response = await apiClient.put(`${this.baseURL}/onboarding/step`, { 
        step: 'personalInfo', 
        data 
      });
      return response.data;
    } catch (error) {
      console.error('Error updating personal info:', error);
      throw error;
    }
  }

  // Update personal info for completed profiles (doesn't affect onboarding status)
  async updatePersonalInfoForCompletedProfile(data: { firstName?: string; lastName?: string; avatar?: string }): Promise<JobSeekerProfile> {
    try {
      const response = await apiClient.put(`${this.baseURL}/personal-info`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating personal info for completed profile:', error);
      throw error;
    }
  }

  // Update preferences step
  async updatePreferences(data: {
    contractTypes: string[];
    startAvailability: string;
    targetSalary?: number;
    salaryRange?: string;
    salaryFlexible?: boolean;
    workplaceSettings: string[];
  }): Promise<JobSeekerProfile> {
    try {
      const response = await apiClient.put(`${this.baseURL}/onboarding/step`, { 
        step: 'preferences', 
        data 
      });
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Update preferences for completed profiles (doesn't affect onboarding status)
  async updatePreferencesForCompletedProfile(data: {
    contractTypes: string[];
    startAvailability: string;
    targetSalary?: number;
    salaryRange?: string;
    salaryFlexible?: boolean;
    workplaceSettings: string[];
  }): Promise<JobSeekerProfile> {
    try {
      const response = await apiClient.put(`${this.baseURL}/preferences`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating preferences for completed profile:', error);
      throw error;
    }
  }

  // Update companies step
  async updateCompanies(data: {
    preferredCompanies?: string[];
    hiddenCompanies?: string[];
    companyStages?: string[];
    industries?: string[];
    companySizes?: string[];
  }): Promise<JobSeekerProfile> {
    try {
      const response = await apiClient.put(`${this.baseURL}/onboarding/step`, { 
        step: 'companies', 
        data 
      });
      return response.data;
    } catch (error) {
      console.error('Error updating companies:', error);
      throw error;
    }
  }

  // Update companies for completed profiles (doesn't affect onboarding status)
  async updateCompaniesForCompletedProfile(data: {
    preferredCompanies?: string[];
    hiddenCompanies?: string[];
    companyStages?: string[];
    industries?: string[];
    companySizes?: string[];
  }): Promise<JobSeekerProfile> {
    try {
      const response = await apiClient.put(`${this.baseURL}/companies`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating companies for completed profile:', error);
      throw error;
    }
  }

  // Update profile links for completed profiles (doesn't affect onboarding status)
  async updateProfileLinksForCompletedProfile(data: {
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    personalWebsite?: string;
  }): Promise<JobSeekerProfile> {
    try {
      const response = await apiClient.put(`${this.baseURL}/profile-links`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile links for completed profile:', error);
      throw error;
    }
  }

  // Update skills step
  async updateSkills(data: { skills: string[] }): Promise<JobSeekerProfile> {
    try {
      const response = await apiClient.put(`${this.baseURL}/onboarding/step`, { 
        step: 'skills', 
        data 
      });
      return response.data;
    } catch (error) {
      console.error('Error updating skills:', error);
      throw error;
    }
  }

  // Update experience step
  async updateExperience(data: {
    experiences: Array<{
      position: string;
      company: string;
      startDate: string;
      endDate?: string;
      current?: boolean;
      description?: string;
    }>;
  }): Promise<JobSeekerProfile> {
    try {
      const response = await apiClient.put(`${this.baseURL}/onboarding/step`, { 
        step: 'experience', 
        data 
      });
      return response.data;
    } catch (error) {
      console.error('Error updating experience:', error);
      throw error;
    }
  }

  // Update education step
  async updateEducation(data: {
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      graduationYear: string;
    }>;
  }): Promise<JobSeekerProfile> {
    try {
      const response = await apiClient.put(`${this.baseURL}/onboarding/step`, { 
        step: 'education', 
        data 
      });
      return response.data;
    } catch (error) {
      console.error('Error updating education:', error);
      throw error;
    }
  }

  // Update candidate profile information
  async updateCandidateProfile(data: {
    phone?: string;
    currentPosition?: string;
    firstName?: string;
    lastName?: string;
    location?: string;
  }): Promise<JobSeekerProfile> {
    try {
      const response = await apiClient.put(`${this.baseURL}/candidate-profile`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating candidate profile:', error);
      throw error;
    }
  }

  // Comprehensive update method for complete profile data
  async updateComprehensiveProfile(data: {
    personalInfo?: {
      fullName?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      location?: string;
      website?: string;
      linkedIn?: string;
      github?: string;
      summary?: string;
      currentPosition?: string;
      salaryExpectation?: string;
    };
    experience?: Array<any>;
    education?: Array<any>;
    skills?: Array<any>;
    projects?: Array<any>;
    certifications?: Array<any>;
    awards?: Array<any>;
    languages?: Array<any>;
    interests?: Array<any>;
    references?: Array<any>;
    customFields?: Array<any>;
  }): Promise<JobSeekerProfile> {
    try {
      // First get the current profile to find the candidate ID
      const profile = await this.getProfile();
      
      if (!profile.candidateId) {
        throw new Error('No candidate profile found');
      }

      // Helper function to validate and clean URL fields
      const cleanUrl = (url: string | undefined): string | undefined => {
        if (!url || url.trim() === '') return undefined;
        const trimmed = url.trim();
        // Basic URL validation - must start with http:// or https://
        if (!trimmed.match(/^https?:\/\/.+/)) {
          return undefined;
        }
        return trimmed;
      };

      // Helper function to clean date fields
      const cleanDate = (date: string | undefined): string | undefined => {
        if (!date || date.trim() === '') return undefined;
        const trimmed = date.trim();
        // Basic date validation - should be ISO format or at least YYYY-MM-DD
        if (!trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return undefined;
        }
        return trimmed;
      };

      // Helper function to remove id fields from arrays
      const cleanArrayItems = (items: Array<any>): Array<any> => {
        return items.map(item => {
          const { id, ...cleanItem } = item;
          return cleanItem;
        });
      };

      // Prepare the update data in the format expected by the candidates API
      const updateData: any = {};

      // Update personal info
      if (data.personalInfo) {
        updateData.personalInfo = {
          fullName: data.personalInfo.fullName,
          firstName: data.personalInfo.firstName,
          lastName: data.personalInfo.lastName,
          email: data.personalInfo.email,
          phone: data.personalInfo.phone,
          location: data.personalInfo.location,
        };
        
        // Only include URL fields if they are valid URLs
        const website = cleanUrl(data.personalInfo.website);
        const linkedIn = cleanUrl(data.personalInfo.linkedIn);
        const github = cleanUrl(data.personalInfo.github);
        
        if (website) updateData.personalInfo.website = website;
        if (linkedIn) updateData.personalInfo.linkedIn = linkedIn;
        if (github) updateData.personalInfo.github = github;
        
        updateData.summary = data.personalInfo.summary;
        updateData.currentPosition = data.personalInfo.currentPosition;
        updateData.salaryExpectation = data.personalInfo.salaryExpectation;
      }

      // Clean and add experience data (remove IDs)
      if (data.experience) {
        updateData.experience = cleanArrayItems(data.experience);
      }

      // Clean and add education data (remove IDs and clean dates)
      if (data.education) {
        updateData.education = cleanArrayItems(data.education).map(edu => ({
          ...edu,
          graduationDate: cleanDate(edu.graduationDate),
        })).filter(edu => 
          // Only include education entries with required fields
          edu.institution && edu.degree
        );
      }

      // Clean and add skills data
      if (data.skills) {
        updateData.skills = data.skills.map(skill => 
          typeof skill === 'string' ? skill : skill.name
        ).filter(skill => skill && skill.trim() !== '');
      }

      // Clean and add projects data (remove IDs and clean URLs)
      if (data.projects) {
        updateData.projects = cleanArrayItems(data.projects).map(project => ({
          ...project,
          url: cleanUrl(project.url),
          repositoryUrl: cleanUrl(project.repositoryUrl),
          startDate: cleanDate(project.startDate),
          endDate: cleanDate(project.endDate),
        })).filter(project => 
          // Only include projects with required fields
          project.name && project.name.trim() !== ''
        );
      }

      // Add other relation data (clean IDs and URLs)
      if (data.certifications) {
        updateData.certifications = cleanArrayItems(data.certifications).map(cert => ({
          ...cert,
          credentialUrl: cleanUrl(cert.credentialUrl),
          dateIssued: cleanDate(cert.dateIssued),
          expirationDate: cleanDate(cert.expirationDate),
        })).filter(cert => 
          // Only include certifications with required fields
          cert.name && cert.name.trim() !== ''
        );
      }
      
      if (data.awards) updateData.awards = cleanArrayItems(data.awards);
      
      if (data.languages) {
        updateData.languages = cleanArrayItems(data.languages).map(lang => {
          // Valid proficiency levels
          const validProficiencyLevels = ['basic', 'conversational', 'fluent', 'native', 'professional'];
          
          // Helper function to validate proficiency level
          const cleanProficiency = (level: string | undefined): string => {
            if (!level || !validProficiencyLevels.includes(level.toLowerCase())) {
              return 'basic'; // Default to basic if invalid
            }
            return level.toLowerCase();
          };
          
          return {
            ...lang,
            proficiency: cleanProficiency(lang.proficiency),
            speakingLevel: cleanProficiency(lang.speakingLevel),
            writingLevel: cleanProficiency(lang.writingLevel),
            readingLevel: cleanProficiency(lang.readingLevel),
          };
        }).filter(lang => 
          // Only include languages with required fields
          lang.language && lang.language.trim() !== ''
        );
      }
      
      if (data.interests) updateData.interests = cleanArrayItems(data.interests);
      
      if (data.references) {
        updateData.references = cleanArrayItems(data.references).map(ref => {
          // Valid reference types
          const validReferenceTypes = ['professional', 'academic', 'personal', 'manager', 'colleague', 'client', 'mentor'];
          
          // Helper function to validate email
          const cleanEmail = (email: string | undefined): string | undefined => {
            if (!email || email.trim() === '') return undefined;
            const trimmed = email.trim();
            // Basic email validation
            if (!trimmed.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
              return undefined;
            }
            return trimmed;
          };
          
          // Helper function to validate reference type
          const cleanReferenceType = (type: string | undefined): string => {
            if (!type || !validReferenceTypes.includes(type.toLowerCase())) {
              return 'professional'; // Default to professional if invalid
            }
            return type.toLowerCase();
          };
          
          return {
            ...ref,
            email: cleanEmail(ref.email),
            referenceType: cleanReferenceType(ref.referenceType),
          };
        }).filter(ref => 
          // Only include references with required fields and valid email
          ref.name && ref.name.trim() !== '' && ref.email
        );
      }
      
      if (data.customFields) updateData.customFields = cleanArrayItems(data.customFields);

      console.log('Sending update data:', JSON.stringify(updateData, null, 2));

      // Call the candidates API to update the candidate
      const response = await apiClient.patch(`/candidates/${profile.candidateId}`, updateData);
      
      // Return the updated profile
      return this.getProfile();
    } catch (error) {
      console.error('Error updating comprehensive profile:', error);
      throw error;
    }
  }

  async getProfileStrength(): Promise<{
    overallCompleteness: number;
    basicInfoCompleteness: number;
    experienceCompleteness: number;
    educationCompleteness: number;
    skillsCompleteness: number;
    additionalInfoCompleteness: number;
    breakdown: {
      completed: string[];
      missing: string[];
      totalFields: number;
      completedFields: number;
    };
    suggestions: string[];
    strengthLevel: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  }> {
    try {
      const response = await apiClient.get('/job-seekers/profile-strength');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile strength:', error);
      throw error;
    }
  }
}

export const jobSeekerProfileApiService = new JobSeekerProfileApiService();
