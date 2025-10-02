/**
 * Utility for parsing AI-generated Elasticsearch queries and extracting search criteria
 * for display in the frontend search criteria panel
 */

export interface SearchCriteria {
  label: string;
  value: string | number | string[];
  type: 'primary' | 'secondary' | 'system';
  category: 'job_title' | 'location' | 'skills' | 'industry' | 'experience' | 'system';
}

// Field mapping from backend Elasticsearch fields to frontend display labels
const FIELD_MAPPING: Record<string, { label: string; category: SearchCriteria['category'] }> = {
  // Job Title fields
  job_title: { label: 'Job Title', category: 'job_title' },
  headline: { label: 'Headline', category: 'job_title' },
  generated_headline: { label: 'Generated Headline', category: 'job_title' },
  
  // Location fields
  city: { label: 'Location (City)', category: 'location' },
  country: { label: 'Location (Country)', category: 'location' },
  location_raw_address: { label: 'Location', category: 'location' },
  
  // Skills fields
  skills: { label: 'Skills', category: 'skills' },
  
  // Industry fields
  industry: { label: 'Industry', category: 'industry' },
  company_industry: { label: 'Company Industry', category: 'industry' },
  company_name: { label: 'Company', category: 'industry' },
  
  // Experience fields
  total_experience_duration_months: { label: 'Total Experience', category: 'experience' },
  'experience.title': { label: 'Experience Title', category: 'experience' },
  'experience.description': { label: 'Experience Description', category: 'experience' },
  'experience.company_name': { label: 'Experience Company', category: 'experience' },
  'experience.company_industry': { label: 'Experience Industry', category: 'experience' },
  
  // System fields
  is_working: { label: 'Currently Working', category: 'system' },
  is_deleted: { label: 'Active Profiles', category: 'system' },
  
  // Additional fields
  description: { label: 'Description', category: 'skills' },
};

/**
 * Extracts search criteria from AI-generated Elasticsearch query
 */
