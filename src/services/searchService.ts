import { aiService } from './aiService';

// Import user data files
import user1Data from '../Data/user1.json';
import user2Data from '../Data/user2.json';
import user3Data from '../Data/user3.json';
import user4Data from '../Data/user4.json';
import user5Data from '../Data/user5.json';
import user6Data from '../Data/user6.json';
import user7Data from '../Data/user7.json';
import user8Data from '../Data/user8.json';
import user9Data from '../Data/user9.json';
import user10Data from '../Data/user10.json';

// Types
export interface ExtractedKeywords {
  jobTitles: string[];
  skills: string[];
  locations: string[];
  companies: string[];
  experienceLevel: string;
  workType: string;
  industries: string[];
  keywords: string[];
  requirements: string[];
}

export interface SearchFilters {
  general?: {
    minExperience?: string;
    maxExperience?: string;
    requiredContactInfo?: string;
  };
  location?: {
    currentLocations?: string[];
    pastLocations?: string[];
    radius?: string;
    timezone?: boolean;
  };
  job?: {
    titles?: string[];
    skills?: string[];
  };
  company?: {
    names?: string[];
    industries?: string[];
    size?: string;
  };
  skillsKeywords?: {
    items?: string[];
    requirements?: string[]; // Added requirements
  };
  power?: {
    isOpenToRemote?: boolean;
    hasEmail?: boolean;
    hasPhone?: boolean;
  };
  likelyToSwitch?: {
    likelihood?: string;
    recentActivity?: string;
  };
  education?: {
    schools?: string[];
    degrees?: string[];
    majors?: string[];
  };
  languages?: {
    items?: string[];
  };
  boolean?: {
    fullName?: string;
    booleanString?: string;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  user: any;
  matchedCriteria: string[];
}

class SearchService {
  private userData: any[] = [
    { id: 'user1', ...user1Data },
    { id: 'user2', ...user2Data },
    { id: 'user3', ...user3Data },
    { id: 'user4', ...user4Data },
    { id: 'user5', ...user5Data },
    { id: 'user6', ...user6Data },
    { id: 'user7', ...user7Data },
    { id: 'user8', ...user8Data },
    { id: 'user9', ...user9Data },
    { id: 'user10', ...user10Data },
  ];

  /**
   * Extract keywords from search text using AI
   */
  async extractKeywords(searchText: string): Promise<ExtractedKeywords> {
    try {
      const schema = {
        type: 'object',
        properties: {
          jobTitles: {
            type: 'array',
            items: { type: 'string' },
            description: 'Job titles, roles, or positions mentioned'
          },
          skills: {
            type: 'array',
            items: { type: 'string' },
            description: 'Technical skills, programming languages, tools, or technologies'
          },
          locations: {
            type: 'array',
            items: { type: 'string' },
            description: 'Geographic locations, cities, states, or countries'
          },
          companies: {
            type: 'array',
            items: { type: 'string' },
            description: 'Company names or organizations mentioned'
          },
          experienceLevel: {
            type: 'string',
            description: 'Experience level (entry, junior, mid, senior, lead, principal, etc.)'
          },
          workType: {
            type: 'string',
            description: 'Work arrangement (remote, on-site, hybrid, contract, full-time, part-time)'
          },
          industries: {
            type: 'array',
            items: { type: 'string' },
            description: 'Industries or business sectors'
          },
          keywords: {
            type: 'array',
            items: { type: 'string' },
            description: 'Other relevant keywords or terms for searching'
          },
          requirements: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific requirements or qualifications mentioned'
          }
        },
        required: ['jobTitles', 'skills', 'locations', 'companies', 'keywords']
      };

      const prompt = `Analyze the following search query and extract relevant search criteria for finding candidates:

"${searchText}"

Extract job titles, skills, locations, companies, experience level, work type, industries, and any other relevant keywords that would help find matching candidates. Be comprehensive and include variations or synonyms.`;

      const systemPrompt = `You are a recruitment search specialist. Extract comprehensive search criteria from user queries to help find the best matching candidates. Focus on identifying:
- Job titles and roles (including variations and synonyms)
- Technical skills and technologies
- Geographic locations and preferences
- Company names and types
- Experience levels and seniority
- Work arrangements and preferences
- Industry domains
- Any other relevant search keywords

Respond only with valid JSON matching the provided schema.`;      const response = await aiService.structuredQuery({
        prompt,
        schema,
        systemPrompt,
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'
      });

      return response.data as ExtractedKeywords;
    } catch (error) {
      console.error('Error extracting keywords:', error);
      // Return default structure if AI fails
      return {
        jobTitles: [],
        skills: [],
        locations: [],
        companies: [],
        experienceLevel: '',
        workType: '',
        industries: [],
        keywords: [],
        requirements: []
      };
    }
  }

