import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  jobSeekerProfileApiService, 
  JobSeekerProfile, 
  OnboardingData, 
  OnboardingStatus 
} from '../services/jobSeekerProfileApiService';

// Query keys for caching
export const jobSeekerProfileKeys = {
  all: ['jobSeekerProfile'] as const,
  profile: () => [...jobSeekerProfileKeys.all, 'profile'] as const,
  onboardingStatus: () => [...jobSeekerProfileKeys.all, 'onboardingStatus'] as const,
  applications: () => [...jobSeekerProfileKeys.all, 'applications'] as const,
  savedJobs: () => [...jobSeekerProfileKeys.all, 'savedJobs'] as const,
};

// Get job seeker profile
export const useJobSeekerProfile = () => {
  return useQuery({
    queryKey: jobSeekerProfileKeys.profile(),
    queryFn: () => jobSeekerProfileApiService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Get onboarding status
export const useOnboardingStatus = () => {
  return useQuery({
    queryKey: jobSeekerProfileKeys.onboardingStatus(),
    queryFn: () => jobSeekerProfileApiService.getOnboardingStatus(),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1,
  });
};

// Complete onboarding mutation
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OnboardingData) => jobSeekerProfileApiService.completeOnboarding(data),
    onSuccess: () => {
      // Invalidate and refetch profile and status
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.profile() });
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.onboardingStatus() });
    },
    onError: (error) => {
      console.error('Error completing onboarding:', error);
    },
  });
};

// Update onboarding step mutation
export const useUpdateOnboardingStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ step, data }: { step: string; data: any }) => 
      jobSeekerProfileApiService.updateOnboardingStep(step, data),
    onSuccess: () => {
      // Invalidate and refetch profile and status
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.profile() });
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.onboardingStatus() });
    },
    onError: (error) => {
      console.error('Error updating onboarding step:', error);
    },
  });
};

// Get job applications
export const useJobApplications = () => {
  return useQuery({
    queryKey: jobSeekerProfileKeys.applications(),
    queryFn: () => jobSeekerProfileApiService.getApplications(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

// Get saved jobs
export const useSavedJobs = () => {
  return useQuery({
    queryKey: jobSeekerProfileKeys.savedJobs(),
    queryFn: () => jobSeekerProfileApiService.getSavedJobs(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

// Individual step update mutations
export const useUpdatePersonalInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { firstName: string; lastName: string; location: string }) => 
      jobSeekerProfileApiService.updatePersonalInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.profile() });
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.onboardingStatus() });
    },
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      contractTypes: string[];
      startAvailability: string;
      targetSalary?: number;
      workplaceSettings: string[];
    }) => jobSeekerProfileApiService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.profile() });
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.onboardingStatus() });
    },
  });
};

export const useUpdateCompanies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      preferredCompanies?: string[];
      hiddenCompanies?: string[];
    }) => jobSeekerProfileApiService.updateCompanies(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.profile() });
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.onboardingStatus() });
    },
  });
};

export const useUpdateSkills = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { skills: string[] }) => 
      jobSeekerProfileApiService.updateSkills(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.profile() });
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.onboardingStatus() });
    },
  });
};

export const useUpdateExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      experiences: Array<{
        position: string;
        company: string;
        startDate: string;
        endDate?: string;
        current?: boolean;
        description?: string;
      }>;
    }) => jobSeekerProfileApiService.updateExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.profile() });
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.onboardingStatus() });
    },
  });
};

export const useUpdateEducation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      education: Array<{
        institution: string;
        degree: string;
        field: string;
        graduationYear: string;
      }>;
    }) => jobSeekerProfileApiService.updateEducation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.profile() });
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.onboardingStatus() });
    },
  });
};

// Comprehensive profile update hook for edit modal
export const useUpdateJobSeekerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      personalInfo?: {
        firstName: string;
        lastName: string;
        phone: string;
        location: string;
        currentPosition: string;
      };
      jobPreferences?: {
        contractTypes: string[];
        startAvailability: string;
        targetSalary: string;
        workplaceSettings: string[];
        preferredCompanies: string[];
        hiddenCompanies: string[];
      };
      experiences?: Array<{
        id?: string;
        position: string;
        company: string;
        startDate: string;
        endDate?: string;
        location?: string;
        description?: string;
      }>;
      skills?: Array<{
        id?: string;
        name: string;
        level: string;
      }>;
    }) => {
      const promises = [];

      // Update personal info if provided
      if (data.personalInfo) {
        promises.push(
          jobSeekerProfileApiService.updatePersonalInfo({
            firstName: data.personalInfo.firstName,
            lastName: data.personalInfo.lastName,
            location: data.personalInfo.location
          })
        );

        // Also update candidate-specific fields
        promises.push(
          jobSeekerProfileApiService.updateCandidateProfile({
            phone: data.personalInfo.phone,
            currentPosition: data.personalInfo.currentPosition,
            firstName: data.personalInfo.firstName,
            lastName: data.personalInfo.lastName,
            location: data.personalInfo.location
          })
        );
      }

      // Update job preferences if provided
      if (data.jobPreferences) {
        promises.push(
          jobSeekerProfileApiService.updatePreferences({
            contractTypes: data.jobPreferences.contractTypes,
            startAvailability: data.jobPreferences.startAvailability,
            targetSalary: data.jobPreferences.targetSalary ? Number(data.jobPreferences.targetSalary) : undefined,
            workplaceSettings: data.jobPreferences.workplaceSettings
          })
        );

        promises.push(
          jobSeekerProfileApiService.updateCompanies({
            preferredCompanies: data.jobPreferences.preferredCompanies,
            hiddenCompanies: data.jobPreferences.hiddenCompanies
          })
        );
      }

      // Update skills if provided
      if (data.skills) {
        promises.push(
          jobSeekerProfileApiService.updateSkills({
            skills: data.skills.map(skill => skill.name)
          })
        );
      }

      // Update experience if provided
      if (data.experiences) {
        promises.push(
          jobSeekerProfileApiService.updateExperience({
            experiences: data.experiences.map(exp => ({
              position: exp.position,
              company: exp.company,
              startDate: exp.startDate,
              endDate: exp.endDate,
              current: !exp.endDate,
              description: exp.description
            }))
          })
        );
      }

      // Execute all updates
      await Promise.all(promises);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.profile() });
      queryClient.invalidateQueries({ queryKey: jobSeekerProfileKeys.onboardingStatus() });
    },
  });
};