export function extractSearchCriteriaFromAIQuery(aiQuery: any): SearchCriteria[] {
  // Handle both cases: aiQuery is the bool object or aiQuery contains a bool property
  let boolQuery = null;
  if (aiQuery?.bool) {
    boolQuery = aiQuery.bool;
  } else if (aiQuery?.must || aiQuery?.should || aiQuery?.filter) {
    boolQuery = aiQuery;
  } else {
    return [];
  }

  const criteria: SearchCriteria[] = [];
  const seenCriteria = new Set<string>(); // To avoid duplicates

  /**
   * Helper function to add criteria with deduplication
   */
  function addCriteria(field: string, value: any, type: SearchCriteria['type'] = 'secondary') {
    const mapping = FIELD_MAPPING[field];
    if (!mapping) return;

    // Format value based on type
    let formattedValue: string | number | string[];
    if (typeof value === 'object' && value !== null) {
      if (value.gte !== undefined) {
        formattedValue = `≥ ${Math.floor(value.gte / 12)} years (${value.gte} months)`;
      } else if (value.lte !== undefined) {
        formattedValue = `≤ ${Math.floor(value.lte / 12)} years (${value.lte} months)`;
      } else if (value.query !== undefined) {
        formattedValue = value.query;
      } else {
        formattedValue = String(value);
      }
    } else {
      formattedValue = value;
    }

    // Create unique key for deduplication
    const key = `${mapping.label}:${JSON.stringify(formattedValue)}`;
    if (seenCriteria.has(key)) return;

    seenCriteria.add(key);
    criteria.push({
      label: mapping.label,
      value: formattedValue,
      type,
      category: mapping.category,
    });
  }

  /**
   * Helper function to extract field name from boosted field (e.g., "job_title^4" -> "job_title")
   */
  function cleanFieldName(field: string): string {
    return field.replace(/\^\d+$/, '');
  }

  /**
   * Helper function to get the boost value from a field (e.g., "skills^3" -> 3)
   */
  function getBoostValue(field: string): number {
    const boostMatch = field.match(/\^(\d+)$/);
    return boostMatch ? parseInt(boostMatch[1]) : 1; // Default boost is 1
  }

  /**
   * Helper function to find the highest priority field based on boost scores and field importance
   */
  function getHighestPriorityField(fields: string[]): string | null {
    if (!fields || fields.length === 0) return null;
    
    let highestBoostField = null;
    let highestBoost = 0;
    
    // Extract boost values from all fields and find the highest one
    for (const field of fields) {
      const cleanField = cleanFieldName(field);
      const boost = getBoostValue(field);
      
      if (boost > highestBoost || 
          (boost === highestBoost && cleanField === 'skills') || // Prioritize skills on equal boost
          (boost === highestBoost && !highestBoostField)) {
        highestBoost = boost;
        highestBoostField = cleanField;
      }
    }
    
    return highestBoostField;
  }

  /**
   * Process multi_match queries
   */
  function processMultiMatch(item: any, type: SearchCriteria['type'] = 'secondary') {
    if (!item.multi_match) return;

    const query = item.multi_match.query;
    const fields = item.multi_match.fields || [];

    // Clean fields to check for matches
    const cleanedFields = fields.map((f: string) => cleanFieldName(f));

    // Determine field priority based on boost values and field order
    const highestBoostField = getHighestPriorityField(fields);
    
    // If highest boost field is skills, treat as skills query
    if (highestBoostField === 'skills') {
      addCriteria('skills', query, type);
      return;
    }
    
    // If highest boost field is job_title related, treat as job title query
    if (highestBoostField === 'job_title' || highestBoostField === 'headline' || highestBoostField === 'generated_headline') {
      addCriteria('job_title', query, type);
      return;
    }
    
    // Fallback: Check if skills field is present and has specific characteristics
    const hasSkillsField = cleanedFields.some((f: string) => f === 'skills');
    if (hasSkillsField) {
      const skillsFieldIndex = fields.findIndex((f: string) => cleanFieldName(f) === 'skills');
      
      // If skills is the first field, treat as skills query
      if (skillsFieldIndex === 0) {
        addCriteria('skills', query, type);
        return;
      }
      
      // Priority 3: If query looks like a skill (short technical terms, etc.) and skills field is present
      const queryText = query.toLowerCase();
      const skillKeywords = ['javascript', 'python', 'react', 'java', 'sql', 'aws', 'azure', 'docker', 'kubernetes', 'api', 'rest', 'graphql', 'node', 'angular', 'vue', 'html', 'css', 'git', 'ci/cd', 'devops', 'agile', 'scrum'];
      const isLikelySkill = queryText.length <= 30 && (
        skillKeywords.some(keyword => queryText.includes(keyword)) ||
        /^[A-Z]{2,}$/.test(query) || // Acronyms like DCM, API, etc.
        queryText.includes('programming') ||
        queryText.includes('development') ||
        queryText.includes('framework') ||
        queryText.includes('technology')
      );
      
      if (isLikelySkill) {
        addCriteria('skills', query, type);
        return;
      }
    }
    
    // Fallback: If no specific classification worked, check for job title fields
    const hasJobTitleField = cleanedFields.some((f: string) => 
      f === 'job_title' || f === 'headline' || f === 'generated_headline'
    );
    if (hasJobTitleField) {
      addCriteria('job_title', query, type);
      return;
    }

    // For other fields, prioritize by boost score and use the highest boost mapped field
    const prioritizedField = getHighestPriorityField(fields);
    if (prioritizedField && FIELD_MAPPING[prioritizedField]) {
      addCriteria(prioritizedField, query, type);
      return;
    }
    
    // Final fallback: use the first mapped field
    for (const field of fields) {
      const cleanField = cleanFieldName(field);
      if (FIELD_MAPPING[cleanField]) {
        addCriteria(cleanField, query, type);
        break;
      }
    }
  }

  /**
   * Process match queries
   */
  function processMatch(item: any, type: SearchCriteria['type'] = 'secondary') {
    if (!item.match) return;

    Object.entries(item.match).forEach(([field, matchData]: [string, any]) => {
      const value = matchData.query || matchData;
      addCriteria(field, value, type);
    });
  }

  /**
   * Process range queries
   */
  function processRange(item: any, type: SearchCriteria['type'] = 'secondary') {
    if (!item.range) return;

    Object.entries(item.range).forEach(([field, rangeData]) => {
      addCriteria(field, rangeData, type);
    });
  }

  /**
   * Process term queries (usually system filters)
   */
  function processTerm(item: any) {
    if (!item.term) return;

    Object.entries(item.term).forEach(([field, value]) => {
      addCriteria(field, value, 'system');
    });
  }

  /**
   * Process nested queries
   */
  function processNested(item: any, type: SearchCriteria['type'] = 'secondary') {
    if (!item.nested?.query) return;

    const nestedQuery = item.nested.query;
    const path = item.nested.path;

    if (nestedQuery.bool?.should) {
      nestedQuery.bool.should.forEach((nestedItem: any) => {
        if (nestedItem.match) {
          Object.entries(nestedItem.match).forEach(([field, matchData]: [string, any]) => {
            const value = matchData.query || matchData;
            addCriteria(field, value, type);
          });
        } else if (nestedItem.multi_match) {
          // For nested multi_match, prefix fields with path and prioritize by boost
          const fields = nestedItem.multi_match.fields || [];
          const query = nestedItem.multi_match.query;
          
          // Create full field names with path prefix
          const fullFields = fields.map((field: string) => {
            return field.startsWith(path) ? field : `${path}.${field}`;
          });
          
          // Find the highest priority field
          const prioritizedField = getHighestPriorityField(fullFields);
          if (prioritizedField && FIELD_MAPPING[prioritizedField]) {
            addCriteria(prioritizedField, query, type);
          } else {
            // Fallback: use the first mapped field
            for (const field of fullFields) {
              const cleanField = cleanFieldName(field);
              if (FIELD_MAPPING[cleanField]) {
                addCriteria(cleanField, query, type);
                break;
              }
            }
          }
        }
      });
    } else if (nestedQuery.match) {
      Object.entries(nestedQuery.match).forEach(([field, matchData]: [string, any]) => {
        const value = matchData.query || matchData;
        addCriteria(field, value, type);
      });
    }
  }

  /**
   * Process bool queries with nested should clauses (for location)
   */
  function processBoolShould(item: any, type: SearchCriteria['type'] = 'primary') {
    if (!item.bool?.should) return;

    // Group location values together
    const locationValues: string[] = [];
    
    item.bool.should.forEach((shouldItem: any) => {
      if (shouldItem.match) {
        Object.entries(shouldItem.match).forEach(([field, matchData]: [string, any]) => {
          const value = matchData.query || matchData;
          if (['city', 'country', 'location_raw_address'].includes(field)) {
            locationValues.push(value);
          } else {
            addCriteria(field, value, type);
          }
        });
      } else if (shouldItem.multi_match) {
        // Handle multi_match in bool.should with boost prioritization
        const fields = shouldItem.multi_match.fields || [];
        const query = shouldItem.multi_match.query;
        
        if (fields.length > 0 && query) {
          // Use boost-aware field selection
          const selectedField = getHighestPriorityField(fields);
          if (['city', 'country', 'location_raw_address'].includes(selectedField)) {
            locationValues.push(query);
          } else {
            addCriteria(selectedField, query, type);
          }
        }
      }
    });

    // Add consolidated location if we found any
    if (locationValues.length > 0) {
      const uniqueLocations = [...new Set(locationValues)];
      addCriteria('location_raw_address', uniqueLocations.length === 1 ? uniqueLocations[0] : uniqueLocations, type);
    }
  }

  // Process MUST clauses (primary criteria)
  if (boolQuery.must) {
    boolQuery.must.forEach((item: any) => {
      if (item.multi_match) {
        processMultiMatch(item, 'primary');
      } else if (item.match) {
        processMatch(item, 'primary');
      } else if (item.range) {
        processRange(item, 'primary');
      } else if (item.bool?.should) {
        processBoolShould(item, 'primary');
      } else if (item.nested) {
        processNested(item, 'primary');
      }
    });
  }

  // Process SHOULD clauses (secondary criteria)
  if (boolQuery.should) {
    boolQuery.should.forEach((item: any) => {
      if (item.multi_match) {
        processMultiMatch(item, 'secondary');
      } else if (item.match) {
        processMatch(item, 'secondary');
      } else if (item.range) {
        processRange(item, 'secondary');
      } else if (item.nested) {
        processNested(item, 'secondary');
      }
    });
  }

  // Process FILTER clauses (system criteria)
  if (boolQuery.filter) {
    boolQuery.filter.forEach((item: any) => {
      processTerm(item);
    });
  }

  // Sort criteria: primary first, then by category, then alphabetically
  criteria.sort((a, b) => {
    if (a.type !== b.type) {
      const typeOrder = { primary: 0, secondary: 1, system: 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    }
    if (a.category !== b.category) {
      const categoryOrder = { job_title: 0, location: 1, skills: 2, industry: 3, experience: 4, system: 5 };
      return categoryOrder[a.category] - categoryOrder[b.category];
    }
    return a.label.localeCompare(b.label);
  });

  return criteria;
}

/**
 * Groups search criteria by category for organized display
 */
export function groupSearchCriteriaByCategory(criteria: SearchCriteria[]): Record<string, SearchCriteria[]> {
  return criteria.reduce((groups, criterion) => {
    if (!groups[criterion.category]) {
      groups[criterion.category] = [];
    }
    groups[criterion.category].push(criterion);
    return groups;
  }, {} as Record<string, SearchCriteria[]>);
}

/**
 * Formats criteria value for display
 */
export function formatCriteriaValue(value: string | number | string[]): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value);
}