  /**
   * Convert extracted keywords to filter format
   */  convertKeywordsToFilters(keywords: ExtractedKeywords): SearchFilters {
    // Handle null or undefined keywords
    if (!keywords) {
      console.warn('Keywords object is null or undefined');
      return {};
    }
    
    const filters: SearchFilters = {};// Job filters
    if ((keywords?.jobTitles?.length > 0) || (keywords?.skills?.length > 0)) {
      filters.job = {
        titles: keywords?.jobTitles || [],
        skills: keywords?.skills || []
      };
    }    // Location filters
    if (keywords?.locations?.length > 0) {
      filters.location = {
        currentLocations: keywords.locations
      };
    }    // Company filters
    if ((keywords?.companies?.length > 0) || (keywords?.industries?.length > 0)) {
      filters.company = {
        names: keywords?.companies || [],
        industries: keywords?.industries || []
      };
    }// Skills and keywords
    if ((keywords?.keywords?.length > 0) || (keywords?.requirements?.length > 0)) {
      filters.skillsKeywords = {};
      if (keywords?.keywords?.length > 0) {
        filters.skillsKeywords.items = keywords.keywords;
      }
      if (keywords?.requirements?.length > 0) {
        filters.skillsKeywords.requirements = keywords.requirements;
      }
    }    // Experience level mapping
    if (keywords?.experienceLevel) {
      const expLevel = keywords.experienceLevel.toLowerCase();
      if (expLevel.includes('entry') || expLevel.includes('junior')) {
        filters.general = { minExperience: '0', maxExperience: '2' };
      } else if (expLevel.includes('mid') || expLevel.includes('intermediate')) {
        filters.general = { minExperience: '2', maxExperience: '5' };
      } else if (expLevel.includes('senior')) {
        filters.general = { minExperience: '5', maxExperience: '10' };
      } else if (expLevel.includes('lead') || expLevel.includes('principal') || expLevel.includes('staff')) {
        filters.general = { minExperience: '8' };
      }
    }    // Work type preferences
    if (keywords?.workType) {
      const workType = keywords.workType.toLowerCase();
      if (workType.includes('remote')) {
        filters.power = { isOpenToRemote: true };
      }
    }

    return filters;
  }

