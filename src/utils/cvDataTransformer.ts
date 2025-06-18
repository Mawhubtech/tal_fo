/**
 * Utility functions for transforming CV processing data to backend-compatible format
 * Handles null value filtering and data structure mapping
 */

import { CreateCandidateDto } from '../types/candidate.types';

/**
 * Recursively removes null values and 'null' strings from an object
 * @param obj - The object to clean
 * @returns Cleaned object with null values removed
 */
export function removeNullValues(obj: any): any {
  if (obj === null || obj === 'null' || obj === undefined) {
    return undefined;
  }

  if (Array.isArray(obj)) {
    return obj
      .map(item => removeNullValues(item))
      .filter(item => item !== undefined && item !== null && item !== 'null');
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = removeNullValues(value);
      if (cleanedValue !== undefined && cleanedValue !== null && cleanedValue !== 'null') {
        // For arrays, only keep if they have content
        if (Array.isArray(cleanedValue) && cleanedValue.length === 0) {
          continue;
        }
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  return obj;
}

/**
 * Converts human-readable date strings to ISO format
 * @param dateString - The date string to convert
 * @returns ISO date string or undefined if invalid
 */
function parseAndFormatDate(dateString: string): string | undefined {
  if (!dateString || dateString === 'null' || dateString.toLowerCase() === 'present') {
    return undefined;
  }

  // Try to parse the date
  let parsedDate: Date;

  // Handle common CV date formats
  if (dateString.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/i)) {
    // Format: "February 2024" -> assume first day of month
    parsedDate = new Date(dateString + ' 1');
  } else if (dateString.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i)) {
    // Format: "Feb 2024" -> assume first day of month
    parsedDate = new Date(dateString + ' 1');
  } else if (dateString.match(/^\d{4}$/)) {
    // Format: "2024" -> assume January 1st
    parsedDate = new Date(dateString + '-01-01');
  } else if (dateString.match(/^\d{4}\s*-\s*\d{4}$/)) {
    // Format: "2015 - 2017" -> take the first year
    const firstYear = dateString.split(/\s*-\s*/)[0];
    parsedDate = new Date(firstYear + '-01-01');
  } else if (dateString.match(/^\d{1,2}\/\d{4}$/)) {
    // Format: "2/2024" -> assume month/year
    const [month, year] = dateString.split('/');
    parsedDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Format: "2024-02-01" -> already in correct format
    parsedDate = new Date(dateString);
  } else {
    // Try direct parsing
    parsedDate = new Date(dateString);
  }

  // Validate the parsed date
  if (isNaN(parsedDate.getTime())) {
    console.warn(`Could not parse date: "${dateString}"`);
    return undefined;
  }

  // Return in YYYY-MM-DD format
  return parsedDate.toISOString().split('T')[0];
}

/**
 * Safely extracts array data, filtering out null values
 * @param data - The array data to process
 * @returns Cleaned array or undefined
 */
