// Main sourcing module exports

// Search pages
export { default as Search } from './search/pages/Search';
export type { SearchRef } from './search/pages/Search';
export { default as SearchResults } from './search/pages/SearchResults';

// Search components
export { default as SearchResultsComponent } from './search/components/SearchResults';
export { default as NaturalLanguageSearch } from './search/components/NaturalLanguageSearch';
export { default as DataSourcesSearch } from './search/components/DataSourcesSearch';
export { default as BooleanSearchDialog } from './search/components/BooleanSearchDialog';

// Email pages
export { default as EmailSequencesPage } from './email/pages/EmailSequencesPage';

// Email components
export { default as EmailSequences } from './email/components/EmailSequences';

// Candidate outreach exports
export { 
  CandidateOutreachOverview, 
  CandidateOutreachProspects, 
  CandidateOutreachCampaigns, 
  CandidateOutreachTemplates, 
  CandidateOutreachAnalytics 
} from './outreach';
