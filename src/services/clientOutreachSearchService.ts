import apiClient from '../lib/api';

// Company DTO matching backend response
export interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  sizeRange?: string;
  employeeCount?: number;
  location?: string;
  description?: string;
  specialties?: string[];
  technologies?: string[];
  founded?: string;
  funding?: {
    lastRoundType?: string;
    lastRoundDate?: string;
    totalRounds?: number;
  };
  linkedinUrl?: string;
  logo?: string;
  followers?: number;
  type?: string;
  score?: number;
}

export interface ClientSearchResult {
  companies: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  executionTime?: number;
  query?: any;
  savedSearch?: any; // Include saved search details
  savedProspects?: any[]; // Include saved prospects
}

// CoreSignal API Types
export interface CoreSignalQuery {
  query: {
    bool: {
      must?: Array<any>;
      should?: Array<any>;
      must_not?: Array<any>;
      filter?: Array<any>;
    };
  };
  sort?: Array<any>;
}

export interface ClientSearchFilters {
  // Core search filters
  companyNames?: string[];
  industries?: string[];
  companySize?: string[];
  locations?: string[];
  technologies?: string[];
  keywords?: string[];
  specialties?: string[];
  
  // Website and domain filters
  websites?: string[];
  excludeCompanies?: string[];
  excludeDomains?: string[];
  
  // Financial and company data
  revenue?: {
    min?: number;
    max?: number;
  };
  employees?: {
    min?: number;
    max?: number;
  };
  followers?: {
    min?: number;
    max?: number;
  };
  founded?: {
    min?: number;
    max?: number;
  };
  
  // Company characteristics
  fundingStage?: string[];
  companyType?: string[];
  ticker?: string[];
  exchange?: string[];
  
  // Business model filters
  hasPricing?: boolean;
  hasFreeTrial?: boolean;
  hasDemo?: boolean;
  isDownloadable?: boolean;
  hasMobileApps?: boolean;
  hasApiDocs?: boolean;
  
  // Social media presence
  hasFacebook?: boolean;
  hasTwitter?: boolean;
  hasLinkedIn?: boolean;
  hasInstagram?: boolean;
  hasYoutube?: boolean;
  hasGithub?: boolean;
}

export interface ExtractedKeywords {
  industries: string[];
  companySize: string[];
  locations: string[];
  technologies: string[];
  keywords: string[];
  revenue?: {
    min?: number;
    max?: number;
  };
  employees?: {
    min?: number;
    max?: number;
  };
  fundingStage: string[];
  excludeTerms: string[];
}

// Size range mapping for CoreSignal API
const SIZE_RANGE_MAPPING: Record<string, string> = {
  '1-10': '1-10 employees',
  '11-50': '11-50 employees',
  '51-200': '51-200 employees',
  '201-500': '201-500 employees',
  '501-1000': '501-1000 employees',
  '1001-5000': '1001-5000 employees',
  '5001-10000': '5001-10000 employees',
  '10000+': '10000+ employees',
  'startup': '1-50 employees',
  'small': '11-200 employees',
  'medium': '201-1000 employees',
  'large': '1001+ employees',
  'enterprise': '5001+ employees'
};

// Funding stage mapping
const FUNDING_STAGE_MAPPING: Record<string, string> = {
  'seed': 'Seed',
  'series-a': 'Series A',
  'series-b': 'Series B',
  'series-c': 'Series C',
  'series-d': 'Series D',
  'ipo': 'IPO',
  'acquired': 'Acquired',
  'private-equity': 'Private Equity',
  'venture': 'Venture',
  'angel': 'Angel'
};

/**
 * Extract keywords and filters from natural language query using AI (via backend)
 */
export const extractClientSearchKeywords = async (query: string): Promise<ExtractedKeywords> => {
  try {
    const response = await apiClient.post('/client-outreach/search/extract-keywords', {
      searchText: query
    });

    return response.data;
  } catch (error) {
    console.error('Error extracting client keywords:', error);
    
    // Fallback to basic parsing if backend fails
    const fallback = {
      industries: [],
      companySize: [],
      locations: [],
      technologies: [],
      keywords: query.split(' ').filter(word => word.length > 2).slice(0, 5),
      revenue: {},
      employees: {},
      fundingStage: [],
      excludeTerms: []
    };
    
    return fallback;
  }
};

