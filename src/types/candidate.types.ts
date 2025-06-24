/**
 * Type definitions for candidate-related operations
 * Based on backend DTOs and entities
 */

export interface CreatePersonalInfoDto {
  fullName: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedIn?: string;
  github?: string;
  avatar?: string;
}

export interface CreateExperienceDto {
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
  sortOrder?: number;
}

export interface CreateEducationDto {
  degree: string;
  institution: string;
  major?: string;
  minor?: string;
  graduationDate?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  gpa?: number;
  maxGpa?: string;
  courses?: string[];
  honors?: string[];
  description?: string;
  sortOrder?: number;
}

export interface CreateCertificationDto {
  name: string;
  issuer: string;
  dateIssued: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateAwardDto {
  name: string;
  issuer: string;
  date: string;
  description?: string;
  category?: string;
  recognitionLevel?: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
  repositoryUrl?: string;
  startDate?: string;
  endDate?: string;
  role?: string;
  teamSize?: string;
  achievements?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateCandidateLanguageDto {
  language: string;
  proficiency: string;
  level?: string;
}

export interface CreateCandidateInterestDto {
  name: string;
  description?: string;
}

export interface CreateCandidateReferenceDto {
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

export interface CreateCandidateCustomFieldDto {
  fieldName: string;
  fieldValue: string;
  fieldType?: string;
}

export enum DocumentType {
  RESUME = 'resume',
  CV = 'cv',
  COVER_LETTER = 'cover_letter',
  PORTFOLIO = 'portfolio',
  CERTIFICATE = 'certificate',
  OTHER = 'other',
}

export interface CreateCandidateDocumentDto {
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  extractedText?: string;
  metadata?: Record<string, any>;
  isPrimary?: boolean;
}

export interface CandidateFileUpload {
  file: File;
  documentType: DocumentType;
  isPrimary?: boolean;
}

export interface CandidateExistingDocument {
  id?: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  isPrimary?: boolean;
  isExisting?: true; // Flag to identify existing documents
}

export type CandidateDocument = CandidateFileUpload | CandidateExistingDocument;

export enum CandidateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  HIRED = 'hired',
  INTERVIEWING = 'interviewing',
  REJECTED = 'rejected',
}

export enum CandidateSource {
  LINKEDIN = 'linkedin',
  INDEED = 'indeed',
  REFERRAL = 'referral',
  DIRECT_APPLICATION = 'direct_application',
  RECRUITMENT_AGENCY = 'recruitment_agency',
  OTHER = 'other',
}

export interface CreateCandidateDto {
  personalInfo: CreatePersonalInfoDto;
  summary?: string;
  currentPosition?: string;
  salaryExpectation?: string;
  status?: CandidateStatus;
  rating?: number;
  appliedDate?: string;
  source?: CandidateSource;
  notes?: string;
  experience?: CreateExperienceDto[];
  education?: CreateEducationDto[];
  certifications?: CreateCertificationDto[];
  awards?: CreateAwardDto[];
  projects?: CreateProjectDto[];
  skills?: string[];
  languages?: CreateCandidateLanguageDto[];
  interests?: CreateCandidateInterestDto[];
  references?: CreateCandidateReferenceDto[];
  customFields?: CreateCandidateCustomFieldDto[];
  documents?: CandidateDocument[];
}

// CV Processing Response Types
export interface CVProcessingResponse {
  message: string;
  metadata: {
    filename: string;
    size: number;
    type: string;
    wordCount: number;
  };
  structuredData: {
    personalInfo: {
      fullName?: string;
      firstName?: string;
      lastName?: string;
      middleName?: string;
      email?: string;
      phone?: string;
      location?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      linkedIn?: string;
      website?: string;
      github?: string;
      portfolio?: string;
      twitter?: string;
      nationality?: string;
      visa?: string;
      availability?: string;
    };
    professionalSummary?: string;
    objective?: string;
    workExperience?: Array<{
      company?: string;
      position?: string;
      jobTitle?: string;
      startDate?: string;
      endDate?: string;
      location?: string;
      duration?: string;
      responsibilities?: string[];
      achievements?: string[];
      description?: string;
      employmentType?: string;
      salary?: string;
      supervisor?: string;
      teamSize?: string;
      technologies?: string[];
    }>;
    education?: Array<{
      institution?: string;
      degree?: string;
      field?: string;
      major?: string;
      minor?: string;
      graduationDate?: string;
      startDate?: string;
      endDate?: string;
      gpa?: string;
      honors?: string[];
      location?: string;
      relevantCoursework?: string[];
      thesis?: string;
      advisor?: string;
    }>;
    skills?: {
      technical?: string[];
      programming?: string[];
      frameworks?: string[];
      databases?: string[];
      tools?: string[];
      soft?: string[];
      languages?: Array<{
        language?: string;
        proficiency?: string;
        level?: string;
      }>;
      other?: string[];
    };
    projects?: Array<{
      name?: string;
      title?: string;
      description?: string;
      technologies?: string[];
      url?: string;
      github?: string;
      demo?: string;
      startDate?: string;
      endDate?: string;
      duration?: string;
      role?: string;
      teamSize?: string;
      achievements?: string[];
    }>;
    certifications?: Array<{
      name?: string;
      issuer?: string;
      date?: string;
      expiryDate?: string;
      credentialId?: string;
      url?: string;
      score?: string;
    }>;
    awards?: Array<{
      name?: string;
      issuer?: string;
      date?: string;
      description?: string;
      level?: string;
    }>;
    publications?: Array<{
      title?: string;
      authors?: string;
      publication?: string;
      date?: string;
      url?: string;
      doi?: string;
      abstract?: string;
    }>;
    conferences?: Array<{
      name?: string;
      date?: string;
      location?: string;
      role?: string;
      presentation?: string;
    }>;
    volunteerExperience?: Array<{
      organization?: string;
      role?: string;
      startDate?: string;
      endDate?: string;
      duration?: string;
      description?: string;
      location?: string;
      achievements?: string[];
    }>;
    interests?: string[];
    hobbies?: string[];
    references?: Array<{
      name?: string;
      title?: string;
      company?: string;
      email?: string;
      phone?: string;
      relationship?: string;
    }>;
    additionalInfo?: {
      salaryExpectation?: string;
      noticePeriod?: string;
      currentSalary?: string;
      expectedSalary?: string;
      workAuthorization?: string;
      relocation?: string;
      remoteWork?: string;
      travelWillingness?: string;
    };
    customSections?: Array<{
      title?: string;
      content?: string;
    }>;
  };
}
