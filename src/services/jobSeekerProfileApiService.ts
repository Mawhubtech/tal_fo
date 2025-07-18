import apiClient from '../lib/api';

export interface JobSeekerProfile {
  id: string;
  userId: string;
  candidateId?: string;
  onboardingStatus: 'not_started' | 'in_progress' | 'completed';
  onboardingCompletedAt?: string;
  contractTypes: string[];
  startAvailability: string;
  salaryMin?: number;
  salaryMax?: number;
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
      const response = await apiClient.get(`${this.baseURL}/applications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }

  // Get saved jobs
  async getSavedJobs(): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseURL}/saved-jobs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
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

  // Update preferences step
  async updatePreferences(data: {
    contractTypes: string[];
    startAvailability: string;
    targetSalary?: number;
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

  // Update companies step
  async updateCompanies(data: {
    preferredCompanies?: string[];
    hiddenCompanies?: string[];
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
}

export const jobSeekerProfileApiService = new JobSeekerProfileApiService();