/**
 * Clean extracted keywords to remove invalid or problematic values - simplified version
 */
export const cleanExtractedKeywords = (keywords: ExtractedKeywords): ExtractedKeywords => {
  const cleaned: ExtractedKeywords = { ...keywords };

  // Clean industries - remove technology terms that are not industries and move them to technologies
  if (cleaned.industries) {
    const aiRelatedTerms = ['Artificial Intelligence', 'AI', 'Machine Learning', 'ML', 'Data Science', 'Deep Learning'];
    const validIndustries: string[] = [];
    const technologiesToAdd: string[] = [];

    cleaned.industries.forEach(industry => {
      const trimmed = industry.trim();
      if (aiRelatedTerms.includes(trimmed)) {
        // Move AI-related terms to technologies instead
        technologiesToAdd.push(trimmed);
      } else if (trimmed.length > 0) {
        validIndustries.push(trimmed);
      }
    });

    cleaned.industries = validIndustries;

    // Add AI terms to technologies
    if (technologiesToAdd.length > 0) {
      if (!cleaned.technologies) {
        cleaned.technologies = [];
      }
      cleaned.technologies.push(...technologiesToAdd);
      // Remove duplicates
      cleaned.technologies = Array.from(new Set(cleaned.technologies));
    }
  }

  // Clean technologies - ensure they're valid technology terms and remove duplicates
  if (cleaned.technologies) {
    cleaned.technologies = Array.from(new Set(
      cleaned.technologies.filter(tech => 
        tech && 
        tech.trim().length > 0 && 
        tech.trim().toLowerCase() !== 'none' &&
        tech.trim().toLowerCase() !== 'null'
      )
    ));
  }

  // Clean keywords - remove duplicates and empty values
  if (cleaned.keywords) {
    const uniqueKeywords = Array.from(new Set(
      cleaned.keywords.filter(keyword => 
        keyword && 
        keyword.trim().length > 0 &&
        keyword.trim().toLowerCase() !== 'none' &&
        keyword.trim().toLowerCase() !== 'null'
      )
    ));
    cleaned.keywords = uniqueKeywords;
  }

  // Clean locations
  if (cleaned.locations) {
    cleaned.locations = cleaned.locations.filter(location => 
      location && 
      location.trim().length > 0 &&
      location.trim().toLowerCase() !== 'none' &&
      location.trim().toLowerCase() !== 'null'
    );
  }

  // Since we're not extracting these anymore, ensure they're empty
  cleaned.companySize = [];
  cleaned.fundingStage = [];
  cleaned.excludeTerms = [];
  cleaned.revenue = {};
  cleaned.employees = {};

  return cleaned;
};

/**
 * Convert extracted keywords to CoreSignal API filters
 */
export const convertToClientSearchFilters = (keywords: ExtractedKeywords): ClientSearchFilters => {
  const filters: ClientSearchFilters = {};

  // Industries
  if (keywords.industries.length > 0) {
    filters.industries = keywords.industries;
  }

  // Company size - convert to CoreSignal format
  if (keywords.companySize.length > 0) {
    filters.companySize = keywords.companySize.map(size => {
      const mapped = SIZE_RANGE_MAPPING[size.toLowerCase()];
      return mapped || size;
    });
  }

  // Locations
  if (keywords.locations.length > 0) {
    filters.locations = keywords.locations;
  }

  // Technologies
  if (keywords.technologies.length > 0) {
    filters.technologies = keywords.technologies;
  }

  // Keywords
  if (keywords.keywords.length > 0) {
    filters.keywords = keywords.keywords;
  }

  // Revenue
  if (keywords.revenue && (keywords.revenue.min || keywords.revenue.max)) {
    filters.revenue = keywords.revenue;
  }

  // Employees
  if (keywords.employees && (keywords.employees.min || keywords.employees.max)) {
    filters.employees = keywords.employees;
  }

  // Funding stage
  if (keywords.fundingStage.length > 0) {
    filters.fundingStage = keywords.fundingStage.map(stage => {
      const mapped = FUNDING_STAGE_MAPPING[stage.toLowerCase()];
      return mapped || stage;
    });
  }

  // Exclude terms
  if (keywords.excludeTerms.length > 0) {
    filters.excludeCompanies = keywords.excludeTerms;
  }

  return filters;
};