/**
 * Gets category display name
 */
export function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    job_title: 'Job Titles',
    location: 'Locations', 
    skills: 'Skills & Keywords',
    industry: 'Industry & Companies',
    experience: 'Experience Requirements',
    system: 'System Filters',
  };
  return categoryNames[category] || category;
}

/**
 * Converts AI-generated search criteria to AdvancedFilters format
 */
export function convertAIQueryToAdvancedFilters(aiQuery: any): any {
  if (!aiQuery) return {};

  // Handle different query structures
  let queryToProcess = aiQuery;
  if (aiQuery.query?.bool) {
    queryToProcess = aiQuery.query.bool;
  } else if (aiQuery.query) {
    queryToProcess = aiQuery.query;
  } else if (aiQuery.bool) {
    queryToProcess = aiQuery.bool;
  }

  const criteria = extractSearchCriteriaFromAIQuery(queryToProcess);
  const advancedFilters: any = {};

  criteria.forEach(criterion => {
    switch (criterion.category) {
      case 'job_title':
        if (criterion.label === 'Job Title') {
          if (!advancedFilters.jobTitle) {
            advancedFilters.jobTitle = [];
          }
          const titles = Array.isArray(criterion.value) ? criterion.value : [criterion.value];
          advancedFilters.jobTitle = [...advancedFilters.jobTitle, ...titles];
        } else if (criterion.label === 'Headline') {
          advancedFilters.headline = criterion.value;
        } else if (criterion.label === 'Generated Headline') {
          advancedFilters.generatedHeadline = criterion.value;
        }
        break;

      case 'location':
        if (criterion.label === 'Location' || criterion.label === 'Location (City)' || criterion.label === 'Location (Country)') {
          if (!advancedFilters.locationRawAddress) {
            advancedFilters.locationRawAddress = [];
          }
          const locations = Array.isArray(criterion.value) ? criterion.value : [criterion.value];
          advancedFilters.locationRawAddress = [...(advancedFilters.locationRawAddress || []), ...locations];
        }
        break;

      case 'skills':
        if (criterion.label === 'Skills' || criterion.label === 'Description') {
          if (!advancedFilters.skills) {
            advancedFilters.skills = [];
          }
          const skills = Array.isArray(criterion.value) ? criterion.value : [criterion.value];
          advancedFilters.skills = [...(advancedFilters.skills || []), ...skills];
        }
        break;

      case 'industry':
        if (criterion.label === 'Industry' || criterion.label === 'Company Industry') {
          if (!advancedFilters.companyIndustry) {
            advancedFilters.companyIndustry = [];
          }
          const industries = Array.isArray(criterion.value) ? criterion.value : [criterion.value];
          advancedFilters.companyIndustry = [...(advancedFilters.companyIndustry || []), ...industries];
        } else if (criterion.label === 'Company') {
          if (!advancedFilters.experienceCompany) {
            advancedFilters.experienceCompany = [];
          }
          const companies = Array.isArray(criterion.value) ? criterion.value : [criterion.value];
          advancedFilters.experienceCompany = [...(advancedFilters.experienceCompany || []), ...companies];
        } else if (criterion.label === 'Experience Industry') {
          if (!advancedFilters.companyIndustry) {
            advancedFilters.companyIndustry = [];
          }
          const industries = Array.isArray(criterion.value) ? criterion.value : [criterion.value];
          advancedFilters.companyIndustry = [...(advancedFilters.companyIndustry || []), ...industries];
        }
        break;

      case 'experience':
        if (criterion.label === 'Total Experience') {
          // Parse experience range (e.g., "≥ 5 years (60 months)" -> { min: 60 })
          const valueStr = String(criterion.value);
          if (valueStr.includes('≥') && valueStr.includes('months')) {
            const match = valueStr.match(/(\d+)\s*months/);
            if (match) {
              advancedFilters.totalExperienceMonths = { min: parseInt(match[1]) };
            }
          } else if (valueStr.includes('≤') && valueStr.includes('months')) {
            const match = valueStr.match(/(\d+)\s*months/);
            if (match) {
              advancedFilters.totalExperienceMonths = { max: parseInt(match[1]) };
            }
          }
        } else if (criterion.label === 'Experience Title') {
          if (!advancedFilters.experienceTitle) {
            advancedFilters.experienceTitle = [];
          }
          const titles = Array.isArray(criterion.value) ? criterion.value : [criterion.value];
          if (Array.isArray(advancedFilters.experienceTitle)) {
            advancedFilters.experienceTitle = [...advancedFilters.experienceTitle, ...titles];
          } else {
            advancedFilters.experienceTitle = [advancedFilters.experienceTitle, ...titles];
          }
        } else if (criterion.label === 'Experience Description') {
          advancedFilters.experienceDescription = criterion.value;
        } else if (criterion.label === 'Experience Company') {
          if (!advancedFilters.experienceCompany) {
            advancedFilters.experienceCompany = [];
          }
          const companies = Array.isArray(criterion.value) ? criterion.value : [criterion.value];
          advancedFilters.experienceCompany = [...(advancedFilters.experienceCompany || []), ...companies];
        }
        break;

      case 'system':
        if (criterion.label === 'Currently Working') {
          advancedFilters.isWorking = criterion.value === 'true' || criterion.value === 1 || criterion.value === '1';
        }
        break;
    }
  });

  // Remove duplicates from arrays
  if (advancedFilters.locationRawAddress) {
    advancedFilters.locationRawAddress = [...new Set(advancedFilters.locationRawAddress)];
  }
  if (advancedFilters.skills) {
    advancedFilters.skills = [...new Set(advancedFilters.skills)];
  }
  if (advancedFilters.companyIndustry) {
    advancedFilters.companyIndustry = [...new Set(advancedFilters.companyIndustry)];
  }
  if (advancedFilters.experienceCompany) {
    advancedFilters.experienceCompany = [...new Set(advancedFilters.experienceCompany)];
  }

  return advancedFilters;
}