function safeArrayExtract(data: any[]): any[] | undefined {
  if (!Array.isArray(data)) return undefined;
  
  const cleaned = data
    .filter(item => item !== null && item !== 'null' && item !== undefined)
    .map(item => removeNullValues(item))
    .filter(item => item !== undefined);
  
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Transforms CV processing response to CreateCandidateDto format
 * @param structuredData - The structured data from CV processing
 * @param overrideData - Any override data from user input
 * @returns Properly formatted CreateCandidateDto
 */
export function transformCVDataToCandidate(
  structuredData: any,
  overrideData?: any
): CreateCandidateDto {
  const cleanedData = removeNullValues(structuredData);
  const personalInfo = cleanedData?.personalInfo || {};
  
  // Build the base DTO structure
  const candidateDto: CreateCandidateDto = {
    personalInfo: {
      fullName: personalInfo.fullName || 'Unknown',
      firstName: personalInfo.firstName || '',
      middleName: personalInfo.middleName || '',
      lastName: personalInfo.lastName || '',
      email: personalInfo.email || '',
      phone: personalInfo.phone || '',
      location: personalInfo.location || personalInfo.city || '',
      website: personalInfo.website || undefined,
      linkedIn: personalInfo.linkedIn || undefined,
      github: personalInfo.github || undefined,
      avatar: personalInfo.avatar || undefined,
    },
  };

  // Add optional fields
  if (cleanedData?.professionalSummary) {
    candidateDto.summary = cleanedData.professionalSummary;
  }

  if (cleanedData?.additionalInfo?.salaryExpectation) {
    candidateDto.salaryExpectation = cleanedData.additionalInfo.salaryExpectation;
  }
  // Transform work experience
  if (cleanedData?.workExperience && Array.isArray(cleanedData.workExperience)) {
    const experience = safeArrayExtract(
      cleanedData.workExperience.map((exp: any) => ({
        position: exp.position || exp.jobTitle || 'Unknown Position',
        company: exp.company || 'Unknown Company',
        startDate: parseAndFormatDate(exp.startDate) || new Date().toISOString().split('T')[0],
        endDate: exp.endDate === 'Present' || exp.endDate === 'present' ? undefined : parseAndFormatDate(exp.endDate),
        location: exp.location || undefined,
        description: exp.description || undefined,
        responsibilities: safeArrayExtract(exp.responsibilities),
        achievements: safeArrayExtract(exp.achievements),
        technologies: safeArrayExtract(exp.technologies),
      }))
    );
    
    if (experience) {
      candidateDto.experience = experience;
    }
  }
  // Transform education
  if (cleanedData?.education && Array.isArray(cleanedData.education)) {
    const education = safeArrayExtract(
      cleanedData.education.map((edu: any) => ({
        institution: edu.institution || 'Unknown Institution',
        degree: edu.degree || '',
        major: edu.field || edu.major || undefined,
        minor: edu.minor || undefined,
        graduationDate: parseAndFormatDate(edu.graduationDate) || parseAndFormatDate(edu.endDate),
        location: edu.location || undefined,
        gpa: edu.gpa ? parseFloat(edu.gpa) : undefined,
        maxGpa: edu.maxGpa || undefined,
        courses: safeArrayExtract(edu.relevantCoursework),
        honors: safeArrayExtract(edu.honors),
        description: edu.description || undefined,
      }))
    );
    
    if (education) {
      candidateDto.education = education;
    }
  }

  // Transform skills
  const allSkills: string[] = [];
  
  if (cleanedData?.skills) {
    const skills = cleanedData.skills;
    
    // Collect all skills from different categories
    if (skills.technical) allSkills.push(...safeArrayExtract(skills.technical) || []);
    if (skills.programming) allSkills.push(...safeArrayExtract(skills.programming) || []);
    if (skills.frameworks) allSkills.push(...safeArrayExtract(skills.frameworks) || []);
    if (skills.databases) allSkills.push(...safeArrayExtract(skills.databases) || []);
    if (skills.tools) allSkills.push(...safeArrayExtract(skills.tools) || []);
    if (skills.soft) allSkills.push(...safeArrayExtract(skills.soft) || []);
    if (skills.other) allSkills.push(...safeArrayExtract(skills.other) || []);
  }

  if (allSkills.length > 0) {
    candidateDto.skills = [...new Set(allSkills)]; // Remove duplicates
  }
  // Transform certifications
  if (cleanedData?.certifications && Array.isArray(cleanedData.certifications)) {
    const certifications = safeArrayExtract(
      cleanedData.certifications.map((cert: any) => ({
        name: cert.name || 'Unknown Certification',
        issuer: cert.issuer || 'Unknown Issuer',
        dateIssued: parseAndFormatDate(cert.date) || parseAndFormatDate(cert.dateIssued) || new Date().toISOString().split('T')[0],
        expirationDate: parseAndFormatDate(cert.expiryDate) || parseAndFormatDate(cert.expirationDate),
        credentialId: cert.credentialId || undefined,
        credentialUrl: cert.url || cert.credentialUrl || undefined,
        description: cert.description || undefined,
      }))
    );
    
    if (certifications) {
      candidateDto.certifications = certifications;
    }
  }
  // Transform awards
  if (cleanedData?.awards && Array.isArray(cleanedData.awards)) {
    const awards = safeArrayExtract(
      cleanedData.awards.map((award: any) => ({
        name: award.name || 'Unknown Award',
        issuer: award.issuer || 'Unknown Issuer',
        date: parseAndFormatDate(award.date) || new Date().toISOString().split('T')[0],
        description: award.description || undefined,
      }))
    );
    
    if (awards) {
      candidateDto.awards = awards;
    }
  }

  // Transform projects
  if (cleanedData?.projects && Array.isArray(cleanedData.projects)) {
    const projects = safeArrayExtract(
      cleanedData.projects.map((project: any) => ({
        name: project.name || project.title || 'Unknown Project',
        description: project.description || '',
        technologies: safeArrayExtract(project.technologies),
        url: project.url || project.demo || undefined,
        repositoryUrl: project.github || undefined,
        startDate: parseAndFormatDate(project.startDate),
        endDate: parseAndFormatDate(project.endDate),
        role: project.role || undefined,
        teamSize: project.teamSize || undefined,
        achievements: safeArrayExtract(project.achievements),
      }))
    );
    
    if (projects) {
      candidateDto.projects = projects;
    }
  }

  // Transform languages
  if (cleanedData?.skills?.languages && Array.isArray(cleanedData.skills.languages)) {
    const languages = safeArrayExtract(
      cleanedData.skills.languages.map((lang: any) => ({
        language: lang.language || lang.name || 'Unknown Language',
        proficiency: lang.proficiency || lang.level || 'intermediate',
      }))
    );
    
    if (languages) {
      candidateDto.languages = languages;
    }
  }

  // Transform interests
  if (cleanedData?.interests && Array.isArray(cleanedData.interests)) {
    const interests = safeArrayExtract(
      cleanedData.interests.map((interest: any) => ({
        name: typeof interest === 'string' ? interest : interest.name || 'Unknown Interest',
        description: typeof interest === 'object' ? interest.description : undefined,
      }))
    );
    
    if (interests) {
      candidateDto.interests = interests;
    }
  }

  // Transform references
  if (cleanedData?.references && Array.isArray(cleanedData.references)) {
    const references = safeArrayExtract(
      cleanedData.references.map((ref: any) => ({
        name: ref.name || 'Unknown Reference',
        title: ref.title || undefined,
        company: ref.company || undefined,
        email: ref.email || undefined,
        phone: ref.phone || undefined,
        relationship: ref.relationship || undefined,
      }))
    );
    
    if (references) {
      candidateDto.references = references;
    }
  }

  // Apply override data if provided
  if (overrideData) {
    const cleanedOverrideData = removeNullValues(overrideData);
    
    // Deep merge override data
    if (cleanedOverrideData?.personalInfo) {
      candidateDto.personalInfo = {
        ...candidateDto.personalInfo,
        ...cleanedOverrideData.personalInfo,
      };
    }

    // Apply other override fields
    Object.keys(cleanedOverrideData).forEach(key => {
      if (key !== 'personalInfo' && cleanedOverrideData[key] !== undefined) {
        (candidateDto as any)[key] = cleanedOverrideData[key];
      }
    });
  }

  return candidateDto;
}

/**
 * Checks if the CV processing response contains sufficient data for candidate creation
 * @param structuredData - The structured data from CV processing
 * @returns boolean indicating if data is sufficient
 */
export function isDataSufficient(structuredData: any): boolean {
  const cleanedData = removeNullValues(structuredData);
  const personalInfo = cleanedData?.personalInfo;
  
  // At minimum, we need either a full name or first/last name, and an email
  const hasName = personalInfo?.fullName || (personalInfo?.firstName && personalInfo?.lastName);
  const hasEmail = personalInfo?.email;
  
  return !!(hasName && hasEmail);
}

/**
 * Gets a summary of missing critical data
 * @param structuredData - The structured data from CV processing
 * @returns Array of missing critical fields
 */
export function getMissingCriticalData(structuredData: any): string[] {
  const cleanedData = removeNullValues(structuredData);
  const personalInfo = cleanedData?.personalInfo;
  const missing: string[] = [];
  
  if (!personalInfo?.fullName && !(personalInfo?.firstName && personalInfo?.lastName)) {
    missing.push('Full Name');
  }
  
  if (!personalInfo?.email) {
    missing.push('Email');
  }
  
  return missing;
}