/**
 * Convert client search filters to CoreSignal API query
 */
export const convertToCoreSignalQuery = (filters: ClientSearchFilters): CoreSignalQuery => {
  const must: Array<any> = [];
  const must_not: Array<any> = [];
  const should: Array<any> = [];

  // Company Names - exact match or partial match
  if (filters.companyNames && filters.companyNames.length > 0) {
    const validNames = filters.companyNames.filter(name => name && name.trim().length > 0);
    if (validNames.length > 0) {
      validNames.forEach(name => {
        should.push({
          multi_match: {
            query: name,
            fields: ["name^3", "name.exact^2"],
            type: "best_fields"
          }
        });
      });
    }
  }

  // Industries
  if (filters.industries && filters.industries.length > 0) {
    if (filters.industries.length === 1) {
      must.push({
        match: {
          "industry": filters.industries[0]
        }
      });
    } else {
      must.push({
        terms: {
          "industry.exact": filters.industries
        }
      });
    }
  }

  // Company size
  if (filters.companySize && filters.companySize.length > 0) {
    must.push({
      terms: {
        "size_range": filters.companySize
      }
    });
  }

  // Locations (using headquarters country)
  if (filters.locations && filters.locations.length > 0) {
    // Filter out empty values, "None", "null", etc.
    const validLocations = filters.locations.filter(location => 
      location && 
      location.trim().toLowerCase() !== 'none' && 
      location.trim().toLowerCase() !== 'null' &&
      location.trim().length > 0
    );
    
    if (validLocations.length > 0) {
      if (validLocations.length === 1) {
        must.push({
          term: {
            "location_hq_country": validLocations[0]
          }
        });
      } else {
        must.push({
          terms: {
            "location_hq_country": validLocations
          }
        });
      }
    }
  }

  // Specialties - search in specialities field
  if (filters.specialties && filters.specialties.length > 0) {
    const validSpecialties = filters.specialties.filter(specialty => specialty && specialty.trim().length > 0);
    if (validSpecialties.length > 0) {
      validSpecialties.forEach(specialty => {
        should.push({
          multi_match: {
            query: specialty,
            fields: ["specialities^2", "specialities.exact"],
            type: "best_fields"
          }
        });
      });
    }
  }

  // Websites/Domains
  if (filters.websites && filters.websites.length > 0) {
    const validWebsites = filters.websites.filter(website => website && website.trim().length > 0);
    if (validWebsites.length > 0) {
      validWebsites.forEach(website => {
        should.push({
          multi_match: {
            query: website,
            fields: ["websites_main_original.domain_only^2", "websites_main.domain_only", "websites_resolved.domain_only"],
            type: "best_fields"
          }
        });
      });
    }
  }

  // Stock Ticker
  if (filters.ticker && filters.ticker.length > 0) {
    must.push({
      terms: {
        "ticker": filters.ticker
      }
    });
  }

  // Stock Exchange
  if (filters.exchange && filters.exchange.length > 0) {
    must.push({
      terms: {
        "exchange": filters.exchange
      }
    });
  }

  // Company Type
  if (filters.companyType && filters.companyType.length > 0) {
    must.push({
      terms: {
        "type": filters.companyType
      }
    });
  }

  // Employee count range
  if (filters.employees) {
    const employeeFilter: any = {};
    if (filters.employees.min !== undefined) {
      employeeFilter.gte = filters.employees.min;
    }
    if (filters.employees.max !== undefined) {
      employeeFilter.lte = filters.employees.max;
    }
    if (Object.keys(employeeFilter).length > 0) {
      must.push({
        range: {
          "size_employees_count": employeeFilter
        }
      });
    }
  }

  // Followers range
  if (filters.followers) {
    const followersFilter: any = {};
    if (filters.followers.min !== undefined) {
      followersFilter.gte = filters.followers.min;
    }
    if (filters.followers.max !== undefined) {
      followersFilter.lte = filters.followers.max;
    }
    if (Object.keys(followersFilter).length > 0) {
      must.push({
        range: {
          "followers": followersFilter
        }
      });
    }
  }

  // Founded year range
  if (filters.founded) {
    const foundedFilter: any = {};
    if (filters.founded.min !== undefined) {
      foundedFilter.gte = filters.founded.min.toString();
    }
    if (filters.founded.max !== undefined) {
      foundedFilter.lte = filters.founded.max.toString();
    }
    if (Object.keys(foundedFilter).length > 0) {
      must.push({
        range: {
          "founded": foundedFilter
        }
      });
    }
  }

  // Funding Stage
  if (filters.fundingStage && filters.fundingStage.length > 0) {
    must.push({
      nested: {
        path: "funding_rounds",
        query: {
          terms: {
            "funding_rounds.last_round_type": filters.fundingStage
          }
        }
      }
    });
  }

  // Technologies
  if (filters.technologies && filters.technologies.length > 0) {
    // Filter out empty values, "None", "null", etc.
    const validTechnologies = filters.technologies.filter(tech => 
      tech && 
      tech.trim().toLowerCase() !== 'none' && 
      tech.trim().toLowerCase() !== 'null' &&
      tech.trim().length > 0
    );
    
    if (validTechnologies.length > 0) {
      validTechnologies.forEach(tech => {
        should.push({
          nested: {
            path: "technologies",
            query: {
              match: {
                "technologies.technology": tech
              }
            }
          }
        });
      });
    }
  }

  // Keywords - search in company name, description, and specialties
  if (filters.keywords && filters.keywords.length > 0) {
    // Filter out empty values, "None", "null", etc.
    const validKeywords = filters.keywords.filter(keyword => 
      keyword && 
      keyword.trim().toLowerCase() !== 'none' && 
      keyword.trim().toLowerCase() !== 'null' &&
      keyword.trim().length > 0
    );
    
    if (validKeywords.length > 0) {
      validKeywords.forEach(keyword => {
        should.push({
          multi_match: {
            query: keyword,
            fields: ["name^2", "description", "specialities", "enriched_summary"],
            type: "best_fields"
          }
        });
      });
    }
  }

  // Business Model Filters
  if (filters.hasPricing === true) {
    must.push({ term: { "pricing_available": true } });
  }
  if (filters.hasFreeTrial === true) {
    must.push({ term: { "free_trial_available": true } });
  }
  if (filters.hasDemo === true) {
    must.push({ term: { "demo_available": true } });
  }
  if (filters.isDownloadable === true) {
    must.push({ term: { "is_downloadable": true } });
  }
  if (filters.hasMobileApps === true) {
    must.push({ term: { "mobile_apps_exist": true } });
  }
  if (filters.hasApiDocs === true) {
    must.push({ term: { "api_docs_exist": true } });
  }

  // Social Media Presence Filters
  if (filters.hasLinkedIn === true) {
    must.push({ exists: { field: "social_professional_network_urls" } });
  }
  if (filters.hasTwitter === true) {
    must.push({
      bool: {
        should: [
          { exists: { field: "social_twitter_urls" } },
          { exists: { field: "social_x_urls" } }
        ]
      }
    });
  }
  if (filters.hasFacebook === true) {
    must.push({ exists: { field: "social_facebook_urls" } });
  }
  if (filters.hasInstagram === true) {
    must.push({ exists: { field: "social_instagram_urls" } });
  }
  if (filters.hasYoutube === true) {
    must.push({ exists: { field: "social_youtube_urls" } });
  }
  if (filters.hasGithub === true) {
    must.push({ exists: { field: "social_github_urls" } });
  }

  // Exclude companies
  if (filters.excludeCompanies && filters.excludeCompanies.length > 0) {
    filters.excludeCompanies.forEach(exclude => {
      must_not.push({
        multi_match: {
          query: exclude,
          fields: ["name", "websites_main_original.domain_only"]
        }
      });
    });
  }

  // Exclude domains
  if (filters.excludeDomains && filters.excludeDomains.length > 0) {
    filters.excludeDomains.forEach(domain => {
      must_not.push({
        match: {
          "websites_main_original.domain_only": domain
        }
      });
    });
  }

  // Build the query
  const query: CoreSignalQuery = {
    query: {
      bool: {}
    }
  };

  if (must.length > 0) {
    query.query.bool.must = must;
  }

  if (should.length > 0) {
    query.query.bool.should = should;
    // If we have should clauses, require at least one to match
    (query.query.bool as any).minimum_should_match = 1;
  }

  if (must_not.length > 0) {
    query.query.bool.must_not = must_not;
  }

  return query;
};

