import { AdvancedFilters } from '../components/AdvancedFilterPanel';

export interface ElasticsearchQuery {
  query: {
    bool: {
      must: any[];
      should: any[];
      filter: any[];
      must_not?: any[];
    };
  };
  sort?: any[];
}

/**
 * Converts advanced filters to Elasticsearch query format
 * Based on the CoreSignal API schema
 */
export const convertAdvancedFiltersToQuery = (filters: AdvancedFilters): ElasticsearchQuery => {
  const must: any[] = [];
  const should: any[] = [];
  const filter: any[] = [];

  // Always filter for active, non-deleted candidates
  filter.push(
    { term: { is_working: 1 } },
    { term: { is_deleted: 0 } }
  );

  // Basic Information Filters
  if (filters.fullName) {
    must.push({
      multi_match: {
        query: filters.fullName,
        fields: ['full_name^3', 'full_name.exact^4'],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    });
  }

  if (filters.jobTitle) {
    must.push({
      multi_match: {
        query: filters.jobTitle,
        fields: ['job_title^4', 'job_title.exact^5', 'headline^3', 'generated_headline^3'],
        type: 'best_fields',
        fuzziness: 'AUTO',
        minimum_should_match: '70%'
      }
    });
  }

  if (filters.headline) {
    must.push({
      multi_match: {
        query: filters.headline,
        fields: ['headline^3', 'generated_headline^3', 'job_title^2'],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    });
  }

  if (filters.description) {
    should.push({
      multi_match: {
        query: filters.description,
        fields: ['description^3', 'job_description^2'],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    });
  }

  // Location Filters
  if (filters.locationRawAddress) {
    must.push({
      multi_match: {
        query: filters.locationRawAddress,
        fields: ['location_raw_address^4', 'location_raw_address.exact^5'],
        type: 'phrase_prefix',
        minimum_should_match: '70%'
      }
    });
  }

  if (filters.locationCountry) {
    must.push({
      term: { 'location_country': filters.locationCountry.toLowerCase() }
    });
  }

  if (filters.locationRegions) {
    must.push({
      match: { 'location_regions': filters.locationRegions }
    });
  }

  // Skills Filter
  if (filters.skills && filters.skills.length > 0) {
    const skillsArray = Array.isArray(filters.skills) 
      ? filters.skills 
      : (typeof filters.skills === 'string' ? filters.skills.split(',').map(s => s.trim()) : []);
    
    skillsArray.forEach(skill => {
      should.push({
        multi_match: {
          query: skill,
          fields: ['skills^4', 'skills.exact^5', 'description^2'],
          type: 'best_fields',
          boost: 3,
          fuzziness: 'AUTO'
        }
      });
    });
  }

  // Experience Duration Filter
  if (filters.totalExperienceMonths) {
    const range: any = {};
    if (filters.totalExperienceMonths.min !== undefined) {
      range.gte = filters.totalExperienceMonths.min;
    }
    if (filters.totalExperienceMonths.max !== undefined) {
      range.lte = filters.totalExperienceMonths.max;
    }
    if (Object.keys(range).length > 0) {
      filter.push({
        range: { 'total_experience_duration_months': range }
      });
    }
  }

  // Management Level Filter
  if (filters.managementLevel && filters.managementLevel.length > 0) {
    should.push({
      terms: { 'management_level': filters.managementLevel.map(level => level.toLowerCase()) }
    });
  }

  // Department Filter
  if (filters.department && filters.department.length > 0) {
    should.push({
      terms: { 'department': filters.department.map(dept => dept.toLowerCase()) }
    });
  }

  // Boolean Filters
  if (filters.isDecisionMaker !== undefined) {
    filter.push({
      term: { 'is_decision_maker': filters.isDecisionMaker ? 1 : 0 }
    });
  }

  if (filters.isWorking !== undefined) {
    filter.push({
      term: { 'is_working': filters.isWorking ? 1 : 0 }
    });
  }

  // Experience Details (nested queries)
  const experienceConditions: any[] = [];
  
  if (filters.experienceTitle) {
    experienceConditions.push({
      multi_match: {
        query: filters.experienceTitle,
        fields: ['experience.title^3', 'experience.title.exact^4'],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    });
  }

  if (filters.experienceCompany) {
    experienceConditions.push({
      multi_match: {
        query: filters.experienceCompany,
        fields: ['experience.company_name^3', 'experience.company_name.exact^4'],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    });
  }

  if (filters.experienceDescription) {
    experienceConditions.push({
      match: { 'experience.description': filters.experienceDescription }
    });
  }

  if (filters.experienceLocation) {
    experienceConditions.push({
      multi_match: {
        query: filters.experienceLocation,
        fields: ['experience.location^2', 'experience.location.exact^3'],
        type: 'phrase_prefix'
      }
    });
  }

  if (filters.experienceDurationMonths) {
    const range: any = {};
    if (filters.experienceDurationMonths.min !== undefined) {
      range.gte = filters.experienceDurationMonths.min;
    }
    if (filters.experienceDurationMonths.max !== undefined) {
      range.lte = filters.experienceDurationMonths.max;
    }
    if (Object.keys(range).length > 0) {
      experienceConditions.push({
        range: { 'experience.duration_months': range }
      });
    }
  }

  // Add nested experience query if any conditions exist
  if (experienceConditions.length > 0) {
    should.push({
      nested: {
        path: 'experience',
        query: {
          bool: {
            should: experienceConditions,
            minimum_should_match: 1
          }
        },
        boost: 2
      }
    });
  }

  // Company Filters (nested)
  const companyConditions: any[] = [];

  if (filters.companyIndustry && filters.companyIndustry.length > 0) {
    companyConditions.push({
      terms: { 'experience.company_industry.exact': filters.companyIndustry }
    });
  }

  if (filters.companySizeRange && filters.companySizeRange.length > 0) {
    companyConditions.push({
      terms: { 'experience.company_size_range.exact': filters.companySizeRange }
    });
  }

  if (filters.companyType && filters.companyType.length > 0) {
    companyConditions.push({
      terms: { 'experience.company_type': filters.companyType.map(type => type.toLowerCase()) }
    });
  }

  if (filters.companyRevenue) {
    const range: any = {};
    if (filters.companyRevenue.min !== undefined) {
      range.gte = filters.companyRevenue.min;
    }
    if (filters.companyRevenue.max !== undefined) {
      range.lte = filters.companyRevenue.max;
    }
    if (Object.keys(range).length > 0) {
      companyConditions.push({
        range: { 'experience.company_annual_revenue': range }
      });
    }
  }

  if (companyConditions.length > 0) {
    should.push({
      nested: {
        path: 'experience',
        query: {
          bool: {
            should: companyConditions,
            minimum_should_match: 1
          }
        }
      }
    });
  }

  // Education Filters (nested)
  const educationConditions: any[] = [];

  if (filters.educationTitle) {
    educationConditions.push({
      multi_match: {
        query: filters.educationTitle,
        fields: ['education.title^2', 'education.title.exact^3'],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    });
  }

  if (filters.educationMajor) {
    educationConditions.push({
      multi_match: {
        query: filters.educationMajor,
        fields: ['education.major^2', 'education.major.exact^3'],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    });
  }

  if (filters.educationInstitution) {
    educationConditions.push({
      match: { 'education.institution_url.domain_only': filters.educationInstitution }
    });
  }

  if (educationConditions.length > 0) {
    should.push({
      nested: {
        path: 'education',
        query: {
          bool: {
            should: educationConditions,
            minimum_should_match: 1
          }
        }
      }
    });
  }

  // Certifications Filter (nested)
  if (filters.certificationTitle || filters.certificationIssuer) {
    const certConditions: any[] = [];
    
    if (filters.certificationTitle) {
      certConditions.push({
        multi_match: {
          query: filters.certificationTitle,
          fields: ['certifications.title^2', 'certifications.title.exact^3'],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      });
    }
    
    if (filters.certificationIssuer) {
      certConditions.push({
        multi_match: {
          query: filters.certificationIssuer,
          fields: ['certifications.issuer^2', 'certifications.issuer.exact^3'],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      });
    }

    should.push({
      nested: {
        path: 'certifications',
        query: {
          bool: {
            should: certConditions,
            minimum_should_match: 1
          }
        }
      }
    });
  }

  // Awards Filter (nested)
  if (filters.awardTitle) {
    should.push({
      nested: {
        path: 'awards',
        query: {
          multi_match: {
            query: filters.awardTitle,
            fields: ['awards.title^2', 'awards.title.exact^3'],
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        }
      }
    });
  }

  // Languages Filter (nested)
  if (filters.languages && filters.languages.length > 0) {
    const languagesArray = Array.isArray(filters.languages) 
      ? filters.languages 
      : (typeof filters.languages === 'string' ? filters.languages.split(',').map(l => l.trim()) : []);
      
    const langConditions: any[] = [];
    languagesArray.forEach(lang => {
      langConditions.push({
        match: { 'languages.language.exact': lang }
      });
    });

    if (filters.languageProficiency && filters.languageProficiency.length > 0) {
      langConditions.push({
        terms: { 'languages.proficiency.exact': filters.languageProficiency }
      });
    }

    should.push({
      nested: {
        path: 'languages',
        query: {
          bool: {
            should: langConditions,
            minimum_should_match: 1
          }
        }
      }
    });
  }

  // Professional Network Filters
  if (filters.connectionsCount) {
    const range: any = {};
    if (filters.connectionsCount.min !== undefined) {
      range.gte = filters.connectionsCount.min;
    }
    if (filters.connectionsCount.max !== undefined) {
      range.lte = filters.connectionsCount.max;
    }
    if (Object.keys(range).length > 0) {
      filter.push({
        range: { 'connections_count': range }
      });
    }
  }

  if (filters.followerCount) {
    const range: any = {};
    if (filters.followerCount.min !== undefined) {
      range.gte = filters.followerCount.min;
    }
    if (filters.followerCount.max !== undefined) {
      range.lte = filters.followerCount.max;
    }
    if (Object.keys(range).length > 0) {
      filter.push({
        range: { 'follower_count': range }
      });
    }
  }

  if (filters.recommendationsCount) {
    const range: any = {};
    if (filters.recommendationsCount.min !== undefined) {
      range.gte = filters.recommendationsCount.min;
    }
    if (filters.recommendationsCount.max !== undefined) {
      range.lte = filters.recommendationsCount.max;
    }
    if (Object.keys(range).length > 0) {
      filter.push({
        range: { 'recommendations_count': range }
      });
    }
  }

  return {
    query: {
      bool: {
        must,
        should,
        filter,

      }
    },
    sort: ['_score', { 'last_updated': { 'order': 'desc' } }]
  };
};

/**
 * Generate a human-readable summary of applied filters
 */
export const generateFilterSummary = (filters: AdvancedFilters): string[] => {
  const summary: string[] = [];

  if (filters.fullName) summary.push(`Name: "${filters.fullName}"`);
  if (filters.jobTitle) summary.push(`Job Title: "${filters.jobTitle}"`);
  if (filters.locationRawAddress) summary.push(`Location: "${filters.locationRawAddress}"`);
  if (filters.skills && filters.skills.length > 0) {
    const skillsArray = Array.isArray(filters.skills) ? filters.skills : (typeof filters.skills === 'string' ? filters.skills.split(',').map(s => s.trim()) : []);
    summary.push(`Skills: ${skillsArray.join(', ')}`);
  }
  if (filters.managementLevel && filters.managementLevel.length > 0) {
    summary.push(`Management Level: ${filters.managementLevel.join(', ')}`);
  }
  if (filters.companyIndustry && filters.companyIndustry.length > 0) {
    summary.push(`Industry: ${filters.companyIndustry.join(', ')}`);
  }
  if (filters.totalExperienceMonths) {
    const { min, max } = filters.totalExperienceMonths;
    if (min !== undefined && max !== undefined) {
      summary.push(`Experience: ${min}-${max} months`);
    } else if (min !== undefined) {
      summary.push(`Experience: ${min}+ months`);
    } else if (max !== undefined) {
      summary.push(`Experience: up to ${max} months`);
    }
  }

  return summary;
};