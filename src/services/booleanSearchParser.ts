/**
 * Boolean Search Parser for Advanced Search Queries
 * 
 * Supports syntax like:
 * +Keywords:(B2G OR Government OR "Public Sector") SAAS AND enterprise
 * +Job title:("Sales" OR "Business Development")
 * +Job title time scope:Current or past
 * +Location:(Riyadh, Saudi Arabia)
 */

import type { SearchFilters } from './searchService';

export interface ParsedBooleanQuery {
  keywords: string[];
  jobTitles: string[];
  jobOccupations: string[];
  companies: string[];
  locations: string[];
  timeScope?: 'current' | 'past' | 'both';
  companyTimeScope?: 'current' | 'past' | 'both';
  operators: {
    keywordOperators: string[];
    jobTitleOperators: string[];
    jobOccupationOperators: string[];
    companyOperators: string[];
    locationOperators: string[];
  };
  rawQuery: string;
}

export class BooleanSearchParser {
  /**
   * Parse advanced boolean search query
   */
  static parseQuery(query: string): ParsedBooleanQuery {
    const result: ParsedBooleanQuery = {
      keywords: [],
      jobTitles: [],
      jobOccupations: [],
      companies: [],
      locations: [],
      timeScope: 'both',
      companyTimeScope: 'both',
      operators: {
        keywordOperators: [],
        jobTitleOperators: [],
        jobOccupationOperators: [],
        companyOperators: [],
        locationOperators: []
      },
      rawQuery: query
    };

    // Parse Keywords section
    const keywordsMatch = query.match(/\+Keywords:\s*\(([^)]+)\)([^+]*)/i);
    if (keywordsMatch) {
      const keywordsSection = keywordsMatch[1] + ' ' + (keywordsMatch[2] || '');
      result.keywords = this.extractTerms(keywordsSection);
      result.operators.keywordOperators = this.extractOperators(keywordsSection);
    }