/**
 * Execute company search using backend API
 */
export const executeCompanySearch = async (
  filters: ClientSearchFilters,
  searchText?: string,
  projectId?: string,
  searchName?: string
): Promise<ClientSearchResult> => {
  try {
    // Clean filters by removing empty strings and empty arrays
    const cleanFilters: ClientSearchFilters = {};
    
    if (filters.companyNames?.length) {
      cleanFilters.companyNames = filters.companyNames.filter(item => item.trim() !== '');
    }
    if (filters.industries?.length) {
      cleanFilters.industries = filters.industries.filter(item => item.trim() !== '');
    }
    if (filters.companySize?.length) {
      cleanFilters.companySize = filters.companySize.filter(item => item.trim() !== '');
    }
    if (filters.locations?.length) {
      cleanFilters.locations = filters.locations.filter(item => item.trim() !== '');
    }
    if (filters.technologies?.length) {
      cleanFilters.technologies = filters.technologies.filter(item => item.trim() !== '');
    }
    if (filters.keywords?.length) {
      cleanFilters.keywords = filters.keywords.filter(item => item.trim() !== '');
    }
    if (filters.specialties?.length) {
      cleanFilters.specialties = filters.specialties.filter(item => item.trim() !== '');
    }
    if (filters.websites?.length) {
      cleanFilters.websites = filters.websites.filter(item => item.trim() !== '');
    }
    if (filters.ticker?.length) {
      cleanFilters.ticker = filters.ticker.filter(item => item.trim() !== '');
    }
    if (filters.exchange?.length) {
      cleanFilters.exchange = filters.exchange.filter(item => item.trim() !== '');
    }
    if (filters.companyType?.length) {
      cleanFilters.companyType = filters.companyType.filter(item => item.trim() !== '');
    }
    if (filters.fundingStage?.length) {
      cleanFilters.fundingStage = filters.fundingStage.filter(item => item.trim() !== '');
    }
    if (filters.excludeCompanies?.length) {
      cleanFilters.excludeCompanies = filters.excludeCompanies.filter(item => item.trim() !== '');
    }
    if (filters.excludeDomains?.length) {
      cleanFilters.excludeDomains = filters.excludeDomains.filter(item => item.trim() !== '');
    }
    
    // Handle range filters
    if (filters.revenue && (filters.revenue.min !== undefined || filters.revenue.max !== undefined)) {
      cleanFilters.revenue = filters.revenue;
    }
    if (filters.employees && (filters.employees.min !== undefined || filters.employees.max !== undefined)) {
      cleanFilters.employees = filters.employees;
    }
    if (filters.followers && (filters.followers.min !== undefined || filters.followers.max !== undefined)) {
      cleanFilters.followers = filters.followers;
    }
    if (filters.founded && (filters.founded.min !== undefined || filters.founded.max !== undefined)) {
      cleanFilters.founded = filters.founded;
    }
    
    // Handle boolean filters (only include if explicitly set to true)
    if (filters.hasPricing === true) cleanFilters.hasPricing = true;
    if (filters.hasFreeTrial === true) cleanFilters.hasFreeTrial = true;
    if (filters.hasDemo === true) cleanFilters.hasDemo = true;
    if (filters.isDownloadable === true) cleanFilters.isDownloadable = true;
    if (filters.hasMobileApps === true) cleanFilters.hasMobileApps = true;
    if (filters.hasApiDocs === true) cleanFilters.hasApiDocs = true;
    
    // Handle social media filters
    if (filters.hasFacebook === true) cleanFilters.hasFacebook = true;
    if (filters.hasTwitter === true) cleanFilters.hasTwitter = true;
    if (filters.hasLinkedIn === true) cleanFilters.hasLinkedIn = true;
    if (filters.hasInstagram === true) cleanFilters.hasInstagram = true;
    if (filters.hasYoutube === true) cleanFilters.hasYoutube = true;
    if (filters.hasGithub === true) cleanFilters.hasGithub = true;

    // Generate search name if not provided
    const finalSearchName = searchName || 
      `Search: ${searchText?.substring(0, 50) || 'Company search'}${searchText && searchText.length > 50 ? '...' : ''}`;

    // Debug log to see what's being sent to backend
    console.log('🔍 Sending to backend:', {
      filters: cleanFilters,
      searchText: searchText?.trim() || undefined,
      searchName: finalSearchName,
      projectId: projectId || undefined,
      searchType: 'ai' as const
    });

    const response = await apiClient.post('/client-outreach/search/companies-and-save', {
      filters: cleanFilters,
      searchText: searchText?.trim() || undefined,
      searchName: finalSearchName,
      projectId: projectId || undefined,
      searchType: 'ai' as const
    });

    // The response should contain searchResult, savedSearch, and savedProspects
    // Return the full response so we can access the savedSearch.id
    return {
      ...response.data.searchResult,
      savedSearch: response.data.savedSearch,
      savedProspects: response.data.savedProspects
    };
  } catch (error) {
    console.error('Error executing company search:', error);
    throw new Error('Failed to execute company search');
  }
};