  /**
   * Search users based on filters
   */
  async searchUsers(filters: SearchFilters, searchText?: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];    for (const user of this.userData) {
      const score = this.calculateMatchScore(user, filters, searchText);
      const matchedCriteria = this.getMatchedCriteria(user, filters);
      
      if (score > 0.1) { // Only include users with at least 10% match
        results.push({
          id: user.id,
          score,
          user,
          matchedCriteria
        });
      }
    }

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);

    return results;
  }

  /**
   * Calculate match score for a user based on filters
   */
  private calculateMatchScore(user: any, filters: SearchFilters, searchText?: string): number {
    let totalWeight = 0;
    let matchedWeight = 0;

    const userData = user.structuredData;
    // Job title matching
    if (filters.job?.titles && filters.job.titles.length > 0) {
      totalWeight += 3; // High importance
      const userTitles = userData.experience?.map((exp: any) => exp.position.toLowerCase()) || [];
      const hasMatch = filters.job.titles.some(title => 
        userTitles.some((userTitle: string) => 
          userTitle.includes(title.toLowerCase()) || title.toLowerCase().includes(userTitle)
        )
      );
      if (hasMatch) matchedWeight += 3;
    }

    // Skills matching
    if (filters.job?.skills && filters.job.skills.length > 0) {
      totalWeight += 3; // High importance
      const userSkills = (userData.skills || []).map((skill: string) => skill.toLowerCase());
      const userTechSkills = userData.experience?.flatMap((exp: any) => exp.technologies || []).map((tech: string) => tech.toLowerCase()) || [];
      const allUserSkills = [...userSkills, ...userTechSkills];
      
      const matchedSkillsCount = filters.job.skills.filter(skill =>
        allUserSkills.some(userSkill => 
          userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill)
        )
      ).length;
      
      if (matchedSkillsCount > 0) {
        matchedWeight += Math.min(3, (matchedSkillsCount / filters.job.skills.length) * 3);
      }
    }

    // Location matching
    if (filters.location?.currentLocations && filters.location.currentLocations.length > 0) {
      totalWeight += 2; // Medium importance
      const userLocation = userData.personalInfo?.location?.toLowerCase() || '';
      const hasLocationMatch = filters.location.currentLocations.some(location =>
        userLocation.includes(location.toLowerCase()) || location.toLowerCase().includes(userLocation)
      );
      if (hasLocationMatch) matchedWeight += 2;
    }    // Company matching
    if (filters.company?.names && filters.company.names.length > 0) {
      totalWeight += 2; // Medium importance
      const userCompanies = userData.experience?.map((exp: any) => exp.company.toLowerCase()) || [];
      const hasCompanyMatch = filters.company.names.some(company =>
        userCompanies.some((userCompany: string) =>
          userCompany.includes(company.toLowerCase()) || company.toLowerCase().includes(userCompany)
        )
      );
      if (hasCompanyMatch) matchedWeight += 2;
    }

    // Experience level matching
    if (filters.general?.minExperience || filters.general?.maxExperience) {
      totalWeight += 2;
      const userExperience = this.calculateUserExperience(userData.experience);
      const minExp = parseInt(filters.general.minExperience || '0');
      const maxExp = parseInt(filters.general.maxExperience || '999');
      
      if (userExperience >= minExp && userExperience <= maxExp) {
        matchedWeight += 2;
      } else if (Math.abs(userExperience - minExp) <= 1 || Math.abs(userExperience - maxExp) <= 1) {
        matchedWeight += 1; // Partial match for close experience
      }
    }

    // Keywords matching
    if (filters.skillsKeywords?.items && filters.skillsKeywords.items.length > 0) {
      totalWeight += 1; // Lower importance
      const userText = this.getUserSearchableText(userData).toLowerCase();
      const matchedKeywords = filters.skillsKeywords.items.filter(keyword =>
        userText.includes(keyword.toLowerCase())
      ).length;
      
      if (matchedKeywords > 0) {
        matchedWeight += Math.min(1, (matchedKeywords / filters.skillsKeywords.items.length) * 1);
      }
    }

    // Requirements matching
    if (filters.skillsKeywords?.requirements && filters.skillsKeywords.requirements.length > 0) {
      totalWeight += 1.5; // Medium-low importance for requirements
      const userText = this.getUserSearchableText(userData).toLowerCase();
      const matchedRequirements = filters.skillsKeywords.requirements.filter(requirement =>
        userText.includes(requirement.toLowerCase())
      ).length;

      if (matchedRequirements > 0) {
        matchedWeight += Math.min(1.5, (matchedRequirements / filters.skillsKeywords.requirements.length) * 1.5);
      }
    }

    // Text search matching
    if (searchText && searchText.trim()) {
      totalWeight += 2;
      const userText = this.getUserSearchableText(userData).toLowerCase();
      const searchTerms = searchText.toLowerCase().split(/\s+/);
      const matchedTerms = searchTerms.filter(term => userText.includes(term)).length;
      
      if (matchedTerms > 0) {
        matchedWeight += Math.min(2, (matchedTerms / searchTerms.length) * 2);
      }
    }

    // Education matching
    if (filters.education?.schools || filters.education?.degrees || filters.education?.majors) {
      totalWeight += 1;
      let hasEducationMatch = false;
      
      if (userData.education) {
        const userEducation = userData.education[0] || {};
        
        if (filters.education.schools && filters.education.schools.some(school =>
          userEducation.institution?.toLowerCase().includes(school.toLowerCase())
        )) {
          hasEducationMatch = true;
        }
        
        if (filters.education.degrees && filters.education.degrees.some(degree =>
          userEducation.degree?.toLowerCase().includes(degree.toLowerCase())
        )) {
          hasEducationMatch = true;
        }
        
        if (filters.education.majors && filters.education.majors.some(major =>
          userEducation.major?.toLowerCase().includes(major.toLowerCase())
        )) {
          hasEducationMatch = true;
        }
      }
      
      if (hasEducationMatch) matchedWeight += 1;
    }

    // Contact info requirements
    if (filters.general?.requiredContactInfo) {
      totalWeight += 0.5;
      const contactInfo = userData.personalInfo;
      let hasRequiredContact = false;
      
      switch (filters.general.requiredContactInfo) {
        case 'email':
          hasRequiredContact = !!contactInfo?.email;
          break;
        case 'phone':
          hasRequiredContact = !!contactInfo?.phone;
          break;
        case 'linkedin':
          hasRequiredContact = !!contactInfo?.linkedIn;
          break;
        case 'all':
          hasRequiredContact = !!(contactInfo?.email && contactInfo?.phone && contactInfo?.linkedIn);
          break;
        default:
          hasRequiredContact = true;
      }
      
      if (hasRequiredContact) matchedWeight += 0.5;
    }

    // Return score as a percentage
    return totalWeight > 0 ? matchedWeight / totalWeight : 0;
  }
  /**
   * Get matched criteria for display
   */
  private getMatchedCriteria(user: any, filters: SearchFilters): string[] {
    const criteria: string[] = [];
    const userData = user.structuredData;
    // Job titles
    if (filters.job?.titles && filters.job.titles.length > 0) {
      const userTitles = userData.experience?.map((exp: any) => exp.position.toLowerCase()) || [];
      const matchedTitles = filters.job.titles.filter(title =>
        userTitles.some((userTitle: string) =>
          userTitle.includes(title.toLowerCase()) || title.toLowerCase().includes(userTitle)
        )
      );
      matchedTitles.forEach(title => criteria.push(`Job Title: ${title}`));
    }

    // Skills
    if (filters.job?.skills && filters.job.skills.length > 0) {
      const userSkills = (userData.skills || []).map((skill: string) => skill.toLowerCase());
      const userTechSkills = userData.experience?.flatMap((exp: any) => exp.technologies || []).map((tech: string) => tech.toLowerCase()) || [];
      const allUserSkills = [...userSkills, ...userTechSkills];
      
      const matchedSkills = filters.job.skills.filter(skill =>
        allUserSkills.some(userSkill =>
          userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill)
        )
      );
      matchedSkills.forEach(skill => criteria.push(`Skill: ${skill}`));
    }

    // Location
    if (filters.location?.currentLocations && filters.location.currentLocations.length > 0) {
      const userLocation = userData.personalInfo?.location?.toLowerCase() || '';
      const matchedLocations = filters.location.currentLocations.filter(location =>
        userLocation.includes(location.toLowerCase()) || location.toLowerCase().includes(userLocation)
      );
      matchedLocations.forEach(location => criteria.push(`Location: ${location}`));
    }

    // Requirements
    if (filters.skillsKeywords?.requirements && filters.skillsKeywords.requirements.length > 0) {
      const userText = this.getUserSearchableText(userData).toLowerCase();
      const matchedRequirements = filters.skillsKeywords.requirements.filter(requirement =>
        userText.includes(requirement.toLowerCase())
      );
      matchedRequirements.forEach(requirement => criteria.push(`Requirement: ${requirement}`));
    }

    // Companies
    if (filters.company?.names && filters.company.names.length > 0) {
      const userCompanies = userData.experience?.map((exp: any) => exp.company.toLowerCase()) || [];
      const matchedCompanies = filters.company.names.filter(company =>
        userCompanies.some((userCompany: string) =>
          userCompany.includes(company.toLowerCase()) || company.toLowerCase().includes(userCompany)
        )
      );
      matchedCompanies.forEach(company => criteria.push(`Company: ${company}`));
    }

    // Experience level
    if (filters.general?.minExperience || filters.general?.maxExperience) {
      const userExperience = this.calculateUserExperience(userData.experience);
      const minExp = parseInt(filters.general.minExperience || '0');
      const maxExp = parseInt(filters.general.maxExperience || '999');
      
      if (userExperience >= minExp && userExperience <= maxExp) {
        criteria.push(`Experience: ${userExperience} years`);
      }
    }

    return criteria;
  }

  /**
   * Calculate user's total experience in years
   */
  private calculateUserExperience(experience: any[]): number {
    if (!experience || experience.length === 0) return 0;
    
    const totalMonths = experience.reduce((total, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.endDate === 'Present' ? new Date() : new Date(exp.endDate);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      return total + Math.max(0, months);
    }, 0);
    
    return Math.floor(totalMonths / 12);
  }

  /**
   * Get all searchable text from user data
   */
  private getUserSearchableText(userData: any): string {
    const texts: string[] = [];
    
    // Personal info
    if (userData.personalInfo) {
      texts.push(userData.personalInfo.fullName || '');
      texts.push(userData.personalInfo.location || '');
    }
    
    // Summary
    if (userData.summary) {
      texts.push(userData.summary);
    }
    
    // Experience
    if (userData.experience) {
      userData.experience.forEach((exp: any) => {
        texts.push(exp.position || '');
        texts.push(exp.company || '');
        texts.push(exp.description || '');
        if (exp.responsibilities) {
          texts.push(...exp.responsibilities);
        }
        if (exp.achievements) {
          texts.push(...exp.achievements);
        }
        if (exp.technologies) {
          texts.push(...exp.technologies);
        }
      });
    }
    
    // Skills
    if (userData.skills) {
      texts.push(...userData.skills);
    }
    
    // Education
    if (userData.education) {
      userData.education.forEach((edu: any) => {
        texts.push(edu.degree || '');
        texts.push(edu.institution || '');
        texts.push(edu.major || '');
        if (edu.courses) {
          texts.push(...edu.courses);
        }
      });
    }
    
    // Projects
    if (userData.projects) {
      userData.projects.forEach((project: any) => {
        texts.push(project.name || '');
        texts.push(project.description || '');
        if (project.technologies) {
          texts.push(...project.technologies);
        }
      });
    }
    
    // Interests
    if (userData.interests) {
      texts.push(...userData.interests);
    }
    
    return texts.join(' ');
  }

  /**
   * Get all available users (for testing/demo purposes)
   */
  getAllUsers(): any[] {
    return this.userData;
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): any | undefined {
    return this.userData.find(user => user.id === id);
  }
}

export const searchService = new SearchService();

// Export convenience functions for easier imports
export const extractKeywords = (searchText: string) => searchService.extractKeywords(searchText);
export const convertKeywordsToFilters = (keywords: ExtractedKeywords) => searchService.convertKeywordsToFilters(keywords);
export const searchUsers = (filters: SearchFilters, searchText?: string) => searchService.searchUsers(filters, searchText);