    // Parse Job title section
    const jobTitleMatch = query.match(/\+Job title:\s*\(([^)]+)\)/i);
    if (jobTitleMatch) {
      const jobTitleSection = jobTitleMatch[1];
      result.jobTitles = this.extractTerms(jobTitleSection);
      result.operators.jobTitleOperators = this.extractOperators(jobTitleSection);
    }

    // Parse Job occupation section
    const jobOccupationMatch = query.match(/\+Job occupation:\s*\(([^)]+)\)/i);
    if (jobOccupationMatch) {
      const jobOccupationSection = jobOccupationMatch[1];
      result.jobOccupations = this.extractTerms(jobOccupationSection);
      result.operators.jobOccupationOperators = this.extractOperators(jobOccupationSection);
    }

    // Parse Company section
    const companyMatch = query.match(/\+Company:\s*\(([^)]+)\)/i);
    if (companyMatch) {
      const companySection = companyMatch[1];
      result.companies = this.extractTerms(companySection);
      result.operators.companyOperators = this.extractOperators(companySection);
    }

    // Parse Job title time scope
    const timeScopeMatch = query.match(/\+Job title time scope:\s*([^,+]+)/i);
    if (timeScopeMatch) {
      const timeScope = timeScopeMatch[1].trim().toLowerCase();
      if (timeScope.includes('current') && timeScope.includes('past')) {
        result.timeScope = 'both';
      } else if (timeScope.includes('current')) {
        result.timeScope = 'current';
      } else if (timeScope.includes('past')) {
        result.timeScope = 'past';
      }
    }

    // Parse Company time scope
    const companyTimeScopeMatch = query.match(/\+Company time scope:\s*([^,+]+)/i);
    if (companyTimeScopeMatch) {
      const companyTimeScope = companyTimeScopeMatch[1].trim().toLowerCase();
      if (companyTimeScope.includes('current') && companyTimeScope.includes('past')) {
        result.companyTimeScope = 'both';
      } else if (companyTimeScope.includes('current')) {
        result.companyTimeScope = 'current';
      } else if (companyTimeScope.includes('past')) {
        result.companyTimeScope = 'past';
      }
    }

    // Parse Location section
    const locationMatch = query.match(/\+Location:\s*\(([^)]+)\)/i);
    if (locationMatch) {
      const locationSection = locationMatch[1];
      result.locations = this.extractTerms(locationSection);
      result.operators.locationOperators = this.extractOperators(locationSection);
    }

    return result;
  }

  /**
   * Extract terms from a boolean expression section
   */
  private static extractTerms(section: string): string[] {
    const terms: string[] = [];
    
    // Handle quoted strings first
    const quotedMatches = section.match(/"([^"]+)"/g);
    if (quotedMatches) {
      quotedMatches.forEach(match => {
        terms.push(match.replace(/"/g, ''));
      });
    }

    // Remove quoted strings and extract individual words
    let cleanSection = section.replace(/"[^"]+"/g, '');
    
    // Split by boolean operators and clean up
    const words = cleanSection
      .split(/\s+(?:OR|AND|NOT)\s+|\s+/i)
      .map(word => word.trim())
      .filter(word => word && !['OR', 'AND', 'NOT', '(', ')'].includes(word.toUpperCase()));

    terms.push(...words);

    return [...new Set(terms)]; // Remove duplicates
  }

  /**
   * Extract boolean operators from a section
   */
  private static extractOperators(section: string): string[] {
    const operators = section.match(/\b(OR|AND|NOT)\b/gi) || [];
    return operators.map(op => op.toUpperCase());
  }

  /**
   * Convert parsed boolean query to SearchFilters format
   */
  static convertToSearchFilters(parsedQuery: ParsedBooleanQuery): SearchFilters {
    const filters: SearchFilters = {};

    // Add keywords
    if (parsedQuery.keywords.length > 0) {
      filters.skillsKeywords = {
        items: parsedQuery.keywords
      };
    }

    // Add job titles
    if (parsedQuery.jobTitles.length > 0) {
      filters.job = {
        titles: parsedQuery.jobTitles
      };
    }

    // Add job occupations (combine with job titles for search)
    if (parsedQuery.jobOccupations.length > 0) {
      if (filters.job) {
        filters.job.titles = [...(filters.job.titles || []), ...parsedQuery.jobOccupations];
      } else {
        filters.job = {
          titles: parsedQuery.jobOccupations
        };
      }
    }

    // Add companies
    if (parsedQuery.companies.length > 0) {
      filters.company = {
        names: parsedQuery.companies
      };
    }

    // Add locations
    if (parsedQuery.locations.length > 0) {
      filters.location = {
        currentLocations: parsedQuery.locations
      };
    }

    // Add time scope considerations (this might need backend support)
    if (parsedQuery.timeScope && parsedQuery.timeScope !== 'both') {
      // This could be added as a custom filter parameter
      filters.general = {
        ...filters.general,
        // Add custom field for time scope if backend supports it
      };
    }

    // Add company time scope considerations (this might need backend support)
    if (parsedQuery.companyTimeScope && parsedQuery.companyTimeScope !== 'both') {
      // This could be added as a custom filter parameter  
      filters.general = {
        ...filters.general,
        // Add custom field for company time scope if backend supports it
      };
    }

    return filters;
  }

  /**
   * Validate boolean search query syntax
   */
  static validateQuery(query: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for unmatched parentheses
    const openParens = (query.match(/\(/g) || []).length;
    const closeParens = (query.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push('Unmatched parentheses in query');
    }

    // Check for unmatched quotes
    const quotes = (query.match(/"/g) || []).length;
    if (quotes % 2 !== 0) {
      errors.push('Unmatched quotes in query');
    }

    // Check for valid field names
    const validFields = ['Keywords', 'Job title', 'Job occupation', 'Location', 'Job title time scope', 'Company', 'Company time scope'];
    const fieldPattern = /\+([^:]+):/g;
    let fieldMatch;
    while ((fieldMatch = fieldPattern.exec(query)) !== null) {
      const fieldName = fieldMatch[1].trim();
      if (!validFields.some(valid => fieldName.toLowerCase().includes(valid.toLowerCase()))) {
        errors.push(`Unknown field: ${fieldName}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get example queries for help/documentation
   */
  static getExampleQueries(): string[] {
    return [
      '+Keywords:(B2G OR Government OR "Public Sector") SAAS AND enterprise, +Job title:("Sales" OR "Business Development"), +Job title time scope:Current or past, +Location:(Riyadh, Saudi Arabia)',
      '+Keywords:(React OR Angular OR Vue) AND (TypeScript OR JavaScript), +Job title:("Frontend Developer" OR "UI Developer"), +Location:(Dublin, Ireland)',
      '+Keywords:(Python AND Django) OR (Node.js AND Express), +Job title:("Backend Developer" OR "Full Stack Developer"), +Job title time scope:Current',
      '+Keywords:(AWS OR Azure OR "Google Cloud") AND DevOps, +Job title:("DevOps Engineer" OR "Cloud Engineer"), +Location:(London, UK)',
      '+Keywords:Platform, +Company:("Integrant, Inc."), +Company time scope:Current or past, +Location:(Egypt)',
      '+Keywords:FinTech, +Job title:("UX Designer"), +Job occupation:((Product Designer) OR (User Experience Designer)), +Company:("Careem" OR "Jahez" OR "Deliveroo"), +Job title time scope:Current or past'
    ];
  }

  /**
   * Format query for display with syntax highlighting
   */
  static formatQueryForDisplay(query: string): string {
    return query
      .replace(/\+([^:]+):/g, '<span class="text-blue-600 font-semibold">+$1:</span>')
      .replace(/\b(OR|AND|NOT)\b/g, '<span class="text-purple-600 font-semibold">$1</span>')
      .replace(/"([^"]+)"/g, '<span class="text-green-600">"$1"</span>');
  }
}

export default BooleanSearchParser;