/**
 * Convert Company to CompanyResult format for frontend
 */
export const convertToCompanyResult = (company: Company): any => {
  return {
    id: company.id,
    name: company.name,
    domain: company.domain,
    industry: company.industry,
    size: company.sizeRange,
    location: company.location,
    revenue: company.funding ? {
      // Estimate revenue based on funding and company size
      amount: estimateRevenue(company.employeeCount, company.funding.lastRoundType),
      currency: 'USD'
    } : undefined,
    employees: company.employeeCount,
    description: company.description,
    score: company.score || 8.0,
    specialties: company.specialties,
    technologies: company.technologies,
    founded: company.founded,
    funding: company.funding,
    linkedinUrl: company.linkedinUrl,
    logo: company.logo,
    followers: company.followers,
    type: company.type,
    // Add mock contact person for now
    contactPerson: {
      name: generateContactName(),
      title: generateContactTitle(),
      email: company.domain ? `contact@${company.domain}` : undefined,
      linkedinUrl: company.linkedinUrl
    }
  };
};

/**
 * Estimate revenue based on employee count and funding stage
 */
const estimateRevenue = (employees?: number, fundingStage?: string): number => {
  if (!employees) return 1000000; // Default 1M

  // Base revenue per employee estimates
  let revenuePerEmployee = 100000; // Default 100k per employee

  // Adjust based on funding stage
  switch (fundingStage?.toLowerCase()) {
    case 'seed':
      revenuePerEmployee = 50000;
      break;
    case 'series-a':
      revenuePerEmployee = 75000;
      break;
    case 'series-b':
    case 'series-c':
      revenuePerEmployee = 125000;
      break;
    case 'ipo':
    case 'public':
      revenuePerEmployee = 200000;
      break;
  }

  return Math.round(employees * revenuePerEmployee);
};

/**
 * Generate mock contact names
 */
const generateContactName = (): string => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Maria'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
};

/**
 * Generate mock contact titles
 */
const generateContactTitle = (): string => {
  const titles = [
    'CEO', 'CTO', 'VP of Sales', 'Director of Business Development',
    'VP of Marketing', 'Chief Revenue Officer', 'Head of Partnerships',
    'VP of Operations', 'Chief Operating Officer', 'Director of Sales'
  ];
  
  return titles[Math.floor(Math.random() * titles.length)];
};
